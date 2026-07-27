/**
 * api/admin/badges/award.js
 * POST /api/admin/badges/award
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
  if (!body.member_id || !body.badge_id) {
    return res.status(400).json({ ok: false, error_code: 'VALIDATION_ERROR', message: 'member_id and badge_id are required' });
  }

  try {
    const result = await callAppsScript('awardBadge', {
      actor_member_id: session.member_id,
      member_id:       body.member_id,
      badge_id:        body.badge_id,
      note:            body.note || '',
    });
    return res.status(200).json(result);
  } catch (err) {
    if (err.error_code === 'UNAUTHORIZED') return res.status(403).json({ ok: false, error_code: 'FORBIDDEN' });
    return res.status(500).json({ ok: false, error_code: 'INTERNAL_ERROR', message: err.message });
  }
};
