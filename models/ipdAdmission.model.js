/**
 * IPD Admission Model
 * Handles inpatient department admissions
 */

const db = require('../config/db.config');
const { v4: uuidv4 } = require('uuid');
const { generateIpdAdmissionId } = require('../utils/idGenerator');

const IpdAdmission = {
    tableName: 'ipd_admissions',

    findAll: async (options = {}) => {
        const { page = 1, limit = 10, status, admission_type, doctor_id } = options;
        const offset = (page - 1) * limit;

        let query = `SELECT i.*, p.name as patient_name, p.patient_id as patient_code,
                 d.name as doctor_name, b.bed_number, w.name as ward_name
                 FROM ipd_admissions i
                 LEFT JOIN patients p ON i.patient_id = p.id
                 LEFT JOIN doctors d ON i.attending_doctor_id = d.id
                 LEFT JOIN beds b ON i.bed_id = b.id
                 LEFT JOIN wards w ON b.ward_id = w.id
                 WHERE 1=1`;
        const params = [];

        if (status) { query += ` AND i.status = ?`; params.push(status); }
        if (admission_type) { query += ` AND i.admission_type = ?`; params.push(admission_type); }
        if (doctor_id) { query += ` AND i.attending_doctor_id = ?`; params.push(doctor_id); }

        const countQuery = query.replace('SELECT i.*, p.name as patient_name, p.patient_id as patient_code, d.name as doctor_name, b.bed_number, w.name as ward_name', 'SELECT COUNT(*) as total');
        const [countResult] = await db.query(countQuery, params);
        const total = countResult?.[0]?.total || 0;

        query += ` ORDER BY i.admission_date DESC LIMIT ? OFFSET ?`;
        params.push(Number(limit), Number(offset));

        const [rows] = await db.query(query, params);
        return { data: rows, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) } };
    },

    findById: async (id) => {
        const [[admission]] = await db.query(
            `SELECT i.*, p.name as patient_name, p.patient_id as patient_code, p.blood_group, p.phone as patient_phone,
       d.name as doctor_name, b.bed_number, w.name as ward_name
       FROM ipd_admissions i
       LEFT JOIN patients p ON i.patient_id = p.id
       LEFT JOIN doctors d ON i.attending_doctor_id = d.id
       LEFT JOIN beds b ON i.bed_id = b.id
       LEFT JOIN wards w ON b.ward_id = w.id
       WHERE i.id = ?`, [id]
        );
        return admission;
    },

    create: async (data) => {
        const id = uuidv4();
        const admissionId = await generateIpdAdmissionId();

        await db.query(
            `INSERT INTO ipd_admissions (
        id, admission_id, patient_id, bed_id, admission_date, admitting_doctor_id,
        attending_doctor_id, admission_type, admitting_diagnosis, chief_complaints,
        history, treatment_plan, diet_type, special_instructions, expected_discharge_date, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, admissionId, data.patient_id, data.bed_id || null,
                data.admission_date || new Date(), data.admitting_doctor_id || null,
                data.attending_doctor_id || null, data.admission_type || 'Regular',
                data.admitting_diagnosis || 'Pending evaluation', data.chief_complaints || null,
                data.history || null, data.treatment_plan || null,
                data.diet_type || null, data.special_instructions || null,
                data.expected_discharge_date || null, data.status || 'Active']
        );

        // Update bed status
        if (data.bed_id) {
            await db.query(`UPDATE beds SET status = 'Occupied' WHERE id = ?`, [data.bed_id]);
        }

        return IpdAdmission.findById(id);
    },

    update: async (id, data) => {
        const allowedFields = ['bed_id', 'attending_doctor_id', 'admitting_diagnosis',
            'chief_complaints', 'history', 'treatment_plan', 'diet_type', 'special_instructions',
            'expected_discharge_date', 'status'];

        const fields = [];
        const values = [];

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                fields.push(`${field} = ?`);
                values.push(data[field]);
            }
        }

        if (fields.length === 0) return IpdAdmission.findById(id);
        values.push(id);

        await db.query(`UPDATE ipd_admissions SET ${fields.join(', ')} WHERE id = ?`, values);
        return IpdAdmission.findById(id);
    },

    bedTransfer: async (id, newBedId) => {
        const admission = await IpdAdmission.findById(id);
        if (!admission) return null;

        // Release old bed
        if (admission.bed_id) {
            await db.query(`UPDATE beds SET status = 'Available' WHERE id = ?`, [admission.bed_id]);
        }

        // Assign new bed
        await db.query(`UPDATE beds SET status = 'Occupied' WHERE id = ?`, [newBedId]);
        await db.query(`UPDATE ipd_admissions SET bed_id = ? WHERE id = ?`, [newBedId, id]);

        return IpdAdmission.findById(id);
    },

    discharge: async (id, data) => {
        const admission = await IpdAdmission.findById(id);
        if (!admission) return null;

        await db.query(
            `UPDATE ipd_admissions SET status = 'Discharged', actual_discharge_date = NOW(),
       discharge_type = ?, discharge_summary = ? WHERE id = ?`,
            [data.discharge_type, data.discharge_summary || null, id]
        );

        // Release bed
        if (admission.bed_id) {
            await db.query(`UPDATE beds SET status = 'Available' WHERE id = ?`, [admission.bed_id]);
        }

        return IpdAdmission.findById(id);
    },

    getActive: async () => {
        const [admissions] = await db.query(
            `SELECT i.*, p.name as patient_name, p.patient_id as patient_code, b.bed_number, w.name as ward_name
       FROM ipd_admissions i
       LEFT JOIN patients p ON i.patient_id = p.id
       LEFT JOIN beds b ON i.bed_id = b.id
       LEFT JOIN wards w ON b.ward_id = w.id
       WHERE i.status = 'Active'
       ORDER BY i.admission_date DESC`
        );
        return admissions;
    },

    getAvailableBeds: async () => {
        const [beds] = await db.query(
            `SELECT b.*, w.name as ward_name, w.type as ward_type
       FROM beds b
       LEFT JOIN wards w ON b.ward_id = w.id
       WHERE b.status = 'Available'
       ORDER BY w.name, b.bed_number`
        );
        return beds;
    }
};

module.exports = IpdAdmission;
