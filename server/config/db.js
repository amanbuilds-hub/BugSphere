import mongoose from 'mongoose';
import 'dotenv/config';
import logger from '../utils/logger.js';

/**
 * Configure database connection
 * @returns {Promise<void>}
 */
const connectDB = async () => {
    try {
        const mongoURI = process.env.NODE_ENV === 'test'
            ? process.env.MONGODB_TEST_URI
            : process.env.MONGODB_URI;

        if (!mongoURI) {
            throw new Error('MONGODB_URI not found in env variables');
        }

        const conn = await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        logger.info(`MongoDB connected to: ${conn.connection.host}`);

        // Create text index for bugs
        conn.connection.on('connected', () => {
            mongoose.model('Bug').collection.createIndex({
                title: 'text',
                description: 'text'
            });
        });

    } catch (error) {
        logger.error(`MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
