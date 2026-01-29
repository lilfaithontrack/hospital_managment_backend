/**
 * Insurance Claim Model
 * Handles insurance claims and documents
 */

const db = require('../config/db.config');
const { v4: uuidv4 } = require('uuid');

const InsuranceClaim = {
    tableName: 'insurance_claims',

    /**
     * Find all claims
     */
    findAll: async (options = {}) => {
        const { page = 1, limit = 10, status, provider_id, patient_id } = options;
        const offset = (page - 1) * limit;

        let query = `SELECT c.*, 
                            p.name as patient_name,
                            ip.name as provider_name,
                            b.bill_number
                     FROM insurance_claims c
                     LEFT JOIN patients p ON c.patient_id = p.id
                     LEFT JOIN insurance_providers ip ON c.insurance_provider_id = ip.id
                     LEFT JOIN bills b ON c.bill_id = b.id
                     WHERE 1=1`;
        const params = [];

        if (status) {
            query += ` AND c.status = ?`;
            params.push(status);
        }
        if (provider_id) {
            query += ` AND c.insurance_provider_id = ?`;
            params.push(provider_id);
        }
        if (patient_id) {
            query += ` AND c.patient_id = ?`;
            params.push(patient_id);
        }

        const countQuery = query.replace('SELECT c.*, \n                            p.name as patient_name,\n                            ip.name as provider_name,\n                            b.bill_number', 'SELECT COUNT(*) as total');
        const [countResult] = await db.query(countQuery, params);
        const total = countResult?.[0]?.total || 0;

        query += ` ORDER BY c.created_at DESC LIMIT ? OFFSET ?`;
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
     * Find claim by ID
     */
    findById: async (id) => {
        const [[claim]] = await db.query(
            `SELECT c.*, 
                    p.name as patient_name,
                    ip.name as provider_name
             FROM insurance_claims c
             LEFT JOIN patients p ON c.patient_id = p.id
             LEFT JOIN insurance_providers ip ON c.insurance_provider_id = ip.id
             WHERE c.id = ?`,
            [id]
        );
        return claim;
    },

    /**
     * Create new claim
     */
    create: async (data) => {
        const id = uuidv4();
        // Generate a simple claim number
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomStr = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const claimNumber = `CLM-${dateStr}-${randomStr}`;

        await db.query(
            `INSERT INTO insurance_claims (
                id, claim_number, bill_id, patient_id, insurance_provider_id,
                amount, status, documents, notes, created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id, claimNumber, data.bill_id, data.patient_id, data.insurance_provider_id,
                data.amount, data.status || 'Pending',
                data.documents ? JSON.stringify(data.documents) : null,
                data.notes || null, data.created_by || null
            ]
        );

        return InsuranceClaim.findById(id);
    },

    /**
     * Update claim status (Admin action)
     */
    updateStatus: async (id, status, adminNotes) => {
        await db.query(
            `UPDATE insurance_claims SET status = ?, admin_notes = ? WHERE id = ?`,
            [status, adminNotes, id]
        );
        return InsuranceClaim.findById(id);
    },

    /**
     * Update claim details
     */
    update: async (id, data) => {
        const allowedFields = ['amount', 'notes', 'documents'];
        const fields = [];
        const values = [];

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                fields.push(`${field} = ?`);
                values.push(field === 'documents' ? JSON.stringify(data[field]) : data[field]);
            }
        }

        if (fields.length === 0) return InsuranceClaim.findById(id);
        values.push(id);

        await db.query(`UPDATE insurance_claims SET ${fields.join(', ')} WHERE id = ?`, values);
        return InsuranceClaim.findById(id);
    }
};

module.exports = InsuranceClaim;
