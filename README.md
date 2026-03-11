# Worklog

AI 自动生成 Git 工作日报的 CLI 工具。

Worklog 会自动读取你的 Git commit 和代码 diff，然后使用 AI 自动生成：

* 日报
* 周报
* 工作总结

支持：

* 本地 Git 仓库
* GitHub
* GitLab（包括企业内网 GitLab）

非常适合：

* 程序员写日报
* 周报自动生成
* 工作记录沉淀
* 技术工作总结

---

# 功能特性

* 📦 自动读取 Git commit
* 🧠 AI 自动生成日报
* 📅 支持日报 / 周报
* 🖥 CLI 命令行使用
* 🔒 支持企业内网 GitLab
* ⚡ 1 秒生成工作总结

---

# 安装

```bash
npm install -g worklog
```

本地开发（本仓库）：

```bash
npm install
npm run build
node dist/cli/index.js today
# 或 npm link 后直接使用 worklog
```

AI 需要 **OpenAI 兼容 API**。默认提供方为 **OpenAI 兼容**；也可选用 **DeepSeek**。

CLI 会在**当前工作目录**自动加载 `.env`（无需手动 `export`）。复制 `.env.example` 为 `.env` 并填写 Key 即可。

**环境变量：**

| 变量 | 说明 |
|------|------|
| `WORKLOG_PROVIDER` | `openai`（默认）或 `deepseek` |
| `WORKLOG_API_KEY` / `OPENAI_API_KEY` | OpenAI 兼容 API Key |
| `DEEPSEEK_API_KEY` | DeepSeek 专用 Key（可选；不填则用 `WORKLOG_API_KEY`） |
| `WORKLOG_API_BASE` | 自定义网关 Base URL（可选） |
| `WORKLOG_MODEL` | 模型名（可选；openai 默认 `gpt-4o-mini`，deepseek 默认 `deepseek-chat`） |

**命令行临时切换提供方：**

```bash
worklog today --provider deepseek
worklog week --provider openai
```

---

# 使用方法

生成今日工作日报

```bash
worklog today
```

生成指定日期日报

```bash
worklog day --date 2026-03-10
```

生成周报

```bash
worklog week
```

指定仓库路径

```bash
worklog today --repo /path/to/project
```

指定 GitHub 仓库

```bash
worklog today --repo https://github.com/user/project
```

---

# 示例输出

```
今日工作总结

1. 实现用户登录接口
2. 修复支付流程中的异常问题
3. 优化列表页面渲染性能
4. 新增订单状态管理逻辑
```

---

# 工作原理

Worklog 的核心流程：

```
Git commit + diff
      ↓
代码变更分析
      ↓
AI 总结
      ↓
生成日报
```

---

# 支持仓库

| 类型        | 支持 |
| --------- | -- |
| 本地 Git    | ✅  |
| GitHub    | ✅  |
| GitLab    | ✅  |
| 内网 GitLab | ✅  |

---

# 未来计划

* 自动发送日报
* Slack / 钉钉 / 飞书集成
* PR 自动总结
* 工作时间统计
* 团队日报

---

# License

MIT
