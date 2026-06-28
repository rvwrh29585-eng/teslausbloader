// Vehicle model labels for wrap folders (aligned with Tesla custom-wraps slugs)

export const WRAP_MODEL_LABELS: Record<string, string> = {
  modely: 'Model Y (pre-2025)',
  'modely-2025-base': 'Model Y (2025+) Standard',
  'modely-2025-premium': 'Model Y (2025+) Premium',
  model3: 'Model 3 (pre-2024)',
  'model3-2024-base': 'Model 3 (2024+) Standard',
  'model3-2024-premium': 'Model 3 (2024+) Premium',
  cybertruck: 'Cybertruck',
  models: 'Model S',
  modelx: 'Model X',
  'model-s-refresh': 'Model S Refresh',
  'model-x-refresh': 'Model X Refresh',
  semi: 'Semi',
  roadster: 'Roadster',
};

export function getWrapModelLabel(modelId: string): string {
  if (WRAP_MODEL_LABELS[modelId]) {
    return WRAP_MODEL_LABELS[modelId];
  }
  return modelId
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function formatWrapDisplayName(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, '');
  return base
    .replace(/[_-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function isPngFilename(filename: string): boolean {
  return filename.toLowerCase().endsWith('.png');
}
