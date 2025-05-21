const express = require('express');
const router = express.Router();

/**
 * Rotas principais do sistema de pizzaria
 */

// Rota principal - página inicial
router.get('/', (req, res) => {
    res.render('pages/index', { 
        title: 'Pizza Show' 
    });
});

// Grupo de rotas para gerenciamento de produtos
router.get('/produtos', (req, res) => {
    res.render('pages/produtos/produtos', { 
        title: 'Produtos - Pizza Show' 
    });
});

// Grupo de rotas para gerenciamento de clientes
router.get('/clientes', (req, res) => {
    res.render('pages/clientes/clientes', { 
        title: 'Clientes - Pizza Show' 
    });
});

// Grupo de rotas para gerenciamento de pedidos
router.get('/pedidos', (req, res) => {
    res.render('pages/pedidos/pedidos', { 
        title: 'Pedidos - Pizza Show' 
    });
});

// Rota para página de login
router.get('/login', (req, res) => {
    res.render('pages/login/login');
});

module.exports = router;
