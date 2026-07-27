/**
 * api/auth/google/callback.js
 * GET /api/auth/google/callback
 * Validates state, exchanges code (with PKCE), creates/finds member, sets session.
 */

'use strict';

const { exchangeCode, getUserInfo } = require('../../../lib/oauth/google');
const { callAppsScript }            = require('../../../lib/appsScriptClient');
const { createSession }             = require('../../../lib/session');

function parseCookies(req) {
  return Object.fromEntries(
    (req.headers.cookie || '').split(';').map(c => c.trim().split('=').map(decodeURIComponent))
  );
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end('Method Not Allowed');

  const { code, state, error } = req.query || {};
  const cookies = parseCookies(req);

  // Google declined access
  if (error) return res.redirect(302, '/join?error=google_denied');

  // CSRF state check
  if (!state || state !== cookies.ho_oauth_state) {
    return res.status(400).json({ ok: false, error_code: 'INVALID_STATE', message: 'State mismatch' });
  }

  const verifier = cookies.ho_pkce_verifier;
  if (!verifier) {
    return res.status(400).json({ ok: false, error_code: 'MISSING_VERIFIER', message: 'PKCE verifier missing' });
  }

  try {
    // Exchange code → tokens → user profile
    const tokens   = await exchangeCode(code, verifier);
    const profile  = await getUserInfo(tokens.access_token);

    // Create or find the member record in Apps Script / Sheets
    const result = await callAppsScript('createMember', {
      google_sub:   profile.sub,
      email:        profile.email,
      display_name: profile.name,
      avatar_url:   profile.picture,
    });

    // Build session payload
    const sessionPayload = {
      member_id:       result.member_id || null,
      google_sub:      profile.sub,
      google_linked:   true,
      github_linked:   false,
      discord_linked:  false,
      display_name:    profile.name,
      avatar_url:      profile.picture,
      status:          result.status || 'pending',
    };

    const sessionCookie = await createSession(sessionPayload);

    // Clear temp OAuth cookies, set session
    res.setHeader('Set-Cookie', [
      sessionCookie,
      'ho_pkce_verifier=; Max-Age=0; Path=/',
      'ho_oauth_state=; Max-Age=0; Path=/',
    ]);

    res.redirect(302, '/join');
  } catch (err) {
    console.error('[google/callback]', err);
    res.redirect(302, `/join?error=google_failed`);
  }
};
