/**
 * Database Migration: Create staff_roles table
 * Run with: node scripts/migrate-staff-roles.js
 */

const db = require('../config/db.config');
const { v4: uuidv4 } = require('uuid');

const migrate = async () => {
    console.log('🚀 Starting staff_roles migration...');

    try {
        // Create staff_roles table
        console.log('Creating staff_roles table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS staff_roles (
                id VARCHAR(36) PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                description VARCHAR(255),
                allowed_modules JSON,
                is_system BOOLEAN DEFAULT FALSE,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Check if default roles exist
        const [existingRoles] = await db.query('SELECT COUNT(*) as count FROM staff_roles');

        if (existingRoles[0].count === 0) {
            console.log('Inserting default system roles...');

            const defaultRoles = [
                {
                    id: uuidv4(),
                    name: 'Administrator',
                    description: 'Full system access - can manage everything',
                    allowed_modules: JSON.stringify(['*']),
                    is_system: true
                },
                {
                    id: uuidv4(),
                    name: 'Doctor',
                    description: 'Medical staff - patient care and diagnostics',
                    allowed_modules: JSON.stringify(['dashboard', 'patients', 'appointments', 'opd', 'ipd', 'emergency', 'surgery', 'icu', 'lab-tests', 'radiology', 'blood-bank', 'diet']),
                    is_system: true
                },
                {
                    id: uuidv4(),
                    name: 'Nurse',
                    description: 'Nursing staff - patient care support',
                    allowed_modules: JSON.stringify(['dashboard', 'patients', 'ipd', 'icu', 'emergency', 'diet', 'rooms']),
                    is_system: true
                },
                {
                    id: uuidv4(),
                    name: 'Receptionist',
                    description: 'Front desk - patient registration and appointments',
                    allowed_modules: JSON.stringify(['dashboard', 'patients', 'appointments', 'admissions', 'discharge', 'billing', 'feedback']),
                    is_system: true
                },
                {
                    id: uuidv4(),
                    name: 'Pharmacist',
                    description: 'Pharmacy management - medicines and inventory',
                    allowed_modules: JSON.stringify(['dashboard', 'pharmacy', 'inventory']),
                    is_system: true
                },
                {
                    id: uuidv4(),
                    name: 'Lab Technician',
                    description: 'Laboratory - tests and results',
                    allowed_modules: JSON.stringify(['dashboard', 'lab-tests', 'patients']),
                    is_system: true
                },
                {
                    id: uuidv4(),
                    name: 'Radiologist',
                    description: 'Radiology department - imaging and reports',
                    allowed_modules: JSON.stringify(['dashboard', 'radiology', 'patients']),
                    is_system: true
                },
                {
                    id: uuidv4(),
                    name: 'Accountant',
                    description: 'Finance - billing, insurance, and reports',
                    allowed_modules: JSON.stringify(['dashboard', 'billing', 'insurance', 'reports']),
                    is_system: true
                }
            ];

            for (const role of defaultRoles) {
                await db.query(
                    `INSERT INTO staff_roles (id, name, description, allowed_modules, is_system) 
                     VALUES (?, ?, ?, ?, ?)`,
                    [role.id, role.name, role.description, role.allowed_modules, role.is_system]
                );
                console.log(`  ✓ Created role: ${role.name}`);
            }
        } else {
            console.log('Default roles already exist, skipping...');
        }

        // Add role_id column to staff table if not exists
        console.log('Checking staff table for role_id column...');
        const [columns] = await db.query(`SHOW COLUMNS FROM staff LIKE 'role_id'`);

        if (columns.length === 0) {
            console.log('Adding role_id column to staff table...');
            await db.query(`
                ALTER TABLE staff 
                ADD COLUMN role_id VARCHAR(36),
                ADD CONSTRAINT fk_staff_role FOREIGN KEY (role_id) REFERENCES staff_roles(id) ON DELETE SET NULL
            `);
            console.log('  ✓ Added role_id column');
        } else {
            console.log('  role_id column already exists');
        }

        console.log('✅ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
};

migrate();
