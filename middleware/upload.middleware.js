/**
 * File Upload Middleware
 * Multer configuration for handling file uploads
 */

const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Upload directory
const uploadDir = process.env.UPLOAD_DIR || './uploads';

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Allowed file types
    const allowedTypes = {
        image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        report: ['application/pdf', 'image/jpeg', 'image/png'],
        all: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    };

    // Check file type based on upload type (default to all)
    const uploadType = req.uploadType || 'all';
    const allowed = allowedTypes[uploadType] || allowedTypes.all;

    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`File type not allowed. Allowed types: ${allowed.join(', ')}`), false);
    }
};

// Create multer instance
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
    }
});

// Middleware for single file upload
const uploadSingle = (fieldName, uploadType = 'all') => {
    return (req, res, next) => {
        req.uploadType = uploadType;
        upload.single(fieldName)(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        success: false,
                        message: 'File too large. Maximum size is 10MB.'
                    });
                }
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            } else if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }
            next();
        });
    };
};

// Middleware for multiple file upload
const uploadMultiple = (fieldName, maxCount = 5, uploadType = 'all') => {
    return (req, res, next) => {
        req.uploadType = uploadType;
        upload.array(fieldName, maxCount)(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        success: false,
                        message: 'File too large. Maximum size is 10MB.'
                    });
                }
                if (err.code === 'LIMIT_FILE_COUNT') {
                    return res.status(400).json({
                        success: false,
                        message: `Too many files. Maximum is ${maxCount} files.`
                    });
                }
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            } else if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }
            next();
        });
    };
};

// Middleware for profile image upload
const uploadProfileImage = uploadSingle('profile_image', 'image');

// Middleware for document upload
const uploadDocument = uploadSingle('document', 'document');

// Middleware for report upload
const uploadReport = uploadSingle('report', 'report');

// Middleware for multiple images
const uploadImages = (maxCount = 5) => uploadMultiple('images', maxCount, 'image');

module.exports = {
    upload,
    uploadSingle,
    uploadMultiple,
    uploadProfileImage,
    uploadDocument,
    uploadReport,
    uploadImages
};
