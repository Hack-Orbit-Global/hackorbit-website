import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isMemberId,
  isCertificateId,
  assertString,
  assertOptionalString,
  assertOptionalArray,
  assertOptionalUrl,
  ValidationError,
} from '../lib/validation/validate.js';

test('isMemberId matches HO-XXXXXX format only', () => {
  assert.equal(isMemberId('HO-000001'), true);
  assert.equal(isMemberId('HO-123456'), true);
  assert.equal(isMemberId('HO-1'), false);
  assert.equal(isMemberId('XX-000001'), false);
  assert.equal(isMemberId('HO-00001a'), false);
  assert.equal(isMemberId(null), false);
});

test('isCertificateId matches HO-CERT-YYYY-XXXXXX format only', () => {
  assert.equal(isCertificateId('HO-CERT-2026-000001'), true);
  assert.equal(isCertificateId('HO-CERT-2025-000042'), true);
  assert.equal(isCertificateId('HO-CERT-2026-1'), false);
  assert.equal(isCertificateId('CERT-2026-000001'), false);
  assert.equal(isCertificateId('HO-CERT-26-000001'), false);
});

test('assertString trims and requires non-empty', () => {
  assert.equal(assertString('  hello  ', 'required'), 'hello');
  assert.throws(() => assertString('', 'required'), ValidationError);
  assert.throws(() => assertString('   ', 'required'), ValidationError);
  assert.throws(() => assertString(42, 'required'), ValidationError);
});

test('assertOptionalString caps length', () => {
  assert.equal(assertOptionalString('x', 'field', 5), 'x');
  assert.equal(assertOptionalString(undefined, 'field'), undefined);
  assert.throws(() => assertOptionalString('toolong', 'field', 3), ValidationError);
});

test('assertOptionalArray normalises and caps entries', () => {
  const out = assertOptionalArray([' A ', 'B', '', 3], 'field');
  assert.deepEqual(out, ['A', 'B', '3']);
  assert.equal(assertOptionalArray(undefined, 'field'), undefined);
  assert.throws(() => assertOptionalArray('nope', 'field'), ValidationError);
});

test('assertOptionalUrl validates http(s) URLs', () => {
  assert.equal(assertOptionalUrl('https://github.com/x', 'link'), 'https://github.com/x');
  assert.equal(assertOptionalUrl(undefined, 'link'), undefined);
  assert.throws(() => assertOptionalUrl('not a url', 'link'), ValidationError);
  assert.throws(() => assertOptionalUrl('javascript:alert(1)', 'link'), ValidationError);
  assert.throws(() => assertOptionalUrl('ftp://example.com', 'link'), ValidationError);
});
