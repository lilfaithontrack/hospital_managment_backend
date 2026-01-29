const express = require('express');
const router = express.Router();
const ICTController = require('../controllers/ict.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

// Assets
router.get('/assets', ICTController.getAssets);
router.post('/assets', ICTController.createAsset);
router.put('/assets/:id', ICTController.updateAsset);
router.delete('/assets/:id', ICTController.deleteAsset);

// Tickets
router.get('/tickets', ICTController.getTickets);
router.post('/tickets', ICTController.createTicket);
router.put('/tickets/:id', ICTController.updateTicket);
router.delete('/tickets/:id', ICTController.deleteTicket);

module.exports = router;
