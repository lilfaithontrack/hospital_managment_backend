/**
 * Lab Test Model
 * Handles laboratory test orders and results
 */

const db = require('../config/db.config');
const { v4: uuidv4 } = require('uuid');
const { generateLabTestId } = require('../utils/idGenerator');

const LabTest = {
    tableName: 'lab_tests',

    findAll: async (options = {}) => {
        const { page = 1, limit = 10, status, test_type, patient_id, doctor_id, priority } = options;
        const offset = (page - 1) * limit;

        let query = `SELECT l.*, p.name as patient_name, p.patient_id as patient_code,
                 d.name as doctor_name
                 FROM lab_tests l
                 LEFT JOIN patients p ON l.patient_id = p.id
                 LEFT JOIN doctors d ON l.ordering_doctor_id = d.id
                 WHERE 1=1`;
        const params = [];

        if (status) { query += ` AND l.status = ?`; params.push(status); }
        if (test_type) { query += ` AND l.test_type = ?`; params.push(test_type); }
        if (patient_id) { query += ` AND l.patient_id = ?`; params.push(patient_id); }
        if (doctor_id) { query += ` AND l.ordering_doctor_id = ?`; params.push(doctor_id); }
        if (priority) { query += ` AND l.priority = ?`; params.push(priority); }

        const countQuery = query.replace('SELECT l.*, p.name as patient_name, p.patient_id as patient_code, d.name as doctor_name', 'SELECT COUNT(*) as total');
        const [countResult] = await db.query(countQuery, params);
        const total = countResult?.[0]?.total || 0;

        query += ` ORDER BY l.order_date DESC LIMIT ? OFFSET ?`;
        params.push(Number(limit), Number(offset));

        const [rows] = await db.query(query, params);
        return { data: rows, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) } };
    },

    findById: async (id) => {
        const [[test]] = await db.query(
            `SELECT l.*, p.name as patient_name, p.patient_id as patient_code, d.name as doctor_name
       FROM lab_tests l
       LEFT JOIN patients p ON l.patient_id = p.id
       LEFT JOIN doctors d ON l.ordering_doctor_id = d.id
       WHERE l.id = ?`, [id]
        );
        if (test?.results && typeof test.results === 'string') {
            try { test.results = JSON.parse(test.results); } catch (e) { test.results = null; }
        }
        return test;
    },

    create: async (data) => {
        const id = uuidv4();
        const testId = await generateLabTestId();

        await db.query(
            `INSERT INTO lab_tests (
        id, test_id, patient_id, ordering_doctor_id, test_catalog_id, test_name,
        test_type, priority, clinical_notes, fasting_required, order_date, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, testId, data.patient_id, data.ordering_doctor_id, data.test_catalog_id || null,
                data.test_name, data.test_type, data.priority || 'Routine',
                data.clinical_notes || null, data.fasting_required || false,
                data.order_date || new Date(), data.status || 'Ordered']
        );

        return LabTest.findById(id);
    },

    update: async (id, data) => {
        const allowedFields = ['status', 'sample_collected_at', 'sample_collected_by',
            'sample_received_at', 'processed_at', 'processed_by', 'verified_by', 'verified_at',
            'results', 'result_text', 'abnormal_flags', 'interpretation', 'report_url'];

        const fields = [];
        const values = [];

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                if (['results', 'abnormal_flags'].includes(field) && typeof data[field] === 'object') {
                    fields.push(`${field} = ?`);
                    values.push(JSON.stringify(data[field]));
                } else {
                    fields.push(`${field} = ?`);
                    values.push(data[field]);
                }
            }
        }

        if (fields.length === 0) return LabTest.findById(id);
        values.push(id);

        await db.query(`UPDATE lab_tests SET ${fields.join(', ')} WHERE id = ?`, values);
        return LabTest.findById(id);
    },

    collectSample: async (id, collectedBy) => {
        await db.query(
            `UPDATE lab_tests SET status = 'Sample Collected', sample_collected_at = NOW(), sample_collected_by = ? WHERE id = ?`,
            [collectedBy, id]
        );
        return LabTest.findById(id);
    },

    addResults: async (id, results, resultText = null) => {
        await db.query(
            `UPDATE lab_tests SET status = 'Completed', results = ?, result_text = ?, processed_at = NOW() WHERE id = ?`,
            [JSON.stringify(results), resultText, id]
        );
        return LabTest.findById(id);
    },

    verify: async (id, verifiedBy) => {
        await db.query(
            `UPDATE lab_tests SET status = 'Verified', verified_by = ?, verified_at = NOW() WHERE id = ?`,
            [verifiedBy, id]
        );
        return LabTest.findById(id);
    },

    getCatalog: async () => {
        const [catalog] = await db.query(`SELECT * FROM lab_test_catalog WHERE is_active = 1 ORDER BY test_name`);
        return catalog;
    },

    getPending: async () => {
        const [tests] = await db.query(
            `SELECT l.*, p.name as patient_name, p.patient_id as patient_code
       FROM lab_tests l
       LEFT JOIN patients p ON l.patient_id = p.id
       WHERE l.status IN ('Ordered', 'Sample Collected', 'Processing')
       ORDER BY FIELD(l.priority, 'STAT', 'Urgent', 'Routine'), l.order_date ASC`
        );
        return tests;
    }
};

module.exports = LabTest;
