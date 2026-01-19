/**
 * Auth Routes
 */
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');

// Validation rules
const registerValidation = [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['admin', 'doctor', 'nurse', 'receptionist', 'pharmacist', 'lab_technician', 'radiologist', 'accountant']),
    validate
];

const loginValidation = [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
    validate
];

// Public routes
router.post('/register', registerValidation, AuthController.register);
router.post('/login', loginValidation, AuthController.login);
router.post('/staff/login', loginValidation, AuthController.staffLogin);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

// Protected routes
router.use(authenticate);
router.post('/logout', AuthController.logout);
router.post('/refresh-token', AuthController.refreshToken);
router.get('/me', AuthController.getCurrentUser);
router.put('/change-password', AuthController.changePassword);

// Admin only - create staff account
const { authorize } = require('../middleware/auth.middleware');
const createStaffValidation = [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').notEmpty().withMessage('Name is required'),
    body('role_id').notEmpty().withMessage('Role is required'),
    validate
];
router.post('/staff/create-account', authorize(['admin']), createStaffValidation, AuthController.createStaffAccount);

module.exports = router;

