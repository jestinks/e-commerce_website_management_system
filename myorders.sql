CREATE DATABASE IF NOT EXISTS shoe_vault;

USE shoe_vault;

CREATE TABLE myorders (
    placeorder_id VARCHAR(255) PRIMARY KEY,
    total_amount DECIMAL(10, 2),
    total_quantity INT
);

