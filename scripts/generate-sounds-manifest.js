#!/usr/bin/env node

/**
 * Lists .wav files in sounds/ with git "date added" and writes
 * web/public/sounds-manifest.json
 */

const fs = require('fs');
const path = require('path');
const { listSoundsWithAddedAt } = require('./lib/sound-added-dates');

const REPO_ROOT = path.join(__dirname, '..');
const OUTPUT_PATH = path.join(REPO_ROOT, 'web', 'public', 'sounds-manifest.json');

function generate() {
  const publicDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const sounds = listSoundsWithAddedAt(REPO_ROOT, 'sounds');
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify({ sounds }, null, 0) + '\n', 'utf8');
  console.log(`Wrote ${sounds.length} synced sound(s) to web/public/sounds-manifest.json`);
}

generate();
