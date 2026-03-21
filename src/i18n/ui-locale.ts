export type UiLocale = 'en' | 'zh';

function readLocaleEnv(): string | undefined {
  return (
    process.env.LC_ALL ||
    process.env.LC_MESSAGES ||
    process.env.LANG ||
    process.env.LANGUAGE ||
    undefined
  );
}

function isChineseLocaleTag(tag: string): boolean {
  const base = tag.replace(/_/g, '-').split('.')[0]?.toLowerCase() ?? '';
  return base === 'zh' || base.startsWith('zh-');
}

/**
 * 终端 UI 语言：中文环境为 zh，否则为 en。
 * 与报表 `--lang`（AI 输出语言）无关。
 */
export function resolveUiLocale(): UiLocale {
  const raw = readLocaleEnv();
  if (raw && isChineseLocaleTag(raw)) return 'zh';
  try {
    const resolved = Intl.DateTimeFormat().resolvedOptions().locale;
    if (resolved && isChineseLocaleTag(resolved)) return 'zh';
  } catch {
    /* ignore */
  }
  return 'en';
}
