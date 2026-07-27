/**
 * api/auth/google/start.js
 * GET /api/auth/google/start
 * Generates PKCE + state, stores verifier in a temp cookie, redirects to Google.
 */

'use strict';

const { generatePKCE, generateState, buildAuthUrl } = require('../../../lib/oauth/google');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end('Method Not Allowed');

  const { verifier, challenge } = generatePKCE();
  const state = generateState();

  // Store verifier + state in short-lived temp cookies (SameSite=Lax, 10 min TTL)
  const cookieOpts = 'HttpOnly; Secure; SameSite=Lax; Max-Age=600; Path=/';
  res.setHeader('Set-Cookie', [
    `ho_pkce_verifier=${verifier}; ${cookieOpts}`,
    `ho_oauth_state=${state}; ${cookieOpts}`,
  ]);

  res.redirect(302, buildAuthUrl(state, challenge));
};
