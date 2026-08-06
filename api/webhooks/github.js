import { json, error } from '../../lib/session.js';
import { readRawBody } from '../../lib/http.js';
import { verifyWebhookSignature, extractContribution, GithubError } from '../../lib/github.js';
import { callAppsScript } from '../../lib/appsScriptClient.js';

const ORG = process.env.GITHUB_ORG_NAME;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    return res.end();
  }

  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[webhooks/github] GITHUB_WEBHOOK_SECRET not configured');
    return error(res, 500, 'WEBHOOK_CONFIG', 'Webhook not configured.');
  }

  let rawBody;
  try {
    rawBody = await readRawBody(req);
  } catch {
    return error(res, 400, 'BAD_PAYLOAD', 'Unable to read payload.');
  }

  try {
    verifyWebhookSignature(rawBody, req.headers['x-hub-signature-256'], secret);
  } catch (err) {
    return error(res, err.status || 401, err.code || 'INVALID_SIGNATURE', err.message);
  }

  const eventName = req.headers['x-github-event'];
  const deliveryId = req.headers['x-github-delivery'];

  if (!eventName || !deliveryId) {
    return error(res, 400, 'BAD_PAYLOAD', 'Missing GitHub event headers.');
  }

  let payload;
  try {
    payload = rawBody ? JSON.parse(rawBody) : null;
  } catch {
    return error(res, 400, 'BAD_PAYLOAD', 'Invalid JSON payload.');
  }

  const contribution = extractContribution(eventName, payload);
  if (!contribution) {
    return json(res, 200, { ok: true, processed: false, reason: 'event_not_tracked' });
  }

  if (ORG && contribution.repo) {
    const repoOrg = contribution.repo.split('/')[0];
    if (repoOrg !== ORG) {
      return json(res, 200, { ok: true, processed: false, reason: 'repo_out_of_scope' });
    }
  }

  try {
    const member = await callAppsScript('getMemberByGithubUsername', {
      github_username: contribution.github_username,
    });

    if (!member) {
      return json(res, 200, { ok: true, processed: false, reason: 'actor_unresolved' });
    }

    await callAppsScript('addContribution', {
      contribution_id: deliveryId,
      member_id: member.member_id,
      type: contribution.type,
      repo: contribution.repo,
      reference_url: contribution.reference_url,
      occurred_at: contribution.occurred_at,
      source: 'webhook',
    });

    return json(res, 200, { ok: true, processed: true, member_id: member.member_id });
  } catch (err) {
    if (err.code === 'DUPLICATE_CONTRIBUTION') {
      return json(res, 200, { ok: true, processed: false, reason: 'duplicate' });
    }
    if (err.code === 'MEMBER_NOT_FOUND') {
      return json(res, 200, { ok: true, processed: false, reason: 'actor_unresolved' });
    }
    console.error('[webhooks/github]', err);
    return error(res, 500, 'PROCESSING_ERROR', 'Contribution processing failed.');
  }
}
