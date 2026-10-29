import readline from 'node:readline';
import { getFormattedQuota } from './ls_client.mjs';

function formatCountdown(sec) {
  if (sec === null || sec === undefined) return '无需重置';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

async function handleGetQuota(args = {}) {
  const mask = args.mask !== false; // default true for privacy
  const data = await getFormattedQuota({ maskEmail: mask });

  let filter = (args.model || '').toLowerCase();
  const models = data.models.filter(m => !filter || m.label.toLowerCase().includes(filter));

  let text = `### 📊 Google Antigravity 实时配额与回血报告\n`;
  text += `- **当前账号**: ${data.user.email} (${data.user.planName} · ${data.user.tier})\n`;
  text += `- **Prompt 积分**: ${data.credits.promptAvailable.toLocaleString()} / ${data.credits.promptMonthly.toLocaleString()} 月度可用\n`;
  text += `- **Flow 自动化积分**: ${data.credits.flowAvailable.toLocaleString()} / ${data.credits.flowMonthly.toLocaleString()} 月度可用\n\n`;
  text += `| 模型名称 | 剩余配额 | 窗口重置倒计时 | 状态 |\n|---|---|---|---|\n`;

  models.forEach(m => {
    const pct = m.percentage !== null ? `${m.percentage}%` : '100%';
    const cd = formatCountdown(m.resetsInSeconds);
    let tag = '🟢 充沛';
    if (m.status === 'warning') tag = '🟡 偏低';
    if (m.status === 'critical') tag = '🔴 告急';
    text += `| **${m.label}** | **${pct}** | ${cd} | ${tag} |\n`;
  });

  text += `\n*数据源: Antigravity 本地 Language Server 实时同步*`;

  return {
    content: [
      {
        type: 'text',
        text
      }
    ],
    structuredData: {
      user: data.user,
      credits: data.credits,
      models
    }
  };
}

export function startMcpServer() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  function reply(id, result, error = null) {
    const msg = { jsonrpc: '2.0', id };
    if (error) {
      msg.error = error;
    } else {
      msg.result = result;
    }
    process.stdout.write(JSON.stringify(msg) + '\n');
  }

  rl.on('line', async (line) => {
    if (!line.trim()) return;
    try {
      const req = JSON.parse(line);
      const { id, method, params } = req;

      if (method === 'initialize') {
        reply(id, {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: { name: 'antigravity-quota-mcp', version: '1.0.0' }
        });
        return;
      }

      if (method === 'notifications/initialized') return;
      if (method === 'ping') {
        reply(id, {});
        return;
      }

      if (method === 'tools/list') {
        reply(id, {
          tools: [
            {
              name: 'get_antigravity_quota',
              description: '实时查询当前 Antigravity 各大模型（Gemini 3.8/2.5、Claude 4.6、GPT-OSS）剩余配额百分比、滑动窗口重置时间（回血倒计时）与积分余额。',
              inputSchema: {
                type: 'object',
                properties: {
                  model: {
                    type: 'string',
                    description: '可选：指定模型名称进行过滤（例如 gemini, claude, gpt）'
                  },
                  mask: {
                    type: 'boolean',
                    description: '是否脱敏用户邮箱账号（默认为 true）'
                  }
                }
              }
            }
          ]
        });
        return;
      }

      if (method === 'tools/call') {
        const toolName = params?.name;
        if (toolName === 'get_antigravity_quota') {
          const res = await handleGetQuota(params?.arguments);
          reply(id, res);
        } else {
          reply(id, null, { code: -32601, message: `Tool not found: ${toolName}` });
        }
        return;
      }

      if (id !== undefined) {
        reply(id, null, { code: -32601, message: `Method not supported: ${method}` });
      }
    } catch (err) {
      console.error('MCP error:', err);
    }
  });
}

if (process.argv[1] && process.argv[1].endsWith('mcp_server.mjs')) {
  startMcpServer();
}
