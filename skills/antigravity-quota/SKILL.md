---
name: antigravity-quota
description: 实时查询并报告 Google Antigravity 各大模型（Gemini 3.8 Flash、Claude Sonnet 4.6、Claude Opus 4.6、GPT-OSS 等）的剩余额度百分比、滑动窗口重置时间（回血倒计时）与积分余额。当用户询问“还剩多少额度”、“配额查询”、“查一下token额度”或额度不足时使用。
---

# Antigravity Quota Monitor Skill

本技能为用户提供 Google Antigravity 运行时的实时额度查询与监控指引。

## 核心功能

1. **查看当前模型配额百分比**：
   - Gemini 3.8 Flash (High / Medium / Low) 共享配额池
   - Claude 4.6 (Sonnet / Opus) 独立配额池
   - GPT-OSS 120B 独立配额池
2. **滑动窗口重置倒计时**：
   - 提取 `resetTime`，计算精确距离回血的小时和分钟数。
3. **账户积分状态**：
   - Prompt Credits 及 Flow Credits 的当前可用值与月度额度。
4. **侧边栏 UI 面板**：
   - 用户可随时点击 `[打开额度监视器侧边栏](sidecar://antigravity-quota-monitor/quota_viewer/)` 直接在 Antigravity 右侧 Auxiliary Pane 打开实时面板。

## 查询方式

当需要查询额度时，优先调用 `mcp_antigravity_quota_mcp_get_antigravity_quota` 工具，或者通过本地接口查询 Language Server 的 `GetUserStatus`，并以整洁的表格呈现给用户。
如果检测到当前模型额度低于 20%，主动提示用户：
> [!WARNING]
> 当前模型额度剩余不足 20%，建议适度缩减上下文或临时切换至 Claude Sonnet 4.6 / GPT-OSS 避免中断任务。
