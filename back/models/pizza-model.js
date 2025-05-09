var pizzasDB = require('../database/database-config');

// READ - List all pizzas

function getPizzas(res) {
    pizzasDB.all("SELECT * FROM pizzas", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
}


function createPizza(pizza, res) {

    pizzasDB.run(`INSERT INTO pizzas (flavor, description, category, size, price) VALUES (?, ?, ?, ?, ?)`,
        [pizza.flavor, pizza.description, pizza.category, pizza.size, pizza.price],
        function (err) {
            if (err) {
                throw (err);
            } else {
                res.send(pizza);
            }
        }
    );

}

module.exports = {
    getPizzas,
    createPizza,
    // Other CRUD operations can be added here
};