import { resolveLanguageServer } from './config.mjs';

/**
 * Execute an RPC against the Antigravity Language Server.
 */
export async function callRpc(method, body = {}) {
  const { address, token } = resolveLanguageServer();
  const url = `http://${address}/exa.language_server_pb.LanguageServerService/${method}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-codeium-csrf-token': token
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    throw new Error(`Language Server responded with HTTP ${res.status}: ${res.statusText}`);
  }

  return await res.json();
}

/**
 * Retrieve raw UserStatus from Language Server.
 */
export async function getUserStatus() {
  return await callRpc('GetUserStatus');
}

/**
 * Retrieve raw AvailableModels from Language Server.
 */
export async function getAvailableModels() {
  return await callRpc('GetAvailableModels');
}

/**
 * Parse and normalize quota information into a standard payload.
 */
export async function getFormattedQuota(options = { maskEmail: false }) {
  const data = await getUserStatus();
  const userStatus = data.userStatus || {};
  const planStatus = userStatus.planStatus || {};
  const planInfo = planStatus.planInfo || {};
  const clientModels = userStatus.cascadeModelConfigData?.clientModelConfigs || [];

  let email = userStatus.email || 'Current User';
  if (options.maskEmail && email.includes('@')) {
    const [name, domain] = email.split('@');
    email = `${name.slice(0, 2)}***@${domain}`;
  }

  const now = Date.now();
  const models = clientModels.map(m => {
    const q = m.quotaInfo || {};
    const frac = q.remainingFraction;
    const resetTime = q.resetTime;

    let resetsInSeconds = null;
    if (resetTime) {
      resetsInSeconds = Math.max(0, Math.floor((new Date(resetTime).getTime() - now) / 1000));
    }

    let status = 'normal';
    if (frac !== undefined && frac !== null) {
      if (frac <= 0.1) status = 'critical';
      else if (frac <= 0.3) status = 'warning';
    }

    return {
      label: m.label,
      fraction: frac !== undefined && frac !== null ? Number(frac) : null,
      percentage: frac !== undefined && frac !== null ? Number((frac * 100).toFixed(1)) : null,
      resetTime: resetTime || null,
      resetsInSeconds,
      status,
      supportsImages: !!m.supportsImages,
      isRecommended: !!m.isRecommended
    };
  });

  return {
    ok: true,
    user: {
      email,
      planName: planInfo.planName || 'Standard',
      tier: planInfo.teamsTier || 'FREE'
    },
    credits: {
      promptAvailable: planStatus.availablePromptCredits ?? 0,
      promptMonthly: planInfo.monthlyPromptCredits ?? 0,
      flowAvailable: planStatus.availableFlowCredits ?? 0,
      flowMonthly: planInfo.monthlyFlowCredits ?? 0
    },
    models,
    timestamp: new Date().toISOString()
  };
}
