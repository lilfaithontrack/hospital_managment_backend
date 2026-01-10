/**
 * OPD Routes
 */
const express = require('express');
const router = express.Router();
const OpdController = require('../controllers/opd.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', OpdController.getAll);
router.get('/today', OpdController.getToday);
router.get('/queue', OpdController.getQueue);
router.get('/:id', OpdController.getById);
router.post('/', OpdController.create);
router.put('/:id', OpdController.update);
router.put('/:id/prescription', OpdController.addPrescription);

module.exports = router;
