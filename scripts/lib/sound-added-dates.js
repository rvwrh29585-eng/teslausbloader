#!/usr/bin/env node

/**
 * Map basename (no .wav) -> ISO date when the file was first added in git.
 * Preserves dates from an existing manifest when git history is shallow
 * (Cloudflare Pages builds), so "Newest" sort keeps working in production.
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
    // Not a git checkout or git unavailable
  }
  return map;
}

/**
 * @param {string} manifestPath
 * @returns {Map<string, string>}
 */
function loadExistingDates(manifestPath) {
  const map = new Map();
  try {
    if (!fs.existsSync(manifestPath)) return map;
    const data = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const entries = Array.isArray(data?.sounds)
      ? data.sounds
      : Array.isArray(data)
        ? data
        : [];
    for (const entry of entries) {
      if (typeof entry === 'string') continue;
      if (entry && typeof entry.name === 'string' && typeof entry.addedAt === 'string') {
        map.set(entry.name, entry.addedAt);
      }
    }
  } catch {
    // ignore corrupt/missing manifest
  }
  return map;
}

/**
 * True when git history looks complete enough to trust for dating.
 * Shallow CI clones often yield 0–1 unique commit dates for hundreds of files.
 */
function gitHistoryLooksComplete(gitDates, fileCount) {
  if (gitDates.size === 0) return false;
  const uniqueDates = new Set(gitDates.values()).size;
  if (fileCount >= 20 && uniqueDates < 2) return false;
  // If git only dated a tiny fraction of files, treat as incomplete
  if (fileCount >= 20 && gitDates.size < fileCount * 0.5) return false;
  return true;
}

/**
 * @param {string} repoRoot
 * @param {string} relativeDir
 * @param {string} [existingManifestPath]
 * @returns {{ name: string, addedAt: string }[]}
 */
function listSoundsWithAddedAt(repoRoot, relativeDir, existingManifestPath) {
  const absDir = path.join(repoRoot, relativeDir);
  const existingDates = existingManifestPath
    ? loadExistingDates(existingManifestPath)
    : new Map();
  const gitDates = getGitAddedDates(repoRoot, relativeDir);
  const entries = [];

  if (!fs.existsSync(absDir)) return entries;

  const files = fs.readdirSync(absDir).filter((f) => f.endsWith('.wav'));
  const trustGit = gitHistoryLooksComplete(gitDates, files.length);

  for (const file of files) {
    const name = file.replace(/\.wav$/i, '');
    let addedAt;

    if (trustGit && gitDates.has(name)) {
      addedAt = gitDates.get(name);
      // Prefer earlier of git vs previously recorded (true first-add)
      const prev = existingDates.get(name);
      if (prev && prev < addedAt) addedAt = prev;
    } else if (existingDates.has(name)) {
      addedAt = existingDates.get(name);
    } else if (gitDates.has(name)) {
      addedAt = gitDates.get(name);
    } else {
      try {
        addedAt = fs.statSync(path.join(absDir, file)).mtime.toISOString();
      } catch {
        addedAt = new Date().toISOString();
      }
    }

    entries.push({ name, addedAt });
  }

  entries.sort((a, b) => a.name.localeCompare(b.name));
  return entries;
}

module.exports = {
  getGitAddedDates,
  loadExistingDates,
  gitHistoryLooksComplete,
  listSoundsWithAddedAt,
};
