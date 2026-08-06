import { createHash, randomBytes } from 'node:crypto';

export function generateState() {
  return randomBytes(32).toString('base64url');
}

export function generateCodeVerifier() {
  return randomBytes(32).toString('base64url');
}

export function generateCodeChallenge(verifier) {
  return createHash('sha256').update(verifier).digest('base64url');
}

export async function fetchJson(url, options) {
  const res = await fetch(url, options);
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!res.ok) {
    const err = new Error(
      (data && (data.error_description || data.error || data.message)) || `Request failed (${res.status})`
    );
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export function redirectUri(baseUrl, path) {
  return `${String(baseUrl).replace(/\/$/, '')}${path}`;
}
