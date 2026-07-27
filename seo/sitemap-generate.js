/**
 * seo/sitemap-generate.js
 * Build-time script that generates sitemap.xml by:
 *  1. Including all static marketing pages (hardcoded)
 *  2. Fetching all verified member IDs from Apps Script and adding /profile/* URLs
 *
 * Run: node seo/sitemap-generate.js > sitemap.xml
 *
 * Env vars required (same as API functions):
 *   APPS_SCRIPT_URL, HO_SERVICE_KEY
 */

'use strict';

const { callAppsScript } = require('../lib/appsScriptClient');

const BASE_URL = 'https://hackorbitglobal.vercel.app';

const STATIC_PAGES = [
  { loc: '/',           changefreq: 'weekly',  priority: '1.0' },
  { loc: '/about',      changefreq: 'monthly', priority: '0.8' },
  { loc: '/projects',   changefreq: 'weekly',  priority: '0.8' },
  { loc: '/contribute', changefreq: 'monthly', priority: '0.7' },
  { loc: '/contact',    changefreq: 'monthly', priority: '0.5' },
  { loc: '/verify',     changefreq: 'monthly', priority: '0.6' },
];

function xmlEntry({ loc, changefreq, priority }) {
  const lastmod = new Date().toISOString().split('T')[0];
  return `  <url>
    <loc>${BASE_URL}${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

async function generate() {
  const entries = STATIC_PAGES.map(xmlEntry);

  // Try to fetch member IDs for profile pages
  try {
    const result = await callAppsScript('listVerifiedMembers', {});
    const members = result.members || [];
    members.forEach(m => {
      entries.push(xmlEntry({
        loc:        `/profile/${m.member_id}`,
        changefreq: 'weekly',
        priority:   '0.7',
      }));
    });
  } catch (err) {
    console.error('[sitemap] Could not fetch member list:', err.message, '— generating static pages only.');
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;

  process.stdout.write(xml);
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
