/**
 * lib/html/escapeHtml.js
 * Escapes user-controlled strings before inserting them into HTML templates.
 * Must be used for EVERY value sourced from the database or user input.
 */

'use strict';

/**
 * @param {unknown} str
 * @returns {string}
 */
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[&<>"'`]/g, (c) => {
    switch (c) {
      case '&':  return '&amp;';
      case '<':  return '&lt;';
      case '>':  return '&gt;';
      case '"':  return '&quot;';
      case "'":  return '&#x27;';
      case '`':  return '&#x60;';
      default:   return c;
    }
  });
}

module.exports = { escapeHtml };
