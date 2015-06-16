var socket = io();

socket.on('connect', function () {
  console.log('I AM CONNECTED VIA A WEBSOCKET!!');
});
