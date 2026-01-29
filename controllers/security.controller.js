/**
 * Security Controller
 */
const { SecurityCamera, SecurityVisitor, SecurityIncident } = require('../models/security.model');

const SecurityController = {
    // --- Cameras ---
    getCameras: async (req, res) => {
        try {
            const result = await SecurityCamera.findAll();
            res.json({ success: true, data: result });
        } catch (error) { res.status(500).json({ success: false, message: error.message }); }
    },
    createCamera: async (req, res) => {
        try {
            const cam = await SecurityCamera.create(req.body);
            res.status(201).json({ success: true, data: cam });
        } catch (error) { res.status(500).json({ success: false, message: error.message }); }
    },
    updateCamera: async (req, res) => {
        try {
            const cam = await SecurityCamera.update(req.params.id, req.body);
            if (!cam) return res.status(404).json({ success: false, message: 'Not found' });
            res.json({ success: true, data: cam });
        } catch (error) { res.status(500).json({ success: false, message: error.message }); }
    },
    deleteCamera: async (req, res) => {
        try {
            await SecurityCamera.delete(req.params.id);
            res.json({ success: true, message: 'Camera deleted' });
        } catch (error) { res.status(500).json({ success: false, message: error.message }); }
    },

    // --- Visitors ---
    getVisitors: async (req, res) => {
        try {
            const result = await SecurityVisitor.findAll(req.query);
            res.json({ success: true, ...result });
        } catch (error) { res.status(500).json({ success: false, message: error.message }); }
    },
    checkInVisitor: async (req, res) => {
        try {
            const visitor = await SecurityVisitor.create(req.body);
            res.status(201).json({ success: true, data: visitor });
        } catch (error) { res.status(500).json({ success: false, message: error.message }); }
    },
    checkOutVisitor: async (req, res) => {
        try {
            const visitor = await SecurityVisitor.checkout(req.params.id);
            res.json({ success: true, data: visitor });
        } catch (error) { res.status(500).json({ success: false, message: error.message }); }
    },

    // --- Incidents ---
    getIncidents: async (req, res) => {
        try {
            const result = await SecurityIncident.findAll(req.query);
            res.json({ success: true, ...result });
        } catch (error) { res.status(500).json({ success: false, message: error.message }); }
    },
    createIncident: async (req, res) => {
        try {
            let files = [];
            if (req.files) files = req.files.map(f => f.filename);

            const data = { ...req.body, reported_by: req.user.id, evidence_files: files };
            const incident = await SecurityIncident.create(data);
            res.status(201).json({ success: true, data: incident });
        } catch (error) { res.status(500).json({ success: false, message: error.message }); }
    }
};

module.exports = SecurityController;
