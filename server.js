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

var channels = {
  "#n4chat": { 
    users: ["n4"]
  }
}

io.on('connection', (socket) => {
  

  socket.on('login', (d) => {
    if(!(d.channel in channels)){
      io.to(socket.id).emit('login error', {msg: "This channel doesn't exist"});
    }else{
      if( channels[d.channel].users.indexOf(d.nick) > -1 ){
        io.to(socket.id).emit('login error', {msg: "Other user is using this nick, try another"});
      }else{
        channels[d.channel].users.push(d.nick)
        io.to(socket.id).emit('login ok', {user: { nick: d.nick, color: d.color, id: socket.id, channel: d.channel }, msg: "Log in!!!"});
        console.log(channels)
        
        setTimeout(function(){ 
          io.emit('chat message', { nick: "n4", msg: "Bienvenid@ " + d.nick+ "!!!", color: "#d00" });
          io.emit('get users', channels[d.channel].users);
        }, 2500)
      }
    }
  });  

  socket.on('log out', (d) => {
    //var idx = channels[d.user.channel].users.indexOf(d.nick);
    //if (idx > -1) channels[d.user.channel].users.splice(idx, 1);
    var c = d.user.channel
      , users = channels[c].users;

    channels[c].users = [];

    for(var i in users){
      console.log(users[i], d.user.nick, users[i] != d.user.nick);
      if(users[i] != d.user.nick ) channels[c].users.push(users[i]);
    }

    io.emit('chat message', { nick: "n4", msg: d.user.nick + " ha salido de la sala", color: "#d00" });
    io.emit('get users', channels[c].users);
    io.to(socket.id).emit('exit',{});

  })

  socket.on('chat message', (d) => {
    io.emit('chat message', d);
  });
});