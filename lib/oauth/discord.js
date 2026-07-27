/**
 * lib/oauth/discord.js
 * Direct Discord OAuth 2.0 helpers (no SDK).
 *
 * Env vars required:
 *   DISCORD_CLIENT_ID
 *   DISCORD_CLIENT_SECRET
 *   DISCORD_REDIRECT_URI
 */

'use strict';

const crypto = require('crypto');

const DISCORD_AUTH_URL  = 'https://discord.com/api/oauth2/authorize';
const DISCORD_TOKEN_URL = 'https://discord.com/api/oauth2/token';
const DISCORD_USER_URL  = 'https://discord.com/api/users/@me';

// Minimum scope: read Discord user ID only
const SCOPES = 'identify';

function generateState() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * @param {string} state
 * @returns {string} redirect URL
 */
function buildAuthUrl(state) {
  const params = new URLSearchParams({
    client_id:     process.env.DISCORD_CLIENT_ID,
    redirect_uri:  process.env.DISCORD_REDIRECT_URI,
    response_type: 'code',
    scope:         SCOPES,
    state,
  });
  return `${DISCORD_AUTH_URL}?${params}`;
}

/**
 * @param {string} code
 * @returns {Promise<{access_token:string, token_type:string}>}
 */
async function exchangeCode(code) {
  const body = new URLSearchParams({
    client_id:     process.env.DISCORD_CLIENT_ID,
    client_secret: process.env.DISCORD_CLIENT_SECRET,
    grant_type:    'authorization_code',
    code,
    redirect_uri:  process.env.DISCORD_REDIRECT_URI,
  });
  const res = await fetch(DISCORD_TOKEN_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) throw new Error(`Discord token exchange failed: ${res.status}`);
  return res.json();
}

/**
 * @param {string} accessToken
 * @returns {Promise<{id:string, username:string, global_name:string, avatar:string}>}
 */
async function getUserInfo(accessToken) {
  const res = await fetch(DISCORD_USER_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Discord user fetch failed: ${res.status}`);
  return res.json();
}

module.exports = { generateState, buildAuthUrl, exchangeCode, getUserInfo };
