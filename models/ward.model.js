/**
 * Ward Model
 * Handles hospital ward management
 */

const db = require('../config/db.config');
const { v4: uuidv4 } = require('uuid');

const Ward = {
    tableName: 'wards',

    /**
     * Find all wards
     */
    findAll: async (options = {}) => {
        const { page = 1, limit = 50, type } = options;
        const offset = (page - 1) * limit;

        let query = `SELECT * FROM wards WHERE 1=1`;
        const params = [];

        if (type) {
            query += ` AND type = ?`;
            params.push(type);
        }

        const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
        const [countResult] = await db.query(countQuery, params);
        const total = countResult?.[0]?.total || 0;

        query += ` ORDER BY name ASC LIMIT ? OFFSET ?`;
        params.push(Number(limit), Number(offset));

        const [rows] = await db.query(query, params);

        return {
            data: rows,
            pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) }
        };
    },

    /**
     * Find ward by ID
     */
    findById: async (id) => {
        const [[ward]] = await db.query(`SELECT * FROM wards WHERE id = ?`, [id]);
        return ward;
    },

    /**
     * Create ward
     */
    create: async (data) => {
        const id = uuidv4();

        await db.query(
            `INSERT INTO wards (id, name, type, floor, total_beds, available_beds, nurse_station)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, data.name, data.type, data.floor || null, data.total_beds || 0,
                data.available_beds || data.total_beds || 0, data.nurse_station || null]
        );

        return Ward.findById(id);
    },

    /**
     * Update ward
     */
    update: async (id, data) => {
        const fields = [];
        const values = [];
        const allowedFields = ['name', 'type', 'floor', 'total_beds', 'available_beds', 'nurse_station'];

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                fields.push(`${field} = ?`);
                values.push(data[field]);
            }
        }

        if (fields.length === 0) return Ward.findById(id);

        values.push(id);
        await db.query(`UPDATE wards SET ${fields.join(', ')} WHERE id = ?`, values);

        return Ward.findById(id);
    },

    /**
     * Delete ward
     */
    delete: async (id) => {
        const [result] = await db.query(`DELETE FROM wards WHERE id = ?`, [id]);
        return result.affectedRows > 0;
    },

    /**
     * Update bed count
     */
    updateBedCount: async (wardId, change) => {
        await db.query(
            `UPDATE wards SET available_beds = available_beds + ? WHERE id = ?`,
            [change, wardId]
        );
    },

    /**
     * Get beds in ward
     */
    getBeds: async (wardId) => {
        const [beds] = await db.query(
            `SELECT * FROM beds WHERE ward_id = ? ORDER BY bed_number`,
            [wardId]
        );
        return beds;
    }
};

module.exports = Ward;
