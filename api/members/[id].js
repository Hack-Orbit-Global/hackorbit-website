/**
 * api/members/[id].js
 * GET /api/members/:member_id
 * Returns public profile JSON — used by client JS for progressive enhancement.
 */
'use strict';
const { callAppsScript } = require('../../lib/appsScriptClient');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end('Method Not Allowed');

  const memberId = (req.query?.id || '').toUpperCase();
  if (!/^HO-\d{6}$/.test(memberId)) {
    return res.status(400).json({ ok: false, error_code: 'INVALID_ID', message: 'Invalid member ID format' });
  }

  try {
    const result = await callAppsScript('getMember', { member_id: memberId });
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=30');
    return res.status(200).json(result);
  } catch (err) {
    if (err.error_code === 'MEMBER_NOT_FOUND') {
      return res.status(404).json({ ok: false, error_code: 'MEMBER_NOT_FOUND', message: 'Member not found' });
    }
    console.error('[members/[id]]', err);
    return res.status(500).json({ ok: false, error_code: 'INTERNAL_ERROR', message: 'Internal error' });
  }
};
