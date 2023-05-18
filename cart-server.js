const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 3000;

// MySQL connection configuration
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'shoe_vault'
});

// Connect to MySQL
connection.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

// Middleware to parse request body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/men', (req, res) => {
  res.sendFile(path.join(__dirname, 'men.html'));
});

app.get('/women', (req, res) => {
  res.sendFile(path.join(__dirname, 'women.html'));
});
// Route to handle adding a product to the cart
app.post('/add-to-cart', (req, res) => {
  const { productID, cost, quantity } = req.body;

  // Insert the product details into the cart table
  const query = 'INSERT INTO cart (productID, cost, quantity) VALUES (?, ?, ?)';
  connection.query(query, [productID, cost, quantity], (err, result) => {
    if (err) {
      console.error('Error adding product to cart:', err);
      res.status(500).send('An error occurred');
    } else {
      console.log('Product added to cart');
      res.send('Product added to cart');
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
