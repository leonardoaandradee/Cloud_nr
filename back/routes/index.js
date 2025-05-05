var express = require('express');
var router = express.Router();
var path = require('path');

/* GET home page. */
// Here you load Index.html file
// The file INDEX.HTML is in Frontend folder
//
router.get('/', function(req, res, next) {
    console.log('You are in index.js file');
    res.sendFile(path.join(__dirname, '../../front/public/index.html')); 
});

module.exports = router;
