/**
 * lib/appsScriptClient.js
 * Authenticated HTTP client for calling the Google Apps Script Web App.
 *
 * Env vars required:
 *   APPS_SCRIPT_URL     — the deployed Web App URL
 *   HO_SERVICE_KEY      — shared secret sent in X-HO-Service-Key header
 */

'use strict';

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;
const SERVICE_KEY     = process.env.HO_SERVICE_KEY;

/**
 * Calls an Apps Script action via POST.
 * All calls use POST regardless of read/write — Apps Script enforces auth server-side.
 *
 * @param {string} action   - the action name (e.g. 'getMember', 'createMember')
 * @param {object} params   - action-specific payload
 * @returns {Promise<object>} parsed JSON response from Apps Script
 * @throws  if network fails or Apps Script returns ok:false
 */
async function callAppsScript(action, params = {}) {
  if (!APPS_SCRIPT_URL) throw new Error('APPS_SCRIPT_URL env var not set');
  if (!SERVICE_KEY)     throw new Error('HO_SERVICE_KEY env var not set');

  const body = JSON.stringify({ action, ...params });

  const response = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-HO-Service-Key': SERVICE_KEY,
    },
    body,
    // Follow redirects — Apps Script Web Apps issue a redirect on POST
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`Apps Script HTTP error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (data.ok === false) {
    const err = new Error(data.message || 'Apps Script returned ok:false');
    err.error_code = data.error_code || 'APPS_SCRIPT_ERROR';
    throw err;
  }

  return data;
}

module.exports = { callAppsScript };
