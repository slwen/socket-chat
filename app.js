"use strict";

var express = require('express');
var app     = express();
var server  = require('http').createServer(app);
var PORT    = process.env.PORT || 8080;

module.exports = server;
app.use(express.static('public'));

require('./chat')();

app.get('/', function(req, res) {
  res.render('chat.ejs');
});

server.listen(PORT, function() {
  console.log('Listening on port ' + PORT);
});


