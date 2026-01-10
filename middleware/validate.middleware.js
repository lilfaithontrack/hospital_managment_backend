/**
 * Validation Middleware
 * Wrapper for express-validator
 */

const { validationResult } = require('express-validator');
const { errorResponse } = require('../utils/responseHandler');

/**
 * Validate request and return errors if any
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(error => ({
            field: error.path || error.param,
            message: error.msg,
            value: error.value
        }));

        return errorResponse(res, 'Validation failed', 400, formattedErrors);
    }

    next();
};

/**
 * Create a validation middleware chain
 * @param {Array} validations - Array of express-validator validations
 */
const validateRequest = (validations) => {
    return async (req, res, next) => {
        // Run all validations
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            const formattedErrors = errors.array().map(error => ({
                field: error.path || error.param,
                message: error.msg,
                value: error.value
            }));

            return errorResponse(res, 'Validation failed', 400, formattedErrors);
        }

        next();
    };
};

module.exports = {
    validate,
    validateRequest
};
