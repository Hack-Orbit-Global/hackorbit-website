import { clearSessionCookie, json } from '../../lib/session.js';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    return res.end();
  }
  clearSessionCookie(res);
  return json(res, 200, { ok: true });
}
