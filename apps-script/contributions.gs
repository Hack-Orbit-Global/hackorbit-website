var HO_CONTRIBUTION_HEADERS = [
  'contribution_id', 'member_id', 'project_id', 'type', 'repo', 'reference_url', 'occurred_at', 'source',
];

var HO_CONTRIBUTION_TYPES = ['pr_merged', 'issue', 'review', 'doc', 'other'];
var HO_CONTRIBUTION_SOURCES = ['webhook', 'reconciliation', 'manual'];

function hoContributionSheet() {
  var sheet = hoSheet('Contributions');
  if (hoHeaders(sheet).length === 0) {
    hoSetRow(sheet, HO_CONTRIBUTION_HEADERS, 1, HO_CONTRIBUTION_HEADERS);
  }
  return sheet;
}

function hoFindContributionById(contributionId) {
  var sheet = hoContributionSheet();
  var headers = hoHeaders(sheet);
  var row = hoFindRow(sheet, headers, 'contribution_id', contributionId);
  if (row === -1) return null;
  return hoRowObject(headers, sheet.getRange(row, 1, 1, headers.length).getValues()[0]);
}

function hoAddContribution(payload) {
  var contributionId = String(payload.contribution_id || '');
  var memberId = String(payload.member_id || '');
  var type = String(payload.type || '');
  var repo = hoSanitize(payload.repo, 300);
  var referenceUrl = hoSanitize(payload.reference_url, 1000);
  var occurredAt = payload.occurred_at || hoTs();
  var source = String(payload.source || 'webhook');

  if (!contributionId) hoFail('VALIDATION_ERROR', 'contribution_id is required.');
  if (hoFindContributionById(contributionId)) {
    hoFail('DUPLICATE_CONTRIBUTION', 'Contribution already ingested.');
  }
  if (!memberId) hoFail('VALIDATION_ERROR', 'member_id is required.');
  if (HO_CONTRIBUTION_TYPES.indexOf(type) === -1) {
    hoFail('VALIDATION_ERROR', 'Invalid contribution type: ' + type);
  }
  if (!repo) hoFail('VALIDATION_ERROR', 'repo is required.');
  if (HO_CONTRIBUTION_SOURCES.indexOf(source) === -1) {
    hoFail('VALIDATION_ERROR', 'Invalid source: ' + source);
  }

  var member = hoFindMemberById(memberId);
  if (!member || member.status !== 'verified') {
    hoFail('MEMBER_NOT_FOUND', 'No verified member with id ' + memberId + '.');
  }

  var sheet = hoContributionSheet();
  var headers = hoHeaders(sheet);
  if (headers.length === 0) {
    hoSetRow(sheet, HO_CONTRIBUTION_HEADERS, 1, HO_CONTRIBUTION_HEADERS);
  }
  hoAppendRow(sheet, HO_CONTRIBUTION_HEADERS, [
    contributionId,
    memberId,
    hoSanitize(payload.project_id, 100) || '',
    type,
    repo,
    referenceUrl,
    occurredAt,
    source,
  ]);

  try {
    hoMaybeAutoAward(memberId);
  } catch (err) {
    console.error('[auto-award] ' + err.message);
  }

  return { contribution_id: contributionId, member_id: memberId, type: type };
}

function hoListMemberContributions(payload) {
  var memberId = String(payload.member_id || '');
  var sheet = hoContributionSheet();
  var headers = hoHeaders(sheet);
  var last = sheet.getLastRow();
  var contributions = [];
  if (last > 1) {
    var values = sheet.getRange(2, 1, last - 1, headers.length).getValues();
    for (var i = 0; i < values.length; i++) {
      var row = hoRowObject(headers, values[i]);
      if (row.member_id !== memberId) continue;
      contributions.push({
        type: row.type,
        repo: row.repo,
        reference_url: row.reference_url,
        occurred_at: row.occurred_at,
      });
    }
  }
  contributions.sort(function (a, b) {
    return String(b.occurred_at).localeCompare(String(a.occurred_at));
  });
  return { contributions: contributions };
}
