document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:3000/api'; // Adjust if needed

    // DOM Elements
    const folderSelect = document.getElementById('folder-select');
    const refreshFoldersBtn = document.getElementById('refresh-folders');
    const newFolderInput = document.getElementById('new-folder');
    const createFolderBtn = document.getElementById('create-folder');
    const fileInput = document.getElementById('file-input');
    const fileDropzone = document.getElementById('file-dropzone');
    const filePreview = document.getElementById('file-preview');
    const uploadBtn = document.getElementById('upload-btn');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress');
    const uploadTableBody = document.getElementById('upload-table-body');
    const statusMessage = document.getElementById('status-message');

    let selectedFiles = []; // Store the File objects

    // --- Utility Functions ---
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function showStatus(message, isError = false) {
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${isError ? 'error' : 'success'}`;
        statusMessage.style.display = 'block';
        // Optionally hide after a delay
        setTimeout(() => {
            statusMessage.style.display = 'none';
        }, 5000);
    }

    // --- Folder Management ---
    async function fetchFolders() {
        try {
            folderSelect.disabled = true;
            folderSelect.innerHTML = '<option value="" disabled selected>Loading...</option>'; // Loading state

            const response = await fetch(`${API_BASE_URL}/folders`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            folderSelect.innerHTML = ''; // Clear previous options
            // Add a default prompt option
            folderSelect.add(new Option('Select a folder', '', true, true)); // disabled+selected initially
            folderSelect.options[0].disabled = true; // Keep it disabled

            // Add default folders first, then others alphabetically
            const defaultFolders = data.defaultFolders || [];
            const otherFolders = data.folders
                .filter(f => !defaultFolders.includes(f))
                .sort();

            [...defaultFolders.sort(), ...otherFolders].forEach(folder => {
                const option = new Option(folder, folder);
                folderSelect.add(option);
            });

             // Restore selection if possible, otherwise select prompt
            const currentSelection = folderSelect.value || '';
            if (!folderSelect.querySelector(`option[value="${currentSelection}"]`)) {
                folderSelect.value = ''; // Reset to prompt if selection disappeared
            }

            folderSelect.disabled = false;
            updateUploadButtonState();

        } catch (error) {
            console.error('Error fetching folders:', error);
            folderSelect.innerHTML = '<option value="" disabled selected>Error loading</option>';
            showStatus('Could not load folders. Please try refreshing.', true);
        }
    }

    async function createFolder() {
        const folderName = newFolderInput.value.trim();
        if (!folderName) {
            showStatus('Please enter a name for the new folder.', true);
            return;
        }

        createFolderBtn.disabled = true;
        createFolderBtn.textContent = 'Creating...';

        try {
            const response = await fetch(`${API_BASE_URL}/folders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ folderName }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || `Failed to create folder (status: ${response.status})`);
            }

            showStatus(`Folder '${result.folderName}' created successfully!`);
            newFolderInput.value = ''; // Clear input
            await fetchFolders(); // Refresh list
             // Select the newly created folder
            folderSelect.value = result.folderName;
            updateUploadButtonState();


        } catch (error) {
            console.error('Error creating folder:', error);
            showStatus(`Error: ${error.message}`, true);
        } finally {
             createFolderBtn.disabled = false;
             createFolderBtn.textContent = 'Create';
        }
    }

    // --- File Selection and Preview ---
    function handleFileSelection(files) {
        selectedFiles = Array.from(files); // Convert FileList to Array
        renderFilePreview();
        updateUploadButtonState();
    }

    function renderFilePreview() {
        filePreview.innerHTML = ''; // Clear previous previews
        if (selectedFiles.length === 0) {
             filePreview.innerHTML = '<span style="color: #6c757d;">No files selected.</span>';
             return;
        }

        selectedFiles.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.classList.add('file-item');
            fileItem.innerHTML = `
                <span class="file-icon"></span>
                <span class="file-name" title="${file.name}">${file.name}</span>
                <span class="file-size">(${formatFileSize(file.size)})</span>
            `;
            filePreview.appendChild(fileItem);
        });
    }

    function updateUploadButtonState() {
        // Enable upload button only if a folder is selected AND files are selected
        const folderSelected = folderSelect.value && folderSelect.value !== '';
        const filesSelected = selectedFiles.length > 0;
        uploadBtn.disabled = !(folderSelected && filesSelected);
    }


    // --- File Upload ---
    function uploadFiles() {
        const selectedFolder = folderSelect.value;
        if (!selectedFolder) {
            showStatus('Please select a target folder.', true);
            return;
        }
        if (selectedFiles.length === 0) {
            showStatus('Please select files to upload.', true);
            return;
        }

        uploadBtn.disabled = true;
        uploadBtn.textContent = 'Uploading...';
        progressContainer.style.display = 'block';
        progressBar.style.width = '0%';
        progressBar.textContent = '0%';

        const formData = new FormData();
        formData.append('folder', selectedFolder); // Add folder name
        selectedFiles.forEach(file => {
            formData.append('files', file); // Use 'files' as the key (matches server)
        });

        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
                const percentComplete = Math.round((event.loaded / event.total) * 100);
                progressBar.style.width = `${percentComplete}%`;
                progressBar.textContent = `${percentComplete}%`;
            }
        });

        xhr.addEventListener('load', () => {
            progressBar.style.width = '100%';
            progressBar.textContent = '100%';

            try {
                 const response = JSON.parse(xhr.responseText);

                 if (xhr.status >= 200 && xhr.status < 300 && response.success) {
                    showStatus(response.message || 'Files uploaded successfully!');
                    addUploadsToHistory(response.uploadedFiles);
                    // Reset after successful upload
                    selectedFiles = [];
                    fileInput.value = ''; // Clear the file input visually
                    renderFilePreview();

                 } else {
                    throw new Error(response.message || `Upload failed with status ${xhr.status}`);
                 }
            } catch (e) {
                console.error("Error processing upload response:", e);
                 console.error("Raw response:", xhr.responseText);
                showStatus(`Upload failed: ${e.message || 'Server error processing response.'}`, true);
                 progressBar.style.backgroundColor = 'var(--danger-color)'; // Indicate error
            } finally {
                 // Reset UI elements whether success or failure
                 uploadBtn.disabled = false;
                 uploadBtn.textContent = 'Upload Selected Files';
                 updateUploadButtonState(); // Re-evaluate button state
                 // Optionally hide progress bar after a delay
                 setTimeout(() => {
                    progressContainer.style.display = 'none';
                     progressBar.style.backgroundColor = 'var(--accent-color)'; // Reset color
                 }, 2000);
            }
        });

        xhr.addEventListener('error', () => {
            console.error('Upload failed (network error).');
            showStatus('Upload failed due to a network error. Please try again.', true);
            uploadBtn.disabled = false;
            uploadBtn.textContent = 'Upload Selected Files';
            progressContainer.style.display = 'none';
            progressBar.style.backgroundColor = 'var(--danger-color)';
            updateUploadButtonState();
        });

        xhr.open('POST', `${API_BASE_URL}/upload`);
        // Note: No 'Content-Type' header needed for FormData with XHR, browser sets it
        xhr.send(formData);
    }

    // --- Upload History ---
    function addUploadsToHistory(uploadedFiles) {
        if (!uploadedFiles || uploadedFiles.length === 0) return;

        // Remove the initial "No uploads yet" message if it exists
        const initialMsgRow = uploadTableBody.querySelector('td[colspan="4"]');
        if (initialMsgRow) {
            uploadTableBody.innerHTML = ''; // Clear the table body
        }

        uploadedFiles.forEach(file => {
            const row = uploadTableBody.insertRow(0); // Insert at the top
            row.innerHTML = `
                <td>${file.originalName}</td>
                <td>${file.folder}</td>
                <td>${formatFileSize(file.size)}</td>
                <td>${new Date().toLocaleString()}</td>
            `;
        });
         // Optional: Limit history length (e.g., keep last 10)
        const maxHistory = 10;
        while (uploadTableBody.rows.length > maxHistory) {
             uploadTableBody.deleteRow(uploadTableBody.rows.length - 1);
        }
    }


    // --- Event Listeners ---
    refreshFoldersBtn.addEventListener('click', fetchFolders);
    createFolderBtn.addEventListener('click', createFolder);
    newFolderInput.addEventListener('keypress', (e) => { // Allow creating with Enter key
        if (e.key === 'Enter') {
            createFolder();
        }
    });

    // File input change event
    fileInput.addEventListener('change', (e) => {
        handleFileSelection(e.target.files);
    });

    // Drag and Drop events
    fileDropzone.addEventListener('dragover', (e) => {
        e.preventDefault(); // Prevent default browser behavior
        fileDropzone.classList.add('dragover');
    });
    fileDropzone.addEventListener('dragleave', () => {
        fileDropzone.classList.remove('dragover');
    });
    fileDropzone.addEventListener('drop', (e) => {
        e.preventDefault(); // Prevent default browser behavior
        fileDropzone.classList.remove('dragover');
        const files = e.dataTransfer.files; // Get files from the drop event
        if (files.length > 0) {
             fileInput.files = files; // Assign dropped files to the hidden input
             handleFileSelection(files);
        }
    });

    // Folder selection change
    folderSelect.addEventListener('change', updateUploadButtonState);

    // Upload button click
    uploadBtn.addEventListener('click', uploadFiles);


    // --- Initial Load ---
    fetchFolders(); // Load folders when the page loads
    renderFilePreview(); // Show initial "No files" message

});