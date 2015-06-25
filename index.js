require('dotenv').load();
const express = require('express');
const path = require('path');
const redis = require('redis');
const clientSubscriber = redis.createClient();
const clientPublisher = redis.createClient();
const songSubscriber = redis.createClient();

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {origins: '*:*'});

server.listen(4200);

const mainSocket = io.of('/main');
const rockSocket = io.of('/genres/rock');

const https = require('https');

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
clientSubscriber.subscribe('rock');
clientSubscriber.subscribe('main-song');

clientSubscriber.on('message', function (channel, message) {
  console.log(message);
  console.log('channel: ' + channel);

  emitMessages(message, channel);
});

function emitMessages (message, channel) {
  channel = prependGenresToChannelName(channel);
  var clientChannel = io.of('/' + channel);
  console.log(clientChannel);
  clientChannel.emit('message', message);
};

function prependGenresToChannelName (channel) {
  if (channel.indexOf('main') !== -1 || channel.indexOf('song') !== -1) {
    return channel;
  } else {
    return 'genres/' + channel;
  }
};

var clientId = process.env.SOUNDCLOUD_CLIENT_ID;
var url = "https://api.soundcloud.com/tracks.json?client_id=" + clientId;
var defaultUrl = 'https://soundcloud.com/litanymusic/woman-ft-appleby';

function fetchSong () {
  https.get(url, function (res) {
    var body = '';
    var songs;
    var randomSong;
    var songDuration;
    var songUrl;

    res.on('data', function (chunk) {
      body += chunk;
    });

    res.on('end', function () {
      songs = JSON.parse(body);
      randomSong = songs[Math.floor(Math.random()*songs.length)];
      songDuration = randomSong.duration;
      songUrl = randomSong.permalink_url;
      console.log('random song: ', randomSong);
      console.log('random song duration: ', songDuration);
      console.log('random song permalink: ', songUrl);
      emitSong(songUrl);
      //setInterval(fetchSong, songDuration);
      //console.log(songUrl);
    });

  }).on('error', function (e) {
    console.log('got error: ', e);
  });

};

function emitSong (songUrl) {
  songSubscriber.publish('main-song', JSON.stringify(songUrl));
};

fetchSong();
