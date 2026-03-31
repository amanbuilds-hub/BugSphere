import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import 'dotenv/config';

import connectDB from './config/db.js';
import initSocket from './socket.js';
import logger from './utils/logger.js';
import errorHandler from './middleware/errorHandler.js';

// Route Imports
import authRoutes from './routes/auth.routes.js';
import bugRoutes from './routes/bug.routes.js';
import projectRoutes from './routes/project.routes.js';
import aiRoutes from './routes/ai.routes.js';
import notificationRoutes from './routes/notification.routes.js';

// Init Express
const app = express();
const server = http.createServer(app);

// Init Database
connectDB();

// Init Socket.io
const io = initSocket(server);
app.set('socketio', io); // Global access

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// Static Files
app.use('/uploads', express.static('uploads'));

// Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({ success: true, status: 'Server is healthy', timestamp: new Date() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bugs', bugRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);

// Error Handler
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
