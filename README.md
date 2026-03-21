# workpilot

Tell the story of your work through code.  
`workpilot` is an AI CLI that reads Git commits and code changes to produce ready-to-share daily / weekly / monthly reports, and commit messages from diffs.

**Languages:** This file is English by default. [简体中文](README.zh-CN.md)

[![npm version](https://img.shields.io/npm/v/workpilot.svg)](https://www.npmjs.com/package/workpilot)
[![npm downloads](https://img.shields.io/npm/dw/workpilot.svg)](https://www.npmjs.com/package/workpilot)
[![license](https://img.shields.io/npm/l/workpilot.svg)](https://github.com/gaozhixiaopengpeng/work-pilot/blob/main/LICENSE)
[![node](https://img.shields.io/node/v/workpilot.svg)](https://www.npmjs.com/package/workpilot)

---

## Why workpilot

- Less repetitive reporting: turn scattered commits into structured summaries
- Clearer communication: technical changes explained for non-technical readers
- Better commits: diff-based, convention-friendly messages
- Pure CLI: no UI or vendor lock-in; works with local and air-gapped repos

---

## Cost profile (low and predictable)

> On the order of **a few cents per hundred runs** for typical small prompts and light models; actual cost depends on model, tokens, and your gateway.

- Each daily report usually uses a small number of tokens
- Teams can centralize spend via gateway policy
- Start with a small pilot, then tune model and prompts monthly

---

## Quick start (about 30 seconds)

### 1) Install

```bash
npm install -g workpilot
```

### Command names: `workpilot` / `wp`

- **Same binary, two names**: `package.json` `bin` exposes **`workpilot`** and **`wp`**; behavior is identical.
- **Docs**: examples below use `workpilot`; you can substitute **`wp`** anywhere (e.g. `wp day`, `wp commit`).
- **Help**: `workpilot --help` / `wp --help` shows the name you invoked in the usage line.

### 2) API keys (OpenAI and/or DeepSeek)

```bash
# OpenAI (or OpenAI-compatible gateway)
export OPEN_AI_API_KEY=sk-xxx
export OPEN_AI_MODEL=gpt-4o-mini

# DeepSeek
export DEEPSEEK_API_KEY=sk-xxx
export DEEPSEEK_MODEL=deepseek-chat

# Optional default provider
# If unset, a single configured key is auto-detected
export AI_PROVIDER=openai
```

> The CLI reads **`process.env` from your current shell**, not from the project directory.
>
> To persist across new terminals, add the `export` lines to your shell config (not inside a repo):
>
> - bash: `~/.bash_profile` or `~/.bashrc`
> - zsh: `~/.zshrc`
>
> Then open a new terminal or `source` the file you edited.

### 3) Today’s daily report

```bash
workpilot day
```

---

## Common commands

You may replace **`workpilot`** with **`wp`** in any command.

```bash
workpilot day
workpilot day copy
workpilot copy
workpilot day --date 2026-03-10
workpilot week
workpilot month
git add -A
workpilot commit
workpilot commit copy
workpilot day | workpilot copy
```

**`day` / `week` / `month` / `commit`** accept a trailing **`copy`** (e.g. `workpilot week copy`, `workpilot commit --no-commit copy`) to write the **same body** to the system clipboard after printing. **`workpilot copy`** alone reads the local cache (`$XDG_CACHE_HOME/workpilot/last-report.txt`, or `~/.cache/workpilot/last-report.txt` when unset).

---

## Example output

```text
Today's Work Summary:

1. Shipped user login API and tightened error handling
2. Fixed edge cases in checkout flow and added regression checks
3. Improved list rendering; faster first paint
4. Added order state machine and integration tests
```

---

## When it helps

- End-of-day status in minutes
- Weekly reviews and milestones
- Mixed-language teams (Chinese-first reports with optional `--lang` for model output)
- Side projects and steady progress logs

---

## Environment variables

| Variable | Purpose |
|----------|---------|
| `AI_PROVIDER` | `openai` or `deepseek` |
| `OPEN_AI_API_KEY` | OpenAI or compatible gateway key |
| `OPEN_AI_BASE` | Optional compatible base URL |
| `OPEN_AI_MODEL` | Optional model name |
| `DEEPSEEK_API_KEY` | DeepSeek key |
| `DEEPSEEK_MODEL` | Optional DeepSeek model |

Notes:

- `OPEN_AI_BASE` is the OpenAI-compatible base URL; when using the DeepSeek provider, the code may reuse `OPEN_AI_BASE` as `baseURL`. For the official DeepSeek endpoint only, avoid setting `OPEN_AI_BASE`.

Inference:

- No keys → ask to set `OPEN_AI_API_KEY` or `DEEPSEEK_API_KEY`
- Only `OPEN_AI_API_KEY` → `openai`
- Only `DEEPSEEK_API_KEY` → `deepseek`
- Both keys without `AI_PROVIDER` → ask to set `AI_PROVIDER=openai` or `deepseek`

---

## CLI language (UI) vs report language (`--lang`)

- **Terminal UI** (help text, errors, hints, loading lines, and the **printed report title line** before the model output): **English or Chinese** from your OS locale (`LANG` / `LC_*` / `Intl`). Chinese locales → Chinese UI; otherwise English. You usually **do not** need to set these variables manually—the OS or shell sets them; the CLI reads them for POSIX-compatible locale detection.
- **`day` / `week` / `month --lang`**: controls **model-generated report body** language. If omitted, the body language **matches the terminal UI locale** (English UI → English body, Chinese UI → Chinese body). It does **not** switch the CLI chrome or the printed title line (those follow the UI locale above).

---

## Requirements

- Node.js >= 18
- Local Git repository
- GitHub / GitLab (including self-hosted GitLab)

---

## Feedback

- Issues: <https://github.com/gaozhixiaopengpeng/work-pilot/issues>
- Repo: <https://github.com/gaozhixiaopengpeng/work-pilot>

---

## License

MIT
