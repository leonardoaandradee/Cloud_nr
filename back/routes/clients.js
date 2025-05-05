var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3');
var path = require('path'); 

// Database connection
//
const dbPath = path.join(__dirname, '../database/clientsDataBase.db'); 
const clientsDB = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Clients: Error connecting to database', err.message);
    } else {
        console.log('Clients: Database connection established successfully.');
    }
});

// Create table in clientsDataBase.db if it doesn't exist:
//
clientsDB.run(`CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL
)`, (err) => { 
    if (err) {
        console.error('Clients: Error creating table in clientsDataBase.db', err.message);
    } else {
        console.log('Clients: Table CLIENTS created successfully.');
    }
});

/* GET clients listing. */
// Here you can handle clients
//
router.get('/', function(req, res, next) {
    console.log('You are in clients.js file.');
    res.send('<h2>Pizza Show: You are in CLIENTS.JS file</h2>');
});

module.exports = router;
