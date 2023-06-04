const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
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

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'contact.html'));
  });

app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, 'cart.html'));
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

app.put('/updateQuantity/:itemId', (req, res) => {
    const itemId = req.params.itemId;
    const { quantity } = req.body;
  
    // Update the quantity in the database
    const updateQuery = 'UPDATE cart SET quantity = ? WHERE id = ?';
    connection.query(updateQuery, [quantity, itemId], (error, results) => {
      if (error) {
        console.error('Error updating quantity: ', error);
        res.status(500).json({ error: 'Failed to update quantity' });
      } else {
        if (results.affectedRows > 0) {
          res.json({ message: 'Quantity updated successfully' });
        } else {
          res.status(404).json({ error: 'Item not found' });
        }
      }
    });
  });
    

// Route to handle submitting contact form
app.post('/submit', (req, res) => {
  const { name, email, message } = req.body;

  const query = 'INSERT INTO contact_forms (name, email, message) VALUES (?, ?, ?)';
  connection.query(query, [name, email, message], (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.sendStatus(500);
    } else {
      console.log('Data inserted successfully.');
      res.sendStatus(200);
    }
  });
});

// Route to handle adding a product to the cart
app.post('/add-to-cart', (req, res) => {
  const { productID, cost, quantity } = req.body;
  const cartItem = { productID, cost, quantity };

  const query = `SELECT * FROM cart WHERE productID = '${productID}'`;
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error querying the database: ', error);
      res.status(500).send('Error adding product to cart');
      return;
    }

    if (results.length === 0) {
      // Product doesn't exist in the cart, so insert a new row
      const insertQuery = `INSERT INTO cart (productID, cost, quantity) VALUES ('${productID}', ${cost}, ${quantity})`;
      connection.query(insertQuery, (error, results) => {
        if (error) {
          console.error('Error inserting item into cart: ', error);
          res.status(500).send('Error adding product to cart');
          return;
        }
        console.log('Product added to cart:', cartItem);
        res.send('Product added to cart');
      });
    } else {
      const { id, quantity: existingQuantity, cost: existingCost } = results[0];
      const updatedQuantity = existingQuantity + quantity;
      const updatedCost = existingCost + cost;
      const updateQuery = `UPDATE cart SET quantity = ${updatedQuantity}, cost = ${updatedCost} WHERE id = ${id}`;
      connection.query(updateQuery, (error, results) => {
        if (error) {
          console.error('Error updating item in cart: ', error);
          res.status(500).send('Error adding product to cart');
          return;
        }
        console.log('Product quantity and cost updated in cart:', cartItem);
        res.send('Product added to cart');
      });
    }
  });
});

// Route to remove items from the cart
app.delete('/remove-item/:id', (req, res) => {
  const { id } = req.params;

  const deleteQuery = `DELETE FROM cart WHERE id = ${id}`;
  connection.query(deleteQuery, (error, results) => {
    if (error) {
      console.error('Error deleting item from cart: ', error);
      res.status(500).send('Error removing product from cart');
      return;
    }
    console.log(`Product with ID ${id} removed from cart`);
    res.json({ success: true });
  });
});

// Route to place an order
app.post('/place-order', (req, res) => {
  const { totalAmount, totalQuantity } = req.body;
  const placeOrderId = uuidv4();

  // Insert the order into the database
  const insertQuery = `INSERT INTO myorders (placeorder_id, total_amount, total_quantity) VALUES ('${placeOrderId}', ${totalAmount}, ${totalQuantity})`;
  connection.query(insertQuery, (error, results) => {
    if (error) {
      res.send('Order Placed');
      return;
    }

    console.log('Order placed:', {
      placeorder_id: placeOrderId,
      total_amount: totalAmount,
      total_quantity: totalQuantity,
    });

    const deleteQuery = 'DELETE FROM cart';
    connection.query(deleteQuery, (results, error) => {
      if (error) {
        res.send('Order placed and cart items removed');
        return;
      }
    });
  });
});

// Route to fetch cart items
app.get('/cart-items', (req, res) => {
  const query = 'SELECT * FROM cart';
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error querying the database: ', error);
      res.status(500).send('Error fetching cart items');
      return;
    }
    console.log('Cart items:', results);
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
