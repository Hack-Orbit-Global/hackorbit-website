import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

process.env.APPS_SCRIPT_URL = 'https://script.google.com/macros/s/TEST/exec';

let captured = [];

beforeEach(() => {
  captured = [];
});

function mockFetch(response) {
  global.fetch = async (url, options) => {
    captured.push({ url, options });
    if (response instanceof Error) throw response;
    return response;
  };
}

function jsonResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() {
      return body;
    },
  };
}

async function invokeHandler(req) {
  const { default: handler } = await import('../api/health.js?case=' + Math.random());
  let body = '';
  const res = {
    statusCode: 0,
    headers: {},
    setHeader(k, v) {
      this.headers[k] = v;
    },
    end(chunk) {
      body = chunk || '';
    },
  };
  await handler(req, res);
  return { res, body: body ? JSON.parse(body) : null };
}

test('health returns 200 healthy when Apps Script doGet responds ok', async () => {
  mockFetch(jsonResponse({ ok: true, service: 'hack-orbit-webapp', ts: '2026-01-01T00:00:00Z' }));
  const { res, body } = await invokeHandler({ method: 'GET', headers: {} });
  assert.equal(res.statusCode, 200);
  assert.equal(body.status, 'healthy');
  assert.equal(body.ok, true);
  assert.equal(body.checks.apps_script.status, 'healthy');
  assert.ok(body.checks.apps_script.latency_ms >= 0);
  assert.equal(captured.length, 1);
  assert.equal(captured[0].url, process.env.APPS_SCRIPT_URL);
  assert.equal(captured[0].options.method, 'GET');
});

test('health returns 503 degraded when Apps Script reports unhealthy', async () => {
  mockFetch(jsonResponse({ ok: false, error_code: 'INTERNAL_ERROR' }, 500));
  const { res, body } = await invokeHandler({ method: 'GET', headers: {} });
  assert.equal(res.statusCode, 503);
  assert.equal(body.checks.apps_script.status, 'unhealthy');
});

test('health returns 503 degraded when Apps Script is unreachable', async () => {
  mockFetch(new Error('network down'));
  const { res, body } = await invokeHandler({ method: 'GET', headers: {} });
  assert.equal(res.statusCode, 503);
  assert.equal(body.checks.apps_script.status, 'unhealthy');
});

test('health returns 503 degraded when APPS_SCRIPT_URL is missing', async () => {
  const originalUrl = process.env.APPS_SCRIPT_URL;
  const originalGas = process.env.GAS_WEBAPP_URL;
  delete process.env.APPS_SCRIPT_URL;
  delete process.env.GAS_WEBAPP_URL;
  try {
    mockFetch(jsonResponse({ ok: true }));
    const { res, body } = await invokeHandler({ method: 'GET', headers: {} });
    assert.equal(res.statusCode, 503);
    assert.equal(body.checks.apps_script.status, 'not_configured');
  } finally {
    if (originalUrl !== undefined) process.env.APPS_SCRIPT_URL = originalUrl;
    if (originalGas !== undefined) process.env.GAS_WEBAPP_URL = originalGas;
  }
});

test('health returns 405 for non-GET methods', async () => {
  const { res } = await invokeHandler({ method: 'POST', headers: {} });
  assert.equal(res.statusCode, 405);
  assert.equal(res.headers.Allow, 'GET');
});
