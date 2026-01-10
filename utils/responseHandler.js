/**
 * Standardized API Response Handler
 */

/**
 * Send a success response
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
    });
};

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {Array} errors - Validation errors array
 */
const errorResponse = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
    const response = {
        success: false,
        message,
        timestamp: new Date().toISOString()
    };

    if (errors) {
        response.errors = errors;
    }

    return res.status(statusCode).json(response);
};

/**
 * Send a paginated response
 * @param {Object} res - Express response object
 * @param {Object} data - Data with pagination info
 * @param {string} message - Success message
 */
const paginatedResponse = (res, data, message = 'Data retrieved successfully') => {
    return res.status(200).json({
        success: true,
        message,
        data: data.data || data.rows,
        pagination: data.pagination || {
            page: data.page,
            limit: data.limit,
            total: data.total,
            totalPages: data.totalPages
        },
        timestamp: new Date().toISOString()
    });
};

module.exports = {
    successResponse,
    errorResponse,
    paginatedResponse
};
