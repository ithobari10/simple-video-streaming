const http = require('http');
const socketIo = require('socket.io');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
    },
});

let videoBuffer = [];

io.on('connection', (socket) => {
    console.log('Client connected');

    // Send buffered video chunks to new clients
    videoBuffer.forEach(chunk => {
        socket.emit('stream', chunk);
    });

    socket.on('videoChunk', (data) => {
        console.log('Received video chunk');
        
        // Save chunks to buffer, limit the buffer size if needed
        videoBuffer.push(data);
        if (videoBuffer.length > 100) { // Keep last 100 chunks
            videoBuffer.shift();
        }
        
        io.emit('stream', data); // Broadcast video chunk to all clients
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(3000, () => {
    console.log('Server listening on port 3000');
});