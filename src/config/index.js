const path = require('path');

const MAIN_FOLDER_NAME = process.env.MAIN_FOLDER || 'main_folder';
const MAIN_FOLDER_PATH = path.resolve(__dirname, '..', '..', MAIN_FOLDER_NAME); // Use path.resolve for absolute path

module.exports = {
    port: process.env.PORT || 3000,
    mainFolderName: MAIN_FOLDER_NAME,
    mainFolderPath: MAIN_FOLDER_PATH,
    defaultFolders: ['pictures', 'videos', 'documents'],
    maxFileSize: 10 * 1024 * 1024, // 10 MB
    allowedMimeTypes: [
        'image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime',
        'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
    ],
    corsOptions: { // Example: More specific CORS config for production
        origin: process.env.NODE_ENV === 'production' ? 'YOUR_FRONTEND_DOMAIN' : '*', // Allow all in dev
        methods: 'GET,POST',
    }
};