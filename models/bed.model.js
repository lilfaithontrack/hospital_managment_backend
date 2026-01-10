/**
 * Bed Model
 * Handles hospital bed management
 */

const db = require('../config/db.config');
const { v4: uuidv4 } = require('uuid');

const Bed = {
    tableName: 'beds',

    /**
     * Find all beds
     */
    findAll: async (options = {}) => {
        const { page = 1, limit = 50, ward_id, status, bed_type } = options;
        const offset = (page - 1) * limit;

        let query = `SELECT b.*, w.name as ward_name, w.type as ward_type
                 FROM beds b
                 LEFT JOIN wards w ON b.ward_id = w.id
                 WHERE 1=1`;
        const params = [];

        if (ward_id) {
            query += ` AND b.ward_id = ?`;
            params.push(ward_id);
        }

        if (status) {
            query += ` AND b.status = ?`;
            params.push(status);
        }

        if (bed_type) {
            query += ` AND b.bed_type = ?`;
            params.push(bed_type);
        }

        const countQuery = query.replace('SELECT b.*, w.name as ward_name, w.type as ward_type', 'SELECT COUNT(*) as total');
        const [countResult] = await db.query(countQuery, params);
        const total = countResult?.[0]?.total || 0;

        query += ` ORDER BY w.name, b.bed_number ASC LIMIT ? OFFSET ?`;
        params.push(Number(limit), Number(offset));

        const [rows] = await db.query(query, params);

        return {
            data: rows,
            pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) }
        };
    },

    /**
     * Find bed by ID
     */
    findById: async (id) => {
        const [[bed]] = await db.query(
            `SELECT b.*, w.name as ward_name, w.type as ward_type
       FROM beds b
       LEFT JOIN wards w ON b.ward_id = w.id
       WHERE b.id = ?`,
            [id]
        );
        return bed;
    },

    /**
     * Create bed
     */
    create: async (data) => {
        const id = uuidv4();

        await db.query(
            `INSERT INTO beds (id, bed_number, ward_id, bed_type, daily_rate, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [id, data.bed_number, data.ward_id, data.bed_type || 'Standard',
                data.daily_rate || null, data.status || 'Available']
        );

        // Update ward bed count
        if (data.status === 'Available' || !data.status) {
            await db.query(
                `UPDATE wards SET total_beds = total_beds + 1, available_beds = available_beds + 1 WHERE id = ?`,
                [data.ward_id]
            );
        } else {
            await db.query(
                `UPDATE wards SET total_beds = total_beds + 1 WHERE id = ?`,
                [data.ward_id]
            );
        }

        return Bed.findById(id);
    },

    /**
     * Update bed
     */
    update: async (id, data) => {
        const currentBed = await Bed.findById(id);
        if (!currentBed) return null;

        const fields = [];
        const values = [];
        const allowedFields = ['bed_number', 'ward_id', 'bed_type', 'daily_rate', 'status'];

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                fields.push(`${field} = ?`);
                values.push(data[field]);
            }
        }

        if (fields.length === 0) return Bed.findById(id);

        values.push(id);
        await db.query(`UPDATE beds SET ${fields.join(', ')} WHERE id = ?`, values);

        // Update ward available beds count if status changed
        if (data.status && data.status !== currentBed.status) {
            if (data.status === 'Available' && currentBed.status !== 'Available') {
                await db.query(
                    `UPDATE wards SET available_beds = available_beds + 1 WHERE id = ?`,
                    [currentBed.ward_id]
                );
            } else if (data.status !== 'Available' && currentBed.status === 'Available') {
                await db.query(
                    `UPDATE wards SET available_beds = available_beds - 1 WHERE id = ?`,
                    [currentBed.ward_id]
                );
            }
        }

        return Bed.findById(id);
    },

    /**
     * Update bed status
     */
    updateStatus: async (id, status) => {
        return Bed.update(id, { status });
    },

    /**
     * Delete bed
     */
    delete: async (id) => {
        const bed = await Bed.findById(id);
        if (!bed) return false;

        const [result] = await db.query(`DELETE FROM beds WHERE id = ?`, [id]);

        if (result.affectedRows > 0) {
            // Update ward bed counts
            if (bed.status === 'Available') {
                await db.query(
                    `UPDATE wards SET total_beds = total_beds - 1, available_beds = available_beds - 1 WHERE id = ?`,
                    [bed.ward_id]
                );
            } else {
                await db.query(
                    `UPDATE wards SET total_beds = total_beds - 1 WHERE id = ?`,
                    [bed.ward_id]
                );
            }
            return true;
        }

        return false;
    },

    /**
     * Get available beds
     */
    getAvailable: async (wardId = null) => {
        let query = `SELECT b.*, w.name as ward_name, w.type as ward_type
                 FROM beds b
                 LEFT JOIN wards w ON b.ward_id = w.id
                 WHERE b.status = 'Available'`;
        const params = [];

        if (wardId) {
            query += ` AND b.ward_id = ?`;
            params.push(wardId);
        }

        query += ` ORDER BY w.name, b.bed_number`;

        const [beds] = await db.query(query, params);
        return beds;
    },

    /**
     * Occupy bed
     */
    occupy: async (id) => {
        return Bed.updateStatus(id, 'Occupied');
    },

    /**
     * Release bed
     */
    release: async (id) => {
        return Bed.updateStatus(id, 'Available');
    }
};

module.exports = Bed;
