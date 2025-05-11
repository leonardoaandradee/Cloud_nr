const express = require('express');
const router = express.Router();
const axios = require('axios');

const API_URL = 'http://localhost:4000';

router.get('/', async (req, res) => {
    try {
        res.render('produtos/produtos', {
            title: 'Gerenciamento de Produtos',
            apiUrl: API_URL
        });
    } catch (error) {
        console.error('Erro ao carregar página de produtos:', error);
        res.status(500).render('error', { 
            message: 'Erro ao carregar produtos',
            error: error
        });
    }
});

module.exports = router;
