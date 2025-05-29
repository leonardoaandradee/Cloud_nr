const express = require('express');
const router = express.Router();
const db = require('../database/database-config');

// Rota para contagem de produtos
router.get('/produtos', (req, res) => {
    db.get('SELECT COUNT(*) as total FROM produtos', (err, row) => {
        if (err) {
            console.error('Erro ao contar produtos:', err);
            return res.status(500).json({ 
                sucesso: false, 
                erro: 'Erro ao contar produtos' 
            });
        }
        res.json({ 
            sucesso: true, 
            total: row.total 
        });
    });
});

// Rota para contagem de clientes
router.get('/clientes', (req, res) => {
    db.get('SELECT COUNT(*) as total FROM clientes', (err, row) => {
        if (err) {
            console.error('Erro ao contar clientes:', err);
            return res.status(500).json({ 
                sucesso: false, 
                erro: 'Erro ao contar clientes' 
            });
        }
        res.json({ 
            sucesso: true, 
            total: row.total 
        });
    });
});

// Rota para contagem de pedidos
router.get('/pedidos', (req, res) => {
    db.get('SELECT COUNT(*) as total FROM pedidos', (err, row) => {
        if (err) {
            console.error('Erro ao contar pedidos:', err);
            return res.status(500).json({ 
                sucesso: false, 
                erro: 'Erro ao contar pedidos' 
            });
        }
        res.json({ 
            sucesso: true, 
            total: row.total 
        });
    });
});

module.exports = router;
