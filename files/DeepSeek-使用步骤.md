# Worklog 使用 DeepSeek API — 使用步骤

本文说明如何配置 DeepSeek 官方 API，并用 Worklog 生成日报/周报。

---

## 前置条件

- Node.js ≥ 18
- 已克隆/安装 Worklog 项目
- 拥有 [DeepSeek](https://platform.deepseek.com/) API Key

---

## 1. 安装依赖并构建

```bash
cd /path/to/Worklog
npm install
npm run build
```

构建产物在 `dist/`，CLI 入口为 `dist/cli/index.js`。

---

## 2. 配置环境变量

复制示例配置：

```bash
cp .env.example .env
```

编辑 `.env`，**至少**设置以下内容：

```env
# 指定使用 DeepSeek
WORKLOG_PROVIDER=deepseek

# DeepSeek API Key（必填）
DEEPSEEK_API_KEY=sk-xxxxxxxx

# 可选：不填则默认 deepseek-chat
# WORKLOG_MODEL=deepseek-chat

# 可选：不填则默认 https://api.deepseek.com/v1
# WORKLOG_API_BASE=https://api.deepseek.com/v1
```

说明：

| 变量 | 说明 |
|------|------|
| `WORKLOG_PROVIDER` | 设为 `deepseek` 时使用 DeepSeek 端点与默认模型 |
| `DEEPSEEK_API_KEY` | DeepSeek 控制台创建的 API Key |
| `WORKLOG_API_KEY` | 若未设置 `DEEPSEEK_API_KEY`，会回退读取此变量 |
| `WORKLOG_MODEL` | 默认 `deepseek-chat`，可按需改为其他兼容模型名 |

---

## 3. 运行 CLI

在 ESM 项目下，若 `bin/worklog` 无扩展名导致无法直接 `node bin/worklog`，请使用：

```bash
node dist/cli/index.js <command> [options]
```

### 今日日报

```bash
node dist/cli/index.js today --provider deepseek
```

### 指定仓库

```bash
node dist/cli/index.js today --repo /path/to/your/repo --provider deepseek
```

### 指定日期

```bash
node dist/cli/index.js day --date 2026-03-10 --provider deepseek
```

### 周报

```bash
node dist/cli/index.js week --provider deepseek
```

也可不写 `--provider`，只要在 `.env` 里已设置 `WORKLOG_PROVIDER=deepseek` 即可。

---

## 4. 全局安装后（可选）

若通过 `npm link` 或 `npm install -g` 安装，可直接：

```bash
worklog today --provider deepseek
```

（发布版 `package.json` 的 `bin` 指向 `dist/cli/index.js`，由 npm 处理入口。）

---

## 5. 常见问题

**提示缺少 API Key**  
确认 `.env` 中已设置 `DEEPSEEK_API_KEY` 或 `WORKLOG_API_KEY`，且在当前目录或项目根加载了 `dotenv`（CLI 已内置 `dotenv/config`）。

**请求超时**  
DeepSeek 调用超时时间为 120 秒；网络不稳定时可重试或检查代理。

**仍走 OpenAI 地址**  
检查是否未设置 `WORKLOG_PROVIDER=deepseek`，或命令行未传 `--provider deepseek`。

---

## 相关文档

- [DeepSeek-测试.md](./DeepSeek-测试.md) — 测试项与验证方式
- [CLI.md](./CLI.md) — 命令与参数总览
