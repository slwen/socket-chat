"use strict";

var redis = require('../lib/redis');

/**
 * Add a user to list of online chatters.
 */
exports.add = function(name) {
  return redis.sadd('chatters', name);
};

/**
 * Remove a user from list of online chatters.
 */
exports.remove = function(name) {
  return redis.srem('chatters', name);
};

/**
 * Fetch all online users.
 */
exports.fetchOnline = function(callback) {
  redis.smembers('names', function(err, names) {
    return callback(names);
  });
};
