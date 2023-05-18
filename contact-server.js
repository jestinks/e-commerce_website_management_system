const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 3001;

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'shoe_vault'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to the MySQL database.');
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'contact.html'));
  });

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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
