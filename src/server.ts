import * as vscode from "vscode";
import * as child_process from "child_process";
import * as os from "os";

// Helper function to detect the npm path across platforms
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
      shell: os.platform() !== "win32", // Use shell for Unix systems
      env: process.env, // Pass the environment variables
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

    viteProcess.stdout.on("data", (data) => {
      console.log(data.toString());
    });

    panel.webview.html = getWebviewContent();
    panel.onDidDispose(() => viteProcess.kill(), null); // Kill the process on panel dispose
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error("An unknown error occurred:", error);
    }
  }
};

function getWebviewContent(): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <body style="margin:0; padding:0; overflow:hidden;">
      <h1>Vite Project Preview</h1>
    </body>
    </html>`;
}

export { startServer };

/*
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
    "/opt/homebrew/bin/npm",
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
*/
