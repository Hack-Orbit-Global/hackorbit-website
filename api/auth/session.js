import { getSessionCookie, verifySession, json, error } from '../../lib/session.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    return res.end();
  }

  const token = getSessionCookie(req);
  if (!token) {
    return json(res, 200, { authenticated: false });
  }

  try {
    const session = await verifySession(token);
    return json(res, 200, {
      authenticated: true,
      google_linked: Boolean(session.google_sub),
      github_linked: Boolean(session.github_username),
      discord_linked: Boolean(session.discord_id),
      status: session.status || 'pending',
      member_id: session.member_id || null,
      display_name: session.display_name || null,
    });
  } catch {
    return json(res, 200, { authenticated: false });
  }
}
