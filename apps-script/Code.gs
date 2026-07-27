/**
 * apps-script/Code.gs
 * Entry point for the Hack Orbit Apps Script Web App.
 * All write operations go through doPost; doGet is reserved for health checks.
 *
 * Authentication: every request MUST include X-HO-Service-Key header matching
 * the HO_SERVICE_KEY script property — enforced in authenticate() below.
 */

const SERVICE_KEY_PROP = 'HO_SERVICE_KEY';

// ---------- Auth Guard ----------
function authenticate(e) {
  const key = e.parameter['X-HO-Service-Key']
    || (e.postData && JSON.parse(e.postData.contents || '{}')['_serviceKey']);
  const expected = PropertiesService.getScriptProperties().getProperty(SERVICE_KEY_PROP);
  if (!key || key !== expected) {
    throw new Error('UNAUTHORIZED');
  }
}

// ---------- Entry Points ----------
function doPost(e) {
  try {
    authenticate(e);
    const body   = JSON.parse(e.postData.contents);
    const action = body.action;

    switch (action) {
      case 'createMember':           return respond(createMember(body));
      case 'getMember':              return respond(getMember(body));
      case 'linkIdentity':           return respond(linkIdentity(body));
      case 'finalizeVerification':   return respond(finalizeVerification(body));
      case 'updateProfile':          return respond(updateProfile(body));
      case 'addContribution':        return respond(addContribution(body));
      case 'listMemberContributions':return respond(listMemberContributions(body));
      case 'awardBadge':             return respond(awardBadge(body));
      case 'revokeBadge':            return respond(revokeBadge(body));
      case 'issueCertificate':       return respond(issueCertificate(body));
      case 'verifyCertificate':      return respond(verifyCertificate(body));
      case 'revokeCertificate':      return respond(revokeCertificate(body));
      case 'listVerifiedMembers':    return respond(listVerifiedMembers());
      default:
        return respond({ ok: false, error_code: 'UNKNOWN_ACTION', message: 'Unknown action: ' + action });
    }
  } catch (err) {
    if (err.message === 'UNAUTHORIZED') {
      return respond({ ok: false, error_code: 'UNAUTHORIZED', message: 'Invalid service key' }, 403);
    }
    Logger.log('doPost error: ' + err.message + '\n' + err.stack);
    return respond({ ok: false, error_code: 'INTERNAL_ERROR', message: err.message });
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ ok: true, message: 'Hack Orbit Apps Script running' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---------- Response Helper ----------
function respond(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---------- Sheet Helper ----------
function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error('Sheet not found: ' + name);
  return sheet;
}
