/**
 * Models Index
 * Exports all models for easy importing
 */

const User = require('./user.model');
const UserRole = require('./userRole.model');
const Department = require('./department.model');
const Patient = require('./patient.model');
const Doctor = require('./doctor.model');
const Staff = require('./staff.model');
const Appointment = require('./appointment.model');
const Ward = require('./ward.model');
const Bed = require('./bed.model');
const Room = require('./room.model');
const Emergency = require('./emergency.model');
const Surgery = require('./surgery.model');
const IcuPatient = require('./icuPatient.model');
const OpdVisit = require('./opdVisit.model');
const IpdAdmission = require('./ipdAdmission.model');
const LabTest = require('./labTest.model');
const RadiologyOrder = require('./radiologyOrder.model');
const BloodBank = require('./bloodBank.model');
const Pharmacy = require('./pharmacy.model');
const Billing = require('./billing.model');

module.exports = {
    User,
    UserRole,
    Department,
    Patient,
    Doctor,
    Staff,
    Appointment,
    Ward,
    Bed,
    Room,
    Emergency,
    Surgery,
    IcuPatient,
    OpdVisit,
    IpdAdmission,
    LabTest,
    RadiologyOrder,
    BloodBank,
    Pharmacy,
    Billing
};
