/**
 * api/admin/badges/revoke.js
 * POST /api/admin/badges/revoke
 */
'use strict';
const { getSession }     = require('../../../lib/session');
const { callAppsScript } = require('../../../lib/appsScriptClient');

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let d = '';
    req.on('data', c => (d += c));
    req.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve({}); } });
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const session = await getSession(req);
  if (!session) return res.status(401).json({ ok: false, error_code: 'UNAUTHENTICATED' });

  const body = await readBody(req);
  if (!body.award_id || !body.reason) {
    return res.status(400).json({ ok: false, error_code: 'VALIDATION_ERROR', message: 'award_id and reason are required' });
  }

  try {
    const result = await callAppsScript('revokeBadge', {
      actor_member_id: session.member_id,
      award_id:        body.award_id,
      reason:          body.reason,
    });
    return res.status(200).json(result);
  } catch (err) {
    if (err.error_code === 'AWARD_NOT_FOUND') return res.status(404).json({ ok: false, error_code: 'AWARD_NOT_FOUND' });
    if (err.error_code === 'UNAUTHORIZED')    return res.status(403).json({ ok: false, error_code: 'FORBIDDEN' });
    return res.status(500).json({ ok: false, error_code: 'INTERNAL_ERROR', message: err.message });
  }
};
