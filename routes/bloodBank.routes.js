/**
 * Blood Bank Routes
 */
const express = require('express');
const router = express.Router();
const BloodBankController = require('../controllers/bloodBank.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/inventory', BloodBankController.getInventory);
router.put('/inventory/:id', authorize(['admin']), BloodBankController.updateInventory);
router.get('/donations', BloodBankController.getDonations);
router.post('/donations', BloodBankController.recordDonation);
router.get('/requests', BloodBankController.getRequests);
router.post('/requests', authorize(['admin', 'doctor']), BloodBankController.createRequest);
router.put('/requests/:id/issue', BloodBankController.issueBlood);
router.get('/compatibility/:bloodGroup', BloodBankController.getCompatibility);

module.exports = router;
