/**
 * api/members/me.js
 * PATCH /api/members/me
 * Authenticated profile self-edit endpoint.
 */
'use strict';
const { getSession }     = require('../../lib/session');
const { callAppsScript } = require('../../lib/appsScriptClient');

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => (data += chunk));
    req.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve({}); } });
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'PATCH') return res.status(405).end('Method Not Allowed');

  const session = await getSession(req);
  if (!session || session.status !== 'verified') {
    return res.status(401).json({ ok: false, error_code: 'UNAUTHENTICATED' });
  }

  const body = await readBody(req);

  // Whitelist allowed fields — never let the client set member_id, status, etc.
  const allowed = ['display_name', 'avatar_url', 'bio', 'skills', 'linkedin_url'];
  const update  = Object.fromEntries(
    Object.entries(body).filter(([k]) => allowed.includes(k))
  );

  if (Object.keys(update).length === 0) {
    return res.status(400).json({ ok: false, error_code: 'VALIDATION_ERROR', message: 'No valid fields provided' });
  }

  try {
    await callAppsScript('updateProfile', { member_id: session.member_id, ...update });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[members/me]', err);
    return res.status(500).json({ ok: false, error_code: 'INTERNAL_ERROR', message: err.message });
  }
};
