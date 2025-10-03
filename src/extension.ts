import * as vscode from 'vscode';
import EzrspecCodeLensProvider from './EzrspecCodeLensProvider';

export function activate(context: vscode.ExtensionContext) {
	console.log('Extension "ezrspec" is now active!');

	const decorationType = vscode.window.createTextEditorDecorationType({
    gutterIconPath: context.asAbsolutePath('resources/play_icon.svg'),
    gutterIconSize: 'contain'
  });

  const updateGutterIcon = (editor: vscode.TextEditor | undefined) => {
    if (!editor) {
      return;
    }
    const line = editor.selection.active.line;
    if (line >= editor.document.lineCount) {
      return;
    }
    // const range = new vscode.Range(line, 0, line, 0);
    // editor.setDecorations(decorationType, [{ range }]);
  };

  if (vscode.window.activeTextEditor) {
    updateGutterIcon(vscode.window.activeTextEditor);
  }

  vscode.window.onDidChangeTextEditorSelection(event => {
    updateGutterIcon(event.textEditor);
  }, null, context.subscriptions);

  vscode.window.onDidChangeActiveTextEditor(editor => {
    updateGutterIcon(editor);
  }, null, context.subscriptions);

  const runFromGutter = vscode.commands.registerCommand('ezrspec.gutterMenu', async () => {
    const choice = await vscode.window.showQuickPick([
      { label: 'Run RSpec on current line', command: 'ezrspec.runRspecOnCurrentLine' },
      { label: 'Run RSpec on current file', command: 'ezrspec.runRspecOnCurrentFile' }
    ], { placeHolder: 'Ezrspec actions' });
    if (choice) {
      vscode.commands.executeCommand(choice.command);
    }
  });

	const validateOpenFile = () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active file found!. Please open a file and try again.');
			return false;
		}
    const isRspecFile = editor.document.fileName.endsWith('_spec.rb');
    if (!isRspecFile) {
      vscode.window.showErrorMessage('Not an RSpec file');
      return;
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
  context.subscriptions.push(runFromGutter);
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider(
      {
        scheme: 'file',
        language: 'ruby'
      }, new EzrspecCodeLensProvider()
    )
  );
}

export function deactivate() {}
