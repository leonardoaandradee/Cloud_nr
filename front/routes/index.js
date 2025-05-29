const express = require('express');
const router = express.Router();

/**
 * Rotas principais do sistema de pizzaria
 */

// Redirecionar a rota principal para a página inicial ou login
router.get('/', (req, res) => {
  // Renderizar a página index (que verificará autenticação no lado do cliente)
  res.render('pages/index', { title: 'Pizza Show - Página Inicial' });
});

// Rota para a página de login
router.get('/login', (req, res) => {
  res.render('pages/login/login', { title: 'Login - Pizza Show' });
});

// Grupo de rotas para gerenciamento de produtos
router.get('/produtos', (req, res) => {
    res.render('pages/produtos/produtos', { 
        title: 'Produtos - Pizza Show',
        requireAuth: true
    });
});

// Grupo de rotas para gerenciamento de clientes
router.get('/clientes', (req, res) => {
    res.render('pages/clientes/clientes', { 
        title: 'Clientes - Pizza Show',
        requireAuth: true
    });
});

// Grupo de rotas para gerenciamento de pedidos
router.get('/pedidos', (req, res) => {
    res.render('pages/pedidos/pedidos', { 
        title: 'Pedidos - Pizza Show',
        requireAuth: true
    });
});

module.exports = router;
