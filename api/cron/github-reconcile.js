/**
 * api/cron/github-reconcile.js
 * Vercel Cron job: reconciles GitHub org contributions on a schedule.
 * Called by Vercel's cron system — verifies the request is internal.
 *
 * vercel.json cron config:
 *   { "path": "/api/cron/github-reconcile", "schedule": "0 3 * * *" }
 */
'use strict';
const { callAppsScript } = require('../../lib/appsScriptClient');

const GITHUB_ORG  = process.env.GITHUB_ORG || 'hackorbit';
const GITHUB_TOKEN = process.env.GITHUB_ORG_TOKEN; // fine-grained PAT with read:org, read:repo

async function fetchOrgPRs() {
  if (!GITHUB_TOKEN) throw new Error('GITHUB_ORG_TOKEN not set');
  const since = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(); // last 25h window

  const res = await fetch(
    `https://api.github.com/orgs/${GITHUB_ORG}/events?per_page=100`,
    {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept:        'application/vnd.github+json',
        'User-Agent':  'HackOrbit-Cron/1.0',
      },
    }
  );
  if (!res.ok) throw new Error(`GitHub events API failed: ${res.status}`);
  const events = await res.json();

  // Filter merged PR events within the window
  return events.filter(e =>
    e.type === 'PullRequestEvent' &&
    e.payload?.action === 'closed' &&
    e.payload?.pull_request?.merged &&
    new Date(e.created_at) >= new Date(since)
  );
}

module.exports = async (req, res) => {
  // Vercel sets this header on cron invocations; reject anything else
  if (req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ ok: false, error_code: 'UNAUTHORIZED' });
  }

  try {
    const events = await fetchOrgPRs();
    const results = await Promise.allSettled(
      events.map(e =>
        callAppsScript('addContribution', {
          contribution_id: e.id,
          github_login:    e.actor?.login,
          type:            'pr_merged',
          repo:            e.repo?.name || '',
          reference_url:   e.payload?.pull_request?.html_url || '',
          occurred_at:     e.payload?.pull_request?.merged_at || e.created_at,
          source:          'reconciliation',
        })
      )
    );

    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    const failed    = results.filter(r => r.status === 'rejected').length;

    console.log(`[cron/github-reconcile] processed ${events.length} events: ${succeeded} ok, ${failed} failed`);
    res.status(200).json({ ok: true, processed: events.length, succeeded, failed });
  } catch (err) {
    console.error('[cron/github-reconcile]', err);
    res.status(500).json({ ok: false, message: err.message });
  }
};
