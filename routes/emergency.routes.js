/**
 * Emergency Routes
 */
const express = require('express');
const router = express.Router();
const EmergencyController = require('../controllers/emergency.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', EmergencyController.getAll);
router.get('/active', EmergencyController.getActive);
router.get('/stats', EmergencyController.getStats);
router.get('/:id', EmergencyController.getById);
router.post('/', EmergencyController.create);
router.put('/:id', EmergencyController.update);

module.exports = router;
