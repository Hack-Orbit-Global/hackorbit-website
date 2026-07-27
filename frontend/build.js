const fs = require('fs');
const path = require('path');

// Configuration
const FRONTEND_DIR = __dirname;                        // frontend/
const SRC_DIR    = path.join(FRONTEND_DIR, 'pages-src');
const PARTIALS_DIR = path.join(FRONTEND_DIR, 'partials');
const CSS_DIR    = path.join(FRONTEND_DIR, 'css');
const OUTPUT_DIR = path.join(FRONTEND_DIR, '..');      // project root — HTML files served from here

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
      source = source.replace(/@import\s+[^;]+;/g, (match) => {
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

// 2. Assemble Pages from Source and Partials
function buildPages() {
  console.log('Assembling HTML pages...');
  
  // Load partials
  const head = fs.readFileSync(path.join(PARTIALS_DIR, 'head.html'), 'utf8');
  const nav = fs.readFileSync(path.join(PARTIALS_DIR, 'nav.html'), 'utf8');
  const footer = fs.readFileSync(path.join(PARTIALS_DIR, 'footer.html'), 'utf8');

  const partials = { head, nav, footer };

  // Read all files from pages-src/
  const files = fs.readdirSync(SRC_DIR);
  files.forEach(file => {
    if (path.extname(file) === '.html') {
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
    }
  });
}

// Main Runner
try {
  buildCSS();
  buildPages();
  console.log('Build completed successfully!');
} catch (err) {
  console.error('Build failed:', err);
  process.exit(1);
}
