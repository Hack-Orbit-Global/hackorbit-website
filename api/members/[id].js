import { json, error } from '../../lib/session.js';
import { callAppsScript } from '../../lib/appsScriptClient.js';
import { isMemberId } from '../../lib/validation/validate.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    return res.end();
  }

  const { id } = req.query;
  if (!isMemberId(id)) return error(res, 404, 'MEMBER_NOT_FOUND', 'No such member.');

  try {
    const member = await callAppsScript('getMember', { member_id: id });
    if (!member) return error(res, 404, 'MEMBER_NOT_FOUND', 'No such member.');
    return json(res, 200, member);
  } catch (err) {
    if (err.code === 'MEMBER_NOT_FOUND') return error(res, 404, 'MEMBER_NOT_FOUND', 'No such member.');
    console.error('[members/[id]]', err);
    return error(res, 500, 'INTERNAL_ERROR', 'Something went wrong.');
  }
}
