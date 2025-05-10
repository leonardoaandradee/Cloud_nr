var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
    console.log('You are in order.js file.');
    res.send('<h2>Pizza Show: You are in ORDERS.JS file</h2>');
});

module.exports = router;
