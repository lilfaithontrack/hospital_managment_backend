/**
 * Blood Bank Controller
 */
const BloodBank = require('../models/bloodBank.model');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHandler');
const { asyncHandler } = require('../utils/errorHandler');

const BloodBankController = {
    getInventory: asyncHandler(async (req, res) => {
        const inventory = await BloodBank.getInventory();
        return successResponse(res, inventory, 'Blood inventory retrieved');
    }),

    updateInventory: asyncHandler(async (req, res) => {
        const item = await BloodBank.updateInventory(req.params.id, req.body);
        return successResponse(res, item, 'Inventory updated');
    }),

    getDonations: asyncHandler(async (req, res) => {
        const result = await BloodBank.getDonations(req.query);
        return paginatedResponse(res, result, 'Donations retrieved');
    }),

    recordDonation: asyncHandler(async (req, res) => {
        const donation = await BloodBank.recordDonation(req.body);
        return successResponse(res, donation, 'Donation recorded', 201);
    }),

    getRequests: asyncHandler(async (req, res) => {
        const result = await BloodBank.getRequests(req.query);
        return paginatedResponse(res, result, 'Blood requests retrieved');
    }),

    createRequest: asyncHandler(async (req, res) => {
        const request = await BloodBank.createRequest(req.body);
        return successResponse(res, request, 'Blood request created', 201);
    }),

    issueBlood: asyncHandler(async (req, res) => {
        const request = await BloodBank.issueBlood(req.params.id, req.body.units_issued, req.userId);
        return successResponse(res, request, 'Blood issued');
    }),

    getCompatibility: asyncHandler(async (req, res) => {
        const compatible = BloodBank.getCompatibility(req.params.bloodGroup);
        return successResponse(res, compatible, 'Compatible blood groups');
    })
};

module.exports = BloodBankController;
