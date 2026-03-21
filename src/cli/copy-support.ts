import type { Command } from 'commander';
import { copyToClipboard } from '../utils/clipboard.js';
import { getUiMessages, tmpl } from '../i18n/ui-messages.js';
import { readLastReportOutput } from '../utils/last-output.js';

/** 子命令末尾可选位置参数的唯一合法取值 */
export const POST_ACTION_COPY = 'copy';

export const ARG_POST_ACTION_COPY = '[postAction]';

export function descPostActionCopyReport(): string {
  return getUiMessages().descPostActionCopyReport;
}

export function descPostActionCopyCommit(): string {
  return getUiMessages().descPostActionCopyCommit;
}

export function assertOptionalCopyWord(
  cliName: string,
  postAction: string | undefined,
  commandName: string
): boolean {
  if (postAction === undefined) return true;
  if (postAction === POST_ACTION_COPY) return true;
  const ui = getUiMessages();
  process.stderr.write(
    tmpl(ui.errUnknownPostAction, {
      postAction,
      cliName,
      commandName,
    })
  );
  process.exitCode = 1;
  return false;
}

export async function maybeCopyToClipboard(
  postAction: string | undefined,
  text: string
): Promise<void> {
  if (postAction !== POST_ACTION_COPY) return;
  const ui = getUiMessages();
  try {
    await copyToClipboard(text);
    process.stderr.write(ui.msgCopiedToClipboard);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    process.stderr.write(ui.errCopyFailedPrefix + msg + '\n');
    process.exitCode = 1;
  }
}

/**
 * 校验末尾 `copy` 后执行 producer，再按需写入剪贴板。
 * producer 须负责写入 stdout 与 `saveLastReportOutput`（若适用）。
 */
export async function runWithCopyPostAction(
  cliName: string,
  commandName: string,
  postAction: string | undefined,
  producer: () => Promise<string>
): Promise<void> {
  if (!assertOptionalCopyWord(cliName, postAction, commandName)) return;
  const text = await producer();
  await maybeCopyToClipboard(postAction, text);
}

export async function readStdinUtf8(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf8');
}

export function registerCopyCommand(program: Command, cliName: string): void {
  const ui = getUiMessages();
  program
    .command('copy')
    .description(ui.cmdCopyDescription)
    .option('-t, --text <string>', ui.optCopyText)
    .action(async (opts: { text?: string }) => {
      let content: string;
      if (opts.text !== undefined) {
        content = opts.text;
      } else if (process.stdin.isTTY) {
        const last = await readLastReportOutput();
        if (last !== null) {
          content = last;
        } else {
          process.stderr.write(
            tmpl(ui.errNoCacheContent, { cliName })
          );
          process.exitCode = 1;
          return;
        }
      } else {
        content = await readStdinUtf8();
        if (content === '') {
          const last = await readLastReportOutput();
          if (last !== null) {
            content = last;
          } else {
            process.stderr.write(tmpl(ui.errStdinEmptyNoCache, { cliName }));
            process.exitCode = 1;
            return;
          }
        }
      }
      try {
        await copyToClipboard(content);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        process.stderr.write(ui.errCopyFailedPrefix + msg + '\n');
        process.exitCode = 1;
        return;
      }
      process.stderr.write(ui.msgCopiedToClipboard);
    });
}
