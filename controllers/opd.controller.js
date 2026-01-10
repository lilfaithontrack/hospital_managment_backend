/**
 * OPD Controller
 */
const OpdVisit = require('../models/opdVisit.model');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHandler');
const { asyncHandler } = require('../utils/errorHandler');

const OpdController = {
    getAll: asyncHandler(async (req, res) => {
        const result = await OpdVisit.findAll(req.query);
        return paginatedResponse(res, result, 'OPD visits retrieved');
    }),

    getById: asyncHandler(async (req, res) => {
        const visit = await OpdVisit.findById(req.params.id);
        if (!visit) return errorResponse(res, 'OPD visit not found', 404);
        return successResponse(res, visit, 'OPD visit retrieved');
    }),

    create: asyncHandler(async (req, res) => {
        const visit = await OpdVisit.create(req.body);
        return successResponse(res, visit, 'OPD visit created', 201);
    }),

    update: asyncHandler(async (req, res) => {
        const visit = await OpdVisit.update(req.params.id, req.body);
        return successResponse(res, visit, 'OPD visit updated');
    }),

    addPrescription: asyncHandler(async (req, res) => {
        const visit = await OpdVisit.addPrescription(req.params.id, req.body.prescription);
        return successResponse(res, visit, 'Prescription added');
    }),

    getToday: asyncHandler(async (req, res) => {
        const visits = await OpdVisit.getToday(req.query.doctor_id);
        return successResponse(res, visits, 'Today\'s visits retrieved');
    }),

    getQueue: asyncHandler(async (req, res) => {
        const { doctor_id } = req.query;
        if (!doctor_id) return errorResponse(res, 'doctor_id required', 400);
        const queue = await OpdVisit.getQueue(doctor_id);
        return successResponse(res, queue, 'Queue retrieved');
    })
};

module.exports = OpdController;
