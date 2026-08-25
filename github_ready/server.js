const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const AWS = require('aws-sdk');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database connection (Amazon RDS)
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.message);
  } else {
    console.log('Connected to Amazon RDS MySQL');
  }
});

// S3 setup (photos go only to S3)
const s3 = new AWS.S3({ region: process.env.AWS_REGION || 'eu-north-1' });
const upload = multer({ storage: multer.memoryStorage() });

// ========== ROUTES ==========

// Home / health check
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get all posts
app.get('/api/posts', (req, res) => {
  db.query('SELECT * FROM posts ORDER BY created_at DESC', (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch posts' });
    }
    res.json(results);
  });
});

// Create a new post (with optional photo upload to S3)
app.post('/api/posts', upload.single('photo'), async (req, res) => {
  try {
    let imageUrl = null;

    // Upload photo to S3 if provided
    if (req.file) {
      const params = {
        Bucket: process.env.S3_BUCKET,
        Key: `uploads/${Date.now()}-${req.file.originalname}`,
        Body: req.file.buffer,
        ContentType: req.file.mimetype
      };
      const data = await s3.upload(params).promise();
      imageUrl = data.Location;
    }

    const { type, title, description, location } = req.body;

    if (!type || !title) {
      return res.status(400).json({ error: 'Type and title are required' });
    }

    db.query(
      'INSERT INTO posts (type, title, description, location, image_url) VALUES (?, ?, ?, ?, ?)',
      [type, title, description || '', location || '', imageUrl],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to create post' });
        }
        res.status(201).json({
          message: 'Post created successfully',
          id: result.insertId,
          image_url: imageUrl
        });
      }
    );
  } catch (error) {
    console.error('S3 upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Campus Lost & Found Board running on port ${PORT}`);
});
