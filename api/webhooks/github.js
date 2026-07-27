/**
 * api/webhooks/github.js
 * POST /api/webhooks/github
 * Validates GitHub HMAC signature, ingests PR merge / issue / review events.
 *
 * Env vars required:
 *   GITHUB_WEBHOOK_SECRET
 */
'use strict';
const crypto             = require('crypto');
const { callAppsScript } = require('../../lib/appsScriptClient');

async function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function verifySignature(rawBody, sigHeader) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(sigHeader), Buffer.from(expected));
  } catch { return false; }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const rawBody = await readRawBody(req);
  const sig     = req.headers['x-hub-signature-256'] || '';

  if (!verifySignature(rawBody, sig)) {
    return res.status(401).json({ ok: false, error_code: 'INVALID_SIGNATURE' });
  }

  const event   = req.headers['x-github-event'];
  const payload = JSON.parse(rawBody.toString('utf8'));
  const deliveryId = req.headers['x-github-delivery'] || crypto.randomUUID();

  // Only act on merged pull_request events for now
  if (event === 'pull_request' && payload.action === 'closed' && payload.pull_request?.merged) {
    const login = payload.pull_request.user?.login;
    if (!login) return res.status(200).json({ ok: true, skipped: 'no_user_login' });

    try {
      // Resolve GitHub login → member_id (Apps Script does the lookup)
      await callAppsScript('addContribution', {
        contribution_id: deliveryId,
        github_login:    login,
        type:            'pr_merged',
        repo:            payload.repository?.full_name || '',
        reference_url:   payload.pull_request?.html_url || '',
        occurred_at:     payload.pull_request?.merged_at || new Date().toISOString(),
        source:          'webhook',
      });
    } catch (err) {
      console.error('[webhooks/github] addContribution failed:', err.message);
      // Return 500 so GitHub retries
      return res.status(500).json({ ok: false, message: err.message });
    }
  }

  res.status(200).json({ ok: true, event });
};
