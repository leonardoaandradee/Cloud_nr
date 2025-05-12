// Importações principais
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

// Inicialização do app
const app = express();

// Configuração do CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Middlewares principais
app.use(logger('dev'));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Middleware de logging aprimorado
app.use((req, res, next) => {
    console.log('Teste de tipo de requisição:', {
        method: req.method,
        path: req.path,
        origin: req.headers.origin,
    });
    next();
});

// Importação das rotas
const indexRouter = require('./routes/index');
const produtosRouter = require('./routes/produtos');
const clientesRouter = require('./routes/clientes');
const ordensRouter = require('./routes/pedidos');
const viacepRouter = require('./routes/viacep');

// Definição das rotas
app.use('/', indexRouter);
app.use('/produtos', produtosRouter);
app.use('/clientes', clientesRouter);
app.use('/pedidos', ordensRouter);
app.use('/viacep', viacepRouter);

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

module.exports = app;
