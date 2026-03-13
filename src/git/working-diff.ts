import { simpleGit } from 'simple-git';

export type WorkingDiffMode = 'staged' | 'unstaged' | 'auto';

/**
 * 获取工作区或暂存区 diff（不调用 AI）
 * - staged: 仅暂存区（git diff --cached）
 * - unstaged: 仅未暂存（git diff）
 * - auto: 暂存区非空则用暂存区，否则用工作区相对 HEAD
 */
export async function getWorkingDiff(
  repoPath: string,
  mode: WorkingDiffMode = 'auto',
  maxChars = 16000
): Promise<{ diff: string; source: 'staged' | 'unstaged' }> {
  const git = simpleGit(repoPath);
  let diff = '';
  let source: 'staged' | 'unstaged' = 'unstaged';

  if (mode === 'staged') {
    diff = (await git.raw(['diff', '--cached', '--no-color'])) ?? '';
    source = 'staged';
  } else if (mode === 'unstaged') {
    diff = (await git.raw(['diff', '--no-color'])) ?? '';
    source = 'unstaged';
  } else {
    const staged = (await git.raw(['diff', '--cached', '--no-color'])) ?? '';
    if (staged.trim()) {
      diff = staged;
      source = 'staged';
    } else {
      diff = (await git.raw(['diff', 'HEAD', '--no-color'])) ?? '';
      source = 'unstaged';
    }
  }

  const trimmed = diff.trim();
  if (!trimmed) {
    return { diff: '', source };
  }
  if (diff.length > maxChars) {
    diff = diff.slice(0, maxChars) + '\n... [truncated]';
  }
  return { diff, source };
}
