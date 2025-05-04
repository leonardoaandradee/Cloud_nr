var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3');
var path = require('path'); 

// Database connection
//
const dbPath = path.join(__dirname, '../database/database.db'); 
const ordersDB = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Orders: Error connecting to database', err.message);
    } else {
        console.log('Orders: Database connection established successfully.');
    }
});

/* GET pizzas listing. */
// Here you can handle orders
//
router.get('/', function(req, res, next) {
    console.log('Você está no arquivo orders.js');
    res.send('<h2>Pizza Show: You are in ORDERS.JS file</h2>');
});

module.exports = router;
