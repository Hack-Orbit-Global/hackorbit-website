import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const PUBLIC = join(process.cwd(), 'public');

const EXPECTED_PAGES = [
  'index.html',
  'about.html',
  'projects.html',
  'contribute.html',
  'contact.html',
  'join.html',
  'settings.html',
  'verify.html',
  '404.html',
  '500.html',
];

test('build output exists', () => {
  assert.ok(existsSync(PUBLIC), 'public/ directory missing — run `npm run build` first');
});

test('all expected static pages are present', () => {
  const files = readdirSync(PUBLIC);
  for (const page of EXPECTED_PAGES) {
    assert.ok(files.includes(page), `missing ${page}`);
  }
});

test('sitemap.xml and robots.txt are generated', () => {
  assert.ok(existsSync(join(PUBLIC, 'sitemap.xml')));
  assert.ok(existsSync(join(PUBLIC, 'robots.txt')));
  const robots = readFileSync(join(PUBLIC, 'robots.txt'), 'utf8');
  assert.match(robots, /Sitemap:/);
  const sitemap = readFileSync(join(PUBLIC, 'sitemap.xml'), 'utf8');
  assert.match(sitemap, /<urlset/);
  assert.match(sitemap, /hackorbit/);
});

test('every built page passes structural quality gates', () => {
  for (const page of EXPECTED_PAGES) {
    const html = readFileSync(join(PUBLIC, page), 'utf8');
    assert.match(html, /<!doctype html>/i, `${page}: doctype`);
    assert.equal((html.match(/<h1\b/gi) || []).length, 1, `${page}: exactly one <h1>`);
    assert.ok(html.includes('<nav'), `${page}: <nav>`);
    assert.ok(html.includes('<main'), `${page}: <main>`);
    assert.ok(html.includes('<footer'), `${page}: <footer>`);
    assert.ok(html.includes('rel="canonical"'), `${page}: canonical`);
    assert.ok(html.includes('name="description"'), `${page}: meta description`);
    assert.ok(html.includes('<title>'), `${page}: <title>`);
    for (const token of ['{{HEAD}}', '{{NAV}}', '{{FOOTER}}', '{{SITE_URL}}']) {
      assert.ok(!html.includes(token), `${page}: unreplaced token ${token}`);
    }
    const imgs = html.match(/<img\b[^>]*>/gi) || [];
    for (const img of imgs) {
      assert.match(img, /\balt=/, `${page}: <img> with alt`);
      assert.match(img, /\bwidth=/, `${page}: <img> with width`);
      assert.match(img, /\bheight=/, `${page}: <img> with height`);
    }
  }
});

test('hashed stylesheet manifest exists and is referenced', () => {
  const manifest = JSON.parse(readFileSync(join(PUBLIC, 'css', 'manifest.json'), 'utf8'));
  assert.match(manifest.stylesheet, /^\/css\/styles\.[a-f0-9]{12}\.css$/);
  const index = readFileSync(join(PUBLIC, 'index.html'), 'utf8');
  assert.ok(index.includes(manifest.stylesheet), 'index.html references the hashed stylesheet');
});
