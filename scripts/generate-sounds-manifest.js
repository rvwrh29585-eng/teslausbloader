#!/usr/bin/env node

/**
 * Lists .wav files in sounds/ and writes web/public/sounds-manifest.json
 * (array of basenames without .wav). Keeps the site catalog resilient when
 * the Not a Tesla App page HTML changes.
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..');
const SOUNDS_DIR = path.join(REPO_ROOT, 'sounds');
const OUTPUT_PATH = path.join(REPO_ROOT, 'web', 'public', 'sounds-manifest.json');

function generate() {
  const publicDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  let names = [];
  if (fs.existsSync(SOUNDS_DIR)) {
    names = fs
      .readdirSync(SOUNDS_DIR)
      .filter((f) => f.endsWith('.wav'))
      .map((f) => f.replace(/\.wav$/i, ''))
      .sort((a, b) => a.localeCompare(b));
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(names, null, 0) + '\n', 'utf8');
  console.log(`Wrote ${names.length} synced sound(s) to web/public/sounds-manifest.json`);
}

generate();
