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

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "r3nd3r" is now active!');

  // The commandId parameter must match the command field in package.json
  const helloWOrldDisposable = vscode.commands.registerCommand(
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
      }
    }
  });

  const renderDisposable = vscode.commands.registerCommand(
    "r3nd3r.render",
    () => {
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
      const currentComponet = components[0];
      const r3nd3rComponentFilePath = currentFilePath.replace(
        "/src",
        "/r3nd3rExtension/src"
      );

      console.log(components);
      vscode.window.showInformationMessage(
        `${currentComponet} ${currentFilePath}`
      );
      setup(rootFolder, currentComponet, r3nd3rComponentFilePath);
      startServer(rootFolder);
      vscode.window.showInformationMessage("Rendering current component!");
    }
  );

  context.subscriptions.push(helloWOrldDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
