const express = require('express');
const router = express.Router();
const SecurityController = require('../controllers/security.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { uploadMultiple } = require('../middleware/upload.middleware');

router.use(authenticate);

// Cameras
router.get('/cameras', SecurityController.getCameras);
router.post('/cameras', SecurityController.createCamera);

// Visitors
router.get('/visitors', SecurityController.getVisitors);
router.post('/visitors', SecurityController.checkInVisitor);
router.put('/visitors/:id/checkout', SecurityController.checkOutVisitor);

// Incidents
router.get('/incidents', SecurityController.getIncidents);
router.post('/incidents', uploadMultiple('evidence', 5), SecurityController.createIncident);

module.exports = router;
