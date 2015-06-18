const express = require('express');
//const io = require('socket.io').listen(process.env.PORT || 3000);
const path = require('path');
const redis = require('redis');
const clientSubscriber = redis.createClient();
const clientPublisher = redis.createClient();


const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {origins: '*:*'});

server.listen(4200);

const mainSocket = io.of('/main');
var connections = 0;
// primary connection to app
io.on('connection', function (socket) {
  connections++;
  console.log(connections + ' clients connected to app');

  socket.on('disconnect', function () {
    console.log('Client disconnected');
    socket.disconnect();
  });
});

mainSocket.on('connection', function (socket) {
  console.log('connected on main socket');

  socket.on('disconnect', function () {
    console.log('client disconnected on main socket');
    socket.disconnect();
  });
});

clientSubscriber.subscribe('main');

clientSubscriber.on('message', function (channel, message) {
  console.log(message);
  console.log('channel: ' + channel);

  emitMessages(message, channel);
});

function emitMessages (message, channel) {
  var clientChannel = io.of('/' + channel);
  clientChannel.emit('message', message);
};
