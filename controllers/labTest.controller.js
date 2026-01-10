/**
 * Lab Test Controller
 */
const LabTest = require('../models/labTest.model');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHandler');
const { asyncHandler } = require('../utils/errorHandler');

const LabTestController = {
    getAll: asyncHandler(async (req, res) => {
        const result = await LabTest.findAll(req.query);
        return paginatedResponse(res, result, 'Lab tests retrieved');
    }),

    getById: asyncHandler(async (req, res) => {
        const test = await LabTest.findById(req.params.id);
        if (!test) return errorResponse(res, 'Lab test not found', 404);
        return successResponse(res, test, 'Lab test retrieved');
    }),

    create: asyncHandler(async (req, res) => {
        const test = await LabTest.create(req.body);
        return successResponse(res, test, 'Lab test ordered', 201);
    }),

    update: asyncHandler(async (req, res) => {
        const test = await LabTest.update(req.params.id, req.body);
        return successResponse(res, test, 'Lab test updated');
    }),

    collectSample: asyncHandler(async (req, res) => {
        const test = await LabTest.collectSample(req.params.id, req.userId);
        return successResponse(res, test, 'Sample collected');
    }),

    addResults: asyncHandler(async (req, res) => {
        const test = await LabTest.addResults(req.params.id, req.body.results, req.body.result_text);
        return successResponse(res, test, 'Results added');
    }),

    verify: asyncHandler(async (req, res) => {
        const test = await LabTest.verify(req.params.id, req.userId);
        return successResponse(res, test, 'Results verified');
    }),

    getCatalog: asyncHandler(async (req, res) => {
        const catalog = await LabTest.getCatalog();
        return successResponse(res, catalog, 'Test catalog retrieved');
    }),

    getPending: asyncHandler(async (req, res) => {
        const tests = await LabTest.getPending();
        return successResponse(res, tests, 'Pending tests retrieved');
    })
};

module.exports = LabTestController;
