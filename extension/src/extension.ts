import * as vscode from "vscode";
import * as path from "path";
import { exec } from "child_process";

function playFahhhh(soundPath: string): void {
  const cmds: Partial<Record<NodeJS.Platform, string>> = {
    darwin: `afplay "${soundPath}"`,
    win32: `powershell -c (Add-Type -AssemblyName presentationCore; $p = New-Object System.Windows.Media.MediaPlayer; $p.Open('${soundPath}'); $p.Play(); Start-Sleep 3)`,
    linux: `paplay "${soundPath}" 2>/dev/null || mpg123 "${soundPath}" 2>/dev/null`,
  };
  const cmd = cmds[process.platform];
  if (cmd) {
    exec(cmd);
  }
}

export function activate(context: vscode.ExtensionContext): void {
  const soundPath = path.join(context.extensionPath, "src", "fahhhh.mp3");

  let prevErrorCount = 0;

  context.subscriptions.push(
    vscode.languages.onDidChangeDiagnostics((e) => {
      const errorCount = e.uris.reduce(
        (sum, uri) =>
          sum +
          vscode.languages
            .getDiagnostics(uri)
            .filter((d) => d.severity === vscode.DiagnosticSeverity.Error)
            .length,
        0,
      );

      if (errorCount > prevErrorCount) {
        playFahhhh(soundPath);
      }
      prevErrorCount = errorCount;
    }),

    vscode.tasks.onDidEndTaskProcess((e) => {
      if (e.exitCode !== 0) {
        playFahhhh(soundPath);
      }
    }),

    vscode.commands.registerCommand("fahhhh.test", () => playFahhhh(soundPath)),
  );
}

export function deactivate(): void {}
