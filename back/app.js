var createError = require('http-errors');
var path = require('path');
var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors'); 

var app = express();

// Configuração do CORS
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 200,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Aplicar CORS antes de qualquer outra middleware
app.use(cors(corsOptions));

// Middleware para processar JSON
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Rotas
var indexRouter = require('./routes/index');
var produtosRouter = require('./routes/produtos');
var clientesRouter = require('./routes/clientes');
var ordensRouter = require('./routes/pedidos');

// ENDPOINTS DEFINITION ADDRESS TO ROUTERS
app.use('/', indexRouter);
app.use('/produtos', produtosRouter);
app.use('/clientes', clientesRouter);
app.use('/pedidos', ordensRouter);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../front/public')));

// Adicione logo após a configuração do CORS
app.use((req, res, next) => {
  console.log('Nova requisição:', {
    method: req.method,
    path: req.path,
    origin: req.headers.origin
  });
  next();
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send('<h2>Pizza Show: Desculpe, algo deu errado!</h2>');
});

module.exports = app;
