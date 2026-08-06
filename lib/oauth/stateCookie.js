import { parseCookies } from '../session.js';

export const OAUTH_STATE_COOKIE = 'ho_oauth_state';

function secure() {
  return process.env.NODE_ENV === 'production';
}

export function setOAuthStateCookie(res, data) {
  const value = encodeURIComponent(JSON.stringify(data));
  const flags = [
    'HttpOnly',
    'SameSite=Lax',
    'Path=/',
    'Max-Age=600',
    secure() ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ');
  res.setHeader('Set-Cookie', `${OAUTH_STATE_COOKIE}=${value}; ${flags}`);
}

export function getOAuthStateCookie(req) {
  const raw = parseCookies(req.headers.cookie)[OAUTH_STATE_COOKIE];
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw));
  } catch {
    return null;
  }
}

export function clearOAuthStateCookie(res) {
  res.setHeader(
    'Set-Cookie',
    `${OAUTH_STATE_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure() ? '; Secure' : ''}`
  );
}
