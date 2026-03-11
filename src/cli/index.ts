#!/usr/bin/env node
import 'dotenv/config';
import { Command } from 'commander';
import { getCommits } from '../git/log.js';
import { getDiffsForCommits } from '../git/diff.js';
import { formatCommitList } from '../utils/format.js';
import { summarize } from '../ai/summarize.js';
import {
  formatReportTitle,
  fallbackReport,
} from '../report/generate.js';

function dayRange(dateStr: string): { since: string; until: string } {
  const d = new Date(dateStr + 'T00:00:00.000Z');
  if (Number.isNaN(d.getTime())) {
    throw new Error(`无效日期: ${dateStr}，请使用 YYYY-MM-DD`);
  }
  const since = d.toISOString();
  const until = new Date(d.getTime() + 86400000).toISOString();
  return { since, until };
}

function todayRange(): { since: string; until: string } {
  const now = new Date();
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  const until = new Date(start.getTime() + 86400000).toISOString();
  return { since: start.toISOString(), until };
}

function weekRange(): { since: string; until: string } {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = day === 0 ? 6 : day - 1; // 周一为一周开始
  const monday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - diff)
  );
  const since = new Date(
    Date.UTC(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate())
  ).toISOString();
  const until = new Date(now.getTime() + 86400000).toISOString();
  return { since, until };
}

async function runReport(
  repo: string,
  since: string,
  until: string,
  promptName: 'daily' | 'weekly',
  titleKind: 'today' | 'day' | 'week'
): Promise<void> {
  const commits = await getCommits(repo, since, until);
  process.stdout.write(formatReportTitle(titleKind));
  if (commits.length === 0) {
    process.stdout.write('（所选时间范围内无 commit）\n');
    return;
  }
  const commitList = formatCommitList(commits);
  let report: string;
  try {
    const diffBlock = await getDiffsForCommits(repo, commits);
    report = await summarize(promptName, commitList, diffBlock);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (
      msg.includes('WORKLOG_API_KEY') ||
      msg.includes('OPENAI_API_KEY') ||
      msg.includes('DEEPSEEK_API_KEY')
    ) {
      report = fallbackReport(commits.map((c) => c.message));
      process.stderr.write('提示: ' + msg + '\n');
    } else {
      throw e;
    }
  }
  process.stdout.write('\n' + report + '\n');
}

const program = new Command();
program
  .name('worklog')
  .description('根据 Git commit 与 diff 用 AI 生成工作日报/周报')
  .version('0.1.0');

function applyProvider(provider?: string): void {
  if (provider) {
    process.env.WORKLOG_PROVIDER = provider;
  }
}

program
  .command('today')
  .description('生成今日工作日报')
  .option('-r, --repo <path>', '仓库路径', process.cwd())
  .option(
    '--provider <name>',
    'AI 提供方: openai（默认）| deepseek'
  )
  .action(async (opts: { repo: string; provider?: string }) => {
    applyProvider(opts.provider);
    const { since, until } = todayRange();
    await runReport(opts.repo, since, until, 'daily', 'today');
  });

program
  .command('day')
  .description('生成指定日期日报')
  .requiredOption('-d, --date <yyyy-mm-dd>', '日期')
  .option('-r, --repo <path>', '仓库路径', process.cwd())
  .option('--provider <name>', 'AI 提供方: openai（默认）| deepseek')
  .action(async (opts: { date: string; repo: string; provider?: string }) => {
    applyProvider(opts.provider);
    const { since, until } = dayRange(opts.date);
    await runReport(opts.repo, since, until, 'daily', 'day');
  });

program
  .command('week')
  .description('生成本周工作周报')
  .option('-r, --repo <path>', '仓库路径', process.cwd())
  .option('--provider <name>', 'AI 提供方: openai（默认）| deepseek')
  .action(async (opts: { repo: string; provider?: string }) => {
    applyProvider(opts.provider);
    const { since, until } = weekRange();
    await runReport(opts.repo, since, until, 'weekly', 'week');
  });

program.parse();
