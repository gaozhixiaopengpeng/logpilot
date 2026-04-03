# workpilot

别再手写日报了。

**语言：**本页为中文。切换到 [English](README.md)。

**workpilot** 是一个 AI CLI，可读取你的 **Git 历史与代码变更**，自动生成：

* 日报
* 周报
* 月度总结
* 清晰的提交信息

全部直接来自你的代码。

```bash
wp day
```

示例输出：

```
今日工作总结：

1. 完成用户登录 API 并加强错误处理
2. 修复结账流程中的边界场景
3. 提升列表渲染性能
4. 新增订单状态机与集成测试
```

---

# 演示

一个典型的开发工作流：

下班前：

```bash
wp day
```

提交前：

```bash
wp commit
```

周回顾：

```bash
wp week
```

无需手写总结，**你的 Git 历史就是工作日志**。

---

# 为什么选择 workpilot

### 把 Git 历史变成报告

自动生成日报、周报和月报。

### 更好的提交信息

基于 Git diff 生成结构化提交信息。

### 为终端工作流而生

只要能运行 Git 的地方都能用：

* 终端
* 脚本
* CI 流水线

### 自带 API Key

无需订阅。
你只需支付 API 调用成本。

---

# 安装

```bash
npm install -g workpilot
```

CLI 提供两个命令名：

```
workpilot
wp
```

二者完全等价。
本 README 使用更短的命令：

```
wp
```

查看帮助：

```bash
wp --help
```

---

# 快速开始

### 1. 设置 API Key

OpenAI：

```bash
export OPEN_AI_API_KEY=sk-xxx
```

DeepSeek：

```bash
export DEEPSEEK_API_KEY=sk-xxx
```

可选：指定服务提供方：

```bash
export AI_PROVIDER=openai
```

提供方选择逻辑：

* 若设置了 `AI_PROVIDER`，workpilot 始终使用 `AI_PROVIDER`。
* 若未设置 `AI_PROVIDER`，按以下顺序选择第一个可用 Key：
  1. `DEEPSEEK_API_KEY`
  2. `OPEN_AI_API_KEY`

若要在不同终端会话中持久生效，可将这些配置写入 shell 配置文件：

* bash -> `~/.bashrc`
* zsh -> `~/.zshrc`

---

### 2. 生成今日日报

```bash
wp day
```

完成。

---

# 命令

## 报告

从 Git 历史生成工作总结。

```bash
wp day
wp week
wp month
wp day --lang zh
```

时间选择：

```bash
# 日报
wp day last                  # 昨天
wp day 2026-03-10           # 精确日期
wp day --from 2026-03-01 --to 2026-03-10

# 周报
wp week last                 # 上一整周（周一–周日）
wp week 2026-W16

# 月报
wp month last                # 上一整月
wp month Mar
```

控制输出语言：

```bash
wp day --lang zh
wp week --lang en
```

---

## 提交信息

基于 Git diff 生成提交信息。

```bash
wp commit
```

仅预览，不执行提交：

```bash
wp commit --no-commit
```

---

## 剪贴板辅助

在命令后追加 `copy` 可将输出复制到剪贴板。

```bash
wp day copy
wp week copy
wp commit copy
```

复制最近一次生成的报告：

```bash
wp copy
```

---

# 集成

Workpilot 可以在生成报告后打开常见协作工具。

```bash
wp day --dingtalk # wp day --dingding
wp week --feishu
wp month --wecom # wp month --weixin
```

> `--dingtalk` 会在生成报告后打开钉钉。`--dingding` 是 `--dingtalk` 的别名。
> `--wecom` 会在生成报告后打开企业微信。`--weixin` 是 `--wecom` 的别名。

支持的集成工具：

- 钉钉
- 飞书
- 企业微信

同时会将报告内容复制到剪贴板，方便快速粘贴。

---

# 示例

生成报告并复制：

```bash
wp day 2026-03-10 copy
```

生成提交信息：

```bash
wp commit
```

---

# 费用

非常低。

典型使用场景下：

* 约 100 次日报通常 **远低于 0.50￥**
* 实际费用取决于模型与 token 使用量

你只需支付 API 提供方费用。

无需订阅。

---

# 配置

可选环境变量。

| 变量名           | 说明                        |
| ---------------- | --------------------------- |
| AI_PROVIDER      | `openai` 或 `deepseek`      |
| OPEN_AI_API_KEY  | OpenAI API Key              |
| OPEN_AI_MODEL    | OpenAI 模型                 |
| OPEN_AI_BASE     | OpenAI 兼容 base URL        |
| DEEPSEEK_API_KEY | DeepSeek API Key            |
| DEEPSEEK_MODEL   | DeepSeek 模型               |

选择优先级：

* `AI_PROVIDER`（若已设置）会覆盖自动选择。
* 否则，使用第一个可用 Key：
  1. `DEEPSEEK_API_KEY`
  2. `OPEN_AI_API_KEY`

---

# 环境要求

* Node.js >= 18
* 本地 Git 仓库

---

# 文档

完整 CLI 参考：

```
docs/CLI-COMMANDS.md
```

---

# 反馈

欢迎提 Issue 和建议。

GitHub Issues：

https://github.com/gaozhixiaopengpeng/work-pilot/issues

项目仓库：

https://github.com/gaozhixiaopengpeng/work-pilot

---

# 许可证

MIT
