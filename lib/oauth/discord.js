import { fetchJson } from './common.js';

const AUTH_URL = 'https://discord.com/oauth2/authorize';
const TOKEN_URL = 'https://discord.com/api/oauth2/token';
const USERINFO_URL = 'https://discord.com/api/users/@me';

export function buildDiscordAuthUrl({ state, redirectUri }) {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'identify',
    state,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export async function exchangeDiscordCode({ code, redirectUri }) {
  const body = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    client_secret: process.env.DISCORD_CLIENT_SECRET,
    code,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
    scope: 'identify',
  });
  return fetchJson(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
}

export async function getDiscordUser(accessToken) {
  return fetchJson(USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
