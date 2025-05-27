const express = require('express');
const router = express.Router();
const produtosModel = require('../models/produtos-model.js');

/**
 * Rotas para gerenciamento de produtos
 */

/**
 * @swagger
 * /produtos:
 *   get:
 *     summary: Lista todos os produtos
 *     responses:
 *       200:
 *         description: Lista de produtos retornada com sucesso
 *       500:
 *         description: Erro ao buscar produtos
 */
router.get('/', (req, res) => {
    try {
        produtosModel.getProdutos(res);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar produtos', detalhes: error.message });
    }
});

/**
 * @swagger
 * /produtos:
 *   post:
 *     summary: Cria um novo produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sabor:
 *                 type: string
 *               descricao:
 *                 type: string
 *               categoria:
 *                 type: string
 *               tamanho:
 *                 type: string
 *               preco:
 *                 type: number
 *     responses:
 *       201:
 *         description: Produto criado com sucesso
 *       500:
 *         description: Erro ao criar produto
 */
router.post('/', (req, res) => {
    try {
        const { sabor, descricao, categoria, tamanho, preco } = req.body;
        const newProduto = { sabor, descricao, categoria, tamanho, preco };
        produtosModel.createProdutos(newProduto, res);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao criar produto', detalhes: error.message });
    }
});

/**
 * @swagger
 * /produtos/{id}:
 *   get:
 *     summary: Busca produto por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Produto encontrado com sucesso
 *       404:
 *         description: Produto não encontrado
 */
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

/**
 * @swagger
 * /produtos/{id}:
 *   put:
 *     summary: Atualiza produto por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do produto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sabor:
 *                 type: string
 *               descricao:
 *                 type: string
 *               categoria:
 *                 type: string
 *               tamanho:
 *                 type: string
 *               preco:
 *                 type: number
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso
 *       500:
 *         description: Erro ao atualizar produto
 */
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

/**
 * @swagger
 * /produtos/{id}:
 *   delete:
 *     summary: Exclui produto por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do produto
 *     responses:
 *       200:
 *         description: Produto excluído com sucesso
 *       500:
 *         description: Erro ao excluir produto
 */
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
