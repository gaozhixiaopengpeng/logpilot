## workpilot CLI 命令说明（新手版）

**语言：**本页为中文。切换到 [English](CLI-COMMANDS.md)。

本文档面向 **第一次使用 workpilot** 的用户，帮助你快速上手常用命令。

命令名 **`workpilot`** 与短名 **`wp`** 等价（全局安装后均可使用）；下文示例统一写 `workpilot`，你可全部换成 `wp`。

workpilot 是一个命令行工具，用来基于 **Git commit 与代码 diff** 自动生成：

- **工作日报**
- **周报 / 月报**
- **基于 diff 的 commit message**（可交互确认后提交）

---

## 基本前置条件

- **已安装 Node.js（推荐 ≥ 18）**
- 当前目录或指定路径下存在 **Git 仓库**
- 已通过环境变量配置 AI 相关 Key（参见项目根目录 `README.md`）

全局安装后即可使用：

```bash
npm install -g workpilot
```

或者在项目中本地开发：

```bash
npm install
npm run build
node dist/cli/index.js day
```

> 说明：以下示例统一使用 `workpilot` 命令，若你是本地开发未全局安装，可将其替换为 `node dist/cli/index.js`。

---

## 命令总览

- **`workpilot day`**：生成**今日**或**指定日期**的日报
- **`workpilot week`**：生成**本周**工作周报
- **`workpilot month`**：生成**本月**工作月报
- **`workpilot commit`**：根据代码 diff 由 AI 生成 commit message，可选自动提交
- **`workpilot copy`**：将文本写入**系统剪贴板**（管道、`--text`、或复制**最近一次**报表 / **commit message** 等缓存正文）
- **`workpilot day copy` / `week copy` / `month copy` / `commit copy`**：在对应命令输出后**同时**写入剪贴板（`copy` 为命令末尾参数）

所有报表类命令均支持：

- `-r, --repo <path>`：指定要分析的仓库路径（默认当前目录）
- `--lang <code>`：指定输出语言代码（默认 `zh` 中文；若指定为 `en` 等非 `zh`，则**仅输出该语言**）
- `--provider <name>`：指定 AI 提供方，`openai`（默认）或 `deepseek`

---

## 1. 今日日报：`workpilot day`

**作用**：基于「今天」在 Git 仓库中的 commit 与 diff，生成一份工作日报。

**基本用法：**

```bash
workpilot day
```

**常用选项：**

- `-r, --repo <path>`：指定仓库路径  
  ```bash
  workpilot day --repo /path/to/project
  ```

- `--lang <code>`：指定输出语言  
  - 默认：输出中文（`zh`）  
  - 示例：输出英文（仅英文，不再输出中文）  
  ```bash
  workpilot day --lang en
  ```

- `--provider <name>`：切换 AI 提供方  
  ```bash
  workpilot day --provider deepseek
  ```

**典型场景：**

- 每天下班前，在项目根目录执行一次 `workpilot day`，直接复制输出内容到日报系统。

---

## 2. 日报时间选择：`workpilot day [<input>]`

**作用**：生成日报；不填 `<input>` 表示“当天”，填了则按解析规则生成“昨天/任意一天/指定范围”的日报。

### 2.1 单日输入支持

| 输入 | 含义 |
|------|------|
| `today` | 今天 |
| `last` | 昨天（推荐；等价于 `yesterday` alias） |
| `2026-03-12` | 标准格式（推荐） |
| `20260312` | 紧凑格式 |
| `12/03/2026` | 欧式格式 |
| `yesterday` | 昨天（alias，不推荐） |

模糊输入（会先提示你最终解析为哪一天）：

 - `workpilot day 0312`：解析为 `当前年份-03-12`
 - `workpilot day 12`：解析为 `当前年月-12`（且仅允许 `<= 当前日期`）

不支持（歧义过大）：

```text
workpilot day 3/12
```

### 2.2 时间范围（日报）

方式一（推荐）：

```bash
workpilot day --from 2026-03-01 --to 2026-03-10
```

方式二（简写）：

```bash
workpilot day 1-10
```
→ 当前月 1 号到 10 号

### 2.3 解析提示与调试

非精确输入会先在 **stderr** 输出解析结果，例如：

```text
Parsed as: 2026-04-12
```

调试解析（不生成报告）：

```bash
workpilot day 12 --dry-run
```

解析失败会提示 `Did you mean:` 候选项。

### 2.4 兼容旧参数：`--date YYYY-MM-DD`

若仍输入 `--date YYYY-MM-DD`，工具只会提示改用：

```text
workpilot day YYYY-MM-DD
```

并且**不进行解析**旧 `--date` 参数。

### 2.5 示例

```bash
workpilot day
workpilot day last
workpilot day 2026-03-10
workpilot day 0312
workpilot day --from 2026-03-01 --to 2026-03-10
```

---

## 3. 本周周报：`workpilot week`

**作用**：基于本周（周一到当前时间）的所有 commit 与 diff，生成一份周报。

**示例：**

```bash
workpilot week
```

指定仓库与输出语言：

```bash
workpilot week --repo /path/to/project --lang en
```

**周的计算方式（基于本地时间）：**

- 以 **周一** 为一周的开始；  
- 从本周一本地时间 00:00 起，统计到当前这一天结束（本地时间次日 00:00）。

---
### 3.1 周报时间选择：`workpilot week [<input>]`

省略 `<input>` 表示 **本周**（与默认行为一致）。

#### 单值输入（与 `--from/--to` 互斥）

推荐/别名：

```text
last      -> 上一整周（周一–周日）
lastweek  -> last 的别名
thisweek  -> 默认行为的别名
```

ISO 周格式：

```text
16        -> 当前年 ISO 第 16 周
16week    -> 同 16
2026-W16  -> 精确 ISO 周
```

非精确输入会先在 **stderr** 输出 `解析为: ...` 提示，再生成报表正文。

#### 时间范围（周到周）

```bash
workpilot week --from 2026-W10 --to 2026-W16
```

使用 `--from/--to` 时请省略 `<input>`。

#### 调试解析

```bash
workpilot week 16 --dry-run
```

---

## 4. 本月月报：`workpilot month`

**作用**：基于本月（1 号到当前时间）的所有 commit 与 diff，生成一份月度工作总结。

**示例：**

```bash
workpilot month
```

指定仓库与输出语言：

```bash
workpilot month --repo /path/to/project --lang en
```

**月的范围：**

- 从本月 1 号本地时间 00:00 开始；  
- 截止到当前这一天结束（本地时间次日 00:00）。

---
### 4.1 月报时间选择：`workpilot month [<input>]`

省略 `<input>` 表示 **本月**（与默认行为一致）。

#### 单值输入（与 `--from/--to` 互斥）

推荐/别名：

```text
last       -> 上一整月（自然月）
lastmonth  -> last 的别名
thismonth  -> 默认行为的别名
```

月格式：

```text
03        -> 当前年 3 月
3         -> 同 03
2026-03   -> 精确年-月
Mar       -> 当前年 3 月
```

非精确输入会先在 **stderr** 输出 `解析为: ...` 提示，再生成报表正文。

#### 时间范围

范围写法：
```bash
workpilot month --from 2026-01 --to 2026-03
```

简写（仅当前年）：
```bash
workpilot month 1-3
```

使用 `--from/--to` 时请省略 `<input>`。

#### 调试解析

```bash
workpilot month Mar --dry-run
```

#### 示例

```bash
workpilot month last
workpilot month 2026-03
workpilot month 1-3
workpilot month --from 2026-01 --to 2026-03
```

---

## 5. AI 生成 commit message：`workpilot commit`

**作用**：基于当前仓库的代码 diff（工作区或暂存区），调用 AI 生成合适的 commit message，并支持交互确认后执行 `git commit`。

> 建议在进行较大修改或多人协作项目中使用，可以提高 commit message 的质量和一致性。

### 5.1 基本用法

**常见流程：**

```bash
git add -A
workpilot commit
```

交互行为说明（默认模式）：

1. 工具会检测当前仓库的变更状态；
2. 若同时存在暂存区变更，会优先使用暂存区 diff 生成 message；
3. 若只有未暂存变更，会询问你是否先执行 `git add -A`；
4. 若你选择先暂存，则基于暂存区 diff 生成 message，并询问是否提交；
5. 若你选择不暂存，则基于未暂存 diff 生成 message（只展示，不提交）。

### 5.2 重要选项

- `-r, --repo <path>`：指定仓库路径  
  ```bash
  workpilot commit --repo /path/to/project
  ```

- `--staged`：**只使用暂存区 diff**  
  - 适合你已经手动精确暂存了需要提交的文件；  
  - 若暂存区为空但工作区有变更，会提示先暂存后再运行，或去掉 `--staged` 仅生成不提交。  
  ```bash
  workpilot commit --staged
  ```

- `--work`：**只使用未暂存 diff**（仅生成 message，不提交）  
  - 不会执行 `git commit`；  
  - 用于只想看下 AI 建议的提交说明时。  
  ```bash
  workpilot commit --work
  ```

- `--no-commit`：只生成并打印 message，不执行提交  
  - 常用于你想手工调整 message 或用于其他用途。  
  ```bash
  workpilot commit --no-commit
  ```

- `--provider <name>`：切换 AI 提供方  
  ```bash
  workpilot commit --provider deepseek
  ```

- **末尾 `copy`**：展示 AI 生成的 commit message 后，将**过滤后的 message 正文**写入剪贴板（与单独执行 `workpilot copy` 共用缓存）  
  ```bash
  workpilot commit copy
  workpilot commit --no-commit copy
  workpilot commit --work copy
  ```

### 5.3 典型使用场景

- **单次提交，自动生成说明并提交：**

  ```bash
  git add -A
  workpilot commit
  ```

- **仅查看建议 message，不提交：**

  ```bash
  workpilot commit --no-commit
  # 或仅基于未暂存变更：
  workpilot commit --work
  ```

- **精确控制暂存内容后再生成：**

  ```bash
  git add src/index.ts
  git add package.json
  workpilot commit --staged
  ```

---

## 6. 复制到剪贴板：`workpilot copy`

**作用**：把一段文本写入系统剪贴板，便于粘贴到 IM、邮件或日报系统。

### 6.1 生成内容时顺带复制：`day copy` / `week copy` / `month copy` / `commit copy`

在命令**末尾**加上单词 **`copy`**，会在终端照常打印输出后，再把**同一份可复制正文**写入剪贴板：

```bash
workpilot day copy
workpilot week copy
workpilot month copy
workpilot day 2026-03-10 copy
workpilot commit copy
```

> 若误写成 `workpilot day foo`（`foo` 不是 `copy`），工具会提示错误并说明正确用法。`commit` 同理。

### 6.2 生成后再复制：单独执行 `workpilot copy`

先执行 `workpilot day`（或 `week` / `month` / `commit`）看完输出后，**在同一台电脑、同一用户**下再执行：

```bash
workpilot copy
```

此时会复制**最近一次**成功写入缓存的正文（报表全文，或过滤后的 commit message；未生成过时会提示先运行上述命令）。

### 6.3 管道与 `--text`

把前一个命令的标准输出直接复制进剪贴板：

```bash
workpilot day | workpilot copy
workpilot week | workpilot copy
```

直接指定一段文字：

```bash
workpilot copy --text "今日已完成接口联调"
```

### 6.4 说明

- 成功时会在**标准错误**输出一行「已复制到剪贴板」，不会污染管道里上游的纯文本输出。
- **macOS** 使用 `pbcopy`；**Windows** 使用 PowerShell `Set-Clipboard`；**Linux** 依次尝试 `wl-copy`、`xclip`、`xsel`（需已安装其一）。
- 缓存路径：环境变量 **`XDG_CACHE_HOME`** 下的 `workpilot/last-report.txt`；若未设置 `XDG_CACHE_HOME`，一般为 **`~/.cache/workpilot/last-report.txt`**。

---

## 7. 多仓库使用说明

### 7.1 指定本地仓库路径

如果你在一个「非仓库」目录中，也可以通过 `--repo` 指定其他路径：

```bash
workpilot day --repo /path/to/your/git-repo
workpilot week --repo ../another-project
```

> 说明：当前 `--repo` 需要是**本地 Git 仓库路径**。若你想分析 GitHub/GitLab 仓库，请先将其 clone 到本地再执行命令。

---

## 8. 常见问题（FAQ）

- **Q1：为什么运行命令时提示没有 commit？**  
**A：** workpilot 只会基于已有的 Git 提交记录生成报告。请确认：
  - 当前（或指定的）仓库已经初始化为 Git 仓库；
  - 在目标时间范围内（例如今天）确实有 commit；
  - 你传入的日期输入格式正确（例如 `YYYY-MM-DD`）。

- **Q2：为什么 AI 相关命令失败或提示 Key / 提供方错误？**  
  **A：** 请检查环境变量是否已正确配置：
  - `OPEN_AI_API_KEY` / `DEEPSEEK_API_KEY` 至少需要配置一个（两个都未配置会提示先配置 Key）；
  - 如果同时配置了两个 Key，请显式设置 `AI_PROVIDER=openai` 或 `AI_PROVIDER=deepseek`；
  - 如有自定义网关，请确认 `OPEN_AI_BASE` 正确。

- **Q3：报表是用什么语言生成的？能否只要英文？**  
  **A：**
  - 默认输出中文（`zh`）；
  - 通过 `--lang en` 会切换为**仅输出英文**（不再输出中文）；
  - 其他语言同理：`--lang ja` / `--lang fr` 等。

- **Q4：`workpilot commit` 会不会自动提交我不想提交的内容？**  
  **A：**
  - 若你使用 `--staged`，只会基于暂存区内容生成并提交；
  - 若未指定 `--staged/--work`，工具会提示你是否先 `git add -A`；
  - 在真正执行 `git commit` 前，会先展示生成的 message，并询问是否确认提交；
  - 使用 `--no-commit` 或 `--work` 时，**不会执行提交**。

---

## 9. 推荐使用习惯

- 每次完成一小块功能：
  1. `git add .`
  2. `workpilot commit`（生成并确认提交说明）
- 每天结束前：
  - 在项目根目录执行 `workpilot day`，或使用 `workpilot day | workpilot copy` 直接写入剪贴板，再粘贴到你的日报系统；
- 每周 / 每月总结：
  - 使用 `workpilot week` / `workpilot month`，快速整理阶段性成果。

掌握以上命令后，你已经可以在日常开发中高效地使用 workpilot 生成 commit message 和各类工作报告了。

