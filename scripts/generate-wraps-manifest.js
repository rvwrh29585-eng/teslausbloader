#!/usr/bin/env node

/**
 * Scans wraps/{modelId}/*.{png,jpg,jpeg} and writes web/public/wraps-manifest.json
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..');
const WRAPS_DIR = path.join(REPO_ROOT, 'wraps');
const OUTPUT_PATH = path.join(REPO_ROOT, 'web', 'public', 'wraps-manifest.json');

const IMAGE_EXT = /\.(png|jpe?g)$/i;

function formatWrapDisplayName(filename) {
  const base = filename.replace(/\.[^.]+$/, '');
  return base
    .replace(/[_-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function generate() {
  const publicDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const wraps = [];

  if (fs.existsSync(WRAPS_DIR)) {
    const modelDirs = fs.readdirSync(WRAPS_DIR, { withFileTypes: true });
    for (const entry of modelDirs) {
      if (!entry.isDirectory() || entry.name.startsWith('.')) continue;

      const modelId = entry.name;
      const modelPath = path.join(WRAPS_DIR, modelId);
      const files = fs.readdirSync(modelPath);

      for (const file of files) {
        if (!IMAGE_EXT.test(file)) continue;

        const id = `${modelId}/${file.replace(/\.[^.]+$/, '')}`;
        wraps.push({
          id,
          modelId,
          filename: file,
          displayName: formatWrapDisplayName(file),
          url: `/api/wrap/${encodeURIComponent(modelId)}/${encodeURIComponent(file)}`,
        });
      }
    }
  }

  wraps.sort((a, b) => a.displayName.localeCompare(b.displayName));

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify({ wraps }, null, 0) + '\n', 'utf8');
  console.log(`Wrote ${wraps.length} wrap(s) to web/public/wraps-manifest.json`);
}

generate();
