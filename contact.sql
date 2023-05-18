CREATE DATABASE IF NOT EXISTS shoe_vault;

USE shoe_vault;

CREATE TABLE contact_forms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL
);
