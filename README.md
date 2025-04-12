# Node.js Express File Uploader

A robust and organized Node.js and Express-based file upload server allowing users to upload files to categorized folders via a user-friendly web interface. Built with a layered backend architecture for maintainability and scalability.

## Features

*   **File Uploads:** Supports uploading various file types (configurable).
*   **Folder Management:**
    *   Upload files to specific folders (pictures, videos, documents by default).
    *   Dynamically create new folders via the API and web UI.
    *   List available upload folders.
*   **Web Interface:**
    *   Clean UI for folder selection and creation.
    *   Drag & drop file selection support.
    *   File preview before uploading.
    *   Real-time upload progress indication.
    *   Display of recent upload history.
*   **Backend API:** RESTful endpoints for interacting with folders and files.
*   **Layered Architecture:** Backend structured into `config`, `routes`, `controllers`, `services`, and `middleware` for better separation of concerns.
*   **Security:**
    *   File type validation (MIME type checking).
    *   Configurable file size limits.
    *   Folder and file name sanitization.
    *   Basic protection against directory traversal attacks.
*   **Storage:** Uses the local filesystem for storing uploaded files.

## Technology Stack

*   **Backend:** Node.js, Express.js
*   **Middleware:** Multer (for file uploads), CORS (for cross-origin requests)
*   **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
*   **Storage:** Local Filesystem
*   **Package Manager:** npm

## Project Structure

```
/node-express-file-uploader
├── src/                      # Backend source code
│   ├── config/               # Configuration files (port, paths, limits etc.)
│   │   └── index.js
│   ├── controllers/          # Request/response handlers
│   │   └── fileController.js
│   ├── middleware/           # Custom Express middleware
│   │   ├── errorHandler.js   # Global error handler
│   │   └── uploadMiddleware.js # Multer configuration
│   ├── routes/               # API route definitions
│   │   ├── fileRoutes.js     # Routes for file/folder operations
│   │   └── index.js          # Main API router
│   ├── services/             # Business logic and external interactions
│   │   └── fileSystemService.js # Filesystem operations
│   └── app.js                # Express application setup and configuration
├── public/                   # Static frontend files (served by Express)
│   ├── index.html            # Main HTML page
│   └── script.js             # Frontend JavaScript logic
├── qamar_main_folder/        # Default root directory for uploads (created automatically)
│   ├── pictures/             # Default subfolder
│   ├── videos/               # Default subfolder
│   └── documents/            # Default subfolder
├── .gitignore                # Git ignore file
├── package.json              # Project metadata and dependencies
├── package-lock.json         # Exact dependency versions
├── server.js                 # Main entry point to start the server
└── README.md                 # This file
```

## Prerequisites

*   [Node.js](https://nodejs.org/) (v14 or higher recommended)
*   [npm](https://www.npmjs.com/) (usually comes with Node.js)
*   [Git](https://git-scm.com/) (for cloning the repository)

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Qamar2315/node-express-file-uploader
    cd node-express-file-uploader
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

## Running the Application

1.  **Start the server:**
    ```bash
    npm start
    ```
    This will run the `node server.js` script defined in `package.json`.

2.  **(Optional) Start in development mode (requires nodemon):**
    If you have `nodemon` installed (`npm install -g nodemon` or `npm install --save-dev nodemon`), you can use:
    ```bash
    npm run dev
    ```
    This will automatically restart the server when file changes are detected.

3.  **Access the application:**
    Open your web browser and navigate to: `http://localhost:3000` (or the port specified in the configuration).

## API Endpoints

The following API endpoints are available under the `/api` prefix (e.g., `http://localhost:3000/api/folders`).

### Folders

*   **`GET /api/folders`**
    *   **Description:** List all available upload folders.
    *   **Response (Success - 200 OK):**
        ```json
        {
          "success": true,
          "folders": ["pictures", "videos", "documents", "custom_folder1"],
          "defaultFolders": ["pictures", "videos", "documents"]
        }
        ```
    *   **Response (Error - 500 Internal Server Error):**
        ```json
        {
          "success": false,
          "message": "Failed to read directory contents."
        }
        ```

*   **`POST /api/folders`**
    *   **Description:** Create a new folder within the main upload directory.
    *   **Request Body:**
        ```json
        {
          "folderName": "new_folder_name"
        }
        ```
    *   **Response (Success - 201 Created):**
        ```json
        {
          "success": true,
          "message": "Folder 'new_folder_name' created successfully",
          "folderName": "new_folder_name", // The sanitized name
          "folderPath": "qamar_main_folder/new_folder_name" // Relative path info
        }
        ```
    *   **Response (Error - 400 Bad Request):** (e.g., missing name, invalid name, folder exists)
        ```json
        {
          "success": false,
          "message": "Folder name is required." // Or other specific error
        }
        ```
     *   **Response (Error - 500 Internal Server Error):** (e.g., filesystem permission issue)
        ```json
        {
          "success": false,
          "message": "Failed to create folder on the server."
        }
        ```

### Uploads

*   **`POST /api/upload`**
    *   **Description:** Upload one or more files to a specified folder. Uses `multipart/form-data`.
    *   **Request:**
        *   `Content-Type: multipart/form-data`
        *   **Form Fields:**
            *   `folder`: (String) The name of the target folder (e.g., "pictures", "documents"). If omitted or invalid, defaults usually to "documents".
            *   `files`: (File) One or more files selected for upload. The key *must* be `files`.
    *   **Response (Success - 200 OK):**
        ```json
        {
          "success": true,
          "message": "1 file(s) uploaded successfully", // Number might vary
          "uploadedFiles": [
            {
              "originalName": "My Vacation Photo.jpg",
              "storedName": "My_Vacation_Photo-1678886400000-123456789.jpg",
              "size": 102400, // Size in bytes
              "mimetype": "image/jpeg",
              "folder": "pictures" // The folder it was actually saved in
            }
            // ... more files if multiple were uploaded
          ]
        }
        ```
    *   **Response (Error - 400 Bad Request):** (e.g., no files uploaded, file too large, invalid file type)
        ```json
        {
          "success": false,
          "message": "No files were uploaded." // Or "File is too large...", "File type not allowed..."
        }
        ```
     *   **Response (Error - 500 Internal Server Error):** (e.g., filesystem write error)
            ```json
            {
            "success": false,
            "message": "An unexpected internal server error occurred."
            }
            ```

## Configuration

Application settings can be modified in `src/config/index.js`:

*   `port`: The port the server listens on (Default: `3000`).
*   `mainFolderName`: Name of the root directory for uploads (Default: `qamar_main_folder`).
*   `mainFolderPath`: Absolute path to the main upload directory (automatically calculated).
*   `defaultFolders`: Array of folder names to create automatically on startup (Default: `['pictures', 'videos', 'documents']`).
*   `maxFileSize`: Maximum allowed file size in bytes (Default: `10 * 1024 * 1024` - 10 MB).
*   `allowedMimeTypes`: Array of allowed MIME types for uploaded files.
*   `corsOptions`: Configuration for the `cors` middleware (adjust origin for production).

## Security Considerations

*   **File Types:** Only MIME types listed in `allowedMimeTypes` (config) are permitted. Ensure this list is appropriate for your use case.
*   **File Size:** Uploads are limited by `maxFileSize` (config).
*   **Sanitization:** Folder names and filenames are sanitized to remove potentially unsafe characters and prevent directory traversal (`../`).
*   **CORS:** Cross-Origin Resource Sharing is enabled. Configure `corsOptions` strictly for production environments to only allow requests from your frontend's domain.
*   **Authentication:** This project **does not** implement user authentication or authorization. Access to upload files and create folders is currently public. Implement appropriate security layers if deploying in a sensitive environment.
*   **Rate Limiting:** Consider adding rate limiting middleware (e.g., `express-rate-limit`) to prevent abuse if the server is publicly accessible.

## Future Enhancements

*   **Authentication & Authorization:** Implement user accounts and permissions.
*   **Database Integration:** Store file metadata (uploader, timestamp, description, etc.) in a database.
*   **Cloud Storage:** Add support for uploading files to cloud providers like AWS S3 or Google Cloud Storage.
*   **File Management:** Implement features for deleting files or listing files within folders.
*   **Testing:** Add unit and integration tests.
*   **Advanced Validation:** Implement more sophisticated file validation (e.g., magic number checks).
*   **UI Improvements:** Enhance the frontend with features like thumbnail previews.
