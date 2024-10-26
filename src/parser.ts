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

// const checkIfReactFile = (content: string, filename: string) => {
//   if (!filename.endsWith(".jsx") && !filename.endsWith(".tsx")) return false;

//   const hasReactImport = /import\s+React\b|from\s+['"]react['"]/g.test(content);
//   const hasFunctionComponent =
//     /function\s+\w+\s*\([^)]*\)\s*{[^}]*return\s*<[^>]+>/g.test(content);
//   const hasArrowFunctionComponent =
//     /const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*{[^}]*return\s*<[^>]+>/g.test(content);
//   const hasClassComponent = /class\s+\w+\s+extends\s+React\.Component/g.test(
//     content
//   );

//   return (
//     hasReactImport ||
//     hasFunctionComponent ||
//     hasArrowFunctionComponent ||
//     hasClassComponent
//   );
// };

/**
 * Checks if the given content is a valid React component.
 * @param content - The content of the file as a string.
 * @param filename - The name of the file.
 * @returns True if it's a React component, otherwise false.
 */
function checkIfReactFile(content: string, filename: string): boolean {
  // Quick filename check to ensure it's a JSX/TSX file
  if (!filename.endsWith(".jsx") && !filename.endsWith(".tsx")) {
    return false;
  }

  return true;

  // try {
  //   // Parse the content into an AST
  //   const ast = parse(content, {
  //     sourceType: "module",
  //     plugins: ["jsx", "typescript"], // For JSX/TSX support
  //   });

  //   let isReactComponent = false;

  //   // Traverse the AST to look for React-related elements
  //   traverse(ast, {
  //     ImportDeclaration(path) {
  //       // Check if React or react-related components are imported
  //       if (
  //         path.node.source.value === "react" ||
  //         path.node.source.value.startsWith("./")
  //       ) {
  //         isReactComponent = true;
  //         path.stop(); // Stop once confirmed
  //       }
  //     },
  //     JSXElement() {
  //       // JSX syntax detected, assume it's a React file
  //       isReactComponent = true;
  //     },
  //   });

  //   return isReactComponent;
  // } catch (error) {
  //   console.error("Error parsing content:", error);
  //   return false;
  // }
}

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
