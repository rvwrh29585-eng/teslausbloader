#!/usr/bin/env node

/**
 * Sync sounds from notateslaapp.com
 * 
 * This script:
 * 1. Scrapes the lock sounds page for all available sounds
 * 2. Compares to existing sounds in the sounds/ directory
 * 3. Downloads any new sounds
 * 4. Outputs a summary of changes
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const SOURCE_URL = 'https://www.notateslaapp.com/tesla-custom-lock-sounds/';
const BASE_URL = 'https://www.notateslaapp.com';
const SOUNDS_DIR = path.join(__dirname, '..', 'sounds');

// Fetch a URL and return the response body
function fetch(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const request = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TeslaLockSoundLoader/1.0)',
      }
    }, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return fetch(response.headers.location).then(resolve).catch(reject);
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode} for ${url}`));
        return;
      }
      
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    });
    
    request.on('error', reject);
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error(`Timeout fetching ${url}`));
    });
  });
}

// Parse HTML to extract sound URLs
function extractSoundUrls(html) {
  const sounds = [];
  const seen = new Set();

  // Current Not a Tesla App markup uses data-file on download buttons.
  // Also accept legacy href="/assets/audio/..." links if they reappear.
  const patterns = [
    /data-file="(\/assets\/customizations\/lock-sounds\/wav\/[^"]+\.wav)"/gi,
    /href="(\/assets\/customizations\/lock-sounds\/wav\/[^"]+\.wav)"/gi,
    /href="(\/assets\/audio\/[^"]+\.wav)"/gi,
  ];

  for (const regex of patterns) {
    let match;
    while ((match = regex.exec(html)) !== null) {
      const filePath = match[1];
      const encodedName = filePath.split('/').pop() || '';
      const filename = decodeURIComponent(encodedName);

      if (!filename || seen.has(filename)) continue;
      seen.add(filename);

      sounds.push({
        path: filePath,
        filename,
        url: `${BASE_URL}${filePath}`,
      });
    }
  }

  return sounds;
}

// Get existing sounds in the sounds directory
function getExistingSounds() {
  if (!fs.existsSync(SOUNDS_DIR)) {
    fs.mkdirSync(SOUNDS_DIR, { recursive: true });
    return new Set();
  }
  
  const files = fs.readdirSync(SOUNDS_DIR);
  return new Set(files.filter(f => f.endsWith('.wav')));
}

// Download a file
async function downloadFile(url, destPath) {
  const buffer = await fetch(url);
  fs.writeFileSync(destPath, buffer);
  return buffer.length;
}

// Main sync function
async function sync() {
  console.log('🔍 Fetching sound list from notateslaapp.com...\n');
  
  // Fetch the page
  const html = (await fetch(SOURCE_URL)).toString('utf-8');
  
  // Extract sound URLs
  const remoteSounds = extractSoundUrls(html);
  console.log(`📋 Found ${remoteSounds.length} sounds on source site\n`);
  
  // Get existing sounds
  const existingSounds = getExistingSounds();
  console.log(`📁 Found ${existingSounds.size} sounds in local sounds/ directory\n`);
  
  // Find new sounds
  const newSounds = remoteSounds.filter(s => !existingSounds.has(s.filename));
  
  if (newSounds.length === 0) {
    console.log('✅ No new sounds to download. Everything is up to date!\n');
    return { added: [], total: existingSounds.size };
  }
  
  console.log(`🆕 Found ${newSounds.length} new sounds to download:\n`);
  
  const added = [];
  
  for (const sound of newSounds) {
    const destPath = path.join(SOUNDS_DIR, sound.filename);
    
    try {
      process.stdout.write(`   Downloading ${sound.filename}... `);
      const size = await downloadFile(sound.url, destPath);
      console.log(`✓ (${Math.round(size / 1024)}KB)`);
      added.push(sound.filename);
    } catch (error) {
      console.log(`✗ Error: ${error.message}`);
    }
    
    // Small delay to be nice to the server
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log(`\n✅ Downloaded ${added.length} new sounds\n`);
  
  // Summary for commit message
  if (added.length > 0) {
    console.log('=== SYNC SUMMARY ===');
    console.log(`New sounds: ${added.length}`);
    console.log(`Total sounds: ${existingSounds.size + added.length}`);
    console.log('Added:');
    added.forEach(f => console.log(`  - ${f}`));
    console.log('====================\n');
  }
  
  return { added, total: existingSounds.size + added.length };
}

// Run if called directly
if (require.main === module) {
  sync()
    .then(result => {
      // Write result to file for GitHub Actions to read
      const summaryPath = path.join(__dirname, '..', 'sync-result.json');
      fs.writeFileSync(summaryPath, JSON.stringify(result, null, 2));
      
      // Exit with code 0 if successful
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Sync failed:', error.message);
      process.exit(1);
    });
}

module.exports = { sync };
