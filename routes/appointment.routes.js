/**
 * Appointment Routes
 */
const express = require('express');
const router = express.Router();
const AppointmentController = require('../controllers/appointment.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', AppointmentController.getAll);
router.get('/today', AppointmentController.getToday);
router.get('/available-slots', AppointmentController.getAvailableSlots);
router.get('/stats', AppointmentController.getStats);
router.get('/date/:date', AppointmentController.getByDate);
router.get('/:id', AppointmentController.getById);
router.post('/', AppointmentController.create);
router.put('/:id', AppointmentController.update);
router.put('/:id/status', AppointmentController.updateStatus);
router.delete('/:id', AppointmentController.delete);

module.exports = router;
