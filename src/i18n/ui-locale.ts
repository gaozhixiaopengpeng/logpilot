export type UiLocale = 'en' | 'zh';

/**
 * POSIX / glibc 惯例：终端与程序用语言由系统或用户 shell 配置写入这些变量。
 * 一般无需手动设置；未设置时由下方 Intl 回退推断。影响终端 UI；未指定 `--lang` 时亦作为报表正文默认语言。
 */
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

/** 未指定 `--lang` 时，报表正文语言与 {@link resolveUiLocale} 一致 */
export function defaultReportLanguageCode(): string {
  return resolveUiLocale() === 'zh' ? 'zh' : 'en';
}
