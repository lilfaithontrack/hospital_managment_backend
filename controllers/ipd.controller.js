/**
 * IPD Controller
 */
const IpdAdmission = require('../models/ipdAdmission.model');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHandler');
const { asyncHandler } = require('../utils/errorHandler');

const IpdController = {
    getAll: asyncHandler(async (req, res) => {
        const result = await IpdAdmission.findAll(req.query);
        return paginatedResponse(res, result, 'IPD admissions retrieved');
    }),

    getById: asyncHandler(async (req, res) => {
        const admission = await IpdAdmission.findById(req.params.id);
        if (!admission) return errorResponse(res, 'Admission not found', 404);
        return successResponse(res, admission, 'Admission retrieved');
    }),

    create: asyncHandler(async (req, res) => {
        const admission = await IpdAdmission.create(req.body);
        return successResponse(res, admission, 'Patient admitted', 201);
    }),

    update: asyncHandler(async (req, res) => {
        const admission = await IpdAdmission.update(req.params.id, req.body);
        return successResponse(res, admission, 'Admission updated');
    }),

    bedTransfer: asyncHandler(async (req, res) => {
        const admission = await IpdAdmission.bedTransfer(req.params.id, req.body.bed_id);
        return successResponse(res, admission, 'Bed transferred');
    }),

    discharge: asyncHandler(async (req, res) => {
        const admission = await IpdAdmission.discharge(req.params.id, req.body);
        return successResponse(res, admission, 'Patient discharged');
    }),

    getActive: asyncHandler(async (req, res) => {
        const admissions = await IpdAdmission.getActive();
        return successResponse(res, admissions, 'Active admissions retrieved');
    }),

    getAvailableBeds: asyncHandler(async (req, res) => {
        const beds = await IpdAdmission.getAvailableBeds();
        return successResponse(res, beds, 'Available beds retrieved');
    })
};

module.exports = IpdController;
