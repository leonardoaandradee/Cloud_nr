const express = require('express');
const router = express.Router();
const clientesModel = require('../models/clientes-model.js');

// GET
router.get('/', (req, res) => {
    try {
        clientesModel.getClientes(res);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar clientes', detalhes: error.message });
    }
});

// POST
router.post('/', (req, res) => {
    try {
        const { nome, email, telefone, CEP, rua, bairro, cidade, estado, complemento } = req.body;
        const newCliente = { nome, email, telefone, CEP, rua, bairro, cidade, estado, complemento };
        clientesModel.createCliente(newCliente, res);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao criar cliente', detalhes: error.message });
    }
});

// GET by ID
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

// PUT by ID
router.put('/:id', (req, res) => {
    try {
        const { nome, email, telefone, CEP, rua, bairro, cidade, estado, complemento } = req.body;
        const clienteAtualizado = { nome, email, telefone, CEP, rua, bairro, cidade, estado, complemento };
        clientesModel.updateCliente(req.params.id, clienteAtualizado, res);
    } catch (error) {
        res.status(500).json({ 
            erro: 'Erro ao atualizar cliente', 
            detalhes: error.message 
        });
    }
});

// DELETE
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

// Exportação do módulo router
module.exports = router;
