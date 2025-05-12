const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: ' API Backend ativo ' });
});

module.exports = router;
