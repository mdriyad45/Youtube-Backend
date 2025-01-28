import fs from "fs";
import path from "path";

// Directory path where files will be deleted
const directoryPath = '../../public/temp'; // Replace with your folder path

// Function to delete all files in the folder after a timeout
export function deleteFilesAfterTimeout(timeout) {
  // Set timeout for deletion
  setTimeout(() => {
    // Read all files in the directory
    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        console.error('Error reading directory:', err);
        return;
      }

      // Loop through all files in the directory
      files.forEach((file) => {
        const filePath = path.join(directoryPath, file);
        
        // Delete each file
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error('Error deleting file:', file, err);
          } else {
            console.log('Deleted file:', file);
          }
        });
      });
    });
  }, timeout);
}

// Call the function with a 5-second timeout (5000 milliseconds)

