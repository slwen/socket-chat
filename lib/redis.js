"use strict";

var redis = require('redis');
var url   = require('url');

/**
 * Check for Redis To Go URL (available on Heroku) and
 * use that to configure client if available.
 */
if (process.env.REDISTOGO_URL) {
  var rtg = url.parse(process.env.REDISTOGO_URL);
  var client = redis.createClient(rtg.port, rtg.hostname);
  client.auth(rtg.auth.split(":")[1]);
} else {
  var client = redis.createClient();
}

client.on('error', function(err) {
  throw err;
});

module.exports = client;
