const app = require('./src/app');
const config = require('./src/config'); // Use the config object
const { initializeFolders } = require('./src/services/fileSystemService');
const http = require('http');

try {
    initializeFolders();

    const server = http.createServer(app);

    // Read timeout from config object VVVVVVVVVVVVVVVVVVVVVVV
    server.setTimeout(config.serverTimeout);

    server.listen(config.port, () => { // Use config port
        console.log(`Server running in ${config.nodeEnv} mode on http://localhost:${config.port}`);
        console.log(`Uploads folder: ${config.mainFolderPath}`);
        console.log(`Max file size: ${config.maxFileSize / 1024 / 1024} MB`);
        console.log(`Max files per upload: ${config.maxFilesPerUpload}`);
        console.log(`Server timeout: ${config.serverTimeout / 1000 / 60} minutes`); // Display timeout from config
    });

} catch (error) {
    console.error("Failed to initialize or start the server:", error);
    process.exit(1);
}