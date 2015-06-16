const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const redis = require('redis');
const clientSubscriber = redis.createClient();
const clientPublisher = redis.createClient();

http.listen(process.env.PORT || 3000, function () {
  console.log('Up and running on Port 3000');
});

app.use(express.static('public'));

io.on('connection', function (socket) {
  console.log('Client connected to the app');

  socket.on('disconnect', function () {
    console.log('Client disconnected');
    socket.disconnect();
  });
});

clientSubscriber.subscribe('main_channel');

clientSubscriber.on('message', function (channel, message) {
  console.log(message);
});
