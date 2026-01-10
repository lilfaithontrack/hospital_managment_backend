/**
 * OPD Visit Model
 * Handles outpatient department visits
 */

const db = require('../config/db.config');
const { v4: uuidv4 } = require('uuid');
const { generateOpdVisitId } = require('../utils/idGenerator');

const OpdVisit = {
    tableName: 'opd_visits',

    findAll: async (options = {}) => {
        const { page = 1, limit = 10, date, doctor_id, department_id, status } = options;
        const offset = (page - 1) * limit;

        let query = `SELECT o.*, p.name as patient_name, p.patient_id as patient_code,
                 d.name as doctor_name, dep.name as department_name
                 FROM opd_visits o
                 LEFT JOIN patients p ON o.patient_id = p.id
                 LEFT JOIN doctors d ON o.doctor_id = d.id
                 LEFT JOIN departments dep ON o.department_id = dep.id
                 WHERE 1=1`;
        const params = [];

        if (date) { query += ` AND o.visit_date = ?`; params.push(date); }
        if (doctor_id) { query += ` AND o.doctor_id = ?`; params.push(doctor_id); }
        if (department_id) { query += ` AND o.department_id = ?`; params.push(department_id); }
        if (status) { query += ` AND o.status = ?`; params.push(status); }

        const countQuery = query.replace('SELECT o.*, p.name as patient_name, p.patient_id as patient_code, d.name as doctor_name, dep.name as department_name', 'SELECT COUNT(*) as total');
        const [countResult] = await db.query(countQuery, params);
        const total = countResult?.[0]?.total || 0;

        query += ` ORDER BY o.visit_date DESC, o.token_number ASC LIMIT ? OFFSET ?`;
        params.push(Number(limit), Number(offset));

        const [rows] = await db.query(query, params);
        return { data: rows, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) } };
    },

    findById: async (id) => {
        const [[visit]] = await db.query(
            `SELECT o.*, p.name as patient_name, p.patient_id as patient_code, p.phone as patient_phone,
       d.name as doctor_name, dep.name as department_name
       FROM opd_visits o
       LEFT JOIN patients p ON o.patient_id = p.id
       LEFT JOIN doctors d ON o.doctor_id = d.id
       LEFT JOIN departments dep ON o.department_id = dep.id
       WHERE o.id = ?`, [id]
        );
        return visit;
    },

    create: async (data) => {
        const id = uuidv4();
        const visitId = await generateOpdVisitId();

        // Get next token number for the day and doctor
        const [[{ maxToken }]] = await db.query(
            `SELECT MAX(token_number) as maxToken FROM opd_visits 
       WHERE visit_date = ? AND doctor_id = ?`,
            [data.visit_date, data.doctor_id]
        );
        const tokenNumber = (maxToken || 0) + 1;

        await db.query(
            `INSERT INTO opd_visits (
        id, visit_id, patient_id, doctor_id, visit_date, visit_time, token_number,
        department_id, chief_complaint, history_of_present_illness, past_medical_history,
        vitals, examination_findings, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, visitId, data.patient_id, data.doctor_id, data.visit_date,
                data.visit_time, tokenNumber, data.department_id || null,
                data.chief_complaint || null, data.history_of_present_illness || null,
                data.past_medical_history || null,
                data.vitals ? JSON.stringify(data.vitals) : null,
                data.examination_findings || null, data.status || 'Waiting']
        );

        return OpdVisit.findById(id);
    },

    update: async (id, data) => {
        const allowedFields = ['chief_complaint', 'history_of_present_illness', 'past_medical_history',
            'vitals', 'examination_findings', 'diagnosis', 'prescription', 'investigations_ordered',
            'procedures_done', 'follow_up_date', 'follow_up_instructions', 'referral_to', 'status'];

        const fields = [];
        const values = [];

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                if (['vitals', 'investigations_ordered'].includes(field) && typeof data[field] === 'object') {
                    fields.push(`${field} = ?`);
                    values.push(JSON.stringify(data[field]));
                } else {
                    fields.push(`${field} = ?`);
                    values.push(data[field]);
                }
            }
        }

        if (fields.length === 0) return OpdVisit.findById(id);
        values.push(id);

        await db.query(`UPDATE opd_visits SET ${fields.join(', ')} WHERE id = ?`, values);
        return OpdVisit.findById(id);
    },

    addPrescription: async (id, prescription) => {
        await db.query(`UPDATE opd_visits SET prescription = ? WHERE id = ?`, [prescription, id]);
        return OpdVisit.findById(id);
    },

    getToday: async (doctorId = null) => {
        const today = new Date().toISOString().split('T')[0];
        let query = `SELECT o.*, p.name as patient_name, p.patient_id as patient_code
                 FROM opd_visits o
                 LEFT JOIN patients p ON o.patient_id = p.id
                 WHERE o.visit_date = ?`;
        const params = [today];

        if (doctorId) { query += ` AND o.doctor_id = ?`; params.push(doctorId); }
        query += ` ORDER BY o.token_number ASC`;

        const [visits] = await db.query(query, params);
        return visits;
    },

    getQueue: async (doctorId) => {
        const today = new Date().toISOString().split('T')[0];
        const [queue] = await db.query(
            `SELECT o.id, o.visit_id, o.token_number, o.status, p.name as patient_name, p.patient_id as patient_code
       FROM opd_visits o
       LEFT JOIN patients p ON o.patient_id = p.id
       WHERE o.visit_date = ? AND o.doctor_id = ? AND o.status IN ('Waiting', 'In Consultation')
       ORDER BY o.token_number ASC`,
            [today, doctorId]
        );
        return queue;
    }
};

module.exports = OpdVisit;
