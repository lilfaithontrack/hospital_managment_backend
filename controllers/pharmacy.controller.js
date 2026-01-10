/**
 * Pharmacy Controller
 */
const Pharmacy = require('../models/pharmacy.model');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHandler');
const { asyncHandler } = require('../utils/errorHandler');

const PharmacyController = {
    getAll: asyncHandler(async (req, res) => {
        const result = await Pharmacy.findAll(req.query);
        return paginatedResponse(res, result, 'Pharmacy items retrieved');
    }),

    getById: asyncHandler(async (req, res) => {
        const item = await Pharmacy.findById(req.params.id);
        if (!item) return errorResponse(res, 'Item not found', 404);
        return successResponse(res, item, 'Item retrieved');
    }),

    create: asyncHandler(async (req, res) => {
        const item = await Pharmacy.create(req.body);
        return successResponse(res, item, 'Item created', 201);
    }),

    update: asyncHandler(async (req, res) => {
        const item = await Pharmacy.update(req.params.id, req.body);
        return successResponse(res, item, 'Item updated');
    }),

    updateStock: asyncHandler(async (req, res) => {
        const item = await Pharmacy.updateStock(req.params.id, req.body.quantity, req.body.operation || 'add');
        return successResponse(res, item, 'Stock updated');
    }),

    dispense: asyncHandler(async (req, res) => {
        const transaction = await Pharmacy.dispense({ ...req.body, created_by: req.userId });
        return successResponse(res, transaction, 'Medication dispensed', 201);
    }),

    getLowStock: asyncHandler(async (req, res) => {
        const items = await Pharmacy.getLowStock();
        return successResponse(res, items, 'Low stock items retrieved');
    }),

    getExpiring: asyncHandler(async (req, res) => {
        const items = await Pharmacy.getExpiring(parseInt(req.query.days) || 30);
        return successResponse(res, items, 'Expiring items retrieved');
    }),

    getTransactions: asyncHandler(async (req, res) => {
        const transactions = await Pharmacy.getTransactions(req.query);
        return successResponse(res, transactions, 'Transactions retrieved');
    }),

    getCategories: asyncHandler(async (req, res) => {
        const categories = await Pharmacy.getCategories();
        return successResponse(res, categories, 'Categories retrieved');
    })
};

module.exports = PharmacyController;
