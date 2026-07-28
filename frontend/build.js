const fs = require('fs');
const path = require('path');

// Configuration
const FRONTEND_DIR = __dirname;                        // frontend/
const PROJECT_ROOT = path.join(FRONTEND_DIR, '..');
const SRC_DIR    = path.join(FRONTEND_DIR, 'pages-src');
const PARTIALS_DIR = path.join(FRONTEND_DIR, 'partials');
const CSS_DIR    = path.join(FRONTEND_DIR, 'css');
const OUTPUT_DIR = path.join(FRONTEND_DIR, 'build-output');

// Helper: Minify CSS (simple whitespace and comment removal)
function minifyCSS(cssText) {
  return cssText
    .replace(/\/\*[\s\S]*?\*\//g, '') // remove comments
    .replace(/\s+/g, ' ')            // collapse whitespace
    .replace(/\s*([\{\}:;\,])\s*/g, '$1') // remove spaces around brackets and punctuation
    .replace(/;}/g, '}')             // remove trailing semicolon
    .trim();
}

// 1. Concatenate and Minify CSS
function buildCSS() {
  console.log('Building and minifying CSS...');
  const cssFiles = [
    'reset.css',
    'variables.css',
    'global.css',
    'components.css',
    'animations.css',
    'responsive.css'
  ];

  let combinedCSS = '';
  const importRules = []; // Collect @import rules — they MUST come first per CSS spec

  cssFiles.forEach(file => {
    const filePath = path.join(CSS_DIR, file);
    if (fs.existsSync(filePath)) {
      let source = fs.readFileSync(filePath, 'utf8');
      // Extract all @import lines before concatenating so they stay at the top
      // Handle potential semicolons inside url(...) queries (e.g. Google Fonts)
      source = source.replace(/@import\s+(?:url\([^)]+\)|"[^"]+"|'[^']+')\s*;/g, (match) => {
        if (!importRules.includes(match.trim())) {
          importRules.push(match.trim());
        }
        return ''; // Remove from inline position
      });
      combinedCSS += source + '\n';
    } else {
      console.warn(`Warning: CSS file not found: ${file}`);
    }
  });

  // Prepend deduplicated @import rules, then the rest of the minified CSS
  // Each @import must be on its own line (some browsers count column positions strictly)
  const minifiedBody = minifyCSS(combinedCSS);
  const minifiedCSS = importRules.join('\n') + '\n' + minifiedBody;
  const outputCSSPath = path.join(CSS_DIR, 'styles.css');
  fs.writeFileSync(outputCSSPath, minifiedCSS, 'utf8');
  console.log(`CSS build completed: ${outputCSSPath} (${minifiedCSS.length} bytes)`);
}

function prepareOutputDirectory() {
  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const frontendOutputDir = path.join(OUTPUT_DIR, 'frontend');
  fs.mkdirSync(frontendOutputDir, { recursive: true });

  fs.readdirSync(FRONTEND_DIR, { withFileTypes: true }).forEach(entry => {
    if (entry.name === 'build-output') {
      return;
    }

    const srcPath = path.join(FRONTEND_DIR, entry.name);
    const destPath = path.join(frontendOutputDir, entry.name);

    if (entry.isDirectory()) {
      fs.cpSync(srcPath, destPath, { recursive: true });
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });

  const sitemapSource = path.join(PROJECT_ROOT, 'sitemap.xml');
  if (fs.existsSync(sitemapSource)) {
    fs.copyFileSync(sitemapSource, path.join(OUTPUT_DIR, 'sitemap.xml'));
  }

  const robotsSource = path.join(PROJECT_ROOT, 'seo', 'robots.txt');
  if (fs.existsSync(robotsSource)) {
    fs.copyFileSync(robotsSource, path.join(OUTPUT_DIR, 'robots.txt'));
  }
}

function cleanGeneratedOutput(sourceFiles) {
  const expectedOutputNames = new Set(sourceFiles);

  fs.readdirSync(OUTPUT_DIR, { withFileTypes: true }).forEach(entry => {
    if (!entry.isFile() || path.extname(entry.name) !== '.html') {
      return;
    }

    if (!expectedOutputNames.has(entry.name)) {
      fs.unlinkSync(path.join(OUTPUT_DIR, entry.name));
      console.log(`Removed stale output: ${entry.name}`);
    }
  });
}

// 2. Assemble Pages from Source and Partials
function buildPages() {
  console.log('Assembling HTML pages...');
  
  // Load partials
  const head = fs.readFileSync(path.join(PARTIALS_DIR, 'head.html'), 'utf8');
  const nav = fs.readFileSync(path.join(PARTIALS_DIR, 'nav.html'), 'utf8');
  const footer = fs.readFileSync(path.join(PARTIALS_DIR, 'footer.html'), 'utf8');

  const partials = { head, nav, footer };

  // Read all files from pages-src/
  const files = fs.readdirSync(SRC_DIR).filter(file => path.extname(file) === '.html');
  cleanGeneratedOutput(files);

  files.forEach(file => {
    const srcPath = path.join(SRC_DIR, file);
    let content = fs.readFileSync(srcPath, 'utf8');

    // Replace include placeholders: {{include:name}}
    content = content.replace(/\{\{include:([a-zA-Z0-9_-]+)\}\}/g, (match, partialName) => {
      if (partials[partialName] !== undefined) {
        return partials[partialName];
      }
      console.warn(`Warning: Partial "${partialName}" not found in ${file}`);
      return match;
    });

    const destPath = path.join(OUTPUT_DIR, file);
    fs.writeFileSync(destPath, content, 'utf8');
    console.log(`Assembled: ${file} -> ${destPath}`);
  });
}

// Main Runner
try {
  prepareOutputDirectory();
  buildCSS();
  buildPages();
  console.log('Build completed successfully!');
} catch (err) {
  console.error('Build failed:', err);
  process.exit(1);
}
