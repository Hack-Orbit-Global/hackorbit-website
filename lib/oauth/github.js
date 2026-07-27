/**
 * lib/oauth/github.js
 * Direct GitHub OAuth 2.0 helpers (no SDK).
 *
 * Env vars required:
 *   GITHUB_CLIENT_ID
 *   GITHUB_CLIENT_SECRET
 *   GITHUB_REDIRECT_URI   (e.g. https://hackorbitglobal.vercel.app/api/auth/github/callback)
 */

'use strict';

const crypto = require('crypto');

const GITHUB_AUTH_URL  = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_USER_URL  = 'https://api.github.com/user';

// Only the minimum scope needed to read the public profile username
const SCOPES = 'read:user';

function generateState() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * @param {string} state
 * @returns {string} redirect URL
 */
function buildAuthUrl(state) {
  const params = new URLSearchParams({
    client_id:    process.env.GITHUB_CLIENT_ID,
    redirect_uri: process.env.GITHUB_REDIRECT_URI,
    scope:        SCOPES,
    state,
  });
  return `${GITHUB_AUTH_URL}?${params}`;
}

/**
 * @param {string} code
 * @returns {Promise<{access_token:string}>}
 */
async function exchangeCode(code) {
  const res = await fetch(GITHUB_TOKEN_URL, {
    method:  'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id:     process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri:  process.env.GITHUB_REDIRECT_URI,
    }),
  });
  if (!res.ok) throw new Error(`GitHub token exchange failed: ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(`GitHub OAuth error: ${data.error_description || data.error}`);
  return data;
}

/**
 * @param {string} accessToken
 * @returns {Promise<{id:number, login:string, name:string, avatar_url:string}>}
 */
async function getUserInfo(accessToken) {
  const res = await fetch(GITHUB_USER_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept:        'application/vnd.github+json',
      'User-Agent':  'HackOrbit-Server/1.0',
    },
  });
  if (!res.ok) throw new Error(`GitHub user fetch failed: ${res.status}`);
  return res.json();
}

module.exports = { generateState, buildAuthUrl, exchangeCode, getUserInfo };
