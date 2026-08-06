import { json, error } from '../../lib/session.js';
import { callAppsScript } from '../../lib/appsScriptClient.js';
import { rateLimit, clientIp } from '../../lib/http.js';
import { isCertificateId } from '../../lib/validation/validate.js';

const CERT_TYPES = {
  participation: 'Participation',
  winner: 'Hackathon Winner',
  finalist: 'Finalist',
  volunteer: 'Volunteer',
  organiser: 'Organiser',
  contributor: 'Contributor',
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    return res.end();
  }

  const ip = clientIp(req);
  const limiter = rateLimit(`verify:${ip}`, 30, 60_000);
  if (limiter.limited) return error(res, 429, 'RATE_LIMITED', 'Too many verification lookups. Try again shortly.');

  const { id } = req.query;
  if (!id) return json(res, 200, { ok: true, found: false });

  if (!isCertificateId(id)) return json(res, 200, { ok: true, found: false });

  try {
    const result = await callAppsScript('verifyCertificate', { certificate_id: id });
    if (!result || !result.found) return json(res, 200, { ok: true, found: false });

    const cert = result.certificate;
    return json(res, 200, {
      ok: true,
      found: true,
      certificate: {
        certificate_id: cert.certificate_id,
        status: cert.status,
        type: cert.type,
        type_label: CERT_TYPES[cert.type] || cert.type,
        recipient_name: cert.recipient_name,
        member_id: cert.member_id,
        issued_by: cert.issued_by,
        collaborating_org: cert.collaborating_org || undefined,
        event_name: cert.event_name || undefined,
        achievement_description: cert.achievement_description,
        issue_date: cert.issue_date,
      },
    });
  } catch (err) {
    console.error('[verify/index]', err);
    return error(res, 500, 'INTERNAL_ERROR', 'Verification service unavailable.');
  }
}
