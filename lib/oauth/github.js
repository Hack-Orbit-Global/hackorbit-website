import { fetchJson } from './common.js';

const AUTH_URL = 'https://github.com/login/oauth/authorize';
const TOKEN_URL = 'https://github.com/login/oauth/access_token';
const API_URL = 'https://api.github.com/user';

export function buildGithubAuthUrl({ state, redirectUri }) {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: 'read:user',
    state,
    allow_signup: 'false',
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export async function exchangeGithubCode({ code, redirectUri }) {
  const body = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    code,
    redirect_uri: redirectUri,
  });
  const data = await fetchJson(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body,
  });
  if (!data.access_token) {
    const err = new Error('GitHub token exchange failed');
    err.status = 400;
    err.data = data;
    throw err;
  }
  return data;
}

export async function getGithubUser(accessToken) {
  return fetchJson(API_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
}
