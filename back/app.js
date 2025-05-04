var createError = require('http-errors');
var path = require('path');
var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();

// IMPORT FROM ROUTES: / ROUTES...
var indexRouter = require('./routes/index');
var pizzasRouter = require('./routes/pizzas');
var clientsRouter = require('./routes/clients');
var ordersRouter = require('./routes/orders');

// ENDPOINTS DEFINITION ADDRESS TO ROUTERS
app.use('/', indexRouter);
app.use('/pizzas', pizzasRouter);
app.use('/clients', clientsRouter);
app.use('/orders', ordersRouter);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../front/public')));


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
  res.send('<h2>Pizza Show: Ops! Something went wrong.</h2');
});

module.exports = app;
