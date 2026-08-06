import { getSessionCookie, verifySession, json, error } from '../../../lib/session.js';
import { readBody, rateLimit } from '../../../lib/http.js';
import { requireAdmin } from '../../../lib/admin.js';
import { callAppsScript } from '../../../lib/appsScriptClient.js';
import { isMemberId, assertString } from '../../../lib/validation/validate.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
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

  try {
    const admin = await requireAdmin(session);
    const limiter = rateLimit(`admin:${session.google_sub}`, 20, 60_000);
    if (limiter.limited) return error(res, 429, 'RATE_LIMITED', 'Too many admin actions.');

    let body;
    try {
      body = await readBody(req);
    } catch {
      return error(res, 400, 'VALIDATION_ERROR', 'Invalid request body.');
    }

    if (!isMemberId(body.member_id)) return error(res, 400, 'VALIDATION_ERROR', 'Invalid member ID.');
    const badgeId = assertString(body.badge_id, 'Badge ID is required');
    const note = typeof body.note === 'string' ? body.note.slice(0, 500) : '';

    const result = await callAppsScript('awardBadge', {
      member_id: body.member_id,
      badge_id: badgeId,
      awarded_by: admin.role === 'founder' ? 'founder' : session.google_sub,
      note,
    });

    return json(res, 200, { award_id: result.award_id });
  } catch (err) {
    if (err.status === 403 || err.code === 'FORBIDDEN') return error(res, 403, 'FORBIDDEN', err.message);
    if (err.code === 'BADGE_NOT_FOUND') return error(res, 404, 'BADGE_NOT_FOUND', 'No such badge.');
    if (err.code === 'MEMBER_NOT_FOUND') return error(res, 404, 'MEMBER_NOT_FOUND', 'No such member.');
    if (err.code === 'ALREADY_AWARDED') return error(res, 409, 'ALREADY_AWARDED', 'Badge already awarded.');
    console.error('[admin/badges/award]', err);
    return error(res, 500, 'INTERNAL_ERROR', 'Failed to award badge.');
  }
}
