// API calls to Cloudflare Worker

export interface Sound {
  name: string;
  category: string;
  url: string;
  displayName: string;
}

const API_BASE = '/api';

export async function fetchSounds(): Promise<Sound[]> {
  const response = await fetch(`${API_BASE}/sounds`);
  if (!response.ok) {
    throw new Error('Failed to fetch sounds');
  }
  const data = await response.json();
  return data.sounds;
}

export function getAudioUrl(filename: string): string {
  return `${API_BASE}/audio/${encodeURIComponent(filename)}`;
}

export function parseCategory(name: string): string {
  return name.split('_')[0];
}

export function formatDisplayName(name: string): string {
  // nintendo_mario-coin -> Mario Coin
  const parts = name.split('_');
  const soundName = parts.slice(1).join(' ') || parts[0];
  return soundName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function formatCategoryName(category: string): string {
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
