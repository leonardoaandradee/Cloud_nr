// Importações principais
require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const { router: authRouter, verificarToken } = require('./routes/auth');
const URL_FRONT ='https://glowing-journey-jjqjvp5qwqvxfqjxj-3000.app.github.dev'   

// Inicialização do app
const app = express();

// Configuração do CORS
app.use(cors({
  origin: URL_FRONT,
  credentials: true,
}));

// Middlewares principais
app.use(logger('dev'));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/**
 * Só usei pra testar as requisições e exibir o tipo no consdole
 * Não é necessário para o funcionamento do sistema
 */
app.use((req, res, next) => {
    console.log('Teste de tipo de requisição:', {
        method: req.method,
        path: req.path,
        origin: req.headers.origin,
    });
    next();
});

// Middleware para proteger rotas que precisam de autenticação
function checkAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }

  // Se for requisição AJAX/API, retorna 401
  if (
    req.xhr ||
    (req.headers.accept && req.headers.accept.indexOf('json') > -1) ||
    (req.headers['sec-fetch-mode'] === 'cors')
  ) {
    return res.status(401).json({ message: 'Não autenticado' });
  }

  // Redirecionar para a página de login no FRONT (apenas para acesso direto pelo navegador)
  return res.redirect(`${CONFIG.URL_FRONT}/login`);
  
}

// Middleware para proteger rotas usando JWT
function checkAuthJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Token não fornecido' });

  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(401).json({ message: 'Token inválido' });
    req.user = user;
    next();
  });
}

// Importação das rotas
const indexRouter = require('./routes/index');
const produtosRouter = require('./routes/produtos');
const clientesRouter = require('./routes/clientes');
const ordensRouter = require('./routes/pedidos');
const viacepRouter = require('./routes/viacep');
const loginRouter = require('./routes/login');
const contagemRouter = require('./routes/contagem'); // Nova importação

// Rota de login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === '123456') {
    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '2h' });
    return res.json({ token });
  }
  res.status(401).json({ message: 'Usuário ou senha inválidos' });
});

// Rota de logout (apenas "fake" para frontend limpar o token)
app.post('/logout', (req, res) => {
  res.json({ message: 'Logout realizado com sucesso' });
});

// Rota para verificar status de autenticação via JWT
app.get('/auth/status', checkAuthJWT, (req, res) => {
  res.json({ loggedIn: true, username: req.user.username });
});

// Rotas protegidas (apenas com login)
app.use('/produtos', checkAuthJWT, produtosRouter);
app.use('/clientes', checkAuthJWT, clientesRouter);
app.use('/pedidos', checkAuthJWT, ordensRouter);
app.use('/contagem', checkAuthJWT, contagemRouter); // Nova rota protegida

// Rotas de autenticação
app.use('/', authRouter);

// Rota de teste para clientes (protegida)
app.get('/clientes', verificarToken, (req, res) => {
  res.json({ message: 'Rota protegida acessada com sucesso', user: req.usuario });
});

// Definição das rotas
app.use('/', indexRouter);
app.use('/viacep', viacepRouter);
app.use('/login', loginRouter);

// Tratamento de erros
app.use((req, res, next) => {
    next(createError(404));
});

app.use((err, req, res, next) => {
    const error = {
        status: err.status || 500,
        message: err.message || 'Erro interno do servidor'
    };
    
    res.status(error.status).json(error);
});

// Iniciando o servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;
