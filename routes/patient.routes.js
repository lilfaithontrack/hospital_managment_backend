/**
 * Patient Routes
 */
const express = require('express');
const router = express.Router();
const PatientController = require('../controllers/patient.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', PatientController.getAll);
router.get('/search', PatientController.search);
router.get('/stats', PatientController.getStats);
router.get('/:id', PatientController.getById);
router.post('/', PatientController.create);
router.put('/:id', PatientController.update);
router.delete('/:id', authorize(['admin']), PatientController.delete);
router.get('/:id/history', PatientController.getHistory);
router.get('/:id/appointments', PatientController.getAppointments);
router.get('/:id/bills', PatientController.getBills);

module.exports = router;
