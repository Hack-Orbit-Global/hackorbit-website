import { createHmac, timingSafeEqual } from 'node:crypto';

export class GithubError extends Error {
  constructor(message, code, status = 500) {
    super(message);
    this.name = 'GithubError';
    this.code = code;
    this.status = status;
  }
}

export function verifyWebhookSignature(rawBody, signatureHeader, secret) {
  if (!signatureHeader) throw new GithubError('Missing signature header', 'INVALID_SIGNATURE', 401);
  const [algo, provided] = signatureHeader.split('=', 2);
  if (algo !== 'sha256' || !provided) {
    throw new GithubError('Unsupported signature', 'INVALID_SIGNATURE', 401);
  }
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  const a = Buffer.from(provided, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new GithubError('Signature mismatch', 'INVALID_SIGNATURE', 401);
  }
}

function sha256Hex(input) {
  return createHmac('sha256', input).digest('hex');
}

export function reconciliationKey(repo, number, type) {
  return sha256Hex(`${repo}|${number}|${type}`);
}

function isBot(login) {
  return /\[bot\]$/.test(login || '') || /^bot\b/i.test(login || '');
}

export function extractContribution(eventName, payload) {
  const repo = payload.repository ? payload.repository.full_name : '';
  const owner = payload.repository ? payload.repository.owner : null;

  if (eventName === 'pull_request' && payload.pull_request) {
    const pr = payload.pull_request;
    if (pr.user && isBot(pr.user.login)) return null;
    if (pr.user && pr.user.type === 'Bot') return null;
    const isMerged = pr.merged === true || (payload.action === 'closed' && pr.merged_at);
    if (!isMerged) return null;
    return {
      github_username: pr.user ? pr.user.login : null,
      type: 'pr_merged',
      repo,
      reference_url: pr.html_url || '',
      occurred_at: pr.merged_at || payload.created_at || new Date().toISOString(),
    };
  }

  if (eventName === 'issues' && payload.issue) {
    if (payload.action !== 'closed') return null;
    const issue = payload.issue;
    if (issue.user && isBot(issue.user.login)) return null;
    if (issue.user && issue.user.type === 'Bot') return null;
    return {
      github_username: issue.user ? issue.user.login : null,
      actor_is_org: false,
      type: 'issue',
      repo,
      reference_url: issue.html_url || '',
      occurred_at: issue.closed_at || payload.created_at || new Date().toISOString(),
    };
  }

  if (eventName === 'pull_request_review' && payload.review) {
    if (payload.action !== 'submitted') return null;
    const review = payload.review;
    if (review.user && isBot(review.user.login)) return null;
    if (review.user && review.user.type === 'Bot') return null;
    return {
      github_username: review.user ? review.user.login : null,
      actor_is_org: false,
      type: 'review',
      repo,
      reference_url: review.html_url || '',
      occurred_at: review.submitted_at || new Date().toISOString(),
    };
  }

  return null;
}

export async function githubFetch(path, token, options = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      Authorization: `Bearer ${token}`,
      'User-Agent': 'hack-orbit-website',
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    if (res.status === 403 || res.status === 429) {
      const reset = res.headers.get('x-ratelimit-reset');
      throw new GithubError(`GitHub rate limited (${res.status})`, 'GITHUB_RATE_LIMITED', 429);
    }
    throw new GithubError(`GitHub API error ${res.status}`, 'GITHUB_API_ERROR', res.status);
  }
  return res.json();
}
