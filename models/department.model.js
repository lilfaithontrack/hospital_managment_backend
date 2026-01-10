/**
 * Department Model
 * Handles hospital departments
 */

const db = require('../config/db.config');
const { v4: uuidv4 } = require('uuid');

const Department = {
    tableName: 'departments',

    /**
     * Find all departments
     */
    findAll: async (options = {}) => {
        const { page = 1, limit = 50, search } = options;
        const offset = (page - 1) * limit;

        let query = `SELECT d.*, 
                 (SELECT name FROM doctors WHERE id = d.head_doctor_id) as head_doctor_name
                 FROM departments d WHERE 1=1`;
        const params = [];

        if (search) {
            query += ` AND d.name LIKE ?`;
            params.push(`%${search}%`);
        }

        const countQuery = `SELECT COUNT(*) as total FROM departments WHERE 1=1` +
            (search ? ` AND name LIKE ?` : '');
        const [countResult] = await db.query(countQuery, search ? [`%${search}%`] : []);
        const total = countResult?.[0]?.total || 0;

        query += ` ORDER BY d.name ASC LIMIT ? OFFSET ?`;
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
     * Find department by ID
     */
    findById: async (id) => {
        const [[department]] = await db.query(
            `SELECT d.*, 
       (SELECT name FROM doctors WHERE id = d.head_doctor_id) as head_doctor_name
       FROM departments d WHERE d.id = ?`,
            [id]
        );
        return department;
    },

    /**
     * Find department by name
     */
    findByName: async (name) => {
        const [[department]] = await db.query(
            `SELECT * FROM departments WHERE name = ?`,
            [name]
        );
        return department;
    },

    /**
     * Create department
     */
    create: async (data) => {
        const id = uuidv4();

        await db.query(
            `INSERT INTO departments (id, name, description, head_doctor_id) VALUES (?, ?, ?, ?)`,
            [id, data.name, data.description || null, data.head_doctor_id || null]
        );

        return Department.findById(id);
    },

    /**
     * Update department
     */
    update: async (id, data) => {
        const fields = [];
        const values = [];

        if (data.name) {
            fields.push('name = ?');
            values.push(data.name);
        }

        if (data.description !== undefined) {
            fields.push('description = ?');
            values.push(data.description);
        }

        if (data.head_doctor_id !== undefined) {
            fields.push('head_doctor_id = ?');
            values.push(data.head_doctor_id);
        }

        if (fields.length === 0) return Department.findById(id);

        values.push(id);

        await db.query(
            `UPDATE departments SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return Department.findById(id);
    },

    /**
     * Delete department
     */
    delete: async (id) => {
        const [result] = await db.query(
            `DELETE FROM departments WHERE id = ?`,
            [id]
        );
        return result.affectedRows > 0;
    },

    /**
     * Get doctors in department
     */
    getDoctors: async (departmentId) => {
        const [doctors] = await db.query(
            `SELECT id, doctor_id, name, specialization, status 
       FROM doctors WHERE department_id = ?`,
            [departmentId]
        );
        return doctors;
    },

    /**
     * Get staff in department
     */
    getStaff: async (departmentId) => {
        const [staff] = await db.query(
            `SELECT id, staff_id, name, role, status 
       FROM staff WHERE department_id = ?`,
            [departmentId]
        );
        return staff;
    }
};

module.exports = Department;
