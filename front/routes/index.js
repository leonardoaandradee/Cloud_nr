const express = require('express');
const router = express.Router();
const db = require('../../back/database/database-config');

/**
 * Rotas principais do sistema de pizzaria
 */

// Função para buscar contagens
async function getContagens() {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                (SELECT COUNT(*) FROM produtos) as totalProdutos,
                (SELECT COUNT(*) FROM clientes) as totalClientes,
                (SELECT COUNT(*) FROM pedidos) as totalPedidos
        `;
        db.get(query, [], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

// Rota principal - página inicial
router.get('/', async (req, res) => {
    try {
        const contagens = await getContagens();
        res.render('pages/index', { 
            title: 'Pizza Show',
            contagens: contagens 
        });
    } catch (error) {
        console.error('Erro ao buscar contagens:', error);
        res.render('pages/index', { 
            title: 'Pizza Show',
            contagens: { totalProdutos: 0, totalClientes: 0, totalPedidos: 0 } 
        });
    }
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

module.exports = router;
