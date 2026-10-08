import { useState, useEffect, useRef, useCallback } from 'react';

export type GameSfxType = 'click' | 'confirm' | 'warning' | 'upgrade' | 'success' | 'toggle';

interface UseSEOGameAudioOptions {
  initialVolume?: number;
  defaultMuted?: boolean;
}

interface UseSEOGameAudioReturn {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  hasInteracted: boolean;
  toggleSound: () => void;
  setMuted: (muted: boolean) => void;
  setVolume: (vol: number) => void;
  playSfx: (type: GameSfxType) => void;
  triggerAudioUnlock: () => void;
}

/**
 * Page-scoped audio management for /The-SEO-Game.
 * Loads the new uploaded soundtrack:
 *   /audio/the_mountain-retro-game-593063.mp3
 * 
 * - Plays only on /The-SEO-Game.
 * - Handles browser autoplay restrictions gracefully.
 * - Supports volume slider & mute toggling with session storage preference.
 * - Fully stops and cleans up audio instances on unmount.
 */
export function useSEOGameAudio(options: UseSEOGameAudioOptions = {}): UseSEOGameAudioReturn {
  const { initialVolume = 0.2, defaultMuted = false } = options;

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      const stored = sessionStorage.getItem('dsp_seo_game_audio_muted');
      return stored !== null ? stored === 'true' : defaultMuted;
    } catch {
      return defaultMuted;
    }
  });

  const [volume, setVolumeState] = useState<number>(() => {
    try {
      const stored = sessionStorage.getItem('dsp_seo_game_audio_volume');
      return stored !== null ? parseFloat(stored) : initialVolume;
    } catch {
      return initialVolume;
    }
  });

  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  // References
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const isMutedRef = useRef<boolean>(isMuted);
  const volumeRef = useRef<number>(volume);

  isMutedRef.current = isMuted;
  volumeRef.current = volume;

  // Initialize Web Audio Context for instant UI SFX
  const initAudioContext = useCallback(() => {
    if (audioCtxRef.current) {
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
      }
      return audioCtxRef.current;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return null;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      return ctx;
    } catch (err) {
      return null;
    }
  }, []);

  // Start background playback using the new soundtrack file
  const startBackgroundMusic = useCallback(() => {
    const TRACK_SRC = '/audio/the_mountain-retro-game-593063.mp3';

    if (!audioElementRef.current) {
      try {
        const audio = new Audio(TRACK_SRC);
        audio.loop = true;
        audio.preload = 'auto';
        audio.volume = Math.max(0, Math.min(1, volumeRef.current));
        audio.muted = isMutedRef.current;
        audioElementRef.current = audio;

        audio.play().then(() => {
          isPlayingRef.current = true;
          setIsPlaying(true);
        }).catch(() => {
          // Normal: Browser policy blocked autoplay until user gesture
          isPlayingRef.current = false;
          setIsPlaying(false);
        });
      } catch (err) {
        console.warn('Game audio load note:', err);
      }
    } else {
      audioElementRef.current.muted = isMutedRef.current;
      audioElementRef.current.volume = Math.max(0, Math.min(1, volumeRef.current));
      audioElementRef.current.play().then(() => {
        isPlayingRef.current = true;
        setIsPlaying(true);
      }).catch(() => {});
    }
  }, []);

  // Stop background music
  const stopBackgroundMusic = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    isPlayingRef.current = false;
    setIsPlaying(false);
  }, []);

  // Trigger audio unlock on first user interaction
  const triggerAudioUnlock = useCallback(() => {
    if (hasInteracted) return;
    setHasInteracted(true);

    const ctx = initAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    if (!isMutedRef.current && !isPlayingRef.current) {
      startBackgroundMusic();
    }
  }, [hasInteracted, initAudioContext, startBackgroundMusic]);

  // Toggle Mute / Unmute
  const toggleSound = useCallback(() => {
    triggerAudioUnlock();

    setIsMuted(prev => {
      const next = !prev;
      isMutedRef.current = next;

      try {
        sessionStorage.setItem('dsp_seo_game_audio_muted', String(next));
      } catch (_) {}

      if (audioElementRef.current) {
        audioElementRef.current.muted = next;
        if (!next && audioElementRef.current.paused) {
          audioElementRef.current.play().then(() => {
            isPlayingRef.current = true;
            setIsPlaying(true);
          }).catch(() => {});
        }
      } else if (!next) {
        startBackgroundMusic();
      }

      return next;
    });
  }, [triggerAudioUnlock, startBackgroundMusic]);

  // Set Muted explicitly
  const setMuted = useCallback((mutedVal: boolean) => {
    triggerAudioUnlock();
    setIsMuted(mutedVal);
    isMutedRef.current = mutedVal;
    try {
      sessionStorage.setItem('dsp_seo_game_audio_muted', String(mutedVal));
    } catch (_) {}

    if (audioElementRef.current) {
      audioElementRef.current.muted = mutedVal;
      if (!mutedVal && audioElementRef.current.paused) {
        audioElementRef.current.play().catch(() => {});
      }
    }
  }, [triggerAudioUnlock]);

  // Change Volume (0.0 to 1.0)
  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    volumeRef.current = clamped;

    try {
      sessionStorage.setItem('dsp_seo_game_audio_volume', String(clamped));
    } catch (_) {}

    if (audioElementRef.current) {
      audioElementRef.current.volume = clamped;
    }
  }, []);

  // UI SFX Player (Immediate crisp feedback)
  const playSfx = useCallback((type: GameSfxType) => {
    if (isMutedRef.current) return;

    const ctx = initAudioContext();
    if (!ctx || ctx.state !== 'running') return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    switch (type) {
      case 'click':
      case 'toggle': {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(920, now);
        osc.frequency.exponentialRampToValueAtTime(380, now + 0.04);
        gain.gain.setValueAtTime(0.14 * volumeRef.current * 2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.06);
        break;
      }
      case 'confirm':
      case 'success': {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc.type = 'sine';
        osc2.type = 'triangle';

        osc.frequency.setValueAtTime(659.25, now);
        osc.frequency.setValueAtTime(987.77, now + 0.08);
        osc2.frequency.setValueAtTime(1318.51, now + 0.08);

        gain.gain.setValueAtTime(0.16 * volumeRef.current * 2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        gain2.gain.setValueAtTime(0.09 * volumeRef.current * 2, now + 0.08);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gain);
        osc2.connect(gain2);
        gain.connect(ctx.destination);
        gain2.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.36);
        osc2.start(now + 0.08);
        osc2.stop(now + 0.42);
        break;
      }
      case 'warning': {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc.type = 'sawtooth';
        osc2.type = 'square';

        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(190, now + 0.18);
        osc2.frequency.setValueAtTime(277.18, now);
        osc2.frequency.exponentialRampToValueAtTime(200, now + 0.18);

        gain.gain.setValueAtTime(0.18 * volumeRef.current * 2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        osc2.connect(gain2);
        gain.connect(ctx.destination);
        gain2.connect(ctx.destination);

        osc.start(now);
        osc2.start(now);
        osc.stop(now + 0.23);
        osc2.stop(now + 0.23);
        break;
      }
      case 'upgrade': {
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
          const arpOsc = ctx.createOscillator();
          const arpGain = ctx.createGain();
          arpOsc.type = 'triangle';
          arpOsc.frequency.setValueAtTime(freq, now + idx * 0.05);
          arpGain.gain.setValueAtTime(0.14 * volumeRef.current * 2, now + idx * 0.05);
          arpGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.22);
          arpOsc.connect(arpGain);
          arpGain.connect(ctx.destination);
          arpOsc.start(now + idx * 0.05);
          arpOsc.stop(now + idx * 0.05 + 0.24);
        });
        break;
      }
    }
  }, [initAudioContext]);

  // Global user interaction listener to initiate background playback if not muted
  useEffect(() => {
    const handleFirstUserInteraction = () => {
      triggerAudioUnlock();
      window.removeEventListener('pointerdown', handleFirstUserInteraction);
      window.removeEventListener('keydown', handleFirstUserInteraction);
      window.removeEventListener('click', handleFirstUserInteraction);
    };

    window.addEventListener('pointerdown', handleFirstUserInteraction, { once: true });
    window.addEventListener('keydown', handleFirstUserInteraction, { once: true });
    window.addEventListener('click', handleFirstUserInteraction, { once: true });

    return () => {
      window.removeEventListener('pointerdown', handleFirstUserInteraction);
      window.removeEventListener('keydown', handleFirstUserInteraction);
      window.removeEventListener('click', handleFirstUserInteraction);
    };
  }, [triggerAudioUnlock]);

  // Clean up completely when component unmounts (strictly isolated to /The-SEO-Game)
  useEffect(() => {
    return () => {
      stopBackgroundMusic();
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.src = '';
        audioElementRef.current.load();
        audioElementRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, [stopBackgroundMusic]);

  return {
    isPlaying,
    isMuted,
    volume,
    hasInteracted,
    toggleSound,
    setMuted,
    setVolume,
    playSfx,
    triggerAudioUnlock
  };
}
