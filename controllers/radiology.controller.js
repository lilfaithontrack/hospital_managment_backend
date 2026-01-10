/**
 * Radiology Controller
 */
const RadiologyOrder = require('../models/radiologyOrder.model');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHandler');
const { asyncHandler } = require('../utils/errorHandler');

const RadiologyController = {
    getAll: asyncHandler(async (req, res) => {
        const result = await RadiologyOrder.findAll(req.query);
        return paginatedResponse(res, result, 'Radiology orders retrieved');
    }),

    getById: asyncHandler(async (req, res) => {
        const order = await RadiologyOrder.findById(req.params.id);
        if (!order) return errorResponse(res, 'Order not found', 404);
        return successResponse(res, order, 'Order retrieved');
    }),

    create: asyncHandler(async (req, res) => {
        const order = await RadiologyOrder.create(req.body);
        return successResponse(res, order, 'Order created', 201);
    }),

    update: asyncHandler(async (req, res) => {
        const order = await RadiologyOrder.update(req.params.id, req.body);
        return successResponse(res, order, 'Order updated');
    }),

    schedule: asyncHandler(async (req, res) => {
        const order = await RadiologyOrder.schedule(req.params.id, req.body.scheduled_date, req.body.scheduled_time, req.body.equipment_id);
        return successResponse(res, order, 'Exam scheduled');
    }),

    addReport: asyncHandler(async (req, res) => {
        const order = await RadiologyOrder.addReport(req.params.id, { ...req.body, radiologist_id: req.userId });
        return successResponse(res, order, 'Report added');
    }),

    getEquipment: asyncHandler(async (req, res) => {
        const equipment = await RadiologyOrder.getEquipment();
        return successResponse(res, equipment, 'Equipment retrieved');
    }),

    getStats: asyncHandler(async (req, res) => {
        const stats = await RadiologyOrder.getStats();
        return successResponse(res, stats, 'Stats retrieved');
    })
};

module.exports = RadiologyController;
