import { json, error } from '../../lib/session.js';
import { githubFetch, reconciliationKey, GithubError } from '../../lib/github.js';
import { callAppsScript } from '../../lib/appsScriptClient.js';

const ORG = process.env.GITHUB_ORG_NAME;
const TOKEN = process.env.GITHUB_TOKEN;
const WINDOW_MS = 12 * 60 * 60 * 1000;

async function paginate(path, perPage = 100, maxPages = 10) {
  const items = [];
  for (let page = 1; page <= maxPages; page += 1) {
    const sep = path.includes('?') ? '&' : '?';
    const batch = await githubFetch(`${path}${sep}per_page=${perPage}&page=${page}`, TOKEN);
    if (!Array.isArray(batch) || batch.length === 0) break;
    items.push(...batch);
    if (batch.length < perPage) break;
  }
  return items;
}

async function reconcile() {
  const stats = { repos: 0, prs: 0, issues: 0, attributed: 0, duplicates: 0, unresolved: 0, failed: 0 };

  const repos = await paginate(`/orgs/${ORG}/repos`);
  stats.repos = repos.length;

  const since = new Date(Date.now() - WINDOW_MS).toISOString();

  for (const repo of repos) {
    const fullName = repo.full_name;

    const pulls = await paginate(`/repos/${fullName}/pulls?state=closed&sort=updated&direction=desc&since=${encodeURIComponent(since)}`, 50);
    for (const pr of pulls) {
      if (!pr.merged_at) continue;
      if (new Date(pr.merged_at) < new Date(since)) continue;
      stats.prs += 1;
      if (pr.user && pr.user.type === 'Bot') continue;
      await ingest({
        contribution_id: reconciliationKey(fullName, pr.number, 'pr'),
        github_username: pr.user ? pr.user.login : null,
        type: 'pr_merged',
        repo: fullName,
        reference_url: pr.html_url || '',
        occurred_at: pr.merged_at,
        stats,
      });
    }

    const issues = await paginate(`/repos/${fullName}/issues?state=closed&sort=updated&direction=desc&since=${encodeURIComponent(since)}`, 50);
    for (const issue of issues) {
      if (issue.pull_request) continue;
      if (!issue.closed_at) continue;
      if (new Date(issue.closed_at) < new Date(since)) continue;
      stats.issues += 1;
      if (issue.user && issue.user.type === 'Bot') continue;
      await ingest({
        contribution_id: reconciliationKey(fullName, issue.number, 'issue'),
        github_username: issue.user ? issue.user.login : null,
        type: 'issue',
        repo: fullName,
        reference_url: issue.html_url || '',
        occurred_at: issue.closed_at,
        stats,
      });
    }
  }

  return stats;
}

async function ingest(item) {
  try {
    const member = await callAppsScript('getMemberByGithubUsername', {
      github_username: item.github_username,
    });
    if (!member) {
      item.stats.unresolved += 1;
      return;
    }
    try {
      await callAppsScript('addContribution', {
        contribution_id: item.contribution_id,
        member_id: member.member_id,
        type: item.type,
        repo: item.repo,
        reference_url: item.reference_url,
        occurred_at: item.occurred_at,
        source: 'reconciliation',
      });
      item.stats.attributed += 1;
    } catch (err) {
      if (err.code === 'DUPLICATE_CONTRIBUTION') item.stats.duplicates += 1;
      else {
        item.stats.failed += 1;
        console.error('[cron/github-reconcile] addContribution failed', err.message);
      }
    }
  } catch (err) {
    item.stats.failed += 1;
    console.error('[cron/github-reconcile] resolution failed', err.message);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    return res.end();
  }

  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.authorization || '';
    if (auth !== `Bearer ${cronSecret}`) {
      return error(res, 401, 'UNAUTHORIZED', 'Invalid cron authorization.');
    }
  }

  if (!ORG || !TOKEN) {
    return json(res, 200, { ok: true, skipped: true, reason: 'GITHUB_ORG_NAME/GITHUB_TOKEN not configured' });
  }

  try {
    const stats = await reconcile();
    return json(res, 200, { ok: true, ...stats });
  } catch (err) {
    if (err instanceof GithubError && err.code === 'GITHUB_RATE_LIMITED') {
      return json(res, 200, { ok: false, skipped: true, reason: 'github_rate_limited' });
    }
    console.error('[cron/github-reconcile]', err);
    return error(res, 500, 'RECONCILE_FAILED', 'Reconciliation failed.');
  }
}
