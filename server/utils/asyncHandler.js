/**
 * Wrapper for async controller functions to catch errors and pass them to the global error handler
 * @param {Function} fn - Async functionality to be wrapped
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
