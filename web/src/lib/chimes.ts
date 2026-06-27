export type ChimeType = 'lock' | 'ass';

export const CHIMES = {
  lock: {
    filename: 'LockChime.wav',
    label: 'Lock sound',
    menuPath: 'Toybox → Boombox → Lock Sound → USB',
    maxBytes: 1_048_576,
  },
  ass: {
    filename: 'ASSChime.wav',
    label: 'ASS completion',
    menuPath: 'Controls → Autopilot → ASS → Customize Summon → Completion Sound → USB',
    maxBytes: 1_048_576,
  },
} as const;

export type DownloadSoundResult =
  | { success: true; warnedOversized?: boolean }
  | { success: false; message: string; cancelled?: boolean };

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function isWithinChimeLimit(bytes: number, chimeType: ChimeType): boolean {
  return bytes <= CHIMES[chimeType].maxBytes;
}

/** Fetch audio size via HEAD, or full GET if Content-Length is missing. */
export async function fetchSoundByteSize(url: string): Promise<number | null> {
  try {
    const head = await fetch(url, { method: 'HEAD' });
    if (head.ok) {
      const len = head.headers.get('Content-Length');
      if (len) return parseInt(len, 10);
    }
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    return blob.size;
  } catch {
    return null;
  }
}

async function saveBlob(blob: Blob, filename: string): Promise<DownloadSoundResult> {
  try {
    if ('showSaveFilePicker' in window) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- File System Access API
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: filename,
        types: [
          {
            description: 'WAV Audio',
            accept: { 'audio/wav': ['.wav'] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return { success: true };
    }
  } catch (e) {
    if ((e as Error).name === 'AbortError') {
      return { success: false, message: 'Download cancelled', cancelled: true };
    }
  }

  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(objectUrl);
  return { success: true };
}

export async function downloadSoundAsChime(
  url: string,
  chimeType: ChimeType
): Promise<DownloadSoundResult> {
  const chime = CHIMES[chimeType];

  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    return { success: false, message: 'Failed to fetch audio file' };
  }

  if (!response.ok) {
    return { success: false, message: 'Failed to fetch audio file' };
  }

  const blob = await response.blob();
  const oversized = blob.size > chime.maxBytes;

  if (oversized && chimeType === 'ass') {
    return {
      success: false,
      message: `This file is ${formatBytes(blob.size)}. ASS requires under 1 MB. Try a shorter clip or pick another sound.`,
    };
  }

  const saveResult = await saveBlob(blob, chime.filename);
  if (!saveResult.success) return saveResult;

  if (oversized && chimeType === 'lock') {
    return {
      success: true,
      warnedOversized: true,
    };
  }

  return { success: true };
}
