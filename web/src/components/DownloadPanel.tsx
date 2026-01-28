import { useState } from 'react';
import type { ProcessedSound } from '../hooks/useSounds';

interface DownloadPanelProps {
  selectedSound: ProcessedSound | null;
  onClearSelection: () => void;
  onDownload?: (soundId: string) => void;
}

export function DownloadPanel({ selectedSound, onClearSelection, onDownload }: DownloadPanelProps) {
  const [showInstructions, setShowInstructions] = useState(false);

  const handleDownload = async () => {
    if (!selectedSound) return;

    try {
      // Try File System Access API first (Chrome/Edge)
      if ('showSaveFilePicker' in window) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- File System Access API
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: 'LockChime.wav',
          types: [
            {
              description: 'WAV Audio',
              accept: { 'audio/wav': ['.wav'] },
            },
          ],
        });
        
        const response = await fetch(selectedSound.url);
        const blob = await response.blob();
        
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        
        // Record the download
        onDownload?.(selectedSound.id);
        setShowInstructions(true);
        return;
      }
    } catch (e) {
      // User cancelled or API not available
      if ((e as Error).name === 'AbortError') return;
    }

    // Fallback: standard download
    const response = await fetch(selectedSound.url);
    const blob = await response.blob();
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'LockChime.wav';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Record the download
    onDownload?.(selectedSound.id);
    setShowInstructions(true);
  };

  if (!selectedSound) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-neutral-900/95 backdrop-blur-lg border-t border-neutral-800 p-4 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-lg bg-red-600/20 flex items-center justify-center flex-shrink-0">
              <MusicIcon className="w-6 h-6 text-red-500" />
            </div>
            <div className="min-w-0">
              <div className="text-sm text-neutral-400">Selected sound</div>
              <div className="font-medium text-white truncate">{selectedSound.displayName}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={onClearSelection}
              className="p-2 text-neutral-500 hover:text-white transition-colors"
              title="Clear selection"
            >
              <XIcon className="w-5 h-5" />
            </button>
            <div className="text-right">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-500 transition-colors"
              >
                <DownloadIcon className="w-5 h-5" />
                Download as LockChime.wav
              </button>
              <p className="text-[10px] text-amber-500/80 mt-1 flex items-center justify-end gap-1">
                <WarningIcon className="w-3 h-3" />
                Delete old file first to avoid renaming
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Spacer for fixed panel */}
      <div className="h-24" />

      {/* Instructions modal */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-2xl p-6 max-w-md w-full border border-neutral-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckIcon className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-white">Download Complete!</h3>
            </div>
            
            <div className="space-y-4 text-neutral-300">
              <p>Now save the file to your Tesla USB drive:</p>
              
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Insert your Tesla USB drive (usually named <span className="text-white font-mono">TESLADRIVE</span>)</li>
                <li>Move <span className="text-white font-mono">LockChime.wav</span> to the <span className="text-red-400">root</span> of the drive (not in any folder)</li>
                <li>Safely eject the USB drive</li>
                <li>Plug it into your Tesla's glovebox USB port</li>
                <li>Go to <span className="text-white">Toybox → Boombox → Lock Sound → USB</span></li>
              </ol>
              
              <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="flex gap-2">
                  <WarningIcon className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-amber-400 font-medium">File must be named exactly LockChime.wav</p>
                    <p className="text-amber-300/70 mt-1">
                      If your browser renamed it to <span className="font-mono">LockChime (1).wav</span> or similar, 
                      delete the old file first, then re-download.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowInstructions(false)}
              className="w-full mt-6 py-3 rounded-xl bg-neutral-800 text-white font-medium hover:bg-neutral-700 transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function MusicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}
