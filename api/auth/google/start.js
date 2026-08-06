import { buildGoogleAuthUrl } from '../../../lib/oauth/google.js';
import { generateState, generateCodeVerifier, generateCodeChallenge, redirectUri } from '../../../lib/oauth/common.js';
import { setOAuthStateCookie } from '../../../lib/oauth/stateCookie.js';
import { redirect } from '../../../lib/session.js';
import { getBaseUrl } from '../../../lib/http.js';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    return res.end();
  }

  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const redirectTo = getBaseUrl(req) + '/api/auth/google/callback';

  setOAuthStateCookie(res, { state, codeVerifier, provider: 'google' });

  const url = buildGoogleAuthUrl({ state, codeChallenge, redirectUri: redirectTo });
  return redirect(res, url);
}
