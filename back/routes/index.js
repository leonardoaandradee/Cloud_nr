var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send({message: 'Welcome to my API! It´s Working. This message is in /back/router/index.js file' });
});

module.exports = router;
