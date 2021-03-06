'use strict';

const express = require('express');
const socketIO = require('socket.io');
const path = require('path');
const sanitizeHtml = require('sanitize-html');
const serveStatic = require('serve-static');

const PORT = process.env.PORT || 3001;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
  .use(express.static('public'))
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const io = socketIO(server);

var channels = {
  "#n4chat": { 
    users: ["n4"]
  }
}

var sanitize = (obj) => {
  for( let k in obj){ obj[k] = sanitizeHtml(obj[k]) }
  return obj
}

io.on('connection', (socket) => {
  

  socket.on('login', (d) => {
    d = sanitize(d)
    if(d.channel == ""){
      io.to(socket.id).emit('login error', 
        { msg: "You should introduce a valid channel name" });
      return false;
    }

    if(d.nick == ""){
      io.to(socket.id).emit('login error', 
        { msg: "You should introduce a valid nick name" });
      return false;
    }

    if(!(d.channel in channels)){
      io.to(socket.id).emit('login error', 
        { msg: "This channel doesn't exist" });
      return false;
    }
    
    if( channels[d.channel].users.indexOf(d.nick) > -1 ){
      io.to(socket.id).emit('login error', 
        { msg: "Other user is using this nick, try another" });
      return false;
    }
    
    channels[d.channel].users.push(d.nick)
    io.to(socket.id).emit('login ok', 
      { user: { nick: d.nick, color: d.color, id: socket.id, channel: d.channel }, 
        msg: "Log in!!!" });
        
    setTimeout(function(){ 
      io.emit('chat message', 
        { nick: "n4", msg: "Welcome " + d.nick + "!!!", color: "#d00" });
      io.emit('get users', channels[d.channel].users);
    }, 2500)

  });  

  socket.on('log out', (d) => {
    var c = d.user.channel
      , users = channels[c].users;

    channels[c].users = [];

    for(var i in users) 
      if(users[i] != d.user.nick ) channels[c].users.push(users[i]);
    
    io.emit('chat message', 
      { nick: "n4", msg: d.user.nick + " ha salido de la sala", color: "#d00" });
    io.emit('get users', channels[c].users);
    io.to(socket.id).emit('exit',{});

  })

  socket.on('chat message', (d) => {
    d = sanitize(d)
    if(d.msg == ""){
      io.emit('chat message',
       { nick: "n4", 
         msg: d.nick + " no puedes introducir este tipo de 'texto'", color: "#d00" });
      return false;
    }
    
    io.emit('chat message', d);
  });
});