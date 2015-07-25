"use strict";

var express = require('express');
var app     = express();
var server  = require('http').createServer(app);

module.exports = server;
app.use(express.static('public'));

require('./chat')();

app.get('/', function(req, res) {
  res.render('chat.ejs');
});

server.listen(8080, function() {
  console.log('Listening on port ' + 8080);
});


