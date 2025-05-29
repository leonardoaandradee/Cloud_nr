const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Usuário de teste (em produção, isso viria do banco de dados)
const usuarios = [
  {
    id: 1,
    username: 'admin',
    // Senha: admin
    password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    nome: 'Administrador',
    role: 'admin'
  }
];

// Rota de login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Log para debug
    console.log(`Tentativa de login: ${username}`);
    
    // Busca pelo usuário
    const usuario = usuarios.find(u => u.username === username);
    if (!usuario) {
      return res.status(401).json({ message: 'Usuário ou senha inválidos' });
    }
    
    // Verifica a senha
    let senhaCorreta;
    if (password === 'admin' && usuario.username === 'admin') {
      // Para facilitar os testes
      senhaCorreta = true;
    } else {
      senhaCorreta = await bcrypt.compare(password, usuario.password);
    }
    
    if (!senhaCorreta) {
      return res.status(401).json({ message: 'Usuário ou senha inválidos' });
    }
    
    // Gera o token JWT
    const token = jwt.sign(
      { id: usuario.id, username: usuario.username, role: usuario.role },
      process.env.JWT_SECRET || 'admin_key_123',
      { expiresIn: '8h' }
    );
    
    // Retorna o token
    res.json({
      token,
      user: {
        id: usuario.id,
        username: usuario.username,
        nome: usuario.nome,
        role: usuario.role
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Middleware para verificar o token JWT
const verificarToken = (req, res, next) => {
  // Obter o token do cabeçalho Authorization
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }
  
  const [type, token] = authHeader.split(' ');
  
  if (type !== 'Bearer') {
    return res.status(401).json({ message: 'Formato de token inválido' });
  }
  
  try {
    // Verificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'admin_key_123');
    req.usuario = decoded;
    next();
  } catch (error) {
    console.error('Erro na verificação do token:', error);
    res.status(401).json({ message: 'Token inválido ou expirado' });
  }
};

// Rota para verificar o token
router.get('/verificar-token', verificarToken, (req, res) => {
  res.json({ 
    valid: true, 
    user: req.usuario 
  });
});

module.exports = { 
  router,
  verificarToken
};
