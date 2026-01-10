/**
 * Room Model
 * Handles hospital room management
 */

const db = require('../config/db.config');
const { v4: uuidv4 } = require('uuid');

const Room = {
    tableName: 'rooms',

    /**
     * Find all rooms
     */
    findAll: async (options = {}) => {
        const { page = 1, limit = 50, room_type, status, ward_id, floor } = options;
        const offset = (page - 1) * limit;

        let query = `SELECT r.*, w.name as ward_name
                 FROM rooms r
                 LEFT JOIN wards w ON r.ward_id = w.id
                 WHERE 1=1`;
        const params = [];

        if (room_type) {
            query += ` AND r.room_type = ?`;
            params.push(room_type);
        }

        if (status) {
            query += ` AND r.status = ?`;
            params.push(status);
        }

        if (ward_id) {
            query += ` AND r.ward_id = ?`;
            params.push(ward_id);
        }

        if (floor) {
            query += ` AND r.floor = ?`;
            params.push(floor);
        }

        const countQuery = query.replace('SELECT r.*, w.name as ward_name', 'SELECT COUNT(*) as total');
        const [countResult] = await db.query(countQuery, params);
        const total = countResult?.[0]?.total || 0;

        query += ` ORDER BY r.room_number ASC LIMIT ? OFFSET ?`;
        params.push(Number(limit), Number(offset));

        const [rows] = await db.query(query, params);

        // Parse amenities JSON
        rows.forEach(row => {
            if (row.amenities && typeof row.amenities === 'string') {
                try { row.amenities = JSON.parse(row.amenities); } catch (e) { row.amenities = []; }
            }
        });

        return {
            data: rows,
            pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) }
        };
    },

    /**
     * Find room by ID
     */
    findById: async (id) => {
        const [[room]] = await db.query(
            `SELECT r.*, w.name as ward_name
       FROM rooms r
       LEFT JOIN wards w ON r.ward_id = w.id
       WHERE r.id = ?`,
            [id]
        );

        if (room && room.amenities && typeof room.amenities === 'string') {
            try { room.amenities = JSON.parse(room.amenities); } catch (e) { room.amenities = []; }
        }

        return room;
    },

    /**
     * Find room by number
     */
    findByNumber: async (roomNumber) => {
        const [[room]] = await db.query(
            `SELECT * FROM rooms WHERE room_number = ?`,
            [roomNumber]
        );
        return room;
    },

    /**
     * Create room
     */
    create: async (data) => {
        const id = uuidv4();

        await db.query(
            `INSERT INTO rooms (
        id, room_number, room_type, ward_id, floor, building, total_beds,
        available_beds, daily_rate, amenities, status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id, data.room_number, data.room_type, data.ward_id || null,
                data.floor || null, data.building || null, data.total_beds || 1,
                data.available_beds || data.total_beds || 1, data.daily_rate || null,
                data.amenities ? JSON.stringify(data.amenities) : null,
                data.status || 'Available', data.notes || null
            ]
        );

        return Room.findById(id);
    },

    /**
     * Update room
     */
    update: async (id, data) => {
        const allowedFields = [
            'room_number', 'room_type', 'ward_id', 'floor', 'building',
            'total_beds', 'available_beds', 'daily_rate', 'amenities', 'status', 'notes'
        ];

        const fields = [];
        const values = [];

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                if (field === 'amenities' && Array.isArray(data[field])) {
                    fields.push(`${field} = ?`);
                    values.push(JSON.stringify(data[field]));
                } else {
                    fields.push(`${field} = ?`);
                    values.push(data[field]);
                }
            }
        }

        if (fields.length === 0) return Room.findById(id);

        values.push(id);
        await db.query(`UPDATE rooms SET ${fields.join(', ')} WHERE id = ?`, values);

        return Room.findById(id);
    },

    /**
     * Update room status
     */
    updateStatus: async (id, status) => {
        await db.query(`UPDATE rooms SET status = ? WHERE id = ?`, [status, id]);
        return Room.findById(id);
    },

    /**
     * Delete room
     */
    delete: async (id) => {
        const [result] = await db.query(`DELETE FROM rooms WHERE id = ?`, [id]);
        return result.affectedRows > 0;
    },

    /**
     * Get available rooms
     */
    getAvailable: async (roomType = null) => {
        let query = `SELECT r.*, w.name as ward_name
                 FROM rooms r
                 LEFT JOIN wards w ON r.ward_id = w.id
                 WHERE r.status = 'Available' AND r.available_beds > 0`;
        const params = [];

        if (roomType) {
            query += ` AND r.room_type = ?`;
            params.push(roomType);
        }

        query += ` ORDER BY r.room_number`;

        const [rooms] = await db.query(query, params);
        return rooms;
    },

    /**
     * Get rooms by type
     */
    getByType: async (roomType) => {
        const [rooms] = await db.query(
            `SELECT * FROM rooms WHERE room_type = ? ORDER BY room_number`,
            [roomType]
        );
        return rooms;
    },

    /**
     * Get occupancy stats
     */
    getOccupancyStats: async () => {
        const [[stats]] = await db.query(`
      SELECT 
        COUNT(*) as total_rooms,
        SUM(total_beds) as total_beds,
        SUM(available_beds) as available_beds,
        SUM(total_beds - available_beds) as occupied_beds,
        ROUND(((SUM(total_beds) - SUM(available_beds)) / SUM(total_beds)) * 100, 2) as occupancy_rate
      FROM rooms
    `);
        return stats;
    }
};

module.exports = Room;
