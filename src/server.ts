import * as vscode from "vscode";
import * as child_process from "child_process";
import * as os from "os";

function detectNpmPath(): Promise<string> {
  return new Promise((resolve, reject) => {
    const command = os.platform() === "win32" ? "where" : "which";

    child_process.exec(`${command} npm`, (error, stdout) => {
      if (error) {
        vscode.window.showErrorMessage(
          "Unable to find npm. Please ensure it is installed."
        );
        reject(new Error("npm not found in PATH"));
      } else {
        const npmPath = stdout.trim().split("\n")[0]; // Use the first path found
        resolve(npmPath);
      }
    });
  });
}

const startServer = async () => {
  if (!vscode.workspace.workspaceFolders) {
    vscode.window.showErrorMessage("No workspace folder open.");
    return;
  }

  const rootFolder = vscode.workspace.workspaceFolders[0].uri.fsPath;

  try {
    const npmPath = await detectNpmPath();
    console.log(`Using npm from: ${npmPath}`);

    const panel = vscode.window.createWebviewPanel(
      "vitePreview",
      "Vite Project Preview",
      vscode.ViewColumn.Beside,
      { enableScripts: true }
    );

    const viteProcess = child_process.spawn(npmPath, ["run", "dev"], {
      cwd: rootFolder,
      shell: os.platform() !== "win32",
      env: process.env,
    });

    viteProcess.on("error", (err: unknown) => {
      if (err instanceof Error) {
        vscode.window.showErrorMessage(
          `Failed to start Vite process: ${err.message}`
        );
        console.error("Failed to start Vite process:", err);
      } else {
        console.error("An unknown error occurred:", err);
      }
    });

    viteProcess.stdout.on('data', (data) => {
      const output = data.toString();
      const match = output.match(/localhost:\d+/);
      
      if (match) {
        const viteUrl = `http://${match[0]}`;
        panel.webview.html = getWebviewContent(viteUrl);
      }
    });

    panel.onDidDispose(() => viteProcess.kill(), null); // Kill the process on panel dispose
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error("An unknown error occurred:", error);
    }
  }
};

function getWebviewContent(viteUrl: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <body style="margin:0; padding:0; overflow:hidden;">
      <iframe src="${viteUrl}" frameborder="0" style="width:100%; height:100vh;"></iframe>
    </body>
    </html>`;
}

export { startServer };

