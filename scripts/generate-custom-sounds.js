#!/usr/bin/env node

/**
 * Lists .wav files in soundscustom/ and writes web/public/custom-sounds.json
 * (array of basenames without .wav). Run before the web build so the deployed
 * site serves the list and /api/sounds can merge it with the scraped list.
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..');
const SOUNDSCUSTOM_DIR = path.join(REPO_ROOT, 'soundscustom');
const OUTPUT_PATH = path.join(REPO_ROOT, 'web', 'public', 'custom-sounds.json');

function generate() {
  const publicDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  let names = [];
  if (fs.existsSync(SOUNDSCUSTOM_DIR)) {
    const files = fs.readdirSync(SOUNDSCUSTOM_DIR);
    names = files
      .filter((f) => f.endsWith('.wav'))
      .map((f) => f.replace(/\.wav$/i, ''))
      .sort((a, b) => a.localeCompare(b));
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(names, null, 0) + '\n', 'utf8');
  console.log(`Wrote ${names.length} custom sound(s) to web/public/custom-sounds.json`);
}

generate();
