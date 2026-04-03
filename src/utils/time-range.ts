import { getUiMessages, tmpl } from '../i18n/ui-messages.js';
import type { ReportTitleKind } from '../report/run-report.js';

/** Git log 用的 ISO 时间区间（since 含、until 不含，与现有行为一致） */
export type IsoTimeRange = { since: string; until: string };

type ParsedRange = {
  range: IsoTimeRange;
  titleKind: ReportTitleKind;
  /** 输出到 stderr 的 Parsed as 提示（非精确输入才会填充） */
  parsedAs?: string;
};

function localMidnight(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

function addDaysLocal(date: Date, days: number): Date {
  const d = localMidnight(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isValidYmdParts(year: number, month1to12: number, day1to31: number): boolean {
  const d = new Date(year, month1to12 - 1, day1to31, 0, 0, 0, 0);
  return (
    d.getFullYear() === year &&
    d.getMonth() === month1to12 - 1 &&
    d.getDate() === day1to31
  );
}

function parseDayExactYmd(dateStr: string): Date {
  // YYYY-MM-DD
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!m) throw new Error(tmpl(getUiMessages().errInvalidDate, { dateStr }));
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (!isValidYmdParts(year, month, day)) {
    throw new Error(tmpl(getUiMessages().errInvalidDate, { dateStr }));
  }
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

function parseDayExactCompactYmd(dateStr: string): Date {
  // YYYYMMDD
  const m = /^(\d{4})(\d{2})(\d{2})$/.exec(dateStr);
  if (!m) throw new Error(tmpl(getUiMessages().errInvalidDate, { dateStr }));
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (!isValidYmdParts(year, month, day)) {
    throw new Error(tmpl(getUiMessages().errInvalidDate, { dateStr }));
  }
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

function parseDayExactEuropean(dateStr: string): Date {
  // DD/MM/YYYY
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dateStr);
  if (!m) throw new Error(tmpl(getUiMessages().errInvalidDate, { dateStr }));
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  if (!isValidYmdParts(year, month, day)) {
    throw new Error(tmpl(getUiMessages().errInvalidDate, { dateStr }));
  }
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

function dayRangeFromLocalDate(day: Date): IsoTimeRange {
  const since = localMidnight(day).toISOString();
  const until = addDaysLocal(day, 1).toISOString();
  return { since, until };
}

export function dayRange(dateStr: string): IsoTimeRange {
  const start = parseDayExactYmd(dateStr);
  return dayRangeFromLocalDate(start);
}

export function todayRange(now = new Date()): IsoTimeRange {
  const start = localMidnight(now);
  return dayRangeFromLocalDate(start);
}

/** 周一 00:00 起至本地「明天 00:00」止（与当前自然日对齐的结束时刻） */
export function weekRange(now = new Date()): IsoTimeRange {
  const d = localMidnight(now);
  const dow = d.getDay(); // 0..6 (Sun..Sat)
  const diff = dow === 0 ? 6 : dow - 1; // 周一为一周开始
  const monday = addDaysLocal(d, -diff);
  const since = monday.toISOString();
  const until = addDaysLocal(d, 1).toISOString();
  return { since, until };
}

/** 本月 1 号 00:00 起至本地「明天 00:00」止 */
export function monthRange(now = new Date()): IsoTimeRange {
  const d = localMidnight(now);
  const start = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
  const since = start.toISOString();
  const until = addDaysLocal(d, 1).toISOString();
  return { since, until };
}

function isoWeekStartUtc(year: number, week: number): Date {
  // 计算 ISO 周开始日期（周一）在 UTC 下的年月日，然后再转成本地午夜
  const jan4 = new Date(Date.UTC(year, 0, 4)); // ISO: Week 1 contains Jan 4
  const jan4Dow = jan4.getUTCDay(); // 0..6 (Sun..Sat)
  const mondayOffset = (jan4Dow + 6) % 7; // Mon=0..Sun=6
  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() - mondayOffset);

  const target = new Date(week1Monday);
  target.setUTCDate(week1Monday.getUTCDate() + (week - 1) * 7);
  return target; // UTC date
}

function getIsoWeekYearAndWeekUtc(utcYmd: Date): { year: number; week: number } {
  const year = utcYmd.getUTCFullYear();
  const month = utcYmd.getUTCMonth();
  const date = utcYmd.getUTCDate();

  const d = new Date(Date.UTC(year, month, date));
  const dow = d.getUTCDay(); // 0..6
  const isoDow = (dow + 6) % 7; // Mon=0
  // Move to Thursday in current ISO week
  d.setUTCDate(d.getUTCDate() + (3 - isoDow));
  const isoYear = d.getUTCFullYear();

  const firstThursday = new Date(Date.UTC(isoYear, 0, 4));
  const firstDow = firstThursday.getUTCDay();
  const firstIsoDow = (firstDow + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() + (3 - firstIsoDow));

  const dayDiff = (d.getTime() - firstThursday.getTime()) / 86400000;
  const isoWeek = 1 + Math.round(dayDiff / 7);
  return { year: isoYear, week: isoWeek };
}

function parseIsoWeekToken(token: string, now = new Date()): {
  year: number;
  week: number;
  parsedAs?: string;
} {
  const raw = token.trim();
  const ui = getUiMessages();
  const today = localMidnight(now);

  if (/^(thisweek)$/i.test(raw)) {
    // current week (truncated to now+1 day)
    const resolvedSince = weekRange(today).since;
    const resolvedUntil = weekRange(today).until;
    void resolvedSince;
    void resolvedUntil;
    // hint: compute current ISO week label based on today
    const utcYmd = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    const { year, week } = getIsoWeekYearAndWeekUtc(utcYmd);
    return {
      year,
      week,
      parsedAs: `${year}-W${String(week).padStart(2, '0')}`,
    };
  }

  if (/^(lastweek|last)$/i.test(raw)) {
    const current = localMidnight(now);
    const currentMonday = addDaysLocal(current, -((current.getDay() + 6) % 7)); // Mon back
    const lastMonday = addDaysLocal(currentMonday, -7);
    const utcYmd = new Date(
      Date.UTC(lastMonday.getFullYear(), lastMonday.getMonth(), lastMonday.getDate())
    );
    const { year, week } = getIsoWeekYearAndWeekUtc(utcYmd);
    return {
      year,
      week,
      parsedAs: `${year}-W${String(week).padStart(2, '0')}`,
    };
  }

  const exp = /^(\d{4})-W(\d{1,2})$/i.exec(raw);
  if (exp) {
    const year = Number(exp[1]);
    const week = Number(exp[2]);
    if (!(week >= 1 && week <= 53)) {
      throw new Error(tmpl(ui.errInvalidWeekInput, { input: token }));
    }
    const utcStart = isoWeekStartUtc(year, week);
    const { year: isoYear, week: isoWeek } = getIsoWeekYearAndWeekUtc(utcStart);
    if (isoYear !== year || isoWeek !== week) {
      throw new Error(tmpl(ui.errInvalidWeekInput, { input: token }));
    }
    return { year, week };
  }

  const m1 = /^(\d{1,2})week$/i.exec(raw);
  if (m1) {
    const week = Number(m1[1]);
    if (!(week >= 1 && week <= 53)) {
      throw new Error(tmpl(ui.errInvalidWeekInput, { input: token }));
    }
    const year = now.getFullYear();
    const utcStart = isoWeekStartUtc(year, week);
    const { year: isoYear, week: isoWeek } = getIsoWeekYearAndWeekUtc(utcStart);
    if (isoYear !== year || isoWeek !== week) {
      throw new Error(tmpl(ui.errInvalidWeekInput, { input: token }));
    }
    return {
      year,
      week,
      parsedAs: `${year}-W${String(week).padStart(2, '0')}`,
    };
  }

  const m2 = /^(\d{1,2})$/.exec(raw);
  if (m2) {
    const week = Number(m2[1]);
    if (!(week >= 1 && week <= 53)) {
      throw new Error(tmpl(ui.errInvalidWeekInput, { input: token }));
    }
    const year = now.getFullYear();
    const utcStart = isoWeekStartUtc(year, week);
    const { year: isoYear, week: isoWeek } = getIsoWeekYearAndWeekUtc(utcStart);
    if (isoYear !== year || isoWeek !== week) {
      throw new Error(tmpl(ui.errInvalidWeekInput, { input: token }));
    }
    return {
      year,
      week,
      parsedAs: `${year}-W${String(week).padStart(2, '0')}`,
    };
  }

  throw new Error(tmpl(ui.errInvalidWeekInput, { input: token }));
}

function parseMonthToken(token: string, now = new Date()): {
  year: number;
  month1to12: number;
  parsedAs?: string;
} {
  const raw = token.trim();
  const ui = getUiMessages();

  if (/^(thismonth)$/i.test(raw)) {
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    return {
      year: y,
      month1to12: m,
      parsedAs: `${y}-${String(m).padStart(2, '0')}`,
    };
  }
  if (/^(lastmonth|last)$/i.test(raw)) {
    const d = localMidnight(now);
    const prevMonth = new Date(d.getFullYear(), d.getMonth() - 1, 1, 0, 0, 0, 0);
    const y = prevMonth.getFullYear();
    const m = prevMonth.getMonth() + 1;
    return {
      year: y,
      month1to12: m,
      parsedAs: `${y}-${String(m).padStart(2, '0')}`,
    };
  }

  const expY = /^(\d{4})-(\d{1,2})$/.exec(raw);
  if (expY) {
    const year = Number(expY[1]);
    const month = Number(expY[2]);
    if (!(month >= 1 && month <= 12)) {
      throw new Error(tmpl(ui.errInvalidMonthInput, { input: token }));
    }
    return { year, month1to12: month };
  }

  const expNum = /^(\d{1,2})$/.exec(raw);
  if (expNum) {
    const month = Number(expNum[1]);
    if (!(month >= 1 && month <= 12)) {
      throw new Error(tmpl(ui.errInvalidMonthInput, { input: token }));
    }
    const year = now.getFullYear();
    return {
      year,
      month1to12: month,
      parsedAs: `${year}-${String(month).padStart(2, '0')}`,
    };
  }

  const expName = /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)$/i.exec(raw);
  if (expName) {
    const name = expName[1].toLowerCase();
    const map: Record<string, number> = {
      jan: 1,
      feb: 2,
      mar: 3,
      apr: 4,
      may: 5,
      jun: 6,
      jul: 7,
      aug: 8,
      sep: 9,
      oct: 10,
      nov: 11,
      dec: 12,
    };
    const month = map[name];
    const year = now.getFullYear();
    return {
      year,
      month1to12: month,
      parsedAs: `${year}-${String(month).padStart(2, '0')}`,
    };
  }

  throw new Error(tmpl(ui.errInvalidMonthInput, { input: token }));
}

function parseDayToken(token: string, now = new Date()): { date: Date; parsedAs?: string } {
  const raw = token.trim();
  const ui = getUiMessages();
  const today = localMidnight(now);
  const curY = today.getFullYear();
  const curM = today.getMonth() + 1;

  if (/^(today)$/i.test(raw)) {
    return { date: today, parsedAs: toYmd(today) };
  }
  if (/^(last|yesterday)$/i.test(raw)) {
    const d = addDaysLocal(today, -1);
    // last/yesterday 都属于“相对语义”，需要提示 Parsed as
    return { date: d, parsedAs: toYmd(d) };
  }

  // Exact YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return { date: parseDayExactYmd(raw) };
  }
  // Exact YYYYMMDD
  if (/^\d{8}$/.test(raw)) {
    return { date: parseDayExactCompactYmd(raw) };
  }
  // Exact DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
    return { date: parseDayExactEuropean(raw) };
  }

  // MMDD (current year)
  if (/^\d{4}$/.test(raw)) {
    const mm = Number(raw.slice(0, 2));
    const dd = Number(raw.slice(2, 4));
    if (!(mm >= 1 && mm <= 12) || !(dd >= 1 && dd <= 31)) {
      throw new Error(tmpl(ui.errInvalidDayInput, { input: token }));
    }
    if (!isValidYmdParts(curY, mm, dd)) {
      throw new Error(tmpl(ui.errInvalidDayInput, { input: token }));
    }
    const d = new Date(curY, mm - 1, dd, 0, 0, 0, 0);
    if (d.getTime() > today.getTime()) {
      // 未来不允许：给出候选（上一年同 MMDD）
      const candidates: string[] = [];
      const y1 = curY - 1;
      if (isValidYmdParts(y1, mm, dd)) {
        const cd = new Date(y1, mm - 1, dd, 0, 0, 0, 0);
        candidates.push(toYmd(cd));
      }
      if (candidates.length === 0) {
        throw new Error(tmpl(ui.errInvalidDayInput, { input: token }));
      }
      const didYouMean = candidates
        .slice(0, 2)
        .map((c, i) => `${i + 1}. ${c}`)
        .join('\n');
      throw new Error(
        `${tmpl(ui.errInvalidDayInput, { input: token })}\n${ui.msgDidYouMean}\n${didYouMean}`
      );
    }
    return { date: d, parsedAs: toYmd(d) };
  }

  // DD (current year+month)
  if (/^\d{2}$/.test(raw)) {
    const dd = Number(raw);
    if (!(dd >= 1 && dd <= 31)) {
      throw new Error(tmpl(ui.errInvalidDayInput, { input: token }));
    }
    if (!isValidYmdParts(curY, curM, dd)) {
      throw new Error(tmpl(ui.errInvalidDayInput, { input: token }));
    }
    const d = new Date(curY, curM - 1, dd, 0, 0, 0, 0);
    if (d.getTime() > today.getTime()) {
      const candidates: string[] = [];
      const y1 = curY - 1;
      if (isValidYmdParts(y1, curM, dd)) {
        candidates.push(toYmd(new Date(y1, curM - 1, dd, 0, 0, 0, 0)));
      }
      if (candidates.length === 0) {
        throw new Error(tmpl(ui.errInvalidDayInput, { input: token }));
      }
      const didYouMean = candidates
        .slice(0, 2)
        .map((c, i) => `${i + 1}. ${c}`)
        .join('\n');
      throw new Error(
        `${tmpl(ui.errInvalidDayInput, { input: token })}\n${ui.msgDidYouMean}\n${didYouMean}`
      );
    }
    return { date: d, parsedAs: toYmd(d) };
  }

  throw new Error(tmpl(ui.errInvalidDayInput, { input: token }));
}

export function parseDayTimeSelection(params: {
  input?: string;
  from?: string;
  to?: string;
  now?: Date;
}): ParsedRange {
  const ui = getUiMessages();
  const now = params.now ?? new Date();

  const input = params.input?.trim();
  const from = params.from?.trim();
  const to = params.to?.trim();

  const hasFromTo = from !== undefined || to !== undefined;
  const hasInput = input !== undefined && input !== '';

  if (hasInput && hasFromTo) {
    throw new Error(ui.errTimeInputAndRangeConflict);
  }
  if (hasFromTo && (from === undefined || to === undefined)) {
    throw new Error(ui.errNeedFromTo);
  }

  if (!hasInput && !hasFromTo) {
    return { range: todayRange(now), titleKind: 'today' };
  }

  if (hasFromTo) {
    const fromParsed = parseDayToken(from!, now);
    const toParsed = parseDayToken(to!, now);
    const since = dayRangeFromLocalDate(fromParsed.date).since;
    const until = addDaysLocal(toParsed.date, 1).toISOString();

    const parsedAs =
      fromParsed.parsedAs || toParsed.parsedAs
        ? tmpl(ui.hintParsedAsRange, {
            from: toYmd(fromParsed.date),
            to: toYmd(toParsed.date),
          })
        : undefined;
    return {
      range: { since, until },
      titleKind: 'day',
      parsedAs,
    };
  }

  // input mode
  const raw = input!;
  const rangeShorthand = /^(\d{1,2})-(\d{1,2})$/.exec(raw);
  if (rangeShorthand) {
    const fromDay = Number(rangeShorthand[1]);
    const toDay = Number(rangeShorthand[2]);
    const cur = localMidnight(now);
    const year = cur.getFullYear();
    const month = cur.getMonth(); // 0..11
    if (!(fromDay >= 1 && fromDay <= 31) || !(toDay >= 1 && toDay <= 31)) {
      throw new Error(tmpl(ui.errInvalidDayInput, { input: raw }));
    }
    const fromDate = new Date(year, month, fromDay, 0, 0, 0, 0);
    const toDate = new Date(year, month, toDay, 0, 0, 0, 0);
    const since = localMidnight(fromDate).toISOString();
    const until = addDaysLocal(toDate, 1).toISOString();

    const fromLabel = toYmd(fromDate);
    const toLabel = toYmd(toDate);
    const parsedAs = tmpl(ui.hintParsedAsRange, { from: fromLabel, to: toLabel });
    return {
      range: { since, until },
      titleKind: 'day',
      parsedAs,
    };
  }

  const parsed = parseDayToken(raw, now);
  const titleKind: ReportTitleKind = /^(today)$/i.test(raw) ? 'today' : 'day';
  return {
    range: dayRangeFromLocalDate(parsed.date),
    titleKind,
    parsedAs: parsed.parsedAs ? tmpl(ui.hintParsedAs, { parsed: parsed.parsedAs }) : undefined,
  };
}

function dayMonthRangeFromLocalMonth(year: number, month1to12: number): IsoTimeRange {
  const start = new Date(year, month1to12 - 1, 1, 0, 0, 0, 0);
  const since = start.toISOString();
  const until = new Date(year, month1to12, 1, 0, 0, 0, 0).toISOString(); // first of next month
  return { since, until };
}

export function parseWeekTimeSelection(params: {
  input?: string;
  from?: string;
  to?: string;
  now?: Date;
}): ParsedRange {
  const ui = getUiMessages();
  const now = params.now ?? new Date();
  const input = params.input?.trim();
  const from = params.from?.trim();
  const to = params.to?.trim();

  const hasFromTo = from !== undefined || to !== undefined;
  const hasInput = input !== undefined && input !== '';
  if (hasInput && hasFromTo) {
    throw new Error(ui.errTimeInputAndRangeConflict);
  }
  if (hasFromTo && (from === undefined || to === undefined)) {
    throw new Error(ui.errNeedFromTo);
  }

  if (!hasInput && !hasFromTo) {
    return { range: weekRange(now), titleKind: 'week' };
  }

  const parseTokenToRange = (
    token: string
  ): { range: IsoTimeRange; resolvedLabel: string; needsHint: boolean } => {
    const parsed = parseIsoWeekToken(token, now);
    const utcStart = isoWeekStartUtc(parsed.year, parsed.week);
    // Convert UTC YYYY-MM-DD to local midnight
    const localStart = new Date(
      utcStart.getUTCFullYear(),
      utcStart.getUTCMonth(),
      utcStart.getUTCDate(),
      0,
      0,
      0,
      0
    );
    const localEnd = addDaysLocal(localStart, 7);
    const resolvedLabel = `${parsed.year}-W${String(parsed.week).padStart(2, '0')}`;
    const needsHint = Boolean(parsed.parsedAs);
    return {
      range: { since: localStart.toISOString(), until: localEnd.toISOString() },
      resolvedLabel,
      needsHint,
    };
  };

  if (hasFromTo) {
    const fromParsed = parseTokenToRange(from!);
    const toParsed = parseTokenToRange(to!);

    const since = fromParsed.range.since;
    const until = toParsed.range.until; // since->exclusive next Monday of to week

    const parsedAs =
      fromParsed.needsHint || toParsed.needsHint
        ? tmpl(ui.hintParsedAsRange, {
            from: fromParsed.resolvedLabel,
            to: toParsed.resolvedLabel,
          })
        : undefined;
    return { range: { since, until }, titleKind: 'week', parsedAs };
  }

  const parsed = parseIsoWeekToken(input!, now);
  const cur = localMidnight(now);
  if (/^(thisweek)$/i.test(input!)) {
    // Align with existing "this week until tomorrow 00:00" behaviour
    const range = weekRange(cur);
    return {
      range,
      titleKind: 'week',
      parsedAs: parsed.parsedAs ? tmpl(ui.hintParsedAs, { parsed: parsed.parsedAs }) : undefined,
    };
  }
  if (/^(lastweek|last)$/i.test(input!)) {
    const currentMonday = addDaysLocal(cur, -((cur.getDay() + 6) % 7));
    const lastMonday = addDaysLocal(currentMonday, -7);
    const since = lastMonday.toISOString();
    const until = currentMonday.toISOString();
    return {
      range: { since, until },
      titleKind: 'week',
      parsedAs: parsed.parsedAs ? tmpl(ui.hintParsedAs, { parsed: parsed.parsedAs }) : undefined,
    };
  }

  const utcStart = isoWeekStartUtc(parsed.year, parsed.week);
  const localStart = new Date(
    utcStart.getUTCFullYear(),
    utcStart.getUTCMonth(),
    utcStart.getUTCDate(),
    0,
    0,
    0,
    0
  );
  const localEnd = addDaysLocal(localStart, 7);
  return {
    range: { since: localStart.toISOString(), until: localEnd.toISOString() },
    titleKind: 'week',
    parsedAs: parsed.parsedAs ? tmpl(ui.hintParsedAs, { parsed: parsed.parsedAs }) : undefined,
  };
}

export function parseMonthTimeSelection(params: {
  input?: string;
  from?: string;
  to?: string;
  now?: Date;
}): ParsedRange {
  const ui = getUiMessages();
  const now = params.now ?? new Date();
  const input = params.input?.trim();
  const from = params.from?.trim();
  const to = params.to?.trim();

  const hasFromTo = from !== undefined || to !== undefined;
  const hasInput = input !== undefined && input !== '';
  if (hasInput && hasFromTo) {
    throw new Error(ui.errTimeInputAndRangeConflict);
  }
  if (hasFromTo && (from === undefined || to === undefined)) {
    throw new Error(ui.errNeedFromTo);
  }

  if (!hasInput && !hasFromTo) {
    return { range: monthRange(now), titleKind: 'month' };
  }

  const parseTokenToRange = (
    token: string
  ): { range: IsoTimeRange; resolvedLabel: string; needsHint: boolean } => {
    const parsed = parseMonthToken(token, now);
    const range = dayMonthRangeFromLocalMonth(parsed.year, parsed.month1to12);
    const resolvedLabel = `${parsed.year}-${String(parsed.month1to12).padStart(2, '0')}`;
    return { range, resolvedLabel, needsHint: Boolean(parsed.parsedAs) };
  };

  if (hasFromTo) {
    const fromParsed = parseTokenToRange(from!);
    const toParsed = parseTokenToRange(to!);
    const since = fromParsed.range.since;
    const until = toParsed.range.until;
    const parsedAs =
      fromParsed.needsHint || toParsed.needsHint
        ? tmpl(ui.hintParsedAsRange, { from: fromParsed.resolvedLabel, to: toParsed.resolvedLabel })
        : undefined;
    return { range: { since, until }, titleKind: 'month', parsedAs };
  }

  const raw = input!;
  const rangeShorthand = /^(\d{1,2})-(\d{1,2})$/.exec(raw);
  if (rangeShorthand) {
    const cur = localMidnight(now);
    const year = cur.getFullYear();
    const fromM = Number(rangeShorthand[1]);
    const toM = Number(rangeShorthand[2]);
    if (!(fromM >= 1 && fromM <= 12) || !(toM >= 1 && toM <= 12)) {
      throw new Error(tmpl(ui.errInvalidMonthInput, { input: raw }));
    }
    const since = dayMonthRangeFromLocalMonth(year, fromM).since;
    const until = dayMonthRangeFromLocalMonth(year, toM).until;
    const parsedAs = tmpl(ui.hintParsedAsRange, {
      from: `${year}-${String(fromM).padStart(2, '0')}`,
      to: `${year}-${String(toM).padStart(2, '0')}`,
    });
    return { range: { since, until }, titleKind: 'month', parsedAs };
  }

  const parsed = parseMonthToken(raw, now);
  if (/^(thismonth)$/i.test(raw)) {
    return {
      range: monthRange(now),
      titleKind: 'month',
      parsedAs: parsed.parsedAs ? tmpl(ui.hintParsedAs, { parsed: parsed.parsedAs }) : undefined,
    };
  }
  if (/^(lastmonth|last)$/i.test(raw)) {
    const d = localMidnight(now);
    const prevMonth = new Date(d.getFullYear(), d.getMonth() - 1, 1, 0, 0, 0, 0);
    const curMonth = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
    return {
      range: { since: prevMonth.toISOString(), until: curMonth.toISOString() },
      titleKind: 'month',
      parsedAs: parsed.parsedAs ? tmpl(ui.hintParsedAs, { parsed: parsed.parsedAs }) : undefined,
    };
  }

  // exact month (or fuzzy month with inferred year)
  return {
    range: dayMonthRangeFromLocalMonth(parsed.year, parsed.month1to12),
    titleKind: 'month',
    parsedAs: parsed.parsedAs ? tmpl(ui.hintParsedAs, { parsed: parsed.parsedAs }) : undefined,
  };
}
