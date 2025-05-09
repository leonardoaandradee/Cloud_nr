var sqlite3 = require('sqlite3');

// DATABASE CONNECTION:
const db = new sqlite3.Database('../pizzariadatabase.db', (err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Connected to the database.');
    }
}
);

// CREATE TABLE IF NOT EXISTS:
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS pizzas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    flavor TEXT,
    description TEXT,
    category TEXT,
    size TEXT,
    price TEXT    
)`, (err) => {
        if (err) {
            console.error('Pizzas: Error creating table in pizzasDataBase.db', err.message);
        } else {
            console.log('Pizzas: Table PIZZAS created successfully.');
        }
    });

    // Create table in clientsDataBase.db if it doesn't exist:
    //
    db.run(`CREATE TABLE IF NOT EXISTS clients (
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

    // Create table in ordersDataBase.db if it doesn't exist:
//
db.run(`CREATE TABLE IF NOT EXISTS orders (
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

});



// Export the database connection
module.exports = db;