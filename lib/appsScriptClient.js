export class AppsScriptError extends Error {
  constructor(message, code, status = 500) {
    super(message);
    this.name = 'AppsScriptError';
    this.code = code;
    this.status = status;
  }
}

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL || process.env.GAS_WEBAPP_URL;
const SERVICE_KEY = process.env.HO_SERVICE_KEY || process.env.SHARED_SERVICE_KEY;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Authenticated, retrying HTTPS caller for the Apps Script Web App.
 * Sends both documented shared-secret headers for compatibility.
 */
export async function callAppsScript(action, payload = {}) {
  if (!APPS_SCRIPT_URL) {
    throw new AppsScriptError('APPS_SCRIPT_URL is not configured', 'APPS_SCRIPT_CONFIG');
  }
  if (!SERVICE_KEY) {
    throw new AppsScriptError('HO_SERVICE_KEY is not configured', 'APPS_SCRIPT_CONFIG');
  }

  let lastError = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const res = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-HO-Service-Key': SERVICE_KEY,
          'X-Shared-Service-Key': SERVICE_KEY,
        },
        body: JSON.stringify({ action, payload, service_key: SERVICE_KEY }),
      });

      const text = await res.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }

      if (res.ok && data && data.ok !== false) {
        return data.result !== undefined ? data.result : data;
      }

      const code = (data && data.error_code) || 'APPS_SCRIPT_ERROR';
      const message = (data && data.message) || `Apps Script returned HTTP ${res.status}`;

      if (res.status >= 500) {
        lastError = new AppsScriptError(message, code, res.status);
        continue;
      }
      throw new AppsScriptError(message, code, res.status);
    } catch (err) {
      if (err instanceof AppsScriptError) throw err;
      lastError = err;
    }

    if (attempt < 2) await sleep(250 * 2 ** attempt);
  }

  throw lastError || new AppsScriptError('Apps Script request failed', 'APPS_SCRIPT_ERROR');
}
