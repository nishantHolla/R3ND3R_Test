import * as fs from "fs";
import * as path from "path";

/**
 * Clears the folder if it exists, otherwise creates a new folder.
 */
function setup(rootFolder: string) {
  const extensionFolderPath = path.join(rootFolder, "r3nd3rExtension");
  const srcFolderPath = path.join(rootFolder, "src"); // Original src folder path
  const publicFolderPath = path.join(rootFolder, "public"); // Original public folder path
  const indexFilePath = path.join(rootFolder, "index.html"); // Original index.html file path

  if (fs.existsSync(extensionFolderPath)) {
    console.log("r3nd3rExtension folder exists. Clearing it...");
    clearFolder(extensionFolderPath); // Clear the folder contents
  } else {
    console.log("r3nd3rExtension folder does not exist. Creating it...");
    fs.mkdirSync(extensionFolderPath);
  }

  // Create the src folder inside r3nd3rExtension
  const newSrcFolderPath = path.join(extensionFolderPath, "src");
  fs.mkdirSync(newSrcFolderPath);

  // Copy the contents of the original src folder into the new src folder
  copyFolderContents(srcFolderPath, newSrcFolderPath);

  // Copy the contents of the original public folder into the new public folder
  const newPublicFolderPath = path.join(extensionFolderPath, "public");
  copyFolderContents(publicFolderPath, newPublicFolderPath);

  // Create the Vite config file
  createViteConfig(extensionFolderPath);

  // Copy the index.html file from root to r3nd3rExtension
  const newIndexHTMLPath = path.join(extensionFolderPath, "index.html");
  fs.copyFileSync(indexFilePath, newIndexHTMLPath);
}

/**
 * Recursively clears the contents of a folder.
 */
function clearFolder(folderPath: string) {
  const files = fs.readdirSync(folderPath);

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // If it's a folder, recursively remove its contents
      clearFolder(filePath);
      fs.rmdirSync(filePath); // Remove the empty folder
    } else {
      // If it's a file, remove it
      fs.unlinkSync(filePath);
    }
  }
}

/**
 * Copies the contents of one folder to another.
 */
function copyFolderContents(src: string, dest: string) {
  // Create the destination folder if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest);
  }

  const items = fs.readdirSync(src);

  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      // Recursively copy directories
      copyFolderContents(srcPath, destPath);
    } else {
      // Copy files
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Creates a `vite.config.js` file with predefined content.
 */
function createViteConfig(folderPath: string) {
  const viteConfigContent = `
    import { defineConfig } from 'vite'
    import react from '@vitejs/plugin-react'
    
    // https://vite.dev/config/
    export default defineConfig({
      plugins: [react()],
      root: './r3nd3rExtension', // Specify root for Vite
      build: {
        outDir: 'dist', // Output directory for builds
      },
      server: {
        port: 3000 // Specify server port
      }
    })
    `.trim();

  const viteConfigPath = path.join(folderPath, "vite.config.js");

  // Write the content to the Vite config file
  fs.writeFileSync(viteConfigPath, viteConfigContent);

  console.log("Vite config file created at:", viteConfigPath);
}

export { setup };
