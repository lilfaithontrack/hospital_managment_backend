/**
 * Patient Model
 * Handles patient data management
 */

const db = require('../config/db.config');
const { v4: uuidv4 } = require('uuid');
const { generatePatientId } = require('../utils/idGenerator');

const Patient = {
    tableName: 'patients',

    /**
     * Find all patients with pagination
     */
    findAll: async (options = {}) => {
        const { page = 1, limit = 10, search, status, blood_group } = options;
        const offset = (page - 1) * limit;

        let query = `SELECT * FROM patients WHERE 1=1`;
        const params = [];

        if (search) {
            query += ` AND (name LIKE ? OR patient_id LIKE ? OR phone LIKE ? OR email LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (status) {
            query += ` AND status = ?`;
            params.push(status);
        }

        if (blood_group) {
            query += ` AND blood_group = ?`;
            params.push(blood_group);
        }

        // Get total count
        const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
        const [countResult] = await db.query(countQuery, params);
        const total = countResult?.[0]?.total || 0;

        query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        params.push(Number(limit), Number(offset));

        const [rows] = await db.query(query, params);

        return {
            data: rows,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    },

    /**
     * Find patient by ID
     */
    findById: async (id) => {
        const [[patient]] = await db.query(
            `SELECT * FROM patients WHERE id = ?`,
            [id]
        );
        return patient;
    },

    /**
     * Find patient by patient_id (custom ID like PAT-001)
     */
    findByPatientId: async (patientId) => {
        const [[patient]] = await db.query(
            `SELECT * FROM patients WHERE patient_id = ?`,
            [patientId]
        );
        return patient;
    },

    /**
     * Create new patient
     */
    create: async (data) => {
        const id = uuidv4();
        const patientId = await generatePatientId();

        await db.query(
            `INSERT INTO patients (
        id, patient_id, name, age, gender, date_of_birth, phone, email,
        address, emergency_contact_name, emergency_contact_phone,
        blood_group, allergies, medical_history,
        insurance_provider, insurance_policy_number, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id, patientId, data.name, data.age, data.gender, data.date_of_birth || null,
                data.phone, data.email || null, data.address || null,
                data.emergency_contact_name || null, data.emergency_contact_phone || null,
                data.blood_group || null, data.allergies || null, data.medical_history || null,
                data.insurance_provider || null, data.insurance_policy_number || null,
                data.status || 'Active'
            ]
        );

        return Patient.findById(id);
    },

    /**
     * Update patient
     */
    update: async (id, data) => {
        const allowedFields = [
            'name', 'age', 'gender', 'date_of_birth', 'phone', 'email', 'address',
            'emergency_contact_name', 'emergency_contact_phone', 'blood_group',
            'allergies', 'medical_history', 'insurance_provider', 'insurance_policy_number',
            'status', 'last_visit'
        ];

        const fields = [];
        const values = [];

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                fields.push(`${field} = ?`);
                values.push(data[field]);
            }
        }

        if (fields.length === 0) return Patient.findById(id);

        values.push(id);

        await db.query(
            `UPDATE patients SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return Patient.findById(id);
    },

    /**
     * Delete patient
     */
    delete: async (id) => {
        const [result] = await db.query(
            `DELETE FROM patients WHERE id = ?`,
            [id]
        );
        return result.affectedRows > 0;
    },

    /**
     * Search patients
     */
    search: async (searchTerm) => {
        const [patients] = await db.query(
            `SELECT id, patient_id, name, age, gender, phone, status 
       FROM patients 
       WHERE name LIKE ? OR patient_id LIKE ? OR phone LIKE ?
       LIMIT 20`,
            [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]
        );
        return patients;
    },

    /**
     * Get patient medical history
     */
    getHistory: async (patientId) => {
        // Get appointments
        const [appointments] = await db.query(
            `SELECT a.*, d.name as doctor_name, d.specialization
       FROM appointments a
       LEFT JOIN doctors d ON a.doctor_id = d.id
       WHERE a.patient_id = ?
       ORDER BY a.appointment_date DESC
       LIMIT 50`,
            [patientId]
        );

        // Get admissions
        const [admissions] = await db.query(
            `SELECT * FROM admissions WHERE patient_id = ? ORDER BY admission_date DESC LIMIT 20`,
            [patientId]
        );

        // Get lab tests
        const [labTests] = await db.query(
            `SELECT * FROM lab_tests WHERE patient_id = ? ORDER BY order_date DESC LIMIT 20`,
            [patientId]
        );

        return { appointments, admissions, labTests };
    },

    /**
     * Get patient appointments
     */
    getAppointments: async (patientId, options = {}) => {
        const { page = 1, limit = 10, status } = options;
        const offset = (page - 1) * limit;

        let query = `SELECT a.*, d.name as doctor_name, d.specialization
                 FROM appointments a
                 LEFT JOIN doctors d ON a.doctor_id = d.id
                 WHERE a.patient_id = ?`;
        const params = [patientId];

        if (status) {
            query += ` AND a.status = ?`;
            params.push(status);
        }

        const countQuery = query.replace('SELECT a.*, d.name as doctor_name, d.specialization', 'SELECT COUNT(*) as total');
        const [countResult] = await db.query(countQuery, params);
        const total = countResult?.[0]?.total || 0;

        query += ` ORDER BY a.appointment_date DESC LIMIT ? OFFSET ?`;
        params.push(Number(limit), Number(offset));

        const [rows] = await db.query(query, params);

        return {
            data: rows,
            pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) }
        };
    },

    /**
     * Get patient bills
     */
    getBills: async (patientId) => {
        const [bills] = await db.query(
            `SELECT * FROM bills WHERE patient_id = ? ORDER BY bill_date DESC`,
            [patientId]
        );
        return bills;
    },

    /**
     * Get patient count by status
     */
    getCountByStatus: async () => {
        const [results] = await db.query(
            `SELECT status, COUNT(*) as count FROM patients GROUP BY status`
        );
        return results;
    },

    /**
     * Update last visit
     */
    updateLastVisit: async (id) => {
        await db.query(
            `UPDATE patients SET last_visit = CURDATE() WHERE id = ?`,
            [id]
        );
    }
};

module.exports = Patient;
