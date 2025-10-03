import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Extension "ezrspec" is now active!');

	const validateIfRubyFile = () => {
		const editor = validateOpenFile();
		if (!editor) {
			return;
		}
	};

	const validateOpenFile = () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active file found!. Please open a file and try again.');
			return editor;
		}
		return true;
	};

	const createTerminal = () => {
		const terminalName = 'EZRspec Terminal';
		const ezRspecTerminals = vscode.window.terminals.filter(t => t.name === terminalName);
		let terminal: vscode.Terminal;
		// TODO: Set upper limit from some config
		if (ezRspecTerminals.length >= 5) {
			terminal = ezRspecTerminals[0];
		} else {
			terminal = vscode.window.createTerminal('EZRspec Terminal');
		}
		terminal.show();
		return terminal;
	};

	const currentLineDisposable = vscode.commands.registerCommand('ezrspec.runRspecOnCurrentLine', () => {
		if (!validateOpenFile()) {
			return;
		}
		let currentLine = vscode.window.activeTextEditor?.selection.active?.line;
		if (currentLine === undefined) {
			vscode.window.showErrorMessage('Could not determine current line. Running on entire file instead.');
			vscode.commands.executeCommand('ezrspec.runRspecOnCurrentFile');
			return;
		}
		currentLine++;
		vscode.window.showInformationMessage('Running RSpec on line: ' + currentLine);
		const filePath = vscode.window.activeTextEditor?.document.uri.fsPath;
		const terminal = createTerminal();
		terminal.sendText(`bundle exec rspec ${filePath}:${currentLine}`);
	});

	const currentFileDisposable = vscode.commands.registerCommand('ezrspec.runRspecOnCurrentFile', () => {
		const editor = validateOpenFile();
		if (!editor) {
			return;
		}
		vscode.window.showInformationMessage('Running RSpec on file: ' + vscode.window.activeTextEditor?.document.fileName);
		const filePath = vscode.window.activeTextEditor?.document.uri.fsPath;
		const terminal = createTerminal();
		terminal.sendText(`bundle exec rspec ${filePath}`);
	});

	context.subscriptions.push(currentLineDisposable);
	context.subscriptions.push(currentFileDisposable);
}

export function deactivate() {}
