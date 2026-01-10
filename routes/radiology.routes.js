/**
 * Radiology Routes
 */
const express = require('express');
const router = express.Router();
const RadiologyController = require('../controllers/radiology.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', RadiologyController.getAll);
router.get('/equipment', RadiologyController.getEquipment);
router.get('/stats', RadiologyController.getStats);
router.get('/:id', RadiologyController.getById);
router.post('/', authorize(['admin', 'doctor']), RadiologyController.create);
router.put('/:id', RadiologyController.update);
router.put('/:id/schedule', RadiologyController.schedule);
router.put('/:id/report', authorize(['admin', 'radiologist']), RadiologyController.addReport);

module.exports = router;
