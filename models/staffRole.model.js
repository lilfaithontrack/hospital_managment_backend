/**
 * Staff Role Model
 * Handles staff role management with allowed modules
 */

const db = require('../config/db.config');
const { v4: uuidv4 } = require('uuid');

const StaffRole = {
    tableName: 'staff_roles',

    /**
     * Find all roles with pagination
     */
    findAll: async (options = {}) => {
        const { page = 1, limit = 50, search, isActive, includeSystem = true } = options;
        const offset = (page - 1) * limit;

        let query = `SELECT * FROM staff_roles WHERE 1=1`;
        const params = [];

        if (search) {
            query += ` AND (name LIKE ? OR description LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }

        if (typeof isActive === 'boolean') {
            query += ` AND is_active = ?`;
            params.push(isActive);
        }

        if (!includeSystem) {
            query += ` AND is_system = FALSE`;
        }

        // Get total count
        const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
        const [countResult] = await db.query(countQuery, params);
        const total = countResult?.[0]?.total || 0;

        query += ` ORDER BY is_system DESC, name ASC LIMIT ? OFFSET ?`;
        params.push(Number(limit), Number(offset));

        const [rows] = await db.query(query, params);

        // Parse allowed_modules JSON
        const data = rows.map(row => ({
            ...row,
            allowed_modules: typeof row.allowed_modules === 'string'
                ? JSON.parse(row.allowed_modules)
                : row.allowed_modules
        }));

        return {
            data,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    },

    /**
     * Find role by ID
     */
    findById: async (id) => {
        const [[role]] = await db.query(
            `SELECT * FROM staff_roles WHERE id = ?`,
            [id]
        );

        if (!role) return null;

        return {
            ...role,
            allowed_modules: typeof role.allowed_modules === 'string'
                ? JSON.parse(role.allowed_modules)
                : role.allowed_modules
        };
    },

    /**
     * Find role by name
     */
    findByName: async (name) => {
        const [[role]] = await db.query(
            `SELECT * FROM staff_roles WHERE name = ?`,
            [name]
        );

        if (!role) return null;

        return {
            ...role,
            allowed_modules: typeof role.allowed_modules === 'string'
                ? JSON.parse(role.allowed_modules)
                : role.allowed_modules
        };
    },

    /**
     * Get all active roles (for dropdowns)
     */
    getActiveRoles: async () => {
        const [rows] = await db.query(
            `SELECT id, name, description, allowed_modules FROM staff_roles WHERE is_active = TRUE ORDER BY is_system DESC, name ASC`
        );

        return rows.map(row => ({
            ...row,
            allowed_modules: typeof row.allowed_modules === 'string'
                ? JSON.parse(row.allowed_modules)
                : row.allowed_modules
        }));
    },

    /**
     * Create new role
     */
    create: async (data) => {
        const id = uuidv4();

        await db.query(
            `INSERT INTO staff_roles (id, name, description, allowed_modules, is_system, is_active) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                id,
                data.name,
                data.description || null,
                JSON.stringify(data.allowed_modules || []),
                data.is_system || false,
                data.is_active !== false
            ]
        );

        return StaffRole.findById(id);
    },

    /**
     * Update role
     */
    update: async (id, data) => {
        const role = await StaffRole.findById(id);
        if (!role) return null;

        const fields = [];
        const values = [];

        if (data.name !== undefined) {
            fields.push('name = ?');
            values.push(data.name);
        }

        if (data.description !== undefined) {
            fields.push('description = ?');
            values.push(data.description);
        }

        if (data.allowed_modules !== undefined) {
            fields.push('allowed_modules = ?');
            values.push(JSON.stringify(data.allowed_modules));
        }

        if (data.is_active !== undefined) {
            fields.push('is_active = ?');
            values.push(data.is_active);
        }

        if (fields.length === 0) return role;

        values.push(id);

        await db.query(
            `UPDATE staff_roles SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return StaffRole.findById(id);
    },

    /**
     * Delete role (only non-system roles)
     */
    delete: async (id) => {
        const role = await StaffRole.findById(id);
        if (!role) return false;
        if (role.is_system) {
            throw new Error('Cannot delete system role');
        }

        // Check if any staff are using this role
        const [[count]] = await db.query(
            'SELECT COUNT(*) as count FROM staff WHERE role_id = ?',
            [id]
        );

        if (count.count > 0) {
            throw new Error('Cannot delete role with assigned staff');
        }

        const [result] = await db.query(
            `DELETE FROM staff_roles WHERE id = ? AND is_system = FALSE`,
            [id]
        );
        return result.affectedRows > 0;
    },

    /**
     * Check if user can access module
     */
    canAccessModule: (allowedModules, moduleKey) => {
        if (!Array.isArray(allowedModules)) return false;
        if (allowedModules.includes('*')) return true;
        return allowedModules.includes(moduleKey);
    },

    /**
     * Get staff count by role
     */
    getStaffCountByRole: async () => {
        const [results] = await db.query(`
            SELECT sr.id, sr.name, COUNT(s.id) as staff_count
            FROM staff_roles sr
            LEFT JOIN staff s ON s.role_id = sr.id
            GROUP BY sr.id, sr.name
            ORDER BY sr.name
        `);
        return results;
    }
};

module.exports = StaffRole;
