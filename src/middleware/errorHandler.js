const multer = require('multer');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
    console.error("Global Error Handler:", err.message); // Log the error message
    // Log stack trace for detailed debugging, but don't expose it in production
    if (process.env.NODE_ENV !== 'production') {
        console.error(err.stack);
    }

    let statusCode = err.statusCode || 500; // Use error's status or default to 500
    let message = err.message || 'An unexpected internal server error occurred.';

    // Handle specific Multer errors for user-friendly messages
    if (err instanceof multer.MulterError) {
        statusCode = 400; // Bad Request for Multer errors
        if (err.code === 'LIMIT_FILE_SIZE') {
            message = 'File is too large. Maximum size allowed is 10MB.'; // Use config value ideally
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
             message = 'Unexpected file field encountered.';
        } // Add more Multer error codes as needed
    } else if (err.code === 'INVALID_FILE_TYPE') { // Custom error code from our filter
        statusCode = 400;
        // Message is already set in the error object from fileFilter
    }

    // Ensure status code is in the valid HTTP range
    if (statusCode < 400 || statusCode >= 600) {
        console.warn(`Invalid status code detected (${statusCode}), defaulting to 500.`);
        statusCode = 500;
    }

    res.status(statusCode).json({
        success: false,
        message: message,
        // Optionally include error code or stack in development
        ...(process.env.NODE_ENV !== 'production' && { error: { code: err.code, stack: err.stack } })
    });
}

module.exports = errorHandler;