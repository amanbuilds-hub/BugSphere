import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import logger from './utils/logger.js';

/**
 * Socket.io Initializer
 * @param {import('http').Server} httpServer
 */
const initSocket = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    // Authentication Middleware for Sockets
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) return next(new Error('Authentication error: No token provided'));

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
            if (!user) return next(new Error('Authentication error: User not found'));

            socket.user = user;
            next();
        } catch (err) {
            next(new Error('Authentication error: ' + err.message));
        }
    });

    io.on('connection', (socket) => {
        logger.info(`Socket connected: ${socket.user.name} (${socket.id})`);

        // 1. Personal Room
        socket.join(`user:${socket.user._id}`);

        // Join rooms for user's projects (Client will ask to join)
        socket.on('joinProject', (projectId) => {
            socket.join(`project:${projectId}`);
            logger.info(`User ${socket.user.name} joined project room: ${projectId}`);
        });

        socket.on('leaveProject', (projectId) => {
            socket.leave(`project:${projectId}`);
            logger.info(`User ${socket.user.name} left project room: ${projectId}`);
        });

        // Join room for specific bug detail
        socket.on('joinBug', (bugId) => {
            socket.join(`bug:${bugId}`);
            logger.info(`User ${socket.user.name} joined bug room: ${bugId}`);
        });

        socket.on('leaveBug', (bugId) => {
            socket.leave(`bug:${bugId}`);
            logger.info(`User ${socket.user.name} left bug room: ${bugId}`);
        });

        socket.on('disconnect', () => {
            logger.info(`Socket disconnected: ${socket.id}`);
        });
    });

    return io;
};

export default initSocket;
