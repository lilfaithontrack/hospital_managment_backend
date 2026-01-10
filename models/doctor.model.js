/**
 * Doctor Model
 * Handles doctor data management
 */

const db = require('../config/db.config');
const { v4: uuidv4 } = require('uuid');
const { generateDoctorId } = require('../utils/idGenerator');

const Doctor = {
    tableName: 'doctors',

    /**
     * Find all doctors with pagination
     */
    findAll: async (options = {}) => {
        const { page = 1, limit = 10, search, status, department_id, specialization } = options;
        const offset = (page - 1) * limit;

        let query = `SELECT d.*, dep.name as department_name
                 FROM doctors d
                 LEFT JOIN departments dep ON d.department_id = dep.id
                 WHERE 1=1`;
        const params = [];

        if (search) {
            query += ` AND (d.name LIKE ? OR d.doctor_id LIKE ? OR d.specialization LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (status) {
            query += ` AND d.status = ?`;
            params.push(status);
        }

        if (department_id) {
            query += ` AND d.department_id = ?`;
            params.push(department_id);
        }

        if (specialization) {
            query += ` AND d.specialization = ?`;
            params.push(specialization);
        }

        // Get total count
        const countQuery = query.replace('SELECT d.*, dep.name as department_name', 'SELECT COUNT(*) as total');
        const [countResult] = await db.query(countQuery, params);
        const total = countResult?.[0]?.total || 0;

        query += ` ORDER BY d.name ASC LIMIT ? OFFSET ?`;
        params.push(Number(limit), Number(offset));

        const [rows] = await db.query(query, params);

        // Parse JSON fields
        rows.forEach(row => {
            if (row.available_days && typeof row.available_days === 'string') {
                try {
                    row.available_days = JSON.parse(row.available_days);
                } catch (e) {
                    row.available_days = [];
                }
            }
        });

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
     * Find doctor by ID
     */
    findById: async (id) => {
        const [[doctor]] = await db.query(
            `SELECT d.*, dep.name as department_name
       FROM doctors d
       LEFT JOIN departments dep ON d.department_id = dep.id
       WHERE d.id = ?`,
            [id]
        );

        if (doctor && doctor.available_days && typeof doctor.available_days === 'string') {
            try {
                doctor.available_days = JSON.parse(doctor.available_days);
            } catch (e) {
                doctor.available_days = [];
            }
        }

        return doctor;
    },

    /**
     * Find doctor by doctor_id
     */
    findByDoctorId: async (doctorId) => {
        const [[doctor]] = await db.query(
            `SELECT * FROM doctors WHERE doctor_id = ?`,
            [doctorId]
        );
        return doctor;
    },

    /**
     * Find doctor by user_id
     */
    findByUserId: async (userId) => {
        const [[doctor]] = await db.query(
            `SELECT * FROM doctors WHERE user_id = ?`,
            [userId]
        );
        return doctor;
    },

    /**
     * Create new doctor
     */
    create: async (data) => {
        const id = uuidv4();
        const doctorId = await generateDoctorId();

        await db.query(
            `INSERT INTO doctors (
        id, doctor_id, user_id, name, specialization, department_id,
        qualification, experience_years, phone, email, consultation_fee,
        available_days, available_time_start, available_time_end, status, profile_image
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id, doctorId, data.user_id || null, data.name, data.specialization,
                data.department_id || null, data.qualification || null,
                data.experience_years || null, data.phone, data.email,
                data.consultation_fee || null,
                data.available_days ? JSON.stringify(data.available_days) : null,
                data.available_time_start || null, data.available_time_end || null,
                data.status || 'Available', data.profile_image || null
            ]
        );

        return Doctor.findById(id);
    },

    /**
     * Update doctor
     */
    update: async (id, data) => {
        const allowedFields = [
            'name', 'specialization', 'department_id', 'qualification',
            'experience_years', 'phone', 'email', 'consultation_fee',
            'available_days', 'available_time_start', 'available_time_end',
            'status', 'rating', 'total_patients', 'profile_image', 'user_id'
        ];

        const fields = [];
        const values = [];

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                if (field === 'available_days' && Array.isArray(data[field])) {
                    fields.push(`${field} = ?`);
                    values.push(JSON.stringify(data[field]));
                } else {
                    fields.push(`${field} = ?`);
                    values.push(data[field]);
                }
            }
        }

        if (fields.length === 0) return Doctor.findById(id);

        values.push(id);

        await db.query(
            `UPDATE doctors SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return Doctor.findById(id);
    },

    /**
     * Delete doctor
     */
    delete: async (id) => {
        const [result] = await db.query(
            `DELETE FROM doctors WHERE id = ?`,
            [id]
        );
        return result.affectedRows > 0;
    },

    /**
     * Get doctors by department
     */
    getByDepartment: async (departmentId) => {
        const [doctors] = await db.query(
            `SELECT id, doctor_id, name, specialization, status, consultation_fee
       FROM doctors WHERE department_id = ?`,
            [departmentId]
        );
        return doctors;
    },

    /**
     * Get doctor's appointments
     */
    getAppointments: async (doctorId, options = {}) => {
        const { page = 1, limit = 10, date, status } = options;
        const offset = (page - 1) * limit;

        let query = `SELECT a.*, p.name as patient_name, p.patient_id as patient_code
                 FROM appointments a
                 LEFT JOIN patients p ON a.patient_id = p.id
                 WHERE a.doctor_id = ?`;
        const params = [doctorId];

        if (date) {
            query += ` AND a.appointment_date = ?`;
            params.push(date);
        }

        if (status) {
            query += ` AND a.status = ?`;
            params.push(status);
        }

        const countQuery = query.replace('SELECT a.*, p.name as patient_name, p.patient_id as patient_code', 'SELECT COUNT(*) as total');
        const [countResult] = await db.query(countQuery, params);
        const total = countResult?.[0]?.total || 0;

        query += ` ORDER BY a.appointment_date DESC, a.appointment_time ASC LIMIT ? OFFSET ?`;
        params.push(Number(limit), Number(offset));

        const [rows] = await db.query(query, params);

        return {
            data: rows,
            pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) }
        };
    },

    /**
     * Get doctor's schedule for a date
     */
    getSchedule: async (doctorId, date) => {
        const [appointments] = await db.query(
            `SELECT a.id, a.appointment_id, a.appointment_time, a.end_time, a.status,
              p.name as patient_name, p.patient_id as patient_code
       FROM appointments a
       LEFT JOIN patients p ON a.patient_id = p.id
       WHERE a.doctor_id = ? AND a.appointment_date = ?
       ORDER BY a.appointment_time ASC`,
            [doctorId, date]
        );
        return appointments;
    },

    /**
     * Update availability
     */
    updateAvailability: async (doctorId, data) => {
        const fields = [];
        const values = [];

        if (data.available_days) {
            fields.push('available_days = ?');
            values.push(JSON.stringify(data.available_days));
        }

        if (data.available_time_start) {
            fields.push('available_time_start = ?');
            values.push(data.available_time_start);
        }

        if (data.available_time_end) {
            fields.push('available_time_end = ?');
            values.push(data.available_time_end);
        }

        if (data.status) {
            fields.push('status = ?');
            values.push(data.status);
        }

        if (fields.length === 0) return Doctor.findById(doctorId);

        values.push(doctorId);

        await db.query(
            `UPDATE doctors SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return Doctor.findById(doctorId);
    },

    /**
     * Get available doctors
     */
    getAvailable: async (date, departmentId = null) => {
        const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });

        let query = `SELECT id, doctor_id, name, specialization, consultation_fee,
                        available_time_start, available_time_end
                 FROM doctors
                 WHERE status = 'Available'
                 AND JSON_CONTAINS(available_days, ?)`;
        const params = [JSON.stringify(dayOfWeek)];

        if (departmentId) {
            query += ` AND department_id = ?`;
            params.push(departmentId);
        }

        const [doctors] = await db.query(query, params);
        return doctors;
    },

    /**
     * Increment total patients
     */
    incrementPatientCount: async (doctorId) => {
        await db.query(
            `UPDATE doctors SET total_patients = total_patients + 1 WHERE id = ?`,
            [doctorId]
        );
    }
};

module.exports = Doctor;
