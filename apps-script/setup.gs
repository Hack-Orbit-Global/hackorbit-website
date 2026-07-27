/**
 * apps-script/setup.gs
 * Automated database schema setup script for Google Sheets.
 * Run setupSheets() from the Apps Script editor to initialize all tabs.
 */

const SCHEMAS = {
  'Members': [
    'member_id',
    'google_sub',
    'email',
    'display_name',
    'avatar_url',
    'bio',
    'skills',
    'github_username',
    'discord_id',
    'linkedin_url',
    'status',
    'is_founder',
    'created_at',
    'verified_at'
  ],
  'IdentityConnections': [
    'member_id',
    'provider',
    'provider_account_id',
    'linked_at',
    'refresh_token_ref'
  ],
  'Projects': [
    'project_id',
    'name',
    'description',
    'type',
    'repo_url',
    'owner_member_id',
    'status',
    'created_at'
  ],
  'Contributions': [
    'contribution_id',
    'member_id',
    'project_id',
    'type',
    'repo',
    'reference_url',
    'occurred_at',
    'source'
  ],
  'Badges': [
    'badge_id',
    'name',
    'description',
    'icon_url',
    'award_type',
    'trigger_condition'
  ],
  'MemberBadges': [
    'award_id',
    'member_id',
    'badge_id',
    'awarded_by',
    'awarded_at',
    'status',
    'revoke_reason'
  ],
  'Certificates': [
    'certificate_id',
    'member_id',
    'type',
    'event_name',
    'achievement_description',
    'issued_by',
    'collaborating_org',
    'issue_date',
    'status',
    'file_generated',
    'emailed_at'
  ],
  'Events': [
    'event_id',
    'name',
    'external_url',
    'date_range',
    'summary'
  ],
  'AdminRecords': [
    'admin_id',
    'role',
    'granted_at'
  ],
  'AuditLog': [
    'audit_id',
    'actor',
    'action',
    'target',
    'timestamp',
    'metadata'
  ],
  'Counters': [
    'counter_name',
    'current_value'
  ]
};

/**
 * Main Setup function.
 * Creates all required sheets if they do not exist and sets up their headers.
 */
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  for (const [sheetName, headers] of Object.entries(SCHEMAS)) {
    let sheet = ss.getSheetByName(sheetName);
    
    // Create sheet if missing
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      Logger.log(`Created sheet: ${sheetName}`);
    } else {
      Logger.log(`Found existing sheet: ${sheetName}`);
    }
    
    // Set headers on row 1
    const range = sheet.getRange(1, 1, 1, headers.length);
    range.setValues([headers]);
    
    // Apply styling to headers
    range.setFontWeight('bold');
    range.setBackground('#101419');
    range.setFontColor('#a6c8ff');
    range.setFontFamily('Roboto');
    sheet.setFrozenRows(1);
    
    // Pre-populate system Counters if empty
    if (sheetName === 'Counters') {
      const data = sheet.getDataRange().getValues();
      if (data.length <= 1) {
        sheet.appendRow(['member_id', 0]);
        sheet.appendRow(['certificate_id_2026', 0]);
        Logger.log('Seeded Counters sheet with default rows.');
      }
    }
    
    // Auto-fit column widths
    for (let col = 1; col <= headers.length; col++) {
      sheet.autoResizeColumn(col);
    }
  }
  
  Logger.log('Google Sheet database setup completed successfully!');
}

/**
 * OnOpen trigger to create a custom menu in Google Sheets.
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Hack Orbit')
    .addItem('Setup Database Tabs', 'setupSheets')
    .addToUi();
}
