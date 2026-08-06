import { buildDiscordAuthUrl } from '../../../lib/oauth/discord.js';
import { generateState, redirectUri } from '../../../lib/oauth/common.js';
import { setOAuthStateCookie } from '../../../lib/oauth/stateCookie.js';
import { getSessionCookie, verifySession, redirect } from '../../../lib/session.js';
import { getBaseUrl } from '../../../lib/http.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    return res.end();
  }

  const token = getSessionCookie(req);
  if (!token) return redirect(res, '/join?error=unauthenticated');

  try {
    await verifySession(token);
  } catch {
    return redirect(res, '/join?error=session_expired');
  }

  const state = generateState();
  setOAuthStateCookie(res, { state, provider: 'discord' });

  const url = buildDiscordAuthUrl({ state, redirectUri: getBaseUrl(req) + '/api/auth/discord/callback' });
  return redirect(res, url);
}
