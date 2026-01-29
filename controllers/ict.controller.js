/**
 * ICT Controller
 */
const { ICTAsset, ICTTicket } = require('../models/ict.model');

const ICTController = {
    // --- Assets ---
    getAssets: async (req, res) => {
        try {
            const result = await ICTAsset.findAll(req.query);
            res.json({ success: true, ...result });
        } catch (error) { res.status(500).json({ success: false, message: error.message }); }
    },
    createAsset: async (req, res) => {
        try {
            const asset = await ICTAsset.create(req.body);
            res.status(201).json({ success: true, data: asset });
        } catch (error) { res.status(500).json({ success: false, message: error.message }); }
    },
    updateAsset: async (req, res) => {
        try {
            const asset = await ICTAsset.update(req.params.id, req.body);
            if (!asset) return res.status(404).json({ success: false, message: 'Not found' });
            res.json({ success: true, data: asset });
        } catch (error) { res.status(500).json({ success: false, message: error.message }); }
    },

    // --- Tickets ---
    getTickets: async (req, res) => {
        try {
            const result = await ICTTicket.findAll(req.query);
            res.json({ success: true, ...result });
        } catch (error) { res.status(500).json({ success: false, message: error.message }); }
    },
    createTicket: async (req, res) => {
        try {
            const ticketData = { ...req.body, reported_by: req.user.id }; // Assuming auth
            const ticket = await ICTTicket.create(ticketData);
            res.status(201).json({ success: true, data: ticket });
        } catch (error) { res.status(500).json({ success: false, message: error.message }); }
    },
    updateTicket: async (req, res) => {
        try {
            const ticket = await ICTTicket.update(req.params.id, req.body);
            if (!ticket) return res.status(404).json({ success: false, message: 'Not found' });
            res.json({ success: true, data: ticket });
        } catch (error) { res.status(500).json({ success: false, message: error.message }); }
    }
};

module.exports = ICTController;
