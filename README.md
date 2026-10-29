# 🐾 Antigravity Quota Monitor (实时配额与回血监视器)

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-orange.svg)](https://github.com/AeternaYuri/antigravity-quota-monitor/pulls)

**专为 Google Antigravity 设计的超轻量、零配置、高颜值实时额度与回血倒计时监控工具** 🐾

[English Documentation](#-english-brief) · [快速上手](#-快速安装) · [接口文档](#-api-与开发者接口)

</div>

---

## 🌟 为什么需要它？

在使用 Google Antigravity 进行日常 AI 结对编程与自动化任务时，许多开发者常常面临这些困扰：
- *“我今天当前的 Gemini 3.8 Flash 额度还剩多少？还能问多少轮？”*
- *“额度用完了，到底什么时候才能回血恢复（Reset Time）？”*
- *“Claude 深度思考配额与 Prompt/Flow 积分到底怎么分布的？”*

受 DeepSeek Harness 优秀的配额插件 `dsh-provider-quota` 启发，我们为 Google Antigravity 打造了这款原生深度适配的实时监视器！

---

## ✨ 核心特性

- ⚡ **零配置全自动探测**：启动即自动侦测本地常驻的 Antigravity 核心语言服务，**无需填写任何 API Key**，开箱即用。
- 🛡️ **严格隐私脱敏保护**：所有数据均在本地环回网络（`127.0.0.1`）流转，绝不向第三方上传任何信息；看板支持**一键邮箱脱敏脱密**（如 `lu***@gmail.com`），录屏分享无压力。
- 📊 **全模型独立配额跟踪**：
  - **Gemini 3.8 / 2.5 Flash 系列**：主力对话与代码生成配额
  - **Claude 4.6 (Sonnet / Opus)**：深度推理与复杂架构配额
  - **GPT-OSS 120B**：开源大模型集群配额
- ⏳ **秒级回血倒计时**：实时读取底层滑动窗口的 `resetTime`，动态精确显示距离配额恢复的小时与分钟。
- 🪙 **全盘点账户积分**：清晰展示 Prompt 基础积分与 Flow 自动化积分的可用余额及月度总量。
- 🔔 **低配额告警机制**：配额低于 20% 时自动切换黄红预警色，支持低配额提示音与模型切换指引。

---

## 🎮 多种使用场景

本项目提供丰富的使用姿态，满足你不同的使用习惯：

```
+-------------------------------------------------------------------------+
|                  Antigravity Quota Monitor 核心服务                      |
+-------------------+--------------------+------------------+-------------+
| 1. IDE 辅助面板    | 2. 独立桌面看板     | 3. MCP 智能协议  | 4. 终端命令行|
| (Auxiliary Pane)  | (Web Dashboard)    | (AI Agent Tool)  | (CLI Tool)  |
| 侧边栏一键滑出查看 | 浏览器/浮窗常驻    | 聊天随口问额度   | 终端彩色打印 |
+-------------------+--------------------+------------------+-------------+
```

---

## 🚀 快速安装

### 前提条件
- 已安装 [Node.js](https://nodejs.org/) (推荐 v18+ 或更高版本)
- 正在运行 Google Antigravity

### 方式一：一键自动安装为 Antigravity 插件（推荐）

1. 克隆本项目：
   ```bash
   git clone https://github.com/AeternaYuri/antigravity-quota-monitor.git
   cd antigravity-quota-monitor
   ```

2. 运行一键安装脚本：
   - **Windows**：双击运行 `install.bat`
   - **Linux / macOS**：
     ```bash
     chmod +x install.sh
     ./install.sh
     ```

3. 安装完成后，在 Antigravity 聊天窗口中点击链接即可在右侧侧边栏唤出面板：
   ```markdown
   [打开额度监视器](sidecar://antigravity-quota-monitor/quota_viewer/)
   ```

---

### 方式二：独立桌面端运行 (Standalone Web)

如果你希望在浏览器或独立浮窗中常驻查看：
- **Windows**：直接双击 `start-standalone.bat`
- **通用命令行**：
  ```bash
  npm start
  ```
浏览器打开：`http://127.0.0.1:39281` 即可体验。

---

### 方式三：终端命令行极速查看 (CLI)

想要在终端扫一眼当前配额？直接运行：
```bash
node src/cli.mjs
# 或者使用 npm 脚本
npm run cli
```
终端将输出优雅的彩色表格与秒级倒计时。

---

## 🔌 API 与开发者接口

服务内置轻量级 REST API，方便二次开发或集成到自定义状态栏、i3blocks、Waybar、Raycast 等小组件中：

### 1. `GET /api/quota`
获取格式化后的当前用户所有模型配额与积分。
- **参数**：
  - `mask=true`（可选）：是否对邮箱脱敏
- **响应示例**：
```json
{
  "ok": true,
  "user": {
    "email": "lu***@gmail.com",
    "planName": "Pro",
    "tier": "TEAMS_TIER_PRO"
  },
  "credits": {
    "promptAvailable": 500,
    "promptMonthly": 50000,
    "flowAvailable": 100,
    "flowMonthly": 150000
  },
  "models": [
    {
      "label": "Gemini 3.8 Flash (High)",
      "fraction": 0.929,
      "percentage": 92.9,
      "resetTime": "2026-10-29T16:53:39Z",
      "resetsInSeconds": 10650,
      "status": "normal",
      "supportsImages": true
    }
  ],
  "timestamp": "2026-10-29T13:58:00.000Z"
}
```

### 2. `GET /api/health`
服务健康检查。

### 3. MCP 工具接口 (`antigravity_quota_mcp`)
通过标准 stdio JSON-RPC 提供 `get_antigravity_quota` 工具，可直接接入任何支持 MCP 协议的 Agent。

---

## 📂 项目结构

```
antigravity-quota-monitor/
├── .github/workflows/          # 自动化语法与跨平台测试工作流
├── src/
│   ├── config.mjs              # 跨平台环境与服务端口自动探测
│   ├── ls_client.mjs           # 与 Antigravity 本地服务通信模块
│   ├── server.mjs              # REST API 与前端静态托管服务
│   ├── mcp_server.mjs          # Model Context Protocol 标准工具服务
│   └── cli.mjs                 # 终端彩色输出命令行工具
├── sidecars/
│   └── quota_viewer/
│       ├── sidecar.json        # Antigravity 侧边栏规范配置
│       ├── server.mjs          # 侧边栏服务入口
│       └── ui.html             # 响应式玻璃拟态监控面板
├── skills/
│   └── antigravity-quota/      # Antigravity 对话技能定义
├── install.bat                 # Windows 一键安装脚本
├── install.sh                  # Unix 一键安装脚本
├── start-standalone.bat        # 独立运行快捷方式
├── package.json
└── README.md
```

---

## 🌐 English Brief

**Antigravity Quota Monitor** is a real-time quota and rolling-window replenish countdown monitor designed specifically for **Google Antigravity**.

### Highlights
- **Zero-Config**: Auto-detects Antigravity's local Language Server on loopback without entering any API keys.
- **Privacy-First**: No data leaves your machine (`127.0.0.1`), with one-click email privacy masking.
- **Multiple Frontends**: Supports Antigravity Auxiliary Pane (Sidecar), Standalone Web UI, Terminal CLI, and MCP Agent Tool.
- **Accurate Countdowns**: Displays exact hours/minutes until rolling quota reset for Gemini 3.8/2.5, Claude 4.6, and GPT-OSS.

---

## 🤝 参与贡献

欢迎提交 Issue 和 Pull Request！如果你有更棒的 UI 想法或适配方案，欢迎随时贡献代码！🐾

## 📄 开源许可证

本项目基于 [MIT 许可证](LICENSE) 开源。
