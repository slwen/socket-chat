var express     = require('express');
var request     = require('request');
var url         = require('url');


// var redis       = require('redis');

if (process.env.REDISTOGO_URL) {
  var rtg = url.parse(process.env.REDISTOGO_URL);
  var redis = require("redis").createClient(rtg.port, rtg.hostname);
  redis.auth(rtg.auth.split(":")[1]);
} else {
  var redis = require("redis").createClient();
}

// var redisClient = redis.createClient();

var app         = express();
var server      = require('http').createServer(app);
var io          = require('socket.io')(server);

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
  res.sendFile(__dirname + "/index.html");
});

app.get('/pages/:campaign_id', function(req, response) {
  var uid = req.params.campaign_id;

  var options = {
    protocol: 'http:',
    host: 'everydayhero.com',
    pathname: '/api/v2/pages.json',
    query: { campaign_id: uid, limit: 5, page: 1 }
  };

  var pagesUrl = url.format(options);

  request(pagesUrl, function(err, res, body) {
    var data = JSON.parse(body);
    response.locals = { data: data };
    response.render('pages.ejs');
  });
});

var quotes = {
  'einstein': 'Life is like riding a bicycle. To keep your balance you must keep moving',
  'berners-lee': 'The Web does not just connect machines, it connects people',
  'crockford': 'The good thing about reinventing the wheel is that you can get a round one',
  'hofstadter': 'Which statement seems more true: (1) I have a brain. (2) I am a brain.'
};

app.get('/quotes/:name', function(request, response) {
  var quote = quotes[request.params.name];

  response.writeHead(200);
  response.write(quote);
  response.end();
});

server.listen(8080)
