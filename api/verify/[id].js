import { json, error } from '../../lib/session.js';
import { callAppsScript } from '../../lib/appsScriptClient.js';
import { rateLimit, clientIp, getBaseUrl } from '../../lib/http.js';
import { isCertificateId } from '../../lib/validation/validate.js';
import { renderTemplate, renderVerifyResultBody } from '../../lib/html/renderPage.js';

const CERT_TYPES = {
  participation: 'Participation',
  winner: 'Hackathon Winner',
  finalist: 'Finalist',
  volunteer: 'Volunteer',
  organiser: 'Organiser',
  contributor: 'Contributor',
};

function acceptsHtml(req) {
  const accept = req.headers.accept || '';
  return accept.includes('text/html');
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    return res.end();
  }

  const { id } = req.query;

  const ip = clientIp(req);
  const limiter = rateLimit(`verify:${ip}`, 30, 60_000);
  if (limiter.limited) {
    if (!acceptsHtml(req)) return error(res, 429, 'RATE_LIMITED', 'Too many verification lookups.');
    res.statusCode = 429;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.end(renderVerifyResultPage(null, false, 'Too many lookups. Try again shortly.'));
  }

  if (!id || !isCertificateId(id)) {
    if (!acceptsHtml(req)) return json(res, 200, { ok: true, found: false });
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.end(renderVerifyResultPage(null, false, 'No certificate found with this ID.'));
  }

  try {
    const result = await callAppsScript('verifyCertificate', { certificate_id: id });
    const found = Boolean(result && result.found);
    const cert = found ? result.certificate : null;

    if (!acceptsHtml(req)) {
      if (!found) return json(res, 200, { ok: true, found: false });
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
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.end(renderVerifyResultPage(cert, found, null));
  } catch (err) {
    console.error('[verify/[id]]', err);
    if (!acceptsHtml(req)) return error(res, 500, 'INTERNAL_ERROR', 'Verification service unavailable.');
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.end(renderVerifyResultPage(null, false, 'Verification service unavailable.'));
  }
}

function renderVerifyResultPage(cert, found, notFoundMessage) {
  const siteUrl = process.env.SITE_URL || '';
  let title = 'Verify a Hack Orbit Certificate';
  let description = 'Certificate verification result.';
  let body = '';

  if (found && cert) {
    const typeLabel = CERT_TYPES[cert.type] || cert.type;
    title = `${typeLabel} — ${cert.certificate_id} · Hack Orbit Certificate Verification`;
    description = `Verification for ${cert.certificate_id}: ${cert.status}. Issued to ${cert.recipient_name || ''} by ${cert.issued_by || 'Hack Orbit'}.`;
    body = renderVerifyResultBody({
      ...cert,
      type_label: typeLabel,
    });
  } else {
    body = `
      <section class="section" aria-labelledby="verify-result-title">
        <div class="container" style="max-width: 640px">
          <div class="callout callout--warning">
            <p>${notFoundMessage || 'No certificate found with this ID. Check the ID and try again.'}</p>
          </div>
          <div style="margin-top: 24px">
            <a class="btn btn--secondary" href="/verify">Try another certificate ID</a>
          </div>
        </div>
      </section>`;
  }

  return renderTemplate('verify-result.template.html', {
    PAGE_TITLE: title,
    META_DESCRIPTION: description.slice(0, 158),
    CANONICAL_URL: cert ? `${siteUrl}/verify-result/${cert.certificate_id}` : `${siteUrl}/verify`,
    OG_TITLE: title,
    OG_DESCRIPTION: description.slice(0, 158),
    OG_IMAGE: `${siteUrl}/assets/logo/logo.svg`,
    JSONLD: found && cert
      ? JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'EducationalOccupationalCredential',
          credentialCategory: 'certificate',
          name: `${cert.certificate_id} — ${CERT_TYPES[cert.type] || cert.type}`,
          awardedBy: { '@type': 'Organization', name: cert.issued_by || 'Hack Orbit' },
        })
      : '',
    BODY_CONTENT: body,
  });
}
