import { callAppsScript } from './appsScriptClient.js';

export class AdminError extends Error {
  constructor(message, code = 'FORBIDDEN', status = 403) {
    super(message);
    this.name = 'AdminError';
    this.code = code;
    this.status = status;
  }
}

export async function requireAdmin(session) {
  if (!session || !session.google_sub) throw new AdminError('You must be signed in.', 'FORBIDDEN', 403);
  const result = await callAppsScript('getAdminStatus', { google_sub: session.google_sub });
  if (!result || result.is_admin !== true) {
    throw new AdminError('Admin privileges required.', 'FORBIDDEN', 403);
  }
  return result;
}
