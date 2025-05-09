var express = require('express');
var router = express.Router();
var pizzaModel = require('../models/pizza-model');



// READ - List all pizzas
router.get('/', (req, res) => {
    pizzaModel.getPizzas(res);
});

// CREATE - Add a new pizza
router.post('/', (req, res) => {
    console.log('Request body:', req.body);
    const { flavor, description, category, size, price } = req.body;
    const newPizza = { flavor, description, category, size, price };
    pizzaModel.createPizza(newPizza, res);
});

// READ - Get pizza by ID
router.get('/:id', (req, res) => {
    pizzasDB.get("SELECT * FROM pizzas WHERE id = ?", [req.params.id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (!row) {
            res.status(404).json({ message: 'Ops! Pizza not found' });
        } else {
            res.json(row);
        }
    });
});

// UPDATE - Update pizza by ID
router.put('/:id', (req, res) => {
    const { flavor, description, category, size, price } = req.body;
    pizzasDB.run(
        `UPDATE pizzas SET flavor = ?, description = ?, category = ?, size = ?, price = ? WHERE id = ?`,
        [flavor, description, category, size, price, req.params.id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else if (this.changes === 0) {
                res.status(404).json({ message: 'Ops! Pizza not found for update' });
            } else {
                res.json({ message: 'Pizza successfully updated' });
            }
        }
    );
});

// DELETE - Delete pizza by ID
router.delete('/:id', (req, res) => {
    pizzasDB.run(`DELETE FROM pizzas WHERE id = ?`, [req.params.id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (this.changes === 0) {
            res.status(404).json({ message: 'Ops! Pizza not found for deletion' });
        } else {
            res.json({ message: 'Pizza successfully deleted' });
        }
    });
});

module.exports = router;