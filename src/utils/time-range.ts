import { getUiMessages, tmpl } from '../i18n/ui-messages.js';

/** Git log 用的 ISO 时间区间（since 含、until 不含，与现有行为一致） */
export type IsoTimeRange = { since: string; until: string };

const DAY_MS = 86400000;

export function dayRange(dateStr: string): IsoTimeRange {
  const ui = getUiMessages();
  const invalid = () =>
    new Error(tmpl(ui.errInvalidDate, { dateStr }));
  const parts = dateStr.split('-').map((p) => Number(p));
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
    throw invalid();
  }
  const [year, month, day] = parts;
  const start = new Date(year, month - 1, day, 0, 0, 0, 0);
  if (Number.isNaN(start.getTime())) {
    throw invalid();
  }
  const since = start.toISOString();
  const until = new Date(start.getTime() + DAY_MS).toISOString();
  return { since, until };
}

export function todayRange(): IsoTimeRange {
  const now = new Date();
  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0
  );
  const until = new Date(start.getTime() + DAY_MS).toISOString();
  return { since: start.toISOString(), until };
}

/** 周一 00:00 起至本地「明天 00:00」止（与当前自然日对齐的结束时刻） */
export function weekRange(): IsoTimeRange {
  const now = new Date();
  const dow = now.getDay();
  const diff = dow === 0 ? 6 : dow - 1; // 周一为一周开始
  const monday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - diff,
    0,
    0,
    0,
    0
  );
  const since = monday.toISOString();
  const until = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0,
    0
  ).toISOString();
  return { since, until };
}

/** 本月 1 号 00:00 起至本地「明天 00:00」止 */
export function monthRange(): IsoTimeRange {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const until = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0,
    0
  );
  return { since: start.toISOString(), until: until.toISOString() };
}
