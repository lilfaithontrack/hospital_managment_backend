/**
 * Security Module Models
 * Handles Cameras, Visitors, and Incidents
 */

const db = require('../config/db.config');
const { v4: uuidv4 } = require('uuid');

const SecurityCamera = {
    findAll: async () => {
        const [rows] = await db.query(`SELECT * FROM security_cameras ORDER BY location`);
        return rows;
    },
    create: async (data) => {
        const id = uuidv4();
        await db.query(
            `INSERT INTO security_cameras (id, name, location, ip_address, stream_url, model, status)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, data.name, data.location, data.ip_address, data.stream_url, data.model, data.status || 'Online']
        );
        const [[cam]] = await db.query(`SELECT * FROM security_cameras WHERE id = ?`, [id]);
        return cam;
    },
    update: async (id, data) => {
        const allowed = ['name', 'location', 'ip_address', 'stream_url', 'status'];
        const fields = [];
        const values = [];
        allowed.forEach(f => { if (data[f] !== undefined) { fields.push(`${f}=?`); values.push(data[f]); } });
        if (fields.length === 0) return null;
        values.push(id);
        await db.query(`UPDATE security_cameras SET ${fields.join(', ')} WHERE id = ?`, values);
        const [[cam]] = await db.query(`SELECT * FROM security_cameras WHERE id = ?`, [id]);
        return cam;
    }
};

const SecurityVisitor = {
    findAll: async (options = {}) => {
        const { page = 1, limit = 20, status, search } = options;
        const offset = (page - 1) * limit;
        let query = `SELECT * FROM security_visitors WHERE 1=1`;
        const params = [];
        if (status) { query += ` AND status = ?`; params.push(status); }
        if (search) {
            query += ` AND (visitor_name LIKE ? OR phone LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }

        const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
        const [countResult] = await db.query(countQuery, params);
        const total = countResult?.[0]?.total || 0;

        query += ` ORDER BY check_in_time DESC LIMIT ? OFFSET ?`;
        params.push(Number(limit), Number(offset));

        const [rows] = await db.query(query, params);
        return { data: rows, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) } };
    },
    create: async (data) => {
        const id = uuidv4();
        await db.query(
            `INSERT INTO security_visitors (id, visitor_name, phone, purpose, visit_person, check_in_time, id_proof_number, status)
             VALUES (?, ?, ?, ?, ?, NOW(), ?, 'Checked In')`,
            [id, data.visitor_name, data.phone, data.purpose, data.visit_person, data.id_proof_number]
        );
        const [[visitor]] = await db.query(`SELECT * FROM security_visitors WHERE id = ?`, [id]);
        return visitor;
    },
    checkout: async (id) => {
        await db.query(`UPDATE security_visitors SET check_out_time = NOW(), status = 'Checked Out' WHERE id = ?`, [id]);
        const [[visitor]] = await db.query(`SELECT * FROM security_visitors WHERE id = ?`, [id]);
        return visitor;
    }
};

const SecurityIncident = {
    findAll: async (options = {}) => {
        const { page = 1, limit = 10, severity, status } = options;
        const offset = (page - 1) * limit;
        let query = `SELECT * FROM security_incidents WHERE 1=1`;
        const params = [];
        if (severity) { query += ` AND severity = ?`; params.push(severity); }
        if (status) { query += ` AND status = ?`; params.push(status); }

        query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        params.push(Number(limit), Number(offset));

        const [rows] = await db.query(query, params);
        return { data: rows };
    },
    create: async (data) => {
        const id = uuidv4();
        const files = data.evidence_files ? JSON.stringify(data.evidence_files) : null;
        await db.query(
            `INSERT INTO security_incidents (id, incident_type, location, severity, reported_by, description, actions_taken, evidence_files, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, data.incident_type, data.location, data.severity, data.reported_by, data.description, data.actions_taken, files, data.status || 'Open']
        );
        const [[inc]] = await db.query(`SELECT * FROM security_incidents WHERE id = ?`, [id]);
        return inc;
    }
};

module.exports = { SecurityCamera, SecurityVisitor, SecurityIncident };
