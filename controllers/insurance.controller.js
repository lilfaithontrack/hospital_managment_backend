/**
 * Insurance Controller
 * Handles insurance providers and claims
 */

const InsuranceProvider = require('../models/insuranceProvider.model');
const InsuranceClaim = require('../models/insuranceClaim.model');
const Billing = require('../models/billing.model');
const db = require('../config/db.config');

const InsuranceController = {
    // --- Providers ---

    getAllProviders: async (req, res) => {
        try {
            const result = await InsuranceProvider.findAll(req.query);
            res.json({ success: true, ...result });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error fetching providers' });
        }
    },

    createProvider: async (req, res) => {
        try {
            const provider = await InsuranceProvider.create(req.body);
            res.status(201).json({ success: true, data: provider });
        } catch (error) {
            console.error(error);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ success: false, message: 'Provider code already exists' });
            }
            res.status(500).json({ success: false, message: 'Error creating provider' });
        }
    },

    updateProvider: async (req, res) => {
        try {
            const provider = await InsuranceProvider.update(req.params.id, req.body);
            if (!provider) {
                return res.status(404).json({ success: false, message: 'Provider not found' });
            }
            res.json({ success: true, data: provider });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error updating provider' });
        }
    },

    deleteProvider: async (req, res) => {
        try {
            const success = await InsuranceProvider.delete(req.params.id);
            if (!success) {
                return res.status(404).json({ success: false, message: 'Provider not found' });
            }
            res.json({ success: true, message: 'Provider deleted successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error deleting provider' });
        }
    },

    // --- Claims (Accountant Workflow) ---

    getClaims: async (req, res) => {
        try {
            const result = await InsuranceClaim.findAll(req.query);
            res.json({ success: true, ...result });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error fetching claims' });
        }
    },

    createClaim: async (req, res) => {
        try {
            // Validate required fields
            const { bill_id, patient_id, insurance_provider_id, amount } = req.body;
            if (!bill_id || !patient_id || !insurance_provider_id || !amount) {
                return res.status(400).json({ success: false, message: 'Missing required fields' });
            }

            // Handle file uploads
            let documents = [];
            if (req.files && req.files.length > 0) {
                documents = req.files.map(file => file.filename);
            } else if (req.file) {
                documents.push(req.file.filename);
            }

            const claimData = {
                ...req.body,
                documents: documents,
                created_by: req.user ? req.user.id : null // Assuming auth middleware sets req.user
            };

            const claim = await InsuranceClaim.create(claimData);

            // Update Bill with Claim ID
            // We use a raw query here for simplicity or add a method to Billing model
            // Updating bill to link the claim
            await db.query(
                `UPDATE bills SET insurance_claim_id = ?, insurance_amount = ? WHERE id = ?`,
                [claim.id, amount, bill_id]
            );

            res.status(201).json({ success: true, data: claim, message: 'Insurance claim created successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error creating insurance claim' });
        }
    },

    updateClaimStatus: async (req, res) => {
        try {
            const { status, admin_notes } = req.body;
            if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
                return res.status(400).json({ success: false, message: 'Invalid status' });
            }

            const claim = await InsuranceClaim.updateStatus(req.params.id, status, admin_notes);

            if (!claim) {
                return res.status(404).json({ success: false, message: 'Claim not found' });
            }

            // If Approved, we might want to automatically update the bill payment status
            if (status === 'Approved') {
                // Fetch the bill
                const bill = await Billing.findBillById(claim.bill_id);
                if (bill) {
                    // Logic to mark as paid by insurance?
                    // For now, let's just record a "Payment" as if it was paid
                    // But maybe the accountant should do that manually?
                    // The prompt implies the accountant UPLOADS docs for the ADMIN to verify.
                    // If Admin approves, it effectively means "Payment Verified".

                    // Let's automate recording the payment if approved
                    await Billing.recordPayment({
                        bill_id: bill.id,
                        patient_id: bill.patient_id,
                        amount: claim.amount,
                        payment_method: 'Insurance',
                        transaction_reference: claim.claim_number,
                        notes: 'Auto-payment via Insurance Claim Approval',
                        created_by: req.user ? req.user.id : null
                    });
                }
            }

            res.json({ success: true, data: claim });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error updating claim status' });
        }
    }
};

module.exports = InsuranceController;
