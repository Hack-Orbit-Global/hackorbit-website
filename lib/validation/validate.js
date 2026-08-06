export class ValidationError extends Error {
  constructor(message, code = 'VALIDATION_ERROR') {
    super(message);
    this.name = 'ValidationError';
    this.code = code;
    this.status = 400;
  }
}

export const PATTERNS = {
  memberId: /^HO-\d{6}$/,
  certificateId: /^HO-CERT-\d{4}-\d{6}$/,
  badgeId: /^badge_[a-z0-9_]+$/,
  provider: /^(google|github|discord)$/,
};

export function isMemberId(value) {
  return typeof value === 'string' && PATTERNS.memberId.test(value);
}

export function isCertificateId(value) {
  return typeof value === 'string' && PATTERNS.certificateId.test(value);
}

export function assert(condition, message, code = 'VALIDATION_ERROR') {
  if (!condition) throw new ValidationError(message, code);
}

export function assertString(value, message) {
  assert(typeof value === 'string' && value.trim().length > 0, message);
  return value.trim();
}

export function assertOptionalString(value, message, maxLength = 2000) {
  if (value === undefined || value === null || value === '') return undefined;
  assert(typeof value === 'string', message);
  assert(value.length <= maxLength, `${message} (max ${maxLength} chars)`);
  return value.trim();
}

export function assertOptionalArray(value, message) {
  if (value === undefined || value === null) return undefined;
  assert(Array.isArray(value), message);
  return value.map((item) => String(item).trim()).filter(Boolean).slice(0, 20);
}

export function assertOptionalUrl(value, message) {
  const result = assertOptionalString(value, message, 500);
  if (result === undefined) return undefined;
  try {
    const url = new URL(result);
    assert(/^https?:$/.test(url.protocol), `${message} must be an http(s) URL`);
    return url.toString();
  } catch {
    throw new ValidationError(`${message} must be a valid URL`);
  }
}
