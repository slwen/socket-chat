(function() {
  var server = io.connect("//localhost:8080");

  var insertMessage = function(data) {
    var html = '<div class="message">' + data + '</div>';
    $('.chat-box').append(html);
  };

  server.on('connect', function(data) {
    nickname = prompt("What is your nickname?");
    server.emit('join', nickname);
  });

  server.on('add chatter', function(name) {
    var chatter = '<span class="chatter" data-name="' + name + '">' + name + '</span>';
    $('#chatters').append(chatter);
  });

  server.on('remove chatter', function(name) {
    $('.chatter[data-name=' + name + ']').remove();
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
