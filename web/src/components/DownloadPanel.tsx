import { useState, useEffect } from 'react';
import type { ProcessedSound } from '../hooks/useSounds';
import {
  CHIMES,
  type ChimeType,
  downloadSoundAsChime,
  fetchSoundByteSize,
  formatBytes,
  isWithinChimeLimit,
} from '../lib/chimes';
import { useToast } from './Toast';
import { MusicIcon, DownloadIcon, XIcon, CheckIcon, WarningIcon } from '../lib/icons';

interface DownloadPanelProps {
  selectedSound: ProcessedSound | null;
  onClearSelection: () => void;
  onDownload?: (soundId: string) => void;
}

export function DownloadPanel({ selectedSound, onClearSelection, onDownload }: DownloadPanelProps) {
  const { showToast } = useToast();
  const [showInstructions, setShowInstructions] = useState(false);
  const [downloadedChime, setDownloadedChime] = useState<ChimeType | null>(null);
  const [fileSizeBytes, setFileSizeBytes] = useState<number | null>(null);
  const [downloading, setDownloading] = useState<ChimeType | null>(null);

  useEffect(() => {
    if (!showInstructions) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowInstructions(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showInstructions]);

  useEffect(() => {
    if (!selectedSound) {
      setFileSizeBytes(null);
      return;
    }
    let cancelled = false;
    fetchSoundByteSize(selectedSound.url).then((size) => {
      if (!cancelled) setFileSizeBytes(size);
    });
    return () => {
      cancelled = true;
    };
  }, [selectedSound?.url]);

  const handleDownload = async (chimeType: ChimeType) => {
    if (!selectedSound || downloading) return;

    setDownloading(chimeType);
    try {
      const result = await downloadSoundAsChime(selectedSound.url, chimeType);

      if (!result.success) {
        if (!result.cancelled) showToast(result.message);
        return;
      }

      if (result.warnedOversized) {
        showToast(
          `Downloaded, but file is over 1 MB. Tesla may not play it. Consider a shorter clip.`
        );
      }

      onDownload?.(selectedSound.id);
      setDownloadedChime(chimeType);
      setShowInstructions(true);
    } finally {
      setDownloading(null);
    }
  };

  if (!selectedSound) return null;

  const chime = downloadedChime ? CHIMES[downloadedChime] : null;
  const assTooLarge = fileSizeBytes !== null && !isWithinChimeLimit(fileSizeBytes, 'ass');

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-neutral-900/95 backdrop-blur-lg border-t border-neutral-800 p-4 z-40">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-lg bg-red-600/20 flex items-center justify-center flex-shrink-0">
              <MusicIcon className="w-6 h-6 text-red-500" />
            </div>
            <div className="min-w-0">
              <div className="text-sm text-neutral-400">Selected sound</div>
              <div className="font-medium text-white truncate">{selectedSound.displayName}</div>
              {fileSizeBytes !== null && (
                <div className="text-xs text-neutral-500 mt-0.5">
                  {formatBytes(fileSizeBytes)}
                  {assTooLarge ? (
                    <span className="text-amber-500/90"> · Too large for ASS (max 1 MB)</span>
                  ) : (
                    <span className="text-green-500/80"> · OK for lock &amp; ASS</span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <button
              onClick={onClearSelection}
              className="p-2 text-neutral-500 hover:text-white transition-colors"
              title="Clear selection"
              aria-label="Clear selection"
            >
              <XIcon className="w-5 h-5" />
            </button>
            <div className="flex flex-col gap-1.5 flex-1 sm:flex-initial">
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload('lock')}
                  disabled={downloading !== null}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-500 transition-colors disabled:opacity-50"
                  aria-label="Download selected sound as LockChime.wav"
                >
                  <DownloadIcon className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">LockChime.wav</span>
                  <span className="sm:hidden">Lock</span>
                </button>
                <button
                  onClick={() => handleDownload('ass')}
                  disabled={downloading !== null || assTooLarge}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-800 text-white text-sm font-medium hover:bg-neutral-700 border border-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Download selected sound as ASSChime.wav"
                  title={assTooLarge ? 'File exceeds 1 MB limit for ASS' : undefined}
                >
                  <DownloadIcon className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">ASSChime.wav</span>
                  <span className="sm:hidden">ASS</span>
                </button>
              </div>
              <p className="text-[10px] text-amber-500/80 flex items-center justify-end gap-1">
                <WarningIcon className="w-3 h-3 flex-shrink-0" />
                Delete old file first to avoid renaming
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for fixed panel */}
      <div className="h-28 sm:h-24" />

      {/* Instructions modal */}
      {showInstructions && chime && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-2xl p-6 max-w-md w-full border border-neutral-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckIcon className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-white">Download Complete!</h3>
            </div>

            <div className="space-y-4 text-neutral-300">
              <p>
                Save <span className="text-white font-mono">{chime.filename}</span> to your Tesla USB
                drive for {chime.label.toLowerCase()}:
              </p>

              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Insert your Tesla USB drive (usually named <span className="text-white font-mono">TESLADRIVE</span>)</li>
                <li>
                  Move <span className="text-white font-mono">{chime.filename}</span> to the{' '}
                  <span className="text-red-400">root</span> of the drive (not in any folder)
                </li>
                <li>Safely eject the USB drive</li>
                <li>Plug it into your Tesla&apos;s glovebox USB port</li>
                <li>
                  Go to <span className="text-white">{chime.menuPath}</span>
                </li>
              </ol>

              <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="flex gap-2">
                  <WarningIcon className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-amber-400 font-medium">
                      File must be named exactly {chime.filename}
                    </p>
                    <p className="text-amber-300/70 mt-1">
                      WAV format, under 1 MB. If your browser renamed the file, delete the old one
                      first, then re-download.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowInstructions(false)}
              className="w-full mt-6 py-3 rounded-xl bg-neutral-800 text-white font-medium hover:bg-neutral-700 transition-colors"
              aria-label="Close instructions"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}

