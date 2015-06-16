const express = require('express');
const io = require('socket.io').listen(process.env.PORT || 3000);
const path = require('path');
const redis = require('redis');
const clientSubscriber = redis.createClient();
const clientPublisher = redis.createClient();

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
  console.log('channel: ' + channel);
  io.sockets.emit('message', message);
});
