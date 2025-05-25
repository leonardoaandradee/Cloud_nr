const express = require('express');
const axios = require('axios');
const router = express.Router();

/**
 * Rota para consulta de CEP
 * Utiliza a API ViaCEP
 */

// GET - Consulta CEP
router.get('/:cep', async (req, res) => {
    try {
        const cep = req.params.cep.replace(/\D/g, '');
        const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
        
        if (response.data.erro) {
            return res.status(404).json({ 
                erro: true, 
                mensagem: 'CEP não encontrado' 
            });
        }

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ 
            erro: true, 
            mensagem: 'Erro ao consultar CEP' 
        });
    }
});

module.exports = router;
