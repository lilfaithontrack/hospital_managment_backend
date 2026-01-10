/**
 * Billing Routes
 */
const express = require('express');
const router = express.Router();
const BillingController = require('../controllers/billing.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', BillingController.getAllBills);
router.get('/billing-items', BillingController.getBillingItems);
router.get('/payments', BillingController.getPayments);
router.get('/:id', BillingController.getBillById);
router.post('/', authorize(['admin', 'accountant', 'receptionist']), BillingController.createBill);
router.put('/:id', authorize(['admin', 'accountant']), BillingController.updateBill);
router.post('/:id/items', authorize(['admin', 'accountant']), BillingController.addBillItem);
router.post('/payments', authorize(['admin', 'accountant', 'receptionist']), BillingController.recordPayment);

module.exports = router;
