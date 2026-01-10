/**
 * Authentication Middleware
 * JWT verification and role-based authorization
 */

const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth.config');
const { errorResponse } = require('../utils/responseHandler');
const db = require('../config/db.config');

/**
 * Authenticate user via JWT token
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return errorResponse(res, 'No token provided', 401);
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return errorResponse(res, 'No token provided', 401);
        }

        const decoded = jwt.verify(token, authConfig.secret);

        // Get user from database
        const [[user]] = await db.query(
            'SELECT id, email, is_active FROM users WHERE id = ?',
            [decoded.id]
        );

        if (!user) {
            return errorResponse(res, 'User not found', 401);
        }

        if (!user.is_active) {
            return errorResponse(res, 'User account is deactivated', 401);
        }

        // Get user roles
        const [roles] = await db.query(
            'SELECT role FROM user_roles WHERE user_id = ?',
            [decoded.id]
        );

        req.userId = decoded.id;
        req.userEmail = user.email;
        req.userRoles = roles.map(r => r.role);
        req.userRole = roles[0]?.role; // Primary role

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return errorResponse(res, 'Invalid token', 401);
        }
        if (error.name === 'TokenExpiredError') {
            return errorResponse(res, 'Token expired', 401);
        }
        return errorResponse(res, 'Authentication failed', 401);
    }
};

/**
 * Authorize user based on roles
 * @param {Array<string>} allowedRoles - Array of allowed role names
 */
const authorize = (allowedRoles = []) => {
    return (req, res, next) => {
        if (!req.userRoles || req.userRoles.length === 0) {
            return errorResponse(res, 'No roles assigned', 403);
        }

        // Admin has full access
        if (req.userRoles.includes('admin')) {
            return next();
        }

        // Check if user has any of the allowed roles
        const hasRole = req.userRoles.some(role => allowedRoles.includes(role));

        if (!hasRole) {
            return errorResponse(res, 'Insufficient permissions', 403);
        }

        next();
    };
};

/**
 * Check specific permission
 * @param {string} permission - Required permission (e.g., 'patients:write')
 */
const checkPermission = (permission) => {
    return (req, res, next) => {
        if (!req.userRoles || req.userRoles.length === 0) {
            return errorResponse(res, 'No roles assigned', 403);
        }

        // Admin has full access
        if (req.userRoles.includes('admin')) {
            return next();
        }

        // Check permissions for each role
        const hasPermission = req.userRoles.some(role => {
            const rolePermissions = authConfig.permissions[role] || [];
            return rolePermissions.includes(permission) || rolePermissions.includes('*');
        });

        if (!hasPermission) {
            return errorResponse(res, `Permission denied: ${permission}`, 403);
        }

        next();
    };
};

/**
 * Optional authentication - attaches user if token exists
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, authConfig.secret);

        const [[user]] = await db.query(
            'SELECT id, email, is_active FROM users WHERE id = ?',
            [decoded.id]
        );

        if (user && user.is_active) {
            const [roles] = await db.query(
                'SELECT role FROM user_roles WHERE user_id = ?',
                [decoded.id]
            );

            req.userId = decoded.id;
            req.userEmail = user.email;
            req.userRoles = roles.map(r => r.role);
            req.userRole = roles[0]?.role;
        }

        next();
    } catch (error) {
        // Silently continue without authentication
        next();
    }
};

module.exports = {
    authenticate,
    authorize,
    checkPermission,
    optionalAuth
};
