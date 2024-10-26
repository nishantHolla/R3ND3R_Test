import * as vscode from "vscode";
import { startServer } from "./server";
import { setup } from "./setup";
import {
  getCurrentFileContent,
  getCurrentFileName,
  checkIfReactFile,
  getComponents,
} from "./parser";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "r3nd3r" is now active!');

  // The commandId parameter must match the command field in package.json
  const helloWOrldDisposable = vscode.commands.registerCommand(
    "r3nd3r.helloWorld",
    () => {
      vscode.window.showInformationMessage("Hello World from R3ND3R!");
    }
  );

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

      if (!filename || !content || !checkIfReactFile(content, filename)) {
        vscode.window.showErrorMessage(
          "Current file is not a react file. Please run the extensioin in a react component."
        );
        return;
      }

      vscode.window.showInformationMessage(getComponents(content).join(" "));

      setup(rootFolder);
      startServer(rootFolder);
      vscode.window.showInformationMessage("Rendering current component!");
    }
  );

  context.subscriptions.push(helloWOrldDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
