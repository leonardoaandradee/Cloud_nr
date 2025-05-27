const express = require('express');
const router = express.Router();
const pedidosModel = require('../models/pedidos-model.js');

/**
 * @swagger
 * tags:
 *   name: Pedidos
 *   description: API para gerenciamento de pedidos
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ItemPedido:
 *       type: object
 *       properties:
 *         produto_id:
 *           type: integer
 *           example: 1
 *         quantidade:
 *           type: integer
 *           example: 2
 *         preco_unitario:
 *           type: number
 *           format: float
 *           example: 19.90
 *       required:
 *         - produto_id
 *         - quantidade
 *         - preco_unitario
 *     Pedido:
 *       type: object
 *       properties:
 *         clientes_id:
 *           type: integer
 *           example: 123
 *         itens:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ItemPedido'
 *         preco_total:
 *           type: number
 *           format: float
 *           example: 59.70
 *         endereco_entrega:
 *           type: string
 *           example: "Rua das Flores, 123, Apt 45"
 *         status:
 *           type: string
 *           example: "Em andamento"
 *       required:
 *         - clientes_id
 *         - itens
 *         - preco_total
 *         - endereco_entrega
 */

/**
 * @swagger
 * /pedidos:
 *   get:
 *     tags: [Pedidos]
 *     summary: Lista todos os pedidos
 *     responses:
 *       200:
 *         description: Lista de pedidos retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pedido'
 *       500:
 *         description: Erro interno ao buscar pedidos
 */
router.get('/', (req, res) => {
    try {
        pedidosModel.getPedidos(res);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar pedidos', detalhes: error.message });
    }
});

/**
 * @swagger
 * /pedidos:
 *   post:
 *     tags: [Pedidos]
 *     summary: Cria um novo pedido
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pedido'
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso
 *       500:
 *         description: Erro ao criar pedido
 */
router.post('/', (req, res) => {
    try {
        const { clientes_id, itens, preco_total, endereco_entrega } = req.body;
        const newPedido = { 
            clientes_id,
            itens, 
            preco_total, 
            endereco_entrega 
        };
        pedidosModel.createPedido(newPedido, res);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao criar pedido', detalhes: error.message });
    }
});

/**
 * @swagger
 * /pedidos/{id}:
 *   get:
 *     tags: [Pedidos]
 *     summary: Busca pedido específico por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *           example: 1
 *         required: true
 *         description: ID do pedido
 *     responses:
 *       200:
 *         description: Pedido encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pedido'
 *       404:
 *         description: Pedido não encontrado
 *       500:
 *         description: Erro interno ao buscar pedido
 */
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

/**
 * @swagger
 * /pedidos/{id}:
 *   put:
 *     tags: [Pedidos]
 *     summary: Atualiza pedido por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *           example: 1
 *         required: true
 *         description: ID do pedido
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clientes_id:
 *                 type: integer
 *                 example: 123
 *               itens:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/ItemPedido'
 *               preco_total:
 *                 type: number
 *                 format: float
 *                 example: 59.70
 *               endereco_entrega:
 *                 type: string
 *                 example: "Rua das Flores, 123, Apt 45"
 *               status:
 *                 type: string
 *                 example: "Em andamento"
 *     responses:
 *       200:
 *         description: Pedido atualizado com sucesso
 *       500:
 *         description: Erro ao atualizar pedido
 */
router.put('/:id', (req, res) => {
    try {
        if (req.body.status && !req.body.itens) {
            // Se apenas o status está sendo atualizado
            pedidosModel.updateStatus(req.params.id, req.body.status, res);
        } else {
            // Atualização completa do pedido incluindo itens
            const { clientes_id, itens, preco_total, endereco_entrega, status } = req.body;
            const pedidoAtualizado = { 
                clientes_id,
                itens,
                preco_total, 
                endereco_entrega, 
                status 
            };
            pedidosModel.updatePedido(req.params.id, pedidoAtualizado, res);
        }
    } catch (error) {
        res.status(500).json({ 
            erro: 'Erro ao atualizar pedido', 
            detalhes: error.message 
        });
    }
});

/**
 * @swagger
 * /pedidos/{id}:
 *   delete:
 *     tags: [Pedidos]
 *     summary: Exclui pedido por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *           example: 1
 *         required: true
 *         description: ID do pedido
 *     responses:
 *       200:
 *         description: Pedido excluído com sucesso
 *       500:
 *         description: Erro ao excluir pedido
 */
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

/**
 * @swagger
 * /pedidos/historico:
 *   get:
 *     tags: [Pedidos]
 *     summary: Lista histórico de todos os pedidos
 *     responses:
 *       200:
 *         description: Histórico de pedidos retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso:
 *                   type: boolean
 *                   example: true
 *                 dados:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Pedido'
 *       500:
 *         description: Erro ao buscar histórico de pedidos
 */
router.get('/historico', async (req, res) => {
    try {
        const HistoricoPedidosModel = require('../models/historico-models.js');
        const historico = await HistoricoPedidosModel.buscarTodosPedidos();
        res.json({
            sucesso: true,
            dados: historico
        });
    } catch (error) {
        res.status(500).json({ 
            sucesso: false,
            erro: 'Erro ao buscar histórico', 
            detalhes: error.message 
        });
    }
});

module.exports = router;
