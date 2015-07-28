(function() {
  var server = io.connect('http://localhost:8080');

  var insertMessage = function(data) {
    var html = '<div class="message">' + data + '</div>';
    $('.chat-box').append(html);
  };

  server.on('connect', function(data) {
    nickname = prompt("What is your nickname?");
    server.emit('join', nickname);
  });

  server.on('addUser', function(name) {
    var user = '<span class="user" data-name="' + name + '">' + name + '</span>';
    $('#users').append(user);
  });

  server.on('removeUser', function(name) {
    $('.user[data-name=' + name + ']').remove();
  });

  $('.chat-form').submit(function(e) {
    e.preventDefault();
    var message = $(this).find('.chat-field').val();
    server.emit('messages', message);
  });

  server.on('messages', function(data) {
    insertMessage(data);
  });
})();
