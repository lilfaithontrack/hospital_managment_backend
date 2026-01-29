/**
 * Route Index
 * Aggregates all routes
 */

const express = require('express');
const router = express.Router();

// Import routes
const authRoutes = require('./auth.routes');
const patientRoutes = require('./patient.routes');
const doctorRoutes = require('./doctor.routes');
const staffRoutes = require('./staff.routes');
const appointmentRoutes = require('./appointment.routes');
const emergencyRoutes = require('./emergency.routes');
const surgeryRoutes = require('./surgery.routes');
const icuRoutes = require('./icu.routes');
const opdRoutes = require('./opd.routes');
const ipdRoutes = require('./ipd.routes');
const labTestRoutes = require('./labTest.routes');
const radiologyRoutes = require('./radiology.routes');
const bloodBankRoutes = require('./bloodBank.routes');
const pharmacyRoutes = require('./pharmacy.routes');
const billingRoutes = require('./billing.routes');
const roomRoutes = require('./room.routes');
const staffRoleRoutes = require('./staffRole.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/doctors', doctorRoutes);
router.use('/staff', staffRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/emergency', emergencyRoutes);
router.use('/surgeries', surgeryRoutes);
router.use('/icu', icuRoutes);
router.use('/opd', opdRoutes);
router.use('/ipd', ipdRoutes);
router.use('/lab-tests', labTestRoutes);
router.use('/radiology', radiologyRoutes);
router.use('/blood-bank', bloodBankRoutes);
router.use('/pharmacy', pharmacyRoutes);
router.use('/bills', billingRoutes);
router.use('/rooms', roomRoutes);
router.use('/staff-roles', staffRoleRoutes);
router.use('/insurance', require('./insurance.routes'));
router.use('/ict', require('./ict.routes'));
router.use('/security', require('./security.routes'));

// API info endpoint
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Medical Management System API v1.0',
        author: 'Michu Tech',
        endpoints: {
            auth: '/api/auth',
            patients: '/api/patients',
            doctors: '/api/doctors',
            staff: '/api/staff',
            staffRoles: '/api/staff-roles',
            appointments: '/api/appointments',
            emergency: '/api/emergency',
            surgeries: '/api/surgeries',
            icu: '/api/icu',
            opd: '/api/opd',
            ipd: '/api/ipd',
            labTests: '/api/lab-tests',
            radiology: '/api/radiology',
            bloodBank: '/api/blood-bank',
            pharmacy: '/api/pharmacy',
            billing: '/api/bills',
            rooms: '/api/rooms'
        }
    });
});

module.exports = router;
