const express = require('express');
const router = express.Router();
const clientesModel = require('../models/clientes-model.js');

router.get('/', (req, res) => {
    try {
        clientesModel.getClientes(res);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar clientes', detalhes: error.message });
    }
});

router.post('/', (req, res) => {
    try {
        const { nome, email, telefone, whatsapp } = req.body;
        const newCliente = { nome, email, telefone, whatsapp };
        clientesModel.createCliente(newCliente, res);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao criar cliente', detalhes: error.message });
    }
});

router.get('/:id', (req, res) => {
    try {
        clientesModel.getClienteById(req.params.id, res);
    } catch (error) {
        res.status(500).json({ 
            erro: 'Erro ao buscar cliente', 
            detalhes: error.message 
        });
    }
});

router.put('/:id', (req, res) => {
    try {
        const { nome, email, telefone, whatsapp } = req.body;
        const clienteAtualizado = { nome, email, telefone, whatsapp };
        clientesModel.updateCliente(req.params.id, clienteAtualizado, res);
    } catch (error) {
        res.status(500).json({ 
            erro: 'Erro ao atualizar cliente', 
            detalhes: error.message 
        });
    }
});

router.delete('/:id', (req, res) => {
    try {
        clientesModel.deleteCliente(req.params.id, res);
    } catch (error) {
        res.status(500).json({ 
            erro: 'Erro ao excluir cliente', 
            detalhes: error.message 
        });
    }
});

module.exports = router;
