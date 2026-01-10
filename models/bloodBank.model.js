/**
 * Blood Bank Models
 * Handles blood inventory, donations, and requests
 */

const db = require('../config/db.config');
const { v4: uuidv4 } = require('uuid');
const { generateBloodRequestId } = require('../utils/idGenerator');

const BloodBank = {
    // Blood Inventory
    getInventory: async () => {
        const [inventory] = await db.query(`SELECT * FROM blood_inventory ORDER BY blood_group, component`);
        return inventory;
    },

    updateInventory: async (id, data) => {
        const fields = [];
        const values = [];
        const allowedFields = ['units_available', 'units_reserved', 'min_stock_level', 'expiry_alert_days'];

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                fields.push(`${field} = ?`);
                values.push(data[field]);
            }
        }

        if (fields.length === 0) return null;
        values.push(id);

        await db.query(`UPDATE blood_inventory SET ${fields.join(', ')} WHERE id = ?`, values);
        const [[item]] = await db.query(`SELECT * FROM blood_inventory WHERE id = ?`, [id]);
        return item;
    },

    // Blood Donations
    getDonations: async (options = {}) => {
        const { page = 1, limit = 10, blood_group, status } = options;
        const offset = (page - 1) * limit;

        let query = `SELECT * FROM blood_donations WHERE 1=1`;
        const params = [];

        if (blood_group) { query += ` AND blood_group = ?`; params.push(blood_group); }
        if (status) { query += ` AND status = ?`; params.push(status); }

        const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
        const [countResult] = await db.query(countQuery, params);
        const total = countResult?.[0]?.total || 0;

        query += ` ORDER BY donation_date DESC LIMIT ? OFFSET ?`;
        params.push(Number(limit), Number(offset));

        const [rows] = await db.query(query, params);
        return { data: rows, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) } };
    },

    recordDonation: async (data) => {
        const id = uuidv4();
        const donationId = `DON-${Date.now().toString(36).toUpperCase()}`;

        await db.query(
            `INSERT INTO blood_donations (
        id, donation_id, donor_name, donor_phone, donor_email, donor_age, donor_gender,
        blood_group, donation_date, units_donated, hemoglobin_level, blood_pressure,
        screening_status, screening_notes, expiry_date, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, donationId, data.donor_name, data.donor_phone, data.donor_email || null,
                data.donor_age || null, data.donor_gender || null, data.blood_group,
                data.donation_date || new Date(), data.units_donated || 1,
                data.hemoglobin_level || null, data.blood_pressure || null,
                data.screening_status || 'Pending', data.screening_notes || null,
                data.expiry_date || null, data.status || 'Available']
        );

        // Update inventory if donation is available
        if (data.status === 'Available' || data.screening_status === 'Passed') {
            await db.query(
                `UPDATE blood_inventory SET units_available = units_available + ? WHERE blood_group = ? AND component = 'Whole Blood'`,
                [data.units_donated || 1, data.blood_group]
            );
        }

        const [[donation]] = await db.query(`SELECT * FROM blood_donations WHERE id = ?`, [id]);
        return donation;
    },

    // Blood Requests
    getRequests: async (options = {}) => {
        const { page = 1, limit = 10, status, blood_group, priority } = options;
        const offset = (page - 1) * limit;

        let query = `SELECT r.*, p.name as patient_name, p.patient_id as patient_code, d.name as doctor_name
                 FROM blood_requests r
                 LEFT JOIN patients p ON r.patient_id = p.id
                 LEFT JOIN doctors d ON r.requesting_doctor_id = d.id
                 WHERE 1=1`;
        const params = [];

        if (status) { query += ` AND r.status = ?`; params.push(status); }
        if (blood_group) { query += ` AND r.blood_group = ?`; params.push(blood_group); }
        if (priority) { query += ` AND r.priority = ?`; params.push(priority); }

        const countQuery = query.replace('SELECT r.*, p.name as patient_name, p.patient_id as patient_code, d.name as doctor_name', 'SELECT COUNT(*) as total');
        const [countResult] = await db.query(countQuery, params);
        const total = countResult?.[0]?.total || 0;

        query += ` ORDER BY FIELD(r.priority, 'Emergency', 'Urgent', 'Routine'), r.request_date DESC LIMIT ? OFFSET ?`;
        params.push(Number(limit), Number(offset));

        const [rows] = await db.query(query, params);
        return { data: rows, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) } };
    },

    createRequest: async (data) => {
        const id = uuidv4();
        const requestId = await generateBloodRequestId();

        await db.query(
            `INSERT INTO blood_requests (
        id, request_id, patient_id, requesting_doctor_id, blood_group, component,
        units_requested, priority, indication, request_date, required_by, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, requestId, data.patient_id, data.requesting_doctor_id, data.blood_group,
                data.component, data.units_requested, data.priority || 'Routine',
                data.indication || null, data.request_date || new Date(),
                data.required_by || null, data.status || 'Pending']
        );

        const [[request]] = await db.query(
            `SELECT r.*, p.name as patient_name FROM blood_requests r LEFT JOIN patients p ON r.patient_id = p.id WHERE r.id = ?`,
            [id]
        );
        return request;
    },

    issueBlood: async (requestId, unitsIssued, issuedBy) => {
        await db.query(
            `UPDATE blood_requests SET status = 'Issued', units_issued = ?, issued_date = NOW(), issued_by = ? WHERE id = ?`,
            [unitsIssued, issuedBy, requestId]
        );

        // Get request details to update inventory
        const [[request]] = await db.query(`SELECT blood_group, component FROM blood_requests WHERE id = ?`, [requestId]);
        if (request) {
            await db.query(
                `UPDATE blood_inventory SET units_available = units_available - ?, units_reserved = units_reserved - ? WHERE blood_group = ? AND component = ?`,
                [unitsIssued, unitsIssued, request.blood_group, request.component]
            );
        }

        const [[updatedRequest]] = await db.query(`SELECT * FROM blood_requests WHERE id = ?`, [requestId]);
        return updatedRequest;
    },

    getCompatibility: (bloodGroup) => {
        const compatibility = {
            'A+': ['A+', 'A-', 'O+', 'O-'],
            'A-': ['A-', 'O-'],
            'B+': ['B+', 'B-', 'O+', 'O-'],
            'B-': ['B-', 'O-'],
            'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
            'AB-': ['A-', 'B-', 'AB-', 'O-'],
            'O+': ['O+', 'O-'],
            'O-': ['O-']
        };
        return compatibility[bloodGroup] || [];
    }
};

module.exports = BloodBank;
