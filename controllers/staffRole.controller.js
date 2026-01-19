/**
 * Staff Role Controller
 * Handles CRUD operations for staff roles
 */

const StaffRole = require('../models/staffRole.model');
const { AVAILABLE_MODULES, getModulesByCategory, validateModules } = require('../config/modules.config');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHandler');
const { asyncHandler } = require('../utils/errorHandler');

const StaffRoleController = {
    /**
     * Get all roles
     */
    getAll: asyncHandler(async (req, res) => {
        const { page, limit, search, isActive } = req.query;
        const result = await StaffRole.findAll({ page, limit, search, isActive });
        return paginatedResponse(res, result, 'Roles retrieved successfully');
    }),

    /**
     * Get active roles (for dropdowns)
     */
    getActiveRoles: asyncHandler(async (req, res) => {
        const roles = await StaffRole.getActiveRoles();
        return successResponse(res, roles, 'Active roles retrieved');
    }),

    /**
     * Get role by ID
     */
    getById: asyncHandler(async (req, res) => {
        const role = await StaffRole.findById(req.params.id);
        if (!role) {
            return errorResponse(res, 'Role not found', 404);
        }
        return successResponse(res, role, 'Role retrieved');
    }),

    /**
     * Get available modules
     */
    getModules: asyncHandler(async (req, res) => {
        const grouped = req.query.grouped === 'true';

        if (grouped) {
            return successResponse(res, getModulesByCategory(), 'Modules retrieved');
        }
        return successResponse(res, AVAILABLE_MODULES, 'Modules retrieved');
    }),

    /**
     * Create new role
     */
    create: asyncHandler(async (req, res) => {
        const { name, description, allowed_modules } = req.body;

        if (!name) {
            return errorResponse(res, 'Role name is required', 400);
        }

        // Check for duplicate name
        const existing = await StaffRole.findByName(name);
        if (existing) {
            return errorResponse(res, 'Role with this name already exists', 409);
        }

        // Validate modules
        if (allowed_modules && !validateModules(allowed_modules)) {
            return errorResponse(res, 'Invalid module keys provided', 400);
        }

        const role = await StaffRole.create({
            name,
            description,
            allowed_modules: allowed_modules || []
        });

        return successResponse(res, role, 'Role created successfully', 201);
    }),

    /**
     * Update role
     */
    update: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { name, description, allowed_modules, is_active } = req.body;

        const existing = await StaffRole.findById(id);
        if (!existing) {
            return errorResponse(res, 'Role not found', 404);
        }

        // Check for duplicate name if changing
        if (name && name !== existing.name) {
            const duplicate = await StaffRole.findByName(name);
            if (duplicate) {
                return errorResponse(res, 'Role with this name already exists', 409);
            }
        }

        // Validate modules
        if (allowed_modules && !validateModules(allowed_modules)) {
            return errorResponse(res, 'Invalid module keys provided', 400);
        }

        const role = await StaffRole.update(id, {
            name,
            description,
            allowed_modules,
            is_active
        });

        return successResponse(res, role, 'Role updated successfully');
    }),

    /**
     * Delete role
     */
    delete: asyncHandler(async (req, res) => {
        const { id } = req.params;

        const existing = await StaffRole.findById(id);
        if (!existing) {
            return errorResponse(res, 'Role not found', 404);
        }

        if (existing.is_system) {
            return errorResponse(res, 'Cannot delete system role', 403);
        }

        try {
            await StaffRole.delete(id);
            return successResponse(res, null, 'Role deleted successfully');
        } catch (error) {
            return errorResponse(res, error.message, 400);
        }
    }),

    /**
     * Get staff count by role
     */
    getStaffCount: asyncHandler(async (req, res) => {
        const counts = await StaffRole.getStaffCountByRole();
        return successResponse(res, counts, 'Staff count retrieved');
    })
};

module.exports = StaffRoleController;
