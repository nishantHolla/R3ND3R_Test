import * as vscode from "vscode";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";

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

const getComponents = (code: string) => {
  const ast = parse(code, {
    sourceType: "module",
    plugins: ["typescript", "jsx"], // Enable TypeScript and JSX support
  });

  const components: string[] = [];

  traverse(ast, {
    FunctionDeclaration(path: any) {
      const { id } = path.node;
      if (id && path.node.body.body.length > 0) {
        components.push(id.name);
      }
    },
    ArrowFunctionExpression(path: any) {
      const { id } = path.parentPath.node;
      if (id && path.node.body.type === "JSXElement") {
        components.push(id.name);
      }
    },
    VariableDeclaration(path: any) {
      path.node.declarations.forEach((declaration: any) => {
        if (
          declaration.init &&
          declaration.init.type === "ArrowFunctionExpression"
        ) {
          components.push(declaration.id.name);
        }
      });
    },
  });

  return components;
};

export {
  getCurrentFileContent,
  getCurrentFileName,
  checkIfReactFile,
  getComponents,
};
