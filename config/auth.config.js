require('dotenv').config();

module.exports = {
    secret: process.env.JWT_SECRET || 'mms_default_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'mms_refresh_secret_key',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

    // Role definitions
    roles: {
        ADMIN: 'admin',
        DOCTOR: 'doctor',
        NURSE: 'nurse',
        RECEPTIONIST: 'receptionist',
        PHARMACIST: 'pharmacist',
        LAB_TECHNICIAN: 'lab_technician',
        RADIOLOGIST: 'radiologist',
        ACCOUNTANT: 'accountant'
    },

    // Role permissions mapping
    permissions: {
        admin: ['*'], // Full access
        doctor: [
            'patients:read', 'patients:write',
            'appointments:read', 'appointments:write',
            'emergency:read', 'emergency:write',
            'surgery:read', 'surgery:write',
            'icu:read', 'icu:write',
            'opd:read', 'opd:write',
            'ipd:read', 'ipd:write',
            'radiology:read', 'radiology:write',
            'lab-tests:read', 'lab-tests:write',
            'blood-bank:read', 'blood-bank:request',
            'diet-plans:read', 'diet-plans:write',
            'discharge:read', 'discharge:write',
            'feedback:read'
        ],
        nurse: [
            'patients:read', 'patients:write',
            'appointments:read',
            'emergency:read', 'emergency:write',
            'icu:read', 'icu:write',
            'opd:read',
            'ipd:read', 'ipd:write',
            'vitals:write',
            'diet-plans:read',
            'shifts:read'
        ],
        receptionist: [
            'patients:read', 'patients:write',
            'appointments:read', 'appointments:write',
            'doctors:read',
            'rooms:read',
            'bills:read',
            'feedback:read', 'feedback:write'
        ],
        pharmacist: [
            'patients:read',
            'pharmacy:read', 'pharmacy:write',
            'prescriptions:read'
        ],
        lab_technician: [
            'patients:read',
            'lab-tests:read', 'lab-tests:write'
        ],
        radiologist: [
            'patients:read',
            'radiology:read', 'radiology:write'
        ],
        accountant: [
            'patients:read',
            'bills:read', 'bills:write',
            'payments:read', 'payments:write',
            'insurance:read', 'insurance:write',
            'reports:read', 'reports:financial'
        ]
    }
};
