import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "r3nd3r" is now active!');

	// Register the command for opening the Webview panel
	const disposable = vscode.commands.registerCommand('r3nd3r.openVisualizer', () => {
		const panel = vscode.window.createWebviewPanel(
			'codeVisualizer',
			'Code Visualizer',
			vscode.ViewColumn.Beside,
			{
				enableScripts: true,
				localResourceRoots: [vscode.Uri.file(context.extensionPath)]
			}
		);

		// Get the active editor's file path
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active .jsx file to preview.');
			return;
		}

		const filePath = editor.document.fileName;
		if (!filePath.endsWith('.jsx')) {
			vscode.window.showErrorMessage('Please open a .jsx file to preview.');
			return;
		}

		// Set initial HTML content for the webview
		panel.webview.html = getWebviewContent();

		// Function to load the component file and update the webview
		const loadAndRenderComponent = () => {
			fs.readFile(filePath, 'utf8', (err, data) => {
				if (err) {
					console.error(err);
					return;
				}
				// Post the content to the webview
				panel.webview.postMessage({ type: 'render', code: data });
			});
		};

		// Initial load and render of the component
		loadAndRenderComponent();

		// Watch for file changes and reload the component in real-time
		const fileWatcher = vscode.workspace.createFileSystemWatcher(filePath);
		fileWatcher.onDidChange(loadAndRenderComponent);
		fileWatcher.onDidDelete(() => panel.dispose());

		panel.onDidDispose(() => {
			fileWatcher.dispose();
		});

		// Handle messages from the webview
		panel.webview.onDidReceiveMessage(message => {
			if (message.type === 'refresh') {
				loadAndRenderComponent();
			}
		});
	});

	context.subscriptions.push(disposable);
}

// Function to generate HTML content for the Webview
function getWebviewContent() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Code Visualizer</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          color: white;
          background-color: #1e1e1e;
          padding: 10px;
        }
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
        }
        .title {
          font-size: 24px;
          margin-bottom: 20px;
        }
        #renderArea {
          width: 100%;
          height: 80%;
          border: 1px solid #555;
          padding: 20px;
          overflow: auto;
        }
      </style>
      <script src="https://unpkg.com/react@17/umd/react.development.js"></script>
      <script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
      <script src="https://unpkg.com/babel-standalone@6.26.0/babel.min.js"></script>
    </head>
    <body>
      <div class="container">
        <div class="title">Code Visualizer</div>
        <div id="renderArea">Loading Component...</div>
      </div>
      <script>
        // Handle messages from the extension
        window.addEventListener('message', event => {
          const message = event.data;
          if (message.type === 'render') {
            try {
              const code = Babel.transform(message.code, { presets: ['react'] }).code;
              const renderScript = new Function('React', 'ReactDOM', code);
              document.getElementById('renderArea').innerHTML = '<div id="componentRoot"></div>';
              renderScript(React, ReactDOM);
              ReactDOM.render(<Component />, document.getElementById('componentRoot'));
            } catch (error) {
              console.error('Error rendering component:', error);
            }
          }
        });
      </script>
    </body>
    </html>
  `;
}

// This method is called when your extension is deactivated
export function deactivate() {}
