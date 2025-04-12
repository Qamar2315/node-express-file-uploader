// server.js
const app = require('./src/app');
const config = require('./src/config');
const { initializeFolders } = require('./src/services/fileSystemService');

// Initialize necessary structures like folders before starting the server
try {
    initializeFolders();
    app.listen(config.port, () => {
        console.log(`Server running on http://localhost:${config.port}`);
        console.log(`Uploads will be stored in: ${config.mainFolderPath}`);
    });
} catch (error) {
    console.error("Failed to initialize or start the server:", error);
    process.exit(1); // Exit if essential setup fails
}