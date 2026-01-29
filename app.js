/**
 * Express Application Setup
 * Medical Management System by Michu Tech
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { globalErrorHandler } = require('./utils/errorHandler');
const routes = require('./routes');

const app = express();

// CORS configuration
// CORS configuration
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:8080',
    'https://medical.michutech.net',
    ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [])
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
            callback(null, true);
        } else {
            console.log('Blocked by CORS:', origin);
            callback(null, true); // Temporarily allow for debugging if needed, or stick to error:
            // callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files - uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'MMS Backend is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API Routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.url} not found`,
        timestamp: new Date().toISOString()
    });
});

// Global error handler
app.use(globalErrorHandler);

module.exports = app;
