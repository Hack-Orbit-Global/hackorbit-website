import { json } from '../lib/session.js';
import { rateLimit, clientIp } from '../lib/http.js';

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL || process.env.GAS_WEBAPP_URL;
const APP_VERSION = process.env.VERCEL_GIT_COMMIT_SHA ? `sha-${process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7)}` : '1.0.0';

async function checkAppsScript() {
  const started = Date.now();
  const report = { latency_ms: null };

  if (!APPS_SCRIPT_URL) {
    return { ...report, status: 'not_configured', detail: 'APPS_SCRIPT_URL is not configured' };
  }

  try {
    const res = await fetch(APPS_SCRIPT_URL, { method: 'GET' });
    let data = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    report.latency_ms = Date.now() - started;
    const healthy = res.ok && data && data.ok === true;
    return {
      ...report,
      status: healthy ? 'healthy' : 'unhealthy',
      http_status: res.status,
      detail: data && data.service ? data.service : data && data.message ? data.message : null,
    };
  } catch (err) {
    report.latency_ms = Date.now() - started;
    return { ...report, status: 'unhealthy', detail: err.message };
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    return res.end();
  }

  const limiter = rateLimit(`health:${clientIp(req)}`, 20, 60_000);
  if (limiter.limited) return json(res, 429, { ok: false, status: 'unhealthy' });

  const check = await checkAppsScript();
  const healthy = check.status === 'healthy';

  return json(res, healthy ? 200 : 503, {
    ok: healthy,
    status: healthy ? 'healthy' : 'degraded',
    service: 'hack-orbit-website',
    version: APP_VERSION,
    timestamp: new Date().toISOString(),
    checks: { apps_script: check },
  });
}
