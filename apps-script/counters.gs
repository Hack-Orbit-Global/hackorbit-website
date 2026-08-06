var HO_COUNTER_HEADERS = ['counter_name', 'current_value'];

function hoCounterSheet() {
  var sheet = hoSheet('Counters');
  if (hoHeaders(sheet).length === 0) {
    hoSetRow(sheet, HO_COUNTER_HEADERS, 1, HO_COUNTER_HEADERS);
  }
  return sheet;
}

function hoGetCounter(name) {
  var sheet = hoCounterSheet();
  var headers = hoHeaders(sheet);
  var row = hoFindRow(sheet, headers, 'counter_name', name);
  if (row === -1) {
    hoAppendRow(sheet, headers, [name, 0]);
    return 0;
  }
  var val = sheet.getRange(row, 2).getValue();
  return isNaN(val) ? 0 : Number(val);
}

function hoSetCounter(name, value) {
  var sheet = hoCounterSheet();
  var headers = hoHeaders(sheet);
  var row = hoFindRow(sheet, headers, 'counter_name', name);
  if (row === -1) hoAppendRow(sheet, headers, [name, value]);
  else sheet.getRange(row, 2).setValue(value);
}

function hoNextId(prefix, counterName) {
  var lock = LockService.getScriptLock();
  var acquired = lock.tryLock(10000);
  if (!acquired) hoFail('LOCK_TIMEOUT', 'Could not acquire ID lock.');
  try {
    var next = hoGetCounter(counterName) + 1;
    hoSetCounter(counterName, next);
    var digits = String(next);
    while (digits.length < 6) digits = '0' + digits;
    return prefix + digits;
  } finally {
    lock.releaseLock();
  }
}
