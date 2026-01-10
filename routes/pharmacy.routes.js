/**
 * Pharmacy Routes
 */
const express = require('express');
const router = express.Router();
const PharmacyController = require('../controllers/pharmacy.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', PharmacyController.getAll);
router.get('/categories', PharmacyController.getCategories);
router.get('/low-stock', PharmacyController.getLowStock);
router.get('/expiring', PharmacyController.getExpiring);
router.get('/transactions', PharmacyController.getTransactions);
router.get('/:id', PharmacyController.getById);
router.post('/', authorize(['admin', 'pharmacist']), PharmacyController.create);
router.put('/:id', authorize(['admin', 'pharmacist']), PharmacyController.update);
router.put('/:id/stock', authorize(['admin', 'pharmacist']), PharmacyController.updateStock);
router.post('/dispense', authorize(['admin', 'pharmacist']), PharmacyController.dispense);

module.exports = router;
