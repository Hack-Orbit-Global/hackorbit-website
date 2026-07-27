/**
 * apps-script/members.gs
 * Member CRUD operations: createMember, getMember, finalizeVerification, updateProfile, linkIdentity
 */

// Column indices for Members sheet (0-indexed)
const MEMBERS_COLS = {
  member_id:       0,
  google_sub:      1,
  email:           2,
  display_name:    3,
  avatar_url:      4,
  bio:             5,
  skills:          6,
  github_username: 7,
  discord_id:      8,
  linkedin_url:    9,
  status:          10,
  is_founder:      11,
  created_at:      12,
  verified_at:     13,
};

// Public fields returned by getMember
const PUBLIC_FIELDS = ['member_id', 'display_name', 'avatar_url', 'bio', 'skills', 'github_username', 'linkedin_url', 'is_founder'];

function sanitize(str, maxLen) {
  if (!str) return '';
  // Prevent formula injection: strip leading =, +, -, @, tab, CR
  const s = String(str).replace(/^[\=\+\-\@\t\r]+/, "'").substring(0, maxLen || 500);
  return s.trim();
}

// ---------- CREATE ----------
function createMember(body) {
  const sheet = getSheet('Members');
  const data  = sheet.getDataRange().getValues();

  // Check for existing google_sub (idempotent — returns existing member)
  for (let i = 1; i < data.length; i++) {
    if (data[i][MEMBERS_COLS.google_sub] === body.google_sub) {
      return {
        ok:        true,
        member_id: data[i][MEMBERS_COLS.member_id] || null,
        status:    data[i][MEMBERS_COLS.status],
      };
    }
  }

  const now = new Date().toISOString();
  const newRow = new Array(14).fill('');
  newRow[MEMBERS_COLS.google_sub]   = body.google_sub;
  newRow[MEMBERS_COLS.email]        = body.email;
  newRow[MEMBERS_COLS.display_name] = sanitize(body.display_name, 80);
  newRow[MEMBERS_COLS.avatar_url]   = sanitize(body.avatar_url, 500);
  newRow[MEMBERS_COLS.status]       = 'pending';
  newRow[MEMBERS_COLS.is_founder]   = 'FALSE';
  newRow[MEMBERS_COLS.created_at]   = now;

  sheet.appendRow(newRow);
  return { ok: true, member_id: null, status: 'pending' };
}

// ---------- GET ----------
function getMember(body) {
  const sheet = getSheet('Members');
  const data  = sheet.getDataRange().getValues();
  const headers = data[0];

  for (let i = 1; i < data.length; i++) {
    if (data[i][MEMBERS_COLS.member_id] === body.member_id) {
      const row = data[i];
      const member = {};
      PUBLIC_FIELDS.forEach(field => {
        member[field] = row[MEMBERS_COLS[field]];
      });
      member.joined_at = row[MEMBERS_COLS.created_at];

      // Attach contributions, badges, certs (delegated to other .gs files)
      member.contributions = getMemberContributionsRaw(body.member_id);
      member.badges        = getMemberBadgesRaw(body.member_id);
      member.certificates  = getMemberCertificatesRaw(body.member_id);
      member.projects      = [];

      return { ok: true, member };
    }
  }
  return { ok: false, error_code: 'MEMBER_NOT_FOUND', message: 'Member not found' };
}

// ---------- FINALIZE ----------
function finalizeVerification(body) {
  const sheet = getSheet('Members');
  const data  = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][MEMBERS_COLS.google_sub] === body.google_sub ||
        data[i][MEMBERS_COLS.member_id]  === body.member_id) {

      if (data[i][MEMBERS_COLS.status] === 'verified' && data[i][MEMBERS_COLS.member_id]) {
        return { ok: true, member_id: data[i][MEMBERS_COLS.member_id] };
      }

      const newId = getNextMemberId();
      const rowNum = i + 1;
      sheet.getRange(rowNum, MEMBERS_COLS.member_id + 1).setValue(newId);
      sheet.getRange(rowNum, MEMBERS_COLS.status + 1).setValue('verified');
      sheet.getRange(rowNum, MEMBERS_COLS.verified_at + 1).setValue(new Date().toISOString());
      if (body.display_name) sheet.getRange(rowNum, MEMBERS_COLS.display_name + 1).setValue(sanitize(body.display_name, 80));
      if (body.skills)       sheet.getRange(rowNum, MEMBERS_COLS.skills + 1).setValue(sanitize(body.skills, 300));

      appendAuditLog('system', 'MEMBER_VERIFIED', newId, { google_sub: data[i][MEMBERS_COLS.google_sub] });
      return { ok: true, member_id: newId };
    }
  }
  return { ok: false, error_code: 'MEMBER_NOT_FOUND', message: 'Member not found for finalization' };
}

// ---------- UPDATE PROFILE ----------
function updateProfile(body) {
  const sheet = getSheet('Members');
  const data  = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][MEMBERS_COLS.member_id] === body.member_id) {
      const rowNum = i + 1;
      if (body.display_name !== undefined) sheet.getRange(rowNum, MEMBERS_COLS.display_name + 1).setValue(sanitize(body.display_name, 80));
      if (body.bio          !== undefined) sheet.getRange(rowNum, MEMBERS_COLS.bio + 1).setValue(sanitize(body.bio, 500));
      if (body.skills       !== undefined) sheet.getRange(rowNum, MEMBERS_COLS.skills + 1).setValue(sanitize(body.skills, 300));
      if (body.linkedin_url !== undefined) sheet.getRange(rowNum, MEMBERS_COLS.linkedin_url + 1).setValue(sanitize(body.linkedin_url, 300));
      if (body.avatar_url   !== undefined) sheet.getRange(rowNum, MEMBERS_COLS.avatar_url + 1).setValue(sanitize(body.avatar_url, 500));
      return { ok: true };
    }
  }
  return { ok: false, error_code: 'MEMBER_NOT_FOUND', message: 'Member not found' };
}

// ---------- LINK IDENTITY ----------
function linkIdentity(body) {
  const sheet = getSheet('IdentityConnections');
  const data  = sheet.getDataRange().getValues();

  // Enforce uniqueness: provider_account_id must not already be linked to a DIFFERENT member
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === body.provider && data[i][2] === String(body.provider_account_id)) {
      if (data[i][0] !== body.member_id) {
        return { ok: false, error_code: 'ALREADY_LINKED', message: 'This account is already linked to another member' };
      }
      return { ok: true }; // idempotent
    }
  }

  const now = new Date().toISOString();
  sheet.appendRow([body.member_id, body.provider, String(body.provider_account_id), now, '']);

  // If GitHub, also update github_username on Members sheet
  if (body.provider === 'github' && body.github_username) {
    const members = getSheet('Members');
    const mData   = members.getDataRange().getValues();
    for (let i = 1; i < mData.length; i++) {
      if (mData[i][MEMBERS_COLS.member_id] === body.member_id) {
        members.getRange(i + 1, MEMBERS_COLS.github_username + 1).setValue(sanitize(body.github_username, 100));
        break;
      }
    }
  }

  return { ok: true };
}

// ---------- LIST VERIFIED MEMBERS ----------
function listVerifiedMembers() {
  const sheet = getSheet('Members');
  const data  = sheet.getDataRange().getValues();
  const members = [];

  for (let i = 1; i < data.length; i++) {
    if (data[i][MEMBERS_COLS.status] === 'verified' && data[i][MEMBERS_COLS.member_id]) {
      members.push({
        member_id: data[i][MEMBERS_COLS.member_id]
      });
    }
  }

  return { ok: true, members };
}

