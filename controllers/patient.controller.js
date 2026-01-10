/**
 * Patient Controller
 * Handles patient CRUD operations
 */

const Patient = require('../models/patient.model');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHandler');
const { asyncHandler } = require('../utils/errorHandler');

const PatientController = {
    /**
     * Get all patients
     */
    getAll: asyncHandler(async (req, res) => {
        const { page, limit, search, status, blood_group } = req.query;
        const result = await Patient.findAll({ page, limit, search, status, blood_group });
        return paginatedResponse(res, result, 'Patients retrieved successfully');
    }),

    /**
     * Get patient by ID
     */
    getById: asyncHandler(async (req, res) => {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return errorResponse(res, 'Patient not found', 404);
        }
        return successResponse(res, patient, 'Patient retrieved successfully');
    }),

    /**
     * Create new patient
     */
    create: asyncHandler(async (req, res) => {
        const patient = await Patient.create(req.body);
        return successResponse(res, patient, 'Patient created successfully', 201);
    }),

    /**
     * Update patient
     */
    update: asyncHandler(async (req, res) => {
        const existingPatient = await Patient.findById(req.params.id);
        if (!existingPatient) {
            return errorResponse(res, 'Patient not found', 404);
        }

        const patient = await Patient.update(req.params.id, req.body);
        return successResponse(res, patient, 'Patient updated successfully');
    }),

    /**
     * Delete patient
     */
    delete: asyncHandler(async (req, res) => {
        const existingPatient = await Patient.findById(req.params.id);
        if (!existingPatient) {
            return errorResponse(res, 'Patient not found', 404);
        }

        await Patient.delete(req.params.id);
        return successResponse(res, null, 'Patient deleted successfully');
    }),

    /**
     * Search patients
     */
    search: asyncHandler(async (req, res) => {
        const { q } = req.query;
        if (!q || q.length < 2) {
            return errorResponse(res, 'Search query must be at least 2 characters', 400);
        }

        const patients = await Patient.search(q);
        return successResponse(res, patients, 'Search results');
    }),

    /**
     * Get patient medical history
     */
    getHistory: asyncHandler(async (req, res) => {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return errorResponse(res, 'Patient not found', 404);
        }

        const history = await Patient.getHistory(req.params.id);
        return successResponse(res, history, 'Patient history retrieved');
    }),

    /**
     * Get patient appointments
     */
    getAppointments: asyncHandler(async (req, res) => {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return errorResponse(res, 'Patient not found', 404);
        }

        const { page, limit, status } = req.query;
        const appointments = await Patient.getAppointments(req.params.id, { page, limit, status });
        return paginatedResponse(res, appointments, 'Patient appointments retrieved');
    }),

    /**
     * Get patient bills
     */
    getBills: asyncHandler(async (req, res) => {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return errorResponse(res, 'Patient not found', 404);
        }

        const bills = await Patient.getBills(req.params.id);
        return successResponse(res, bills, 'Patient bills retrieved');
    }),

    /**
     * Get patient statistics
     */
    getStats: asyncHandler(async (req, res) => {
        const stats = await Patient.getCountByStatus();
        return successResponse(res, stats, 'Patient statistics retrieved');
    })
};

module.exports = PatientController;
