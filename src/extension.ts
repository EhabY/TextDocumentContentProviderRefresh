import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "textDocumentProviderRefresh" is now active!');

	const myScheme = 'readonly';
	const myProvider = new class implements vscode.TextDocumentContentProvider {
		private content: string = "Initial";

		// emitter and its event
		onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
		onDidChange = this.onDidChangeEmitter.event;

		setContentAndRefresh(uri: vscode.Uri, content: string): void {
			this.content = content;
			this.onDidChangeEmitter.fire(uri);
		}

		provideTextDocumentContent(uri: vscode.Uri): string {
		  return this.content;
		}
	};
	context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(myScheme, myProvider));

	const uri = vscode.Uri.parse(`${myScheme}:/Document`);
	let disposable = vscode.commands.registerCommand('textDocumentProviderRefresh.open', async () => {
		await vscode.window.showTextDocument(vscode.Uri.joinPath(context.extensionUri, "first.txt"), { preview: false, viewColumn: vscode.ViewColumn.Active });
		await vscode.window.showTextDocument(vscode.Uri.joinPath(context.extensionUri, "second.txt"), { preview: false, viewColumn: vscode.ViewColumn.Active });
		await vscode.window.showTextDocument(uri, { preview: false, viewColumn: vscode.ViewColumn.Beside });
	});
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand('textDocumentProviderRefresh.refresh', async () => {
		myProvider.onDidChangeEmitter.fire(uri);
	});
	context.subscriptions.push(disposable);

	vscode.window.onDidChangeActiveTextEditor(textEditor => {
		if(textEditor !== undefined) {
			if(textEditor.document.uri.scheme === "file") {
				myProvider.setContentAndRefresh(uri, textEditor.document.getText());
			}
		}
	});
}

export function deactivate() {}
