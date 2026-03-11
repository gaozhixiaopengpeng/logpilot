import { simpleGit } from 'simple-git';

/**
 * 获取单个 commit 的 diff（git show），不调用 AI
 */
export async function getDiffForCommit(
  repoPath: string,
  commitHash: string
): Promise<string> {
  const git = simpleGit(repoPath);
  try {
    const out = await git.show([commitHash, '-p', '--no-color']);
    if (out && out.trim()) return out;
  } catch {
    // 继续 raw
  }
  const raw = await git.raw(['show', commitHash, '-p', '--no-color']);
  return raw ?? '';
}

/**
 * 聚合多个 commit 的 diff 文本（截断避免 prompt 过长）
 */
export async function getDiffsForCommits(
  repoPath: string,
  commits: { hash: string }[],
  maxChars = 12000
): Promise<string> {
  const parts: string[] = [];
  let total = 0;
  for (const c of commits) {
    if (total >= maxChars) break;
    const diff = await getDiffForCommit(repoPath, c.hash);
    const chunk = `--- commit ${c.hash} ---\n${diff}\n`;
    if (total + chunk.length > maxChars) {
      parts.push(chunk.slice(0, maxChars - total) + '\n... [truncated]');
      break;
    }
    parts.push(chunk);
    total += chunk.length;
  }
  return parts.join('\n');
}
