/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(__webpack_require__(1));
const server_1 = __webpack_require__(2);
const setup_1 = __webpack_require__(6);
const parser_1 = __webpack_require__(5);
function activate(context) {
    console.log('Congratulations, your extension "r3nd3r" is now active!');
    // The commandId parameter must match the command field in package.json
    const helloWOrldDisposable = vscode.commands.registerCommand("r3nd3r.helloWorld", () => {
        vscode.window.showInformationMessage("Hello World from R3ND3R!");
    });
    const renderDisposable = vscode.commands.registerCommand("r3nd3r.render", () => {
        if (!vscode.workspace.workspaceFolders) {
            vscode.window.showErrorMessage("No workspace detected");
            return;
        }
        const filename = (0, parser_1.getCurrentFileName)();
        const content = (0, parser_1.getCurrentFileContent)();
        const rootFolder = vscode.workspace.workspaceFolders[0].uri.fsPath;
        if (!filename || !content || !(0, parser_1.checkIfReactFile)(content, filename)) {
            vscode.window.showErrorMessage("Current file is not a react file. Please run the extensioin in a react component.");
            return;
        }
        (0, setup_1.setup)(rootFolder);
        (0, server_1.startServer)(rootFolder);
        vscode.window.showInformationMessage("Rendering current component!");
    });
    context.subscriptions.push(helloWOrldDisposable);
}
// This method is called when your extension is deactivated
function deactivate() { }


/***/ }),
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.startServer = void 0;
const vscode = __importStar(__webpack_require__(1));
const child_process = __importStar(__webpack_require__(3));
const os = __importStar(__webpack_require__(4));
function detectNpxPath() {
    return new Promise((resolve, reject) => {
        const command = os.platform() === "win32" ? "where" : "which";
        child_process.exec(`${command} npx`, (error, stdout) => {
            if (error) {
                vscode.window.showErrorMessage("Unable to find npx. Please ensure it is installed.");
                reject(new Error("npx not found in PATH"));
            }
            else {
                const npxPath = stdout.trim().split("\n")[0]; // Use the first path found
                resolve(npxPath);
            }
        });
    });
}
const startServer = async (rootFolder) => {
    if (!vscode.workspace.workspaceFolders) {
        vscode.window.showErrorMessage("No workspace folder open.");
        return;
    }
    try {
        const npxPath = await detectNpxPath();
        console.log(`Using npx from: ${npxPath}`);
        const panel = vscode.window.createWebviewPanel("vitePreview", "Vite Project Preview", vscode.ViewColumn.Beside, { enableScripts: true });
        const viteProcess = child_process.spawn(npxPath, ["vite", "--config", "r3nd3rExtension/vite.config.js"], {
            cwd: rootFolder,
            shell: os.platform() !== "win32",
            env: process.env,
        });
        viteProcess.on("error", (err) => {
            if (err instanceof Error) {
                vscode.window.showErrorMessage(`Failed to start Vite process: ${err.message}`);
                console.error("Failed to start Vite process:", err);
            }
            else {
                console.error("An unknown error occurred:", err);
            }
        });
        viteProcess.stdout.on("data", (data) => {
            const output = data.toString();
            const match = output.match(/localhost:\d+/);
            if (match) {
                const viteUrl = `http://${match[0]}`;
                panel.webview.html = getWebviewContent(viteUrl);
            }
        });
        panel.onDidDispose(() => viteProcess.kill(), null); // Kill the process on panel dispose
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error: ${error.message}`);
        }
        else {
            console.error("An unknown error occurred:", error);
        }
    }
};
exports.startServer = startServer;
function getWebviewContent(viteUrl) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <body style="margin:0; padding:0; overflow:hidden;">
      <iframe src="${viteUrl}" frameborder="0" style="width:100%; height:100vh;"></iframe>
    </body>
    </html>`;
}


/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("child_process");

/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("os");

/***/ }),
/* 5 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.checkIfReactFile = exports.getCurrentFileName = exports.getCurrentFileContent = void 0;
const vscode = __importStar(__webpack_require__(1));
const getCurrentFileContent = () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return null;
    }
    const document = editor.document;
    const content = document.getText();
    return content;
};
exports.getCurrentFileContent = getCurrentFileContent;
const getCurrentFileName = () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return null;
    }
    const name = editor.document.fileName;
    return name;
};
exports.getCurrentFileName = getCurrentFileName;
const checkIfReactFile = (content, filename) => {
    if (!filename.endsWith(".jsx") && !filename.endsWith(".tsx"))
        return false;
    const hasReactImport = /import\s+React\b|from\s+['"]react['"]/g.test(content);
    const hasFunctionComponent = /function\s+\w+\s*\([^)]*\)\s*{[^}]*return\s*<[^>]+>/g.test(content);
    const hasArrowFunctionComponent = /const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*{[^}]*return\s*<[^>]+>/g.test(content);
    const hasClassComponent = /class\s+\w+\s+extends\s+React\.Component/g.test(content);
    return (hasReactImport ||
        hasFunctionComponent ||
        hasArrowFunctionComponent ||
        hasClassComponent);
};
exports.checkIfReactFile = checkIfReactFile;


/***/ }),
/* 6 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.setup = setup;
const fs = __importStar(__webpack_require__(7));
const path = __importStar(__webpack_require__(8));
/**
 * Clears the folder if it exists, otherwise creates a new folder.
 */
function setup(rootFolder) {
    const extensionFolderPath = path.join(rootFolder, "r3nd3rExtension");
    const srcFolderPath = path.join(rootFolder, "src"); // Original src folder path
    const publicFolderPath = path.join(rootFolder, "public"); // Original public folder path
    const indexFilePath = path.join(rootFolder, "index.html"); // Original index.html file path
    if (fs.existsSync(extensionFolderPath)) {
        console.log("r3nd3rExtension folder exists. Clearing it...");
        clearFolder(extensionFolderPath); // Clear the folder contents
    }
    else {
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
function clearFolder(folderPath) {
    const files = fs.readdirSync(folderPath);
    for (const file of files) {
        const filePath = path.join(folderPath, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            // If it's a folder, recursively remove its contents
            clearFolder(filePath);
            fs.rmdirSync(filePath); // Remove the empty folder
        }
        else {
            // If it's a file, remove it
            fs.unlinkSync(filePath);
        }
    }
}
/**
 * Copies the contents of one folder to another.
 */
function copyFolderContents(src, dest) {
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
        }
        else {
            // Copy files
            fs.copyFileSync(srcPath, destPath);
        }
    }
}
/**
 * Creates a `vite.config.js` file with predefined content.
 */
function createViteConfig(folderPath) {
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


/***/ }),
/* 7 */
/***/ ((module) => {

module.exports = require("fs");

/***/ }),
/* 8 */
/***/ ((module) => {

module.exports = require("path");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=extension.js.map