const express = require('express');
const router = express.Router();
const clientesModel = require('../models/clientes-model.js');

/**
 * @swagger
 * tags:
 *   - name: Clientes
 *     description: Rotas para gerenciamento de clientes
 * 
 * components:
 *   schemas:
 *     Cliente:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único do cliente
 *           example: 123
 *         nome:
 *           type: string
 *           example: João Silva
 *         email:
 *           type: string
 *           example: joao@email.com
 *         telefone:
 *           type: string
 *           example: '81999999999'
 *         CEP:
 *           type: string
 *           example: '52000000'
 *         rua:
 *           type: string
 *           example: Rua das Flores
 *         bairro:
 *           type: string
 *           example: Boa Viagem
 *         cidade:
 *           type: string
 *           example: Recife
 *         estado:
 *           type: string
 *           example: PE
 *         complemento:
 *           type: string
 *           example: Apartamento 101
 *       required:
 *         - nome
 *         - telefone
 * 
 *   parameters:
 *     clienteId:
 *       in: path
 *       name: id
 *       schema:
 *         type: integer
 *       required: true
 *       description: ID do cliente
 */

/**
 * @swagger
 * /clientes:
 *   get:
 *     tags: [Clientes]
 *     summary: Lista todos os clientes
 *     description: Retorna uma lista com todos os clientes cadastrados no sistema.
 *     responses:
 *       200:
 *         description: Lista de clientes retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cliente'
 */
router.get('/', (req, res) => {
    try {
        clientesModel.getClientes(res);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar clientes', detalhes: error.message });
    }
});

/**
 * @swagger
 * /clientes/{id}:
 *   get:
 *     tags: [Clientes]
 *     summary: Busca cliente por ID específico
 *     parameters:
 *       - $ref: '#/components/parameters/clienteId'
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 *       404:
 *         description: Cliente não encontrado
 */
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

/**
 * @swagger
 * /clientes/buscar:
 *   get:
 *     tags: [Clientes]
 *     summary: Busca cliente por telefone
 *     parameters:
 *       - in: query
 *         name: telefone
 *         schema:
 *           type: string
 *         required: true
 *         description: Telefone do cliente
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 *       400:
 *         description: Telefone não fornecido
 */
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

/**
 * @swagger
 * /clientes/{id}/historico:
 *   get:
 *     tags: [Clientes]
 *     summary: Busca histórico de pedidos do cliente
 *     parameters:
 *       - $ref: '#/components/parameters/clienteId'
 *     responses:
 *       200:
 *         description: Histórico encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso:
 *                   type: boolean
 *                   example: true
 *                 cliente_nome:
 *                   type: string
 *                   example: João Silva
 *                 historico:
 *                   type: array
 *                   description: Lista de pedidos
 *                   items:
 *                     type: object
 *       404:
 *         description: Cliente não encontrado
 */
router.get('/:id/historico', async (req, res) => {
    try {
        const clienteId = req.params.id;
        const db = require('../database/database-config');
        const HistoricoPedidosModel = require('../models/historico-models');
        
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

/**
 * @swagger
 * /clientes:
 *   post:
 *     tags: [Clientes]
 *     summary: Cria um novo cliente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Cliente'
 *     responses:
 *       201:
 *         description: Cliente criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 *       500:
 *         description: Erro ao criar cliente
 */
router.post('/', (req, res) => {
    try {
        const { nome, email, telefone, CEP, rua, bairro, cidade, estado, complemento } = req.body;
        const newCliente = { nome, email, telefone, CEP, rua, bairro, cidade, estado, complemento };
        clientesModel.createCliente(newCliente, res);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao criar cliente', detalhes: error.message });
    }
});

/**
 * @swagger
 * /clientes/{id}:
 *   put:
 *     tags: [Clientes]
 *     summary: Atualiza cliente por ID
 *     parameters:
 *       - $ref: '#/components/parameters/clienteId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Cliente'
 *     responses:
 *       200:
 *         description: Cliente atualizado com sucesso
 *       500:
 *         description: Erro ao atualizar cliente
 */
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

/**
 * @swagger
 * /clientes/{id}:
 *   delete:
 *     tags: [Clientes]
 *     summary: Exclui cliente por ID
 *     parameters:
 *       - $ref: '#/components/parameters/clienteId'
 *     responses:
 *       200:
 *         description: Cliente excluído com sucesso
 *       500:
 *         description: Erro ao excluir cliente
 */
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
