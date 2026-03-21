import { generateCommitMessage } from '../ai/summarize.js';
import { getUiMessages } from '../i18n/ui-messages.js';
import { publishCommitMessageForCopy } from './commit-output.js';
import { startLoading } from '../utils/loading.js';

export type GenerateCommitMessageResult =
  | { ok: true; message: string }
  | { ok: false };

/**
 * 带 loading、生成 commit message、写入 copy 缓存；失败时写 stderr 并返回 ok: false。
 */
export async function generateCommitMessageWithCopy(
  diff: string,
  loadingMessage: string,
  postAction: string | undefined
): Promise<GenerateCommitMessageResult> {
  const stopLoading = startLoading(loadingMessage);
  try {
    const message = await generateCommitMessage(diff);
    stopLoading();
    await publishCommitMessageForCopy(message, postAction);
    return { ok: true, message };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    process.stderr.write(getUiMessages().errGenerateFailedPrefix + msg + '\n');
    process.exitCode = 1;
    stopLoading();
    return { ok: false };
  }
}
