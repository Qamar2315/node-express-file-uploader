// src/services/fileSystemService.js
const fs = require('fs');
const path = require('path');
const config = require('../config');

/**
 * Ensures the main upload directory and default subfolders exist.
 */
function initializeFolders() {
    if (!fs.existsSync(config.mainFolderPath)) {
        console.log(`Creating main directory: ${config.mainFolderPath}`);
        fs.mkdirSync(config.mainFolderPath, { recursive: true }); // Use recursive just in case
    }

    config.defaultFolders.forEach(folder => {
        const folderPath = path.join(config.mainFolderPath, folder);
        if (!fs.existsSync(folderPath)) {
            console.log(`Creating default folder: ${folderPath}`);
            fs.mkdirSync(folderPath);
        }
    });
    console.log('Folder structure initialized/verified.');
}

/**
 * Lists all directories within the main upload folder.
 * @returns {Array<string>} Array of folder names.
 */
function listFolders() {
    try {
        const entries = fs.readdirSync(config.mainFolderPath, { withFileTypes: true });
        const folders = entries
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);
        return folders;
    } catch (error) {
        console.error('Error listing folders:', error);
        // Let the controller handle the specific error response
        throw new Error('Failed to read directory contents.');
    }
}

/**
 * Creates a new folder within the main upload directory.
 * @param {string} folderName - The desired name for the new folder.
 * @returns {string} The sanitized name of the created folder.
 * @throws {Error} If folder exists, name is invalid, or creation fails.
 */
function createFolder(folderName) {
    if (!folderName || typeof folderName !== 'string' || folderName.trim().length === 0) {
        const error = new Error('Folder name is required.');
        error.statusCode = 400; // Add status code for controller
        throw error;
    }

    // Sanitize folder name
    const sanitizedFolderName = folderName.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    if (!sanitizedFolderName) {
        const error = new Error('Invalid folder name after sanitization.');
        error.statusCode = 400;
        throw error;
    }

    const folderPath = path.join(config.mainFolderPath, sanitizedFolderName);

    // Security Check: Ensure path resolves within the main folder
    const resolvedPath = path.resolve(folderPath);
    if (!resolvedPath.startsWith(path.resolve(config.mainFolderPath))) {
        console.warn(`Attempted directory traversal: ${folderName} -> ${sanitizedFolderName}`);
        const error = new Error('Invalid folder name (potential traversal attempt).');
        error.statusCode = 400;
        throw error;
    }

    if (fs.existsSync(folderPath)) {
        const error = new Error(`Folder '${sanitizedFolderName}' already exists.`);
        error.statusCode = 400; // Conflict might be better (409), but 400 is common
        throw error;
    }

    try {
        fs.mkdirSync(folderPath);
        console.log(`Created new folder via service: ${folderPath}`);
        return sanitizedFolderName; // Return the name that was actually created
    } catch (error) {
        console.error(`Error creating folder '${sanitizedFolderName}' in service:`, error);
        // Re-throw a generic error for the controller
        const serviceError = new Error('Failed to create folder on the server.');
        serviceError.statusCode = 500;
        throw serviceError;
    }
}

/**
 * Checks if a folder exists within the main directory and is safe.
 * Returns the absolute path if valid, otherwise throws.
 * @param {string} folderName
 * @returns {string} Absolute path to the folder
 */
function getSafeFolderPath(folderName) {
    const safeFolderName = folderName.replace(/\.\.\//g, ''); // Basic sanitize
    const folderPath = path.join(config.mainFolderPath, safeFolderName);
    const resolvedPath = path.resolve(folderPath);

    if (!resolvedPath.startsWith(path.resolve(config.mainFolderPath))) {
        throw new Error('Invalid folder path.');
    }
    if (!fs.existsSync(resolvedPath)) {
       try {
            fs.mkdirSync(resolvedPath);
            console.log(`Created folder during upload check: ${resolvedPath}`);
       } catch (mkdirErr) {
           console.error(`Failed to auto-create folder ${resolvedPath}: ${mkdirErr.message}`);
           // Fallback or re-throw depending on desired behavior
           const defaultPath = path.join(config.mainFolderPath, config.defaultFolders[2] || 'documents'); // Default to documents
           if (!fs.existsSync(defaultPath)) fs.mkdirSync(defaultPath); // Ensure default exists
           return defaultPath;
           // OR: throw new Error('Target folder does not exist and could not be created.');
       }
    }
    return resolvedPath;
}


module.exports = {
    initializeFolders,
    listFolders,
    createFolder,
    getSafeFolderPath,
};