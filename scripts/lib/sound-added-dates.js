#!/usr/bin/env node

/**
 * Map basename (no .wav) -> ISO date when the file was first added in git.
 * Falls back to filesystem mtime for untracked files.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * @param {string} repoRoot
 * @param {string} relativeDir e.g. "sounds" or "soundscustom"
 * @returns {Map<string, string>}
 */
function getGitAddedDates(repoRoot, relativeDir) {
  const map = new Map();
  try {
    const output = execSync(
      `git log --diff-filter=A --name-only --pretty=format:"COMMIT:%aI" -- "${relativeDir}/"`,
      { cwd: repoRoot, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 }
    );

    let currentDate = null;
    for (const line of output.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (trimmed.startsWith('COMMIT:')) {
        currentDate = trimmed.slice('COMMIT:'.length);
        continue;
      }
      if (!currentDate || !trimmed.endsWith('.wav')) continue;
      if (!trimmed.startsWith(`${relativeDir}/`)) continue;

      const name = path.basename(trimmed, '.wav');
      // git log is newest-first; keep earliest add if file appears more than once
      const existing = map.get(name);
      if (!existing || currentDate < existing) {
        map.set(name, currentDate);
      }
    }
  } catch {
    // Not a git checkout or git unavailable — fall back to mtimes only
  }
  return map;
}

/**
 * @param {string} repoRoot
 * @param {string} relativeDir
 * @returns {{ name: string, addedAt: string }[]}
 */
function listSoundsWithAddedAt(repoRoot, relativeDir) {
  const absDir = path.join(repoRoot, relativeDir);
  const gitDates = getGitAddedDates(repoRoot, relativeDir);
  const entries = [];

  if (!fs.existsSync(absDir)) return entries;

  for (const file of fs.readdirSync(absDir)) {
    if (!file.endsWith('.wav')) continue;
    const name = file.replace(/\.wav$/i, '');
    let addedAt = gitDates.get(name);
    if (!addedAt) {
      try {
        addedAt = fs.statSync(path.join(absDir, file)).mtime.toISOString();
      } catch {
        addedAt = new Date(0).toISOString();
      }
    }
    entries.push({ name, addedAt });
  }

  entries.sort((a, b) => a.name.localeCompare(b.name));
  return entries;
}

module.exports = { getGitAddedDates, listSoundsWithAddedAt };
