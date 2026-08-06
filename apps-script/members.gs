var HO_MEMBER_HEADERS = [
  'member_id', 'google_sub', 'email', 'display_name', 'avatar_url', 'bio', 'skills',
  'github_username', 'discord_id', 'linkedin_url', 'other_links', 'status', 'is_founder',
  'created_at', 'verified_at',
];

function hoMembersSheet() {
  return hoSheet('Members');
}

function hoFindMemberByGoogleSub(googleSub) {
  var sheet = hoMembersSheet();
  var headers = hoHeaders(sheet);
  var row = hoFindRow(sheet, headers, 'google_sub', googleSub);
  if (row === -1) return null;
  return hoRowObject(headers, sheet.getRange(row, 1, 1, headers.length).getValues()[0]);
}

function hoFindMemberById(memberId) {
  var sheet = hoMembersSheet();
  var headers = hoHeaders(sheet);
  var row = hoFindRow(sheet, headers, 'member_id', memberId);
  if (row === -1) return null;
  return hoRowObject(headers, sheet.getRange(row, 1, 1, headers.length).getValues()[0]);
}

function hoFindMemberByEmail(email) {
  var sheet = hoMembersSheet();
  var headers = hoHeaders(sheet);
  var row = hoFindRow(sheet, headers, 'email', email);
  if (row === -1) return null;
  return hoRowObject(headers, sheet.getRange(row, 1, 1, headers.length).getValues()[0]);
}

function hoFindMemberByGithubUsername(githubUsername) {
  var sheet = hoMembersSheet();
  var headers = hoHeaders(sheet);
  var row = hoFindRow(sheet, headers, 'github_username', githubUsername);
  if (row === -1) return null;
  return hoRowObject(headers, sheet.getRange(row, 1, 1, headers.length).getValues()[0]);
}

function hoFindRowByGoogleSub(googleSub) {
  var sheet = hoMembersSheet();
  var headers = hoHeaders(sheet);
  return hoFindRow(sheet, headers, 'google_sub', googleSub);
}

function hoWriteMember(row, values) {
  var sheet = hoMembersSheet();
  var headers = hoHeaders(sheet);
  if (headers.length === 0) {
    hoSetRow(sheet, HO_MEMBER_HEADERS, 1, HO_MEMBER_HEADERS);
    headers = HO_MEMBER_HEADERS;
  }
  var padded = [];
  for (var i = 0; i < HO_MEMBER_HEADERS.length; i++) {
    var idx = headers.indexOf(HO_MEMBER_HEADERS[i]);
    padded.push(idx >= 0 && idx < values.length ? values[idx] : '');
  }
  hoSetRow(sheet, HO_MEMBER_HEADERS, row, padded);
}

var HO_IDENTITY_HEADERS = ['member_id', 'provider', 'provider_account_id', 'linked_at', 'refresh_token_ref'];

function hoIdentitySheet() {
  var sheet = hoSheet('IdentityConnections');
  if (hoHeaders(sheet).length === 0) {
    hoSetRow(sheet, HO_IDENTITY_HEADERS, 1, HO_IDENTITY_HEADERS);
  }
  return sheet;
}

function hoHasConnection(memberId, provider) {
  var sheet = hoIdentitySheet();
  var headers = hoHeaders(sheet);
  var last = sheet.getLastRow();
  if (last < 2) return false;
  var values = sheet.getRange(2, 1, last - 1, headers.length).getValues();
  for (var i = 0; i < values.length; i++) {
    var row = hoRowObject(headers, values[i]);
    if (row.member_id === memberId && row.provider === provider) return true;
  }
  return false;
}

function hoFindConnection(provider, providerAccountId) {
  var sheet = hoIdentitySheet();
  var headers = hoHeaders(sheet);
  var last = sheet.getLastRow();
  if (last < 2) return null;
  var values = sheet.getRange(2, 1, last - 1, headers.length).getValues();
  for (var i = 0; i < values.length; i++) {
    var row = hoRowObject(headers, values[i]);
    if (row.provider === provider && String(row.provider_account_id) === String(providerAccountId)) {
      return row;
    }
  }
  return null;
}

function hoLinkIdentity(payload) {
  var googleSub = String(payload.google_sub || '');
  var provider = String(payload.provider || '');
  var providerAccountId = String(payload.provider_account_id || '');

  if (!googleSub) hoFail('VALIDATION_ERROR', 'google_sub is required.');
  if (provider !== 'github' && provider !== 'discord') {
    hoFail('VALIDATION_ERROR', 'provider must be github or discord.');
  }
  if (!providerAccountId) hoFail('VALIDATION_ERROR', 'provider_account_id is required.');

  var member = hoFindMemberByGoogleSub(googleSub);
  if (!member) hoFail('MEMBER_NOT_FOUND', 'No such member.');

  var duplicate = hoFindConnection(provider, providerAccountId);
  if (duplicate && duplicate.member_id !== member.member_id) {
    if (provider === 'github') hoFail('GITHUB_ALREADY_LINKED', 'This GitHub account is already linked to another member.');
    hoFail('DISCORD_ALREADY_LINKED', 'This Discord account is already linked to another member.');
  }

  var membersSheet = hoMembersSheet();
  var membersHeaders = hoHeaders(membersSheet);
  var memberRow = hoFindRowByGoogleSub(googleSub);

  if (provider === 'github') {
    var githubUsername = String(payload.github_username || '');
    if (!githubUsername) hoFail('VALIDATION_ERROR', 'github_username is required.');
    var usernameOwner = hoFindMemberByGithubUsername(githubUsername);
    if (usernameOwner && usernameOwner.member_id !== member.member_id) {
      hoFail('GITHUB_ALREADY_LINKED', 'This GitHub account is already linked to another member.');
    }
    hoUpdateCell(membersSheet, memberRow, membersHeaders, 'github_username', githubUsername);
  } else {
    hoUpdateCell(membersSheet, memberRow, membersHeaders, 'discord_id', providerAccountId);
  }

  var sheet = hoIdentitySheet();
  var headers = hoHeaders(sheet);
  var linked = hoFindConnection(provider, providerAccountId);
  if (!linked) {
    hoAppendRow(sheet, HO_IDENTITY_HEADERS, [member.member_id, provider, providerAccountId, hoTs(), '']);
  }

  hoAudit(googleSub, 'identity.link', member.member_id, { provider: provider });
  return { member_id: member.member_id, linked: true, provider: provider };
}

function hoLinkGoogleIdentity(payload) {
  var googleSub = String(payload.google_sub || '');
  var email = String(payload.email || '').toLowerCase();
  var displayName = hoSanitize(payload.display_name, 80) || 'Hack Orbit member';
  var avatarUrl = String(payload.avatar_url || '');

  if (!googleSub) hoFail('VALIDATION_ERROR', 'google_sub is required.');
  if (!email || email.indexOf('@') === -1) hoFail('VALIDATION_ERROR', 'email is required.');

  var existing = hoFindMemberByGoogleSub(googleSub);
  if (existing) {
    return {
      member_id: existing.member_id,
      is_new: false,
      status: existing.status,
      is_founder: existing.is_founder === true || existing.is_founder === 'TRUE',
    };
  }

  var sheet = hoMembersSheet();
  var headers = hoHeaders(sheet);
  var now = hoTs();

  var founder = hoFindMemberByEmail(email);
  if (founder && founder.is_founder === 'TRUE' && !founder.google_sub) {
    var founderRow = hoFindRow(sheet, headers, 'email', email);
    var fValues = sheet.getRange(founderRow, 1, 1, headers.length).getValues()[0];
    hoUpdateCell(sheet, founderRow, headers, 'google_sub', googleSub);
    hoUpdateCell(sheet, founderRow, headers, 'avatar_url', avatarUrl);
    hoUpdateCell(sheet, founderRow, headers, 'display_name', displayName);
    hoUpdateCell(sheet, founderRow, headers, 'status', 'verified');
    hoUpdateCell(sheet, founderRow, headers, 'verified_at', now);
    hoAudit(googleSub, 'member.founder_adopt', founder.member_id, { email: email });
    return {
      member_id: founder.member_id,
      is_new: true,
      status: 'verified',
      is_founder: true,
    };
  }

  var memberId = hoNextId('HO-', 'member_counter');
  var values = [];
  for (var i = 0; i < HO_MEMBER_HEADERS.length; i++) values.push('');
  values[0] = memberId;
  values[1] = googleSub;
  values[2] = email;
  values[3] = displayName;
  values[4] = avatarUrl;
  values[5] = '';
  values[6] = '';
  values[7] = '';
  values[8] = '';
  values[9] = '';
  values[10] = '';
  values[11] = 'pending';
  values[12] = 'FALSE';
  values[13] = now;
  values[14] = '';
  hoAppendRow(sheet, HO_MEMBER_HEADERS, values);
  hoAudit(googleSub, 'member.create', memberId, {});
  return { member_id: memberId, is_new: true, status: 'pending', is_founder: false };
}

function hoGetMemberByGoogleSub(payload) {
  var googleSub = String(payload.google_sub || '');
  if (!googleSub) hoFail('VALIDATION_ERROR', 'google_sub is required.');
  var member = hoFindMemberByGoogleSub(googleSub);
  if (!member) return null;
  return {
    member_id: member.member_id,
    display_name: member.display_name,
    avatar_url: member.avatar_url,
    email: member.email,
    github_username: member.github_username,
    discord_id: member.discord_id,
    status: member.status,
    is_founder: member.is_founder === true || member.is_founder === 'TRUE',
  };
}

function hoGetMemberByGithubUsername(payload) {
  var githubUsername = String(payload.github_username || '');
  if (!githubUsername) return null;
  var member = hoFindMemberByGithubUsername(githubUsername);
  if (!member || member.status !== 'verified') return null;
  return { member_id: member.member_id, status: member.status };
}

function hoGetMember(payload) {
  var memberId = String(payload.member_id || '');
  if (!memberId) hoFail('MEMBER_NOT_FOUND', 'member_id is required.');
  var member = hoFindMemberById(memberId);
  if (!member) hoFail('MEMBER_NOT_FOUND', 'No such member.');
  if (member.status !== 'verified') hoFail('MEMBER_NOT_FOUND', 'No such member.');

  return hoMemberPublic(member, {
    contributions: hoListMemberContributions({ member_id: memberId }).contributions,
    badges: hoListMemberBadges({ member_id: memberId }).badges,
    certificates: hoListMemberCertificates({ member_id: memberId }).certificates,
    projects: hoListMemberProjects({ member_id: memberId }).projects,
  });
}

function hoFinalizeVerificationByGoogleSub(payload) {
  var googleSub = String(payload.google_sub || '');
  if (!googleSub) hoFail('VALIDATION_ERROR', 'google_sub is required.');
  var member = hoFindMemberByGoogleSub(googleSub);
  if (!member) hoFail('MEMBER_NOT_FOUND', 'No such member.');

  if (member.status === 'verified') {
    return { member_id: member.member_id, status: 'verified' };
  }

  var hasGithub = Boolean(member.github_username) || hoHasConnection(member.member_id, 'github');
  var hasDiscord = Boolean(member.discord_id) || hoHasConnection(member.member_id, 'discord');
  if (!hasGithub) hoFail('INCOMPLETE_VERIFICATION', 'GitHub is not linked.');
  if (!hasDiscord) hoFail('INCOMPLETE_VERIFICATION', 'Discord is not linked.');

  var sheet = hoMembersSheet();
  var headers = hoHeaders(sheet);
  var row = hoFindRowByGoogleSub(googleSub);
  var now = hoTs();
  if (!member.member_id) {
    var memberId = hoNextId('HO-', 'member_counter');
    hoUpdateCell(sheet, row, headers, 'member_id', memberId);
    member.member_id = memberId;
  }
  hoUpdateCell(sheet, row, headers, 'status', 'verified');
  hoUpdateCell(sheet, row, headers, 'verified_at', now);
  hoAudit(googleSub, 'member.verify', member.member_id, {});
  return { member_id: member.member_id, status: 'verified' };
}

function hoUpdateProfileByGoogleSub(payload) {
  var googleSub = String(payload.google_sub || '');
  if (!googleSub) hoFail('VALIDATION_ERROR', 'google_sub is required.');
  var member = hoFindMemberByGoogleSub(googleSub);
  if (!member) hoFail('MEMBER_NOT_FOUND', 'No such member.');

  var sheet = hoMembersSheet();
  var headers = hoHeaders(sheet);
  var row = hoFindRowByGoogleSub(googleSub);

  var displayName = hoSanitize(payload.display_name, 80);
  if (!displayName) hoFail('VALIDATION_ERROR', 'display_name is required.');
  hoUpdateCell(sheet, row, headers, 'display_name', displayName);

  if (payload.bio !== undefined) {
    hoUpdateCell(sheet, row, headers, 'bio', hoSanitize(payload.bio, 500));
  }
  if (payload.skills !== undefined) {
    var skills = (payload.skills || []).map(function (s) { return hoSanitize(s, 60); }).join(', ');
    hoUpdateCell(sheet, row, headers, 'skills', skills);
  }
  if (payload.linkedin_url !== undefined) {
    hoUpdateCell(sheet, row, headers, 'linkedin_url', hoSanitize(payload.linkedin_url, 500));
  }
  if (payload.other_links !== undefined) {
    hoUpdateCell(sheet, row, headers, 'other_links', JSON.stringify((payload.other_links || []).map(function (s) { return hoSanitize(s, 500); })));
  }

  hoAudit(googleSub, 'member.update', member.member_id, {});
  return hoMemberPublic(hoFindMemberByGoogleSub(googleSub), {
    contributions: [],
    badges: [],
    certificates: [],
    projects: [],
  });
}

function hoGetAdminStatus(payload) {
  var googleSub = String(payload.google_sub || '');
  if (!googleSub) return { is_admin: false };
  var member = hoFindMemberByGoogleSub(googleSub);
  if (!member) return { is_admin: false };
  var sheet = hoSheet('AdminRecords');
  var headers = hoHeaders(sheet);
  var row = hoFindRow(sheet, headers, 'admin_id', member.member_id);
  if (row === -1) return { is_admin: false };
  var record = hoRowObject(headers, sheet.getRange(row, 1, 1, headers.length).getValues()[0]);
  return { is_admin: true, role: record.role, admin_id: member.member_id };
}

function hoListMemberProjects(payload) {
  var sheet = hoSheet('Projects');
  var headers = hoHeaders(sheet);
  var last = sheet.getLastRow();
  var projects = [];
  if (last > 1) {
    var values = sheet.getRange(2, 1, last - 1, headers.length).getValues();
    for (var i = 0; i < values.length; i++) {
      var p = hoRowObject(headers, values[i]);
      var isOfficial = p.type === 'official';
      var owned = String(p.owner_member_id || '') === String(payload.member_id);
      if (p.status === 'archived') continue;
      if (isOfficial) {
        if (p.status === 'active') projects.push(p);
      } else if (owned) {
        projects.push(p);
      }
    }
  }
  return { projects: projects };
}

function hoGetProjects(payload) {
  var sheet = hoSheet('Projects');
  var headers = hoHeaders(sheet);
  var last = sheet.getLastRow();
  var projects = [];
  if (last > 1) {
    var values = sheet.getRange(2, 1, last - 1, headers.length).getValues();
    for (var i = 0; i < values.length; i++) {
      var p = hoRowObject(headers, values[i]);
      if (p.status === 'archived') continue;
      projects.push({
        project_id: p.project_id,
        name: p.name,
        description: p.description,
        type: p.type,
        repo_url: p.repo_url,
        owner_member_id: p.owner_member_id,
        status: p.status,
      });
    }
  }
  return { projects: projects };
}
