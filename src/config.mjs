import { homedir, platform } from 'node:os';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

let cachedAddress = process.env.ANTIGRAVITY_LS_ADDRESS;
let cachedToken = process.env.ANTIGRAVITY_CSRF_TOKEN;

/**
 * Returns user base paths dynamically without hardcoded usernames.
 */
export function getPaths() {
  const home = homedir();
  const isWin = platform() === 'win32';
  return {
    home,
    geminiDir: join(home, '.gemini'),
    antigravityDir: join(home, '.gemini', 'antigravity'),
    pluginDir: join(home, '.gemini', 'config', 'plugins', 'antigravity-quota-monitor'),
    sidecarSdkPreload: join(home, '.gemini', 'antigravity', 'lib', 'node_modules', 'sidecar_sdk', 'preload.js')
  };
}

/**
 * Resolves the active Antigravity Language Server address and CSRF token.
 */
export function resolveLanguageServer() {
  if (cachedAddress && cachedToken) {
    return { address: cachedAddress, token: cachedToken };
  }

  const os = platform();

  if (os === 'win32') {
    try {
      const psScript = `
        $p = Get-CimInstance Win32_Process -Filter "name = 'language_server.exe'" | Select-Object -First 1
        if ($p) {
          $m = [regex]::Match($p.CommandLine, '--csrf_token\\s+([a-zA-Z0-9-]+)')
          $token = if ($m.Success) { $m.Groups[1].Value } else { '' }
          $conns = Get-NetTCPConnection -OwningProcess $p.ProcessId -State Listen | Where-Object { $_.LocalAddress -eq '127.0.0.1' }
          $ports = ($conns | Select-Object -ExpandProperty LocalPort) -join ','
          Write-Output ($ports + ':::' + $token)
        }
      `;
      const encoded = Buffer.from(psScript, 'utf16le').toString('base64');
      const out = execSync(`powershell -NoProfile -EncodedCommand ${encoded}`, { encoding: 'utf-8', timeout: 3500 }).trim();
      if (out.includes(':::')) {
        const [portsStr, token] = out.split(':::');
        const ports = portsStr.split(',').map(p => parseInt(p.trim(), 10)).filter(Boolean);
        cachedToken = token.trim();
        for (const port of ports) {
          try {
            const probe = execSync(`curl -sS --max-time 1 "http://127.0.0.1:${port}/healthz"`, { encoding: 'utf-8' });
            if (probe.includes('status') || probe.includes('ok')) {
              cachedAddress = `127.0.0.1:${port}`;
              break;
            }
          } catch (_) {}
        }
      }
    } catch (err) {
      // Auto-detect warning (debug only)
    }
  } else {
    // Linux / macOS auto-discovery
    try {
      const psOut = execSync('ps aux | grep "[l]anguage_server"', { encoding: 'utf-8', timeout: 2000 });
      const match = psOut.match(/--csrf_token\s+([a-zA-Z0-9-]+)/);
      if (match) {
        cachedToken = match[1];
      }
      const candidatePorts = [2249, 5387, 2248, 1298];
      for (const p of candidatePorts) {
        try {
          const probe = execSync(`curl -sS --max-time 1 "http://127.0.0.1:${p}/healthz"`, { encoding: 'utf-8' });
          if (probe.includes('status') || probe.includes('ok')) {
            cachedAddress = `127.0.0.1:${p}`;
            break;
          }
        } catch (_) {}
      }
    } catch (_) {}
  }

  return {
    address: cachedAddress || '127.0.0.1:2249',
    token: cachedToken || ''
  };
}
