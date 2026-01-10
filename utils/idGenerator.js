/**
 * ID Generator Utilities
 * Generates custom formatted IDs for different entity types
 */

const db = require('../config/db.config');

/**
 * Generate a unique ID with a prefix
 * @param {string} prefix - ID prefix (e.g., 'PAT', 'DOC')
 * @param {string} tableName - Database table name
 * @param {string} columnName - Column name for the ID
 * @returns {Promise<string>} - Generated ID
 */
const generateId = async (prefix, tableName, columnName) => {
    try {
        const [[result]] = await db.query(
            `SELECT MAX(CAST(SUBSTRING(${columnName}, ${prefix.length + 2}) AS UNSIGNED)) as maxId FROM ${tableName}`
        );
        const nextNum = (result?.maxId || 0) + 1;
        return `${prefix}-${String(nextNum).padStart(3, '0')}`;
    } catch (error) {
        // If table doesn't exist or other error, start from 001
        return `${prefix}-001`;
    }
};

/**
 * Generate Patient ID (PAT-001, PAT-002, ...)
 */
const generatePatientId = async () => {
    return generateId('PAT', 'patients', 'patient_id');
};

/**
 * Generate Doctor ID (DOC-001, DOC-002, ...)
 */
const generateDoctorId = async () => {
    return generateId('DOC', 'doctors', 'doctor_id');
};

/**
 * Generate Staff ID (STF-001, STF-002, ...)
 */
const generateStaffId = async () => {
    return generateId('STF', 'staff', 'staff_id');
};

/**
 * Generate Appointment ID (APT-001, APT-002, ...)
 */
const generateAppointmentId = async () => {
    return generateId('APT', 'appointments', 'appointment_id');
};

/**
 * Generate Emergency Case ID (ER-001, ER-002, ...)
 */
const generateEmergencyId = async () => {
    return generateId('ER', 'emergency_cases', 'case_id');
};

/**
 * Generate Surgery ID (SRG-001, SRG-002, ...)
 */
const generateSurgeryId = async () => {
    return generateId('SRG', 'surgeries', 'surgery_id');
};

/**
 * Generate ICU Admission ID (ICU-001, ICU-002, ...)
 */
const generateIcuAdmissionId = async () => {
    return generateId('ICU', 'icu_patients', 'admission_id');
};

/**
 * Generate OPD Visit ID (OPD-001, OPD-002, ...)
 */
const generateOpdVisitId = async () => {
    return generateId('OPD', 'opd_visits', 'visit_id');
};

/**
 * Generate IPD Admission ID (IPD-001, IPD-002, ...)
 */
const generateIpdAdmissionId = async () => {
    return generateId('IPD', 'ipd_admissions', 'admission_id');
};

/**
 * Generate Radiology Order ID (RAD-001, RAD-002, ...)
 */
const generateRadiologyId = async () => {
    return generateId('RAD', 'radiology_orders', 'order_id');
};

/**
 * Generate Lab Test ID (LAB-001, LAB-002, ...)
 */
const generateLabTestId = async () => {
    return generateId('LAB', 'lab_tests', 'test_id');
};

/**
 * Generate Blood Request ID (BRQ-001, BRQ-002, ...)
 */
const generateBloodRequestId = async () => {
    return generateId('BRQ', 'blood_requests', 'request_id');
};

/**
 * Generate Ambulance Call ID (AMB-001, AMB-002, ...)
 */
const generateAmbulanceCallId = async () => {
    return generateId('AMB', 'ambulance_calls', 'call_id');
};

/**
 * Generate Admission ID (ADM-001, ADM-002, ...)
 */
const generateAdmissionId = async () => {
    return generateId('ADM', 'admissions', 'admission_id');
};

/**
 * Generate Discharge ID (DIS-001, DIS-002, ...)
 */
const generateDischargeId = async () => {
    return generateId('DIS', 'discharges', 'discharge_id');
};

/**
 * Generate Bill Number (BILL-001, BILL-002, ...)
 */
const generateBillNumber = async () => {
    return generateId('BILL', 'bills', 'bill_number');
};

/**
 * Generate Payment ID (PAY-001, PAY-002, ...)
 */
const generatePaymentId = async () => {
    return generateId('PAY', 'payments', 'payment_id');
};

/**
 * Generate Insurance Claim ID (CLM-001, CLM-002, ...)
 */
const generateClaimId = async () => {
    return generateId('CLM', 'insurance_claims', 'claim_id');
};

/**
 * Generate Feedback ID (FBK-001, FBK-002, ...)
 */
const generateFeedbackId = async () => {
    return generateId('FBK', 'feedback', 'feedback_id');
};

/**
 * Generate Shift ID (SHF-001, SHF-002, ...)
 */
const generateShiftId = async () => {
    return generateId('SHF', 'shifts', 'shift_id');
};

/**
 * Generate Diet Plan ID (DPL-001, DPL-002, ...)
 */
const generateDietPlanId = async () => {
    return generateId('DPL', 'diet_plans', 'plan_id');
};

/**
 * Generate Meal Order ID (MOD-001, MOD-002, ...)
 */
const generateMealOrderId = async () => {
    return generateId('MOD', 'meal_orders', 'order_id');
};

module.exports = {
    generateId,
    generatePatientId,
    generateDoctorId,
    generateStaffId,
    generateAppointmentId,
    generateEmergencyId,
    generateSurgeryId,
    generateIcuAdmissionId,
    generateOpdVisitId,
    generateIpdAdmissionId,
    generateRadiologyId,
    generateLabTestId,
    generateBloodRequestId,
    generateAmbulanceCallId,
    generateAdmissionId,
    generateDischargeId,
    generateBillNumber,
    generatePaymentId,
    generateClaimId,
    generateFeedbackId,
    generateShiftId,
    generateDietPlanId,
    generateMealOrderId
};
