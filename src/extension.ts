import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext): void {
    const disposable: vscode.Disposable = vscode.commands.registerCommand('async-switch.toggle', () => {
        if (vscode.window.activeTextEditor) {
            let targetLine: string = '';
            if (vscode.window.activeTextEditor.document.languageId == 'typescript' || vscode.window.activeTextEditor.document.languageId == 'javascript') {
                const currentLine: string = vscode.window.activeTextEditor.document.lineAt(vscode.window.activeTextEditor.selection.start.line).text;
                // eslint-disable-next-line prefer-named-capture-group
                const matches: RegExpMatchArray | null = /^([^(]+)/u.exec(currentLine);
                if (matches && matches.length >= 1) {
                    const prefix: string = matches[0];
                    if (prefix.includes('async ')) {
                        targetLine = currentLine.replace('async ', '');
                        const returnType: string = currentLine.substring(currentLine.lastIndexOf(': '));
                        const targetReturn: string = returnType.replace('Promise<', '').replace('>', '');
                        targetLine = `${targetLine.substring(0, targetLine.lastIndexOf(': '))}${targetReturn}`;
                    } else {
                        if (currentLine.includes('function ')) {
                            targetLine = currentLine.replace('function ', 'async function ');
                        }
                        if (currentLine.includes('private ')) {
                            targetLine = currentLine.replace('private ', 'private async ');
                        }
                        if (currentLine.includes('public ')) {
                            targetLine = currentLine.replace('public ', 'public async ');
                        }
                        if (currentLine.includes('protected ')) {
                            targetLine = currentLine.replace('protected ', 'protected async ');
                        }
                        const returnType: string = currentLine.substring(currentLine.lastIndexOf(': ') + 2, currentLine.indexOf(' {'));
                        const targetReturn: string = `Promise<${returnType}>`;
                        targetLine = `${targetLine.substring(0, targetLine.lastIndexOf(': ') + 2)}${targetReturn} {`;
                    }
                }
            }
            if (targetLine) {
                vscode.window.activeTextEditor.edit(builder => {
                    if (vscode.window.activeTextEditor) {
                        builder.replace(vscode.window.activeTextEditor.document.lineAt(vscode.window.activeTextEditor.selection.start.line).range, targetLine);
                    }
                });
            }
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate(): void {
    console.info('async-switch deactivated~');
}
