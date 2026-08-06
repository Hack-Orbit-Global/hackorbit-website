var HO_PROJECT_HEADERS = ['project_id', 'name', 'description', 'type', 'repo_url', 'owner_member_id', 'status', 'created_at'];
var HO_EVENT_HEADERS = ['event_id', 'name', 'external_url', 'date_range', 'summary'];
var HO_ADMIN_HEADERS = ['admin_id', 'role', 'granted_at'];

function hoEnsureTable(name, headers) {
  var sheet = hoSheet(name);
  if (hoHeaders(sheet).length === 0) {
    hoSetRow(sheet, headers, 1, headers);
  }
  return sheet;
}

function hoRunSetup(payload) {
  hoEnsureTable('Members', HO_MEMBER_HEADERS);
  hoEnsureTable('IdentityConnections', HO_IDENTITY_HEADERS);
  hoEnsureTable('Projects', HO_PROJECT_HEADERS);
  hoEnsureTable('Contributions', HO_CONTRIBUTION_HEADERS);
  hoEnsureTable('Badges', HO_BADGE_HEADERS);
  hoEnsureTable('MemberBadges', HO_MEMBERBADGE_HEADERS);
  hoEnsureTable('Certificates', HO_CERT_HEADERS);
  hoEnsureTable('Events', HO_EVENT_HEADERS);
  hoEnsureTable('AdminRecords', HO_ADMIN_HEADERS);
  hoEnsureTable('AuditLog', ['audit_id', 'actor', 'action', 'target', 'timestamp', 'metadata']);
  hoEnsureTable('Counters', HO_COUNTER_HEADERS);

  if (hoGetCounter('member_counter') === 0) {
    hoSetCounter('member_counter', 1);
  }

  var seeded = [];

  var badges = [
    ['founder', 'Founder', 'Founder of Hack Orbit. Awarded permanently to Sabarna Barik.', '/assets/badges/founder.svg', 'manual', ''],
    ['first_contribution', 'First Contribution', 'Awarded automatically on the first tracked contribution.', '/assets/badges/first-contribution.svg', 'automatic', 'first_contribution'],
    ['first_merged_pr', 'First PR Merged', 'Awarded automatically when the first pull request is merged.', '/assets/badges/first-pr.svg', 'automatic', 'first_merged_pr'],
    ['core_contributor', 'Core Contributor', 'Awarded automatically after five tracked contributions.', '/assets/badges/core-contributor.svg', 'automatic', 'core_contributor'],
    ['org_member', 'Org Member', 'Awarded to members who join the Hack Orbit GitHub organisation.', '/assets/badges/org-member.svg', 'manual', ''],
  ];

  var badgeSheet = hoBadgesSheet();
  var badgeHeaders = hoHeaders(badgeSheet);
  for (var i = 0; i < badges.length; i++) {
    var exists = hoFindRow(badgeSheet, badgeHeaders, 'badge_id', badges[i][0]);
    if (exists === -1) {
      hoAppendRow(badgeSheet, HO_BADGE_HEADERS, badges[i]);
      seeded.push('badge:' + badges[i][0]);
    }
  }

  var membersSheet = hoMembersSheet();
  var membersHeaders = hoHeaders(membersSheet);
  var founderRow = hoFindRow(membersSheet, membersHeaders, 'member_id', 'HO-000001');
  if (founderRow === -1) {
    var now = hoTs();
    var values = [];
    for (var m = 0; m < HO_MEMBER_HEADERS.length; m++) values.push('');
    values[0] = 'HO-000001';
    values[1] = '';
    values[2] = 'founder@hackorbit.example';
    values[3] = 'Sabarna Barik';
    values[4] = '/assets/images/founder-placeholder.svg';
    values[5] = 'Founder of Hack Orbit. BUILD. CONTRIBUTE. ORBIT TOGETHER.';
    values[6] = 'Web Development, DevOps, AI/ML';
    values[7] = '';
    values[8] = '';
    values[9] = '';
    values[10] = '';
    values[11] = 'pending';
    values[12] = 'TRUE';
    values[13] = now;
    values[14] = '';
    hoAppendRow(membersSheet, HO_MEMBER_HEADERS, values);
    seeded.push('member:HO-000001');
  }

  var adminSheet = hoEnsureTable('AdminRecords', HO_ADMIN_HEADERS);
  var adminHeaders = hoHeaders(adminSheet);
  var adminRow = hoFindRow(adminSheet, adminHeaders, 'admin_id', 'HO-000001');
  if (adminRow === -1) {
    hoAppendRow(adminSheet, HO_ADMIN_HEADERS, ['HO-000001', 'founder', hoTs()]);
    seeded.push('admin:HO-000001');
  }

  var founderBadgeId = hoAwardBadgeInternal('HO-000001', 'founder', 'system');

  return {
    ok: true,
    seeded: seeded,
    founder_badge: founderBadgeId || 'already-active',
    note: 'Set the founder Google email in the Members tab (row HO-000001) so first sign-in adopts the founder identity.',
  };
}
