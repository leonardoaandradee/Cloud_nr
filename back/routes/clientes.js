const express = require('express');
const router = express.Router();
const clientesModel = require('../models/clientes-model.js');

/**
 * Rotas para gerenciamento de clientes
 */

// Busca todos os clientes
router.get('/', (req, res) => {
    try {
        clientesModel.getClientes(res);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar clientes', detalhes: error.message });
    }
});

// Busca cliente por ID específico
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

// Busca cliente por telefone
router.get('/buscar', (req, res) => {
    try {
        const telefone = req.query.telefone;
        if (!telefone) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Telefone não fornecido'
            });
        }
        clientesModel.getClienteByTelefone(telefone, res);
    } catch (error) {
        res.status(500).json({ 
            erro: 'Erro ao buscar cliente por telefone', 
            detalhes: error.message 
        });
    }
});

// Busca histórico de pedidos do cliente
router.get('/:id/historico', async (req, res) => {
    try {
        const clienteId = req.params.id;
        const db = require('../database/database-config');
        const HistoricoPedidosModel = require('../models/historico-models');
        
        // Primeiro buscar os dados do cliente
        const cliente = await new Promise((resolve, reject) => {
            db.get('SELECT nome FROM clientes WHERE id = ?', [clienteId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!cliente) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Cliente não encontrado'
            });
        }

        // Buscar histórico de pedidos
        const historico = await HistoricoPedidosModel.buscarUltimosPedidos(clienteId);

        res.json({
            sucesso: true,
            cliente_nome: cliente.nome,
            historico: historico
        });
    } catch (error) {
        console.error('Erro ao buscar histórico:', error);
        res.status(500).json({ 
            sucesso: false,
            erro: 'Erro ao buscar histórico', 
            detalhes: error.message 
        });
    }
});

// Cria um novo cliente
router.post('/', (req, res) => {
    try {
        const { nome, email, telefone, CEP, rua, bairro, cidade, estado, complemento } = req.body;
        const newCliente = { nome, email, telefone, CEP, rua, bairro, cidade, estado, complemento };
        clientesModel.createCliente(newCliente, res);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao criar cliente', detalhes: error.message });
    }
});

// Atualiza cliente por ID
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

// Exclui cliente por ID
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
