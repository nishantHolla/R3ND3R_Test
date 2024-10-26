import * as vscode from "vscode";
import * as child_process from "child_process";
import * as os from "os";

function detectNpxPath(): Promise<string> {
  return new Promise((resolve, reject) => {
    const command = os.platform() === "win32" ? "where" : "which";

    child_process.exec(`${command} npx`, (error, stdout) => {
      if (error) {
        vscode.window.showErrorMessage(
          "Unable to find npx. Please ensure it is installed."
        );
        reject(new Error("npx not found in PATH"));
      } else {
        const npxPath = stdout.trim().split("\n")[0]; // Use the first path found
        resolve(npxPath);
      }
    });
  });
}

const startServer = async (rootFolder: string) => {
  if (!vscode.workspace.workspaceFolders) {
    vscode.window.showErrorMessage("No workspace folder open.");
    return;
  }

  try {
    const npxPath = await detectNpxPath();
    console.log(`Using npx from: ${npxPath}`);

    const panel = vscode.window.createWebviewPanel(
      "vitePreview",
      "Vite Project Preview",
      vscode.ViewColumn.Beside,
      { enableScripts: true }
    );

    const viteProcess = child_process.spawn(
      npxPath,
      ["vite", "--config", "r3nd3rExtension/vite.config.js"],
      {
        cwd: rootFolder,
        shell: os.platform() !== "win32",
        env: process.env,
      }
    );

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

    viteProcess.stdout.on("data", (data) => {
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
