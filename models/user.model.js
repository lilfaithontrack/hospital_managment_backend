/**
 * User Model
 * Handles user authentication data
 */

const db = require('../config/db.config');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const User = {
    tableName: 'users',

    /**
     * Find all users with pagination
     */
    findAll: async (options = {}) => {
        const { page = 1, limit = 10, search, isActive } = options;
        const offset = (page - 1) * limit;

        let query = `SELECT id, email, is_active, last_login, created_at, updated_at FROM users WHERE 1=1`;
        const params = [];

        if (search) {
            query += ` AND email LIKE ?`;
            params.push(`%${search}%`);
        }

        if (typeof isActive === 'boolean') {
            query += ` AND is_active = ?`;
            params.push(isActive);
        }

        // Get total count
        const countQuery = query.replace('SELECT id, email, is_active, last_login, created_at, updated_at', 'SELECT COUNT(*) as total');
        const [countResult] = await db.query(countQuery, params);
        const total = countResult?.[0]?.total || 0;

        query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
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
     * Find user by ID
     */
    findById: async (id) => {
        const [[user]] = await db.query(
            `SELECT id, email, is_active, last_login, created_at, updated_at FROM users WHERE id = ?`,
            [id]
        );
        return user;
    },

    /**
     * Find user by email
     */
    findByEmail: async (email) => {
        const [[user]] = await db.query(
            `SELECT * FROM users WHERE email = ?`,
            [email]
        );
        return user;
    },

    /**
     * Create new user
     */
    create: async (data) => {
        const id = uuidv4();
        const hashedPassword = await bcrypt.hash(data.password, 10);

        await db.query(
            `INSERT INTO users (id, email, password_hash, is_active) VALUES (?, ?, ?, ?)`,
            [id, data.email, hashedPassword, data.is_active !== false]
        );

        return User.findById(id);
    },

    /**
     * Update user
     */
    update: async (id, data) => {
        const fields = [];
        const values = [];

        if (data.email) {
            fields.push('email = ?');
            values.push(data.email);
        }

        if (data.password) {
            const hashedPassword = await bcrypt.hash(data.password, 10);
            fields.push('password_hash = ?');
            values.push(hashedPassword);
        }

        if (typeof data.is_active === 'boolean') {
            fields.push('is_active = ?');
            values.push(data.is_active);
        }

        if (data.last_login) {
            fields.push('last_login = ?');
            values.push(data.last_login);
        }

        if (fields.length === 0) return User.findById(id);

        values.push(id);

        await db.query(
            `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return User.findById(id);
    },

    /**
     * Update last login
     */
    updateLastLogin: async (id) => {
        await db.query(
            `UPDATE users SET last_login = NOW() WHERE id = ?`,
            [id]
        );
    },

    /**
     * Delete user
     */
    delete: async (id) => {
        const [result] = await db.query(
            `DELETE FROM users WHERE id = ?`,
            [id]
        );
        return result.affectedRows > 0;
    },

    /**
     * Verify password
     */
    verifyPassword: async (plainPassword, hashedPassword) => {
        return bcrypt.compare(plainPassword, hashedPassword);
    },

    /**
     * Get user with roles
     */
    findByIdWithRoles: async (id) => {
        const user = await User.findById(id);
        if (!user) return null;

        const [roles] = await db.query(
            `SELECT role FROM user_roles WHERE user_id = ?`,
            [id]
        );

        user.roles = roles.map(r => r.role);
        return user;
    }
};

module.exports = User;
