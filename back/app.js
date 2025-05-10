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
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  allowedHeaders: ['Content-Type', 'Authorization'] 
}));

// Middlewares principais
app.use(logger('dev'));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../front/public')));

// Middleware de logging aprimorado
// Foi modificado para fins de testes de  requisições
app.use((req, res, next) => {
    console.log('Teste de nova requisição:', {
        method: req.method,
        path: req.path,
        origin: req.headers.origin,
        body: req.method === 'POST' ? req.body : 'Não é POST'
    });
    next();
});

// Configuração da view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Importação das rotas
const indexRouter = require('./routes/index');
const produtosRouter = require('./routes/produtos');
const clientesRouter = require('./routes/clientes');
const ordensRouter = require('./routes/pedidos');

// Definição das rotas
app.use('/', indexRouter);
app.use('/produtos', produtosRouter);
app.use('/clientes', clientesRouter);
app.use('/pedidos', ordensRouter);

// Tratamento de erros
app.use((req, res, next) => {
    next(createError(404));
});

app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.send('<h2>Pizza Show: Desculpe, algo deu errado!</h2>');
});

module.exports = app;
