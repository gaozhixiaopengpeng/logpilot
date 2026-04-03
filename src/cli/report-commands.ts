import type { Command } from 'commander';
import {
  ARG_POST_ACTION_COPY,
  assertOptionalCopyWord,
  descPostActionCopyReport,
  runWithCopyPostAction,
} from './copy-support.js';
import { defaultReportLanguageCode } from '../i18n/ui-locale.js';
import { getUiMessages } from '../i18n/ui-messages.js';
import {
  runReport,
  type ReportTitleKind,
} from '../report/run-report.js';
import {
  runDingtalkAssist,
  runFeishuAssist,
  runWecomAssist,
} from './dingtalk-command.js';
import {
  parseDayTimeSelection,
  parseMonthTimeSelection,
  parseWeekTimeSelection,
  type IsoTimeRange,
} from '../utils/time-range.js';

type ReportOpts = {
  repo: string;
  provider?: string;
  lang?: string;
  dingtalk?: boolean;
  dingding?: boolean;
  feishu?: boolean;
  wecom?: boolean;
  weixin?: boolean;
};

type ReportAssistKind = 'day' | 'week' | 'month';

function withReportArguments(cmd: Command, description: string): Command {
  const ui = getUiMessages();
  return cmd
    .description(description)
    .argument('[input]', ui.argTimeInput)
    .argument(ARG_POST_ACTION_COPY, descPostActionCopyReport());
}

function withReportOptions(cmd: Command): Command {
  const ui = getUiMessages();
  return cmd
    .option('-r, --repo <path>', ui.optRepoPath, process.cwd())
    .option('--lang <code>', ui.optLangHelp)
    .option('--dingtalk', ui.optDingtalkAssist)
    .option('--dingding', ui.optDingdingCompat)
    .option('--feishu', ui.optFeishuSupport)
    .option('--wecom', ui.optWecomSupport)
    .option('--weixin', ui.optWeixinCompat)
    .option('--provider <name>', ui.optProvider);
}

export function registerReportCommands(
  program: Command,
  cliName: string,
  applyProvider: (provider?: string) => void
): void {
  const ui = getUiMessages();
  function registerOne(
    name: ReportAssistKind,
    description: string,
    promptName: 'daily' | 'weekly' | 'monthly',
    parseFn: (params: {
      input?: string;
      from?: string;
      to?: string;
      now?: Date;
    }) => { range: IsoTimeRange; titleKind: ReportTitleKind; parsedAs?: string },
    supportsDateCompat: boolean,
    lastQuickTokens: string[]
  ) {
    const cmd = program.command(name).description(description);

    const cmdWithArgs = withReportOptions(
      withReportArguments(cmd, description)
        .option('--from <value>', ui.optFrom)
        .option('--to <value>', ui.optTo)
        .option('--dry-run', ui.optDryRun)
    );

    const cmdFinal = supportsDateCompat
      ? cmdWithArgs.option('-d, --date <yyyy-mm-dd>', ui.optDate)
      : cmdWithArgs;

    cmdFinal.action(
      async (
        inputArg: string | undefined,
        postAction: string | undefined,
        opts: ReportOpts & { date?: string; from?: string; to?: string; dryRun?: boolean }
      ) => {
        // commander 会把 "copy" 误认为第一个可选参数
        let input = inputArg;
        let post = postAction;
        if (input === 'copy' && post === undefined) {
          post = 'copy';
          input = undefined;
        }

        try {
          if (supportsDateCompat && opts.date !== undefined) {
            // 兼容提示模式：只做提示，不参与解析
            process.stderr.write(
              ui.msgDateCompatibility
                .replace('{cliName}', cliName)
                .replace('{dateStr}', opts.date) + '\n'
            );
            process.exitCode = 1;
            return;
          }

          const parsed = parseFn({
            input,
            from: opts.from,
            to: opts.to,
          });

          if (opts.dryRun) {
            // dry-run 只输出解析结果，不生成报告，也不写剪贴板
            if (post !== undefined && post !== 'copy') {
              const raw = (input ?? '').trim();
              const isLastMisuse = lastQuickTokens.some(
                (t) => t.toLowerCase() === raw.toLowerCase()
              );
              if (isLastMisuse) {
                process.stderr.write(
                  ui.errLastWithExtraOffset
                    .replace('{cliName}', cliName)
                    .replace('{commandName}', name) +
                    '\n'
                );
                process.exitCode = 1;
                return;
              }
            }
            if (!assertOptionalCopyWord(cliName, post, name)) return;
            process.stdout.write(
              `${parsed.parsedAs ? parsed.parsedAs + '\n' : ''}` +
                `since: ${parsed.range.since}\n` +
                `until: ${parsed.range.until}\n`
            );
            return;
          }

          if (parsed.parsedAs) {
            process.stderr.write(parsed.parsedAs + '\n');
          }

          // last 快捷语义不允许额外偏移（例如 `wp day last 7`）
          if (post !== undefined && post !== 'copy') {
            const raw = (input ?? '').trim();
            const isLastMisuse = lastQuickTokens.some((t) => t.toLowerCase() === raw.toLowerCase());
            if (isLastMisuse) {
              process.stderr.write(
                ui.errLastWithExtraOffset
                  .replace('{cliName}', cliName)
                  .replace('{commandName}', name) +
                  '\n'
              );
              process.exitCode = 1;
              return;
            }
          }

          await runWithCopyPostAction(cliName, name, post, async () => {
            applyProvider(opts.provider);
            const fullText = await runReport(
              opts.repo,
              parsed.range.since,
              parsed.range.until,
              promptName,
              parsed.titleKind,
              opts.lang ?? defaultReportLanguageCode()
            );
            if (opts.dingtalk || opts.dingding) {
              await runDingtalkAssist(fullText, name);
            }
            if (opts.feishu) {
              await runFeishuAssist(fullText, name);
            }
            if (opts.wecom || opts.weixin) {
              await runWecomAssist(fullText, name);
            }
            return fullText;
          });
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          process.stderr.write(msg + '\n');
          process.exitCode = 1;
        }
      }
    );
  }

  registerOne('day', ui.cmdDayDescription, 'daily', parseDayTimeSelection, true, [
    'last',
    'yesterday',
  ]);
  registerOne('week', ui.cmdWeekDescription, 'weekly', parseWeekTimeSelection, false, [
    'last',
    'lastweek',
  ]);
  registerOne('month', ui.cmdMonthDescription, 'monthly', parseMonthTimeSelection, false, [
    'last',
    'lastmonth',
  ]);
}
