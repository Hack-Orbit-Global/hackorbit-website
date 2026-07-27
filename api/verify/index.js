/**
 * api/verify/index.js
 * GET /api/certificates/verify?id=CERT_ID
 * Public JSON endpoint for client-side form lookups (verify.html).
 * Rate limiting handled at the Vercel edge level via vercel.json headers.
 */
'use strict';
const { callAppsScript } = require('../../lib/appsScriptClient');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end('Method Not Allowed');

  const certId = (req.query?.id || '').trim().toUpperCase();
  if (!certId) {
    return res.status(400).json({ ok: false, error_code: 'MISSING_ID', message: 'id query param required' });
  }

  try {
    const result = await callAppsScript('verifyCertificate', { certificate_id: certId });
    // Apps Script returns { ok:true, found:false } or { ok:true, found:true, certificate:{...} }
    res.setHeader('Cache-Control', 'no-store'); // verification must always be fresh
    return res.status(200).json(result);
  } catch (err) {
    console.error('[verify/index]', err);
    return res.status(500).json({ ok: false, error_code: 'INTERNAL_ERROR', message: 'Verification lookup failed' });
  }
};
