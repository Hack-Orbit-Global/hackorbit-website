/**
 * apps-script/badges.gs
 * Badge award and revocation + AuditLog helper.
 */

function awardBadge(body) {
  const awardId = 'AWD-' + Utilities.getUuid().replace(/-/g, '').substring(0, 12).toUpperCase();
  getSheet('MemberBadges').appendRow([
    awardId,
    body.member_id,
    body.badge_id,
    body.actor_member_id || 'system',
    new Date().toISOString(),
    'active',
    '',
  ]);
  appendAuditLog(body.actor_member_id, 'BADGE_AWARDED', awardId, { member: body.member_id, badge: body.badge_id });
  return { ok: true, award_id: awardId };
}

function revokeBadge(body) {
  const sheet = getSheet('MemberBadges');
  const data  = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === body.award_id) {
      sheet.getRange(i + 1, 6).setValue('revoked');
      sheet.getRange(i + 1, 7).setValue(body.reason || '');
      appendAuditLog(body.actor_member_id, 'BADGE_REVOKED', body.award_id, { reason: body.reason });
      return { ok: true };
    }
  }
  return { ok: false, error_code: 'AWARD_NOT_FOUND', message: 'Badge award not found' };
}

function getMemberBadgesRaw(memberId) {
  const badgesSheet = getSheet('Badges');
  const badgeData   = badgesSheet.getDataRange().getValues();
  const badgeMap    = {};
  for (let i = 1; i < badgeData.length; i++) {
    badgeMap[badgeData[i][0]] = {
      name:        badgeData[i][1],
      description: badgeData[i][2],
      icon_url:    badgeData[i][3],
    };
  }

  const mbSheet = getSheet('MemberBadges');
  const mbData  = mbSheet.getDataRange().getValues();
  return mbData.slice(1)
    .filter(row => row[1] === memberId && row[5] === 'active')
    .map(row => ({ ...(badgeMap[row[2]] || {}), badge_id: row[2], awarded_at: row[4] }));
}

// ---------- Audit Log ----------
function appendAuditLog(actor, action, target, metadata) {
  const auditId = 'AUD-' + Utilities.getUuid().replace(/-/g, '').substring(0, 12).toUpperCase();
  try {
    getSheet('AuditLog').appendRow([
      auditId,
      actor || 'system',
      action,
      target,
      new Date().toISOString(),
      JSON.stringify(metadata || {}),
    ]);
  } catch (e) {
    Logger.log('AuditLog write failed: ' + e.message);
  }
}
