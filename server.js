'use strict';

const express = require('express');
const socketIO = require('socket.io');
const path = require('path');
var serveStatic = require('serve-static');

const PORT = process.env.PORT || 3001;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .use(serveStatic(path.join(__dirname, 'public')))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const io = socketIO(server);
io.on('connection', (socket) => {
  

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
});


setInterval(() => io.emit('time', new Date().toTimeString()), 1000);
