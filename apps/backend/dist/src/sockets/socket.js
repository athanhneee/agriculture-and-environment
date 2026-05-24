"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const env_1 = require("../config/env");
let io;
const initSocket = (httpServer) => {
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: env_1.env.clientUrl,
            methods: ['GET', 'POST'],
            credentials: true
        }
    });
    io.on('connection', (socket) => {
        console.log(` New client connected: ${socket.id}`);
        // Join a specific farmZone room
        socket.on('join-room', (roomId) => {
            socket.join(roomId);
            console.log(` Socket ${socket.id} joined room: ${roomId}`);
        });
        socket.on('leave-room', (roomId) => {
            socket.leave(roomId);
            console.log(` Socket ${socket.id} left room: ${roomId}`);
        });
        socket.on('disconnect', () => {
            console.log(` Client disconnected: ${socket.id}`);
        });
    });
    return io;
};
exports.initSocket = initSocket;
const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};
exports.getIO = getIO;
