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
const getCurrentFileContent = () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return null;
    }
    const document = editor.document;
    const content = document.getText();
    return content;
};
const getCurrentFileName = () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return null;
    }
    const name = editor.document.fileName;
    return name;
};
const checkIfReactFile = (content, filename) => {
    if (!filename.endsWith(".jsx"))
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
function activate(context) {
    console.log('Congratulations, your extension "r3nd3r" is now active!');
    // The commandId parameter must match the command field in package.json
    const helloWOrldDisposable = vscode.commands.registerCommand("r3nd3r.helloWorld", () => {
        vscode.window.showInformationMessage("Hello World from R3ND3R!");
    });
    const renderDisposable = vscode.commands.registerCommand("r3nd3r.render", () => {
        const filename = getCurrentFileName();
        const content = getCurrentFileContent();
        if (!filename || !content || !checkIfReactFile(content, filename)) {
            vscode.window.showErrorMessage("Current file is not a react file. Please run the extensioin in a react component.");
            return;
        }
        vscode.window.showInformationMessage("Rendering current component!");
        console.log(getCurrentFileContent());
    });
    context.subscriptions.push(helloWOrldDisposable);
}
// This method is called when your extension is deactivated
function deactivate() { }


/***/ }),
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

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