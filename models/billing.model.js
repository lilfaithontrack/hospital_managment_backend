/**
 * Billing Model
 * Handles bills and payments
 */

const db = require('../config/db.config');
const { v4: uuidv4 } = require('uuid');
const { generateBillNumber, generatePaymentId } = require('../utils/idGenerator');

const Billing = {
    // Bills
    findAllBills: async (options = {}) => {
        const { page = 1, limit = 10, patient_id, payment_status, status } = options;
        const offset = (page - 1) * limit;

        let query = `SELECT b.*, p.name as patient_name, p.patient_id as patient_code
                 FROM bills b
                 LEFT JOIN patients p ON b.patient_id = p.id
                 WHERE 1=1`;
        const params = [];

        if (patient_id) { query += ` AND b.patient_id = ?`; params.push(patient_id); }
        if (payment_status) { query += ` AND b.payment_status = ?`; params.push(payment_status); }
        if (status) { query += ` AND b.status = ?`; params.push(status); }

        const countQuery = query.replace('SELECT b.*, p.name as patient_name, p.patient_id as patient_code', 'SELECT COUNT(*) as total');
        const [countResult] = await db.query(countQuery, params);
        const total = countResult?.[0]?.total || 0;

        query += ` ORDER BY b.bill_date DESC LIMIT ? OFFSET ?`;
        params.push(Number(limit), Number(offset));

        const [rows] = await db.query(query, params);
        return { data: rows, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) } };
    },

    findBillById: async (id) => {
        const [[bill]] = await db.query(
            `SELECT b.*, p.name as patient_name, p.patient_id as patient_code, p.phone as patient_phone
       FROM bills b
       LEFT JOIN patients p ON b.patient_id = p.id
       WHERE b.id = ?`, [id]
        );

        if (bill) {
            // Get bill items
            const [items] = await db.query(`SELECT * FROM bill_items WHERE bill_id = ?`, [id]);
            bill.items = items;

            // Get payments
            const [payments] = await db.query(`SELECT * FROM payments WHERE bill_id = ?`, [id]);
            bill.payments = payments;
        }

        return bill;
    },

    createBill: async (data) => {
        const id = uuidv4();
        const billNumber = await generateBillNumber();

        await db.query(
            `INSERT INTO bills (
        id, bill_number, patient_id, admission_id, opd_visit_id, bill_date, due_date,
        subtotal, discount_amount, discount_reason, tax_amount, total_amount,
        insurance_claim_id, insurance_amount, status, notes, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, billNumber, data.patient_id, data.admission_id || null, data.opd_visit_id || null,
                data.bill_date || new Date(), data.due_date || null,
                data.subtotal || 0, data.discount_amount || 0, data.discount_reason || null,
                data.tax_amount || 0, data.total_amount || 0,
                data.insurance_claim_id || null, data.insurance_amount || 0,
                data.status || 'Draft', data.notes || null, data.created_by || null]
        );

        return Billing.findBillById(id);
    },

    updateBill: async (id, data) => {
        const allowedFields = ['due_date', 'subtotal', 'discount_amount', 'discount_reason',
            'tax_amount', 'total_amount', 'paid_amount', 'balance_due', 'insurance_claim_id',
            'insurance_amount', 'payment_status', 'status', 'notes'];

        const fields = [];
        const values = [];

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                fields.push(`${field} = ?`);
                values.push(data[field]);
            }
        }

        if (fields.length === 0) return Billing.findBillById(id);
        values.push(id);

        await db.query(`UPDATE bills SET ${fields.join(', ')} WHERE id = ?`, values);
        return Billing.findBillById(id);
    },

    addBillItem: async (billId, data) => {
        const id = uuidv4();

        await db.query(
            `INSERT INTO bill_items (id, bill_id, billing_item_id, description, quantity, unit_price, discount, tax, total, service_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, billId, data.billing_item_id || null, data.description, data.quantity || 1,
                data.unit_price, data.discount || 0, data.tax || 0, data.total,
                data.service_date || null, data.notes || null]
        );

        // Recalculate bill totals
        await Billing.recalculateBill(billId);

        return Billing.findBillById(billId);
    },

    recalculateBill: async (billId) => {
        const [[totals]] = await db.query(
            `SELECT SUM(total) as subtotal, SUM(tax) as tax_total, SUM(discount) as discount_total
       FROM bill_items WHERE bill_id = ?`, [billId]
        );

        const subtotal = totals.subtotal || 0;
        const taxAmount = totals.tax_total || 0;
        const discountAmount = totals.discount_total || 0;
        const totalAmount = subtotal + taxAmount - discountAmount;

        await db.query(
            `UPDATE bills SET subtotal = ?, tax_amount = ?, discount_amount = ?, total_amount = ?, balance_due = total_amount - paid_amount WHERE id = ?`,
            [subtotal, taxAmount, discountAmount, totalAmount, billId]
        );
    },

    // Payments
    recordPayment: async (data) => {
        const id = uuidv4();
        const paymentId = await generatePaymentId();

        await db.query(
            `INSERT INTO payments (
        id, payment_id, bill_id, patient_id, amount, payment_date, payment_method,
        transaction_reference, receipt_number, notes, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, paymentId, data.bill_id, data.patient_id, data.amount,
                data.payment_date || new Date(), data.payment_method,
                data.transaction_reference || null, data.receipt_number || null,
                data.notes || null, data.created_by || null]
        );

        // Update bill paid amount
        await db.query(
            `UPDATE bills SET paid_amount = paid_amount + ?, 
       balance_due = total_amount - (paid_amount + ?),
       payment_status = CASE 
         WHEN (paid_amount + ?) >= total_amount THEN 'Paid'
         WHEN (paid_amount + ?) > 0 THEN 'Partial'
         ELSE 'Pending'
       END
       WHERE id = ?`,
            [data.amount, data.amount, data.amount, data.amount, data.bill_id]
        );

        const [[payment]] = await db.query(`SELECT * FROM payments WHERE id = ?`, [id]);
        return payment;
    },

    getPayments: async (options = {}) => {
        const { page = 1, limit = 20, bill_id, patient_id, payment_method } = options;
        const offset = (page - 1) * limit;

        let query = `SELECT p.*, b.bill_number, pt.name as patient_name
                 FROM payments p
                 LEFT JOIN bills b ON p.bill_id = b.id
                 LEFT JOIN patients pt ON p.patient_id = pt.id
                 WHERE 1=1`;
        const params = [];

        if (bill_id) { query += ` AND p.bill_id = ?`; params.push(bill_id); }
        if (patient_id) { query += ` AND p.patient_id = ?`; params.push(patient_id); }
        if (payment_method) { query += ` AND p.payment_method = ?`; params.push(payment_method); }

        query += ` ORDER BY p.payment_date DESC LIMIT ? OFFSET ?`;
        params.push(Number(limit), Number(offset));

        const [rows] = await db.query(query, params);
        return rows;
    },

    getBillingItems: async () => {
        const [items] = await db.query(`SELECT * FROM billing_items WHERE is_active = 1 ORDER BY category, name`);
        return items;
    }
};

module.exports = Billing;
