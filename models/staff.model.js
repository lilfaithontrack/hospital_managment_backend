/**
 * Staff Model
 * Handles staff data management
 */

const db = require('../config/db.config');
const { v4: uuidv4 } = require('uuid');
const { generateStaffId } = require('../utils/idGenerator');

const Staff = {
    tableName: 'staff',

    /**
     * Find all staff with pagination
     */
    findAll: async (options = {}) => {
        const { page = 1, limit = 10, search, status, role, department_id, shift } = options;
        const offset = (page - 1) * limit;

        let query = `SELECT s.*, dep.name as department_name
                 FROM staff s
                 LEFT JOIN departments dep ON s.department_id = dep.id
                 WHERE 1=1`;
        const params = [];

        if (search) {
            query += ` AND (s.name LIKE ? OR s.staff_id LIKE ? OR s.email LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (status) {
            query += ` AND s.status = ?`;
            params.push(status);
        }

        if (role) {
            query += ` AND s.role = ?`;
            params.push(role);
        }

        if (department_id) {
            query += ` AND s.department_id = ?`;
            params.push(department_id);
        }

        if (shift) {
            query += ` AND s.shift = ?`;
            params.push(shift);
        }

        const countQuery = query.replace('SELECT s.*, dep.name as department_name', 'SELECT COUNT(*) as total');
        const [countResult] = await db.query(countQuery, params);
        const total = countResult?.[0]?.total || 0;

        query += ` ORDER BY s.name ASC LIMIT ? OFFSET ?`;
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
     * Find staff by ID
     */
    findById: async (id) => {
        const [[staff]] = await db.query(
            `SELECT s.*, dep.name as department_name
       FROM staff s
       LEFT JOIN departments dep ON s.department_id = dep.id
       WHERE s.id = ?`,
            [id]
        );
        return staff;
    },

    /**
     * Find staff by staff_id
     */
    findByStaffId: async (staffId) => {
        const [[staff]] = await db.query(
            `SELECT * FROM staff WHERE staff_id = ?`,
            [staffId]
        );
        return staff;
    },

    /**
     * Find staff by user_id
     */
    findByUserId: async (userId) => {
        const [[staff]] = await db.query(
            `SELECT * FROM staff WHERE user_id = ?`,
            [userId]
        );
        return staff;
    },

    /**
     * Create new staff
     */
    create: async (data) => {
        const id = uuidv4();
        const staffId = await generateStaffId();

        await db.query(
            `INSERT INTO staff (
        id, staff_id, user_id, name, role, department_id, phone, email,
        shift, join_date, salary, status, address, emergency_contact
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id, staffId, data.user_id || null, data.name, data.role,
                data.department_id || null, data.phone, data.email,
                data.shift || 'Morning', data.join_date, data.salary || null,
                data.status || 'Active', data.address || null,
                data.emergency_contact || null
            ]
        );

        return Staff.findById(id);
    },

    /**
     * Update staff
     */
    update: async (id, data) => {
        const allowedFields = [
            'name', 'role', 'department_id', 'phone', 'email', 'shift',
            'salary', 'status', 'address', 'emergency_contact', 'user_id'
        ];

        const fields = [];
        const values = [];

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                fields.push(`${field} = ?`);
                values.push(data[field]);
            }
        }

        if (fields.length === 0) return Staff.findById(id);

        values.push(id);

        await db.query(
            `UPDATE staff SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return Staff.findById(id);
    },

    /**
     * Delete staff
     */
    delete: async (id) => {
        const [result] = await db.query(
            `DELETE FROM staff WHERE id = ?`,
            [id]
        );
        return result.affectedRows > 0;
    },

    /**
     * Get staff by department
     */
    getByDepartment: async (departmentId) => {
        const [staff] = await db.query(
            `SELECT id, staff_id, name, role, shift, status
       FROM staff WHERE department_id = ?`,
            [departmentId]
        );
        return staff;
    },

    /**
     * Get staff by role
     */
    getByRole: async (role) => {
        const [staff] = await db.query(
            `SELECT id, staff_id, name, department_id, shift, status
       FROM staff WHERE role = ? AND status = 'Active'`,
            [role]
        );
        return staff;
    },

    /**
     * Get staff shifts
     */
    getShifts: async (staffId, options = {}) => {
        const { startDate, endDate, page = 1, limit = 10 } = options;
        const offset = (page - 1) * limit;

        let query = `SELECT * FROM shifts WHERE staff_id = ?`;
        const params = [staffId];

        if (startDate) {
            query += ` AND shift_date >= ?`;
            params.push(startDate);
        }

        if (endDate) {
            query += ` AND shift_date <= ?`;
            params.push(endDate);
        }

        const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
        const [countResult] = await db.query(countQuery, params);
        const total = countResult?.[0]?.total || 0;

        query += ` ORDER BY shift_date DESC LIMIT ? OFFSET ?`;
        params.push(Number(limit), Number(offset));

        const [rows] = await db.query(query, params);

        return {
            data: rows,
            pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) }
        };
    },

    /**
     * Get nurses (for assignments)
     */
    getNurses: async () => {
        const [nurses] = await db.query(
            `SELECT id, staff_id, name, department_id, shift
       FROM staff WHERE role = 'Nurse' AND status = 'Active'`
        );
        return nurses;
    },

    /**
     * Get count by role
     */
    getCountByRole: async () => {
        const [results] = await db.query(
            `SELECT role, COUNT(*) as count FROM staff GROUP BY role`
        );
        return results;
    }
};

module.exports = Staff;
