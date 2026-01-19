/**
 * Available Modules Configuration
 * Central definition of all modules that can be assigned to roles
 */

const AVAILABLE_MODULES = [
    // Patient Care
    { key: 'dashboard', label: 'Dashboard', category: 'Main', icon: 'LayoutDashboard' },
    { key: 'patients', label: 'Patients', category: 'Patient Care', icon: 'Users' },
    { key: 'appointments', label: 'Appointments', category: 'Patient Care', icon: 'Calendar' },
    { key: 'opd', label: 'OPD', category: 'Patient Care', icon: 'Stethoscope' },
    { key: 'ipd', label: 'IPD', category: 'Patient Care', icon: 'BedDouble' },
    { key: 'admissions', label: 'Admissions', category: 'Patient Care', icon: 'UserPlus' },
    { key: 'discharge', label: 'Discharge', category: 'Patient Care', icon: 'LogOut' },

    // Critical Care
    { key: 'emergency', label: 'Emergency', category: 'Critical Care', icon: 'Siren' },
    { key: 'icu', label: 'ICU', category: 'Critical Care', icon: 'HeartPulse' },
    { key: 'surgery', label: 'Surgery', category: 'Critical Care', icon: 'Scissors' },
    { key: 'ambulance', label: 'Ambulance', category: 'Critical Care', icon: 'Truck' },

    // Diagnostics
    { key: 'lab-tests', label: 'Lab Tests', category: 'Diagnostics', icon: 'FlaskConical' },
    { key: 'radiology', label: 'Radiology', category: 'Diagnostics', icon: 'Scan' },
    { key: 'blood-bank', label: 'Blood Bank', category: 'Diagnostics', icon: 'Droplet' },

    // Staff & Resources
    { key: 'doctors', label: 'Doctors', category: 'Staff & Resources', icon: 'UserCog' },
    { key: 'staff', label: 'Staff Management', category: 'Staff & Resources', icon: 'Users2' },
    { key: 'shift-management', label: 'Shift Management', category: 'Staff & Resources', icon: 'Clock' },
    { key: 'rooms', label: 'Rooms & Beds', category: 'Staff & Resources', icon: 'Building' },

    // Pharmacy & Supplies
    { key: 'pharmacy', label: 'Pharmacy', category: 'Pharmacy & Supplies', icon: 'Pill' },
    { key: 'inventory', label: 'Inventory', category: 'Pharmacy & Supplies', icon: 'Package' },
    { key: 'assets', label: 'Assets', category: 'Pharmacy & Supplies', icon: 'Boxes' },
    { key: 'diet', label: 'Diet Plans', category: 'Pharmacy & Supplies', icon: 'Apple' },

    // Finance & Reports
    { key: 'billing', label: 'Billing', category: 'Finance & Reports', icon: 'Receipt' },
    { key: 'insurance', label: 'Insurance', category: 'Finance & Reports', icon: 'Shield' },
    { key: 'reports', label: 'Reports', category: 'Finance & Reports', icon: 'BarChart3' },
    { key: 'feedback', label: 'Feedback', category: 'Finance & Reports', icon: 'MessageSquare' },

    // System
    { key: 'settings', label: 'Settings', category: 'System', icon: 'Settings' }
];

// Group modules by category
const getModulesByCategory = () => {
    const grouped = {};
    for (const module of AVAILABLE_MODULES) {
        if (!grouped[module.category]) {
            grouped[module.category] = [];
        }
        grouped[module.category].push(module);
    }
    return grouped;
};

// Get module by key
const getModuleByKey = (key) => {
    return AVAILABLE_MODULES.find(m => m.key === key);
};

// Validate module keys
const validateModules = (modules) => {
    if (!Array.isArray(modules)) return false;
    if (modules.includes('*')) return true;

    const validKeys = AVAILABLE_MODULES.map(m => m.key);
    return modules.every(m => validKeys.includes(m));
};

module.exports = {
    AVAILABLE_MODULES,
    getModulesByCategory,
    getModuleByKey,
    validateModules
};
