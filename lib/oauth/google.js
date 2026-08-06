import { fetchJson } from './common.js';

const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';

export function buildGoogleAuthUrl({ state, codeChallenge, redirectUri }) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
    access_type: 'online',
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export async function exchangeGoogleCode({ code, codeVerifier, redirectUri }) {
  const body = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
    code_verifier: codeVerifier,
  });
  return fetchJson(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
}

export async function getGoogleUser(accessToken) {
  return fetchJson(USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
