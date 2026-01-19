/**
 * Staff Role Routes
 * Admin-only routes for managing staff roles
 */

const express = require('express');
const router = express.Router();
const StaffRoleController = require('../controllers/staffRole.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');

// Validation rules
const createValidation = [
    body('name').notEmpty().withMessage('Role name is required').trim(),
    body('description').optional().trim(),
    body('allowed_modules').isArray().withMessage('allowed_modules must be an array'),
    validate
];

const updateValidation = [
    body('name').optional().trim(),
    body('description').optional().trim(),
    body('allowed_modules').optional().isArray().withMessage('allowed_modules must be an array'),
    body('is_active').optional().isBoolean(),
    validate
];

// Public route - get active roles for login dropdown
router.get('/active', StaffRoleController.getActiveRoles);

// All other routes require authentication and admin role
router.use(authenticate);
router.use(authorize(['admin']));

// Get available modules
router.get('/modules', StaffRoleController.getModules);

// Get staff count by role
router.get('/staff-count', StaffRoleController.getStaffCount);

// CRUD routes
router.get('/', StaffRoleController.getAll);
router.get('/:id', StaffRoleController.getById);
router.post('/', createValidation, StaffRoleController.create);
router.put('/:id', updateValidation, StaffRoleController.update);
router.delete('/:id', StaffRoleController.delete);

module.exports = router;
