/**
 * Billing Controller
 */
const Billing = require('../models/billing.model');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHandler');
const { asyncHandler } = require('../utils/errorHandler');

const BillingController = {
    getAllBills: asyncHandler(async (req, res) => {
        const result = await Billing.findAllBills(req.query);
        return paginatedResponse(res, result, 'Bills retrieved');
    }),

    getBillById: asyncHandler(async (req, res) => {
        const bill = await Billing.findBillById(req.params.id);
        if (!bill) return errorResponse(res, 'Bill not found', 404);
        return successResponse(res, bill, 'Bill retrieved');
    }),

    createBill: asyncHandler(async (req, res) => {
        const bill = await Billing.createBill({ ...req.body, created_by: req.userId });
        return successResponse(res, bill, 'Bill created', 201);
    }),

    updateBill: asyncHandler(async (req, res) => {
        const bill = await Billing.updateBill(req.params.id, req.body);
        return successResponse(res, bill, 'Bill updated');
    }),

    addBillItem: asyncHandler(async (req, res) => {
        const bill = await Billing.addBillItem(req.params.id, req.body);
        return successResponse(res, bill, 'Item added to bill');
    }),

    recordPayment: asyncHandler(async (req, res) => {
        const payment = await Billing.recordPayment({ ...req.body, created_by: req.userId });
        return successResponse(res, payment, 'Payment recorded', 201);
    }),

    getPayments: asyncHandler(async (req, res) => {
        const payments = await Billing.getPayments(req.query);
        return successResponse(res, payments, 'Payments retrieved');
    }),

    getBillingItems: asyncHandler(async (req, res) => {
        const items = await Billing.getBillingItems();
        return successResponse(res, items, 'Billing items retrieved');
    })
};

module.exports = BillingController;
