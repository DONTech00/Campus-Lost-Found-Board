-- Campus Lost and Found Board - Database Schema
-- Run this on your Amazon RDS MySQL instance

CREATE DATABASE IF NOT EXISTS campus_lostfound;
USE campus_lostfound;

CREATE TABLE IF NOT EXISTS posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('LOST', 'FOUND') NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  location VARCHAR(150),
  image_url VARCHAR(500),
  status ENUM('OPEN', 'CLAIMED', 'RESOLVED') DEFAULT 'OPEN',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optional: sample data for testing
-- INSERT INTO posts (type, title, description, location) VALUES
-- ('FOUND', 'Black Wallet', 'Found near the library entrance', 'Main Library'),
-- ('LOST', 'Student ID Card', 'Lost between cafeteria and lecture hall', 'Campus Center');
