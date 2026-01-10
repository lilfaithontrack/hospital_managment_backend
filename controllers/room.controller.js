/**
 * Room Controller
 */
const Room = require('../models/room.model');
const Ward = require('../models/ward.model');
const Bed = require('../models/bed.model');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHandler');
const { asyncHandler } = require('../utils/errorHandler');

const RoomController = {
    // Rooms
    getAllRooms: asyncHandler(async (req, res) => {
        const result = await Room.findAll(req.query);
        return paginatedResponse(res, result, 'Rooms retrieved');
    }),

    getRoomById: asyncHandler(async (req, res) => {
        const room = await Room.findById(req.params.id);
        if (!room) return errorResponse(res, 'Room not found', 404);
        return successResponse(res, room, 'Room retrieved');
    }),

    createRoom: asyncHandler(async (req, res) => {
        const room = await Room.create(req.body);
        return successResponse(res, room, 'Room created', 201);
    }),

    updateRoom: asyncHandler(async (req, res) => {
        const room = await Room.update(req.params.id, req.body);
        return successResponse(res, room, 'Room updated');
    }),

    updateRoomStatus: asyncHandler(async (req, res) => {
        const room = await Room.updateStatus(req.params.id, req.body.status);
        return successResponse(res, room, 'Room status updated');
    }),

    getAvailableRooms: asyncHandler(async (req, res) => {
        const rooms = await Room.getAvailable(req.query.room_type);
        return successResponse(res, rooms, 'Available rooms retrieved');
    }),

    getOccupancyStats: asyncHandler(async (req, res) => {
        const stats = await Room.getOccupancyStats();
        return successResponse(res, stats, 'Occupancy stats retrieved');
    }),

    // Wards
    getAllWards: asyncHandler(async (req, res) => {
        const result = await Ward.findAll(req.query);
        return paginatedResponse(res, result, 'Wards retrieved');
    }),

    createWard: asyncHandler(async (req, res) => {
        const ward = await Ward.create(req.body);
        return successResponse(res, ward, 'Ward created', 201);
    }),

    // Beds
    getAllBeds: asyncHandler(async (req, res) => {
        const result = await Bed.findAll(req.query);
        return paginatedResponse(res, result, 'Beds retrieved');
    }),

    updateBedStatus: asyncHandler(async (req, res) => {
        const bed = await Bed.updateStatus(req.params.id, req.body.status);
        return successResponse(res, bed, 'Bed status updated');
    }),

    getAvailableBeds: asyncHandler(async (req, res) => {
        const beds = await Bed.getAvailable(req.query.ward_id);
        return successResponse(res, beds, 'Available beds retrieved');
    })
};

module.exports = RoomController;
