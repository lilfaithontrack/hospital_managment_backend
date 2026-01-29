/**
 * Server Entry Point
 * Medical Management System by Michu Tech
 */

const app = require('./app');
const db = require('./config/db.config');
const fs = require('fs');
const path = require('path');
const migrate = require('./scripts/migrate');

const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('📁 Created uploads directory');
}

// Start server
const startServer = async () => {
    try {
        // Test database connection
        const dbConnected = await db.testConnection();

        if (dbConnected) {
            // Run automatic migrations
            console.log('🔄 Running automatic migrations...');
            await migrate();
        }

        if (!dbConnected) {
            console.error('❌ Failed to connect to database. Please check your configuration.');
            console.log('💡 Make sure MySQL is running and the database exists.');
            console.log('💡 You can create the database using: CREATE DATABASE hospital_management;');
        }

        // Start Express server
        app.listen(PORT, () => {
            console.log('');
            console.log('╔═══════════════════════════════════════════════════════════╗');
            console.log('║                                                           ║');
            console.log('║   🏥 Medical Management System Backend                    ║');
            console.log('║   by Michu Tech                                           ║');
            console.log('║                                                           ║');
            console.log(`║   🚀 Server running on port ${PORT}                          ║`);
            console.log(`║   📍 API Base URL: http://localhost:${PORT}/api              ║`);
            console.log(`║   🔧 Environment: ${(process.env.NODE_ENV || 'development').padEnd(12)}                    ║`);
            console.log('║                                                           ║');
            console.log('╚═══════════════════════════════════════════════════════════╝');
            console.log('');

            if (dbConnected) {
                console.log('📋 Available endpoints:');
                console.log('   GET  /health              - Health check');
                console.log('   POST /api/auth/register   - Register new user');
                console.log('   POST /api/auth/login      - User login');
                console.log('   GET  /api/patients        - Get all patients');
                console.log('   GET  /api/doctors         - Get all doctors');
                console.log('   ... and many more');
                console.log('');
            }
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err.message);
    console.error(err.stack);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('👋 SIGINT received. Shutting down gracefully...');
    process.exit(0);
});

// Start the server
startServer();
