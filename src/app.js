// src/app.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const mainRouter = require('./routes'); // The main router from routes/index.js
const errorHandler = require('./middleware/errorHandler');

const app = express();

// --- Core Middleware ---
// Enable CORS - adjust options for production security
app.use(cors(config.corsOptions));

// Body Parsers
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Serve static files (frontend) from the 'public' directory
// Make sure the path is resolved correctly from the perspective of app.js location
app.use(express.static(path.join(__dirname, '..', 'public')));

// --- API Routes ---
// Mount the main router under the /api prefix
app.use('/api', mainRouter);

// --- Frontend Catch-all (Optional: for SPAs) ---
// If you were building a Single Page App, you might serve index.html for any non-API routes
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
// });

// --- Global Error Handler ---
// This MUST be the last piece of middleware added
app.use(errorHandler);

module.exports = app; // Export the configured app instance