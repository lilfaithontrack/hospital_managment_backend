/**
 * Database Migration Script
 * Creates all tables for the Medical Management System
 */

require('dotenv').config();
const db = require('../config/db.config');

const tables = [
  // Users & Authentication
  `CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS user_roles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    role ENUM('admin', 'doctor', 'nurse', 'receptionist', 'pharmacist', 'lab_technician', 'radiologist', 'accountant') NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_role (user_id, role)
  )`,

  // Departments
  `CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    head_doctor_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Patients
  `CREATE TABLE IF NOT EXISTS patients (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    age INT NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    date_of_birth DATE,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    allergies TEXT,
    medical_history TEXT,
    insurance_provider VARCHAR(255),
    insurance_policy_number VARCHAR(100),
    status ENUM('Active', 'Inactive', 'Discharged', 'Critical', 'Stable') DEFAULT 'Active',
    last_visit DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,

  // Doctors
  `CREATE TABLE IF NOT EXISTS doctors (
    id VARCHAR(36) PRIMARY KEY,
    doctor_id VARCHAR(20) UNIQUE NOT NULL,
    user_id VARCHAR(36),
    name VARCHAR(255) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    department_id VARCHAR(36),
    qualification VARCHAR(255),
    experience_years INT,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    consultation_fee DECIMAL(10,2),
    available_days JSON,
    available_time_start TIME,
    available_time_end TIME,
    status ENUM('Available', 'On Leave', 'Busy', 'Off Duty') DEFAULT 'Available',
    rating DECIMAL(2,1) DEFAULT 0,
    total_patients INT DEFAULT 0,
    profile_image VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
  )`,

  // Staff
  `CREATE TABLE IF NOT EXISTS staff (
    id VARCHAR(36) PRIMARY KEY,
    staff_id VARCHAR(20) UNIQUE NOT NULL,
    user_id VARCHAR(36),
    name VARCHAR(255) NOT NULL,
    role ENUM('Nurse', 'Technician', 'Receptionist', 'Admin', 'Pharmacist', 'Lab Technician', 'Radiologist', 'Accountant', 'Housekeeping', 'Security') NOT NULL,
    department_id VARCHAR(36),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    shift ENUM('Morning', 'Afternoon', 'Night', 'Rotating') DEFAULT 'Morning',
    join_date DATE NOT NULL,
    salary DECIMAL(10,2),
    status ENUM('Active', 'On Leave', 'Inactive') DEFAULT 'Active',
    address TEXT,
    emergency_contact VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
  )`,

  // Appointments
  `CREATE TABLE IF NOT EXISTS appointments (
    id VARCHAR(36) PRIMARY KEY,
    appointment_id VARCHAR(20) UNIQUE NOT NULL,
    patient_id VARCHAR(36) NOT NULL,
    doctor_id VARCHAR(36) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    end_time TIME,
    type ENUM('New Consultation', 'Follow Up', 'Emergency', 'Routine Checkup', 'Specialist Referral') NOT NULL,
    status ENUM('Scheduled', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'No Show') DEFAULT 'Scheduled',
    reason TEXT,
    notes TEXT,
    vitals JSON,
    prescription TEXT,
    follow_up_date DATE,
    created_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
  )`,

  // Wards
  `CREATE TABLE IF NOT EXISTS wards (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('General', 'ICU', 'Pediatric', 'Maternity', 'Surgical', 'Emergency', 'Psychiatric') NOT NULL,
    floor INT,
    total_beds INT DEFAULT 0,
    available_beds INT DEFAULT 0,
    nurse_station VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Beds
  `CREATE TABLE IF NOT EXISTS beds (
    id VARCHAR(36) PRIMARY KEY,
    bed_number VARCHAR(20) NOT NULL,
    ward_id VARCHAR(36) NOT NULL,
    bed_type ENUM('Standard', 'ICU', 'Pediatric', 'Maternity', 'Electric', 'Bariatric') DEFAULT 'Standard',
    daily_rate DECIMAL(10,2),
    status ENUM('Available', 'Occupied', 'Maintenance', 'Reserved') DEFAULT 'Available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ward_id) REFERENCES wards(id) ON DELETE CASCADE
  )`,

  // Rooms
  `CREATE TABLE IF NOT EXISTS rooms (
    id VARCHAR(36) PRIMARY KEY,
    room_number VARCHAR(20) UNIQUE NOT NULL,
    room_type ENUM('Private', 'Semi-Private', 'General', 'Deluxe', 'Suite', 'ICU') NOT NULL,
    ward_id VARCHAR(36),
    floor INT,
    building VARCHAR(50),
    total_beds INT DEFAULT 1,
    available_beds INT DEFAULT 1,
    daily_rate DECIMAL(10,2),
    amenities JSON,
    status ENUM('Available', 'Occupied', 'Maintenance', 'Reserved') DEFAULT 'Available',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ward_id) REFERENCES wards(id) ON DELETE SET NULL
  )`,

  // Emergency Cases
  `CREATE TABLE IF NOT EXISTS emergency_cases (
    id VARCHAR(36) PRIMARY KEY,
    case_id VARCHAR(20) UNIQUE NOT NULL,
    patient_id VARCHAR(36),
    patient_name VARCHAR(255) NOT NULL,
    age INT,
    gender ENUM('Male', 'Female', 'Other'),
    arrival_time DATETIME NOT NULL,
    chief_complaint TEXT NOT NULL,
    triage_level ENUM('Resuscitation', 'Critical', 'Urgent', 'Less Urgent', 'Non-Urgent') NOT NULL,
    triage_color ENUM('Red', 'Orange', 'Yellow', 'Green', 'Blue') NOT NULL,
    vitals JSON,
    assigned_doctor_id VARCHAR(36),
    assigned_nurse_id VARCHAR(36),
    bed_number VARCHAR(20),
    status ENUM('Waiting', 'Triage', 'Treatment', 'Admitted', 'Discharged', 'Transferred', 'Deceased') DEFAULT 'Waiting',
    diagnosis TEXT,
    treatment_given TEXT,
    disposition ENUM('Discharged', 'Admitted', 'Transferred', 'Left Without Being Seen', 'Deceased'),
    disposition_time DATETIME,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_doctor_id) REFERENCES doctors(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_nurse_id) REFERENCES staff(id) ON DELETE SET NULL
  )`,

  // Operating Rooms
  `CREATE TABLE IF NOT EXISTS operating_rooms (
    id VARCHAR(36) PRIMARY KEY,
    room_number VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100),
    equipment JSON,
    status ENUM('Available', 'In Use', 'Maintenance', 'Cleaning') DEFAULT 'Available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Surgeries
  `CREATE TABLE IF NOT EXISTS surgeries (
    id VARCHAR(36) PRIMARY KEY,
    surgery_id VARCHAR(20) UNIQUE NOT NULL,
    patient_id VARCHAR(36) NOT NULL,
    surgery_type VARCHAR(255) NOT NULL,
    surgeon_id VARCHAR(36) NOT NULL,
    assistant_surgeon_id VARCHAR(36),
    anesthesiologist_id VARCHAR(36),
    operating_room_id VARCHAR(36),
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    estimated_duration INT,
    actual_start_time DATETIME,
    actual_end_time DATETIME,
    priority ENUM('Emergency', 'Urgent', 'Elective') DEFAULT 'Elective',
    status ENUM('Scheduled', 'Preparing', 'In Progress', 'Completed', 'Cancelled', 'Postponed') DEFAULT 'Scheduled',
    anesthesia_type VARCHAR(100),
    pre_op_notes TEXT,
    post_op_notes TEXT,
    complications TEXT,
    blood_units_required INT DEFAULT 0,
    consent_signed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (surgeon_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (operating_room_id) REFERENCES operating_rooms(id) ON DELETE SET NULL
  )`,

  // ICU Beds
  `CREATE TABLE IF NOT EXISTS icu_beds (
    id VARCHAR(36) PRIMARY KEY,
    bed_number VARCHAR(20) UNIQUE NOT NULL,
    equipment JSON,
    status ENUM('Available', 'Occupied', 'Maintenance') DEFAULT 'Available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // ICU Patients
  `CREATE TABLE IF NOT EXISTS icu_patients (
    id VARCHAR(36) PRIMARY KEY,
    admission_id VARCHAR(20) UNIQUE NOT NULL,
    patient_id VARCHAR(36) NOT NULL,
    bed_id VARCHAR(36),
    admission_date DATETIME NOT NULL,
    admitting_diagnosis TEXT NOT NULL,
    attending_doctor_id VARCHAR(36),
    condition_status ENUM('Critical', 'Serious', 'Stable', 'Improving') NOT NULL,
    ventilator_support BOOLEAN DEFAULT FALSE,
    ventilator_settings JSON,
    vital_signs JSON,
    medications JSON,
    isolation_required BOOLEAN DEFAULT FALSE,
    isolation_type VARCHAR(50),
    status ENUM('Active', 'Discharged', 'Transferred', 'Deceased') DEFAULT 'Active',
    discharge_date DATETIME,
    discharge_disposition VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (bed_id) REFERENCES icu_beds(id) ON DELETE SET NULL,
    FOREIGN KEY (attending_doctor_id) REFERENCES doctors(id) ON DELETE SET NULL
  )`,

  // ICU Vitals Log
  `CREATE TABLE IF NOT EXISTS icu_vitals_log (
    id VARCHAR(36) PRIMARY KEY,
    icu_patient_id VARCHAR(36) NOT NULL,
    recorded_at DATETIME NOT NULL,
    recorded_by VARCHAR(36),
    blood_pressure_systolic INT,
    blood_pressure_diastolic INT,
    heart_rate INT,
    temperature DECIMAL(4,1),
    respiratory_rate INT,
    spo2 INT,
    cvp DECIMAL(5,2),
    urine_output INT,
    notes TEXT,
    FOREIGN KEY (icu_patient_id) REFERENCES icu_patients(id) ON DELETE CASCADE
  )`,

  // OPD Visits
  `CREATE TABLE IF NOT EXISTS opd_visits (
    id VARCHAR(36) PRIMARY KEY,
    visit_id VARCHAR(20) UNIQUE NOT NULL,
    patient_id VARCHAR(36) NOT NULL,
    doctor_id VARCHAR(36) NOT NULL,
    visit_date DATE NOT NULL,
    visit_time TIME NOT NULL,
    token_number INT NOT NULL,
    department_id VARCHAR(36),
    chief_complaint TEXT,
    history_of_present_illness TEXT,
    past_medical_history TEXT,
    vitals JSON,
    examination_findings TEXT,
    diagnosis TEXT,
    prescription TEXT,
    investigations_ordered JSON,
    procedures_done TEXT,
    follow_up_date DATE,
    follow_up_instructions TEXT,
    referral_to VARCHAR(255),
    status ENUM('Waiting', 'In Consultation', 'Completed', 'Referred', 'Admitted') DEFAULT 'Waiting',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
  )`,

  // IPD Admissions
  `CREATE TABLE IF NOT EXISTS ipd_admissions (
    id VARCHAR(36) PRIMARY KEY,
    admission_id VARCHAR(20) UNIQUE NOT NULL,
    patient_id VARCHAR(36) NOT NULL,
    bed_id VARCHAR(36),
    admission_date DATETIME NOT NULL,
    admitting_doctor_id VARCHAR(36),
    attending_doctor_id VARCHAR(36),
    admission_type ENUM('Emergency', 'Elective', 'Transfer', 'Observation') NOT NULL,
    admitting_diagnosis TEXT NOT NULL,
    chief_complaints TEXT,
    history TEXT,
    treatment_plan TEXT,
    diet_type VARCHAR(100),
    special_instructions TEXT,
    expected_discharge_date DATE,
    actual_discharge_date DATETIME,
    discharge_type ENUM('Normal', 'Against Medical Advice', 'Transfer', 'Death') ,
    discharge_summary TEXT,
    status ENUM('Active', 'Discharged', 'Transferred', 'Deceased') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (bed_id) REFERENCES beds(id) ON DELETE SET NULL,
    FOREIGN KEY (admitting_doctor_id) REFERENCES doctors(id) ON DELETE SET NULL,
    FOREIGN KEY (attending_doctor_id) REFERENCES doctors(id) ON DELETE SET NULL
  )`,

  // Lab Test Catalog
  `CREATE TABLE IF NOT EXISTS lab_test_catalog (
    id VARCHAR(36) PRIMARY KEY,
    test_code VARCHAR(20) UNIQUE NOT NULL,
    test_name VARCHAR(255) NOT NULL,
    test_type VARCHAR(100) NOT NULL,
    description TEXT,
    sample_type VARCHAR(100),
    turnaround_time VARCHAR(50),
    normal_range TEXT,
    price DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Lab Tests
  `CREATE TABLE IF NOT EXISTS lab_tests (
    id VARCHAR(36) PRIMARY KEY,
    test_id VARCHAR(20) UNIQUE NOT NULL,
    patient_id VARCHAR(36) NOT NULL,
    ordering_doctor_id VARCHAR(36),
    test_catalog_id VARCHAR(36),
    test_name VARCHAR(255) NOT NULL,
    test_type VARCHAR(100) NOT NULL,
    priority ENUM('STAT', 'Urgent', 'Routine') DEFAULT 'Routine',
    clinical_notes TEXT,
    fasting_required BOOLEAN DEFAULT FALSE,
    order_date DATETIME NOT NULL,
    sample_collected_at DATETIME,
    sample_collected_by VARCHAR(36),
    sample_received_at DATETIME,
    processed_at DATETIME,
    processed_by VARCHAR(36),
    verified_by VARCHAR(36),
    verified_at DATETIME,
    results JSON,
    result_text TEXT,
    abnormal_flags JSON,
    interpretation TEXT,
    report_url VARCHAR(500),
    status ENUM('Ordered', 'Sample Collected', 'Processing', 'Completed', 'Verified', 'Cancelled') DEFAULT 'Ordered',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (ordering_doctor_id) REFERENCES doctors(id) ON DELETE SET NULL,
    FOREIGN KEY (test_catalog_id) REFERENCES lab_test_catalog(id) ON DELETE SET NULL
  )`,

  // Radiology Equipment
  `CREATE TABLE IF NOT EXISTS radiology_equipment (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('X-Ray', 'CT Scan', 'MRI', 'Ultrasound', 'Mammography', 'Fluoroscopy', 'PET Scan') NOT NULL,
    manufacturer VARCHAR(100),
    model VARCHAR(100),
    status ENUM('Operational', 'Maintenance', 'Out of Service') DEFAULT 'Operational',
    location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Radiology Orders
  `CREATE TABLE IF NOT EXISTS radiology_orders (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(20) UNIQUE NOT NULL,
    patient_id VARCHAR(36) NOT NULL,
    ordering_physician_id VARCHAR(36),
    imaging_type ENUM('X-Ray', 'CT Scan', 'MRI', 'Ultrasound', 'Mammography', 'Fluoroscopy', 'PET Scan') NOT NULL,
    imaging_subtype VARCHAR(100),
    body_part VARCHAR(100) NOT NULL,
    laterality ENUM('Left', 'Right', 'Bilateral', 'N/A') DEFAULT 'N/A',
    contrast_required BOOLEAN DEFAULT FALSE,
    contrast_type VARCHAR(100),
    priority ENUM('STAT', 'Urgent', 'Routine') DEFAULT 'Routine',
    clinical_history TEXT,
    indication TEXT,
    order_date DATETIME NOT NULL,
    scheduled_date DATE,
    scheduled_time TIME,
    performed_date DATETIME,
    equipment_id VARCHAR(36),
    technician_id VARCHAR(36),
    radiologist_id VARCHAR(36),
    findings TEXT,
    impression TEXT,
    recommendations TEXT,
    critical_finding BOOLEAN DEFAULT FALSE,
    report_url VARCHAR(500),
    image_urls JSON,
    status ENUM('Ordered', 'Scheduled', 'In Progress', 'Completed', 'Reported', 'Cancelled') DEFAULT 'Ordered',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (ordering_physician_id) REFERENCES doctors(id) ON DELETE SET NULL,
    FOREIGN KEY (equipment_id) REFERENCES radiology_equipment(id) ON DELETE SET NULL
  )`,

  // Blood Inventory
  `CREATE TABLE IF NOT EXISTS blood_inventory (
    id VARCHAR(36) PRIMARY KEY,
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    component ENUM('Whole Blood', 'Packed RBC', 'Platelets', 'Fresh Frozen Plasma', 'Cryoprecipitate') NOT NULL,
    units_available INT DEFAULT 0,
    units_reserved INT DEFAULT 0,
    min_stock_level INT DEFAULT 5,
    expiry_alert_days INT DEFAULT 3,
    UNIQUE KEY blood_component (blood_group, component)
  )`,

  // Blood Donations
  `CREATE TABLE IF NOT EXISTS blood_donations (
    id VARCHAR(36) PRIMARY KEY,
    donation_id VARCHAR(20) UNIQUE NOT NULL,
    donor_name VARCHAR(255) NOT NULL,
    donor_phone VARCHAR(20) NOT NULL,
    donor_email VARCHAR(255),
    donor_age INT,
    donor_gender ENUM('Male', 'Female', 'Other'),
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    donation_date DATETIME NOT NULL,
    units_donated INT DEFAULT 1,
    hemoglobin_level DECIMAL(4,1),
    blood_pressure VARCHAR(20),
    screening_status ENUM('Pending', 'Passed', 'Failed') DEFAULT 'Pending',
    screening_notes TEXT,
    expiry_date DATE,
    status ENUM('Available', 'Reserved', 'Used', 'Expired', 'Discarded') DEFAULT 'Available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Blood Requests
  `CREATE TABLE IF NOT EXISTS blood_requests (
    id VARCHAR(36) PRIMARY KEY,
    request_id VARCHAR(20) UNIQUE NOT NULL,
    patient_id VARCHAR(36) NOT NULL,
    requesting_doctor_id VARCHAR(36),
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    component ENUM('Whole Blood', 'Packed RBC', 'Platelets', 'Fresh Frozen Plasma', 'Cryoprecipitate') NOT NULL,
    units_requested INT NOT NULL,
    priority ENUM('Emergency', 'Urgent', 'Routine') DEFAULT 'Routine',
    indication TEXT,
    request_date DATETIME NOT NULL,
    required_by DATETIME,
    units_issued INT DEFAULT 0,
    issued_date DATETIME,
    issued_by VARCHAR(36),
    status ENUM('Pending', 'Approved', 'Issued', 'Partial', 'Rejected', 'Cancelled') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (requesting_doctor_id) REFERENCES doctors(id) ON DELETE SET NULL
  )`,

  // Pharmacy Categories
  `CREATE TABLE IF NOT EXISTS pharmacy_categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Pharmacy Items
  `CREATE TABLE IF NOT EXISTS pharmacy_items (
    id VARCHAR(36) PRIMARY KEY,
    item_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    category_id VARCHAR(36),
    manufacturer VARCHAR(255),
    dosage_form ENUM('Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Ointment', 'Drops', 'Inhaler', 'Patch', 'Powder', 'Other') NOT NULL,
    strength VARCHAR(50),
    unit_of_measure VARCHAR(50),
    stock_quantity INT DEFAULT 0,
    min_stock_level INT DEFAULT 10,
    max_stock_level INT DEFAULT 1000,
    reorder_level INT DEFAULT 20,
    unit_cost DECIMAL(10,2),
    selling_price DECIMAL(10,2),
    mrp DECIMAL(10,2),
    batch_number VARCHAR(100),
    expiry_date DATE,
    manufacturing_date DATE,
    storage_conditions VARCHAR(255),
    requires_prescription BOOLEAN DEFAULT TRUE,
    is_controlled BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES pharmacy_categories(id) ON DELETE SET NULL
  )`,

  // Pharmacy Transactions
  `CREATE TABLE IF NOT EXISTS pharmacy_transactions (
    id VARCHAR(36) PRIMARY KEY,
    transaction_id VARCHAR(20) NOT NULL,
    item_id VARCHAR(36) NOT NULL,
    transaction_type ENUM('Purchase', 'Sale', 'Return', 'Adjustment', 'Transfer', 'Expired') NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2),
    total_amount DECIMAL(10,2),
    patient_id VARCHAR(36),
    prescription_id VARCHAR(36),
    invoice_number VARCHAR(50),
    notes TEXT,
    created_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES pharmacy_items(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL
  )`,

  // Billing Items
  `CREATE TABLE IF NOT EXISTS billing_items (
    id VARCHAR(36) PRIMARY KEY,
    item_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    unit_price DECIMAL(10,2) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Bills
  `CREATE TABLE IF NOT EXISTS bills (
    id VARCHAR(36) PRIMARY KEY,
    bill_number VARCHAR(20) UNIQUE NOT NULL,
    patient_id VARCHAR(36) NOT NULL,
    admission_id VARCHAR(36),
    opd_visit_id VARCHAR(36),
    bill_date DATETIME NOT NULL,
    due_date DATE,
    subtotal DECIMAL(12,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    discount_reason VARCHAR(255),
    tax_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) DEFAULT 0,
    paid_amount DECIMAL(12,2) DEFAULT 0,
    balance_due DECIMAL(12,2) DEFAULT 0,
    insurance_claim_id VARCHAR(36),
    insurance_amount DECIMAL(12,2) DEFAULT 0,
    payment_status ENUM('Pending', 'Partial', 'Paid', 'Overdue', 'Refunded') DEFAULT 'Pending',
    status ENUM('Draft', 'Final', 'Cancelled', 'Void') DEFAULT 'Draft',
    notes TEXT,
    created_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
  )`,

  // Bill Items
  `CREATE TABLE IF NOT EXISTS bill_items (
    id VARCHAR(36) PRIMARY KEY,
    bill_id VARCHAR(36) NOT NULL,
    billing_item_id VARCHAR(36),
    description VARCHAR(255) NOT NULL,
    quantity INT DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    tax DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    service_date DATE,
    notes TEXT,
    FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
    FOREIGN KEY (billing_item_id) REFERENCES billing_items(id) ON DELETE SET NULL
  )`,

  // Payments
  `CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(36) PRIMARY KEY,
    payment_id VARCHAR(20) UNIQUE NOT NULL,
    bill_id VARCHAR(36) NOT NULL,
    patient_id VARCHAR(36) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_date DATETIME NOT NULL,
    payment_method ENUM('Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Insurance', 'Mobile Payment', 'Cheque') NOT NULL,
    transaction_reference VARCHAR(100),
    receipt_number VARCHAR(50),
    notes TEXT,
    created_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
  )`,

  // Shifts
  `CREATE TABLE IF NOT EXISTS shifts (
    id VARCHAR(36) PRIMARY KEY,
    staff_id VARCHAR(36) NOT NULL,
    shift_date DATE NOT NULL,
    shift_type ENUM('Morning', 'Afternoon', 'Night') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status ENUM('Scheduled', 'In Progress', 'Completed', 'Absent', 'Leave') DEFAULT 'Scheduled',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE
  )`,

  // Insurance Providers
  `CREATE TABLE IF NOT EXISTS insurance_providers (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    contact_number VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    coverage_details TEXT,
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,

  // Insurance Claims
  `CREATE TABLE IF NOT EXISTS insurance_claims (
    id VARCHAR(36) PRIMARY KEY,
    claim_number VARCHAR(50) UNIQUE NOT NULL,
    bill_id VARCHAR(36) NOT NULL,
    patient_id VARCHAR(36) NOT NULL,
    insurance_provider_id VARCHAR(36) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    documents JSON,
    notes TEXT,
    admin_notes TEXT,
    created_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (insurance_provider_id) REFERENCES insurance_providers(id) ON DELETE CASCADE
  )`,

  // ICT Assets
  `CREATE TABLE IF NOT EXISTS ict_assets (
    id VARCHAR(36) PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100) UNIQUE,
    assigned_to VARCHAR(100),
    status ENUM('Active', 'Repair', 'Retired', 'Storage') DEFAULT 'Active',
    purchase_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,

  // ICT Tickets
  `CREATE TABLE IF NOT EXISTS ict_tickets (
    id VARCHAR(36) PRIMARY KEY,
    ticket_id VARCHAR(20) UNIQUE NOT NULL,
    reported_by VARCHAR(36) NOT NULL,
    issue_type VARCHAR(100) NOT NULL,
    priority ENUM('High', 'Medium', 'Low') DEFAULT 'Medium',
    status ENUM('Open', 'In Progress', 'Resolved', 'Closed') DEFAULT 'Open',
    assigned_tech VARCHAR(36),
    description TEXT,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_tech) REFERENCES users(id) ON DELETE SET NULL
  )`,

  // Security Cameras
  `CREATE TABLE IF NOT EXISTS security_cameras (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    ip_address VARCHAR(50),
    port INT DEFAULT 554,
    protocol ENUM('RTSP', 'HTTP', 'HTTPS', 'ONVIF') DEFAULT 'RTSP',
    stream_url VARCHAR(500),
    username VARCHAR(100),
    password VARCHAR(100),
    model VARCHAR(100),
    firmware_version VARCHAR(50),
    status ENUM('Online', 'Offline', 'Maintenance') DEFAULT 'Online',
    maintenance_mode BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,

  // Security Visitors
  `CREATE TABLE IF NOT EXISTS security_visitors (
    id VARCHAR(36) PRIMARY KEY,
    visitor_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    purpose TEXT,
    visit_person VARCHAR(255),
    check_in_time DATETIME NOT NULL,
    check_out_time DATETIME,
    id_proof_number VARCHAR(100),
    status ENUM('Checked In', 'Checked Out') DEFAULT 'Checked In',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  // Security Incidents
  `CREATE TABLE IF NOT EXISTS security_incidents (
    id VARCHAR(36) PRIMARY KEY,
    incident_type VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    severity ENUM('Critical', 'Major', 'Minor') DEFAULT 'Minor',
    reported_by VARCHAR(36),
    description TEXT,
    actions_taken TEXT,
    evidence_files JSON,
    status ENUM('Open', 'Closed', 'Under Investigation') DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE SET NULL
  )`
];

async function migrate() {
  console.log('🔄 Starting database migration...\n');

  try {
    // Test connection
    const connected = await db.testConnection();
    if (!connected) {
      console.error('❌ Could not connect to database. Please check your configuration.');
      process.exit(1);
    }

    // Create tables
    for (let i = 0; i < tables.length; i++) {
      const sql = tables[i];
      const tableName = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1] || 'unknown';

      try {
        await db.query(sql);
        console.log(`✅ Created table: ${tableName}`);
      } catch (error) {
        console.error(`❌ Error creating ${tableName}:`, error.message);
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('📋 Total tables created:', tables.length);

    console.log('\n✅ Migration completed successfully!');
    console.log('📋 Total tables created:', tables.length);

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (require.main === module) process.exit(1);
    throw error;
  }

  if (require.main === module) process.exit(0);
}

if (require.main === module) {
  migrate();
}

module.exports = migrate;
