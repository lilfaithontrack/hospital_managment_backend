/**
 * Emergency Model
 * Handles emergency cases management
 */

const db = require('../config/db.config');
const { v4: uuidv4 } = require('uuid');
const { generateEmergencyId } = require('../utils/idGenerator');

const Emergency = {
    tableName: 'emergency_cases',

    findAll: async (options = {}) => {
        const { page = 1, limit = 10, status, triage_level, date } = options;
        const offset = (page - 1) * limit;

        let query = `SELECT e.*, d.name as doctor_name, s.name as nurse_name
                 FROM emergency_cases e
                 LEFT JOIN doctors d ON e.assigned_doctor_id = d.id
                 LEFT JOIN staff s ON e.assigned_nurse_id = s.id
                 WHERE 1=1`;
        const params = [];

        if (status) { query += ` AND e.status = ?`; params.push(status); }
        if (triage_level) { query += ` AND e.triage_level = ?`; params.push(triage_level); }
        if (date) { query += ` AND DATE(e.arrival_time) = ?`; params.push(date); }

        const countQuery = query.replace('SELECT e.*, d.name as doctor_name, s.name as nurse_name', 'SELECT COUNT(*) as total');
        const [countResult] = await db.query(countQuery, params);
        const total = countResult?.[0]?.total || 0;

        query += ` ORDER BY e.arrival_time DESC LIMIT ? OFFSET ?`;
        params.push(Number(limit), Number(offset));

        const [rows] = await db.query(query, params);
        rows.forEach(row => {
            if (row.vitals && typeof row.vitals === 'string') {
                try { row.vitals = JSON.parse(row.vitals); } catch (e) { row.vitals = null; }
            }
        });

        return { data: rows, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) } };
    },

    findById: async (id) => {
        const [[emergency]] = await db.query(
            `SELECT e.*, d.name as doctor_name, s.name as nurse_name, p.patient_id as patient_code
       FROM emergency_cases e
       LEFT JOIN doctors d ON e.assigned_doctor_id = d.id
       LEFT JOIN staff s ON e.assigned_nurse_id = s.id
       LEFT JOIN patients p ON e.patient_id = p.id
       WHERE e.id = ?`, [id]
        );
        if (emergency?.vitals && typeof emergency.vitals === 'string') {
            try { emergency.vitals = JSON.parse(emergency.vitals); } catch (e) { emergency.vitals = null; }
        }
        return emergency;
    },

    create: async (data) => {
        const id = uuidv4();
        const caseId = await generateEmergencyId();

        await db.query(
            `INSERT INTO emergency_cases (
        id, case_id, patient_id, patient_name, age, gender, arrival_time,
        chief_complaint, triage_level, triage_color, vitals, assigned_doctor_id,
        assigned_nurse_id, bed_number, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, caseId, data.patient_id || null, data.patient_name, data.age || null,
                data.gender || null, data.arrival_time || new Date(),
                data.chief_complaint, data.triage_level, data.triage_color,
                data.vitals ? JSON.stringify(data.vitals) : null,
                data.assigned_doctor_id || null, data.assigned_nurse_id || null,
                data.bed_number || null, data.status || 'Waiting']
        );

        return Emergency.findById(id);
    },

    update: async (id, data) => {
        const allowedFields = ['patient_id', 'patient_name', 'age', 'gender', 'chief_complaint',
            'triage_level', 'triage_color', 'vitals', 'assigned_doctor_id', 'assigned_nurse_id',
            'bed_number', 'status', 'diagnosis', 'treatment_given', 'disposition', 'disposition_time', 'notes'];

        const fields = [];
        const values = [];

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                if (field === 'vitals' && typeof data[field] === 'object') {
                    fields.push(`${field} = ?`);
                    values.push(JSON.stringify(data[field]));
                } else {
                    fields.push(`${field} = ?`);
                    values.push(data[field]);
                }
            }
        }

        if (fields.length === 0) return Emergency.findById(id);
        values.push(id);

        await db.query(`UPDATE emergency_cases SET ${fields.join(', ')} WHERE id = ?`, values);
        return Emergency.findById(id);
    },

    delete: async (id) => {
        const [result] = await db.query(`DELETE FROM emergency_cases WHERE id = ?`, [id]);
        return result.affectedRows > 0;
    },

    getActive: async () => {
        const [cases] = await db.query(
            `SELECT e.*, d.name as doctor_name
       FROM emergency_cases e
       LEFT JOIN doctors d ON e.assigned_doctor_id = d.id
       WHERE e.status NOT IN ('Discharged', 'Deceased', 'Transferred')
       ORDER BY FIELD(e.triage_level, 'Resuscitation', 'Critical', 'Urgent', 'Less Urgent', 'Non-Urgent'), e.arrival_time ASC`
        );
        return cases;
    },

    getStats: async () => {
        const [[stats]] = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status NOT IN ('Discharged', 'Deceased', 'Transferred') THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN triage_level = 'Critical' AND status NOT IN ('Discharged', 'Deceased', 'Transferred') THEN 1 ELSE 0 END) as critical
      FROM emergency_cases WHERE DATE(arrival_time) = CURDATE()
    `);
        return stats;
    }
};

module.exports = Emergency;
