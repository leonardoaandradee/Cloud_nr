const express = require('express');
const router = express.Router();
const HistoricoPedidosModel = require('../models/historico-models');

// GET - Lista todo o histórico de pedidos
router.get('/', async (req, res) => {
    try {
        const historico = await HistoricoPedidosModel.buscarTodosPedidos();
        res.json({
            sucesso: true,
            dados: historico
        });
    } catch (error) {
        console.error('Erro ao buscar histórico:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao buscar histórico',
            erro: error.message
        });
    }
});

// GET - Busca histórico de um cliente específico
router.get('/:clienteId', async (req, res) => {
    try {
        const historico = await HistoricoPedidosModel.buscarUltimosPedidos(req.params.clienteId);
        res.json({
            sucesso: true,
            dados: historico
        });
    } catch (error) {
        console.error('Erro ao buscar histórico do cliente:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao buscar histórico do cliente',
            erro: error.message
        });
    }
});

module.exports = router;
