import * as vscode from "vscode";
import * as babelParser from "@babel/parser";
import { startServer } from "./server";
import { setup } from "./setup";
import {
  getCurrentFileContent,
  getCurrentFileName,
  checkIfReactFile,
  getComponents,
} from "./parser";
import fs from "fs";
import postcss from "postcss";
import safeParser from "postcss-safe-parser";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "r3nd3r" is now active!');

  const helloWorldDisposable = vscode.commands.registerCommand(
    "r3nd3r.helloWorld",
    () => {
      vscode.window.showInformationMessage("Hello World from R3ND3R!");
    }
  );

  vscode.workspace.onDidChangeTextDocument((event) => {
    const activeEditor = vscode.window.activeTextEditor;

    // Check if the document that changed is the active one
    if (activeEditor && event.document === activeEditor.document) {
      const text = activeEditor.document.getText();
      const documentPath = activeEditor.document.uri.fsPath.replace(
        "/src",
        "/r3nd3rExtension/src"
      );

      if (isCSSDocument(activeEditor.document)) {
        try {
          // Parse the CSS using PostCSS's safe parser
          postcss()
            .process(text, { parser: safeParser })
            .then((result) => {
              console.log("Valid CSS syntax.");
              fs.writeFileSync(documentPath, text, "utf-8");
            })
            .catch((error) => {
              console.log("Invalid CSS syntax:", error.message);
              vscode.window.showErrorMessage(
                `CSS syntax error ${error.message}`
              );
            });
        } catch (error: any) {
          console.log("Error parsing CSS:", error.message);
        }
      }

      if (
        isJSXDocument(activeEditor.document) ||
        isTSXDocument(activeEditor.document)
      ) {
        // Parse the text to check for valid JSX/TSX
        try {
          babelParser.parse(text, {
            sourceType: "module",
            plugins: ["jsx", "typescript"], // Include plugins for JSX and TSX
          });
          console.log("Valid JSX/TSX syntax.");
          fs.writeFileSync(documentPath, text, "utf-8");
        } catch (error: any) {
          console.log("Invalid JSX/TSX syntax:", error.message);
          vscode.window.showErrorMessage(`JS syntax error ${error.message}`);
        }
      }
    }
  });

  const renderDisposable = vscode.commands.registerCommand(
    "r3nd3r.render",
    async () => {
      if (!vscode.workspace.workspaceFolders) {
        vscode.window.showErrorMessage("No workspace detected");
        return;
      }

      const filename = getCurrentFileName();
      const content = getCurrentFileContent();
      const rootFolder = vscode.workspace.workspaceFolders[0].uri.fsPath;
      const currentFileUri = vscode.window.activeTextEditor?.document.uri;
      const currentFilePath = currentFileUri?.fsPath;

      if (!currentFilePath) {
        vscode.window.showErrorMessage("Could not find current file path.");
        return;
      }

      if (!filename || !content || !checkIfReactFile(content, filename)) {
        vscode.window.showErrorMessage(
          "Current file is not a react file. Please run the extension in a react component."
        );
        return;
      }

      const components = getComponents(content);
      const word = getWordUnderCursor();

      const currentComponent = components.includes(word || "")
        ? word
        : components[0];

      if (!components || !currentComponent) {
        vscode.window.showErrorMessage("Could not find a react component");
        return;
      }

      const r3nd3rComponentFilePath = currentFilePath.replace(
        "/src",
        "/r3nd3rExtension/src"
      );

      console.log("Word under cursor: ", getWordUnderCursor());
      // vscode.window.showInformationMessage(
      //   `${currentComponent} ${currentFilePath}`
      // );
      setup(rootFolder, currentComponent, r3nd3rComponentFilePath, content);
      startServer(rootFolder, currentComponent);
      vscode.window.showInformationMessage("Rendering current component!");

      // After running the tests, show results in a new window
      await showTestResults();
    }
  );

  context.subscriptions.push(helloWorldDisposable, renderDisposable);
}

async function showTestResults() {
  const testResults = await getTestResults(); // Replace with your actual method to get test results
  const panel = vscode.window.createWebviewPanel(
    "testResults", // Identifies the type of the webview. Used internally
    "Test Results", // Title of the panel displayed to the user
    vscode.ViewColumn.One, // Editor column to show the new webview panel in
    {} // Webview options
  );

  panel.webview.html = getWebviewContent(testResults);
}

function getWebviewContent(testResults: any) {
  // Generate HTML content to display test results
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Results</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; text-align: left; border: 1px solid #ccc; }
        th { background-color: #f4f4f4; }
        tr:nth-child(even) { background-color: #f9f9f9; }
    </style>
</head>
<body>
    <h1>Test Results</h1>
    <table>
        <tr>
            <th>Test Case</th>
            <th>Status</th>
        </tr>
        ${testResults
          .map(
            (result: any) => `
        <tr>
            <td>${result.testCase}</td>
            <td>${result.status}</td>
        </tr>`
          )
          .join("")}
    </table>
</body>
</html>`;
}

async function getTestResults() {
  // Here you should implement logic to read the Jest test results
  // This is a placeholder, replace with your actual logic to fetch results
  const results = [
    { testCase: "renders with text prop", status: "passed" },
    { testCase: "handles click events", status: "passed" },
    { testCase: "applies custom className", status: "passed" },
    { testCase: "renders with different text props", status: "passed" },
    { testCase: "maintains accessibility features", status: "passed" },
  ];
  return results;
}

function isCSSDocument(document: vscode.TextDocument): boolean {
  return document.languageId === "css" || document.fileName.endsWith(".css");
}

function isJSXDocument(document: vscode.TextDocument): boolean {
  return (
    document.languageId === "javascriptreact" ||
    document.fileName.endsWith(".jsx")
  );
}

function isTSXDocument(document: vscode.TextDocument): boolean {
  return (
    document.languageId === "typescriptreact" ||
    document.fileName.endsWith(".tsx")
  );
}

const getWordUnderCursor = () => {
  const activeEditor = vscode.window.activeTextEditor;

  if (!activeEditor) {
    return null;
  }

  const cursorPosition = activeEditor.selection.active; // Get cursor position
  const wordRange =
    activeEditor.document.getWordRangeAtPosition(cursorPosition); // Get word range

  if (wordRange) {
    const word = activeEditor.document.getText(wordRange); // Extract the word
    return word;
  } else {
    return null;
  }
};

// This method is called when your extension is deactivated
export function deactivate() {}
