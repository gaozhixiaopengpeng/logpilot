import type { CommitInfo } from '../git/log.js';

/**
 * 将 commit 列表格式化为 REPORT-PROMPT 中的 {commit_list} 输入
 */
export function formatCommitList(commits: CommitInfo[]): string {
  if (commits.length === 0) return '(今日无 commit)';
  return commits
    .map((c, i) => `commit${i + 1}: ${c.message} (${c.hash.slice(0, 7)})`)
    .join('\n');
}

/**
 * 将单个 commit + diff 格式化为 AI-PROMPT 输入块
 */
export function formatCommitAndDiff(
  message: string,
  diff: string
): string {
  return `commit message:\n${message}\n\ncode diff:\n${diff || '(无 diff)'}`;
}
