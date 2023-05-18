const express = require('express');
const mysql = require('mysql');
const { v4: uuidv4 } = require('uuid');
const port = 3002;
const app = express();
const path = require('path');

app.use(express.json());
app.use(express.static('public'));

// Create a connection to the MySQL database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'shoe_vault',
});

// Connect to the database
connection.connect((error) => {
  if (error) {
    console.error('Error connecting to the database: ', error);
    return;
  }
  console.log('Connected to the database');
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'cart.html'));
  });

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

// API endpoint to remove items from the cart
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
  

// API endpoint to place an order
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
