/**
 * api/auth/logout.js
 * POST /api/auth/logout
 */
'use strict';
const { clearSession } = require('../../lib/session');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');
  res.setHeader('Set-Cookie', clearSession());
  res.status(200).json({ ok: true });
};
