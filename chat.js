"use strict";

var server   = require('./app');
var io       = require('socket.io')(server);
var messages = require('./models/messages');
var users    = require('./models/users');

module.exports = function() {
  io.on('connection', function(client) {
    console.log('Client connecting...');

    client.on('join', function(name) {
      console.log(name + ' connected.');

      /**
       * Send a list of all currently online users back to the client.
       */
      users.fetchOnline(function(names) {
        names.forEach(function(name) {
          client.emit('addUser', name);
        });
      });

      /**
       * Broadcast to all clients that a new user has joined.
       */
      client.broadcast.emit('addUser', name);
      users.add(name);

      /**
       * Send all current messages to client to display.
       */
      messages.fetchAll(function(items) {
        items.forEach(function(item) {
          client.emit('messages', item.name + ': ' + item.data);
        });
      });

      client.name = name;
    });

    client.on('disconnect', function() {
      var name = client.name;

      if (name !== undefined) {
        client.broadcast.emit('removeUser', name);
        console.log(name + ' disconnected.');
        users.remove(name);
      }
    });

    client.on('messages', function(message) {
      var name = client.name;
      client.broadcast.emit('messages', name + ': ' + message);
      client.emit('messages', name + ': ' + message);
      messages.store(name, message);
    });
  });
};
