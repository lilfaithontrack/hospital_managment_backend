/**
 * Surgery Controller
 */
const Surgery = require('../models/surgery.model');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHandler');
const { asyncHandler } = require('../utils/errorHandler');

const SurgeryController = {
    getAll: asyncHandler(async (req, res) => {
        const result = await Surgery.findAll(req.query);
        return paginatedResponse(res, result, 'Surgeries retrieved');
    }),

    getById: asyncHandler(async (req, res) => {
        const surgery = await Surgery.findById(req.params.id);
        if (!surgery) return errorResponse(res, 'Surgery not found', 404);
        return successResponse(res, surgery, 'Surgery retrieved');
    }),

    create: asyncHandler(async (req, res) => {
        const surgery = await Surgery.create(req.body);
        return successResponse(res, surgery, 'Surgery scheduled', 201);
    }),

    update: asyncHandler(async (req, res) => {
        const surgery = await Surgery.update(req.params.id, req.body);
        return successResponse(res, surgery, 'Surgery updated');
    }),

    updateStatus: asyncHandler(async (req, res) => {
        const surgery = await Surgery.updateStatus(req.params.id, req.body.status);
        return successResponse(res, surgery, 'Surgery status updated');
    }),

    delete: asyncHandler(async (req, res) => {
        await Surgery.delete(req.params.id);
        return successResponse(res, null, 'Surgery cancelled');
    }),

    getByDate: asyncHandler(async (req, res) => {
        const surgeries = await Surgery.getByDate(req.params.date);
        return successResponse(res, surgeries, 'Surgeries retrieved');
    }),

    getOperatingRooms: asyncHandler(async (req, res) => {
        const rooms = await Surgery.getOperatingRooms();
        return successResponse(res, rooms, 'Operating rooms retrieved');
    })
};

module.exports = SurgeryController;
