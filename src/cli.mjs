#!/usr/bin/env node
import { getFormattedQuota } from './ls_client.mjs';

function formatCountdown(sec) {
  if (sec === null || sec === undefined) return 'N/A';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

async function runCli() {
  console.log('\n🐾 \x1b[1m\x1b[36mGoogle Antigravity 实时配额监视器\x1b[0m\n');
  try {
    const data = await getFormattedQuota({ maskEmail: true });

    console.log(`\x1b[33m[账号信息]\x1b[0m 用户: \x1b[1m${data.user.email}\x1b[0m | 订阅: \x1b[32m${data.user.planName} (${data.user.tier})\x1b[0m`);
    console.log(`\x1b[33m[积分余额]\x1b[0m Prompt: \x1b[1m${data.credits.promptAvailable}\x1b[0m / ${data.credits.promptMonthly} | Flow: \x1b[1m${data.credits.flowAvailable}\x1b[0m / ${data.credits.flowMonthly}`);
    console.log('\n--------------------------------------------------------------------------------');
    console.log(
      '\x1b[1m' +
      '模型名称'.padEnd(30) +
      '剩余配额'.padEnd(16) +
      '回血倒计时'.padEnd(18) +
      '状态' +
      '\x1b[0m'
    );
    console.log('--------------------------------------------------------------------------------');

    data.models.forEach(m => {
      const pctStr = m.percentage !== null ? `${m.percentage}%` : '100%';
      let color = '\x1b[32m'; // green
      let tag = '正常';
      if (m.fraction !== null && m.fraction <= 0.1) {
        color = '\x1b[31m'; // red
        tag = '告急';
      } else if (m.fraction !== null && m.fraction <= 0.3) {
        color = '\x1b[33m'; // yellow
        tag = '偏低';
      }

      const cd = formatCountdown(m.resetsInSeconds);
      console.log(
        m.label.padEnd(30) +
        `${color}${pctStr}\x1b[0m`.padEnd(25) +
        cd.padEnd(18) +
        `${color}${tag}\x1b[0m`
      );
    });

    console.log('--------------------------------------------------------------------------------');
    console.log(`\x1b[90m同步时间: ${new Date().toLocaleTimeString()} (数据直连本地 Antigravity Language Server)\x1b[0m\n`);
  } catch (err) {
    console.error('\x1b[31m获取配额失败:\x1b[0m', err.message);
    console.log('\x1b[90m请确认 Antigravity 客户端正在运行。\x1b[0m\n');
    process.exit(1);
  }
}

runCli();
