/**
 * Emergency Controller
 */
const Emergency = require('../models/emergency.model');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHandler');
const { asyncHandler } = require('../utils/errorHandler');

const EmergencyController = {
    getAll: asyncHandler(async (req, res) => {
        const result = await Emergency.findAll(req.query);
        return paginatedResponse(res, result, 'Emergency cases retrieved');
    }),

    getById: asyncHandler(async (req, res) => {
        const emergency = await Emergency.findById(req.params.id);
        if (!emergency) return errorResponse(res, 'Case not found', 404);
        return successResponse(res, emergency, 'Emergency case retrieved');
    }),

    create: asyncHandler(async (req, res) => {
        const emergency = await Emergency.create(req.body);
        return successResponse(res, emergency, 'Emergency case created', 201);
    }),

    update: asyncHandler(async (req, res) => {
        const emergency = await Emergency.update(req.params.id, req.body);
        return successResponse(res, emergency, 'Emergency case updated');
    }),

    getActive: asyncHandler(async (req, res) => {
        const cases = await Emergency.getActive();
        return successResponse(res, cases, 'Active cases retrieved');
    }),

    getStats: asyncHandler(async (req, res) => {
        const stats = await Emergency.getStats();
        return successResponse(res, stats, 'Emergency stats retrieved');
    })
};

module.exports = EmergencyController;
