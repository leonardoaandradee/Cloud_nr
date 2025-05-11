var express = require('express');
var router = express.Router();

const apiUrl = 'http://localhost:4000'; // URL do backend

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Pizza Show' });
});

router.get('/produtos', function(req, res, next) {
  res.render('produtos/produtos', { 
    title: 'Produtos - Pizza Show',
    apiUrl: apiUrl
  });
});

router.get('/clientes', function(req, res, next) {
  res.render('clientes/clientes', { 
    title: 'Clientes - Pizza Show',
    apiUrl: apiUrl
  });
});

router.get('/pedidos', function(req, res, next) {
  res.render('pedidos/pedidos', { 
    title: 'Pedidos - Pizza Show',
    apiUrl: apiUrl
  });
});

module.exports = router;
