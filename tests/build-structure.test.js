const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const repoRoot = path.resolve(__dirname, '..');
const buildScript = path.join(repoRoot, 'frontend', 'build.js');
const buildOutputDir = path.join(repoRoot, 'frontend', 'build-output');
const staleOutputPath = path.join(buildOutputDir, 'stale-generated.html');

test('build removes stale generated HTML files from the build output directory', () => {
  fs.mkdirSync(buildOutputDir, { recursive: true });
  fs.writeFileSync(staleOutputPath, '<p>stale output</p>', 'utf8');

  try {
    execFileSync(process.execPath, [buildScript], {
      cwd: repoRoot,
      stdio: 'pipe'
    });

    assert.equal(fs.existsSync(staleOutputPath), false, 'stale generated HTML should be removed');
  } finally {
    if (fs.existsSync(staleOutputPath)) {
      fs.unlinkSync(staleOutputPath);
    }
  }
});
