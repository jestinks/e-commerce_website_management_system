CREATE DATABASE IF NOT EXISTS shoe_vault;

USE shoe_vault;

CREATE TABLE cart (
  id INT AUTO_INCREMENT PRIMARY KEY,
  productID VARCHAR(50) NOT NULL,
  cost DECIMAL(10, 2),
  quantity INT
);
