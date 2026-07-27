/**
 * api/auth/session.js
 * GET /api/auth/session
 * Returns current session status to client JS on join.html / settings.html.
 * NEVER returns private fields (google_sub, discord_id, email).
 */
'use strict';
const { getSession } = require('../../lib/session');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end('Method Not Allowed');
  const session = await getSession(req);
  if (!session) return res.status(200).json({ ok: true, session: null });

  // Public-safe subset only
  res.status(200).json({
    ok: true,
    session: {
      member_id:      session.member_id,
      display_name:   session.display_name,
      avatar_url:     session.avatar_url,
      status:         session.status,
      google_linked:  session.google_linked  ?? false,
      github_linked:  session.github_linked  ?? false,
      discord_linked: session.discord_linked ?? false,
      github_username: session.github_username ?? null,
    },
  });
};
