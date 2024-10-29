import * as fs from "fs";
import * as path from "path";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import generate from "@babel/generator";
import * as t from "@babel/types";

/**
 * Clears the folder if it exists, otherwise creates a new folder.
 */
function setup(
  rootFolder: string,
  componentName: string,
  componentPath: string,
  content: string
) {
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

  const mainTsxPath = path.join(
    rootFolder,
    "r3nd3rExtension",
    "src",
    "main.tsx"
  );

  let importStatement = `import {${componentName}} from "${componentPath}"`;
  if (content.includes("export default")) {
    importStatement = `import ${componentName} from "${componentPath}"`;
  }

  insertImportIfMissing(mainTsxPath, importStatement, componentName);

  replaceAppComponent(mainTsxPath, componentName);
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

/**
 * Inserts a new import statement at the start of the given file if it doesn't already exist.
 * @param filePath - The path to the main.tsx file.
 * @param importLine - The import line to add, e.g., `import { MyComponent } from "./MyComponent"`.
 */
function insertImportIfMissing(
  filePath: string,
  importLine: string,
  componentName: string
): void {
  try {
    // Read the content of the file
    const content = fs.readFileSync(filePath, "utf8");

    // Parse the file content into an AST
    const ast = parse(content, {
      sourceType: "module",
      plugins: ["jsx", "typescript"], // Support for TSX and JSX
    });

    let importExists = false;

    // Traverse the AST to find all import declarations
    traverse(ast, {
      ImportDeclaration(path) {
        const importedNames = path.node.specifiers.map(
          (specifier) => specifier.local.name
        );
        if (importedNames.includes(componentName)) {
          importExists = true;
          path.stop(); // Stop traversal once found
        }
      },
    });

    if (importExists) {
      console.log(`Import for ${componentName} already exists.`);
      return;
    }

    // If import doesn't exist, add it at the beginning
    const newContent = `${importLine}\n${content}`;

    // Write the updated content back to the file
    fs.writeFileSync(filePath, newContent, "utf8");

    console.log(`Inserted import: ${importLine}`);
  } catch (error: any) {
    console.error(`Failed to insert import: ${error.message}`);
  }
}

/**
 * Extracts the component name from an import line.
 * @param importLine - The import line string.
 * @returns The component name.
 */
function extractComponentName(importLine: string): string {
  const match = importLine.match(/\{(.+)\}/);
  return match ? match[1].trim() : "";
}

/**
 * Replaces <App /> in the main.tsx file with the given component.
 * @param filePath - The path to the main.tsx file.
 * @param newComponentName - The name of the new component to replace <App /> with.
 */
function replaceAppComponent(filePath: string, newComponentName: string): void {
  if (newComponentName === "App") return;
  try {
    // Read the content of the file
    const content = fs.readFileSync(filePath, "utf8");

    // Parse the content into an AST
    const ast = parse(content, {
      sourceType: "module",
      plugins: ["jsx", "typescript"], // Support for JSX and TSX
    });

    // Traverse the AST to find <App /> and replace it with <newComponentName />
    traverse(ast, {
      JSXElement(path) {
        const openingElement = path.node.openingElement;

        // Check if the JSX element is <App />
        if (
          t.isJSXIdentifier(openingElement.name) &&
          openingElement.name.name === "App"
        ) {
          console.log("<App /> component found. Replacing...");

          // Replace <App /> with <newComponentName />
          path.replaceWith(
            t.jsxElement(
              t.jsxOpeningElement(t.jsxIdentifier(newComponentName), []),
              t.jsxClosingElement(t.jsxIdentifier(newComponentName)),
              [], // No children inside the component tag
              false
            )
          );
        }
      },
    });

    // Generate the updated code from the modified AST
    const { code: updatedCode } = generate(ast);

    // Write the updated code back to the file
    fs.writeFileSync(filePath, updatedCode, "utf8");

    console.log(`<App /> replaced with <${newComponentName} /> in ${filePath}`);
  } catch (error: any) {
    console.error(`Failed to replace component: ${error.message}`);
  }
}

export { setup };
