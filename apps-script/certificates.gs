var HO_CERT_HEADERS = [
  'certificate_id', 'member_id', 'type', 'event_name', 'achievement_description',
  'issued_by', 'collaborating_org', 'issue_date', 'status', 'file_generated', 'emailed_at',
];

var HO_CERT_TYPES = ['participation', 'winner', 'finalist', 'volunteer', 'organiser', 'contributor'];

function hoCertificatesSheet() {
  var sheet = hoSheet('Certificates');
  if (hoHeaders(sheet).length === 0) {
    hoSetRow(sheet, HO_CERT_HEADERS, 1, HO_CERT_HEADERS);
  }
  return sheet;
}

function hoFindCertificateById(certificateId) {
  var sheet = hoCertificatesSheet();
  var headers = hoHeaders(sheet);
  var row = hoFindRow(sheet, headers, 'certificate_id', certificateId);
  if (row === -1) return null;
  return { row: row, cert: hoRowObject(headers, sheet.getRange(row, 1, 1, headers.length).getValues()[0]) };
}

function hoIssueCertificate(payload) {
  var memberId = String(payload.member_id || '');
  var type = String(payload.type || '');
  var achievement = hoSanitize(payload.achievement_description, 1000);
  var eventName = hoSanitize(payload.event_name, 200);
  var collaboratingOrg = hoSanitize(payload.collaborating_org, 200);
  var issuedBy = hoSanitize(payload.issued_by, 200) || 'Hack Orbit';
  var issueDate = String(payload.issue_date || '').slice(0, 10) || new Date().toISOString().slice(0, 10);

  if (!memberId) hoFail('VALIDATION_ERROR', 'member_id is required.');
  if (HO_CERT_TYPES.indexOf(type) === -1) {
    hoFail('VALIDATION_ERROR', 'Invalid certificate type: ' + type);
  }
  if (!achievement) hoFail('VALIDATION_ERROR', 'achievement_description is required.');

  var member = hoFindMemberById(memberId);
  if (!member || member.status !== 'verified') {
    hoFail('MEMBER_NOT_VERIFIED', 'Certificates require a verified member.');
  }

  var year = issueDate.slice(0, 4) || String(new Date().getFullYear());
  var certificateId = hoNextId('HO-CERT-' + year + '-', 'certificate_' + year);

  var sheet = hoCertificatesSheet();
  hoAppendRow(sheet, HO_CERT_HEADERS, [
    certificateId, memberId, type, eventName, achievement, issuedBy, collaboratingOrg,
    issueDate, 'valid', 'FALSE', '',
  ]);

  hoAudit('system', 'certificate.issue', memberId, {
    certificate_id: certificateId,
    type: type,
    issued_by: issuedBy,
  });

  return { certificate_id: certificateId };
}

function hoVerifyCertificate(payload) {
  var certificateId = String(payload.certificate_id || '');
  if (!certificateId) {
    return { found: false };
  }

  var found = hoFindCertificateById(certificateId);
  if (!found) {
    return { found: false };
  }

  var cert = found.cert;
  var member = hoFindMemberById(cert.member_id);
  var recipientName = member ? member.display_name : '';

  return {
    found: true,
    certificate: {
      certificate_id: cert.certificate_id,
      status: cert.status,
      type: cert.type,
      event_name: cert.event_name,
      achievement_description: cert.achievement_description,
      issued_by: cert.issued_by,
      collaborating_org: cert.collaborating_org,
      issue_date: cert.issue_date,
      member_id: cert.member_id,
      recipient_name: recipientName,
    },
  };
}

function hoRevokeCertificate(payload) {
  var certificateId = String(payload.certificate_id || '');
  var revokedBy = String(payload.revoked_by || 'system');

  if (!certificateId) hoFail('VALIDATION_ERROR', 'certificate_id is required.');
  var found = hoFindCertificateById(certificateId);
  if (!found) hoFail('CERT_NOT_FOUND', 'No such certificate.');

  var sheet = hoCertificatesSheet();
  var headers = hoHeaders(sheet);
  hoUpdateCell(sheet, found.row, headers, 'status', 'revoked');
  hoAudit(revokedBy, 'certificate.revoke', found.cert.member_id, {
    certificate_id: certificateId,
    reason: hoSanitize(payload.revoke_reason, 500),
  });
  return { ok: true };
}

function hoListMemberCertificates(payload) {
  var memberId = String(payload.member_id || '');
  var sheet = hoCertificatesSheet();
  var headers = hoHeaders(sheet);
  var last = sheet.getLastRow();
  var certificates = [];
  if (last > 1) {
    var values = sheet.getRange(2, 1, last - 1, headers.length).getValues();
    for (var i = 0; i < values.length; i++) {
      var row = hoRowObject(headers, values[i]);
      if (row.member_id !== memberId || row.status !== 'valid') continue;
      certificates.push({
        certificate_id: row.certificate_id,
        type: row.type,
        event_name: row.event_name,
        status: row.status,
        issue_date: row.issue_date,
      });
    }
  }
  return { certificates: certificates };
}
