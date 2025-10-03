import * as vscode from 'vscode';
class EzrspecCodeLensProvider implements vscode.CodeLensProvider {
  private onDidChangeEmitter = new vscode.EventEmitter<void>();
  public readonly onDidChangeCodeLenses = this.onDidChangeEmitter.event;

  constructor() {
    vscode.window.onDidChangeTextEditorSelection(() => {
      this.onDidChangeEmitter.fire();
    });
  }

  provideCodeLenses(
    document: vscode.TextDocument,
    token: vscode.CancellationToken) {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return [];
      }
      const line = editor.selection.active.line;
      const range = new vscode.Range(line, 0, line, 0);
      return [
        new vscode.CodeLens(range, {
          title: '▶ Run RSpec',
          tooltip: 'Rspec Options',
          command: 'ezrspec.gutterMenu',
          arguments: []
        })
      ];
    }
}

export default EzrspecCodeLensProvider;

