/**
 * Insurance Provider Model
 * Handles insurance company data
 */

const db = require('../config/db.config');
const { v4: uuidv4 } = require('uuid');

const InsuranceProvider = {
    tableName: 'insurance_providers',

    /**
     * Find all providers
     */
    findAll: async (options = {}) => {
        const { page = 1, limit = 10, search, status } = options;
        const offset = (page - 1) * limit;

        let query = `SELECT * FROM insurance_providers WHERE 1=1`;
        const params = [];

        if (search) {
            query += ` AND (name LIKE ? OR code LIKE ? OR email LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (status) {
            query += ` AND status = ?`;
            params.push(status);
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
     * Find provider by ID
     */
    findById: async (id) => {
        const [[provider]] = await db.query(
            `SELECT * FROM insurance_providers WHERE id = ?`,
            [id]
        );
        return provider;
    },

    /**
     * Create new provider
     */
    create: async (data) => {
        const id = uuidv4();

        await db.query(
            `INSERT INTO insurance_providers (
                id, name, code, contact_number, email, address, 
                coverage_details, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id, data.name, data.code, data.contact_number || null,
                data.email || null, data.address || null,
                data.coverage_details || null, data.status || 'Active'
            ]
        );

        return InsuranceProvider.findById(id);
    },

    /**
     * Update provider
     */
    update: async (id, data) => {
        const allowedFields = [
            'name', 'code', 'contact_number', 'email', 'address',
            'coverage_details', 'status'
        ];

        const fields = [];
        const values = [];

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                fields.push(`${field} = ?`);
                values.push(data[field]);
            }
        }

        if (fields.length === 0) return InsuranceProvider.findById(id);

        values.push(id);

        await db.query(
            `UPDATE insurance_providers SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return InsuranceProvider.findById(id);
    },

    /**
     * Delete provider (Soft delete normally, but hard delete for now if requested, using delete query)
     */
    delete: async (id) => {
        const [result] = await db.query(
            `DELETE FROM insurance_providers WHERE id = ?`,
            [id]
        );
        return result.affectedRows > 0;
    }
};

module.exports = InsuranceProvider;
