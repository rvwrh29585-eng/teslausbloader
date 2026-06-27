import { useState, useEffect } from 'react';
import type { Wrap } from '../hooks/useWraps';
import { getWrapModelLabel, isPngFilename } from '../lib/wrapModels';
import { useToast } from './Toast';

interface WrapCardProps {
  wrap: Wrap;
}

export function WrapCard({ wrap }: WrapCardProps) {
  const { showToast } = useToast();
  const [showInstructions, setShowInstructions] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const needsPngWarning = !isPngFilename(wrap.filename);

  useEffect(() => {
    if (!showInstructions) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowInstructions(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showInstructions]);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const response = await fetch(wrap.url);
      if (!response.ok) {
        showToast('Download failed — try again');
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = wrap.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setShowInstructions(true);
    } catch {
      showToast('Download failed — try again');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden hover:border-neutral-700 transition-colors group">
        <div className="aspect-square bg-neutral-950 relative">
          <img
            src={wrap.url}
            alt={wrap.displayName}
            className="w-full h-full object-contain p-2"
            loading="lazy"
          />
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-neutral-900/90 text-xs text-neutral-300 border border-neutral-700">
            {getWrapModelLabel(wrap.modelId)}
          </span>
        </div>

        <div className="p-3 space-y-2">
          <h3 className="font-medium text-white truncate" title={wrap.displayName}>
            {wrap.displayName}
          </h3>
          <p className="text-xs text-neutral-500 font-mono truncate">{wrap.filename}</p>

          {needsPngWarning && (
            <p className="text-xs text-amber-500/90 flex items-start gap-1">
              <WarningIcon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              Tesla requires PNG — convert before use
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-500 transition-colors disabled:opacity-50"
              aria-label={`Download ${wrap.displayName}`}
            >
              <DownloadIcon className="w-4 h-4" />
              {downloading ? 'Saving…' : 'Download'}
            </button>
            <button
              onClick={() => setShowInstructions(true)}
              className="p-2 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
              title="USB setup instructions"
              aria-label="Show USB setup instructions"
            >
              <InfoIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {showInstructions && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-2xl p-6 max-w-md w-full border border-neutral-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckIcon className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-white">Apply Your Wrap</h3>
            </div>

            <div className="space-y-4 text-neutral-300">
              <p>
                Copy <span className="text-white font-mono">{wrap.filename}</span> to your Tesla USB
                drive:
              </p>

              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Format USB as exFAT or FAT32 (not NTFS)</li>
                <li>
                  Create a folder named <span className="text-white font-mono">Wraps</span> at the{' '}
                  <span className="text-red-400">root</span> of the drive (capital W)
                </li>
                <li>
                  Copy <span className="text-white font-mono">{wrap.filename}</span> into{' '}
                  <span className="text-white font-mono">Wraps/</span>
                </li>
                <li>Safely eject and plug into your Tesla&apos;s centre console USB port</li>
                <li>
                  Go to <span className="text-white">Toybox → Paint Shop → Wraps</span>
                </li>
              </ol>

              <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="flex gap-2">
                  <WarningIcon className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-amber-400 font-medium">PNG only, under 1 MB</p>
                    <p className="text-amber-300/70 mt-1">
                      Up to 10 wraps at a time. Do not put map or firmware files on the same drive.
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

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
