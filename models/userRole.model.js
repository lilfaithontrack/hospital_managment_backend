/**
 * User Role Model
 * Handles user role assignments
 */

const db = require('../config/db.config');
const { v4: uuidv4 } = require('uuid');

const UserRole = {
    tableName: 'user_roles',

    /**
     * Get roles for a user
     */
    getRolesByUserId: async (userId) => {
        const [roles] = await db.query(
            `SELECT id, role FROM user_roles WHERE user_id = ?`,
            [userId]
        );
        return roles;
    },

    /**
     * Add role to user
     */
    addRole: async (userId, role) => {
        const id = uuidv4();

        try {
            await db.query(
                `INSERT INTO user_roles (id, user_id, role) VALUES (?, ?, ?)`,
                [id, userId, role]
            );
            return { id, user_id: userId, role };
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                // Role already exists for this user
                return null;
            }
            throw error;
        }
    },

    /**
     * Remove role from user
     */
    removeRole: async (userId, role) => {
        const [result] = await db.query(
            `DELETE FROM user_roles WHERE user_id = ? AND role = ?`,
            [userId, role]
        );
        return result.affectedRows > 0;
    },

    /**
     * Check if user has role
     */
    hasRole: async (userId, role) => {
        const [[result]] = await db.query(
            `SELECT COUNT(*) as count FROM user_roles WHERE user_id = ? AND role = ?`,
            [userId, role]
        );
        return result.count > 0;
    },

    /**
     * Get all users with a specific role
     */
    getUsersByRole: async (role) => {
        const [users] = await db.query(
            `SELECT u.id, u.email, u.is_active, u.created_at 
       FROM users u 
       INNER JOIN user_roles ur ON u.id = ur.user_id 
       WHERE ur.role = ?`,
            [role]
        );
        return users;
    },

    /**
     * Set roles for user (replace existing)
     */
    setRoles: async (userId, roles) => {
        // Remove existing roles
        await db.query(`DELETE FROM user_roles WHERE user_id = ?`, [userId]);

        // Add new roles
        for (const role of roles) {
            await UserRole.addRole(userId, role);
        }

        return UserRole.getRolesByUserId(userId);
    }
};

module.exports = UserRole;
