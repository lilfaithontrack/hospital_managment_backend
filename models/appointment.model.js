/**
 * Appointment Model
 * Handles appointment scheduling and management
 */

const db = require('../config/db.config');
const { v4: uuidv4 } = require('uuid');
const { generateAppointmentId } = require('../utils/idGenerator');

const Appointment = {
    tableName: 'appointments',

    /**
     * Find all appointments with pagination
     */
    findAll: async (options = {}) => {
        const { page = 1, limit = 10, search, status, date, doctor_id, patient_id, type } = options;
        const offset = (page - 1) * limit;

        let query = `SELECT a.*, 
                 p.name as patient_name, p.patient_id as patient_code,
                 d.name as doctor_name, d.specialization
                 FROM appointments a
                 LEFT JOIN patients p ON a.patient_id = p.id
                 LEFT JOIN doctors d ON a.doctor_id = d.id
                 WHERE 1=1`;
        const params = [];

        if (search) {
            query += ` AND (p.name LIKE ? OR a.appointment_id LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }

        if (status) {
            query += ` AND a.status = ?`;
            params.push(status);
        }

        if (date) {
            query += ` AND a.appointment_date = ?`;
            params.push(date);
        }

        if (doctor_id) {
            query += ` AND a.doctor_id = ?`;
            params.push(doctor_id);
        }

        if (patient_id) {
            query += ` AND a.patient_id = ?`;
            params.push(patient_id);
        }

        if (type) {
            query += ` AND a.type = ?`;
            params.push(type);
        }

        const countQuery = query.replace(
            'SELECT a.*, p.name as patient_name, p.patient_id as patient_code, d.name as doctor_name, d.specialization',
            'SELECT COUNT(*) as total'
        );
        const [countResult] = await db.query(countQuery, params);
        const total = countResult?.[0]?.total || 0;

        query += ` ORDER BY a.appointment_date DESC, a.appointment_time ASC LIMIT ? OFFSET ?`;
        params.push(Number(limit), Number(offset));

        const [rows] = await db.query(query, params);

        // Parse JSON fields
        rows.forEach(row => {
            if (row.vitals && typeof row.vitals === 'string') {
                try { row.vitals = JSON.parse(row.vitals); } catch (e) { row.vitals = null; }
            }
        });

        return {
            data: rows,
            pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) }
        };
    },

    /**
     * Find appointment by ID
     */
    findById: async (id) => {
        const [[appointment]] = await db.query(
            `SELECT a.*, 
       p.name as patient_name, p.patient_id as patient_code, p.phone as patient_phone,
       d.name as doctor_name, d.specialization, d.consultation_fee
       FROM appointments a
       LEFT JOIN patients p ON a.patient_id = p.id
       LEFT JOIN doctors d ON a.doctor_id = d.id
       WHERE a.id = ?`,
            [id]
        );

        if (appointment && appointment.vitals && typeof appointment.vitals === 'string') {
            try { appointment.vitals = JSON.parse(appointment.vitals); } catch (e) { appointment.vitals = null; }
        }

        return appointment;
    },

    /**
     * Create new appointment
     */
    create: async (data) => {
        const id = uuidv4();
        const appointmentId = await generateAppointmentId();

        await db.query(
            `INSERT INTO appointments (
        id, appointment_id, patient_id, doctor_id, appointment_date, appointment_time,
        end_time, type, status, reason, notes, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id, appointmentId, data.patient_id, data.doctor_id,
                data.appointment_date, data.appointment_time, data.end_time || null,
                data.type, data.status || 'Scheduled', data.reason || null,
                data.notes || null, data.created_by || null
            ]
        );

        return Appointment.findById(id);
    },

    /**
     * Update appointment
     */
    update: async (id, data) => {
        const allowedFields = [
            'patient_id', 'doctor_id', 'appointment_date', 'appointment_time',
            'end_time', 'type', 'status', 'reason', 'notes', 'vitals',
            'prescription', 'follow_up_date'
        ];

        const fields = [];
        const values = [];

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                if (field === 'vitals' && typeof data[field] === 'object') {
                    fields.push(`${field} = ?`);
                    values.push(JSON.stringify(data[field]));
                } else {
                    fields.push(`${field} = ?`);
                    values.push(data[field]);
                }
            }
        }

        if (fields.length === 0) return Appointment.findById(id);

        values.push(id);

        await db.query(
            `UPDATE appointments SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return Appointment.findById(id);
    },

    /**
     * Delete/Cancel appointment
     */
    delete: async (id) => {
        const [result] = await db.query(
            `DELETE FROM appointments WHERE id = ?`,
            [id]
        );
        return result.affectedRows > 0;
    },

    /**
     * Update status
     */
    updateStatus: async (id, status) => {
        await db.query(
            `UPDATE appointments SET status = ? WHERE id = ?`,
            [status, id]
        );
        return Appointment.findById(id);
    },

    /**
     * Get appointments by date
     */
    getByDate: async (date) => {
        const [appointments] = await db.query(
            `SELECT a.*, 
       p.name as patient_name, p.patient_id as patient_code,
       d.name as doctor_name
       FROM appointments a
       LEFT JOIN patients p ON a.patient_id = p.id
       LEFT JOIN doctors d ON a.doctor_id = d.id
       WHERE a.appointment_date = ?
       ORDER BY a.appointment_time ASC`,
            [date]
        );
        return appointments;
    },

    /**
     * Get available time slots for a doctor on a date
     */
    getAvailableSlots: async (doctorId, date, duration = 30) => {
        // Get doctor's availability
        const [[doctor]] = await db.query(
            `SELECT available_time_start, available_time_end, available_days
       FROM doctors WHERE id = ?`,
            [doctorId]
        );

        if (!doctor) return [];

        // Check if doctor is available on this day
        const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
        let availableDays = doctor.available_days;
        if (typeof availableDays === 'string') {
            try { availableDays = JSON.parse(availableDays); } catch (e) { availableDays = []; }
        }

        if (!availableDays || !availableDays.includes(dayOfWeek)) {
            return [];
        }

        // Get booked appointments
        const [bookedSlots] = await db.query(
            `SELECT appointment_time, end_time 
       FROM appointments 
       WHERE doctor_id = ? AND appointment_date = ? AND status NOT IN ('Cancelled', 'No Show')`,
            [doctorId, date]
        );

        // Generate available slots
        const slots = [];
        let currentTime = doctor.available_time_start;
        const endTime = doctor.available_time_end;

        while (currentTime < endTime) {
            const slotEnd = addMinutes(currentTime, duration);

            // Check if slot is available
            const isBooked = bookedSlots.some(booked => {
                return !(slotEnd <= booked.appointment_time || currentTime >= (booked.end_time || addMinutes(booked.appointment_time, duration)));
            });

            if (!isBooked && slotEnd <= endTime) {
                slots.push({
                    start_time: currentTime,
                    end_time: slotEnd
                });
            }

            currentTime = slotEnd;
        }

        return slots;
    },

    /**
     * Get today's appointments
     */
    getToday: async () => {
        const today = new Date().toISOString().split('T')[0];
        return Appointment.getByDate(today);
    },

    /**
     * Get appointment statistics
     */
    getStats: async (startDate, endDate) => {
        const [[stats]] = await db.query(
            `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(CASE WHEN status = 'No Show' THEN 1 ELSE 0 END) as no_show,
        SUM(CASE WHEN status = 'Scheduled' THEN 1 ELSE 0 END) as scheduled
       FROM appointments
       WHERE appointment_date BETWEEN ? AND ?`,
            [startDate, endDate]
        );
        return stats;
    }
};

// Helper function to add minutes to time
function addMinutes(time, minutes) {
    const [hours, mins] = time.split(':').map(Number);
    const totalMins = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMins / 60);
    const newMins = totalMins % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}:00`;
}

module.exports = Appointment;
