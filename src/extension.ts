import * as vscode from "vscode";

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

const checkIfReactFile = (content: string, filename: string) => {
  if (!filename.endsWith(".jsx")) return false;

  const hasReactImport = /import\s+React\b|from\s+['"]react['"]/g.test(content);
  const hasFunctionComponent =
    /function\s+\w+\s*\([^)]*\)\s*{[^}]*return\s*<[^>]+>/g.test(content);
  const hasArrowFunctionComponent =
    /const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*{[^}]*return\s*<[^>]+>/g.test(content);
  const hasClassComponent = /class\s+\w+\s+extends\s+React\.Component/g.test(
    content
  );

  return (
    hasReactImport ||
    hasFunctionComponent ||
    hasArrowFunctionComponent ||
    hasClassComponent
  );
};

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
      const filename = getCurrentFileName();
      const content = getCurrentFileContent();

      if (!filename || !content || !checkIfReactFile(content, filename)) {
        vscode.window.showErrorMessage(
          "Current file is not a react file. Please run the extensioin in a react component."
        );
        return;
      }

      vscode.window.showInformationMessage("Rendering current component!");
      console.log(getCurrentFileContent());
    }
  );

  context.subscriptions.push(helloWOrldDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
