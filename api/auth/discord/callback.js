/**
 * api/auth/discord/callback.js
 * GET /api/auth/discord/callback
 */
'use strict';
const { exchangeCode, getUserInfo } = require('../../../lib/oauth/discord');
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

  if (error || !session) return res.redirect(302, '/join?error=discord_denied');
  if (!state || state !== cookies.ho_oauth_state) return res.redirect(302, '/join?error=invalid_state');

  try {
    const tokens  = await exchangeCode(code);
    const profile = await getUserInfo(tokens.access_token);

    await callAppsScript('linkIdentity', {
      member_id:           session.member_id,
      provider:            'discord',
      provider_account_id: profile.id,  // internal ID — never exposed publicly
    });

    const updated = await createSession({ ...session, discord_linked: true });
    res.setHeader('Set-Cookie', [updated, 'ho_oauth_state=; Max-Age=0; Path=/']);
    res.redirect(302, '/join');
  } catch (err) {
    console.error('[discord/callback]', err);
    const code = err.error_code === 'ALREADY_LINKED' ? 'discord_already_linked' : 'discord_failed';
    res.redirect(302, `/join?error=${code}`);
  }
};
