"use strict";

var express = require('express');
var request = require('request');
var url     = require('url');
var app     = express();
var server  = require('http').createServer(app);
var io      = require('socket.io')(server);
var PORT    = process.env.PORT || 8080;

if (process.env.REDISTOGO_URL) {
  var rtg = url.parse(process.env.REDISTOGO_URL);
  var redis = require("redis").createClient(rtg.port, rtg.hostname);
  redis.auth(rtg.auth.split(":")[1]);
} else {
  var redis = require("redis").createClient();
}

var storeMessage = function(name, data) {
  var message = JSON.stringify({ name: name, data: data });
  redis.lpush('messages', message, function(err, res) {
    redis.ltrim('messages', 0, 9);
  });
};

io.on('connection', function(client) {
  console.log('Client connected...');

  client.on('join', function(name) {
    redis.smembers('names', function(err, names) {
      names.forEach(function(name) {
        client.emit('add chatter', name);
      });
    });

    client.broadcast.emit('add chatter', name);
    redis.sadd('chatters', name);

    redis.lrange('messages', 0, -1, function(err, messages) {
      messages = messages.reverse();
      messages.forEach(function(message) {
        message = JSON.parse(message);
        client.emit('messages', message.name + ': ' + message.data);
      });
    });

    client.name = name;
  });

  client.on('disconnect', function() {
    var name = client.name;
    client.broadcast.emit('remove chatter', name);
    redis.srem('chatters', name);
  });

  client.on('messages', function(message) {
    var name = client.name;
    client.broadcast.emit('messages', name + ': ' + message);
    client.emit('messages', name + ': ' + message);
    storeMessage(name, message);
  });
});

app.get('/', function(req, res) {
  res.render('chat.ejs');
});

server.listen(PORT);
