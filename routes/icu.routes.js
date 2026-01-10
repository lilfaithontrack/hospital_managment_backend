/**
 * ICU Routes
 */
const express = require('express');
const router = express.Router();
const IcuController = require('../controllers/icu.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', IcuController.getAll);
router.get('/beds', IcuController.getBeds);
router.get('/stats', IcuController.getStats);
router.get('/:id', IcuController.getById);
router.post('/', authorize(['admin', 'doctor', 'nurse']), IcuController.admit);
router.put('/:id', IcuController.update);
router.put('/:id/vitals', IcuController.updateVitals);
router.put('/:id/discharge', authorize(['admin', 'doctor']), IcuController.discharge);
router.get('/:id/vitals-history', IcuController.getVitalsHistory);

module.exports = router;
