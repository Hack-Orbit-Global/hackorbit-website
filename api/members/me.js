import { getSessionCookie, verifySession, json, error } from '../../lib/session.js';
import { callAppsScript } from '../../lib/appsScriptClient.js';
import { readBody, rateLimit } from '../../lib/http.js';
import { assertString, assertOptionalString, assertOptionalArray, assertOptionalUrl } from '../../lib/validation/validate.js';

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    res.statusCode = 405;
    res.setHeader('Allow', 'PATCH');
    return res.end();
  }

  const token = getSessionCookie(req);
  if (!token) return error(res, 401, 'UNAUTHENTICATED', 'You must be signed in.');

  let session;
  try {
    session = await verifySession(token);
  } catch {
    return error(res, 401, 'UNAUTHENTICATED', 'Your session has expired.');
  }

  if (!session.google_sub) return error(res, 401, 'UNAUTHENTICATED', 'Missing identity anchor.');

  const limiter = rateLimit(`me:${session.google_sub}`, 10, 60_000);
  if (limiter.limited) return error(res, 429, 'RATE_LIMITED', 'Too many updates. Try again shortly.');

  let body;
  try {
    body = await readBody(req);
  } catch {
    return error(res, 400, 'VALIDATION_ERROR', 'Invalid request body.');
  }

  try {
    const displayName = assertString(body.display_name, 'Display name is required');
    const payload = {
      google_sub: session.google_sub,
      display_name: displayName,
      bio: assertOptionalString(body.bio, 'Bio must be text', 500),
      skills: assertOptionalArray(body.skills, 'Skills must be an array'),
      linkedin_url: assertOptionalUrl(body.linkedin_url, 'LinkedIn URL'),
      other_links: assertOptionalArray(body.other_links, 'Other links must be an array'),
    };

    const updated = await callAppsScript('updateProfileByGoogleSub', payload);
    return json(res, 200, updated);
  } catch (err) {
    if (err.code === 'VALIDATION_ERROR') return error(res, 400, 'VALIDATION_ERROR', err.message);
    console.error('[members/me]', err);
    return error(res, 500, 'INTERNAL_ERROR', 'Failed to update profile.');
  }
}
