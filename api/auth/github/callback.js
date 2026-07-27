/**
 * api/auth/github/callback.js
 * GET /api/auth/github/callback
 */
'use strict';
const { exchangeCode, getUserInfo } = require('../../../lib/oauth/github');
const { callAppsScript }            = require('../../../lib/appsScriptClient');
const { getSession, createSession } = require('../../../lib/session');

function parseCookies(req) {
  return Object.fromEntries(
    (req.headers.cookie || '').split(';').map(c => c.trim().split('=').map(decodeURIComponent))
  );
}

module.exports = async (req, res) => {
  const { code, state, error } = req.query || {};
  const cookies = parseCookies(req);
  const session = await getSession(req);

  if (error || !session) return res.redirect(302, '/join?error=github_denied');
  if (!state || state !== cookies.ho_oauth_state) return res.redirect(302, '/join?error=invalid_state');

  try {
    const tokens  = await exchangeCode(code);
    const profile = await getUserInfo(tokens.access_token);

    await callAppsScript('linkIdentity', {
      member_id:           session.member_id,
      provider:            'github',
      provider_account_id: String(profile.id),
      github_username:     profile.login,
    });

    // Refresh session with github_linked:true
    const updated = await createSession({ ...session, github_linked: true, github_username: profile.login });
    res.setHeader('Set-Cookie', [updated, 'ho_oauth_state=; Max-Age=0; Path=/']);
    res.redirect(302, '/join');
  } catch (err) {
    console.error('[github/callback]', err);
    const code = err.error_code === 'ALREADY_LINKED' ? 'github_already_linked' : 'github_failed';
    res.redirect(302, `/join?error=${code}`);
  }
};
