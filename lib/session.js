/**
 * lib/session.js
 * JWT-based session management using jose (no external auth framework).
 * Sessions are stored as signed, encrypted JWTs in httpOnly cookies.
 *
 * Env vars required:
 *   SESSION_SECRET  — 32+ byte random hex string (for signing)
 */

'use strict';

const { SignJWT, jwtVerify } = require('jose');

const COOKIE_NAME    = 'ho_session';
const SESSION_TTL_S  = 60 * 60 * 24 * 7; // 7 days

function getSecret() {
  const hex = process.env.SESSION_SECRET;
  if (!hex || hex.length < 64) {
    throw new Error('SESSION_SECRET env var must be set to a 32-byte (64 hex char) random string');
  }
  return Buffer.from(hex, 'hex');
}

/**
 * Creates a signed JWT and returns the Set-Cookie header string.
 * @param {object} payload  - session data (member_id, google linked, etc.)
 * @returns {Promise<string>} Set-Cookie header value
 */
async function createSession(payload) {
  const secret = getSecret();
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_S}s`)
    .sign(secret);

  const cookieOpts = [
    `${COOKIE_NAME}=${token}`,
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    `Max-Age=${SESSION_TTL_S}`,
    'Path=/',
  ].join('; ');

  return cookieOpts;
}

/**
 * Reads and verifies the session cookie from an incoming request.
 * @param {import('http').IncomingMessage} req
 * @returns {Promise<object|null>} decoded payload, or null if absent/invalid
 */
async function getSession(req) {
  const cookieHeader = req.headers.cookie || '';
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  if (!match) return null;

  try {
    const { payload } = await jwtVerify(match[1], getSecret(), { algorithms: ['HS256'] });
    return payload;
  } catch {
    return null; // expired or tampered
  }
}

/**
 * Returns a Set-Cookie header that clears the session.
 * @returns {string}
 */
function clearSession() {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/`;
}

module.exports = { createSession, getSession, clearSession, COOKIE_NAME };
