# Worklog CLI 设计

命令结构：

```
worklog <command> [options]
```

---

# Commands

## 今日日报

```
worklog today
```

---

## 指定日期

```
worklog day --date 2026-03-10
```

---

## 周报

```
worklog week
```

---

## 指定仓库

```
worklog today --repo ./project
```

---

# CLI 参数

| 参数         | 说明 |
| ---------- | ---- |
| --repo     | 指定仓库 |
| --date     | 指定日期 |
| --provider | AI 提供方：`openai`（默认）或 `deepseek`，也可通过环境变量 `WORKLOG_PROVIDER` 设置 |
| --since    | 起始时间 |
| --until    | 结束时间 |
| --format   | 输出格式 |

---

# 示例

生成今日日报

```
worklog today
```

生成周报

```
worklog week
```

指定仓库

```
worklog today --repo ~/code/project
```
