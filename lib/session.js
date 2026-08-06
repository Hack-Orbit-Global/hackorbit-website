import { SignJWT, jwtVerify } from 'jose';

export const COOKIE_NAME = 'ho_session';
const SESSION_TTL = 60 * 60 * 24 * 7; // 7 days

const textEncoder = new TextEncoder();

function secretKey() {
  const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  return textEncoder.encode(secret);
}

export async function signSession(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey());
}

export async function verifySession(token) {
  const { payload } = await jwtVerify(token, secretKey());
  return payload;
}

export function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const name = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    cookies[name] = decodeURIComponent(value);
  }
  return cookies;
}

export function getSessionCookie(req) {
  return parseCookies(req.headers.cookie)[COOKIE_NAME] || null;
}

function cookieAttributes() {
  const secure = process.env.NODE_ENV === 'production';
  return [
    `HttpOnly`,
    `SameSite=Lax`,
    `Path=/`,
    `Max-Age=${SESSION_TTL}`,
    secure ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ');
}

export function setSessionCookie(res, token) {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${encodeURIComponent(token)}; ${cookieAttributes()}`);
}

export function clearSessionCookie(res) {
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
  );
}

export function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

export function error(res, status, errorCode, message) {
  json(res, status, { ok: false, error_code: errorCode, message });
}

export function redirect(res, url) {
  res.statusCode = 307;
  res.setHeader('Location', url);
  res.end();
}
