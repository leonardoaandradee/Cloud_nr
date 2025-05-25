const express = require('express');
const router = express.Router();

/**
 * Rota de boas-vindas
 * Utilizada para verificar se a API está ativa
 */

router.get('/', (req, res) => {
    res.json({ message: ' Pizza Show || API Backend ativo ' });
});

module.exports = router;
