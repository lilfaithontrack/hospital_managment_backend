# Hospital Management System - Backend Specification

## Overview

This document outlines the complete backend architecture for the Hospital Management System (HMS). The backend should be built using **Node.js (CommonJS)** with **Express.js** framework and **MySQL** database.

---

## Table of Contents

1. [Technology Stack](#technology-stack)
2. [Project Structure](#project-structure)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Models](#models)
6. [Controllers](#controllers)
7. [Routes](#routes)
8. [Middleware](#middleware)
9. [Authentication & Authorization](#authentication--authorization)
10. [Environment Variables](#environment-variables)

---

## Technology Stack

| Component | Technology |
|-----------|------------|
| Runtime | Node.js (v18+) |
| Framework | Express.js |
| Database | MySQL 8.0+ |
| ORM | Sequelize / mysql2 |
| Authentication | JWT (jsonwebtoken) |
| Password Hashing | bcryptjs |
| Validation | express-validator / Joi |
| File Upload | multer |
| CORS | cors |
| Environment | dotenv |

---

## Project Structure

```
backend/
├── config/
│   ├── db.config.js          # Database configuration
│   └── auth.config.js        # JWT & auth configuration
├── controllers/
│   ├── auth.controller.js
│   ├── patient.controller.js
│   ├── doctor.controller.js
│   ├── staff.controller.js
│   ├── appointment.controller.js
│   ├── emergency.controller.js
│   ├── surgery.controller.js
│   ├── icu.controller.js
│   ├── opd.controller.js
│   ├── ipd.controller.js
│   ├── radiology.controller.js
│   ├── labTest.controller.js
│   ├── bloodBank.controller.js
│   ├── ambulance.controller.js
│   ├── admission.controller.js
│   ├── discharge.controller.js
│   ├── pharmacy.controller.js
│   ├── inventory.controller.js
│   ├── asset.controller.js
│   ├── diet.controller.js
│   ├── shift.controller.js
│   ├── insurance.controller.js
│   ├── billing.controller.js
│   ├── feedback.controller.js
│   ├── room.controller.js
│   ├── report.controller.js
│   └── settings.controller.js
├── middleware/
│   ├── auth.middleware.js     # JWT verification
│   ├── role.middleware.js     # Role-based access control
│   ├── validate.middleware.js # Request validation
│   └── upload.middleware.js   # File upload handling
├── models/
│   ├── index.js               # Model associations
│   ├── user.model.js
│   ├── userRole.model.js
│   ├── patient.model.js
│   ├── doctor.model.js
│   ├── staff.model.js
│   ├── appointment.model.js
│   ├── emergency.model.js
│   ├── surgery.model.js
│   ├── icuPatient.model.js
│   ├── opdVisit.model.js
│   ├── ipdAdmission.model.js
│   ├── radiologyOrder.model.js
│   ├── labTest.model.js
│   ├── bloodInventory.model.js
│   ├── bloodRequest.model.js
│   ├── ambulance.model.js
│   ├── ambulanceCall.model.js
│   ├── admission.model.js
│   ├── discharge.model.js
│   ├── pharmacyItem.model.js
│   ├── inventoryItem.model.js
│   ├── asset.model.js
│   ├── dietPlan.model.js
│   ├── shift.model.js
│   ├── insuranceClaim.model.js
│   ├── billing.model.js
│   ├── feedback.model.js
│   ├── room.model.js
│   ├── department.model.js
│   └── ward.model.js
├── routes/
│   ├── index.js               # Route aggregator
│   ├── auth.routes.js
│   ├── patient.routes.js
│   ├── doctor.routes.js
│   ├── staff.routes.js
│   ├── appointment.routes.js
│   ├── emergency.routes.js
│   ├── surgery.routes.js
│   ├── icu.routes.js
│   ├── opd.routes.js
│   ├── ipd.routes.js
│   ├── radiology.routes.js
│   ├── labTest.routes.js
│   ├── bloodBank.routes.js
│   ├── ambulance.routes.js
│   ├── admission.routes.js
│   ├── discharge.routes.js
│   ├── pharmacy.routes.js
│   ├── inventory.routes.js
│   ├── asset.routes.js
│   ├── diet.routes.js
│   ├── shift.routes.js
│   ├── insurance.routes.js
│   ├── billing.routes.js
│   ├── feedback.routes.js
│   ├── room.routes.js
│   ├── report.routes.js
│   └── settings.routes.js
├── utils/
│   ├── responseHandler.js     # Standardized API responses
│   ├── errorHandler.js        # Global error handling
│   ├── idGenerator.js         # Generate unique IDs
│   └── dateUtils.js           # Date formatting utilities
├── validators/
│   ├── patient.validator.js
│   ├── doctor.validator.js
│   ├── appointment.validator.js
│   └── ... (other validators)
├── .env.example
├── app.js                     # Express app setup
├── server.js                  # Server entry point
└── package.json
```

---

## Database Schema

### 1. Users & Authentication

```sql
-- Users table (for authentication)
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User Roles (separate table for security)
CREATE TABLE user_roles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    role ENUM('admin', 'doctor', 'nurse', 'receptionist', 'pharmacist', 'lab_technician', 'radiologist', 'accountant') NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_role (user_id, role)
);
```

### 2. Patients

```sql
CREATE TABLE patients (
    id VARCHAR(36) PRIMARY KEY,
    patient_id VARCHAR(20) UNIQUE NOT NULL,  -- e.g., "PAT-001"
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
);
```

### 3. Doctors

```sql
CREATE TABLE departments (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    head_doctor_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE doctors (
    id VARCHAR(36) PRIMARY KEY,
    doctor_id VARCHAR(20) UNIQUE NOT NULL,  -- e.g., "DOC-001"
    user_id VARCHAR(36),
    name VARCHAR(255) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    department_id VARCHAR(36),
    qualification VARCHAR(255),
    experience_years INT,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    consultation_fee DECIMAL(10,2),
    available_days JSON,  -- ["Monday", "Tuesday", ...]
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
);
```

### 4. Staff

```sql
CREATE TABLE staff (
    id VARCHAR(36) PRIMARY KEY,
    staff_id VARCHAR(20) UNIQUE NOT NULL,  -- e.g., "STF-001"
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
);
```

### 5. Appointments

```sql
CREATE TABLE appointments (
    id VARCHAR(36) PRIMARY KEY,
    appointment_id VARCHAR(20) UNIQUE NOT NULL,  -- e.g., "APT-001"
    patient_id VARCHAR(36) NOT NULL,
    doctor_id VARCHAR(36) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    end_time TIME,
    type ENUM('Consultation', 'Follow-up', 'Emergency', 'Routine Checkup', 'Specialist', 'Lab Work', 'Vaccination', 'Procedure') NOT NULL,
    status ENUM('Scheduled', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'No Show', 'Rescheduled') DEFAULT 'Scheduled',
    reason TEXT,
    notes TEXT,
    vitals JSON,  -- { bp, pulse, temp, weight, height }
    prescription TEXT,
    follow_up_date DATE,
    created_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);
```

### 6. Emergency Cases

```sql
CREATE TABLE emergency_cases (
    id VARCHAR(36) PRIMARY KEY,
    case_id VARCHAR(20) UNIQUE NOT NULL,  -- e.g., "ER-001"
    patient_id VARCHAR(36),
    patient_name VARCHAR(255) NOT NULL,
    age INT,
    gender ENUM('Male', 'Female', 'Other'),
    arrival_time DATETIME NOT NULL,
    chief_complaint TEXT NOT NULL,
    triage_level ENUM('Critical', 'Urgent', 'Less Urgent', 'Non-Urgent', 'Resuscitation') NOT NULL,
    triage_color ENUM('Red', 'Orange', 'Yellow', 'Green', 'Blue') NOT NULL,
    vitals JSON,  -- { bp, pulse, temp, spo2, respRate }
    assigned_doctor_id VARCHAR(36),
    assigned_nurse_id VARCHAR(36),
    bed_number VARCHAR(20),
    status ENUM('Waiting', 'Triaged', 'In Treatment', 'Admitted', 'Discharged', 'Transferred', 'Deceased') DEFAULT 'Waiting',
    diagnosis TEXT,
    treatment_given TEXT,
    disposition ENUM('Admitted', 'Discharged', 'Transferred', 'AMA', 'Deceased'),
    disposition_time DATETIME,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_doctor_id) REFERENCES doctors(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_nurse_id) REFERENCES staff(id) ON DELETE SET NULL
);
```

### 7. Surgeries

```sql
CREATE TABLE operating_rooms (
    id VARCHAR(36) PRIMARY KEY,
    room_number VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100),
    type ENUM('General', 'Cardiac', 'Neuro', 'Orthopedic', 'Ophthalmology', 'ENT', 'Minor Procedure') NOT NULL,
    status ENUM('Available', 'In Use', 'Cleaning', 'Maintenance') DEFAULT 'Available',
    equipment JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE surgeries (
    id VARCHAR(36) PRIMARY KEY,
    surgery_id VARCHAR(20) UNIQUE NOT NULL,  -- e.g., "SRG-001"
    patient_id VARCHAR(36) NOT NULL,
    surgery_type VARCHAR(255) NOT NULL,
    surgeon_id VARCHAR(36) NOT NULL,
    assistant_surgeon_id VARCHAR(36),
    anesthesiologist_id VARCHAR(36),
    operating_room_id VARCHAR(36),
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    estimated_duration INT NOT NULL,  -- in minutes
    actual_start_time DATETIME,
    actual_end_time DATETIME,
    priority ENUM('Emergency', 'Urgent', 'Elective') DEFAULT 'Elective',
    status ENUM('Scheduled', 'Pre-Op', 'In Progress', 'Post-Op', 'Completed', 'Cancelled', 'Postponed') DEFAULT 'Scheduled',
    anesthesia_type ENUM('General', 'Regional', 'Local', 'Sedation'),
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
);

CREATE TABLE surgery_team (
    id VARCHAR(36) PRIMARY KEY,
    surgery_id VARCHAR(36) NOT NULL,
    staff_id VARCHAR(36) NOT NULL,
    role ENUM('Scrub Nurse', 'Circulating Nurse', 'Anesthesia Tech', 'Surgical Tech') NOT NULL,
    FOREIGN KEY (surgery_id) REFERENCES surgeries(id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE
);
```

### 8. ICU

```sql
CREATE TABLE icu_beds (
    id VARCHAR(36) PRIMARY KEY,
    bed_number VARCHAR(20) UNIQUE NOT NULL,
    icu_type ENUM('Medical', 'Surgical', 'Cardiac', 'Neuro', 'Pediatric', 'Neonatal') NOT NULL,
    status ENUM('Available', 'Occupied', 'Reserved', 'Maintenance') DEFAULT 'Available',
    equipment JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE icu_patients (
    id VARCHAR(36) PRIMARY KEY,
    admission_id VARCHAR(20) UNIQUE NOT NULL,  -- e.g., "ICU-001"
    patient_id VARCHAR(36) NOT NULL,
    bed_id VARCHAR(36),
    admission_date DATETIME NOT NULL,
    admitting_diagnosis TEXT NOT NULL,
    attending_doctor_id VARCHAR(36),
    condition_status ENUM('Critical', 'Serious', 'Stable', 'Improving', 'Deteriorating') NOT NULL,
    ventilator_support BOOLEAN DEFAULT FALSE,
    ventilator_settings JSON,
    vital_signs JSON,  -- Latest vitals
    medications JSON,  -- Current medications
    iv_lines JSON,     -- IV line details
    intake_output JSON, -- I/O chart
    glasgow_coma_scale INT,
    apache_score INT,
    isolation_required BOOLEAN DEFAULT FALSE,
    isolation_type VARCHAR(100),
    discharge_date DATETIME,
    discharge_disposition ENUM('Ward', 'Home', 'Transfer', 'Deceased'),
    status ENUM('Active', 'Discharged', 'Transferred', 'Deceased') DEFAULT 'Active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (bed_id) REFERENCES icu_beds(id) ON DELETE SET NULL,
    FOREIGN KEY (attending_doctor_id) REFERENCES doctors(id) ON DELETE SET NULL
);

CREATE TABLE icu_vitals_log (
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
    cvp INT,
    urine_output INT,
    notes TEXT,
    FOREIGN KEY (icu_patient_id) REFERENCES icu_patients(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES staff(id) ON DELETE SET NULL
);
```

### 9. OPD (Outpatient Department)

```sql
CREATE TABLE opd_visits (
    id VARCHAR(36) PRIMARY KEY,
    visit_id VARCHAR(20) UNIQUE NOT NULL,  -- e.g., "OPD-001"
    patient_id VARCHAR(36) NOT NULL,
    doctor_id VARCHAR(36) NOT NULL,
    visit_date DATE NOT NULL,
    visit_time TIME NOT NULL,
    token_number INT,
    department_id VARCHAR(36),
    chief_complaint TEXT,
    history_of_present_illness TEXT,
    past_medical_history TEXT,
    vitals JSON,
    examination_findings TEXT,
    diagnosis TEXT,
    prescription TEXT,
    investigations_ordered JSON,  -- List of lab tests/imaging
    procedures_done TEXT,
    follow_up_date DATE,
    follow_up_instructions TEXT,
    referral_to VARCHAR(36),  -- Doctor ID
    status ENUM('Waiting', 'In Consultation', 'Completed', 'Referred', 'No Show') DEFAULT 'Waiting',
    billing_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);
```

### 10. IPD (Inpatient Department)

```sql
CREATE TABLE wards (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('General', 'Private', 'Semi-Private', 'ICU', 'Pediatric', 'Maternity', 'Isolation') NOT NULL,
    floor INT,
    total_beds INT DEFAULT 0,
    available_beds INT DEFAULT 0,
    nurse_station VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE beds (
    id VARCHAR(36) PRIMARY KEY,
    bed_number VARCHAR(20) NOT NULL,
    ward_id VARCHAR(36) NOT NULL,
    bed_type ENUM('Standard', 'Electric', 'ICU', 'Pediatric', 'Bariatric') DEFAULT 'Standard',
    daily_rate DECIMAL(10,2),
    status ENUM('Available', 'Occupied', 'Reserved', 'Maintenance', 'Cleaning') DEFAULT 'Available',
    FOREIGN KEY (ward_id) REFERENCES wards(id) ON DELETE CASCADE,
    UNIQUE KEY unique_bed_ward (bed_number, ward_id)
);

CREATE TABLE ipd_admissions (
    id VARCHAR(36) PRIMARY KEY,
    admission_id VARCHAR(20) UNIQUE NOT NULL,  -- e.g., "IPD-001"
    patient_id VARCHAR(36) NOT NULL,
    bed_id VARCHAR(36),
    admission_date DATETIME NOT NULL,
    admitting_doctor_id VARCHAR(36),
    attending_doctor_id VARCHAR(36),
    admission_type ENUM('Emergency', 'Elective', 'Transfer', 'Referral') NOT NULL,
    admitting_diagnosis TEXT NOT NULL,
    chief_complaints TEXT,
    history TEXT,
    treatment_plan TEXT,
    diet_type VARCHAR(50),
    special_instructions TEXT,
    expected_discharge_date DATE,
    actual_discharge_date DATETIME,
    discharge_type ENUM('Normal', 'AMA', 'Transfer', 'Deceased', 'LAMA'),
    discharge_summary TEXT,
    status ENUM('Active', 'Discharged', 'Transferred', 'Deceased') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (bed_id) REFERENCES beds(id) ON DELETE SET NULL,
    FOREIGN KEY (admitting_doctor_id) REFERENCES doctors(id) ON DELETE SET NULL,
    FOREIGN KEY (attending_doctor_id) REFERENCES doctors(id) ON DELETE SET NULL
);
```

### 11. Radiology

```sql
CREATE TABLE radiology_equipment (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('X-Ray', 'CT Scan', 'MRI', 'Ultrasound', 'PET Scan', 'Mammogram', 'Fluoroscopy', 'Angiography', 'Nuclear Medicine', 'DEXA') NOT NULL,
    room_number VARCHAR(20),
    status ENUM('Operational', 'Maintenance', 'Out of Order') DEFAULT 'Operational',
    last_maintenance DATE,
    next_maintenance DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE radiology_orders (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(20) UNIQUE NOT NULL,  -- e.g., "RAD-001"
    patient_id VARCHAR(36) NOT NULL,
    ordering_physician_id VARCHAR(36) NOT NULL,
    imaging_type ENUM('X-Ray', 'CT Scan', 'MRI', 'Ultrasound', 'PET Scan', 'Mammogram', 'Fluoroscopy', 'Angiography', 'Nuclear Medicine', 'DEXA') NOT NULL,
    imaging_subtype VARCHAR(100),  -- e.g., "Brain MRI", "Chest X-Ray"
    body_part VARCHAR(100) NOT NULL,
    laterality ENUM('Left', 'Right', 'Bilateral', 'N/A') DEFAULT 'N/A',
    contrast_required BOOLEAN DEFAULT FALSE,
    contrast_type VARCHAR(50),
    priority ENUM('Routine', 'Urgent', 'STAT') DEFAULT 'Routine',
    clinical_history TEXT,
    indication TEXT,
    order_date DATETIME NOT NULL,
    scheduled_date DATE,
    scheduled_time TIME,
    performed_date DATETIME,
    equipment_id VARCHAR(36),
    technician_id VARCHAR(36),
    radiologist_id VARCHAR(36),
    status ENUM('Ordered', 'Scheduled', 'In Progress', 'Completed', 'Reported', 'Cancelled') DEFAULT 'Ordered',
    findings TEXT,
    impression TEXT,
    recommendations TEXT,
    critical_finding BOOLEAN DEFAULT FALSE,
    report_url VARCHAR(500),
    image_urls JSON,  -- Array of DICOM/image URLs
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (ordering_physician_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (equipment_id) REFERENCES radiology_equipment(id) ON DELETE SET NULL,
    FOREIGN KEY (technician_id) REFERENCES staff(id) ON DELETE SET NULL,
    FOREIGN KEY (radiologist_id) REFERENCES doctors(id) ON DELETE SET NULL
);
```

### 12. Laboratory Tests

```sql
CREATE TABLE lab_test_catalog (
    id VARCHAR(36) PRIMARY KEY,
    test_code VARCHAR(20) UNIQUE NOT NULL,
    test_name VARCHAR(255) NOT NULL,
    category ENUM('Hematology', 'Biochemistry', 'Microbiology', 'Serology', 'Urinalysis', 'Pathology', 'Molecular', 'Immunology') NOT NULL,
    sample_type ENUM('Blood', 'Urine', 'Stool', 'Sputum', 'CSF', 'Tissue', 'Swab', 'Other') NOT NULL,
    sample_volume VARCHAR(50),
    container_type VARCHAR(50),
    turnaround_time VARCHAR(50),  -- e.g., "4 hours", "2 days"
    price DECIMAL(10,2),
    reference_range TEXT,
    special_instructions TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lab_tests (
    id VARCHAR(36) PRIMARY KEY,
    test_id VARCHAR(20) UNIQUE NOT NULL,  -- e.g., "LAB-001"
    patient_id VARCHAR(36) NOT NULL,
    ordering_doctor_id VARCHAR(36) NOT NULL,
    test_catalog_id VARCHAR(36) NOT NULL,
    test_name VARCHAR(255) NOT NULL,
    test_type ENUM('Hematology', 'Biochemistry', 'Microbiology', 'Serology', 'Urinalysis', 'Pathology', 'Molecular', 'Immunology') NOT NULL,
    priority ENUM('Routine', 'Urgent', 'STAT') DEFAULT 'Routine',
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
    status ENUM('Ordered', 'Sample Collected', 'Processing', 'Completed', 'Verified', 'Cancelled') DEFAULT 'Ordered',
    results JSON,  -- { parameter: value, unit, normalRange, flag }
    result_text TEXT,
    abnormal_flags JSON,
    interpretation TEXT,
    report_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (ordering_doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (test_catalog_id) REFERENCES lab_test_catalog(id) ON DELETE CASCADE
);
```

### 13. Blood Bank

```sql
CREATE TABLE blood_inventory (
    id VARCHAR(36) PRIMARY KEY,
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    component ENUM('Whole Blood', 'Packed RBC', 'Fresh Frozen Plasma', 'Platelets', 'Cryoprecipitate') NOT NULL,
    units_available INT DEFAULT 0,
    units_reserved INT DEFAULT 0,
    min_stock_level INT DEFAULT 5,
    expiry_alert_days INT DEFAULT 7,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_blood_component (blood_group, component)
);

CREATE TABLE blood_donations (
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
);

CREATE TABLE blood_requests (
    id VARCHAR(36) PRIMARY KEY,
    request_id VARCHAR(20) UNIQUE NOT NULL,  -- e.g., "BRQ-001"
    patient_id VARCHAR(36) NOT NULL,
    requesting_doctor_id VARCHAR(36) NOT NULL,
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    component ENUM('Whole Blood', 'Packed RBC', 'Fresh Frozen Plasma', 'Platelets', 'Cryoprecipitate') NOT NULL,
    units_requested INT NOT NULL,
    units_issued INT DEFAULT 0,
    priority ENUM('Routine', 'Urgent', 'Emergency') DEFAULT 'Routine',
    indication TEXT,
    crossmatch_status ENUM('Pending', 'Compatible', 'Incompatible') DEFAULT 'Pending',
    request_date DATETIME NOT NULL,
    required_by DATETIME,
    issued_date DATETIME,
    issued_by VARCHAR(36),
    status ENUM('Pending', 'Approved', 'Issued', 'Cancelled', 'Completed') DEFAULT 'Pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (requesting_doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);
```

### 14. Ambulance

```sql
CREATE TABLE ambulances (
    id VARCHAR(36) PRIMARY KEY,
    vehicle_number VARCHAR(20) UNIQUE NOT NULL,
    ambulance_type ENUM('Basic Life Support', 'Advanced Life Support', 'Patient Transport', 'Neonatal', 'Mortuary') NOT NULL,
    driver_name VARCHAR(255),
    driver_phone VARCHAR(20),
    paramedic_name VARCHAR(255),
    paramedic_phone VARCHAR(20),
    equipment JSON,  -- List of equipment
    status ENUM('Available', 'On Call', 'En Route', 'At Scene', 'Returning', 'Maintenance', 'Out of Service') DEFAULT 'Available',
    current_location VARCHAR(500),
    gps_coordinates JSON,  -- { lat, lng }
    last_maintenance DATE,
    next_maintenance_due DATE,
    fuel_level INT,  -- Percentage
    mileage INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE ambulance_calls (
    id VARCHAR(36) PRIMARY KEY,
    call_id VARCHAR(20) UNIQUE NOT NULL,  -- e.g., "AMB-001"
    ambulance_id VARCHAR(36),
    caller_name VARCHAR(255) NOT NULL,
    caller_phone VARCHAR(20) NOT NULL,
    patient_name VARCHAR(255),
    patient_condition TEXT,
    pickup_address TEXT NOT NULL,
    pickup_landmark VARCHAR(255),
    destination VARCHAR(255),
    call_type ENUM('Emergency', 'Transfer', 'Non-Emergency') NOT NULL,
    priority ENUM('Critical', 'Urgent', 'Routine') DEFAULT 'Routine',
    call_received_at DATETIME NOT NULL,
    dispatched_at DATETIME,
    arrived_at_scene DATETIME,
    left_scene_at DATETIME,
    arrived_at_hospital DATETIME,
    completed_at DATETIME,
    distance_covered DECIMAL(10,2),  -- in km
    status ENUM('Received', 'Dispatched', 'En Route', 'At Scene', 'Transporting', 'Completed', 'Cancelled') DEFAULT 'Received',
    treatment_given TEXT,
    vitals_on_scene JSON,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ambulance_id) REFERENCES ambulances(id) ON DELETE SET NULL
);
```

### 15. Admissions & Discharges

```sql
CREATE TABLE admissions (
    id VARCHAR(36) PRIMARY KEY,
    admission_id VARCHAR(20) UNIQUE NOT NULL,
    patient_id VARCHAR(36) NOT NULL,
    admission_type ENUM('Emergency', 'Elective', 'Transfer', 'Referral', 'Direct') NOT NULL,
    admission_date DATETIME NOT NULL,
    source ENUM('OPD', 'Emergency', 'Transfer', 'Direct', 'Referral') NOT NULL,
    admitting_doctor_id VARCHAR(36),
    department_id VARCHAR(36),
    bed_id VARCHAR(36),
    diagnosis TEXT,
    status ENUM('Pending', 'Admitted', 'Discharged', 'Cancelled') DEFAULT 'Pending',
    insurance_verified BOOLEAN DEFAULT FALSE,
    deposit_amount DECIMAL(10,2) DEFAULT 0,
    deposit_paid BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (admitting_doctor_id) REFERENCES doctors(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (bed_id) REFERENCES beds(id) ON DELETE SET NULL
);

CREATE TABLE discharges (
    id VARCHAR(36) PRIMARY KEY,
    discharge_id VARCHAR(20) UNIQUE NOT NULL,
    admission_id VARCHAR(36) NOT NULL,
    patient_id VARCHAR(36) NOT NULL,
    discharge_date DATETIME NOT NULL,
    discharge_type ENUM('Normal', 'AMA', 'Transfer', 'LAMA', 'Deceased', 'Absconded') NOT NULL,
    discharging_doctor_id VARCHAR(36),
    discharge_diagnosis TEXT,
    discharge_summary TEXT,
    treatment_summary TEXT,
    medications_on_discharge JSON,
    follow_up_instructions TEXT,
    follow_up_date DATE,
    diet_instructions TEXT,
    activity_restrictions TEXT,
    warning_signs TEXT,
    final_bill_amount DECIMAL(12,2),
    payment_status ENUM('Pending', 'Partial', 'Paid', 'Insurance') DEFAULT 'Pending',
    status ENUM('Pending', 'Approved', 'Completed', 'Cancelled') DEFAULT 'Pending',
    created_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admission_id) REFERENCES admissions(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (discharging_doctor_id) REFERENCES doctors(id) ON DELETE SET NULL
);
```

### 16. Pharmacy

```sql
CREATE TABLE pharmacy_categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pharmacy_items (
    id VARCHAR(36) PRIMARY KEY,
    item_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    category_id VARCHAR(36),
    manufacturer VARCHAR(255),
    dosage_form ENUM('Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Ointment', 'Drops', 'Inhaler', 'Suppository', 'Powder', 'Suspension', 'Other') NOT NULL,
    strength VARCHAR(50),
    unit_of_measure VARCHAR(20),
    stock_quantity INT DEFAULT 0,
    min_stock_level INT DEFAULT 10,
    max_stock_level INT DEFAULT 1000,
    reorder_level INT DEFAULT 20,
    unit_cost DECIMAL(10,2),
    selling_price DECIMAL(10,2),
    mrp DECIMAL(10,2),
    batch_number VARCHAR(50),
    expiry_date DATE,
    manufacturing_date DATE,
    storage_conditions VARCHAR(255),
    requires_prescription BOOLEAN DEFAULT TRUE,
    is_controlled BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    supplier_id VARCHAR(36),
    location VARCHAR(100),  -- Shelf/Rack location
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES pharmacy_categories(id) ON DELETE SET NULL
);

CREATE TABLE pharmacy_transactions (
    id VARCHAR(36) PRIMARY KEY,
    transaction_id VARCHAR(20) UNIQUE NOT NULL,
    item_id VARCHAR(36) NOT NULL,
    transaction_type ENUM('Purchase', 'Sale', 'Return', 'Adjustment', 'Expired', 'Transfer') NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2),
    total_amount DECIMAL(12,2),
    patient_id VARCHAR(36),
    prescription_id VARCHAR(36),
    invoice_number VARCHAR(50),
    batch_number VARCHAR(50),
    notes TEXT,
    created_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES pharmacy_items(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL
);
```

### 17. Inventory

```sql
CREATE TABLE inventory_categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    parent_category_id VARCHAR(36),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_category_id) REFERENCES inventory_categories(id) ON DELETE SET NULL
);

CREATE TABLE inventory_items (
    id VARCHAR(36) PRIMARY KEY,
    item_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id VARCHAR(36),
    unit_of_measure VARCHAR(20),
    stock_quantity INT DEFAULT 0,
    min_stock_level INT DEFAULT 5,
    max_stock_level INT DEFAULT 500,
    reorder_level INT DEFAULT 10,
    unit_cost DECIMAL(10,2),
    supplier_id VARCHAR(36),
    location VARCHAR(100),
    expiry_date DATE,
    is_consumable BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    last_restock_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES inventory_categories(id) ON DELETE SET NULL
);

CREATE TABLE inventory_transactions (
    id VARCHAR(36) PRIMARY KEY,
    transaction_id VARCHAR(20) UNIQUE NOT NULL,
    item_id VARCHAR(36) NOT NULL,
    transaction_type ENUM('Purchase', 'Issue', 'Return', 'Adjustment', 'Transfer', 'Write-off') NOT NULL,
    quantity INT NOT NULL,
    from_location VARCHAR(100),
    to_location VARCHAR(100),
    department_id VARCHAR(36),
    reference_number VARCHAR(50),
    notes TEXT,
    created_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

CREATE TABLE suppliers (
    id VARCHAR(36) PRIMARY KEY,
    supplier_code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    tax_id VARCHAR(50),
    payment_terms VARCHAR(100),
    lead_time_days INT DEFAULT 7,
    rating DECIMAL(2,1),
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 18. Assets

```sql
CREATE TABLE asset_categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    depreciation_rate DECIMAL(5,2) DEFAULT 10.00,
    useful_life_years INT DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assets (
    id VARCHAR(36) PRIMARY KEY,
    asset_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id VARCHAR(36),
    serial_number VARCHAR(100),
    model_number VARCHAR(100),
    manufacturer VARCHAR(255),
    purchase_date DATE,
    purchase_price DECIMAL(12,2),
    current_value DECIMAL(12,2),
    warranty_expiry DATE,
    location VARCHAR(100),
    department_id VARCHAR(36),
    assigned_to VARCHAR(36),  -- Staff ID
    condition_status ENUM('New', 'Good', 'Fair', 'Poor', 'Damaged', 'Disposed') DEFAULT 'Good',
    operational_status ENUM('Operational', 'Under Maintenance', 'Repair Required', 'Out of Service', 'Disposed') DEFAULT 'Operational',
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    maintenance_frequency_days INT DEFAULT 365,
    is_critical BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES asset_categories(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES staff(id) ON DELETE SET NULL
);

CREATE TABLE asset_maintenance_log (
    id VARCHAR(36) PRIMARY KEY,
    asset_id VARCHAR(36) NOT NULL,
    maintenance_type ENUM('Preventive', 'Corrective', 'Calibration', 'Inspection', 'Upgrade') NOT NULL,
    maintenance_date DATE NOT NULL,
    performed_by VARCHAR(255),
    vendor_name VARCHAR(255),
    description TEXT,
    cost DECIMAL(10,2),
    parts_replaced TEXT,
    next_due_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
);
```

### 19. Diet & Nutrition

```sql
CREATE TABLE meal_types (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,  -- Breakfast, Lunch, Dinner, Snack
    time_start TIME,
    time_end TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE diet_templates (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    diet_type ENUM('Regular', 'Diabetic', 'Cardiac', 'Renal', 'Liquid', 'Soft', 'NPO', 'Low Sodium', 'High Protein', 'Vegetarian', 'Vegan', 'Gluten Free') NOT NULL,
    description TEXT,
    calorie_target INT,
    protein_grams INT,
    carbs_grams INT,
    fat_grams INT,
    sodium_mg INT,
    restrictions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE diet_plans (
    id VARCHAR(36) PRIMARY KEY,
    plan_id VARCHAR(20) UNIQUE NOT NULL,
    patient_id VARCHAR(36) NOT NULL,
    template_id VARCHAR(36),
    diet_type ENUM('Regular', 'Diabetic', 'Cardiac', 'Renal', 'Liquid', 'Soft', 'NPO', 'Low Sodium', 'High Protein', 'Vegetarian', 'Vegan', 'Gluten Free') NOT NULL,
    prescribed_by VARCHAR(36),  -- Doctor ID
    start_date DATE NOT NULL,
    end_date DATE,
    calorie_target INT,
    special_instructions TEXT,
    allergies TEXT,
    restrictions TEXT,
    status ENUM('Active', 'Completed', 'Cancelled', 'On Hold') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (template_id) REFERENCES diet_templates(id) ON DELETE SET NULL,
    FOREIGN KEY (prescribed_by) REFERENCES doctors(id) ON DELETE SET NULL
);

CREATE TABLE meal_orders (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(20) UNIQUE NOT NULL,
    diet_plan_id VARCHAR(36) NOT NULL,
    patient_id VARCHAR(36) NOT NULL,
    meal_type_id VARCHAR(36) NOT NULL,
    order_date DATE NOT NULL,
    items JSON,  -- Array of meal items
    special_requests TEXT,
    status ENUM('Ordered', 'Preparing', 'Ready', 'Delivered', 'Cancelled') DEFAULT 'Ordered',
    delivered_at DATETIME,
    delivered_by VARCHAR(36),
    feedback TEXT,
    rating INT,  -- 1-5
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (diet_plan_id) REFERENCES diet_plans(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (meal_type_id) REFERENCES meal_types(id) ON DELETE CASCADE
);
```

### 20. Shift Management

```sql
CREATE TABLE shift_templates (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,  -- Morning, Evening, Night
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_duration_minutes INT DEFAULT 30,
    color VARCHAR(7),  -- Hex color for UI
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE shifts (
    id VARCHAR(36) PRIMARY KEY,
    shift_id VARCHAR(20) UNIQUE NOT NULL,
    staff_id VARCHAR(36) NOT NULL,
    template_id VARCHAR(36),
    shift_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    actual_start_time TIME,
    actual_end_time TIME,
    department_id VARCHAR(36),
    ward_id VARCHAR(36),
    status ENUM('Scheduled', 'In Progress', 'Completed', 'Absent', 'On Leave', 'Swapped') DEFAULT 'Scheduled',
    swap_requested_with VARCHAR(36),  -- Staff ID
    swap_status ENUM('Pending', 'Approved', 'Rejected'),
    overtime_hours DECIMAL(4,2) DEFAULT 0,
    notes TEXT,
    created_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
    FOREIGN KEY (template_id) REFERENCES shift_templates(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (ward_id) REFERENCES wards(id) ON DELETE SET NULL
);

CREATE TABLE attendance (
    id VARCHAR(36) PRIMARY KEY,
    staff_id VARCHAR(36) NOT NULL,
    shift_id VARCHAR(36),
    attendance_date DATE NOT NULL,
    check_in TIME,
    check_out TIME,
    status ENUM('Present', 'Absent', 'Late', 'Half Day', 'On Leave', 'Holiday') DEFAULT 'Present',
    overtime_minutes INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
    FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE SET NULL,
    UNIQUE KEY unique_attendance (staff_id, attendance_date)
);
```

### 21. Insurance & Billing

```sql
CREATE TABLE insurance_providers (
    id VARCHAR(36) PRIMARY KEY,
    provider_code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    claim_submission_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE insurance_claims (
    id VARCHAR(36) PRIMARY KEY,
    claim_id VARCHAR(20) UNIQUE NOT NULL,  -- e.g., "CLM-001"
    patient_id VARCHAR(36) NOT NULL,
    admission_id VARCHAR(36),
    provider_id VARCHAR(36),
    policy_number VARCHAR(100) NOT NULL,
    claim_amount DECIMAL(12,2) NOT NULL,
    approved_amount DECIMAL(12,2),
    patient_responsibility DECIMAL(12,2),
    diagnosis_codes JSON,  -- ICD codes
    procedure_codes JSON,  -- CPT codes
    submission_date DATE,
    response_date DATE,
    status ENUM('Draft', 'Submitted', 'Under Review', 'Approved', 'Partially Approved', 'Denied', 'Appealed', 'Closed') DEFAULT 'Draft',
    denial_reason TEXT,
    documents JSON,  -- Array of document URLs
    notes TEXT,
    created_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (admission_id) REFERENCES admissions(id) ON DELETE SET NULL,
    FOREIGN KEY (provider_id) REFERENCES insurance_providers(id) ON DELETE SET NULL
);

CREATE TABLE billing_items (
    id VARCHAR(36) PRIMARY KEY,
    item_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category ENUM('Consultation', 'Procedure', 'Lab', 'Radiology', 'Pharmacy', 'Room', 'ICU', 'Surgery', 'Equipment', 'Supplies', 'Other') NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bills (
    id VARCHAR(36) PRIMARY KEY,
    bill_number VARCHAR(20) UNIQUE NOT NULL,  -- e.g., "BILL-001"
    patient_id VARCHAR(36) NOT NULL,
    admission_id VARCHAR(36),
    opd_visit_id VARCHAR(36),
    bill_date DATE NOT NULL,
    due_date DATE,
    subtotal DECIMAL(12,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    discount_reason VARCHAR(255),
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    paid_amount DECIMAL(12,2) DEFAULT 0,
    balance_due DECIMAL(12,2),
    insurance_claim_id VARCHAR(36),
    insurance_amount DECIMAL(12,2) DEFAULT 0,
    payment_status ENUM('Pending', 'Partial', 'Paid', 'Overdue', 'Cancelled', 'Refunded') DEFAULT 'Pending',
    status ENUM('Draft', 'Generated', 'Sent', 'Paid', 'Cancelled') DEFAULT 'Draft',
    notes TEXT,
    created_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (admission_id) REFERENCES admissions(id) ON DELETE SET NULL,
    FOREIGN KEY (insurance_claim_id) REFERENCES insurance_claims(id) ON DELETE SET NULL
);

CREATE TABLE bill_items (
    id VARCHAR(36) PRIMARY KEY,
    bill_id VARCHAR(36) NOT NULL,
    billing_item_id VARCHAR(36),
    description VARCHAR(255) NOT NULL,
    quantity INT DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    tax DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(12,2) NOT NULL,
    service_date DATE,
    notes TEXT,
    FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
    FOREIGN KEY (billing_item_id) REFERENCES billing_items(id) ON DELETE SET NULL
);

CREATE TABLE payments (
    id VARCHAR(36) PRIMARY KEY,
    payment_id VARCHAR(20) UNIQUE NOT NULL,
    bill_id VARCHAR(36) NOT NULL,
    patient_id VARCHAR(36) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_date DATETIME NOT NULL,
    payment_method ENUM('Cash', 'Card', 'UPI', 'Net Banking', 'Cheque', 'Insurance', 'Other') NOT NULL,
    transaction_reference VARCHAR(100),
    receipt_number VARCHAR(50),
    notes TEXT,
    created_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);
```

### 22. Feedback

```sql
CREATE TABLE feedback (
    id VARCHAR(36) PRIMARY KEY,
    feedback_id VARCHAR(20) UNIQUE NOT NULL,
    patient_id VARCHAR(36),
    patient_name VARCHAR(255),
    patient_email VARCHAR(255),
    feedback_type ENUM('General', 'Doctor', 'Staff', 'Facility', 'Food', 'Billing', 'Complaint', 'Suggestion', 'Appreciation') NOT NULL,
    related_department_id VARCHAR(36),
    related_doctor_id VARCHAR(36),
    related_staff_id VARCHAR(36),
    rating INT,  -- 1-5
    subject VARCHAR(255),
    message TEXT NOT NULL,
    response TEXT,
    responded_by VARCHAR(36),
    responded_at DATETIME,
    status ENUM('New', 'Under Review', 'Resolved', 'Closed', 'Escalated') DEFAULT 'New',
    priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL,
    FOREIGN KEY (related_department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (related_doctor_id) REFERENCES doctors(id) ON DELETE SET NULL,
    FOREIGN KEY (related_staff_id) REFERENCES staff(id) ON DELETE SET NULL
);
```

### 23. Rooms Management

```sql
CREATE TABLE rooms (
    id VARCHAR(36) PRIMARY KEY,
    room_number VARCHAR(20) UNIQUE NOT NULL,
    room_type ENUM('Single', 'Double', 'Triple', 'Ward', 'VIP', 'Suite', 'ICU', 'NICU', 'PICU', 'Operating', 'Recovery', 'Consultation', 'Lab', 'Radiology', 'Storage') NOT NULL,
    ward_id VARCHAR(36),
    floor INT,
    building VARCHAR(50),
    total_beds INT DEFAULT 1,
    available_beds INT DEFAULT 1,
    daily_rate DECIMAL(10,2),
    amenities JSON,  -- ["AC", "TV", "Attached Bathroom", "WiFi"]
    status ENUM('Available', 'Occupied', 'Partial', 'Maintenance', 'Cleaning', 'Reserved') DEFAULT 'Available',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ward_id) REFERENCES wards(id) ON DELETE SET NULL
);
```

### 24. Reports & Analytics

```sql
CREATE TABLE report_templates (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category ENUM('Financial', 'Clinical', 'Operational', 'HR', 'Inventory', 'Patient', 'Custom') NOT NULL,
    query_template TEXT,
    parameters JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE generated_reports (
    id VARCHAR(36) PRIMARY KEY,
    template_id VARCHAR(36),
    report_name VARCHAR(255) NOT NULL,
    report_type ENUM('Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annual', 'Custom') NOT NULL,
    date_from DATE,
    date_to DATE,
    parameters JSON,
    file_url VARCHAR(500),
    file_format ENUM('PDF', 'Excel', 'CSV') DEFAULT 'PDF',
    generated_by VARCHAR(36),
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES report_templates(id) ON DELETE SET NULL,
    FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Dashboard statistics view (aggregated data)
CREATE TABLE dashboard_stats (
    id VARCHAR(36) PRIMARY KEY,
    stat_date DATE NOT NULL UNIQUE,
    total_patients INT DEFAULT 0,
    new_patients_today INT DEFAULT 0,
    total_appointments INT DEFAULT 0,
    completed_appointments INT DEFAULT 0,
    cancelled_appointments INT DEFAULT 0,
    total_admissions INT DEFAULT 0,
    total_discharges INT DEFAULT 0,
    icu_occupancy DECIMAL(5,2) DEFAULT 0,
    bed_occupancy DECIMAL(5,2) DEFAULT 0,
    emergency_cases INT DEFAULT 0,
    surgeries_scheduled INT DEFAULT 0,
    surgeries_completed INT DEFAULT 0,
    lab_tests_ordered INT DEFAULT 0,
    lab_tests_completed INT DEFAULT 0,
    radiology_orders INT DEFAULT 0,
    revenue_today DECIMAL(14,2) DEFAULT 0,
    outstanding_payments DECIMAL(14,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 25. Settings & Configuration

```sql
CREATE TABLE system_settings (
    id VARCHAR(36) PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    category VARCHAR(50),
    description TEXT,
    is_editable BOOLEAN DEFAULT TRUE,
    updated_by VARCHAR(36),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    action ENUM('CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'IMPORT', 'OTHER') NOT NULL,
    entity_type VARCHAR(50) NOT NULL,  -- Table name
    entity_id VARCHAR(36),
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_entity (entity_type, entity_id),
    INDEX idx_audit_date (created_at)
);
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| POST | `/api/auth/refresh-token` | Refresh JWT token |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/change-password` | Change password |

### Patients

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/patients` | Get all patients (paginated) |
| GET | `/api/patients/:id` | Get patient by ID |
| POST | `/api/patients` | Create new patient |
| PUT | `/api/patients/:id` | Update patient |
| DELETE | `/api/patients/:id` | Delete patient |
| GET | `/api/patients/:id/history` | Get patient medical history |
| GET | `/api/patients/:id/appointments` | Get patient appointments |
| GET | `/api/patients/:id/bills` | Get patient bills |
| GET | `/api/patients/search` | Search patients |

### Doctors

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/doctors` | Get all doctors |
| GET | `/api/doctors/:id` | Get doctor by ID |
| POST | `/api/doctors` | Create new doctor |
| PUT | `/api/doctors/:id` | Update doctor |
| DELETE | `/api/doctors/:id` | Delete doctor |
| GET | `/api/doctors/:id/appointments` | Get doctor's appointments |
| GET | `/api/doctors/:id/schedule` | Get doctor's schedule |
| PUT | `/api/doctors/:id/availability` | Update availability |
| GET | `/api/doctors/department/:deptId` | Get doctors by department |

### Staff

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/staff` | Get all staff |
| GET | `/api/staff/:id` | Get staff by ID |
| POST | `/api/staff` | Create new staff |
| PUT | `/api/staff/:id` | Update staff |
| DELETE | `/api/staff/:id` | Delete staff |
| GET | `/api/staff/:id/shifts` | Get staff shifts |
| GET | `/api/staff/department/:deptId` | Get staff by department |
| GET | `/api/staff/role/:role` | Get staff by role |

### Appointments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointments` | Get all appointments |
| GET | `/api/appointments/:id` | Get appointment by ID |
| POST | `/api/appointments` | Create new appointment |
| PUT | `/api/appointments/:id` | Update appointment |
| DELETE | `/api/appointments/:id` | Cancel appointment |
| PUT | `/api/appointments/:id/status` | Update appointment status |
| GET | `/api/appointments/date/:date` | Get appointments by date |
| GET | `/api/appointments/doctor/:doctorId` | Get doctor's appointments |
| GET | `/api/appointments/available-slots` | Get available slots |

### Emergency

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/emergency` | Get all emergency cases |
| GET | `/api/emergency/:id` | Get case by ID |
| POST | `/api/emergency` | Create emergency case |
| PUT | `/api/emergency/:id` | Update case |
| PUT | `/api/emergency/:id/triage` | Update triage |
| PUT | `/api/emergency/:id/assign` | Assign doctor/nurse |
| PUT | `/api/emergency/:id/disposition` | Update disposition |
| GET | `/api/emergency/active` | Get active cases |
| GET | `/api/emergency/stats` | Get emergency stats |

### Surgery

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/surgeries` | Get all surgeries |
| GET | `/api/surgeries/:id` | Get surgery by ID |
| POST | `/api/surgeries` | Schedule surgery |
| PUT | `/api/surgeries/:id` | Update surgery |
| DELETE | `/api/surgeries/:id` | Cancel surgery |
| PUT | `/api/surgeries/:id/status` | Update surgery status |
| GET | `/api/surgeries/scheduled/:date` | Get surgeries by date |
| GET | `/api/surgeries/operating-rooms` | Get operating rooms |
| GET | `/api/surgeries/operating-rooms/:id/availability` | Check OR availability |

### ICU

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/icu` | Get all ICU patients |
| GET | `/api/icu/:id` | Get ICU patient by ID |
| POST | `/api/icu` | Admit to ICU |
| PUT | `/api/icu/:id` | Update ICU patient |
| PUT | `/api/icu/:id/vitals` | Update vitals |
| PUT | `/api/icu/:id/discharge` | Discharge from ICU |
| GET | `/api/icu/beds` | Get ICU beds status |
| GET | `/api/icu/:id/vitals-history` | Get vitals history |
| GET | `/api/icu/stats` | Get ICU statistics |

### OPD

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/opd` | Get all OPD visits |
| GET | `/api/opd/:id` | Get visit by ID |
| POST | `/api/opd` | Create OPD visit |
| PUT | `/api/opd/:id` | Update visit |
| PUT | `/api/opd/:id/prescription` | Add prescription |
| GET | `/api/opd/today` | Get today's visits |
| GET | `/api/opd/queue` | Get current queue |
| POST | `/api/opd/:id/refer` | Refer to specialist |

### IPD

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ipd` | Get all IPD admissions |
| GET | `/api/ipd/:id` | Get admission by ID |
| POST | `/api/ipd` | Create admission |
| PUT | `/api/ipd/:id` | Update admission |
| PUT | `/api/ipd/:id/bed-transfer` | Transfer bed |
| PUT | `/api/ipd/:id/discharge` | Initiate discharge |
| GET | `/api/ipd/active` | Get active admissions |
| GET | `/api/ipd/beds/available` | Get available beds |

### Radiology

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/radiology` | Get all orders |
| GET | `/api/radiology/:id` | Get order by ID |
| POST | `/api/radiology` | Create order |
| PUT | `/api/radiology/:id` | Update order |
| DELETE | `/api/radiology/:id` | Cancel order |
| PUT | `/api/radiology/:id/schedule` | Schedule exam |
| PUT | `/api/radiology/:id/perform` | Record performance |
| PUT | `/api/radiology/:id/report` | Add report |
| GET | `/api/radiology/equipment` | Get equipment list |
| GET | `/api/radiology/stats` | Get radiology stats |

### Lab Tests

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/lab-tests` | Get all tests |
| GET | `/api/lab-tests/:id` | Get test by ID |
| POST | `/api/lab-tests` | Order test |
| PUT | `/api/lab-tests/:id` | Update test |
| DELETE | `/api/lab-tests/:id` | Cancel test |
| PUT | `/api/lab-tests/:id/collect-sample` | Record sample collection |
| PUT | `/api/lab-tests/:id/results` | Add results |
| PUT | `/api/lab-tests/:id/verify` | Verify results |
| GET | `/api/lab-tests/catalog` | Get test catalog |
| GET | `/api/lab-tests/pending` | Get pending tests |

### Blood Bank

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/blood-bank/inventory` | Get blood inventory |
| PUT | `/api/blood-bank/inventory/:id` | Update inventory |
| GET | `/api/blood-bank/donations` | Get donations |
| POST | `/api/blood-bank/donations` | Record donation |
| GET | `/api/blood-bank/requests` | Get blood requests |
| POST | `/api/blood-bank/requests` | Create request |
| PUT | `/api/blood-bank/requests/:id` | Update request |
| PUT | `/api/blood-bank/requests/:id/issue` | Issue blood |
| GET | `/api/blood-bank/compatibility/:bloodGroup` | Check compatibility |

### Ambulance

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ambulances` | Get all ambulances |
| GET | `/api/ambulances/:id` | Get ambulance by ID |
| POST | `/api/ambulances` | Add ambulance |
| PUT | `/api/ambulances/:id` | Update ambulance |
| PUT | `/api/ambulances/:id/status` | Update status |
| GET | `/api/ambulances/available` | Get available ambulances |
| GET | `/api/ambulance-calls` | Get all calls |
| POST | `/api/ambulance-calls` | Create call |
| PUT | `/api/ambulance-calls/:id` | Update call |
| PUT | `/api/ambulance-calls/:id/dispatch` | Dispatch ambulance |

### Admissions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admissions` | Get all admissions |
| GET | `/api/admissions/:id` | Get admission by ID |
| POST | `/api/admissions` | Create admission |
| PUT | `/api/admissions/:id` | Update admission |
| PUT | `/api/admissions/:id/approve` | Approve admission |
| GET | `/api/admissions/pending` | Get pending admissions |
| GET | `/api/admissions/today` | Get today's admissions |

### Discharges

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/discharges` | Get all discharges |
| GET | `/api/discharges/:id` | Get discharge by ID |
| POST | `/api/discharges` | Initiate discharge |
| PUT | `/api/discharges/:id` | Update discharge |
| PUT | `/api/discharges/:id/approve` | Approve discharge |
| PUT | `/api/discharges/:id/complete` | Complete discharge |
| GET | `/api/discharges/:id/summary` | Get discharge summary |

### Pharmacy

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pharmacy` | Get all items |
| GET | `/api/pharmacy/:id` | Get item by ID |
| POST | `/api/pharmacy` | Add item |
| PUT | `/api/pharmacy/:id` | Update item |
| DELETE | `/api/pharmacy/:id` | Delete item |
| PUT | `/api/pharmacy/:id/stock` | Update stock |
| GET | `/api/pharmacy/low-stock` | Get low stock items |
| GET | `/api/pharmacy/expiring` | Get expiring items |
| POST | `/api/pharmacy/dispense` | Dispense medication |
| GET | `/api/pharmacy/transactions` | Get transactions |

### Inventory

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/inventory` | Get all items |
| GET | `/api/inventory/:id` | Get item by ID |
| POST | `/api/inventory` | Add item |
| PUT | `/api/inventory/:id` | Update item |
| DELETE | `/api/inventory/:id` | Delete item |
| PUT | `/api/inventory/:id/stock` | Update stock |
| POST | `/api/inventory/issue` | Issue items |
| GET | `/api/inventory/low-stock` | Get low stock items |
| GET | `/api/inventory/transactions` | Get transactions |
| GET | `/api/inventory/categories` | Get categories |

### Assets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/assets` | Get all assets |
| GET | `/api/assets/:id` | Get asset by ID |
| POST | `/api/assets` | Add asset |
| PUT | `/api/assets/:id` | Update asset |
| DELETE | `/api/assets/:id` | Delete asset |
| PUT | `/api/assets/:id/assign` | Assign asset |
| PUT | `/api/assets/:id/maintenance` | Record maintenance |
| GET | `/api/assets/maintenance-due` | Get maintenance due |
| GET | `/api/assets/categories` | Get categories |
| GET | `/api/assets/department/:deptId` | Get by department |

### Diet & Nutrition

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/diet-plans` | Get all diet plans |
| GET | `/api/diet-plans/:id` | Get plan by ID |
| POST | `/api/diet-plans` | Create plan |
| PUT | `/api/diet-plans/:id` | Update plan |
| DELETE | `/api/diet-plans/:id` | Delete plan |
| GET | `/api/diet-plans/patient/:patientId` | Get patient's plan |
| GET | `/api/diet-plans/templates` | Get templates |
| GET | `/api/meal-orders` | Get meal orders |
| POST | `/api/meal-orders` | Create order |
| PUT | `/api/meal-orders/:id/status` | Update order status |

### Shift Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/shifts` | Get all shifts |
| GET | `/api/shifts/:id` | Get shift by ID |
| POST | `/api/shifts` | Create shift |
| PUT | `/api/shifts/:id` | Update shift |
| DELETE | `/api/shifts/:id` | Delete shift |
| POST | `/api/shifts/bulk` | Create bulk shifts |
| PUT | `/api/shifts/:id/swap` | Request swap |
| PUT | `/api/shifts/:id/swap/approve` | Approve swap |
| GET | `/api/shifts/staff/:staffId` | Get staff shifts |
| GET | `/api/shifts/week/:date` | Get weekly schedule |
| GET | `/api/attendance` | Get attendance records |
| POST | `/api/attendance/check-in` | Record check-in |
| POST | `/api/attendance/check-out` | Record check-out |

### Insurance

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/insurance/claims` | Get all claims |
| GET | `/api/insurance/claims/:id` | Get claim by ID |
| POST | `/api/insurance/claims` | Create claim |
| PUT | `/api/insurance/claims/:id` | Update claim |
| PUT | `/api/insurance/claims/:id/submit` | Submit claim |
| PUT | `/api/insurance/claims/:id/status` | Update status |
| GET | `/api/insurance/providers` | Get providers |
| POST | `/api/insurance/providers` | Add provider |
| PUT | `/api/insurance/providers/:id` | Update provider |
| GET | `/api/insurance/patient/:patientId/verify` | Verify insurance |

### Billing

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bills` | Get all bills |
| GET | `/api/bills/:id` | Get bill by ID |
| POST | `/api/bills` | Create bill |
| PUT | `/api/bills/:id` | Update bill |
| DELETE | `/api/bills/:id` | Delete bill |
| POST | `/api/bills/:id/items` | Add bill items |
| PUT | `/api/bills/:id/items/:itemId` | Update bill item |
| DELETE | `/api/bills/:id/items/:itemId` | Remove bill item |
| POST | `/api/bills/:id/generate` | Generate final bill |
| GET | `/api/bills/:id/pdf` | Get bill PDF |
| POST | `/api/payments` | Record payment |
| GET | `/api/payments` | Get payments |
| GET | `/api/payments/bill/:billId` | Get bill payments |
| GET | `/api/billing-items` | Get billing items |

### Feedback

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/feedback` | Get all feedback |
| GET | `/api/feedback/:id` | Get feedback by ID |
| POST | `/api/feedback` | Submit feedback |
| PUT | `/api/feedback/:id` | Update feedback |
| PUT | `/api/feedback/:id/respond` | Respond to feedback |
| PUT | `/api/feedback/:id/status` | Update status |
| GET | `/api/feedback/stats` | Get feedback stats |
| GET | `/api/feedback/department/:deptId` | Get by department |

### Rooms

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/rooms` | Get all rooms |
| GET | `/api/rooms/:id` | Get room by ID |
| POST | `/api/rooms` | Add room |
| PUT | `/api/rooms/:id` | Update room |
| DELETE | `/api/rooms/:id` | Delete room |
| PUT | `/api/rooms/:id/status` | Update status |
| GET | `/api/rooms/available` | Get available rooms |
| GET | `/api/rooms/type/:type` | Get rooms by type |
| GET | `/api/wards` | Get all wards |
| POST | `/api/wards` | Add ward |
| GET | `/api/beds` | Get all beds |
| PUT | `/api/beds/:id/status` | Update bed status |

### Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/dashboard` | Get dashboard stats |
| GET | `/api/reports/revenue` | Get revenue report |
| GET | `/api/reports/patient-flow` | Get patient flow |
| GET | `/api/reports/occupancy` | Get bed occupancy |
| GET | `/api/reports/department/:deptId` | Get department report |
| POST | `/api/reports/generate` | Generate custom report |
| GET | `/api/reports/templates` | Get report templates |
| GET | `/api/reports/history` | Get generated reports |

### Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings` | Get all settings |
| GET | `/api/settings/:key` | Get setting by key |
| PUT | `/api/settings/:key` | Update setting |
| GET | `/api/departments` | Get all departments |
| POST | `/api/departments` | Add department |
| PUT | `/api/departments/:id` | Update department |
| DELETE | `/api/departments/:id` | Delete department |
| GET | `/api/audit-logs` | Get audit logs |

---

## Models

Each model should include:
- Primary key (UUID)
- Timestamps (created_at, updated_at)
- Validation rules
- Associations/relationships
- Common methods (findAll, findById, create, update, delete)

Example model structure (patient.model.js):

```javascript
const db = require('../config/db.config');
const { v4: uuidv4 } = require('uuid');

const Patient = {
  tableName: 'patients',

  // Find all patients with pagination
  findAll: async (options = {}) => {
    const { page = 1, limit = 10, search, status } = options;
    const offset = (page - 1) * limit;
    
    let query = `SELECT * FROM patients WHERE 1=1`;
    const params = [];

    if (search) {
      query += ` AND (name LIKE ? OR patient_id LIKE ? OR phone LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await db.query(query, params);
    
    // Get total count
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM patients WHERE 1=1`
    );

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  // Find by ID
  findById: async (id) => {
    const [[row]] = await db.query(
      `SELECT * FROM patients WHERE id = ?`,
      [id]
    );
    return row;
  },

  // Create new patient
  create: async (data) => {
    const id = uuidv4();
    const patientId = await Patient.generatePatientId();
    
    const [result] = await db.query(
      `INSERT INTO patients (id, patient_id, name, age, gender, phone, email, 
        blood_group, address, status, insurance_provider, insurance_policy_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, patientId, data.name, data.age, data.gender, data.phone, 
       data.email, data.blood_group, data.address, data.status || 'Active',
       data.insurance_provider, data.insurance_policy_number]
    );

    return Patient.findById(id);
  },

  // Update patient
  update: async (id, data) => {
    const fields = [];
    const values = [];

    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && key !== 'id') {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    });

    values.push(id);

    await db.query(
      `UPDATE patients SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return Patient.findById(id);
  },

  // Delete patient
  delete: async (id) => {
    const [result] = await db.query(
      `DELETE FROM patients WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  },

  // Generate unique patient ID
  generatePatientId: async () => {
    const [[{ maxId }]] = await db.query(
      `SELECT MAX(CAST(SUBSTRING(patient_id, 5) AS UNSIGNED)) as maxId FROM patients`
    );
    const nextNum = (maxId || 0) + 1;
    return `PAT-${String(nextNum).padStart(3, '0')}`;
  }
};

module.exports = Patient;
```

---

## Controllers

Each controller should handle:
- Request validation
- Business logic
- Error handling
- Response formatting

Example controller structure (patient.controller.js):

```javascript
const Patient = require('../models/patient.model');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { validationResult } = require('express-validator');

const PatientController = {
  // Get all patients
  getAll: async (req, res) => {
    try {
      const { page, limit, search, status } = req.query;
      const result = await Patient.findAll({ page, limit, search, status });
      return successResponse(res, result, 'Patients retrieved successfully');
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },

  // Get patient by ID
  getById: async (req, res) => {
    try {
      const patient = await Patient.findById(req.params.id);
      if (!patient) {
        return errorResponse(res, 'Patient not found', 404);
      }
      return successResponse(res, patient, 'Patient retrieved successfully');
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },

  // Create new patient
  create: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Validation failed', 400, errors.array());
      }

      const patient = await Patient.create(req.body);
      return successResponse(res, patient, 'Patient created successfully', 201);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },

  // Update patient
  update: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Validation failed', 400, errors.array());
      }

      const patient = await Patient.findById(req.params.id);
      if (!patient) {
        return errorResponse(res, 'Patient not found', 404);
      }

      const updated = await Patient.update(req.params.id, req.body);
      return successResponse(res, updated, 'Patient updated successfully');
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  },

  // Delete patient
  delete: async (req, res) => {
    try {
      const patient = await Patient.findById(req.params.id);
      if (!patient) {
        return errorResponse(res, 'Patient not found', 404);
      }

      await Patient.delete(req.params.id);
      return successResponse(res, null, 'Patient deleted successfully');
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }
};

module.exports = PatientController;
```

---

## Routes

Example routes structure (patient.routes.js):

```javascript
const express = require('express');
const router = express.Router();
const PatientController = require('../controllers/patient.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { patientValidation } = require('../validators/patient.validator');

// All routes require authentication
router.use(authenticate);

// GET /api/patients - Get all patients
router.get('/', PatientController.getAll);

// GET /api/patients/:id - Get patient by ID
router.get('/:id', PatientController.getById);

// POST /api/patients - Create new patient
router.post('/', patientValidation.create, PatientController.create);

// PUT /api/patients/:id - Update patient
router.put('/:id', patientValidation.update, PatientController.update);

// DELETE /api/patients/:id - Delete patient (admin only)
router.delete('/:id', authorize(['admin']), PatientController.delete);

// GET /api/patients/:id/history - Get patient history
router.get('/:id/history', PatientController.getHistory);

// GET /api/patients/:id/appointments - Get patient appointments
router.get('/:id/appointments', PatientController.getAppointments);

// GET /api/patients/:id/bills - Get patient bills
router.get('/:id/bills', PatientController.getBills);

module.exports = router;
```

---

## Middleware

### Authentication Middleware (auth.middleware.js)

```javascript
const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/responseHandler');
const config = require('../config/auth.config');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.secret);
    
    req.userId = decoded.id;
    req.userRole = decoded.role;
    
    next();
  } catch (error) {
    return errorResponse(res, 'Invalid or expired token', 401);
  }
};

const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return errorResponse(res, 'Insufficient permissions', 403);
    }
    next();
  };
};

module.exports = { authenticate, authorize };
```

---

## Environment Variables

```env
# Server
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hospital_management

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_REFRESH_EXPIRES_IN=7d

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# CORS
CORS_ORIGIN=http://localhost:5173

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Logging
LOG_LEVEL=debug
```

---

## Quick Start Commands

```bash
# Initialize project
npm init -y

# Install dependencies
npm install express mysql2 jsonwebtoken bcryptjs cors dotenv express-validator uuid multer

# Install dev dependencies
npm install --save-dev nodemon

# Start development server
npm run dev

# Start production server
npm start
```

---

## Package.json Scripts

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "db:migrate": "node scripts/migrate.js",
    "db:seed": "node scripts/seed.js"
  }
}
```

---

## Notes

1. **Security**: Implement proper input validation, SQL injection prevention, and XSS protection.
2. **Error Handling**: Use a centralized error handling middleware.
3. **Logging**: Implement comprehensive logging for debugging and audit trails.
4. **Rate Limiting**: Add rate limiting for API endpoints.
5. **Caching**: Consider Redis for caching frequently accessed data.
6. **File Uploads**: Use cloud storage (AWS S3, etc.) for production.
7. **Testing**: Write unit and integration tests for all endpoints.
8. **Documentation**: Use Swagger/OpenAPI for API documentation.

---

*This specification is designed to sync with the existing frontend Hospital Management System.*
