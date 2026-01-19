/**
 * Auth Controller
 * Handles authentication and user management
 */

const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const UserRole = require('../models/userRole.model');
const Staff = require('../models/staff.model');
const StaffRole = require('../models/staffRole.model');
const authConfig = require('../config/auth.config');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { asyncHandler } = require('../utils/errorHandler');

const AuthController = {
    /**
     * Register new user
     */
    register: asyncHandler(async (req, res) => {
        const { email, password, role } = req.body;

        // Check if user exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return errorResponse(res, 'Email already registered', 409);
        }

        // Create user
        const user = await User.create({ email, password });

        // Assign role
        const userRole = role || 'receptionist';
        await UserRole.addRole(user.id, userRole);

        // Generate token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: userRole },
            authConfig.secret,
            { expiresIn: authConfig.expiresIn }
        );

        const refreshToken = jwt.sign(
            { id: user.id },
            authConfig.refreshSecret,
            { expiresIn: authConfig.refreshExpiresIn }
        );

        return successResponse(res, {
            user: { id: user.id, email: user.email, role: userRole },
            token,
            refreshToken
        }, 'User registered successfully', 201);
    }),

    /**
     * User login
     */
    login: asyncHandler(async (req, res) => {
        const { email, password } = req.body;

        // Find user
        const user = await User.findByEmail(email);
        if (!user) {
            return errorResponse(res, 'Invalid email or password', 401);
        }

        // Check if active
        if (!user.is_active) {
            return errorResponse(res, 'Account is deactivated. Please contact administrator.', 401);
        }

        // Verify password
        const isValidPassword = await User.verifyPassword(password, user.password_hash);
        if (!isValidPassword) {
            return errorResponse(res, 'Invalid email or password', 401);
        }

        // Get roles
        const roles = await UserRole.getRolesByUserId(user.id);
        const primaryRole = roles[0]?.role || 'user';

        // Update last login
        await User.updateLastLogin(user.id);

        // Generate tokens
        const token = jwt.sign(
            { id: user.id, email: user.email, role: primaryRole },
            authConfig.secret,
            { expiresIn: authConfig.expiresIn }
        );

        const refreshToken = jwt.sign(
            { id: user.id },
            authConfig.refreshSecret,
            { expiresIn: authConfig.refreshExpiresIn }
        );

        return successResponse(res, {
            user: {
                id: user.id,
                email: user.email,
                role: primaryRole,
                roles: roles.map(r => r.role)
            },
            token,
            refreshToken
        }, 'Login successful');
    }),

    /**
     * Staff Login - Returns staff info with role and allowed modules
     */
    staffLogin: asyncHandler(async (req, res) => {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findByEmail(email);
        if (!user) {
            return errorResponse(res, 'Invalid email or password', 401);
        }

        // Check if active
        if (!user.is_active) {
            return errorResponse(res, 'Account is deactivated. Please contact administrator.', 401);
        }

        // Verify password
        const isValidPassword = await User.verifyPassword(password, user.password_hash);
        if (!isValidPassword) {
            return errorResponse(res, 'Invalid email or password', 401);
        }

        // Get linked staff record
        const staff = await Staff.findByUserId(user.id);
        if (!staff) {
            return errorResponse(res, 'No staff profile linked to this account', 401);
        }

        // Get staff role with modules
        let role = null;
        let allowedModules = [];

        if (staff.role_id) {
            role = await StaffRole.findById(staff.role_id);
            if (role) {
                allowedModules = role.allowed_modules || [];
            }
        }

        // Fallback: try to find role by staff role name
        if (!role && staff.role) {
            role = await StaffRole.findByName(staff.role);
            if (role) {
                allowedModules = role.allowed_modules || [];
            }
        }

        // Update last login
        await User.updateLastLogin(user.id);

        // Generate token with staff info
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                staffId: staff.id,
                roleId: role?.id,
                roleName: role?.name || staff.role
            },
            authConfig.secret,
            { expiresIn: authConfig.expiresIn }
        );

        const refreshToken = jwt.sign(
            { id: user.id },
            authConfig.refreshSecret,
            { expiresIn: authConfig.refreshExpiresIn }
        );

        return successResponse(res, {
            user: {
                id: user.id,
                email: user.email,
                staffId: staff.id,
                staffName: staff.name,
                department: staff.department_name || null,
                role: {
                    id: role?.id || null,
                    name: role?.name || staff.role,
                    allowedModules: allowedModules
                }
            },
            token,
            refreshToken
        }, 'Login successful');
    }),

    /**
     * Create Staff Account - Admin creates staff with user account
     */
    createStaffAccount: asyncHandler(async (req, res) => {
        const { email, password, name, role_id, phone, shift, join_date, salary, address, emergency_contact, department_id } = req.body;

        // Validate required fields
        if (!email || !password || !name || !role_id) {
            return errorResponse(res, 'Email, password, name, and role are required', 400);
        }

        // Check if email already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return errorResponse(res, 'Email already registered', 409);
        }

        // Validate role exists
        const role = await StaffRole.findById(role_id);
        if (!role) {
            return errorResponse(res, 'Invalid role selected', 400);
        }

        // Create user account
        const user = await User.create({ email, password });

        // Add user role (use role name as the user_role)
        const systemRole = role.name.toLowerCase().replace(/\s+/g, '_');
        await UserRole.addRole(user.id, systemRole);

        // Create staff record
        const staff = await Staff.create({
            name,
            email,
            phone: phone || null,
            role: role.name,
            role_id: role.id,
            user_id: user.id,
            department_id: department_id || null,
            shift: shift || 'Morning',
            join_date: join_date || new Date().toISOString().split('T')[0],
            salary: salary || null,
            address: address || null,
            emergency_contact: emergency_contact || null,
            status: 'Active'
        });

        return successResponse(res, {
            staff: {
                id: staff.id,
                staff_id: staff.staff_id,
                name: staff.name,
                email: staff.email,
                role: role.name
            },
            user: {
                id: user.id,
                email: user.email
            }
        }, 'Staff account created successfully', 201);
    }),

    /**
     * Logout (client-side - just acknowledge)
     */
    logout: asyncHandler(async (req, res) => {
        return successResponse(res, null, 'Logout successful');
    }),

    /**
     * Refresh token
     */
    refreshToken: asyncHandler(async (req, res) => {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return errorResponse(res, 'Refresh token required', 400);
        }

        try {
            const decoded = jwt.verify(refreshToken, authConfig.refreshSecret);
            const user = await User.findByIdWithRoles(decoded.id);

            if (!user || !user.is_active) {
                return errorResponse(res, 'Invalid refresh token', 401);
            }

            const primaryRole = user.roles[0] || 'user';

            const newToken = jwt.sign(
                { id: user.id, email: user.email, role: primaryRole },
                authConfig.secret,
                { expiresIn: authConfig.expiresIn }
            );

            return successResponse(res, { token: newToken }, 'Token refreshed');
        } catch (error) {
            return errorResponse(res, 'Invalid or expired refresh token', 401);
        }
    }),

    /**
     * Get current user
     */
    getCurrentUser: asyncHandler(async (req, res) => {
        const user = await User.findByIdWithRoles(req.userId);

        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }

        return successResponse(res, {
            id: user.id,
            email: user.email,
            roles: user.roles,
            isActive: user.is_active,
            lastLogin: user.last_login,
            createdAt: user.created_at
        }, 'User retrieved');
    }),

    /**
     * Change password
     */
    changePassword: asyncHandler(async (req, res) => {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findByEmail(req.userEmail);
        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }

        // Verify current password
        const isValid = await User.verifyPassword(currentPassword, user.password_hash);
        if (!isValid) {
            return errorResponse(res, 'Current password is incorrect', 400);
        }

        // Update password
        await User.update(req.userId, { password: newPassword });

        return successResponse(res, null, 'Password changed successfully');
    }),

    /**
     * Forgot password (placeholder - would need email service)
     */
    forgotPassword: asyncHandler(async (req, res) => {
        const { email } = req.body;

        const user = await User.findByEmail(email);
        if (!user) {
            // Don't reveal if email exists
            return successResponse(res, null, 'If email exists, reset instructions will be sent');
        }

        // TODO: Generate reset token and send email
        // const resetToken = crypto.randomBytes(32).toString('hex');
        // await sendPasswordResetEmail(email, resetToken);

        return successResponse(res, null, 'If email exists, reset instructions will be sent');
    }),

    /**
     * Reset password (placeholder)
     */
    resetPassword: asyncHandler(async (req, res) => {
        const { token, newPassword } = req.body;

        // TODO: Verify reset token and update password

        return successResponse(res, null, 'Password reset successful');
    })
};

module.exports = AuthController;
