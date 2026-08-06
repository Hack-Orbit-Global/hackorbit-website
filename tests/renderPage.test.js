import { test } from 'node:test';
import assert from 'node:assert/strict';
import { escapeHtml } from '../lib/html/escapeHtml.js';
import { notFoundPage, renderProfileBody, renderVerifyResultBody } from '../lib/html/renderPage.js';

test('escapeHtml escapes HTML special characters', () => {
  assert.equal(escapeHtml('<script>"&\'</script>'), '&lt;script&gt;&quot;&amp;&#39;&lt;/script&gt;');
  assert.equal(escapeHtml(null), '');
  assert.equal(escapeHtml(undefined), '');
  assert.equal(escapeHtml(42), '42');
});

test('notFoundPage renders a single-h1 noindex HTML document', () => {
  const html = notFoundPage('HO-999999');
  assert.match(html, /<!doctype html>/i);
  assert.equal((html.match(/<h1\b/gi) || []).length, 1);
  assert.match(html, /No member found for HO-999999/);
  assert.match(html, /noindex/);
});

test('renderProfileBody escapes user-provided fields', () => {
  const member = {
    member_id: 'HO-000001',
    display_name: '<img onerror=alert(1)>',
    bio: 'Hello <script>',
    skills: ['<svg onload=x>', 'Python'],
    github_username: 'sabarna',
    is_founder: true,
    joined_at: '2026-01-01T00:00:00Z',
    contributions: [],
    badges: [{ status: 'active', name: '<b>', icon_url: '', awarded_at: '2026-01-01T00:00:00Z' }],
    certificates: [],
    projects: [],
  };
  const html = renderProfileBody(member);
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('<svg onload'));
  assert.ok(!html.includes('<img onerror'));
  assert.equal((html.match(/<h1\b/gi) || []).length, 1);
});

test('renderVerifyResultBody renders a valid certificate without file links', () => {
  const html = renderVerifyResultBody({
    certificate_id: 'HO-CERT-2026-000001',
    status: 'valid',
    type: 'participation',
    recipient_name: 'Ada',
    member_id: 'HO-000042',
    issued_by: 'Hack Orbit',
    issue_date: '2026-07-01',
    achievement_description: 'Built a thing',
  });
  assert.match(html, /HO-CERT-2026-000001/);
  assert.match(html, /Valid/);
  assert.ok(!html.includes('href="'));

  const revoked = renderVerifyResultBody({ certificate_id: 'HO-CERT-2026-000001', status: 'revoked', type: 'winner' });
  assert.match(revoked, /Revoked/);
});
