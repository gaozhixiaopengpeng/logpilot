# workpilot

Stop writing daily reports manually.

**Language:** This page is English. Switch to [中文](README.zh-CN.md).

**workpilot** is an AI CLI that reads your **Git history and code changes** and generates:

* daily work reports
* weekly summaries
* monthly reviews
* clean commit messages

All directly from your code.

```bash
wp day
```

Example output:

```
Today's Work Summary:

1. Shipped user login API and tightened error handling
2. Fixed edge cases in checkout flow
3. Improved list rendering performance
4. Added order state machine and integration tests
```

---

# Demo

A typical workflow during development:

End of the day:

```bash
wp day
```

Before committing:

```bash
wp commit
```

Weekly review:

```bash
wp week
```

Instead of manually writing reports, **your Git history becomes your work log**.

---

# Why workpilot

### Turn Git history into reports

Generate daily, weekly, and monthly work summaries automatically.

### Better commit messages

Generate structured commit messages from Git diffs.

### Built for terminal workflows

Runs anywhere Git runs:

* terminal
* scripts
* CI pipelines

### Bring your own API key

No subscription required.
You only pay the API cost.

---

# Install

```bash
npm install -g workpilot
```

The CLI exposes two command names:

```
workpilot
wp
```

They are identical.
Examples in this README use the shorter command:

```
wp
```

Check help:

```bash
wp --help
```

---

# Quick Start

### 1. Set API key

OpenAI:

```bash
export OPEN_AI_API_KEY=sk-xxx
```

DeepSeek:

```bash
export DEEPSEEK_API_KEY=sk-xxx
```

Optional provider selection:

```bash
export AI_PROVIDER=openai
```

Provider selection logic:

* If `AI_PROVIDER` is set, workpilot always uses `AI_PROVIDER`.
* If `AI_PROVIDER` is not set, workpilot picks the first available key in this order:
  1. `DEEPSEEK_API_KEY`
  2. `OPEN_AI_API_KEY`

To persist across terminals, add these lines to your shell config:

* bash → `~/.bashrc`
* zsh → `~/.zshrc`

---

### 2. Generate today's report

```bash
wp day
```

Done.

---

# Commands

## Reports

Generate work summaries from Git history.

```bash
wp day
wp week
wp month
wp day --lang zh
```

Specify time selection:

```bash
# Daily
wp day last                  # yesterday
wp day 2026-03-10            # exact day
wp day --from 2026-03-01 --to 2026-03-10

# Weekly
wp week last                 # last full week (Mon–Sun)
wp week 2026-W16

# Monthly
wp month last                # last full month
wp month Mar
```

Control output language:

```bash
wp day --lang zh
wp week --lang en
```

---

## Commit messages

Generate commit messages from Git diffs.

```bash
wp commit
```

Preview without committing:

```bash
wp commit --no-commit
```

---

## Clipboard helpers

Append `copy` to copy output to clipboard.

```bash
wp day copy
wp week copy
wp commit copy
```

Copy the last generated report:

```bash
wp copy
```

---

# Integrations

Workpilot can open common collaboration tools after generating reports.

```bash
wp day --dingtalk # wp day --dingding
wp week --feishu
wp month --wecom # wp month --weixin
```

> `--dingtalk` opens DingTalk after report generation. `--dingding` is an alias of `--dingtalk`.
> `--wecom` opens WeCom after report generation. `--weixin` is an alias of `--wecom`.

Supported integrations:

- DingTalk
- Feishu
- WeCom

The report content is also copied to clipboard for quick paste.

---

# Example

Generate a report and copy it:

```bash
wp day 2026-03-10 copy
```

Generate a commit message:

```bash
wp commit
```

---

# Cost

Very low.

Typical usage:

* ~100 daily reports often cost **well under $0.10**
* depends on model and token usage

You only pay the API provider.

No subscription required.

---

# Configuration

Optional environment variables.

| Variable         | Description                |
| ---------------- | -------------------------- |
| AI_PROVIDER      | `openai` or `deepseek`     |
| OPEN_AI_API_KEY  | OpenAI API key             |
| OPEN_AI_MODEL    | OpenAI model               |
| OPEN_AI_BASE     | OpenAI-compatible base URL |
| DEEPSEEK_API_KEY | DeepSeek API key           |
| DEEPSEEK_MODEL   | DeepSeek model             |

Selection priority:

* `AI_PROVIDER` (if set) overrides auto selection.
* If `AI_PROVIDER` is not set, the first available key is used:
  1. `DEEPSEEK_API_KEY`
  2. `OPEN_AI_API_KEY`

---

# Requirements

* Node.js >= 18
* Local Git repository

---

# Documentation

Full CLI reference:

```
docs/CLI-COMMANDS.md
```

---

# Feedback

Issues and suggestions are welcome.

GitHub Issues:

https://github.com/gaozhixiaopengpeng/work-pilot/issues

Project repository:

https://github.com/gaozhixiaopengpeng/work-pilot

---

# License

MIT
