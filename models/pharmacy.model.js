/**
 * Pharmacy Model
 * Handles pharmacy items and dispensing
 */

const db = require('../config/db.config');
const { v4: uuidv4 } = require('uuid');

const Pharmacy = {
    tableName: 'pharmacy_items',

    findAll: async (options = {}) => {
        const { page = 1, limit = 10, search, category_id, dosage_form, low_stock } = options;
        const offset = (page - 1) * limit;

        let query = `SELECT p.*, c.name as category_name
                 FROM pharmacy_items p
                 LEFT JOIN pharmacy_categories c ON p.category_id = c.id
                 WHERE p.is_active = 1`;
        const params = [];

        if (search) { query += ` AND (p.name LIKE ? OR p.item_code LIKE ? OR p.generic_name LIKE ?)`; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
        if (category_id) { query += ` AND p.category_id = ?`; params.push(category_id); }
        if (dosage_form) { query += ` AND p.dosage_form = ?`; params.push(dosage_form); }
        if (low_stock) { query += ` AND p.stock_quantity <= p.min_stock_level`; }

        const countQuery = query.replace('SELECT p.*, c.name as category_name', 'SELECT COUNT(*) as total');
        const [countResult] = await db.query(countQuery, params);
        const total = countResult?.[0]?.total || 0;

        query += ` ORDER BY p.name ASC LIMIT ? OFFSET ?`;
        params.push(Number(limit), Number(offset));

        const [rows] = await db.query(query, params);
        return { data: rows, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) } };
    },

    findById: async (id) => {
        const [[item]] = await db.query(
            `SELECT p.*, c.name as category_name FROM pharmacy_items p
       LEFT JOIN pharmacy_categories c ON p.category_id = c.id WHERE p.id = ?`, [id]
        );
        return item;
    },

    create: async (data) => {
        const id = uuidv4();

        await db.query(
            `INSERT INTO pharmacy_items (
        id, item_code, name, generic_name, category_id, manufacturer, dosage_form,
        strength, unit_of_measure, stock_quantity, min_stock_level, max_stock_level,
        reorder_level, unit_cost, selling_price, mrp, batch_number, expiry_date,
        manufacturing_date, storage_conditions, requires_prescription, is_controlled, location
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, data.item_code, data.name, data.generic_name || null, data.category_id || null,
                data.manufacturer || null, data.dosage_form, data.strength || null,
                data.unit_of_measure || null, data.stock_quantity || 0,
                data.min_stock_level || 10, data.max_stock_level || 1000, data.reorder_level || 20,
                data.unit_cost || null, data.selling_price || null, data.mrp || null,
                data.batch_number || null, data.expiry_date || null, data.manufacturing_date || null,
                data.storage_conditions || null, data.requires_prescription !== false,
                data.is_controlled || false, data.location || null]
        );

        return Pharmacy.findById(id);
    },

    update: async (id, data) => {
        const allowedFields = ['name', 'generic_name', 'category_id', 'manufacturer', 'dosage_form',
            'strength', 'unit_of_measure', 'stock_quantity', 'min_stock_level', 'max_stock_level',
            'reorder_level', 'unit_cost', 'selling_price', 'mrp', 'batch_number', 'expiry_date',
            'storage_conditions', 'requires_prescription', 'is_controlled', 'is_active', 'location'];

        const fields = [];
        const values = [];

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                fields.push(`${field} = ?`);
                values.push(data[field]);
            }
        }

        if (fields.length === 0) return Pharmacy.findById(id);
        values.push(id);

        await db.query(`UPDATE pharmacy_items SET ${fields.join(', ')} WHERE id = ?`, values);
        return Pharmacy.findById(id);
    },

    updateStock: async (id, quantity, operation = 'add') => {
        const operator = operation === 'add' ? '+' : '-';
        await db.query(
            `UPDATE pharmacy_items SET stock_quantity = stock_quantity ${operator} ? WHERE id = ?`,
            [quantity, id]
        );
        return Pharmacy.findById(id);
    },

    dispense: async (data) => {
        const id = uuidv4();
        const transactionId = `TRX-${Date.now().toString(36).toUpperCase()}`;

        // Record transaction
        await db.query(
            `INSERT INTO pharmacy_transactions (
        id, transaction_id, item_id, transaction_type, quantity, unit_price,
        total_amount, patient_id, prescription_id, invoice_number, notes, created_by
      ) VALUES (?, ?, ?, 'Sale', ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, transactionId, data.item_id, data.quantity, data.unit_price || null,
                data.total_amount || null, data.patient_id || null, data.prescription_id || null,
                data.invoice_number || null, data.notes || null, data.created_by || null]
        );

        // Update stock
        await Pharmacy.updateStock(data.item_id, data.quantity, 'subtract');

        const [[transaction]] = await db.query(`SELECT * FROM pharmacy_transactions WHERE id = ?`, [id]);
        return transaction;
    },

    getLowStock: async () => {
        const [items] = await db.query(
            `SELECT * FROM pharmacy_items WHERE stock_quantity <= min_stock_level AND is_active = 1 ORDER BY stock_quantity ASC`
        );
        return items;
    },

    getExpiring: async (days = 30) => {
        const [items] = await db.query(
            `SELECT * FROM pharmacy_items WHERE expiry_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY) AND expiry_date >= CURDATE() AND is_active = 1 ORDER BY expiry_date ASC`,
            [days]
        );
        return items;
    },

    getTransactions: async (options = {}) => {
        const { page = 1, limit = 20, item_id, transaction_type } = options;
        const offset = (page - 1) * limit;

        let query = `SELECT t.*, i.name as item_name FROM pharmacy_transactions t
                 LEFT JOIN pharmacy_items i ON t.item_id = i.id WHERE 1=1`;
        const params = [];

        if (item_id) { query += ` AND t.item_id = ?`; params.push(item_id); }
        if (transaction_type) { query += ` AND t.transaction_type = ?`; params.push(transaction_type); }

        query += ` ORDER BY t.created_at DESC LIMIT ? OFFSET ?`;
        params.push(Number(limit), Number(offset));

        const [rows] = await db.query(query, params);
        return rows;
    },

    getCategories: async () => {
        const [categories] = await db.query(`SELECT * FROM pharmacy_categories ORDER BY name`);
        return categories;
    }
};

module.exports = Pharmacy;
