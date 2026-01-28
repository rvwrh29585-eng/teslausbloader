import { useState, useEffect, useCallback } from 'react';
import type { ProcessedSound } from '../hooks/useSounds';
import { formatCategoryName } from '../lib/api';

interface RandomBrowseProps {
  sounds: ProcessedSound[];
  onSelect: (sound: ProcessedSound) => void;
  onClose: () => void;
  playSound: (url: string, id: string) => void;
  currentlyPlaying: string | null;
  isPlaying: boolean;
}

export function RandomBrowse({ 
  sounds, 
  onSelect, 
  onClose, 
  playSound,
  currentlyPlaying,
  isPlaying 
}: RandomBrowseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledSounds, setShuffledSounds] = useState<ProcessedSound[]>([]);
  const [autoPlay, setAutoPlay] = useState(true);

  // Shuffle sounds on mount
  useEffect(() => {
    const shuffled = [...sounds].sort(() => Math.random() - 0.5);
    setShuffledSounds(shuffled);
  }, [sounds]);

  const currentSound = shuffledSounds[currentIndex];

  // Auto-play current sound
  useEffect(() => {
    if (autoPlay && currentSound && currentlyPlaying !== currentSound.id) {
      playSound(currentSound.url, currentSound.id);
    }
  }, [currentSound, autoPlay, playSound, currentlyPlaying]);

  const nextSound = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % shuffledSounds.length);
  }, [shuffledSounds.length]);

  const prevSound = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + shuffledSounds.length) % shuffledSounds.length);
  }, [shuffledSounds.length]);

  const handleSelect = () => {
    if (currentSound) {
      onSelect(currentSound);
    }
  };

  if (!currentSound) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 rounded-2xl p-6 max-w-md w-full border border-neutral-800">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShuffleIcon className="w-6 h-6 text-red-500" />
            Rando-Browse
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-white transition-colors"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Current Sound */}
        <div className="text-center mb-6">
          <div className="text-sm text-neutral-500 mb-1">
            {formatCategoryName(currentSound.category)}
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            {currentSound.displayName}
          </h3>
          <div className="text-sm text-neutral-500">
            {currentIndex + 1} of {shuffledSounds.length}
          </div>
        </div>

        {/* Playback indicator */}
        <div className="flex justify-center mb-6">
          <div className={`
            w-20 h-20 rounded-full flex items-center justify-center
            ${isPlaying && currentlyPlaying === currentSound.id
              ? 'bg-red-600 animate-pulse'
              : 'bg-neutral-800'
            }
          `}>
            {isPlaying && currentlyPlaying === currentSound.id ? (
              <SoundWaveIcon className="w-10 h-10 text-white" />
            ) : (
              <PlayIcon className="w-10 h-10 text-neutral-500" />
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={prevSound}
            className="p-3 rounded-full bg-neutral-800 text-white hover:bg-neutral-700 transition-colors"
          >
            <PrevIcon className="w-6 h-6" />
          </button>
          
          <button
            onClick={() => playSound(currentSound.url, currentSound.id)}
            className="p-4 rounded-full bg-red-600 text-white hover:bg-red-500 transition-colors"
          >
            {isPlaying && currentlyPlaying === currentSound.id ? (
              <PauseIcon className="w-8 h-8" />
            ) : (
              <PlayIcon className="w-8 h-8" />
            )}
          </button>
          
          <button
            onClick={nextSound}
            className="p-3 rounded-full bg-neutral-800 text-white hover:bg-neutral-700 transition-colors"
          >
            <NextIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Auto-play toggle */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <button
            onClick={() => setAutoPlay(!autoPlay)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm
              ${autoPlay
                ? 'bg-red-600/20 text-red-400'
                : 'bg-neutral-800 text-neutral-400'
              }
            `}
          >
            <div className={`w-3 h-3 rounded-full ${autoPlay ? 'bg-red-500' : 'bg-neutral-600'}`} />
            Auto-play {autoPlay ? 'on' : 'off'}
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={nextSound}
            className="flex-1 py-3 rounded-xl bg-neutral-800 text-white font-medium hover:bg-neutral-700 transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleSelect}
            className="flex-1 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-500 transition-colors"
          >
            Use This Sound
          </button>
        </div>
      </div>
    </div>
  );
}

function ShuffleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
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

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
    </svg>
  );
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
    </svg>
  );
}

function PrevIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
    </svg>
  );
}

function NextIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M11.555 5.168A1 1 0 0010 6v2.798l-5.445-3.63A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4z" />
    </svg>
  );
}

function SoundWaveIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 3v18M8 8v8M4 10v4M16 6v12M20 9v6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" fill="none" />
    </svg>
  );
}
