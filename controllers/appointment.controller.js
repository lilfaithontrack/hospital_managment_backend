/**
 * Appointment Controller
 */

const Appointment = require('../models/appointment.model');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHandler');
const { asyncHandler } = require('../utils/errorHandler');

const AppointmentController = {
    getAll: asyncHandler(async (req, res) => {
        const { page, limit, search, status, date, doctor_id, patient_id, type } = req.query;
        const result = await Appointment.findAll({ page, limit, search, status, date, doctor_id, patient_id, type });
        return paginatedResponse(res, result, 'Appointments retrieved');
    }),

    getById: asyncHandler(async (req, res) => {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return errorResponse(res, 'Appointment not found', 404);
        return successResponse(res, appointment, 'Appointment retrieved');
    }),

    create: asyncHandler(async (req, res) => {
        const appointment = await Appointment.create({ ...req.body, created_by: req.userId });
        return successResponse(res, appointment, 'Appointment created', 201);
    }),

    update: asyncHandler(async (req, res) => {
        const existing = await Appointment.findById(req.params.id);
        if (!existing) return errorResponse(res, 'Appointment not found', 404);
        const appointment = await Appointment.update(req.params.id, req.body);
        return successResponse(res, appointment, 'Appointment updated');
    }),

    delete: asyncHandler(async (req, res) => {
        const existing = await Appointment.findById(req.params.id);
        if (!existing) return errorResponse(res, 'Appointment not found', 404);
        await Appointment.delete(req.params.id);
        return successResponse(res, null, 'Appointment cancelled');
    }),

    updateStatus: asyncHandler(async (req, res) => {
        const { status } = req.body;
        const appointment = await Appointment.updateStatus(req.params.id, status);
        return successResponse(res, appointment, 'Status updated');
    }),

    getByDate: asyncHandler(async (req, res) => {
        const appointments = await Appointment.getByDate(req.params.date);
        return successResponse(res, appointments, 'Appointments retrieved');
    }),

    getAvailableSlots: asyncHandler(async (req, res) => {
        const { doctor_id, date, duration } = req.query;
        if (!doctor_id || !date) {
            return errorResponse(res, 'doctor_id and date required', 400);
        }
        const slots = await Appointment.getAvailableSlots(doctor_id, date, parseInt(duration) || 30);
        return successResponse(res, slots, 'Available slots retrieved');
    }),

    getToday: asyncHandler(async (req, res) => {
        const appointments = await Appointment.getToday();
        return successResponse(res, appointments, 'Today\'s appointments retrieved');
    }),

    getStats: asyncHandler(async (req, res) => {
        const { startDate, endDate } = req.query;
        const stats = await Appointment.getStats(startDate, endDate);
        return successResponse(res, stats, 'Appointment statistics retrieved');
    })
};

module.exports = AppointmentController;
