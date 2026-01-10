/**
 * ICU Controller
 */
const IcuPatient = require('../models/icuPatient.model');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHandler');
const { asyncHandler } = require('../utils/errorHandler');

const IcuController = {
    getAll: asyncHandler(async (req, res) => {
        const result = await IcuPatient.findAll(req.query);
        return paginatedResponse(res, result, 'ICU patients retrieved');
    }),

    getById: asyncHandler(async (req, res) => {
        const patient = await IcuPatient.findById(req.params.id);
        if (!patient) return errorResponse(res, 'ICU patient not found', 404);
        return successResponse(res, patient, 'ICU patient retrieved');
    }),

    admit: asyncHandler(async (req, res) => {
        const patient = await IcuPatient.create(req.body);
        return successResponse(res, patient, 'Patient admitted to ICU', 201);
    }),

    update: asyncHandler(async (req, res) => {
        const patient = await IcuPatient.update(req.params.id, req.body);
        return successResponse(res, patient, 'ICU patient updated');
    }),

    updateVitals: asyncHandler(async (req, res) => {
        const patient = await IcuPatient.updateVitals(req.params.id, req.body, req.userId);
        return successResponse(res, patient, 'Vitals updated');
    }),

    discharge: asyncHandler(async (req, res) => {
        const patient = await IcuPatient.discharge(req.params.id, req.body);
        return successResponse(res, patient, 'Patient discharged from ICU');
    }),

    getBeds: asyncHandler(async (req, res) => {
        const beds = await IcuPatient.getBeds();
        return successResponse(res, beds, 'ICU beds retrieved');
    }),

    getVitalsHistory: asyncHandler(async (req, res) => {
        const vitals = await IcuPatient.getVitalsHistory(req.params.id, parseInt(req.query.limit) || 24);
        return successResponse(res, vitals, 'Vitals history retrieved');
    }),

    getStats: asyncHandler(async (req, res) => {
        const stats = await IcuPatient.getStats();
        return successResponse(res, stats, 'ICU stats retrieved');
    })
};

module.exports = IcuController;
