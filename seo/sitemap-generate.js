import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public');
const SITE_URL = (process.env.SITE_URL || 'https://hackorbit.example').replace(/\/$/, '');

const EXCLUDE = new Set(['404.html', '500.html']);

function staticUrls() {
  const files = readdirSync(OUT).filter((f) => f.endsWith('.html'));
  const urls = [];
  for (const file of files) {
    if (EXCLUDE.has(file)) continue;
    const path = file === 'index.html' ? '/' : `/${file.replace(/\.html$/, '')}`;
    urls.push(path);
  }
  urls.sort();
  return urls;
}

function sitemapXml(urls) {
  const today = new Date().toISOString().slice(0, 10);
  const items = urls
    .map(
      (p) =>
        `  <url>\n    <loc>${SITE_URL}${p}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${p === '/' ? '1.0' : '0.8'}</priority>\n  </url>`
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</urlset>\n`;
}

if (!existsSync(OUT)) {
  console.error('[sitemap] No public/ output found. Run the frontend build first.');
  process.exit(1);
}

const urls = staticUrls();
writeFileSync(join(OUT, 'sitemap.xml'), sitemapXml(urls));

const robotsTemplate = readFileSync(join(ROOT, 'seo', 'robots.txt'), 'utf8');
writeFileSync(join(OUT, 'robots.txt'), robotsTemplate.replaceAll('{{SITE_URL}}', SITE_URL));

console.log(`[sitemap] ${urls.length} static URLs -> public/sitemap.xml, public/robots.txt`);
