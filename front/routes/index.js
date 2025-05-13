const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('pages/index', { title: 'Pizza Show' });
});

router.get('/produtos', (req, res) => {
    res.render('pages/produtos/produtos', { title: 'Produtos - Pizza Show' });
});

router.get('/clientes', (req, res) => {
    res.render('pages/clientes/clientes', { title: 'Clientes - Pizza Show' });
});

router.get('/pedidos', (req, res) => {
    res.render('pages/pedidos/pedidos', { title: 'Pedidos - Pizza Show' });
});

module.exports = router;
