const express = require('express');
const fileController = require('../controllers/fileController');
const uploadMiddleware = require('../middleware/uploadMiddleware'); // Import configured multer

const router = express.Router();

// GET /api/folders - List folders
router.get('/folders', fileController.listFolders);

// POST /api/folders - Create a folder
router.post('/folders', fileController.createNewFolder);

// POST /api/upload - Upload files
// Apply the multer middleware *only* to this route
// 'files' must match the name attribute of the <input type="file" name="files"> in HTML form
router.post('/upload', uploadMiddleware.array('files', 10), fileController.uploadFilesHandler); // Allow up to 10 files

module.exports = router;