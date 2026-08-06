import { getSessionCookie, verifySession, json, error } from '../../../lib/session.js';
import { readBody, rateLimit } from '../../../lib/http.js';
import { requireAdmin } from '../../../lib/admin.js';
import { callAppsScript } from '../../../lib/appsScriptClient.js';
import { assertString } from '../../../lib/validation/validate.js';

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
    await requireAdmin(session);
    const limiter = rateLimit(`admin:${session.google_sub}`, 20, 60_000);
    if (limiter.limited) return error(res, 429, 'RATE_LIMITED', 'Too many admin actions.');

    let body;
    try {
      body = await readBody(req);
    } catch {
      return error(res, 400, 'VALIDATION_ERROR', 'Invalid request body.');
    }

    const certificateId = assertString(body.certificate_id, 'Certificate ID is required');
    const reason = assertString(body.reason, 'A reason is required');

    await callAppsScript('revokeCertificate', {
      certificate_id: certificateId,
      revoke_reason: reason,
      revoked_by: session.google_sub,
    });

    return json(res, 200, { ok: true });
  } catch (err) {
    if (err.status === 403 || err.code === 'FORBIDDEN') return error(res, 403, 'FORBIDDEN', err.message);
    if (err.code === 'CERT_NOT_FOUND') return error(res, 404, 'CERT_NOT_FOUND', 'No such certificate.');
    console.error('[admin/certificates/revoke]', err);
    return error(res, 500, 'INTERNAL_ERROR', 'Failed to revoke certificate.');
  }
}
