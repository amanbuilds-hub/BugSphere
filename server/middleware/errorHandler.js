import logger from '../utils/logger.js';

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
    let { statusCode, error, message } = err;

    if (!statusCode) statusCode = 500;
    if (!error) error = 'SERVER_ERROR';
    if (!message) message = err.message || 'Internal Server Error';

    logger.error(`${statusCode} - ${error}: ${message} (Path: ${req.url})`);

    // Development environment: Include stack trace for 500 errors
    const response = {
        success: false,
        error,
        message,
        statusCode,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    };

    return res.status(statusCode).json(response);
};

export default errorHandler;
