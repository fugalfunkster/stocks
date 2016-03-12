var socket = io();

window.onload = function() {

  var submit = document.getElementById('submit');
  var input = document.getElementById('m');
  var messages = document.getElementById('messages');

  submit.addEventListener('click', function(e) {
    arrestEvent(e);
    socket.emit('addStock', input.value);
    input.value = '';
  });

  socket.on('newStock', function(msg) {
    console.log(msg);
    messages.innerHTML = messages.innerHTML + '<li>' + msg + '</li>';
  });

  function arrestEvent(e) {
    e.stopPropagation();
    e.preventDefault();
  }

};
