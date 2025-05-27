const express = require('express');
const router = express.Router();
const produtosModel = require('../models/produtos-model.js');

// Rotas para gerenciamento de produtos

router.get('/', (req, res) => {
    try {
        produtosModel.getProdutos(res);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar produtos', detalhes: error.message });
    }
});

router.post('/', (req, res) => {
    try {
        const { sabor, descricao, categoria, tamanho, preco } = req.body;
        const newProduto = { sabor, descricao, categoria, tamanho, preco };
        produtosModel.createProdutos(newProduto, res);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao criar produto', detalhes: error.message });
    }
});

router.get('/:id', (req, res) => {
    try {
        produtosModel.getProdutoById(req.params.id, res);
    } catch (error) {
        res.status(500).json({ 
            erro: 'Erro ao buscar produto', 
            detalhes: error.message 
        });
    }
});

router.put('/:id', (req, res) => {
    try {
        const { sabor, descricao, categoria, tamanho, preco } = req.body;
        const produtoAtualizado = { sabor, descricao, categoria, tamanho, preco };
        produtosModel.updateProduto(req.params.id, produtoAtualizado, res);
    } catch (error) {
        res.status(500).json({ 
            erro: 'Erro ao atualizar produto', 
            detalhes: error.message 
        });
    }
});

router.delete('/:id', (req, res) => {
    try {
        produtosModel.deleteProdutos(req.params.id, res);
    } catch (error) {
        res.status(500).json({ 
            erro: 'Erro ao excluir produto', 
            detalhes: error.message 
        });
    }
});

module.exports = router;
