import * as vscode from "vscode";
import * as child_process from "child_process";

const startServer = () => {
  if (!vscode.workspace.workspaceFolders) {
    return;
  }

  const rootFolder = vscode.workspace.workspaceFolders[0].uri.fsPath;
  const panel = vscode.window.createWebviewPanel(
    "vitePreview",
    "Vite Project Preview",
    vscode.ViewColumn.Beside,
    { enableScripts: true }
  );

  console.log("ok");
  const viteProcess = child_process.spawn(
    "C:\\Program Files\\nodejs\\npm.exe",
    ["run", "dev"],
    {
      cwd: rootFolder,
    }
  );

  viteProcess.on("error", (err) => {
    console.error("Failed to start Vite process:", err);
  });

  viteProcess.stdout.on("data", (data) => {
    console.log(data.toString());
  });

  panel.webview.html = `<h1>Hello</h1>`;
  // panel.onDidDispose(() => viteProcess.kill(), null);
};

function getWebviewContent(viteUrl: string): string {
  return `
        <!DOCTYPE html>
        <html lang="en">
        <body style="margin:0; padding:0; overflow:hidden;">
            <h1>hello</h1>
        </body>
        </html>`;
}

export { startServer };
