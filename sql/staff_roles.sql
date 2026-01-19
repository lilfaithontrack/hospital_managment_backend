-- ========================================
-- Staff Roles Migration SQL
-- Hospital Management System - RBAC
-- ========================================

-- Create staff_roles table
CREATE TABLE IF NOT EXISTS staff_roles (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    allowed_modules JSON,
    is_system BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add role_id column to staff table
ALTER TABLE staff 
ADD COLUMN IF NOT EXISTS role_id VARCHAR(36),
ADD CONSTRAINT fk_staff_role FOREIGN KEY (role_id) REFERENCES staff_roles(id) ON DELETE SET NULL;

-- Insert default system roles
INSERT INTO staff_roles (id, name, description, allowed_modules, is_system, is_active) VALUES
(UUID(), 'Administrator', 'Full system access - can manage everything', '["*"]', TRUE, TRUE),
(UUID(), 'Doctor', 'Medical staff - patient care and diagnostics', '["dashboard", "patients", "appointments", "opd", "ipd", "emergency", "surgery", "icu", "lab-tests", "radiology", "blood-bank", "diet"]', TRUE, TRUE),
(UUID(), 'Nurse', 'Nursing staff - patient care support', '["dashboard", "patients", "ipd", "icu", "emergency", "diet", "rooms"]', TRUE, TRUE),
(UUID(), 'Receptionist', 'Front desk - patient registration and appointments', '["dashboard", "patients", "appointments", "admissions", "discharge", "billing", "feedback"]', TRUE, TRUE),
(UUID(), 'Pharmacist', 'Pharmacy management - medicines and inventory', '["dashboard", "pharmacy", "inventory"]', TRUE, TRUE),
(UUID(), 'Lab Technician', 'Laboratory - tests and results', '["dashboard", "lab-tests", "patients"]', TRUE, TRUE),
(UUID(), 'Radiologist', 'Radiology department - imaging and reports', '["dashboard", "radiology", "patients"]', TRUE, TRUE),
(UUID(), 'Accountant', 'Finance - billing, insurance, and reports', '["dashboard", "billing", "insurance", "reports"]', TRUE, TRUE);

-- View all roles
-- SELECT * FROM staff_roles;
