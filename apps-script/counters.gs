/**
 * apps-script/counters.gs
 * Atomic counter helpers using LockService for safe concurrent increments.
 */

function getNextMemberId() {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000); // wait up to 10s
  try {
    const sheet = getSheet('Counters');
    const data  = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === 'member_id') {
        const next = (parseInt(data[i][1], 10) || 0) + 1;
        sheet.getRange(i + 1, 2).setValue(next);
        return 'HO-' + String(next).padStart(6, '0');
      }
    }
    // First member ever
    sheet.appendRow(['member_id', 1]);
    return 'HO-000001';
  } finally {
    lock.releaseLock();
  }
}

function getNextCertId(year) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const key   = 'certificate_id_' + year;
    const sheet = getSheet('Counters');
    const data  = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === key) {
        const next = (parseInt(data[i][1], 10) || 0) + 1;
        sheet.getRange(i + 1, 2).setValue(next);
        return 'HO-CERT-' + year + '-' + String(next).padStart(6, '0');
      }
    }
    sheet.appendRow([key, 1]);
    return 'HO-CERT-' + year + '-000001';
  } finally {
    lock.releaseLock();
  }
}
