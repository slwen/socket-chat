"use strict";

var mocha   = require('mocha');
var should  = require('should');
var io      = require('socket.io-client');
var request = require('supertest');
var app     = require('./app');

var socketUrl = "http://localhost:8080";
var options = {
  transports: ['websocket'],
  'force new connection': true
};

var chatUser1 = { name: "Huey" };
var chatUser2 = { name: "Dewey" };
var chatUser3 = { name: "Louie" };

describe('Requests to root route', function() {
  it('Returns a 200 status code', function(done) {
    request(app)
      .get('/')
      .expect(200)
      .end(function(err) {
        if (err) throw err;
        done();
      });
  });

  it('Returns a HTML page', function(done) {
    request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .end(function(err) {
        if (err) throw err;
        done();
      });
  });
});

describe('chat server', function() {
  it('Should broadcast new users joining the server', function(done) {
    var client1 = io.connect(socketUrl, options);
    var client2 = io.connect(socketUrl, options);

    client1.on('connect', function(data) {
      client1.emit('join', chatUser1.name);

      client2.on('connect', function(data) {
        client2.emit('join', chatUser2.name);
      });

      client1.on('add chatter', function(name) {
        name.should.equal("Dewey");
        client2.disconnect();
        client1.disconnect();
        done();
      });
    });
  });
});
