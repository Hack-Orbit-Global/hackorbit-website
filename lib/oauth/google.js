/**
 * lib/oauth/google.js
 * Direct Google OAuth 2.0 helpers (no SDK).
 * Implements PKCE + state for the authorisation code flow.
 *
 * Env vars required:
 *   GOOGLE_CLIENT_ID
 *   GOOGLE_CLIENT_SECRET
 *   GOOGLE_REDIRECT_URI   (e.g. https://hackorbitglobal.vercel.app/api/auth/google/callback)
 */

'use strict';

const crypto = require('crypto');

const GOOGLE_AUTH_URL  = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO   = 'https://www.googleapis.com/oauth2/v3/userinfo';

const SCOPES = ['openid', 'email', 'profile'].join(' ');

/**
 * Generates a PKCE code verifier + challenge pair.
 */
function generatePKCE() {
  const verifier  = crypto.randomBytes(32).toString('base64url');
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge };
}

/**
 * Generates a signed state token (short-lived nonce stored in a temp cookie).
 */
function generateState() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Builds the Google OAuth authorization URL.
 * @param {string} state
 * @param {string} codeChallenge
 * @returns {string} redirect URL
 */
function buildAuthUrl(state, codeChallenge) {
  const params = new URLSearchParams({
    client_id:             process.env.GOOGLE_CLIENT_ID,
    redirect_uri:          process.env.GOOGLE_REDIRECT_URI,
    response_type:         'code',
    scope:                 SCOPES,
    state,
    code_challenge:        codeChallenge,
    code_challenge_method: 'S256',
    access_type:           'offline',
    prompt:                'select_account',
  });
  return `${GOOGLE_AUTH_URL}?${params}`;
}

/**
 * Exchanges the authorisation code for tokens.
 * @param {string} code
 * @param {string} codeVerifier
 * @returns {Promise<{access_token:string, id_token?:string}>}
 */
async function exchangeCode(code, codeVerifier) {
  const body = new URLSearchParams({
    grant_type:    'authorization_code',
    code,
    redirect_uri:  process.env.GOOGLE_REDIRECT_URI,
    client_id:     process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    code_verifier: codeVerifier,
  });

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) throw new Error(`Google token exchange failed: ${res.status}`);
  return res.json();
}

/**
 * Fetches the authenticated user's profile via the userinfo endpoint.
 * @param {string} accessToken
 * @returns {Promise<{sub:string, email:string, name:string, picture:string}>}
 */
async function getUserInfo(accessToken) {
  const res = await fetch(GOOGLE_USERINFO, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Google userinfo failed: ${res.status}`);
  return res.json();
}

module.exports = { generatePKCE, generateState, buildAuthUrl, exchangeCode, getUserInfo };
