/**
 * Custom API Error class
 * @extends Error
 */
class ApiError extends Error {
    /**
     * @param {number} statusCode - HTTP status code
     * @param {string} error - Internal error code (e.g. AUTH_001)
     * @param {string} message - Error message
     */
    constructor(statusCode, error, message) {
        super(message);
        this.statusCode = statusCode;
        this.error = error;
        this.success = false;
        Error.captureStackTrace(this, this.constructor);
    }
}

export default ApiError;
