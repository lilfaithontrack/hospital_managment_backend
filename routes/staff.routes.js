/**
 * Staff Routes
 */
const express = require('express');
const router = express.Router();
const StaffController = require('../controllers/staff.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', StaffController.getAll);
router.get('/nurses', StaffController.getNurses);
router.get('/department/:deptId', StaffController.getByDepartment);
router.get('/role/:role', StaffController.getByRole);
router.get('/:id', StaffController.getById);
router.post('/', authorize(['admin']), StaffController.create);
router.put('/:id', authorize(['admin']), StaffController.update);
router.delete('/:id', authorize(['admin']), StaffController.delete);
router.get('/:id/shifts', StaffController.getShifts);

module.exports = router;
