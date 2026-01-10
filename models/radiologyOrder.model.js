/**
 * Radiology Order Model
 * Handles radiology imaging orders
 */

const db = require('../config/db.config');
const { v4: uuidv4 } = require('uuid');
const { generateRadiologyId } = require('../utils/idGenerator');

const RadiologyOrder = {
    tableName: 'radiology_orders',

    findAll: async (options = {}) => {
        const { page = 1, limit = 10, status, imaging_type, patient_id, priority } = options;
        const offset = (page - 1) * limit;

        let query = `SELECT r.*, p.name as patient_name, p.patient_id as patient_code,
                 d.name as physician_name
                 FROM radiology_orders r
                 LEFT JOIN patients p ON r.patient_id = p.id
                 LEFT JOIN doctors d ON r.ordering_physician_id = d.id
                 WHERE 1=1`;
        const params = [];

        if (status) { query += ` AND r.status = ?`; params.push(status); }
        if (imaging_type) { query += ` AND r.imaging_type = ?`; params.push(imaging_type); }
        if (patient_id) { query += ` AND r.patient_id = ?`; params.push(patient_id); }
        if (priority) { query += ` AND r.priority = ?`; params.push(priority); }

        const countQuery = query.replace('SELECT r.*, p.name as patient_name, p.patient_id as patient_code, d.name as physician_name', 'SELECT COUNT(*) as total');
        const [countResult] = await db.query(countQuery, params);
        const total = countResult?.[0]?.total || 0;

        query += ` ORDER BY r.order_date DESC LIMIT ? OFFSET ?`;
        params.push(Number(limit), Number(offset));

        const [rows] = await db.query(query, params);
        return { data: rows, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) } };
    },

    findById: async (id) => {
        const [[order]] = await db.query(
            `SELECT r.*, p.name as patient_name, p.patient_id as patient_code, d.name as physician_name
       FROM radiology_orders r
       LEFT JOIN patients p ON r.patient_id = p.id
       LEFT JOIN doctors d ON r.ordering_physician_id = d.id
       WHERE r.id = ?`, [id]
        );
        return order;
    },

    create: async (data) => {
        const id = uuidv4();
        const orderId = await generateRadiologyId();

        await db.query(
            `INSERT INTO radiology_orders (
        id, order_id, patient_id, ordering_physician_id, imaging_type, imaging_subtype,
        body_part, laterality, contrast_required, contrast_type, priority,
        clinical_history, indication, order_date, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, orderId, data.patient_id, data.ordering_physician_id, data.imaging_type,
                data.imaging_subtype || null, data.body_part, data.laterality || 'N/A',
                data.contrast_required || false, data.contrast_type || null,
                data.priority || 'Routine', data.clinical_history || null,
                data.indication || null, data.order_date || new Date(), data.status || 'Ordered']
        );

        return RadiologyOrder.findById(id);
    },

    update: async (id, data) => {
        const allowedFields = ['scheduled_date', 'scheduled_time', 'performed_date',
            'equipment_id', 'technician_id', 'radiologist_id', 'status',
            'findings', 'impression', 'recommendations', 'critical_finding', 'report_url', 'image_urls'];

        const fields = [];
        const values = [];

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                if (field === 'image_urls' && Array.isArray(data[field])) {
                    fields.push(`${field} = ?`);
                    values.push(JSON.stringify(data[field]));
                } else {
                    fields.push(`${field} = ?`);
                    values.push(data[field]);
                }
            }
        }

        if (fields.length === 0) return RadiologyOrder.findById(id);
        values.push(id);

        await db.query(`UPDATE radiology_orders SET ${fields.join(', ')} WHERE id = ?`, values);
        return RadiologyOrder.findById(id);
    },

    schedule: async (id, scheduledDate, scheduledTime, equipmentId = null) => {
        await db.query(
            `UPDATE radiology_orders SET status = 'Scheduled', scheduled_date = ?, scheduled_time = ?, equipment_id = ? WHERE id = ?`,
            [scheduledDate, scheduledTime, equipmentId, id]
        );
        return RadiologyOrder.findById(id);
    },

    addReport: async (id, reportData) => {
        await db.query(
            `UPDATE radiology_orders SET status = 'Reported', findings = ?, impression = ?, 
       recommendations = ?, critical_finding = ?, radiologist_id = ? WHERE id = ?`,
            [reportData.findings, reportData.impression, reportData.recommendations || null,
            reportData.critical_finding || false, reportData.radiologist_id, id]
        );
        return RadiologyOrder.findById(id);
    },

    getEquipment: async () => {
        const [equipment] = await db.query(`SELECT * FROM radiology_equipment WHERE status = 'Operational' ORDER BY type, name`);
        return equipment;
    },

    getStats: async () => {
        const [[stats]] = await db.query(`
      SELECT 
        COUNT(*) as total_today,
        SUM(CASE WHEN status = 'Completed' OR status = 'Reported' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status IN ('Ordered', 'Scheduled') THEN 1 ELSE 0 END) as pending
      FROM radiology_orders WHERE DATE(order_date) = CURDATE()
    `);
        return stats;
    }
};

module.exports = RadiologyOrder;
