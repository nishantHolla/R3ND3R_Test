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
const server_1 = __webpack_require__(3);
const parser_1 = __webpack_require__(4);
function activate(context) {
    console.log('Congratulations, your extension "r3nd3r" is now active!');
    // The commandId parameter must match the command field in package.json
    const helloWOrldDisposable = vscode.commands.registerCommand("r3nd3r.helloWorld", () => {
        vscode.window.showInformationMessage("Hello World from R3ND3R!");
    });
    const renderDisposable = vscode.commands.registerCommand("r3nd3r.render", () => {
        const filename = (0, parser_1.getCurrentFileName)();
        const content = (0, parser_1.getCurrentFileContent)();
        if (!filename || !content || !(0, parser_1.checkIfReactFile)(content, filename)) {
            vscode.window.showErrorMessage("Current file is not a react file. Please run the extensioin in a react component.");
            return;
        }
        (0, server_1.startServer)();
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
/***/ ((module) => {

module.exports = require("child_process");

/***/ }),
/* 3 */
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
const child_process = __importStar(__webpack_require__(2));
const startServer = () => {
    if (!vscode.workspace.workspaceFolders) {
        return;
    }
    const rootFolder = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const panel = vscode.window.createWebviewPanel("vitePreview", "Vite Project Preview", vscode.ViewColumn.Beside, { enableScripts: true });
    console.log("ok");
    const viteProcess = child_process.spawn("C:\\Program Files\\nodejs\\npm.exe", ["run", "dev"], {
        cwd: rootFolder,
    });
    viteProcess.on("error", (err) => {
        console.error("Failed to start Vite process:", err);
    });
    viteProcess.stdout.on("data", (data) => {
        console.log(data.toString());
    });
    panel.webview.html = `<h1>Hello</h1>`;
    // panel.onDidDispose(() => viteProcess.kill(), null);
};
exports.startServer = startServer;
function getWebviewContent(viteUrl) {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <body style="margin:0; padding:0; overflow:hidden;">
            <h1>hello</h1>
        </body>
        </html>`;
}


/***/ }),
/* 4 */
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