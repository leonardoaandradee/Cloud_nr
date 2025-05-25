const express = require('express');
const router = express.Router();

const USERNAME = 'admin';
const PASSWORD = '123456';


router.get('/', (req, res) => {
  res.render('login');
});


router.post('/', (req, res) => {
  const { username, password } = req.body;

  if (username === USERNAME && password === PASSWORD) {
    req.session.userId = 1; // indica que está logado
    req.session.username = username;
    return res.json({ message: 'Login OK' });
  }

  // Mensagem de erro amigável
  res.status(401).json({ message: 'Usuário ou senha inválidos' });
});

module.exports = router;
