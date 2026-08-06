import { getSessionCookie, verifySession, signSession, setSessionCookie, json, error } from '../../lib/session.js';
import { callAppsScript } from '../../lib/appsScriptClient.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    return res.end();
  }

  const token = getSessionCookie(req);
  if (!token) return error(res, 401, 'UNAUTHENTICATED', 'You must be signed in.');

  let session;
  try {
    session = await verifySession(token);
  } catch {
    return error(res, 401, 'UNAUTHENTICATED', 'Your session has expired.');
  }

  if (session.status === 'verified') {
    return json(res, 200, { member_id: session.member_id, status: 'verified' });
  }

  try {
    const result = await callAppsScript('finalizeVerificationByGoogleSub', { google_sub: session.google_sub });

    const updated = await signSession({
      ...session,
      member_id: result.member_id,
      status: 'verified',
      step: 'finalized',
    });
    setSessionCookie(res, updated);

    return json(res, 200, { member_id: result.member_id, status: 'verified' });
  } catch (err) {
    console.error('[identity/finalize]', err);
    const code = err.code || 'FINALIZE_FAILED';
    const message =
      err.code === 'INCOMPLETE_VERIFICATION'
        ? 'Connect Google, GitHub, and Discord before completing verification.'
        : err.message || 'Verification failed.';
    return error(res, err.status || 400, code, message);
  }
}
