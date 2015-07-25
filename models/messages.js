"use strict";

var _         = require('lodash');
var redis     = require('../lib/redis');
var sanitizer = require('sanitizer');

/**
 * Store a message. Trim the total list of messages to last 10.
 */
exports.store = function(name, data) {
  var message = JSON.stringify({ name: name, data: data });
  redis.lpush('messages', message, function(err, res) {
    if (err) throw err;
    redis.ltrim('messages', 0, 9);
  });
};

/**
 * Fetch an array of messages. Reverse it so that it's sorted
 * by oldest first, then parse and santize the messages.
 */
exports.fetchAll = function(callback) {
  redis.lrange('messages', 0, -1, function(err, messages) {
    messages = messages.reverse();

    return callback(
      _.map(messages, function(message) {
        message = JSON.parse(message);
        message.data = sanitizer.escape(message.data);
        return message;
      })
    );
  });
};
