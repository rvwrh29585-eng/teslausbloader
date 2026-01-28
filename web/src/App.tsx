import { useState, useCallback } from 'react';
import { useSounds } from './hooks/useSounds';
import type { ProcessedSound } from './hooks/useSounds';
import { useAudio } from './hooks/useAudio';
import { SoundBrowser } from './components/SoundBrowser';
import { RandomBrowse } from './components/RandomBrowse';
import { DownloadPanel } from './components/DownloadPanel';
import { CacheManager } from './components/CacheManager';

type ViewMode = 'browse' | 'random';

function App() {
  const { sounds, categories, loading, error } = useSounds();
  const { currentSound, isPlaying, play, stop } = useAudio();
  const [selectedSound, setSelectedSound] = useState<ProcessedSound | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('browse');

  const handlePlaySound = useCallback((sound: ProcessedSound) => {
    play(sound.url, sound.id);
  }, [play]);

  const handleSelectSound = useCallback((sound: ProcessedSound) => {
    setSelectedSound(sound);
    setViewMode('browse');
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedSound(null);
    stop();
  }, [stop]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <div className="text-neutral-400">Loading sounds...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <ErrorIcon className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Failed to load sounds</h2>
          <p className="text-neutral-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-4">
      {/* Header */}
      <header className="sticky top-0 bg-neutral-950/95 backdrop-blur-lg border-b border-neutral-800 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center">
                <BoltIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Tesla Lock Sounds</h1>
                <p className="text-sm text-neutral-500">{sounds.length} sounds available</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('browse')}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${viewMode === 'browse'
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:text-white'
                  }
                `}
              >
                Browse
              </button>
              <button
                onClick={() => setViewMode('random')}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2
                  ${viewMode === 'random'
                    ? 'bg-red-600 text-white'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }
                `}
              >
                <ShuffleIcon className="w-4 h-4" />
                Rando-Browse
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <SoundBrowser
          sounds={sounds}
          categories={categories}
          selectedSound={selectedSound}
          currentlyPlaying={currentSound}
          isPlaying={isPlaying}
          onPlaySound={handlePlaySound}
          onSelectSound={handleSelectSound}
        />
      </main>

      {/* Random browse modal */}
      {viewMode === 'random' && (
        <RandomBrowse
          sounds={sounds}
          onSelect={handleSelectSound}
          onClose={() => setViewMode('browse')}
          playSound={play}
          currentlyPlaying={currentSound}
          isPlaying={isPlaying}
        />
      )}

      {/* Download panel */}
      <DownloadPanel
        selectedSound={selectedSound}
        onClearSelection={handleClearSelection}
      />

      {/* Cache manager */}
      <CacheManager sounds={sounds} />
    </div>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

function ErrorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

function BoltIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
    </svg>
  );
}

function ShuffleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

export default App;
