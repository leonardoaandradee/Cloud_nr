var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3');
var path = require('path'); 

// Database connection
//
const dbPath = path.join(__dirname, '../database/database.db'); 
const ordersDB = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Pizzas: Error connecting to database', err.message);
    } else {
        console.log('Pizzas: Database connection established successfully.');
    }
});

/* GET pizzas listing. */
// Here you can handle pizzas
//
router.get('/', function(req, res, next) {
    console.log('You are in pizza.js file');
    res.send('<h2>Pizza Show: You are in PIZZAS.JS file</h2>');
});

module.exports = router;
