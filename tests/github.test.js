import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import {
  verifyWebhookSignature,
  extractContribution,
  reconciliationKey,
  GithubError,
} from '../lib/github.js';

const SECRET = 'webhook-secret';

function signature(body, secret = SECRET) {
  return `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`;
}

test('verifyWebhookSignature accepts a valid signature', () => {
  const body = '{"hello":1}';
  assert.doesNotThrow(() => verifyWebhookSignature(body, signature(body), SECRET));
});

test('verifyWebhookSignature rejects a bad signature', () => {
  assert.throws(() => verifyWebhookSignature('{"hello":1}', 'sha256=deadbeef', SECRET), GithubError);
});

test('verifyWebhookSignature rejects tampered bodies', () => {
  const body = '{"hello":1}';
  assert.throws(() => verifyWebhookSignature(body + 't', signature(body), SECRET), GithubError);
});

test('verifyWebhookSignature rejects missing signature header', () => {
  assert.throws(() => verifyWebhookSignature('{}', undefined, SECRET), GithubError);
});

test('extractContribution handles a merged pull_request event', () => {
  const out = extractContribution('pull_request', {
    action: 'closed',
    repository: { full_name: 'HackOrbit/mars', owner: { login: 'HackOrbit' } },
    pull_request: {
      merged: true,
      merged_at: '2026-07-01T10:00:00Z',
      html_url: 'https://github.com/HackOrbit/mars/pull/12',
      user: { login: 'ada', type: 'User' },
    },
  });
  assert.ok(out);
  assert.equal(out.github_username, 'ada');
  assert.equal(out.type, 'pr_merged');
  assert.equal(out.repo, 'HackOrbit/mars');
  assert.equal(out.reference_url, 'https://github.com/HackOrbit/mars/pull/12');
});

test('extractContribution ignores unmerged PRs', () => {
  const out = extractContribution('pull_request', {
    action: 'opened',
    repository: { full_name: 'HackOrbit/mars' },
    pull_request: { merged: false, user: { login: 'ada' } },
  });
  assert.equal(out, null);
});

test('extractContribution ignores bots', () => {
  const out = extractContribution('issues', {
    action: 'closed',
    repository: { full_name: 'HackOrbit/mars' },
    issue: { user: { login: 'dependabot[bot]', type: 'Bot' }, closed_at: '2026-07-01T10:00:00Z' },
  });
  assert.equal(out, null);
});

test('extractContribution handles closed issues', () => {
  const out = extractContribution('issues', {
    action: 'closed',
    repository: { full_name: 'HackOrbit/mars' },
    issue: {
      user: { login: 'grace', type: 'User' },
      closed_at: '2026-07-02T10:00:00Z',
      html_url: 'https://github.com/HackOrbit/mars/issues/5',
    },
  });
  assert.ok(out);
  assert.equal(out.type, 'issue');
});

test('extractContribution handles submitted reviews', () => {
  const out = extractContribution('pull_request_review', {
    action: 'submitted',
    repository: { full_name: 'HackOrbit/mars' },
    review: {
      user: { login: 'linus', type: 'User' },
      submitted_at: '2026-07-03T10:00:00Z',
      html_url: 'https://github.com/HackOrbit/mars/pull/12#pullrequestreview-1',
    },
  });
  assert.ok(out);
  assert.equal(out.type, 'review');
});

test('reconciliationKey is deterministic', () => {
  assert.equal(reconciliationKey('HackOrbit/mars', 12, 'pr'), reconciliationKey('HackOrbit/mars', 12, 'pr'));
  assert.notEqual(reconciliationKey('HackOrbit/mars', 12, 'pr'), reconciliationKey('HackOrbit/mars', 13, 'pr'));
});
