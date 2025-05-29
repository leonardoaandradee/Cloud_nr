require('dotenv').config();
const express = require('express');
const path = require('path');
const logger = require('morgan');
const cors = require('cors');
const indexRouter = require('./routes/index');
const URL_FRONT = 'https://glowing-journey-jjqjvp5qwqvxfqjxj-3000.app.github.dev';

const app = express();

// Configurações
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/components', express.static(path.join(__dirname, 'public/components')));
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));

// Configuração do CORS
app.use(cors({
  origin: URL_FRONT,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Middlewares principais
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware de autenticação
app.use((req, res, next) => {
  // Permitir acesso à página de login e arquivos estáticos sem autenticação
  if (req.path === '/login' || 
      req.path === '/' ||  // Redirecionar a raiz também será tratado na rota
      req.path.startsWith('/js/') || 
      req.path.startsWith('/css/') || 
      req.path.startsWith('/components/')) {
    return next();
  }
  
  // Para todas as outras rotas, verificar se está apenas renderizando no servidor
  // Continuamos, pois a verificação do token será feita no cliente
  next();
});

// Rotas
app.use('/', indexRouter);

// Tratamento de erros
app.use((req, res, next) => {
    res.status(404).render('error', {
        message: 'Página não encontrada',
        error: {}
    });
});

module.exports = app;

