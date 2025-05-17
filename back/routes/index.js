const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: ' Pizza Show || API Backend ativo ' });
});

module.exports = router;
