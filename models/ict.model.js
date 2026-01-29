/**
 * ICT Module Models
 * Handles Assets and Support Tickets
 */

const db = require('../config/db.config');
const { v4: uuidv4 } = require('uuid');

const ICTAsset = {
    tableName: 'ict_assets',

    findAll: async (options = {}) => {
        const { page = 1, limit = 10, type, status, search } = options;
        const offset = (page - 1) * limit;

        let query = `SELECT * FROM ict_assets WHERE 1=1`;
        const params = [];

        if (type) { query += ` AND type = ?`; params.push(type); }
        if (status) { query += ` AND status = ?`; params.push(status); }
        if (search) {
            query += ` AND (brand LIKE ? OR serial_number LIKE ? OR model LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
        const [countResult] = await db.query(countQuery, params);
        const total = countResult?.[0]?.total || 0;

        query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        params.push(Number(limit), Number(offset));

        const [rows] = await db.query(query, params);
        return { data: rows, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) } };
    },

    create: async (data) => {
        const id = uuidv4();
        await db.query(
            `INSERT INTO ict_assets (id, type, brand, model, serial_number, assigned_to, status, purchase_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, data.type, data.brand, data.model, data.serial_number, data.assigned_to, data.status || 'Active', data.purchase_date]
        );
        const [[asset]] = await db.query(`SELECT * FROM ict_assets WHERE id = ?`, [id]);
        return asset;
    },

    update: async (id, data) => {
        const allowed = ['type', 'brand', 'model', 'serial_number', 'assigned_to', 'status'];
        const fields = [];
        const values = [];
        allowed.forEach(f => { if (data[f] !== undefined) { fields.push(`${f}=?`); values.push(data[f]); } });
        if (fields.length === 0) return null;
        values.push(id);
        await db.query(`UPDATE ict_assets SET ${fields.join(', ')} WHERE id = ?`, values);
        const [[asset]] = await db.query(`SELECT * FROM ict_assets WHERE id = ?`, [id]);
        return asset;
    }
};

const ICTTicket = {
    tableName: 'ict_tickets',

    findAll: async (options = {}) => {
        const { page = 1, limit = 10, status, priority } = options;
        const offset = (page - 1) * limit;

        let query = `SELECT t.*, u.email as reporter_email 
                     FROM ict_tickets t
                     LEFT JOIN users u ON t.reported_by = u.id
                     WHERE 1=1`;
        const params = [];
        if (status) { query += ` AND t.status = ?`; params.push(status); }
        if (priority) { query += ` AND t.priority = ?`; params.push(priority); }

        const countQuery = query.replace('SELECT t.*, u.email as reporter_email', 'SELECT COUNT(*) as total');
        const [countResult] = await db.query(countQuery, params);
        const total = countResult?.[0]?.total || 0;

        query += ` ORDER BY t.created_at DESC LIMIT ? OFFSET ?`;
        params.push(Number(limit), Number(offset));

        const [rows] = await db.query(query, params);
        return { data: rows, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) } };
    },

    create: async (data) => {
        const id = uuidv4();
        const ticketId = 'TKT-' + Math.floor(Math.random() * 100000); // Simple ID gen

        await db.query(
            `INSERT INTO ict_tickets (id, ticket_id, reported_by, issue_type, priority, description, status)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, ticketId, data.reported_by, data.issue_type, data.priority || 'Medium', data.description, 'Open']
        );
        const [[ticket]] = await db.query(`SELECT * FROM ict_tickets WHERE id = ?`, [id]);
        return ticket;
    },

    update: async (id, data) => {
        const allowed = ['status', 'priority', 'assigned_tech', 'resolution_notes'];
        const fields = [];
        const values = [];
        allowed.forEach(f => { if (data[f] !== undefined) { fields.push(`${f}=?`); values.push(data[f]); } });
        if (fields.length === 0) return null;
        values.push(id);
        await db.query(`UPDATE ict_tickets SET ${fields.join(', ')} WHERE id = ?`, values);
        const [[ticket]] = await db.query(`SELECT * FROM ict_tickets WHERE id = ?`, [id]);
        return ticket;
    }
};

module.exports = { ICTAsset, ICTTicket };
