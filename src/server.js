'use strict';
var express = require('express');
var router = require('./router.js');
var bodyParser = require('body-parser');
var app = express();
var path = require('path');
var session = require('express-session');

var mySession = session({
  secret: 'N0deJS1sAw3some',
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }
});

app.use(mySession);

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());


app.use('/static', express.static(path.join(__dirname, '/static')));

app.use('/', router);

app.use(function(req, res, next) {
  res.status(404);

  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, '/static/templates/404.html'));

  } else if (req.accepts('json')) {
    res.send({error: '404 Not Found'});

  } else {
    res.type('txt').send('404 Not Found');
  }

})

app.use(function(req, res, next) {
  res.status(500);

  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, '/static/templates/500.html'));

  } else if (req.accepts('json')) {
    res.send({error: '500'});

  } else {
    res.type('txt').send('500');
  }

})

app.listen(6209, function() {
  console.log('listening on port 6209');
});
