'use strict';
var express = require('express');
var router = require('./router.js');
var bodyParser = require('body-parser');
var app = express();
var path = require('path');
var session = require('express-session');
var multer = require('multer');
var upload = multer({
  dest: './public/uploads/'
}).single('filename');


var mySession = session({
  secret: 'I@am@w3s0m3',
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false },
  maxAge: 900000
});



app.use(mySession);

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.disable('x-powered-by');


app.use('/static', express.static(path.join(__dirname, '/static')));
app.set('views', __dirname + '/static/templates');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

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

});

app.use(function(req, res, next) {
  res.status(500);

  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, '/static/templates/500.html'));

  } else if (req.accepts('json')) {
    res.send({error: '500'});

  } else {
    res.type('txt').send('500');
  }

});

app.get('/changePW',function(req,res){
  res.render(path.join(__dirname, '/static/templates/changePW.html'));
  console.log("directory name: " + __dirname);
});

app.get('/reset', function(req,res){
  res.render(path.join(__dirname, '/static/templates/reset.html'));
  console.log("directory name: " + __dirname);
});

app.get('/verify',function(req,res){
  res.render(path.join(__dirname, '/static/templates/verify.html'));
  console.log("directory name: " + __dirname);
});


app.listen(6209, function() {
  console.log('listening on port 6209');
});
