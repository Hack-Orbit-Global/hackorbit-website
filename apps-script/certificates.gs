/**
 * apps-script/certificates.gs
 * Certificate issuance, verification, and revocation.
 */

function issueCertificate(body) {
  // Admin-only: caller Vercel API already validated role
  const year   = new Date().getFullYear();
  const certId = getNextCertId(year);
  const now    = new Date().toISOString();

  getSheet('Certificates').appendRow([
    certId,
    body.member_id,
    body.type,
    body.event_name || '',
    body.achievement_description,
    body.issued_by || 'Hack Orbit',
    body.collaborating_org || '',
    body.issue_date || now.substring(0, 10),
    'valid',
    'FALSE',
    '',
  ]);

  appendAuditLog(body.actor_member_id, 'CERT_ISSUED', certId, { recipient: body.member_id });
  return { ok: true, certificate_id: certId };
}

function verifyCertificate(body) {
  const sheet = getSheet('Certificates');
  const data  = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === body.certificate_id) {
      const row = data[i];

      // Fetch the member's public display_name
      const memberResult = getMember({ member_id: row[1] });
      const displayName  = memberResult.ok ? memberResult.member.display_name : row[1];

      return {
        ok:    true,
        found: true,
        certificate: {
          certificate_id:           row[0],
          member_id:                row[1],
          display_name:             displayName,
          type:                     row[2],
          event_name:               row[3],
          achievement_description:  row[4],
          issued_by:                row[5],
          collaborating_org:        row[6],
          issue_date:               row[7],
          status:                   row[8],
        },
      };
    }
  }
  return { ok: true, found: false };
}

function revokeCertificate(body) {
  const sheet = getSheet('Certificates');
  const data  = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === body.certificate_id) {
      sheet.getRange(i + 1, 9).setValue('revoked'); // status column
      appendAuditLog(body.actor_member_id, 'CERT_REVOKED', body.certificate_id, { reason: body.reason });
      return { ok: true };
    }
  }
  return { ok: false, error_code: 'CERT_NOT_FOUND', message: 'Certificate not found' };
}

function getMemberCertificatesRaw(memberId) {
  const sheet = getSheet('Certificates');
  const data  = sheet.getDataRange().getValues();
  return data.slice(1)
    .filter(row => row[1] === memberId && row[8] === 'valid')
    .map(row => ({
      certificate_id: row[0],
      type:           row[2],
      event_name:     row[3],
      issue_date:     row[7],
    }));
}
