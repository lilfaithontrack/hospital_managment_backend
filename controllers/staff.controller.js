/**
 * Staff Controller
 */

const Staff = require('../models/staff.model');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHandler');
const { asyncHandler } = require('../utils/errorHandler');

const StaffController = {
    getAll: asyncHandler(async (req, res) => {
        const { page, limit, search, status, role, department_id, shift } = req.query;
        const result = await Staff.findAll({ page, limit, search, status, role, department_id, shift });
        return paginatedResponse(res, result, 'Staff retrieved successfully');
    }),

    getById: asyncHandler(async (req, res) => {
        const staff = await Staff.findById(req.params.id);
        if (!staff) return errorResponse(res, 'Staff not found', 404);
        return successResponse(res, staff, 'Staff retrieved');
    }),

    create: asyncHandler(async (req, res) => {
        const staff = await Staff.create(req.body);
        return successResponse(res, staff, 'Staff created successfully', 201);
    }),

    update: asyncHandler(async (req, res) => {
        const existing = await Staff.findById(req.params.id);
        if (!existing) return errorResponse(res, 'Staff not found', 404);
        const staff = await Staff.update(req.params.id, req.body);
        return successResponse(res, staff, 'Staff updated');
    }),

    delete: asyncHandler(async (req, res) => {
        const existing = await Staff.findById(req.params.id);
        if (!existing) return errorResponse(res, 'Staff not found', 404);
        await Staff.delete(req.params.id);
        return successResponse(res, null, 'Staff deleted');
    }),

    getShifts: asyncHandler(async (req, res) => {
        const { startDate, endDate, page, limit } = req.query;
        const shifts = await Staff.getShifts(req.params.id, { startDate, endDate, page, limit });
        return paginatedResponse(res, shifts, 'Staff shifts retrieved');
    }),

    getByDepartment: asyncHandler(async (req, res) => {
        const staff = await Staff.getByDepartment(req.params.deptId);
        return successResponse(res, staff, 'Staff retrieved');
    }),

    getByRole: asyncHandler(async (req, res) => {
        const staff = await Staff.getByRole(req.params.role);
        return successResponse(res, staff, 'Staff retrieved');
    }),

    getNurses: asyncHandler(async (req, res) => {
        const nurses = await Staff.getNurses();
        return successResponse(res, nurses, 'Nurses retrieved');
    })
};

module.exports = StaffController;
