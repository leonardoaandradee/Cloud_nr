var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3');
var path = require('path'); 

// Database connection
//
const dbPath = path.join(__dirname, '../database/ordersDataBase.db'); 
const ordersDB = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Orders: Error connecting to database', err.message);
    } else {
        console.log('Orders: Database connection established successfully.');
    }
});

// Create table in ordersDataBase.db if it doesn't exist:
//
ordersDB.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    pizza_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    total_price REAL NOT NULL,
    delivery_address TEXT NOT NULL,
    order_date TEXT NOT NULL,
    status TEXT NOT NULL,
    FOREIGN KEY (client_id) REFERENCES clients(id)
)`,(err) => {
    if (err) {
        console.error('Orders: Error creating table in ordersDataBase.db', err.message);
    } else {
        console.log('Orders: Table ORDERS created successfully.');
    }
});

/* GET orders listing. */
// Here you can handle orders
//
router.get('/', function(req, res, next) {
    console.log('You are in order.js file.');
    res.send('<h2>Pizza Show: You are in ORDERS.JS file</h2>');
});

module.exports = router;
