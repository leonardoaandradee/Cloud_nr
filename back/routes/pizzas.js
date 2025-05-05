var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3');
var path = require('path'); 

// Database connection:
//
const dbPath = path.join(__dirname, '../database/pizzasDataBase.db'); 
const pizzasDB = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Pizzas: Error connecting to database', err.message);
    } else {
        console.log('Pizzas: Database connection established successfully.');
    }
});

// Create table in PizzasDataBase.db if it doesn't exist:
//
pizzasDB.run(`CREATE TABLE IF NOT EXISTS pizzas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    flavor TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    size TEXT NOT NULL,
    price REAL NOT NULL    
)`,(err) => {
    if (err) {
        console.error('Pizzas: Error creating table in pizzasDataBase.db', err.message);
    } else {
        console.log('Pizzas: Table PIZZAS created successfully.');
    }
});

/* GET pizzas listing. */
// Here you can handle pizzas
//
router.get('/', function(req, res, next) {
    console.log('You are in pizza.js file.');
    res.send('<h2>Pizza Show: You are in PIZZAS.JS file</h2>');
});

module.exports = router;
