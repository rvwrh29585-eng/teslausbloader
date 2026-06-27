import { useState, useCallback, useEffect } from 'react';
import { useSounds } from './hooks/useSounds';
import type { ProcessedSound } from './hooks/useSounds';
import { useWraps } from './hooks/useWraps';
import { useAudio } from './hooks/useAudio';
import { useFavorites } from './hooks/useFavorites';
import { useRecentlyPlayed } from './hooks/useRecentlyPlayed';
import { useStats } from './hooks/useStats';
import { useToast } from './components/Toast';
import { Hero } from './components/Hero';
import { StatsToggle } from './components/StatsToggle';
import { Channels, getChannelSounds } from './components/Channels';
import { QuickPicks } from './components/QuickPicks';
import { MostPopular } from './components/MostPopular';
import { SoundBrowser } from './components/SoundBrowser';
import { RandomBrowse } from './components/RandomBrowse';
import { DownloadPanel } from './components/DownloadPanel';
import { CacheManager } from './components/CacheManager';
import { WrapBrowser } from './components/WrapBrowser';

type AppSection = 'sounds' | 'wraps';

function App() {
  const { sounds, categories, loading: soundsLoading, error: soundsError } = useSounds();
  const { wraps, loading: wrapsLoading } = useWraps();
  const { currentSound, isPlaying, play, stop } = useAudio();
  const { favorites, toggleFavorite } = useFavorites();
  const { recentlyPlayed, addRecentlyPlayed } = useRecentlyPlayed();
  const { recordPlay, recordDownload, recordFavorite, getPlayCount, getTopSounds, getTopFavorited, globalStats, mode, setMode } = useStats();
  const { showToast } = useToast();
  const [selectedSound, setSelectedSound] = useState<ProcessedSound | null>(null);
  const [section, setSection] = useState<AppSection>('sounds');
  const [showRandomBrowse, setShowRandomBrowse] = useState(false);
  const [activeChannel, setActiveChannel] = useState<string | null>(null);

  const channelFilteredSounds = activeChannel
    ? getChannelSounds(sounds, activeChannel)
    : sounds;

  useEffect(() => {
    if (sounds.length === 0) return;

    const params = new URLSearchParams(window.location.search);
    const sharedSoundId = params.get('sound');

    if (sharedSoundId) {
      const sound = sounds.find(s => s.id === sharedSoundId);
      if (sound) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time URL param initialization
        setSelectedSound(sound);
        setSection('sounds');
        showToast(`Loaded shared sound: ${sound.displayName}`);
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [sounds, showToast]);

  const handlePlaySound = useCallback((sound: ProcessedSound) => {
    play(sound.url, sound.id);
    addRecentlyPlayed(sound.id);
    recordPlay(sound.id);
  }, [play, addRecentlyPlayed, recordPlay]);

  const handleSelectSound = useCallback((sound: ProcessedSound) => {
    setSelectedSound(sound);
    setSection('sounds');
    setShowRandomBrowse(false);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedSound(null);
    stop();
  }, [stop]);

  const handleToggleFavorite = useCallback((soundId: string) => {
    const wasAlreadyFavorite = favorites.includes(soundId);
    toggleFavorite(soundId);
    recordFavorite(soundId, !wasAlreadyFavorite);
  }, [favorites, toggleFavorite, recordFavorite]);

  const handleShareSound = useCallback(async (sound: ProcessedSound) => {
    const shareUrl = `${window.location.origin}?sound=${encodeURIComponent(sound.id)}`;
    const shareData = {
      title: `${sound.displayName} - Tesla USB Loader`,
      text: `Check out this sound on Tesla USB Loader: ${sound.displayName}`,
      url: shareUrl,
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        showToast('Shared!');
      } else {
        await navigator.clipboard.writeText(shareUrl);
        showToast('Link copied to clipboard!');
      }
    } catch (err) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        showToast('Link copied to clipboard!');
      } catch {
        console.error('Failed to share or copy:', err);
      }
    }
  }, [showToast]);

  const subtitle =
    section === 'wraps'
      ? wrapsLoading
        ? 'Loading wraps...'
        : `${wraps.length} wrap${wraps.length === 1 ? '' : 's'} available`
      : soundsLoading
        ? 'Loading sounds...'
        : activeChannel
          ? `${channelFilteredSounds.length} of ${sounds.length} sounds`
          : `${sounds.length} sounds available`;

  return (
    <div className="min-h-screen pb-4">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-red-600 focus:text-white focus:outline-none"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 bg-neutral-950/95 backdrop-blur-lg border-b border-neutral-800 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <img src="/locksound-logo.jpg" alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" aria-hidden />
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-white">Tesla USB Loader</h1>
                <p className="text-sm text-neutral-500 truncate">{subtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => {
                  setSection('sounds');
                  setShowRandomBrowse(false);
                }}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${section === 'sounds'
                    ? 'bg-red-600 text-white'
                    : 'text-neutral-400 hover:text-white bg-neutral-800/50'
                  }
                `}
              >
                Sounds
              </button>
              <button
                onClick={() => {
                  setSection('wraps');
                  setShowRandomBrowse(false);
                }}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${section === 'wraps'
                    ? 'bg-red-600 text-white'
                    : 'text-neutral-400 hover:text-white bg-neutral-800/50'
                  }
                `}
              >
                Wraps
              </button>
              {section === 'sounds' && (
                <button
                  onClick={() => setShowRandomBrowse(true)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                >
                  <ShuffleIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Rando-Browse</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main id="main" className="max-w-7xl mx-auto px-4 py-6">
        {section === 'sounds' ? (
          soundsLoading ? (
            <div className="flex items-center justify-center py-24">
              <div className="text-center">
                <LoadingSpinner className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <div className="text-neutral-400">Loading sounds...</div>
              </div>
            </div>
          ) : soundsError ? (
            <div className="text-center py-24 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <ErrorIcon className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Failed to load sounds</h2>
              <p className="text-neutral-400 mb-4">{soundsError}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-500"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <Hero />

              <StatsToggle
                mode={mode}
                onModeChange={setMode}
                globalStats={globalStats}
              />

              <Channels
                sounds={sounds}
                activeChannel={activeChannel}
                onSelectChannel={setActiveChannel}
              />

              <QuickPicks
                sounds={channelFilteredSounds}
                currentlyPlaying={currentSound}
                isPlaying={isPlaying}
                onPlay={handlePlaySound}
                onSelect={handleSelectSound}
              />

              <MostPopular
                sounds={sounds}
                topPlayed={getTopSounds(5)}
                topFavorited={getTopFavorited(5)}
                currentlyPlaying={currentSound}
                isPlaying={isPlaying}
                onPlay={handlePlaySound}
                onSelect={handleSelectSound}
              />

              <SoundBrowser
                sounds={channelFilteredSounds}
                categories={categories}
                selectedSound={selectedSound}
                currentlyPlaying={currentSound}
                isPlaying={isPlaying}
                favorites={favorites}
                recentlyPlayed={recentlyPlayed}
                getPlayCount={getPlayCount}
                onPlaySound={handlePlaySound}
                onSelectSound={handleSelectSound}
                onToggleFavorite={handleToggleFavorite}
                onShareSound={handleShareSound}
              />
            </>
          )
        ) : (
          <WrapBrowser />
        )}
      </main>

      {section === 'sounds' && showRandomBrowse && !soundsLoading && !soundsError && (
        <RandomBrowse
          sounds={sounds}
          onSelect={handleSelectSound}
          onClose={() => setShowRandomBrowse(false)}
          playSound={play}
          currentlyPlaying={currentSound}
          isPlaying={isPlaying}
        />
      )}

      {section === 'sounds' && (
        <DownloadPanel
          selectedSound={selectedSound}
          onClearSelection={handleClearSelection}
          onDownload={recordDownload}
        />
      )}

      {section === 'sounds' && !soundsLoading && !soundsError && (
        <CacheManager sounds={sounds} />
      )}

      <footer className="max-w-7xl mx-auto px-4 py-8 mt-8 border-t border-neutral-800">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-neutral-500">
          <div className="flex items-center gap-2">
            <span>v1.0.0</span>
            <span className="text-neutral-700">•</span>
            <a
              href="https://www.notateslaapp.com/tesla-custom-lock-sounds/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-red-400 transition-colors"
            >
              Sounds catalog from Not a Tesla App
            </a>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/rvwrh29585-eng/teslausbloader"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
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

function ShuffleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

export default App;
