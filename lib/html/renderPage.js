/**
 * lib/html/renderPage.js
 * Fills an HTML template with data and injects shared nav/footer partials.
 * Used by both static build.js AND serverless functions so templates are
 * never duplicated between static and dynamic pages.
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const { escapeHtml } = require('./escapeHtml');

const PARTIALS_DIR  = path.join(__dirname, '../../frontend/partials');
const TEMPLATES_DIR = path.join(__dirname, '../../frontend/templates');

// Cache partials after first read — they never change between requests
let _navPartial    = null;
let _footerPartial = null;

function getNavPartial() {
  if (!_navPartial) _navPartial = fs.readFileSync(path.join(PARTIALS_DIR, 'nav.html'), 'utf8');
  return _navPartial;
}

function getFooterPartial() {
  if (!_footerPartial) _footerPartial = fs.readFileSync(path.join(PARTIALS_DIR, 'footer.html'), 'utf8');
  return _footerPartial;
}

/**
 * Loads a template file and replaces {{TOKEN}} placeholders with escaped data.
 * Special tokens {{NAV_PARTIAL}} and {{FOOTER_PARTIAL}} inject shared HTML.
 *
 * @param {string} templateName  - filename inside frontend/templates/ (e.g. 'profile.template.html')
 * @param {Record<string, string | number>} data - key-value pairs; values are HTML-escaped automatically
 *   UNLESS the key ends with `_PARTIAL` or `_HTML` (trusted HTML passthrough)
 * @returns {string} complete HTML document
 */
function renderPage(templateName, data = {}) {
  const templatePath = path.join(TEMPLATES_DIR, templateName);
  let html = fs.readFileSync(templatePath, 'utf8');

  // Inject nav and footer partials first (trusted HTML, no escaping)
  html = html.replace('{{NAV_PARTIAL}}', getNavPartial());
  html = html.replace('{{FOOTER_PARTIAL}}', getFooterPartial());

  // Replace all remaining {{TOKEN}} placeholders
  html = html.replace(/\{\{([A-Z0-9_]+)\}\}/g, (match, token) => {
    if (!(token in data)) return match; // leave unknown tokens as-is

    const value = data[token];
    // Keys ending with _HTML or _PARTIAL are trusted pre-built HTML; others are escaped
    if (token.endsWith('_HTML') || token.endsWith('_PARTIAL')) {
      return value ?? '';
    }
    return escapeHtml(value ?? '');
  });

  return html;
}

module.exports = { renderPage };
