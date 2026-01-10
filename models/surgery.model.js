/**
 * Surgery Model
 * Handles surgery scheduling and management
 */

const db = require('../config/db.config');
const { v4: uuidv4 } = require('uuid');
const { generateSurgeryId } = require('../utils/idGenerator');

const Surgery = {
    tableName: 'surgeries',

    findAll: async (options = {}) => {
        const { page = 1, limit = 10, status, date, surgeon_id, priority } = options;
        const offset = (page - 1) * limit;

        let query = `SELECT s.*, p.name as patient_name, p.patient_id as patient_code,
                 d.name as surgeon_name, opr.room_number as operating_room
                 FROM surgeries s
                 LEFT JOIN patients p ON s.patient_id = p.id
                 LEFT JOIN doctors d ON s.surgeon_id = d.id
                 LEFT JOIN operating_rooms opr ON s.operating_room_id = opr.id
                 WHERE 1=1`;
        const params = [];

        if (status) { query += ` AND s.status = ?`; params.push(status); }
        if (date) { query += ` AND s.scheduled_date = ?`; params.push(date); }
        if (surgeon_id) { query += ` AND s.surgeon_id = ?`; params.push(surgeon_id); }
        if (priority) { query += ` AND s.priority = ?`; params.push(priority); }

        const countQuery = query.replace('SELECT s.*, p.name as patient_name, p.patient_id as patient_code, d.name as surgeon_name, opr.room_number as operating_room', 'SELECT COUNT(*) as total');
        const [countResult] = await db.query(countQuery, params);
        const total = countResult?.[0]?.total || 0;

        query += ` ORDER BY s.scheduled_date DESC, s.scheduled_time ASC LIMIT ? OFFSET ?`;
        params.push(Number(limit), Number(offset));

        const [rows] = await db.query(query, params);
        return { data: rows, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) } };
    },

    findById: async (id) => {
        const [[surgery]] = await db.query(
            `SELECT s.*, p.name as patient_name, p.patient_id as patient_code,
       d.name as surgeon_name, opr.room_number as operating_room
       FROM surgeries s
       LEFT JOIN patients p ON s.patient_id = p.id
       LEFT JOIN doctors d ON s.surgeon_id = d.id
       LEFT JOIN operating_rooms opr ON s.operating_room_id = opr.id
       WHERE s.id = ?`, [id]
        );
        return surgery;
    },

    create: async (data) => {
        const id = uuidv4();
        const surgeryId = await generateSurgeryId();

        await db.query(
            `INSERT INTO surgeries (
        id, surgery_id, patient_id, surgery_type, surgeon_id, assistant_surgeon_id,
        anesthesiologist_id, operating_room_id, scheduled_date, scheduled_time,
        estimated_duration, priority, status, anesthesia_type, pre_op_notes,
        blood_units_required, consent_signed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, surgeryId, data.patient_id, data.surgery_type, data.surgeon_id,
                data.assistant_surgeon_id || null, data.anesthesiologist_id || null,
                data.operating_room_id || null, data.scheduled_date, data.scheduled_time,
                data.estimated_duration, data.priority || 'Elective',
                data.status || 'Scheduled', data.anesthesia_type || null,
                data.pre_op_notes || null, data.blood_units_required || 0,
                data.consent_signed || false]
        );

        return Surgery.findById(id);
    },

    update: async (id, data) => {
        const allowedFields = ['surgery_type', 'surgeon_id', 'assistant_surgeon_id',
            'anesthesiologist_id', 'operating_room_id', 'scheduled_date', 'scheduled_time',
            'estimated_duration', 'actual_start_time', 'actual_end_time', 'priority',
            'status', 'anesthesia_type', 'pre_op_notes', 'post_op_notes',
            'complications', 'blood_units_required', 'consent_signed'];

        const fields = [];
        const values = [];

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                fields.push(`${field} = ?`);
                values.push(data[field]);
            }
        }

        if (fields.length === 0) return Surgery.findById(id);
        values.push(id);

        await db.query(`UPDATE surgeries SET ${fields.join(', ')} WHERE id = ?`, values);
        return Surgery.findById(id);
    },

    updateStatus: async (id, status) => {
        await db.query(`UPDATE surgeries SET status = ? WHERE id = ?`, [status, id]);
        return Surgery.findById(id);
    },

    delete: async (id) => {
        const [result] = await db.query(`DELETE FROM surgeries WHERE id = ?`, [id]);
        return result.affectedRows > 0;
    },

    getByDate: async (date) => {
        const [surgeries] = await db.query(
            `SELECT s.*, p.name as patient_name, d.name as surgeon_name, opr.room_number
       FROM surgeries s
       LEFT JOIN patients p ON s.patient_id = p.id
       LEFT JOIN doctors d ON s.surgeon_id = d.id
       LEFT JOIN operating_rooms opr ON s.operating_room_id = opr.id
       WHERE s.scheduled_date = ?
       ORDER BY s.scheduled_time ASC`, [date]
        );
        return surgeries;
    },

    getOperatingRooms: async () => {
        const [rooms] = await db.query(`SELECT * FROM operating_rooms ORDER BY room_number`);
        return rooms;
    }
};

module.exports = Surgery;
