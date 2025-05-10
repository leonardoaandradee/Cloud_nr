// Importação do framework Express
const express = require('express');
const router = express.Router();

/**
 * Rota principal de clientes
 * @route GET /clientes
 * @returns {string} Mensagem HTML confirmando acesso à rota
 */
router.get('/', (req, res, next) => {
    try {
        console.log('Acessando rota principal de clientes');
        res.status(200).send('<h2>Pizza Show: Você está no arquivo CLIENTES.JS</h2>');
    } catch (error) {
        console.error('Erro ao acessar rota de clientes:', error);
        next(error);
    }
});

// Exportação do módulo router
module.exports = router;
