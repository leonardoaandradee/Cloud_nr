const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index', { title: 'Pizza Show' });
});

router.get('/produtos', (req, res) => {
    res.render('produtos/produtos', { title: 'Produtos - Pizza Show' });
});

router.get('/clientes', (req, res) => {
    res.render('clientes/clientes', { title: 'Clientes - Pizza Show' });
});

router.get('/pedidos', (req, res) => {
    res.render('pedidos/pedidos', { title: 'Pedidos - Pizza Show' });
});

module.exports = router;
