/**
 * apps-script/contributions.gs
 * Contribution ingestion (idempotent) and listing.
 */

function addContribution(body) {
  const sheet = getSheet('Contributions');
  const data  = sheet.getDataRange().getValues();

  // Idempotency: contribution_id (GitHub delivery ID) deduplication
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === body.contribution_id) {
      return { ok: true, skipped: true };
    }
  }

  sheet.appendRow([
    body.contribution_id,
    body.member_id,
    body.project_id || '',
    body.type,
    body.repo,
    body.reference_url || '',
    body.occurred_at || new Date().toISOString(),
    body.source || 'webhook',
  ]);

  return { ok: true, skipped: false };
}

function listMemberContributions(body) {
  return { ok: true, contributions: getMemberContributionsRaw(body.member_id) };
}

function getMemberContributionsRaw(memberId) {
  const sheet = getSheet('Contributions');
  const data  = sheet.getDataRange().getValues();
  return data.slice(1)
    .filter(row => row[1] === memberId)
    .sort((a, b) => new Date(b[6]) - new Date(a[6])) // newest first
    .map(row => ({
      contribution_id: row[0],
      type:            row[3],
      repo:            row[4],
      reference_url:   row[5],
      occurred_at:     row[6],
      source:          row[7],
    }));
}
