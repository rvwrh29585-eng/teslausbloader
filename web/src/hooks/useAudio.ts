import { useState, useRef, useCallback, useEffect } from 'react';

export function useAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentSound, setCurrentSound] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    
    const audio = audioRef.current;
    
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });
    
    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });
    
    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });
    
    audio.addEventListener('play', () => setIsPlaying(true));
    audio.addEventListener('pause', () => setIsPlaying(false));

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  const play = useCallback(async (url: string, soundId: string) => {
    const audio = audioRef.current;
    if (!audio) return;

    // If same sound, toggle play/pause
    if (currentSound === soundId) {
      if (isPlaying) {
        audio.pause();
      } else {
        await audio.play();
      }
      return;
    }

    // New sound
    audio.src = url;
    setCurrentSound(soundId);
    setCurrentTime(0);
    
    try {
      await audio.play();
    } catch (e) {
      console.error('Failed to play audio:', e);
    }
  }, [currentSound, isPlaying]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.pause();
    audio.currentTime = 0;
    setCurrentSound(null);
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  return {
    currentSound,
    isPlaying,
    duration,
    currentTime,
    play,
    stop,
    pause,
  };
}
