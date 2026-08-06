import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_SECRET = 'test-secret-that-is-long-enough-for-hs256';

const { signSession, verifySession, parseCookies, getSessionCookie } = await import('../lib/session.js');

test('signSession then verifySession round-trips payload', async () => {
  const token = await signSession({ google_sub: 'g-1', member_id: 'HO-000042', status: 'pending' });
  const payload = await verifySession(token);
  assert.equal(payload.google_sub, 'g-1');
  assert.equal(payload.member_id, 'HO-000042');
  assert.equal(payload.status, 'pending');
  assert.ok(payload.iat);
  assert.ok(payload.exp);
});

test('verifySession rejects tampered tokens', async () => {
  const token = await signSession({ google_sub: 'g-1' });
  const [h, p, s] = token.split('.');
  const tampered = [h, p, 'AAAA'].join('.');
  await assert.rejects(() => verifySession(tampered));
});

test('verifySession rejects tokens signed with a different secret', async () => {
  process.env.JWT_SECRET = 'another-different-test-secret';
  const token = await signSession({ google_sub: 'g-1' });
  process.env.JWT_SECRET = 'test-secret-that-is-long-enough-for-hs256';
  await assert.rejects(() => verifySession(token));
});

test('parseCookies parses and decodes cookie headers', () => {
  const cookies = parseCookies('a=1; ho_session=hello%20world; b=two');
  assert.deepEqual(cookies, { a: '1', ho_session: 'hello world', b: 'two' });
  assert.deepEqual(parseCookies(undefined), {});
});

test('getSessionCookie extracts the ho_session cookie', () => {
  const req = { headers: { cookie: 'ho_session=abc; other=1' } };
  assert.equal(getSessionCookie(req), 'abc');
  assert.equal(getSessionCookie({ headers: {} }), null);
});
