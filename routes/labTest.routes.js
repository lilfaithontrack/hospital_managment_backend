/**
 * Lab Test Routes
 */
const express = require('express');
const router = express.Router();
const LabTestController = require('../controllers/labTest.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', LabTestController.getAll);
router.get('/catalog', LabTestController.getCatalog);
router.get('/pending', LabTestController.getPending);
router.get('/:id', LabTestController.getById);
router.post('/', authorize(['admin', 'doctor']), LabTestController.create);
router.put('/:id', LabTestController.update);
router.put('/:id/collect-sample', authorize(['admin', 'nurse', 'lab_technician']), LabTestController.collectSample);
router.put('/:id/results', authorize(['admin', 'lab_technician']), LabTestController.addResults);
router.put('/:id/verify', authorize(['admin', 'doctor', 'lab_technician']), LabTestController.verify);

module.exports = router;
