var express = require('express');
var router = express.Router();
var produtosModel = require('../models/produtos-model');


// GET - Listar todos os produtos
//
router.get('/', (req, res) => {
    produtosModel.getProdutos(res);
});

// POST - Criar um novo produto
//
router.post('/', (req, res) => {
    console.log('Request body:', req.body);
    const { sabor, descricao, categoria, tamanho, preco } = req.body;
    const newProduto = { sabor, descricao, categoria, tamanho, preco };
    produtosModel.createProdutos(newProduto, res);
});

// GET by ID - Listar produto por ID
//
router.get('/:id', (req, res) => {
    produtosDB.get("SELECT * FROM produtos WHERE id = ?", [req.params.id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (!row) {
            res.status(404).json({ message: 'Desculpe! Produtos não encontrado.' });
        } else {
            res.json(row);
        }
    });
});

// PUT by ID - Atualizar produto por ID
//
router.put('/:id', (req, res) => {
    const { sabor, descricao, categoria, tamanho, preco } = req.body;
    pizzasDB.run(
        `UPDATE produtos SET sabor = ?, descricao = ?, categoria = ?, tamanho = ?, preco = ? WHERE id = ?`,
        [sabor, descricao, categoria, tamanho, preco, req.params.id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else if (this.changes === 0) {
                res.status(404).json({ message: 'Desculpe! Produto não encontrado para atualização.' });
            } else {
                res.json({ message: 'Produto atualizado com sucesso.' });
            }
        }
    );
});

// DELTE - Deletar produto por ID
//
router.delete('/:id', (req, res) => {
    produtosDB.run(`DELETE FROM produtos WHERE id = ?`, [req.params.id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (this.changes === 0) {
            res.status(404).json({ message: 'Desculpe! Produto não encontrado para deletar.' });
        } else {
            res.json({ message: 'Pizza successfully deleted' });
        }
    });
});

module.exports = router;