/**
 * Room Routes
 */
const express = require('express');
const router = express.Router();
const RoomController = require('../controllers/room.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

// Rooms
router.get('/', RoomController.getAllRooms);
router.get('/available', RoomController.getAvailableRooms);
router.get('/occupancy-stats', RoomController.getOccupancyStats);
router.get('/:id', RoomController.getRoomById);
router.post('/', authorize(['admin']), RoomController.createRoom);
router.put('/:id', authorize(['admin']), RoomController.updateRoom);
router.put('/:id/status', RoomController.updateRoomStatus);

// Wards
router.get('/wards', RoomController.getAllWards);
router.post('/wards', authorize(['admin']), RoomController.createWard);

// Beds
router.get('/beds', RoomController.getAllBeds);
router.get('/beds/available', RoomController.getAvailableBeds);
router.put('/beds/:id/status', RoomController.updateBedStatus);

module.exports = router;
