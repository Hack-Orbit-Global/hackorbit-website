/**
 * Hack Orbit — zero-dependency build script.
 *
 * Assembles `frontend/pages-src/*.html` + `frontend/partials/*` into
 * deployable static HTML, concatenates+minifies the CSS design system into a
 * single hashed `styles.css`, and copies `js/` + `assets/` to the static root.
 *
 * Tokens inside `pages-src/*.html`:
 *   <!-- {{HEAD}} -->     replaced with `partials/head.html`
 *   <!-- {{NAV}} -->      replaced with `partials/nav.html`
 *   <!-- {{FOOTER}} -->   replaced with `partials/footer.html`
 *
 * Output goes to `public/` (Vercel `outputDirectory`).
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync, cpSync, existsSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FRONTEND = join(ROOT, 'frontend');
const PAGES_SRC = join(FRONTEND, 'pages-src');
const PARTIALS = join(FRONTEND, 'partials');
const CSS_SRC = join(FRONTEND, 'css');
const JS_SRC = join(FRONTEND, 'js');
const ASSETS_SRC = join(FRONTEND, 'assets');
const OUT = join(ROOT, 'public');

const TOKENS = {
  '<!-- {{HEAD}} -->': 'head.html',
  '<!-- {{NAV}} -->': 'nav.html',
  '<!-- {{FOOTER}} -->': 'footer.html',
};

/** Site base URL — override via SITE_URL env var at build/deploy time. */
const SITE_URL = process.env.SITE_URL || 'https://hackorbit.example';

/** Normalise a file to a plain text string. */
function read(path) {
  return readFileSync(path, 'utf8');
}

function readPartial(name) {
  return read(join(PARTIALS, name));
}

/** Validate a built HTML document for the structural quality gates. */
function validateHtml(html, pageName) {
  const errors = [];

  if (!html.includes('<!doctype html>')) errors.push(`${pageName}: missing <!doctype html>`);
  if ((html.match(/<html/gi) || []).length !== 1) errors.push(`${pageName}: expected exactly one <html>`);
  if ((html.match(/<h1\b/gi) || []).length !== 1) errors.push(`${pageName}: expected exactly one <h1>`);
  if (!html.includes('<nav')) errors.push(`${pageName}: missing <nav>`);
  if (!html.includes('<main')) errors.push(`${pageName}: missing <main>`);
  if (!html.includes('<footer')) errors.push(`${pageName}: missing <footer>`);
  if (!html.includes('rel="canonical"')) errors.push(`${pageName}: missing canonical link`);
  if (!html.includes('name="description"')) errors.push(`${pageName}: missing meta description`);
  if (!html.includes('<title>')) errors.push(`${pageName}: missing <title>`);

  // Every <img> must carry width/height + alt (CLS + accessibility gates).
  const imgRe = /<img\b[^>]*>/gi;
  let m;
  while ((m = imgRe.exec(html)) !== null) {
    const tag = m[0];
    if (!/\balt=/.test(tag)) errors.push(`${pageName}: <img> without alt`);
    if (!/\bwidth=/.test(tag) || !/\bheight=/.test(tag)) errors.push(`${pageName}: <img> without width/height`);
  }

  // Every <a> that links to external http(s) should not be a bare javascript: href.
  if (/href="javascript:/i.test(html)) errors.push(`${pageName}: contains javascript: href`);

  // No leftover build tokens.
  for (const token of Object.keys(TOKENS)) {
    if (html.includes(token)) errors.push(`${pageName}: unreplaced token ${token}`);
  }

  return errors;
}

/** Concatenate CSS in dependency order and minify via esbuild. */
async function buildCss() {
  const order = ['variables.css', 'reset.css', 'global.css', 'components.css', 'animations.css', 'responsive.css'];
  const src = order.map((f) => `/* ${f} */\n` + read(join(CSS_SRC, f))).join('\n');

  let minified = src;
  try {
    const esbuild = await import('esbuild');
    const result = await esbuild.transform(minified, {
      loader: 'css',
      minify: true,
      charset: 'utf8',
    });
    minified = result.code;
  } catch {
    // Fall back to naive whitespace-trim if esbuild is unavailable.
    minified = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').trim();
  }

  const hash = createHash('sha256').update(minified).digest('hex').slice(0, 12);
  const name = `styles.${hash}.css`;
  const outDir = join(OUT, 'css');
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, name), minified);
  writeFileSync(join(outDir, 'manifest.json'), JSON.stringify({ stylesheet: `/css/${name}` }));

  return { name, manifestPath: `/css/${name}` };
}

/** Copy a directory tree recursively. */
function copyDir(src, dest) {
  if (!existsSync(src)) return;
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const from = join(src, entry);
    const to = join(dest, entry);
    if (statSync(from).isDirectory()) {
      copyDir(from, to);
    } else {
      mkdirSync(dirname(to), { recursive: true });
      cpSync(from, to);
    }
  }
}

/** Copy the built output directory into place (handles full `public/` reset). */
function cleanOut() {
  if (existsSync(OUT)) {
    for (const entry of readdirSync(OUT)) {
      rmSync(join(OUT, entry), { recursive: true, force: true });
    }
  }
  mkdirSync(OUT, { recursive: true });
}

let rmSync;
async function main() {
  rmSync = (await import('node:fs')).rmSync;

  const partials = {};
  for (const token of Object.keys(TOKENS)) {
    partials[token] = readPartial(TOKENS[token]);
  }

  cleanOut();

  // Resolve the hashed stylesheet href and inject it into the head partial.
  const { manifestPath } = await buildCss();
  partials['<!-- {{HEAD}} -->'] = partials['<!-- {{HEAD}} -->'].replaceAll('{{CSS_HREF}}', manifestPath);

  // Build each page.
  const pages = readdirSync(PAGES_SRC).filter((f) => f.endsWith('.html'));
  const validationErrors = [];

  for (const page of pages) {
    let html = read(join(PAGES_SRC, page));
    html = html.replaceAll('{{SITE_URL}}', SITE_URL);
    for (const token of Object.keys(TOKENS)) {
      html = html.replaceAll(token, partials[token]);
    }
    validationErrors.push(...validateHtml(html, page));
    writeFileSync(join(OUT, page), html);
    console.log(`[build] ${page}`);
  }

  // Copy JS modules and assets.
  copyDir(JS_SRC, join(OUT, 'js'));
  copyDir(ASSETS_SRC, join(OUT, 'assets'));

  if (validationErrors.length > 0) {
    console.error('\n[build] Validation errors:');
    for (const err of validationErrors) console.error(`  - ${err}`);
    process.exit(1);
  }

  console.log('\n[build] Done. Output: public/');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
