import { useState, useEffect, useRef, useCallback } from 'react';

export type CityEnvironment = 'lagos' | 'london';

interface EnvironmentalAudioOptions {
  initialVolume?: number;
}

export function useEnvironmentalAudio({ initialVolume = 0.25 }: EnvironmentalAudioOptions = {}) {
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolumeState] = useState(initialVolume);
  const [currentCity, setCurrentCity] = useState<CityEnvironment>('lagos');
  const [isInsideOffice, setIsInsideOffice] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const cityFilterRef = useRef<BiquadFilterNode | null>(null);
  const cityGainRef = useRef<GainNode | null>(null);
  const officeGainRef = useRef<GainNode | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Web Audio graph
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Master Gain
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(isMuted ? 0 : volume, ctx.currentTime);
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;

      // Lowpass filter for interior muffling
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(isInsideOffice ? 650 : 4500, ctx.currentTime);
      filter.connect(masterGain);
      cityFilterRef.current = filter;

      // City Ambient Gain
      const cityGain = ctx.createGain();
      cityGain.gain.setValueAtTime(0.6, ctx.currentTime);
      cityGain.connect(filter);
      cityGainRef.current = cityGain;

      // Office Room Tone Gain
      const officeGain = ctx.createGain();
      officeGain.gain.setValueAtTime(isInsideOffice ? 0.35 : 0.05, ctx.currentTime);
      officeGain.connect(masterGain);
      officeGainRef.current = officeGain;

      // Generate soft pink/brown urban ambient noise buffer (2 seconds loop)
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 0.15; // gentle baseline level
      }

      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;
      noise.connect(cityGain);
      noise.start(0);
      noiseSourceRef.current = noise;

      // Office air-con soft resonance
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.015, ctx.currentTime);
      osc.connect(oscGain);
      oscGain.connect(officeGain);
      osc.start(0);

      setAudioUnlocked(true);
    } catch (e) {
      console.warn('AudioContext initialization warning:', e);
    }
  }, [isMuted, volume, isInsideOffice]);

  // Handle User Gesture Unlock
  const unlockAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      initAudio();
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().then(() => {
        setAudioUnlocked(true);
      });
    }
  }, [initAudio]);

  // Toggle Mute
  const toggleMute = useCallback(() => {
    unlockAudio();
    setIsMuted(prev => {
      const next = !prev;
      if (masterGainRef.current && audioCtxRef.current) {
        masterGainRef.current.gain.setTargetAtTime(
          next ? 0 : volume,
          audioCtxRef.current.currentTime,
          0.05
        );
      }
      return next;
    });
  }, [unlockAudio, volume]);

  // Adjust Volume
  const setVolume = useCallback((newVol: number) => {
    const clamped = Math.max(0, Math.min(1, newVol));
    setVolumeState(clamped);
    if (!isMuted && masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setTargetAtTime(
        clamped,
        audioCtxRef.current.currentTime,
        0.05
      );
    }
  }, [isMuted]);

  // Switch City Environment & Adjust Soundscape Tone
  const changeCity = useCallback((city: CityEnvironment) => {
    setCurrentCity(city);
    if (!audioCtxRef.current || !cityFilterRef.current) return;
    const ctx = audioCtxRef.current;
    if (city === 'lagos') {
      // Warm, bustling coastal frequency profile
      cityFilterRef.current.frequency.setTargetAtTime(
        isInsideOffice ? 750 : 5000,
        ctx.currentTime,
        0.5
      );
    } else {
      // Tempered, cool urban wash frequency profile
      cityFilterRef.current.frequency.setTargetAtTime(
        isInsideOffice ? 550 : 3800,
        ctx.currentTime,
        0.5
      );
    }
  }, [isInsideOffice]);

  // Update Interior/Exterior Muffle
  const setOfficeInterior = useCallback((inside: boolean) => {
    setIsInsideOffice(inside);
    if (!audioCtxRef.current || !cityFilterRef.current || !officeGainRef.current) return;
    const ctx = audioCtxRef.current;

    cityFilterRef.current.frequency.setTargetAtTime(
      inside ? 650 : (currentCity === 'lagos' ? 5000 : 3800),
      ctx.currentTime,
      0.3
    );

    officeGainRef.current.gain.setTargetAtTime(
      inside ? 0.35 : 0.05,
      ctx.currentTime,
      0.3
    );
  }, [currentCity]);

  // Subtle procedural distance horns / sirens at randomized restrained intervals
  useEffect(() => {
    if (isMuted || !audioCtxRef.current) return;

    intervalRef.current = setInterval(() => {
      if (isMuted || !audioCtxRef.current || !cityFilterRef.current) return;
      const ctx = audioCtxRef.current;
      if (Math.random() > 0.4) return;

      try {
        const hornOsc = ctx.createOscillator();
        const hornGain = ctx.createGain();
        hornOsc.type = 'triangle';

        if (currentCity === 'lagos') {
          // Characteristic gentle distant dual-tone transit horn
          hornOsc.frequency.setValueAtTime(420, ctx.currentTime);
          hornOsc.frequency.setValueAtTime(460, ctx.currentTime + 0.12);
        } else {
          // Distant London vehicle chime
          hornOsc.frequency.setValueAtTime(380, ctx.currentTime);
        }

        const maxGain = isInsideOffice ? 0.015 : 0.04;
        hornGain.gain.setValueAtTime(0, ctx.currentTime);
        hornGain.gain.linearRampToValueAtTime(maxGain, ctx.currentTime + 0.05);
        hornGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);

        hornOsc.connect(hornGain);
        hornGain.connect(cityFilterRef.current);
        hornOsc.start(ctx.currentTime);
        hornOsc.stop(ctx.currentTime + 0.3);
      } catch (e) {
        // Safe fail
      }
    }, currentCity === 'lagos' ? 9000 : 16000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isMuted, currentCity, isInsideOffice]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (noiseSourceRef.current) {
        try {
          noiseSourceRef.current.stop();
        } catch (_) {}
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // UI Sound Effects
  const playSfx = useCallback((type: 'click' | 'confirm' | 'workstation' | 'day_advance') => {
    if (isMuted || !audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const t = ctx.currentTime;
      if (type === 'click') {
        osc.frequency.setValueAtTime(600, t);
        gain.gain.setValueAtTime(0.04, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
        osc.start(t);
        osc.stop(t + 0.06);
      } else if (type === 'confirm' || type === 'workstation') {
        osc.frequency.setValueAtTime(520, t);
        osc.frequency.exponentialRampToValueAtTime(880, t + 0.12);
        gain.gain.setValueAtTime(0.06, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
        osc.start(t);
        osc.stop(t + 0.14);
      } else if (type === 'day_advance') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(280, t);
        osc.frequency.exponentialRampToValueAtTime(740, t + 0.25);
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.start(t);
        osc.stop(t + 0.35);
      }
    } catch (_) {}
  }, [isMuted]);

  return {
    isMuted,
    volume,
    currentCity,
    isInsideOffice,
    audioUnlocked,
    toggleMute,
    setVolume,
    changeCity,
    setOfficeInterior,
    unlockAudio,
    playSfx
  };
}
