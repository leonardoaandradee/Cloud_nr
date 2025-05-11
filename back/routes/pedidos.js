const express = require('express');
const router = express.Router();
const pedidosModel = require('../models/pedidos-model.js');

// GET - Lista todos os pedidos
router.get('/', (req, res) => {
    try {
        pedidosModel.getPedidos(res);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar pedidos', detalhes: error.message });
    }
});

// POST - Cria novo pedido
router.post('/', (req, res) => {
    try {
        const { clientes_id, produtos_id, quantidade, preco_total, endereco_entrega } = req.body;
        const newPedido = { 
            clientes_id, 
            produtos_id, 
            quantidade, 
            preco_total, 
            endereco_entrega 
        };
        pedidosModel.createPedido(newPedido, res);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao criar pedido', detalhes: error.message });
    }
});

// GET by ID - Busca pedido específico
router.get('/:id', (req, res) => {
    try {
        pedidosModel.getPedidoById(req.params.id, res);
    } catch (error) {
        res.status(500).json({ 
            erro: 'Erro ao buscar pedido', 
            detalhes: error.message 
        });
    }
});

// PUT - Atualiza pedido
router.put('/:id', (req, res) => {
    try {
        const { quantidade, preco_total, endereco_entrega, status } = req.body;
        const pedidoAtualizado = { 
            quantidade, 
            preco_total, 
            endereco_entrega, 
            status 
        };
        pedidosModel.updatePedido(req.params.id, pedidoAtualizado, res);
    } catch (error) {
        res.status(500).json({ 
            erro: 'Erro ao atualizar pedido', 
            detalhes: error.message 
        });
    }
});

// DELETE - Remove pedido
router.delete('/:id', (req, res) => {
    try {
        pedidosModel.deletePedido(req.params.id, res);
    } catch (error) {
        res.status(500).json({ 
            erro: 'Erro ao excluir pedido', 
            detalhes: error.message 
        });
    }
});

module.exports = router;
