const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
// Should be done as early as possible
dotenv.config(); // Loads variables into process.env

const mainFolderNameDefault = 'qamar_main_folder';
const mainFolderName = process.env.MAIN_FOLDER_NAME || mainFolderNameDefault;
const mainFolderPath = path.resolve(__dirname, '..', '..', mainFolderName); // Use resolved path

// Helper function to parse integers with fallback
const parseIntOrDefault = (value, defaultValue) => {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
};

// Calculate bytes from MB provided in .env
const maxSizeMB = parseIntOrDefault(process.env.MAX_FILE_SIZE_MB, 1024); // Default 1GB
const maxSizeBytes = maxSizeMB * 1024 * 1024; // Calculate bytes

const maxFiles = parseIntOrDefault(process.env.MAX_FILES_PER_UPLOAD, 100); // Default 100 files

const serverTimeoutMinutes = parseIntOrDefault(process.env.SERVER_TIMEOUT_MINUTES, 15); // Default 15 mins
const serverTimeoutMs = serverTimeoutMinutes * 60 * 1000; // Calculate milliseconds

module.exports = {
    // General Config
    port: parseIntOrDefault(process.env.PORT, 3000),
    nodeEnv: process.env.NODE_ENV || 'development',

    // File System Config
    mainFolderName: mainFolderName,
    mainFolderPath: mainFolderPath,
    defaultFolders: ['pictures', 'videos', 'documents'], // Can still be hardcoded if stable

    // Upload Limits Config
    maxFileSize: maxSizeBytes, // Use calculated bytes
    maxFilesPerUpload: maxFiles, // Use parsed max files

    // Security Config
    allowedMimeTypes: [ // Keep this here unless it needs to be highly dynamic
        'image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime',
        'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
    ],
    corsOptions: {
        // Read directly from env, fallback to '*' for safety in dev if not set
        origin: process.env.CORS_ORIGIN || '*',
        methods: 'GET,POST', // Or make this configurable too if needed
    },

    // Server Config
    serverTimeout: serverTimeoutMs // Use calculated milliseconds
};