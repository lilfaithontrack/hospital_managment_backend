/**
 * Doctor Controller
 * Handles doctor management and scheduling
 */

const Doctor = require('../models/doctor.model');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHandler');
const { asyncHandler } = require('../utils/errorHandler');

const DoctorController = {
    getAll: asyncHandler(async (req, res) => {
        const { page, limit, search, status, department_id, specialization } = req.query;
        const result = await Doctor.findAll({ page, limit, search, status, department_id, specialization });
        return paginatedResponse(res, result, 'Doctors retrieved successfully');
    }),

    getById: asyncHandler(async (req, res) => {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) {
            return errorResponse(res, 'Doctor not found', 404);
        }
        return successResponse(res, doctor, 'Doctor retrieved successfully');
    }),

    create: asyncHandler(async (req, res) => {
        const doctor = await Doctor.create(req.body);
        return successResponse(res, doctor, 'Doctor created successfully', 201);
    }),

    update: asyncHandler(async (req, res) => {
        const existing = await Doctor.findById(req.params.id);
        if (!existing) {
            return errorResponse(res, 'Doctor not found', 404);
        }
        const doctor = await Doctor.update(req.params.id, req.body);
        return successResponse(res, doctor, 'Doctor updated successfully');
    }),

    delete: asyncHandler(async (req, res) => {
        const existing = await Doctor.findById(req.params.id);
        if (!existing) {
            return errorResponse(res, 'Doctor not found', 404);
        }
        await Doctor.delete(req.params.id);
        return successResponse(res, null, 'Doctor deleted successfully');
    }),

    getAppointments: asyncHandler(async (req, res) => {
        const { page, limit, date, status } = req.query;
        const appointments = await Doctor.getAppointments(req.params.id, { page, limit, date, status });
        return paginatedResponse(res, appointments, 'Doctor appointments retrieved');
    }),

    getSchedule: asyncHandler(async (req, res) => {
        const { date } = req.query;
        if (!date) {
            return errorResponse(res, 'Date parameter required', 400);
        }
        const schedule = await Doctor.getSchedule(req.params.id, date);
        return successResponse(res, schedule, 'Doctor schedule retrieved');
    }),

    updateAvailability: asyncHandler(async (req, res) => {
        const doctor = await Doctor.updateAvailability(req.params.id, req.body);
        return successResponse(res, doctor, 'Availability updated successfully');
    }),

    getByDepartment: asyncHandler(async (req, res) => {
        const doctors = await Doctor.getByDepartment(req.params.deptId);
        return successResponse(res, doctors, 'Doctors retrieved');
    }),

    getAvailable: asyncHandler(async (req, res) => {
        const { date, department_id } = req.query;
        if (!date) {
            return errorResponse(res, 'Date parameter required', 400);
        }
        const doctors = await Doctor.getAvailable(date, department_id);
        return successResponse(res, doctors, 'Available doctors retrieved');
    })
};

module.exports = DoctorController;
