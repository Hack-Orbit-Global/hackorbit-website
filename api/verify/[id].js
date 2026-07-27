/**
 * api/verify/[id].js
 * GET /verify-result/:certificate_id
 * Server-renders a shareable, indexable HTML certificate result page (OG-friendly).
 */
'use strict';
const { callAppsScript } = require('../../lib/appsScriptClient');
const { renderPage }     = require('../../lib/html/renderPage');

function fmtDate(d) {
  try { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); }
  catch { return d || 'N/A'; }
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end('Method Not Allowed');
  const certId = (req.query?.id || '').trim().toUpperCase();

  try {
    const result = await callAppsScript('verifyCertificate', { certificate_id: certId });

    if (!result.found) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send('<h1>Certificate not found</h1><a href="/verify">← Verify another</a>');
    }

    const c = result.certificate;
    const isValid = c.status === 'valid';

    const html = renderPage('verify-result.template.html', {
      CERT_ID:                  c.certificate_id,
      CERT_TYPE:                c.type,
      DISPLAY_NAME:             c.display_name,
      MEMBER_ID:                c.member_id,
      BIO:                      '',
      ACHIEVEMENT_DESCRIPTION:  c.achievement_description,
      EVENT_NAME:               c.event_name || 'N/A',
      ISSUED_BY:                c.issued_by || 'Hack Orbit',
      COLLABORATING_ORG:        c.collaborating_org
        ? `<p class="text-muted" style="font-size:.875rem;margin-top:.25rem;">${c.collaborating_org}</p>`
        : '',
      ISSUE_DATE:               fmtDate(c.issue_date),
      STATUS_LABEL:             isValid ? 'LEDGER STATUS: VERIFIED' : 'LEDGER STATUS: REVOKED',
      STATUS_BG:                isValid ? 'var(--color-accent-green-light)' : 'var(--color-accent-red-light)',
      STATUS_BORDER:            isValid ? 'var(--color-accent-green)' : 'var(--color-accent-red)',
      STATUS_COLOR:             isValid ? 'var(--color-accent-green)' : 'var(--color-accent-red)',
      STATUS_CLASS:             isValid ? 'status status-valid' : 'status status-revoked',
      STATUS_TEXT:              isValid ? 'VALID' : 'REVOKED',
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
    res.status(200).send(html);
  } catch (err) {
    console.error('[verify/[id]]', err);
    res.status(500).send('<h1>Internal Server Error</h1>');
  }
};
