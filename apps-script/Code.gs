var HO_SERVICE_KEY = (function () {
  try {
    return PropertiesService.getScriptProperties().getProperty('HO_SERVICE_KEY');
  } catch (e) {
    return null;
  }
})();

function doGet(e) {
  return hoJson({ ok: true, service: 'hack-orbit-webapp', ts: new Date().toISOString() });
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return hoJsonError('BAD_REQUEST', 'No payload.');
    }

    var body;
    try {
      body = JSON.parse(e.postData.contents);
    } catch (err) {
      return hoJsonError('BAD_REQUEST', 'Invalid JSON body.');
    }

    var key = body.service_key || (e.parameter && e.parameter.service_key);
    if (!key || key !== HO_SERVICE_KEY) {
      return hoJsonError('UNAUTHORIZED', 'Invalid service key.');
    }

    var action = body.action;
    var payload = body.payload || {};
    if (typeof action !== 'string' || !action) {
      return hoJsonError('BAD_REQUEST', 'Missing action.');
    }

    var dispatch = {
      linkIdentity: hoLinkIdentity,
      linkGoogleIdentity: hoLinkGoogleIdentity,
      getMemberByGoogleSub: hoGetMemberByGoogleSub,
      getMemberByGithubUsername: hoGetMemberByGithubUsername,
      getMember: hoGetMember,
      finalizeVerificationByGoogleSub: hoFinalizeVerificationByGoogleSub,
      updateProfileByGoogleSub: hoUpdateProfileByGoogleSub,
      getAdminStatus: hoGetAdminStatus,
      addContribution: hoAddContribution,
      listMemberContributions: hoListMemberContributions,
      awardBadge: hoAwardBadge,
      revokeBadge: hoRevokeBadge,
      issueCertificate: hoIssueCertificate,
      verifyCertificate: hoVerifyCertificate,
      revokeCertificate: hoRevokeCertificate,
      getProjects: hoGetProjects,
      runSetup: hoRunSetup,
    };

    var fn = dispatch[action];
    if (!fn) return hoJsonError('UNKNOWN_ACTION', 'Unknown action: ' + action);

    var result = fn(payload);
    return hoJson({ ok: true, result: result });
  } catch (err) {
    console.error('[doPost] ' + action + ': ' + err.message);
    var code = (err && err.hoCode) || 'INTERNAL_ERROR';
    var message = (err && err.message) || 'Unexpected error.';
    return hoJsonError(code, message);
  }
}

function hoJson(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function hoJsonError(errorCode, message) {
  return hoJson({ ok: false, error_code: errorCode, message: message });
}

function hoFail(errorCode, message) {
  var err = new Error(message);
  err.hoCode = errorCode;
  throw err;
}

function hoSanitize(value, maxLen) {
  var s = String(value == null ? '' : value);
  if (maxLen) s = s.slice(0, maxLen);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function hoTs() {
  return new Date().toISOString();
}

function hoSheet(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  return sheet;
}

function hoHeaders(sheet) {
  var last = sheet.getLastColumn();
  if (last === 0) return [];
  return sheet.getRange(1, 1, 1, last).getValues()[0].map(String);
}

function hoRowObject(headers, values) {
  var obj = {};
  for (var i = 0; i < headers.length; i++) {
    obj[headers[i]] = i < values.length ? values[i] : '';
  }
  return obj;
}

function hoFindRow(sheet, headers, columnName, value, matchMode) {
  var col = headers.indexOf(columnName);
  if (col === -1) return -1;
  var last = sheet.getLastRow();
  if (last < 2) return -1;
  var values = sheet.getRange(2, col + 1, last - 1, 1).getValues();
  for (var r = 0; r < values.length; r++) {
    var cell = String(values[r][0]);
    var equal = matchMode === 'prefix' ? cell.indexOf(String(value)) === 0 : cell === String(value);
    if (equal) return r + 2;
  }
  return -1;
}

function hoSetRow(sheet, headers, row, values) {
  if (!sheet.getRange(1, 1).getValue()) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  sheet.getRange(row, 1, 1, values.length).setValues([values]);
}

function hoAppendRow(sheet, headers, values) {
  if (!sheet.getRange(1, 1).getValue()) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  sheet.appendRow(values);
}

function hoUpdateCell(sheet, row, headers, columnName, value) {
  var col = headers.indexOf(columnName);
  if (col === -1) return false;
  sheet.getRange(row, col + 1).setValue(value);
  return true;
}

function hoAudit(actor, action, target, metadata) {
  try {
    var sheet = hoSheet('AuditLog');
    var headers = hoHeaders(sheet);
    if (headers.length === 0) {
      headers = ['audit_id', 'actor', 'action', 'target', 'timestamp', 'metadata'];
      hoSetRow(sheet, headers, 1, headers);
    }
    var id = 'audit_' + new Date().getTime() + '_' + Math.floor(Math.random() * 1e6);
    hoAppendRow(sheet, headers, [
      id,
      actor,
      action,
      target,
      hoTs(),
      metadata ? JSON.stringify(metadata) : '',
    ]);
  } catch (err) {
    console.error('[audit] ' + err.message);
  }
}

function hoParseLinks(value) {
  if (!value) return [];
  if (typeof value === 'string' && value.charAt(0) === '[') {
    try {
      var parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      // fall through to comma-split
    }
  }
  return String(value).split(',').map(function (s) { return s.trim(); }).filter(Boolean);
}

function hoMemberPublic(member, ctx) {
  var skills = String(member.skills || '');
  return {
    member_id: member.member_id,
    display_name: member.display_name,
    avatar_url: member.avatar_url,
    bio: member.bio,
    skills: skills ? skills.split(',').map(function (s) { return s.trim(); }).filter(Boolean) : [],
    github_username: member.github_username,
    linkedin_url: member.linkedin_url,
    other_links: hoParseLinks(member.other_links),
    is_founder: member.is_founder === true || member.is_founder === 'TRUE' || member.is_founder === 'true',
    joined_at: member.created_at,
    contributions: ctx.contributions || [],
    badges: ctx.badges || [],
    certificates: ctx.certificates || [],
    projects: ctx.projects || [],
  };
}
