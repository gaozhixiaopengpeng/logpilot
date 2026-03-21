import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { getUiMessages, tmpl } from '../i18n/ui-messages.js';

function spawnWithStdin(
  command: string,
  args: string[],
  stdin: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['pipe', 'ignore', 'pipe'] });
    let stderr = '';
    child.stderr?.on('data', (c: Buffer) => {
      stderr += c.toString('utf8');
    });
    child.on('error', (err: NodeJS.ErrnoException) => {
      reject(err);
    });
    child.on('close', (code) => {
      if (code === 0) resolve();
      else {
        const ui = getUiMessages();
        reject(
          new Error(
            stderr.trim() ||
              tmpl(ui.errCommandExitCode, {
                command,
                code: String(code ?? ''),
              })
          )
        );
      }
    });
    child.stdin.write(stdin, 'utf8', () => {
      child.stdin.end();
    });
  });
}

async function copyWindows(text: string): Promise<void> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'wp-clip-'));
  const file = path.join(dir, 'in.txt');
  await fs.writeFile(file, text, 'utf8');
  const escapedPath = file.replace(/'/g, "''");
  const psCmd = `Get-Content -LiteralPath '${escapedPath}' -Raw | Set-Clipboard`;
  try {
    await new Promise<void>((resolve, reject) => {
      const child = spawn('powershell.exe', [
        '-NoProfile',
        '-NonInteractive',
        '-Command',
        psCmd,
      ]);
      let errOut = '';
      child.stderr?.on('data', (c: Buffer) => {
        errOut += c.toString('utf8');
      });
      child.on('error', reject);
      child.on('close', (code) => {
        if (code === 0) resolve();
        else {
          const ui = getUiMessages();
          reject(
            new Error(
              errOut.trim() ||
                tmpl(ui.errCommandExitCode, {
                  command: 'Set-Clipboard',
                  code: String(code ?? ''),
                })
            )
          );
        }
      });
    });
  } finally {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

async function copyLinux(text: string): Promise<void> {
  const tools: Array<[string, string[]]> = [
    ['wl-copy', []],
    ['xclip', ['-selection', 'clipboard']],
    ['xsel', ['--clipboard', '--input']],
  ];
  let lastError: Error | undefined;
  for (const [cmd, args] of tools) {
    try {
      await spawnWithStdin(cmd, args, text);
      return;
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      const { code } = e as NodeJS.ErrnoException;
      if (code === 'ENOENT') continue;
    }
  }
  throw lastError ?? new Error(getUiMessages().errNoClipboardTool);
}

/** 将文本写入系统剪贴板（macOS / Windows / 常见 Linux 桌面） */
export async function copyToClipboard(text: string): Promise<void> {
  const { platform } = process;
  if (platform === 'darwin') {
    await spawnWithStdin('pbcopy', [], text);
  } else if (platform === 'win32') {
    await copyWindows(text);
  } else if (platform === 'linux') {
    await copyLinux(text);
  } else {
    throw new Error(
      tmpl(getUiMessages().errClipboardUnsupportedPlatform, { platform })
    );
  }
}
