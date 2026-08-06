import { exchangeGithubCode, getGithubUser } from '../../../lib/oauth/github.js';
import { getOAuthStateCookie, clearOAuthStateCookie } from '../../../lib/oauth/stateCookie.js';
import { getSessionCookie, verifySession, signSession, setSessionCookie, redirect } from '../../../lib/session.js';
import { callAppsScript } from '../../../lib/appsScriptClient.js';
import { getBaseUrl } from '../../../lib/http.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    return res.end();
  }

  const token = getSessionCookie(req);
  const oauthState = getOAuthStateCookie(req);
  const { code, state, error } = req.query;

  const fail = (codeStr) => redirect(res, `/join?error=${codeStr || 'github_failed'}`);

  if (error || !code || !state) return fail();
  if (!token) return fail('unauthenticated');
  if (!oauthState || oauthState.provider !== 'github' || oauthState.state !== state) return fail('state_mismatch');

  let session;
  try {
    session = await verifySession(token);
  } catch {
    return fail('session_expired');
  }

  try {
    const oauthToken = await exchangeGithubCode({
      code,
      redirectUri: getBaseUrl(req) + '/api/auth/github/callback',
    });
    const ghUser = await getGithubUser(oauthToken.access_token);

    await callAppsScript('linkIdentity', {
      google_sub: session.google_sub,
      provider: 'github',
      provider_account_id: String(ghUser.id),
      github_username: ghUser.login,
    });

    clearOAuthStateCookie(res);

    const updated = await signSession({
      ...session,
      github_username: ghUser.login,
      step: 'github',
    });
    setSessionCookie(res, updated);
    return redirect(res, '/join');
  } catch (err) {
    console.error('[auth/github/callback]', err);
    const codeStr = err.code || 'github_failed';
    return fail(codeStr === 'GITHUB_ALREADY_LINKED' ? 'github_already_linked' : 'github_failed');
  }
}
