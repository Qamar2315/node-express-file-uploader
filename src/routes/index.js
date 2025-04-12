const express = require('express');
const fileRoutes = require('./fileRoutes');
// Import other route files here if you add more features (e.g., userRoutes)

const router = express.Router();

// Mount the file routes under the / path relative to the main router's mount point (/api)
router.use('/', fileRoutes);

// Example: Mount user routes if they existed
// router.use('/users', userRoutes);

module.exports = router;