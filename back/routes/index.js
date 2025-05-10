const express = require('express');
const router = express.Router();
const path = require('path');

/**
 * Rota principal da aplicação
 * @route GET /
 * @returns {File} Retorna o arquivo index.html do frontend
 */
router.get('/', (req, res, next) => {
    try {
        console.log('Acessando página inicial');
        const indexPath = path.join(__dirname, '../../front/public/index.html');
        
        res.sendFile(indexPath, (err) => {
            if (err) {
                console.error('Erro ao carregar arquivo index.html:', err);
                next(err);
            }
        });
    } catch (error) {
        console.error('Erro ao processar requisição:', error);
        next(error);
    }
});

// Exportação do módulo router
module.exports = router;
