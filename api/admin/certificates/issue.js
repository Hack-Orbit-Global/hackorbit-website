import { getSessionCookie, verifySession, json, error } from '../../../lib/session.js';
import { readBody, rateLimit } from '../../../lib/http.js';
import { requireAdmin } from '../../../lib/admin.js';
import { callAppsScript } from '../../../lib/appsScriptClient.js';
import { isMemberId, assertString, assertOptionalString } from '../../../lib/validation/validate.js';

const CERT_TYPES = ['participation', 'winner', 'finalist', 'volunteer', 'organiser', 'contributor'];

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
    if (!CERT_TYPES.includes(body.type)) {
      return error(res, 400, 'VALIDATION_ERROR', `Type must be one of: ${CERT_TYPES.join(', ')}.`);
    }
    const achievement = assertString(body.achievement_description, 'Achievement description is required');
    const eventName = assertOptionalString(body.event_name, 'Event name must be text', 200) || '';
    const collaboratingOrg = assertOptionalString(body.collaborating_org, 'Collaborating org must be text', 200) || '';
    const issueDate = body.issue_date || new Date().toISOString().slice(0, 10);

    const result = await callAppsScript('issueCertificate', {
      member_id: body.member_id,
      type: body.type,
      event_name: eventName,
      achievement_description: achievement,
      collaborating_org: collaboratingOrg,
      issued_by: admin.role === 'founder' ? 'Hack Orbit' : 'Hack Orbit',
      issue_date: issueDate,
    });

    return json(res, 200, { certificate_id: result.certificate_id });
  } catch (err) {
    if (err.status === 403 || err.code === 'FORBIDDEN') return error(res, 403, 'FORBIDDEN', err.message);
    if (err.code === 'MEMBER_NOT_FOUND') return error(res, 404, 'MEMBER_NOT_FOUND', 'No such member.');
    if (err.code === 'MEMBER_NOT_VERIFIED') return error(res, 400, 'MEMBER_NOT_VERIFIED', 'Certificates require a verified member.');
    console.error('[admin/certificates/issue]', err);
    return error(res, 500, 'INTERNAL_ERROR', 'Failed to issue certificate.');
  }
}
