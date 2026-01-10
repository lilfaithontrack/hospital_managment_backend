/**
 * Surgery Routes
 */
const express = require('express');
const router = express.Router();
const SurgeryController = require('../controllers/surgery.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', SurgeryController.getAll);
router.get('/operating-rooms', SurgeryController.getOperatingRooms);
router.get('/scheduled/:date', SurgeryController.getByDate);
router.get('/:id', SurgeryController.getById);
router.post('/', authorize(['admin', 'doctor']), SurgeryController.create);
router.put('/:id', authorize(['admin', 'doctor']), SurgeryController.update);
router.put('/:id/status', SurgeryController.updateStatus);
router.delete('/:id', authorize(['admin', 'doctor']), SurgeryController.delete);

module.exports = router;
