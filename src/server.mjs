import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPaths } from './config.mjs';
import { getFormattedQuota, getUserStatus, getAvailableModels } from './ls_client.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const uiHtmlPath = join(__dirname, '..', 'sidecars', 'quota_viewer', 'ui.html');

export function startServer({ port = 39281, host = '127.0.0.1' } = {}) {
  const actualPort = parseInt(process.env.ANTIGRAVITY_SIDECAR_WEB_PORT || String(port), 10);
  const paths = getPaths();

  const server = createServer(async (req, res) => {
    // Enable CORS for webview & standalone browser
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-codeium-csrf-token');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    try {
      if (pathname === '/' || pathname === '/ui.html') {
        if (existsSync(uiHtmlPath)) {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(readFileSync(uiHtmlPath));
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('ui.html not found');
        }
        return;
      }

      if (pathname === '/preload.js') {
        res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8' });
        if (existsSync(paths.sidecarSdkPreload)) {
          res.end(readFileSync(paths.sidecarSdkPreload));
        } else {
          res.end('// sidecar preload shim\nwindow.addEventListener("DOMContentLoaded", () => {});');
        }
        return;
      }

      if (pathname === '/api/quota') {
        const mask = url.searchParams.get('mask') === 'true';
        const quota = await getFormattedQuota({ maskEmail: mask });
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(quota));
        return;
      }

      if (pathname === '/api/raw') {
        const data = await getUserStatus();
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(data));
        return;
      }

      if (pathname === '/api/models') {
        const models = await getAvailableModels();
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(models));
        return;
      }

      if (pathname === '/api/health') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
        return;
      }

      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
  });

  server.listen(actualPort, host, () => {
    console.log(`[QuotaMonitor] Server listening on http://${host}:${actualPort}`);
  });

  return server;
}

// Auto-run if executed directly
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  startServer();
}
