"use strict";

var redis = require('../lib/redis');

/**
 * Add a user to list of online users.
 */
exports.add = function(name) {
  return redis.sadd('users', name);
};

/**
 * Remove a user from list of online users.
 */
exports.remove = function(name) {
  return redis.srem('users', name);
};

/**
 * Fetch all online users.
 */
exports.fetchOnline = function(callback) {
  redis.smembers('names', function(err, names) {
    return callback(names);
  });
};
