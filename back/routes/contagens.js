const express = require('express');
const router = express.Router();
const db = require('../database/database-config');

router.get('/', (req, res) => {
    const queries = {
        produtos: "SELECT COUNT(*) as total FROM produtos",
        clientes: "SELECT COUNT(*) as total FROM clientes",
        pedidos: "SELECT COUNT(*) as total FROM pedidos WHERE status != 'Cancelado'"
    };

    Promise.all([
        new Promise((resolve, reject) => {
            db.get(queries.produtos, [], (err, row) => {
                if (err) reject(err);
                else resolve(row ? row.total : 0);
            });
        }),
        new Promise((resolve, reject) => {
            db.get(queries.clientes, [], (err, row) => {
                if (err) reject(err);
                else resolve(row ? row.total : 0);
            });
        }),
        new Promise((resolve, reject) => {
            db.get(queries.pedidos, [], (err, row) => {
                if (err) reject(err);
                else resolve(row ? row.total : 0);
            });
        })
    ])
    .then(([totalProdutos, totalClientes, totalPedidos]) => {
        res.json({
            totalProdutos,
            totalClientes,
            totalPedidos
        });
    })
    .catch(err => {
        console.error('Erro ao buscar contagens:', err);
        res.status(500).json({ 
            erro: 'Erro ao buscar contagens',
            detalhes: err.message 
        });
    });
});

module.exports = router;
