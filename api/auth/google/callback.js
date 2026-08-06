import { exchangeGoogleCode, getGoogleUser } from '../../../lib/oauth/google.js';
import { redirectUri } from '../../../lib/oauth/common.js';
import { getOAuthStateCookie, clearOAuthStateCookie } from '../../../lib/oauth/stateCookie.js';
import { signSession, setSessionCookie, redirect } from '../../../lib/session.js';
import { callAppsScript } from '../../../lib/appsScriptClient.js';
import { getBaseUrl } from '../../../lib/http.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    return res.end();
  }

  const oauthState = getOAuthStateCookie(req);
  const { code, state, error } = req.query;

  const fail = () => redirect(res, '/join?error=google_failed');

  if (error || !code || !state) return fail();
  if (!oauthState || oauthState.provider !== 'google' || oauthState.state !== state) return fail();

  try {
    const token = await exchangeGoogleCode({
      code,
      codeVerifier: oauthState.codeVerifier,
      redirectUri: getBaseUrl(req) + '/api/auth/google/callback',
    });
    const user = await getGoogleUser(token.access_token);

    await callAppsScript('linkGoogleIdentity', {
      google_sub: user.sub,
      email: user.email,
      display_name: user.name || user.given_name || 'Hack Orbit member',
      avatar_url: user.picture || '',
    });

    const member = await callAppsScript('getMemberByGoogleSub', {
      google_sub: user.sub,
    });

    clearOAuthStateCookie(res);

    const session = await signSession({
      google_sub: user.sub,
      member_id: (member && member.member_id) || null,
      github_username: (member && member.github_username) || null,
      discord_id: (member && member.discord_id) || null,
      status: (member && member.status) || 'pending',
      step: 'google',
      display_name: (member && member.display_name) || user.name || '',
    });

    setSessionCookie(res, session);
    return redirect(res, member.member_id && member.status === 'verified' ? '/settings' : '/join');
  } catch (err) {
    console.error('[auth/google/callback]', err);
    return fail();
  }
}
