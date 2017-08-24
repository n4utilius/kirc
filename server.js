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
  
  var channels = {
    "#n4chat": { 
      users: ["n4"]
    }
  }

  socket.on('login', (d) => {
    if(!(d.channel in channels)){
      io.to(socket.id).emit('login error', {msg: "This channel doesn't exist"});
    }else{
      if( channels[d.channel].users.indexOf(d.nick) > -1 ){
        io.to(socket.id).emit('login error', {msg: "Other user is using this nick, try another"});
      }else{
        channels[d.channel].users.push(d.nick)
        io.to(socket.id).emit('login ok', {user: { nick: d.nick, color: d.color, id: socket.id }, msg: "Log in!!!"});
        
        setTimeout(function(){ 
          io.emit('chat message', { nick: "n4", msg: "Bienvenid@ " + d.nick+ "!!!", color: "#d00" });
        }, 2500)
      }
    }
  });  

  //socket.emit('get channels', channels);
  //socket.emit('get users', channels["#n4chat"] );



  socket.on('chat message', (d) => {
    io.emit('chat message', d);
  });
});