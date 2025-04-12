// src/controllers/fileController.js
const path = require('path');
const fileSystemService = require('../services/fileSystemService');
const config = require('../config');

/**
 * @description List all available upload folders.
 * @route GET /api/folders
 */
async function listFolders(req, res, next) {
    try {
        const folders = fileSystemService.listFolders();
        res.json({
            success: true,
            folders: folders,
            defaultFolders: config.defaultFolders
        });
    } catch (error) {
        // Pass error to the global error handler
        next(error);
    }
}

/**
 * @description Create a new upload folder.
 * @route POST /api/folders
 */
async function createNewFolder(req, res, next) {
    const { folderName } = req.body;

    try {
        const createdFolderName = await fileSystemService.createFolder(folderName); // Use await if service becomes async
        res.status(201).json({
            success: true,
            message: `Folder '${createdFolderName}' created successfully`,
            folderName: createdFolderName,
            // Provide a relative path usable by clients
            folderPath: `${config.mainFolderName}/${createdFolderName}`
        });
    } catch (error) {
        // If the service threw an error with statusCode, use it, otherwise default to 500
        error.statusCode = error.statusCode || 500;
        next(error); // Pass to global error handler
    }
}

/**
 * @description Handle file uploads. Assumes uploadMiddleware has run.
 * @route POST /api/upload
 */
async function uploadFilesHandler(req, res, next) {
    // uploadMiddleware (applied in routes) handles the actual saving and errors like size/type
    // If we reach here, multer processing was successful *or* it called next(err)

    if (!req.files || req.files.length === 0) {
        // Should ideally not happen if multer is configured correctly unless no file was sent
        return res.status(400).json({ success: false, message: 'No files were uploaded.' });
    }

    try {
        // Files are already saved by multer's diskStorage. We just format the response.
        const uploadedFiles = req.files.map(file => ({
            originalName: file.originalname,
            storedName: file.filename,
            size: file.size,
            mimetype: file.mimetype,
            // Get the folder name from the file's path saved by multer
            folder: path.basename(path.dirname(file.path))
        }));

        console.log(`Controller: Successfully processed ${uploadedFiles.length} uploaded file(s). First file in folder: ${uploadedFiles[0]?.folder}`);

        res.status(200).json({ // Use 200 OK for successful upload completion
            success: true,
            message: `${uploadedFiles.length} file(s) uploaded successfully`,
            uploadedFiles: uploadedFiles
        });
    } catch (error) {
        console.error("Error formatting upload response:", error);
        // This catch block is more for unexpected errors *after* multer succeeds
        next(new Error('Failed to process upload information.'));
    }
}


module.exports = {
    listFolders,
    createNewFolder,
    uploadFilesHandler,
};