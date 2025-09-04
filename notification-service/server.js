const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
    console.log('A user connected');
    
    socket.on('vote', (data) => {
        io.emit('voteUpdate', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(5000, () => {
    console.log('Notification Service running on port 5000');
});
