import { getUiMessages } from '../i18n/ui-messages.js';

/** 打印在 stdout 的报表标题行：随终端 UI 语言，与 `--lang`（模型正文）无关 */
export function formatReportTitle(kind: 'today' | 'day' | 'week' | 'month'): string {
  const ui = getUiMessages();
  if (kind === 'month') return ui.reportTitleMonth;
  if (kind === 'week') return ui.reportTitleWeek;
  if (kind === 'day') return ui.reportTitleDay;
  return ui.reportTitleToday;
}

/**
 * 无 AI 时的占位输出（文案随终端 UI 语言，与 `--lang` 无关）
 */
export function fallbackReport(commitMessages: string[]): string {
  const ui = getUiMessages();
  if (commitMessages.length === 0) return ui.fallbackNoCommits;
  const lines = commitMessages.map((m, i) => `${i + 1}. ${m}`);
  return ui.fallbackReportHeader + lines.join('\n') + '\n';
}
