import { useState, useEffect } from 'react';
import type { ProcessedSound } from '../hooks/useSounds';
import { 
  getCacheSize, 
  clearAudioCache, 
  cacheAllSounds,
  getPreferences,
  savePreferences 
} from '../lib/storage';

interface CacheManagerProps {
  sounds: ProcessedSound[];
}

export function CacheManager({ sounds }: CacheManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [cacheSize, setCacheSize] = useState<{ used: number; total: number } | null>(null);
  const [isCaching, setIsCaching] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [showCachePrompt, setShowCachePrompt] = useState(false);

  // Check if we should prompt for caching (one-time initialization)
  useEffect(() => {
    const prefs = getPreferences();
    if (!prefs.cacheEnabled && sounds.length > 0) {
      // Only show prompt once per session
      const prompted = sessionStorage.getItem('cache-prompted');
      if (!prompted) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time session init
        setShowCachePrompt(true);
        sessionStorage.setItem('cache-prompted', 'true');
      }
    }
  }, [sounds.length]);

  // Load cache size
  useEffect(() => {
    async function loadCacheSize() {
      const size = await getCacheSize();
      setCacheSize(size);
    }
    loadCacheSize();
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleCacheAll = async () => {
    setIsCaching(true);
    setProgress({ current: 0, total: sounds.length });
    
    const urls = sounds.map(s => s.url);
    await cacheAllSounds(urls, (current, total) => {
      setProgress({ current, total });
    });
    
    savePreferences({ cacheEnabled: true, lastCacheDate: new Date().toISOString() });
    
    const size = await getCacheSize();
    setCacheSize(size);
    setIsCaching(false);
    setShowCachePrompt(false);
  };

  const handleClearCache = async () => {
    await clearAudioCache();
    savePreferences({ cacheEnabled: false });
    const size = await getCacheSize();
    setCacheSize(size);
  };

  const handleDismissPrompt = () => {
    setShowCachePrompt(false);
  };

  return (
    <>
      {/* Cache prompt toast */}
      {showCachePrompt && !isCaching && (
        <div className="fixed bottom-28 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-neutral-800 rounded-xl p-4 border border-neutral-700 shadow-xl z-50">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <DatabaseIcon className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-white mb-1">Cache sounds for offline use?</h4>
              <p className="text-sm text-neutral-400 mb-3">
                Download all {sounds.length} sounds (~100MB) for faster playback.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleCacheAll}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500"
                >
                  Cache All
                </button>
                <button
                  onClick={handleDismissPrompt}
                  className="px-3 py-1.5 rounded-lg bg-neutral-700 text-white text-sm font-medium hover:bg-neutral-600"
                >
                  Maybe Later
                </button>
              </div>
            </div>
            <button
              onClick={handleDismissPrompt}
              className="text-neutral-500 hover:text-white"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Caching progress */}
      {isCaching && (
        <div className="fixed bottom-28 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-neutral-800 rounded-xl p-4 border border-neutral-700 shadow-xl z-50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <LoadingIcon className="w-5 h-5 text-blue-400 animate-spin" />
            </div>
            <div>
              <div className="font-medium text-white">Caching sounds...</div>
              <div className="text-sm text-neutral-400">
                {progress.current} of {progress.total}
              </div>
            </div>
          </div>
          <div className="h-2 bg-neutral-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Cache settings button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-28 right-4 p-3 rounded-full bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-all z-30 hidden md:flex"
        title="Cache settings"
      >
        <DatabaseIcon className="w-5 h-5" />
      </button>

      {/* Cache settings panel */}
      {isOpen && (
        <div className="fixed bottom-44 right-4 w-72 bg-neutral-800 rounded-xl p-4 border border-neutral-700 shadow-xl z-40">
          <h4 className="font-medium text-white mb-3">Storage & Cache</h4>
          
          {cacheSize && (
            <div className="text-sm text-neutral-400 mb-4">
              Using {formatSize(cacheSize.used)} of {formatSize(cacheSize.total)}
            </div>
          )}
          
          <div className="space-y-2">
            <button
              onClick={handleCacheAll}
              disabled={isCaching}
              className="w-full py-2 px-4 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCaching ? 'Caching...' : `Cache All (${sounds.length} sounds)`}
            </button>
            <button
              onClick={handleClearCache}
              className="w-full py-2 px-4 rounded-lg bg-neutral-700 text-white text-sm font-medium hover:bg-neutral-600"
            >
              Clear Cache
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function DatabaseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
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

function LoadingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
