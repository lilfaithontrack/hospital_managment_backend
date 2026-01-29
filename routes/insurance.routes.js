/**
 * Insurance Routes
 */
const express = require('express');
const router = express.Router();
const InsuranceController = require('../controllers/insurance.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { uploadMultiple } = require('../middleware/upload.middleware');

router.use(authenticate);

// --- Providers ---
router.get('/providers', InsuranceController.getAllProviders);
router.post('/providers', authorize(['admin', 'accountant']), InsuranceController.createProvider);
router.put('/providers/:id', authorize(['admin']), InsuranceController.updateProvider);
router.delete('/providers/:id', authorize(['admin']), InsuranceController.deleteProvider);

// --- Claims ---
router.get('/claims', InsuranceController.getClaims);

// Accountant creates claim (Payment with Insurance) + Uploads Docs
// Expects 'documents' field in form-data
router.post('/claims', authorize(['admin', 'accountant']), uploadMultiple('documents', 5, 'document'), InsuranceController.createClaim);

// Admin approves/rejects claim
router.put('/claims/:id/status', authorize(['admin']), InsuranceController.updateClaimStatus);

module.exports = router;
