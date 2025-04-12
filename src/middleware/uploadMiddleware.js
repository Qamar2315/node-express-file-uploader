// src/middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');
const config = require('../config');
const { getSafeFolderPath } = require('../services/fileSystemService');

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        try {
            const requestedFolder = req.body.folder || config.defaultFolders[2] || 'documents'; // Default if not provided
            const destinationPath = getSafeFolderPath(requestedFolder); // Use service to validate/create path
            cb(null, destinationPath);
        } catch (error) {
             console.error(`Error determining destination: ${error.message}. File: ${file.originalname}`);
             // Pass error to multer's error handling
             cb(error);
        }
    },
    filename: (req, file, cb) => {
        try {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const extension = path.extname(file.originalname);
            const baseName = path.basename(file.originalname, extension);
            const safeBaseName = baseName.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
            const finalFilename = `${safeBaseName}-${uniqueSuffix}${extension}`;
            cb(null, finalFilename);
        } catch (error) {
            console.error(`Error generating filename for ${file.originalname}: ${error.message}`);
            cb(error); // Pass error
        }
    }
});

// Multer File Filter
const fileFilter = (req, file, cb) => {
    if (config.allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true); // Accept file
    } else {
        console.warn(`Rejected file upload: ${file.originalname} (type: ${file.mimetype})`);
        // Create an error object Multer understands
        const err = new Error(`File type not allowed: ${file.mimetype}`);
        err.code = 'INVALID_FILE_TYPE';
        cb(err, false); // Reject file with specific error
    }
};

// Multer Instance
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: config.maxFileSize
    }
});

module.exports = upload; // Export the configured Multer instance