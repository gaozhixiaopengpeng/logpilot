import { simpleGit } from 'simple-git';

export type CommitInfo = {
  hash: string;
  message: string;
  author: string;
  date: string;
};

/**
 * 在指定仓库、时间范围内获取 git log（不调用 AI）
 */
export async function getCommits(
  repoPath: string,
  sinceIso: string,
  untilIso: string
): Promise<CommitInfo[]> {
  const git = simpleGit(repoPath);
  const raw = await git.raw([
    'log',
    `--since=${sinceIso}`,
    `--until=${untilIso}`,
    '--pretty=format:%H|%an|%aI|%s',
  ]);
  if (!raw || !raw.trim()) return [];
  return raw
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const parts = line.split('|');
      const hash = parts[0] ?? '';
      const author = parts[1] ?? '';
      const date = parts[2] ?? '';
      const message = parts.slice(3).join('|') || '';
      return { hash, author, date, message };
    });
}
