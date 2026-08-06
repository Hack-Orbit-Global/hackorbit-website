import { exchangeDiscordCode, getDiscordUser } from '../../../lib/oauth/discord.js';
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

  const fail = (codeStr) => redirect(res, `/join?error=${codeStr || 'discord_failed'}`);

  if (error || !code || !state) return fail();
  if (!token) return fail('unauthenticated');
  if (!oauthState || oauthState.provider !== 'discord' || oauthState.state !== state) return fail('state_mismatch');

  let session;
  try {
    session = await verifySession(token);
  } catch {
    return fail('session_expired');
  }

  try {
    const oauthToken = await exchangeDiscordCode({
      code,
      redirectUri: getBaseUrl(req) + '/api/auth/discord/callback',
    });
    const dcUser = await getDiscordUser(oauthToken.access_token);

    await callAppsScript('linkIdentity', {
      google_sub: session.google_sub,
      provider: 'discord',
      provider_account_id: dcUser.id,
      discord_id: dcUser.id,
    });

    clearOAuthStateCookie(res);

    const updated = await signSession({
      ...session,
      discord_id: dcUser.id,
      step: 'discord',
    });
    setSessionCookie(res, updated);
    return redirect(res, '/join');
  } catch (err) {
    console.error('[auth/discord/callback]', err);
    const codeStr = err.code || 'discord_failed';
    return fail(codeStr === 'DISCORD_ALREADY_LINKED' ? 'discord_already_linked' : 'discord_failed');
  }
}
