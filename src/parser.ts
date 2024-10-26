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
  if (!filename.endsWith(".jsx") && !filename.endsWith(".tsx")) return false;

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

export { getCurrentFileContent, getCurrentFileName, checkIfReactFile };
