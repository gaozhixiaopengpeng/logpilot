## workpilot CLI Command Reference (Beginner-friendly)

**Language:** This page is English. Switch to [中文](CLI-COMMANDS.zh-CN.md).

This document is for users who are using workpilot for the first time. It helps you quickly get started with the most common commands.

The command name `workpilot` is equivalent to the short name `wp` (after global installation they both work). In the examples below, we consistently use `workpilot`; you can replace it with `wp` if you prefer.

workpilot is a CLI tool that automatically generates, based on your **Git commits and code diffs**:

- Daily work reports
- Weekly / monthly reports
- Diff-based commit messages (with interactive confirmation before committing)

---

## Basic prerequisites

- Node.js installed (recommended >= 18)
- A Git repository exists in the current directory (or at a specified path)
- AI-related keys are configured via environment variables (see the project root `README.md`)

After global installation, you can use it:

```bash
npm install -g workpilot
```

Or for local development in this project:

```bash
npm install
npm run build
node dist/cli/index.js day
```

> Note: The examples below use the `workpilot` command. If you are developing locally without global installation, you can replace `workpilot` with `node dist/cli/index.js`.

---

## Command overview

- `workpilot day`: generate a **daily** work report for today or a specified date
- `workpilot week`: generate a **weekly** work report
- `workpilot month`: generate a **monthly** work report
- `workpilot commit`: generate an AI commit message from your code diff, with optional auto commit
- `workpilot copy`: write text into your system clipboard (via pipe, `--text`, or the cached body of the **most recent** report / commit message)
- `workpilot day copy` / `week copy` / `month copy` / `commit copy`: after the corresponding command outputs, also write the copyable content to the clipboard (where `copy` is the command's last argument)

All report commands support:

- `-r, --repo <path>`: specify the repository path to analyze (default: current directory)
- `--lang <code>`: specify the output language code (default: `zh` / Chinese). If you pass a non-`zh` value like `en`, it will output **only that language**
- `--provider <name>`: specify the AI provider: `openai` (default) or `deepseek`

---

## 1. Daily report: `workpilot day`

**Purpose**: Based on “today” commits and diffs in your Git repository, generate a daily work report.

**Basic usage**:

```bash
workpilot day
```

**Common options**:

- `-r, --repo <path>`: specify repository path

  ```bash
  workpilot day --repo /path/to/project
  ```

- `--lang <code>`: specify output language

  - Default: output Chinese (`zh`)
  - Example: output English (only English; no Chinese will be included)

  ```bash
  workpilot day --lang en
  ```

- `--provider <name>`: switch AI provider

  ```bash
  workpilot day --provider deepseek
  ```

**Typical scenarios**:

- Before you leave work, run `workpilot day` at your project root, then directly copy the output into your daily report system.

---

## 2. Daily report time selection: `workpilot day [<input>]`

**Purpose**: Generate a daily report. If you omit `<input>`, it means “today”. If you provide `<input>`, the tool uses the parsing rules to generate “yesterday / any single day / a specified range”.

### 2.1 Single-day input

Recommended inputs (all interpreted in your local timezone):

| Input | Meaning |
|------|---------|
| `today` | Today |
| `last` | Yesterday (recommended; same as `yesterday` alias) |
| `2026-03-12` | Standard format (recommended) |
| `20260312` | Compact format |
| `12/03/2026` | European format |
| `yesterday` | Yesterday (alias, not recommended) |

Fuzzy inputs (the tool will show you what it parsed as):

- `workpilot day 0312` → `current_year-03-12`
- `workpilot day 12` → `current_year-current_month-12` (only allowed if `<= current date`)

Not supported (too ambiguous):

```text
workpilot day 3/12
```

### 2.2 Time range (daily)

Way 1 (recommended):

```bash
workpilot day --from 2026-03-01 --to 2026-03-10
```

Way 2 (shorthand):

```bash
workpilot day 1-10
```
→ 1st to 10th of the current month

### 2.3 Parsing hint and debug

All non-exact inputs show the parsed result first (to **stderr**), for example:

```text
Parsed as: 2026-04-12
```

Debug parsing (no report generation):

```bash
workpilot day 12 --dry-run
```

If parsing fails, it will show `Did you mean:` candidates.

### 2.4 Backward compatibility: `--date YYYY-MM-DD`

If you still pass `--date YYYY-MM-DD`, the tool will only suggest switching to:

```text
workpilot day YYYY-MM-DD
```

and it will **not parse** the old `--date` parameter.

### 2.5 Examples

```bash
workpilot day
workpilot day last
workpilot day 2026-03-10
workpilot day 0312
workpilot day --from 2026-03-01 --to 2026-03-10
```

---

## 3. Weekly report: `workpilot week`

**Purpose**: Based on all commits and diffs in the current week (from Monday to now), generate a weekly work report.

**Example**:

```bash
workpilot week
```

Specify repository and output language:

```bash
workpilot week --repo /path/to/project --lang en
```

**Week definition (based on local time)**:

- The week starts on **Monday**
- From **00:00 of this week** (local time) until the end of **today** (local time next day 00:00)

### 3.1 Weekly time selection: `workpilot week [<input>]`

If you omit `<input>`, it means **this week**.

#### Single input (mutually exclusive with `--from/--to`)

Recommended / aliases:

```text
last      -> previous full week (Mon–Sun)
lastweek  -> alias of last
thisweek  -> alias of the default behavior
```

ISO week formats:

```text
16        -> ISO week 16 of the current year
16week    -> same as 16
2026-W16  -> exact ISO week
```

Non-exact inputs will print a `Parsed as: ...` hint (to **stderr**) before the report.

#### Time range (week-to-week)

```bash
workpilot week --from 2026-W10 --to 2026-W16
```

When using `--from/--to`, omit `<input>`.

#### Debug parsing

```bash
workpilot week 16 --dry-run
```

---

## 4. Monthly report: `workpilot month`

**Purpose**: Based on all commits and diffs in the current month (from the 1st to now), generate a monthly work summary.

**Example**:

```bash
workpilot month
```

Specify repository and output language:

```bash
workpilot month --repo /path/to/project --lang en
```

**Month range**:

- From **00:00 on the 1st of this month** (local time)
- Until the end of **today** (local time next day 00:00)

---
### 4.1 Monthly time selection: `workpilot month [<input>]`

If you omit `<input>`, it means **this month**.

#### Single input (mutually exclusive with `--from/--to`)

Recommended / aliases:

```text
last       -> previous full calendar month
lastmonth  -> alias of last
thismonth  -> alias of the default behavior
```

Month formats:

```text
03        -> March of the current year
3         -> same as 03
2026-03   -> exact year-month
Mar       -> March of the current year
```

Non-exact inputs will print a `Parsed as: ...` hint (to **stderr**) before the report.

#### Time range

Range syntax:
```bash
workpilot month --from 2026-01 --to 2026-03
```

Shorthand (current year only):
```bash
workpilot month 1-3
```

When using `--from/--to`, omit `<input>`.

#### Debug parsing

```bash
workpilot month Mar --dry-run
```

#### Examples

```bash
workpilot month last
workpilot month 2026-03
workpilot month 1-3
workpilot month --from 2026-01 --to 2026-03
```

---

## 5. AI-generated commit message: `workpilot commit`

**Purpose**: Based on the current repository's code diff (working directory or staging area), call the AI to generate an appropriate commit message, and support interactive confirmation before running `git commit`.

> Recommended for larger refactors or collaborative projects, where it can improve the quality and consistency of commit messages.

### 5.1 Basic usage

**Typical workflow**:

```bash
git add -A
workpilot commit
```

Interactive behavior (default mode):

1. The tool checks the current repository status.
2. If there are staging-area changes at the same time, it will prioritize the staging diff to generate the message.
3. If there are only unstaged changes, it will ask whether you should run `git add -A` first.
4. If you choose to stage first, it will generate a message based on the staging diff, and then ask whether you want to commit.
5. If you choose not to stage, it will generate the message based on the unstaged diff (show only; no commit).

### 5.2 Important options

- `-r, --repo <path>`: specify repository path

  ```bash
  workpilot commit --repo /path/to/project
  ```

- `--staged`: **use only the staging area diff**

  - Good if you have already precisely staged the files you want to commit.
  - If the staging area is empty but the working directory has changes, it will prompt you to stage first, or you can remove `--staged` to generate a message without committing.

  ```bash
  workpilot commit --staged
  ```

- `--work`: **use only the unstaged diff** (generate message only; no commit)

  - It will not run `git commit`.
  - Use it when you only want to review the AI suggestion.

  ```bash
  workpilot commit --work
  ```

- `--no-commit`: generate and print the message only (do not commit)

  - Useful when you want to manually edit the message or use it for other purposes.

  ```bash
  workpilot commit --no-commit
  ```

- `--provider <name>`: switch AI provider

  ```bash
  workpilot commit --provider deepseek
  ```

- **Trailing `copy`**: after showing the AI-generated commit message, write the **filtered commit message body** to the clipboard (sharing the same cache as `workpilot copy`)

  ```bash
  workpilot commit copy
  workpilot commit --no-commit copy
  workpilot commit --work copy
  ```

### 5.3 Typical usage scenarios

- **Single commit with auto-generated message and commit**

  ```bash
  git add -A
  workpilot commit
  ```

- **Only view the suggested message (no commit)**

  ```bash
  workpilot commit --no-commit
  # or only generate based on unstaged changes:
  workpilot commit --work
  ```

- **Precisely control what you staged, then generate**

  ```bash
  git add src/index.ts
  git add package.json
  workpilot commit --staged
  ```

---

## 6. Copy to clipboard: `workpilot copy`

**Purpose**: Write a piece of text into your system clipboard so you can paste it into IMs, emails, or daily report systems.

### 6.1 Copy while generating: `day copy` / `week copy` / `month copy` / `commit copy`

Add the word **`copy`** at the end of the command. It will print the normal terminal output first, and then write the **same copyable content** to the clipboard:

```bash
workpilot day copy
workpilot week copy
workpilot month copy
workpilot day 2026-03-10 copy
workpilot commit copy
```

> If you accidentally write `workpilot day foo` (where `foo` is not `copy`), the tool will show an error and explain the correct usage. The same applies to `commit`.

### 6.2 Generate first, then copy: run `workpilot copy` by itself

First run `workpilot day` (or `week` / `month` / `commit`) and review the output. Then, on the same machine and same user:

```bash
workpilot copy
```

It will copy the **most recently successfully cached** content (the full report text, or the filtered commit message body). If you haven't generated anything yet, it will prompt you to run the commands above first.

### 6.3 Pipes and `--text`

Copy the standard output of the previous command into the clipboard:

```bash
workpilot day | workpilot copy
workpilot week | workpilot copy
```

Copy a direct text string:

```bash
workpilot copy --text "Today I finished API interface integration"
```

### 6.4 Notes

- On success, it prints one line like “Copied to clipboard” to **stderr**, so it won't pollute the upstream pure text stream in a pipe.
- macOS uses `pbcopy`; Windows uses PowerShell `Set-Clipboard`; Linux tries `wl-copy`, `xclip`, `xsel` in order (you need to have at least one installed).
- Cache path: `workpilot/last-report.txt` under environment variable `XDG_CACHE_HOME`. If `XDG_CACHE_HOME` is not set, it's usually `~/.cache/workpilot/last-report.txt`.

---

## 7. Multi-repository usage

### 7.1 Specify a local repository path

If you're in a directory that isn't a Git repository, you can still use `--repo` to analyze other paths:

```bash
workpilot day --repo /path/to/your/git-repo
workpilot week --repo ../another-project
```

> Note: The `--repo` you pass must be a **local Git repository path**. If you want to analyze a GitHub/GitLab repository, clone it locally first.

---

## 8. Frequently asked questions (FAQ)

- **Q1: Why does it say “no commit” when I run the command?**

  **A:** workpilot only generates reports based on existing Git commit history. Please confirm:

  - The (specified) repository is initialized as a Git repository.
  - In the target time range (e.g., “today”), there are actually commits.
 - Your date input format is correct (e.g. `YYYY-MM-DD`).

- **Q2: Why do AI-related commands fail, or show Key/provider errors?**

  **A:** Check your environment variable configuration:

  - `OPEN_AI_API_KEY` / `DEEPSEEK_API_KEY` need at least one to be set (if both are missing, it will ask you to configure a key first).
  - If you set both keys, explicitly set `AI_PROVIDER=openai` or `AI_PROVIDER=deepseek`.
  - If you have a custom gateway, confirm `OPEN_AI_BASE`.

- **Q3: What language is the report generated in? Can it be only English?**

  **A:**

  - Default output is Chinese (`zh`).
  - Passing `--lang en` switches to **only English output** (no Chinese).
  - Other languages work the same way: `--lang ja` / `--lang fr`, etc.

- **Q4: Will `workpilot commit` automatically commit content that I don't want?**

  **A:**

  - If you use `--staged`, it will only generate and commit based on the staging area.
  - If you didn't specify `--staged/--work`, the tool will ask you whether to run `git add -A` first.
  - Before it actually runs `git commit`, it will show the generated message and ask for confirmation.
  - Using `--no-commit` or `--work` means it **won't** run the commit.

---

## 9. Recommended usage habits

- For each small chunk of work:
  1. `git add .`
  2. `workpilot commit` (generate and confirm the commit message)
- Before the end of the day:
  - Run `workpilot day` in your project root, or use `workpilot day | workpilot copy` to write directly to the clipboard and paste into your daily report system.
- Weekly / monthly summaries:
  - Use `workpilot week` / `workpilot month` to quickly summarize your progress and outcomes.

Once you understand the commands above, you can efficiently use workpilot in daily development to generate commit messages and various work reports.

