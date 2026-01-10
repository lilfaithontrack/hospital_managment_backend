/**
 * IPD Routes
 */
const express = require('express');
const router = express.Router();
const IpdController = require('../controllers/ipd.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', IpdController.getAll);
router.get('/active', IpdController.getActive);
router.get('/beds/available', IpdController.getAvailableBeds);
router.get('/:id', IpdController.getById);
router.post('/', IpdController.create);
router.put('/:id', IpdController.update);
router.put('/:id/bed-transfer', IpdController.bedTransfer);
router.put('/:id/discharge', authorize(['admin', 'doctor']), IpdController.discharge);

module.exports = router;
