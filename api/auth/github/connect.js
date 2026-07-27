/**
 * api/auth/github/connect.js
 * GET /api/auth/github/connect  (requires active session)
 */
'use strict';
const { generateState, buildAuthUrl } = require('../../../lib/oauth/github');
const { getSession }                  = require('../../../lib/session');

module.exports = async (req, res) => {
  const session = await getSession(req);
  if (!session) return res.redirect(302, '/join?error=unauthenticated');

  const state = generateState();
  res.setHeader('Set-Cookie', `ho_oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Max-Age=600; Path=/`);
  res.redirect(302, buildAuthUrl(state));
};
