import ApiError from '../utils/ApiError.js';

/**
 * Validation Middleware using Zod schema
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @param {string} type - Where the data is [body, query, params]
 */
const validate = (schema, type = 'body') => {
    return (req, res, next) => {
        try {
            const data = schema.parse(req[type]);
            req[type] = data; // Re-assign parsed/cleaned data back to request
            next();
        } catch (error) {
            if (error.errors && Array.isArray(error.errors)) {
                const fieldErrors = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }));
                return next(new ApiError(400, 'VAL_001', 'Validation failed: ' + fieldErrors.map(fe => fe.message).join(', ')));
            }
            next(new ApiError(400, 'VAL_001', 'Validation failed'));
        }
    };
};

export default validate;
