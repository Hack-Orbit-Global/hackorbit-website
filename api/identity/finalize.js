/**
 * api/identity/finalize.js
 * POST /api/identity/finalize
 * Promotes pending → verified, assigns Member ID, optionally saves display_name/skills.
 */
'use strict';
const { getSession, createSession } = require('../../lib/session');
const { callAppsScript }            = require('../../lib/appsScriptClient');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const session = await getSession(req);
  if (!session) return res.status(401).json({ ok: false, error_code: 'UNAUTHENTICATED' });

  if (!session.google_linked || !session.github_linked || !session.discord_linked) {
    return res.status(400).json({
      ok: false,
      error_code: 'INCOMPLETE_VERIFICATION',
      message: 'All three providers (Google, GitHub, Discord) must be connected before finalizing.',
    });
  }

  try {
    let body = {};
    if (req.headers['content-type']?.includes('application/json')) {
      // Collect body chunks
      const raw = await new Promise((resolve, reject) => {
        let data = '';
        req.on('data', c => (data += c));
        req.on('end', () => resolve(data));
        req.on('error', reject);
      });
      body = raw ? JSON.parse(raw) : {};
    }

    const result = await callAppsScript('finalizeVerification', {
      member_id:    session.member_id,
      display_name: body.displayName ?? session.display_name,
      skills:       body.skills ?? '',
    });

    const updated = await createSession({
      ...session,
      member_id: result.member_id,
      status:    'verified',
    });

    res.setHeader('Set-Cookie', updated);
    res.status(200).json({ ok: true, member_id: result.member_id, status: 'verified' });
  } catch (err) {
    console.error('[identity/finalize]', err);
    res.status(500).json({ ok: false, error_code: err.error_code || 'INTERNAL_ERROR', message: err.message });
  }
};
