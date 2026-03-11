# Worklog DeepSeek API — 测试文档

本文记录使用 DeepSeek 作为 AI 提供方时的测试范围、步骤与通过标准。

---

## 测试目标

验证在 `WORKLOG_PROVIDER=deepseek`（或 `--provider deepseek`）时：

1. 能正确解析 DeepSeek 端点与 API Key  
2. 能成功调用 `chat/completions` 并返回非空正文  
3. CLI 日报/周报流程可端到端跑通  

---

## 环境准备

| 项 | 要求 |
|----|------|
| Node | ≥ 18 |
| 网络 | 可访问 `https://api.deepseek.com` |
| 密钥 | 有效的 `DEEPSEEK_API_KEY`（或等效的 `WORKLOG_API_KEY`） |

```bash
npm install && npm run build
```

---

## 测试用例

### TC-1：环境变量与端点解析

**目的**：确认选择 `deepseek` 时使用 DeepSeek 默认 baseURL 与模型。

**步骤**：

1. `.env` 设置：
   - `WORKLOG_PROVIDER=deepseek`
   - `DEEPSEEK_API_KEY=<有效 key>`
   - 不设置 `WORKLOG_API_BASE`（应使用 `https://api.deepseek.com/v1`）
   - 不设置 `WORKLOG_MODEL`（应使用 `deepseek-chat`）

2. 执行一次会触发 AI 的命令（见 TC-2）。

**通过标准**：请求成功且无 404/401（说明 baseURL 与 Key 正确）。

---

### TC-2：今日日报（端到端）

**命令**：

```bash
node dist/cli/index.js today --repo . --provider deepseek
```

**通过标准**：

- 进程退出码为 `0`
- 标准输出包含「今日」相关标题及 AI 生成的工作总结正文（非空）
- 无未捕获异常

**实测记录（示例）**：

- 执行环境：Worklog 本仓库  
- 结果：成功输出多段工作总结列表  
- 耗时：约数秒～十余秒（视 diff 大小与网络而定）

---

### TC-3：命令行覆盖提供方

**目的**：未在 `.env` 写 `WORKLOG_PROVIDER` 时，`--provider deepseek` 仍生效。

**步骤**：

1. 临时注释或删除 `.env` 中的 `WORKLOG_PROVIDER`（保留 `DEEPSEEK_API_KEY`）
2. 执行：

```bash
node dist/cli/index.js today --repo . --provider deepseek
```

**通过标准**：与 TC-2 相同，且确认请求发往 DeepSeek（可通过代理/日志或 Key 仅对 DeepSeek 有效来间接验证）。

---

### TC-4：缺少 Key 时的行为

**步骤**：

1. 临时移除 `DEEPSEEK_API_KEY` / `WORKLOG_API_KEY` / `OPENAI_API_KEY`
2. 执行：

```bash
node dist/cli/index.js today --repo . --provider deepseek
```

**通过标准**：

- 不崩溃；stderr 出现与 DeepSeek Key 相关的提示
- 若仓库内有 commit，应回退为基于 commit message 的本地摘要（`fallbackReport`）

---

### TC-5：周报

**命令**：

```bash
node dist/cli/index.js week --repo . --provider deepseek
```

**通过标准**：退出码 0，输出周报正文；所选时间范围内无 commit 时输出提示文案即可。

---

## 回归说明

- AI 模块实现位置：`src/ai/summarize.ts`  
- DeepSeek 分支使用 OpenAI 兼容的 `POST .../chat/completions`，与官方文档一致即可长期兼容。  
- 若 DeepSeek 调整域名或模型名，可仅通过环境变量 `WORKLOG_API_BASE` / `WORKLOG_MODEL` 覆盖，无需改代码即可复测 TC-1～TC-3。

---

## 相关文档

- [DeepSeek-使用步骤.md](./DeepSeek-使用步骤.md) — 配置与日常用法
- [CLI.md](./CLI.md) — 全部 CLI 参数
