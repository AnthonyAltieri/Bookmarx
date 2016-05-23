'use strict';
var express = require('express');
var router = require('./router.js');
var bodyParser = require('body-parser');
var app = express();
var path = require('path');

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.use('/static', express.static(path.join(__dirname, '/static')));

app.use('/', router);

app.listen(6209, function() {
  console.log('listening on port 6209');
});