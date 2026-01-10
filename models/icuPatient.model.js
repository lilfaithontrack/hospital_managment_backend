/**
 * ICU Patient Model
 * Handles ICU admissions and patient monitoring
 */

const db = require('../config/db.config');
const { v4: uuidv4 } = require('uuid');
const { generateIcuAdmissionId } = require('../utils/idGenerator');

const IcuPatient = {
    tableName: 'icu_patients',

    findAll: async (options = {}) => {
        const { page = 1, limit = 10, status, condition_status } = options;
        const offset = (page - 1) * limit;

        let query = `SELECT i.*, p.name as patient_name, p.patient_id as patient_code,
                 d.name as doctor_name, b.bed_number
                 FROM icu_patients i
                 LEFT JOIN patients p ON i.patient_id = p.id
                 LEFT JOIN doctors d ON i.attending_doctor_id = d.id
                 LEFT JOIN icu_beds b ON i.bed_id = b.id
                 WHERE 1=1`;
        const params = [];

        if (status) { query += ` AND i.status = ?`; params.push(status); }
        if (condition_status) { query += ` AND i.condition_status = ?`; params.push(condition_status); }

        const countQuery = query.replace('SELECT i.*, p.name as patient_name, p.patient_id as patient_code, d.name as doctor_name, b.bed_number', 'SELECT COUNT(*) as total');
        const [countResult] = await db.query(countQuery, params);
        const total = countResult?.[0]?.total || 0;

        query += ` ORDER BY i.admission_date DESC LIMIT ? OFFSET ?`;
        params.push(Number(limit), Number(offset));

        const [rows] = await db.query(query, params);
        return { data: rows, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) } };
    },

    findById: async (id) => {
        const [[patient]] = await db.query(
            `SELECT i.*, p.name as patient_name, p.patient_id as patient_code, p.blood_group,
       d.name as doctor_name, b.bed_number
       FROM icu_patients i
       LEFT JOIN patients p ON i.patient_id = p.id
       LEFT JOIN doctors d ON i.attending_doctor_id = d.id
       LEFT JOIN icu_beds b ON i.bed_id = b.id
       WHERE i.id = ?`, [id]
        );
        return patient;
    },

    create: async (data) => {
        const id = uuidv4();
        const admissionId = await generateIcuAdmissionId();

        await db.query(
            `INSERT INTO icu_patients (
        id, admission_id, patient_id, bed_id, admission_date, admitting_diagnosis,
        attending_doctor_id, condition_status, ventilator_support, ventilator_settings,
        vital_signs, medications, isolation_required, isolation_type, status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, admissionId, data.patient_id, data.bed_id || null,
                data.admission_date || new Date(), data.admitting_diagnosis,
                data.attending_doctor_id || null, data.condition_status,
                data.ventilator_support || false,
                data.ventilator_settings ? JSON.stringify(data.ventilator_settings) : null,
                data.vital_signs ? JSON.stringify(data.vital_signs) : null,
                data.medications ? JSON.stringify(data.medications) : null,
                data.isolation_required || false, data.isolation_type || null,
                data.status || 'Active', data.notes || null]
        );

        // Update bed status
        if (data.bed_id) {
            await db.query(`UPDATE icu_beds SET status = 'Occupied' WHERE id = ?`, [data.bed_id]);
        }

        return IcuPatient.findById(id);
    },

    update: async (id, data) => {
        const allowedFields = ['bed_id', 'attending_doctor_id', 'condition_status',
            'ventilator_support', 'ventilator_settings', 'vital_signs', 'medications',
            'isolation_required', 'isolation_type', 'status', 'notes',
            'discharge_date', 'discharge_disposition'];

        const fields = [];
        const values = [];

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                if (['ventilator_settings', 'vital_signs', 'medications'].includes(field) && typeof data[field] === 'object') {
                    fields.push(`${field} = ?`);
                    values.push(JSON.stringify(data[field]));
                } else {
                    fields.push(`${field} = ?`);
                    values.push(data[field]);
                }
            }
        }

        if (fields.length === 0) return IcuPatient.findById(id);
        values.push(id);

        await db.query(`UPDATE icu_patients SET ${fields.join(', ')} WHERE id = ?`, values);
        return IcuPatient.findById(id);
    },

    updateVitals: async (icuPatientId, vitals, recordedBy = null) => {
        const id = uuidv4();
        await db.query(
            `INSERT INTO icu_vitals_log (
        id, icu_patient_id, recorded_at, recorded_by, blood_pressure_systolic,
        blood_pressure_diastolic, heart_rate, temperature, respiratory_rate,
        spo2, cvp, urine_output, notes
      ) VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, icuPatientId, recordedBy, vitals.bp_systolic, vitals.bp_diastolic,
                vitals.heart_rate, vitals.temperature, vitals.respiratory_rate,
                vitals.spo2, vitals.cvp || null, vitals.urine_output || null, vitals.notes || null]
        );

        // Update current vitals
        await db.query(
            `UPDATE icu_patients SET vital_signs = ? WHERE id = ?`,
            [JSON.stringify(vitals), icuPatientId]
        );

        return IcuPatient.findById(icuPatientId);
    },

    discharge: async (id, data) => {
        const patient = await IcuPatient.findById(id);
        if (!patient) return null;

        await db.query(
            `UPDATE icu_patients SET status = 'Discharged', discharge_date = NOW(),
       discharge_disposition = ? WHERE id = ?`,
            [data.disposition, id]
        );

        // Release bed
        if (patient.bed_id) {
            await db.query(`UPDATE icu_beds SET status = 'Available' WHERE id = ?`, [patient.bed_id]);
        }

        return IcuPatient.findById(id);
    },

    getBeds: async () => {
        const [beds] = await db.query(`SELECT * FROM icu_beds ORDER BY bed_number`);
        return beds;
    },

    getVitalsHistory: async (icuPatientId, limit = 24) => {
        const [vitals] = await db.query(
            `SELECT * FROM icu_vitals_log WHERE icu_patient_id = ? ORDER BY recorded_at DESC LIMIT ?`,
            [icuPatientId, limit]
        );
        return vitals;
    },

    getStats: async () => {
        const [[stats]] = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM icu_beds) as total_beds,
        (SELECT COUNT(*) FROM icu_beds WHERE status = 'Available') as available_beds,
        (SELECT COUNT(*) FROM icu_patients WHERE status = 'Active') as active_patients,
        (SELECT COUNT(*) FROM icu_patients WHERE status = 'Active' AND ventilator_support = 1) as on_ventilator
    `);
        return stats;
    }
};

module.exports = IcuPatient;
