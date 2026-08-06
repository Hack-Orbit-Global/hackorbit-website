import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

process.env.APPS_SCRIPT_URL = 'https://script.google.com/macros/s/TEST/exec';
process.env.HO_SERVICE_KEY = 'service-key';

const { callAppsScript, AppsScriptError } = await import('../lib/appsScriptClient.js');

let capturedRequests = [];

beforeEach(() => {
  capturedRequests = [];
});

function mockFetch(response) {
  global.fetch = async (url, options) => {
    capturedRequests.push({ url, options });
    if (response instanceof Error) throw response;
    return response;
  };
}

function jsonResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async text() {
      return JSON.stringify(body);
    },
  };
}

test('callAppsScript posts action + payload + service key and returns result', async () => {
  mockFetch(jsonResponse({ ok: true, result: { member_id: 'HO-000042' } }));
  const result = await callAppsScript('getMember', { member_id: 'HO-000042' });
  assert.deepEqual(result, { member_id: 'HO-000042' });

  const req = capturedRequests[0];
  assert.equal(req.url, process.env.APPS_SCRIPT_URL);
  const body = JSON.parse(req.options.body);
  assert.equal(body.action, 'getMember');
  assert.deepEqual(body.payload, { member_id: 'HO-000042' });
  assert.equal(body.service_key, 'service-key');
  assert.equal(req.options.headers['X-HO-Service-Key'], 'service-key');
  assert.equal(req.options.headers['Content-Type'], 'application/json');
});

test('callAppsScript surfaces error_code from the web app', async () => {
  mockFetch(jsonResponse({ ok: false, error_code: 'MEMBER_NOT_FOUND', message: 'No such member.' }));
  await assert.rejects(() => callAppsScript('getMember', { member_id: 'HO-999999' }), (err) => {
    assert.ok(err instanceof AppsScriptError);
    assert.equal(err.code, 'MEMBER_NOT_FOUND');
    assert.equal(err.message, 'No such member.');
    return true;
  });
});

test('callAppsScript retries on network failure then throws', async () => {
  let calls = 0;
  global.fetch = async () => {
    calls += 1;
    throw new Error('network down');
  };
  await assert.rejects(() => callAppsScript('getMember', {}), /network down/);
  assert.equal(calls, 3);
});

test('callAppsScript throws when APPS_SCRIPT_URL is missing at load', async () => {
  const originalUrl = process.env.APPS_SCRIPT_URL;
  const originalGas = process.env.GAS_WEBAPP_URL;
  const originalKey = process.env.HO_SERVICE_KEY;
  delete process.env.APPS_SCRIPT_URL;
  delete process.env.GAS_WEBAPP_URL;
  delete process.env.HO_SERVICE_KEY;
  try {
    const fresh = await import('../lib/appsScriptClient.js?missing-url');
    await assert.rejects(() => fresh.callAppsScript('getMember', {}), (err) => {
      assert.equal(err.name, 'AppsScriptError');
      assert.equal(err.code, 'APPS_SCRIPT_CONFIG');
      return true;
    });
  } finally {
    if (originalUrl !== undefined) process.env.APPS_SCRIPT_URL = originalUrl;
    if (originalGas !== undefined) process.env.GAS_WEBAPP_URL = originalGas;
    if (originalKey !== undefined) process.env.HO_SERVICE_KEY = originalKey;
  }
});
