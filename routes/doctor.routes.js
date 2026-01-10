/**
 * Doctor Routes
 */
const express = require('express');
const router = express.Router();
const DoctorController = require('../controllers/doctor.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', DoctorController.getAll);
router.get('/available', DoctorController.getAvailable);
router.get('/department/:deptId', DoctorController.getByDepartment);
router.get('/:id', DoctorController.getById);
router.post('/', authorize(['admin']), DoctorController.create);
router.put('/:id', authorize(['admin', 'doctor']), DoctorController.update);
router.delete('/:id', authorize(['admin']), DoctorController.delete);
router.get('/:id/appointments', DoctorController.getAppointments);
router.get('/:id/schedule', DoctorController.getSchedule);
router.put('/:id/availability', authorize(['admin', 'doctor']), DoctorController.updateAvailability);

module.exports = router;
