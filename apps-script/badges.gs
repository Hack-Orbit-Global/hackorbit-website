var HO_BADGE_HEADERS = ['badge_id', 'name', 'description', 'icon_url', 'award_type', 'trigger_condition'];
var HO_MEMBERBADGE_HEADERS = ['award_id', 'member_id', 'badge_id', 'awarded_by', 'awarded_at', 'status', 'revoke_reason'];

function hoBadgesSheet() {
  var sheet = hoSheet('Badges');
  if (hoHeaders(sheet).length === 0) {
    hoSetRow(sheet, HO_BADGE_HEADERS, 1, HO_BADGE_HEADERS);
  }
  return sheet;
}

function hoMemberBadgesSheet() {
  var sheet = hoSheet('MemberBadges');
  if (hoHeaders(sheet).length === 0) {
    hoSetRow(sheet, HO_MEMBERBADGE_HEADERS, 1, HO_MEMBERBADGE_HEADERS);
  }
  return sheet;
}

function hoFindBadgeById(badgeId) {
  var sheet = hoBadgesSheet();
  var headers = hoHeaders(sheet);
  var row = hoFindRow(sheet, headers, 'badge_id', badgeId);
  if (row === -1) return null;
  return hoRowObject(headers, sheet.getRange(row, 1, 1, headers.length).getValues()[0]);
}

function hoFindAwardById(awardId) {
  var sheet = hoMemberBadgesSheet();
  var headers = hoHeaders(sheet);
  var row = hoFindRow(sheet, headers, 'award_id', awardId);
  if (row === -1) return null;
  return { row: row, award: hoRowObject(headers, sheet.getRange(row, 1, 1, headers.length).getValues()[0]) };
}

function hoHasActiveAward(memberId, badgeId) {
  var sheet = hoMemberBadgesSheet();
  var headers = hoHeaders(sheet);
  var last = sheet.getLastRow();
  if (last < 2) return false;
  var values = sheet.getRange(2, 1, last - 1, headers.length).getValues();
  for (var i = 0; i < values.length; i++) {
    var row = hoRowObject(headers, values[i]);
    if (row.member_id === memberId && row.badge_id === badgeId && row.status === 'active') return true;
  }
  return false;
}

function hoAwardBadgeInternal(memberId, badgeId, awardedBy) {
  if (hoHasActiveAward(memberId, badgeId)) return null;
  var awardId = 'award_' + new Date().getTime() + '_' + Math.floor(Math.random() * 1e6);
  var sheet = hoMemberBadgesSheet();
  hoAppendRow(sheet, HO_MEMBERBADGE_HEADERS, [
    awardId, memberId, badgeId, awardedBy, hoTs(), 'active', '',
  ]);
  return awardId;
}

function hoAwardBadge(payload) {
  var memberId = String(payload.member_id || '');
  var badgeId = String(payload.badge_id || '');
  var awardedBy = String(payload.awarded_by || 'system');

  if (!memberId || !badgeId) hoFail('VALIDATION_ERROR', 'member_id and badge_id are required.');

  var member = hoFindMemberById(memberId);
  if (!member || member.status !== 'verified') hoFail('MEMBER_NOT_FOUND', 'No verified member with id ' + memberId + '.');

  var badge = hoFindBadgeById(badgeId);
  if (!badge) hoFail('BADGE_NOT_FOUND', 'No such badge.');

  if (hoHasActiveAward(memberId, badgeId)) {
    hoFail('ALREADY_AWARDED', 'This badge is already active for the member.');
  }

  var awardId = hoAwardBadgeInternal(memberId, badgeId, awardedBy);
  hoAudit(awardedBy, 'badge.award', memberId, { badge_id: badgeId, award_id: awardId });
  return { award_id: awardId };
}

function hoRevokeBadge(payload) {
  var awardId = String(payload.award_id || '');
  var reason = hoSanitize(payload.revoke_reason, 500);
  var revokedBy = String(payload.revoked_by || 'system');

  if (!awardId) hoFail('VALIDATION_ERROR', 'award_id is required.');
  var found = hoFindAwardById(awardId);
  if (!found) hoFail('AWARD_NOT_FOUND', 'No such award.');

  var sheet = hoMemberBadgesSheet();
  var headers = hoHeaders(sheet);
  hoUpdateCell(sheet, found.row, headers, 'status', 'revoked');
  hoUpdateCell(sheet, found.row, headers, 'revoke_reason', reason);
  hoAudit(revokedBy, 'badge.revoke', found.award.member_id, { award_id: awardId, badge_id: found.award.badge_id });
  return { ok: true };
}

function hoListMemberBadges(payload) {
  var memberId = String(payload.member_id || '');
  var sheet = hoMemberBadgesSheet();
  var headers = hoHeaders(sheet);
  var last = sheet.getLastRow();
  var badges = [];
  if (last > 1) {
    var values = sheet.getRange(2, 1, last - 1, headers.length).getValues();
    for (var i = 0; i < values.length; i++) {
      var row = hoRowObject(headers, values[i]);
      if (row.member_id !== memberId) continue;
      var badge = hoFindBadgeById(row.badge_id);
      if (!badge) continue;
      badges.push({
        badge_id: row.badge_id,
        name: badge.name,
        description: badge.description,
        icon_url: badge.icon_url,
        status: row.status,
        awarded_at: row.awarded_at,
      });
    }
  }
  return { badges: badges };
}

function hoMaybeAutoAward(memberId) {
  var sheet = hoBadgesSheet();
  var headers = hoHeaders(sheet);
  var last = sheet.getLastRow();
  if (last < 2) return;

  var contributions = hoListMemberContributions({ member_id: memberId }).contributions;
  var prCount = 0;
  var totalCount = contributions.length;
  for (var i = 0; i < contributions.length; i++) {
    if (contributions[i].type === 'pr_merged') prCount += 1;
  }

  var automatic = [];
  var values = sheet.getRange(2, 1, last - 1, headers.length).getValues();
  for (var j = 0; j < values.length; j++) {
    var b = hoRowObject(headers, values[j]);
    if (b.award_type === 'automatic') automatic.push(b);
  }

  for (var k = 0; k < automatic.length; k++) {
    var condition = String(automatic[k].trigger_condition || '');
    var triggered = false;
    if (condition === 'first_contribution') triggered = totalCount >= 1;
    else if (condition === 'first_merged_pr') triggered = prCount >= 1;
    else if (condition === 'core_contributor') triggered = totalCount >= 5;
    if (triggered) hoAwardBadgeInternal(memberId, automatic[k].badge_id, 'system');
  }
}
