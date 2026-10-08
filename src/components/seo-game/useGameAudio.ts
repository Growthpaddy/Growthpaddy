import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Dedicated Procedural Ambient Game Audio Engine for /The-SEO-Game.
 * Uses Web Audio API to create a self-contained, zero-network-dependency,
 * high-fidelity "Strategic Technology / Corporate Mission" soundtrack:
 * 
 * - Deep, subtle atmospheric sub-bass drone (44Hz - 88Hz)
 * - Warm corporate synth chords / pads (slow harmonic evolution in F-minor / Ab-major)
 * - Delicate, polite rhythmic tech pulse (74 BPM subtle clock tick & digital scan)
 * - Soft filtered air/analog tape warmth
 * - UI feedback sound effects (tactical click, mission deployment, rank chime)
 * - Zero global leakage: automatically terminates AudioContext when unmounting.
 */

class StrategicAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  // Music nodes
  private isMusicRunning = false;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private padGain: GainNode | null = null;
  private pulseInterval: number | null = null;
  private chordInterval: number | null = null;
  private filterNode: BiquadFilterNode | null = null;

  private isMuted = false;
  private hasUnlocked = false;

  constructor() {
    // Lazy initialization on first user interaction
  }

  private initContext() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      // Master output
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0.0001 : 0.16, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Music bus
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      // SFX bus
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);
    } catch {
      // Gracefully handle environments without Web Audio support
    }
  }

  public unlockAndPlay(): boolean {
    this.initContext();
    if (!this.ctx) return false;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    this.hasUnlocked = true;
    if (!this.isMusicRunning && !this.isMuted) {
      this.startAmbientMusic();
    }
    return true;
  }

  private startAmbientMusic() {
    if (!this.ctx || this.isMusicRunning) return;
    this.isMusicRunning = true;

    try {
      const now = this.ctx.currentTime;

      // 1. Warm Master Filter for corporate ambient depth
      const masterFilter = this.ctx.createBiquadFilter();
      masterFilter.type = 'lowpass';
      masterFilter.frequency.setValueAtTime(650, now);
      masterFilter.Q.setValueAtTime(1.2, now);
      this.filterNode = masterFilter;
      masterFilter.connect(this.musicGain!);

      // 2. Sub-bass Drone 1 (F1: 43.65 Hz)
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(43.65, now);

      const droneGain1 = this.ctx.createGain();
      droneGain1.gain.setValueAtTime(0.18, now);
      osc1.connect(droneGain1);
      droneGain1.connect(masterFilter);
      osc1.start(now);
      this.droneOsc1 = osc1;

      // 3. Sub-bass Drone 2 (C2: 65.41 Hz with subtle detune for corporate cinematic depth)
      const osc2 = this.ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(65.41, now);
      osc2.detune.setValueAtTime(4, now);

      const droneGain2 = this.ctx.createGain();
      droneGain2.gain.setValueAtTime(0.08, now);
      osc2.connect(droneGain2);
      droneGain2.connect(masterFilter);
      osc2.start(now);
      this.droneOsc2 = osc2;

      // 4. Harmonic Pad Bus
      const padGain = this.ctx.createGain();
      padGain.gain.setValueAtTime(0.12, now);
      padGain.connect(masterFilter);
      this.padGain = padGain;

      // Evolving Chord Progression (Fm9 -> DbMaj7 -> Bbm9 -> Eb7sus)
      // Professional corporate mission ambient frequencies (Hz)
      const chordProgressions = [
        [174.61, 220.00, 261.63, 311.13, 392.00], // F3, A3, C4, Eb4, G4 (Fm9)
        [138.59, 207.65, 261.63, 329.63, 415.30], // Db3, Ab3, C4, E4, Ab4 (DbMaj7)
        [116.54, 174.61, 233.08, 277.18, 349.23], // Bb2, F3, Bb3, Db4, F4 (Bbm7)
        [155.56, 233.08, 261.63, 349.23, 415.30], // Eb3, Bb3, C4, F4, Ab4 (Eb9sus)
      ];

      let chordIdx = 0;
      const playCurrentChord = () => {
        if (!this.ctx || !this.isMusicRunning || !this.padGain) return;
        const chord = chordProgressions[chordIdx % chordProgressions.length];
        chordIdx++;

        const chordNow = this.ctx.currentTime;
        chord.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();

          osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, chordNow);
          osc.detune.setValueAtTime((Math.random() - 0.5) * 8, chordNow);

          // Smooth gentle envelope: 4s fade-in, 6s sustain, 3s fade-out
          g.gain.setValueAtTime(0.0001, chordNow);
          g.gain.linearRampToValueAtTime(0.035, chordNow + 3.5);
          g.gain.setValueAtTime(0.035, chordNow + 8.0);
          g.gain.exponentialRampToValueAtTime(0.0001, chordNow + 12.0);

          osc.connect(g);
          g.connect(this.padGain);

          osc.start(chordNow);
          osc.stop(chordNow + 12.5);
        });
      };

      // Play initial chord and schedule recurring changes every 10 seconds
      playCurrentChord();
      this.chordInterval = window.setInterval(() => {
        playCurrentChord();
      }, 10000);

      // 5. Subtle Rhythmic Tech Pulse (polite 74 BPM corporate scan clock)
      const pulseBPM = 74;
      const pulseIntervalMs = (60 / pulseBPM) * 1000;
      let step = 0;

      this.pulseInterval = window.setInterval(() => {
        if (!this.ctx || !this.isMusicRunning || !this.musicGain || this.isMuted) return;
        const pulseTime = this.ctx.currentTime;
        step = (step + 1) % 8;

        // Subtle tech click on beats 1 and 5, ultra-soft pulse on off-beats
        const isAccent = step === 0 || step === 4;
        const osc = this.ctx.createOscillator();
        const pGain = this.ctx.createGain();
        const pFilter = this.ctx.createBiquadFilter();

        pFilter.type = 'bandpass';
        pFilter.frequency.setValueAtTime(isAccent ? 880 : 520, pulseTime);
        pFilter.Q.setValueAtTime(6, pulseTime);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(isAccent ? 180 : 130, pulseTime);
        osc.frequency.exponentialRampToValueAtTime(45, pulseTime + 0.08);

        const targetVol = isAccent ? 0.04 : 0.018;
        pGain.gain.setValueAtTime(0.0001, pulseTime);
        pGain.gain.linearRampToValueAtTime(targetVol, pulseTime + 0.01);
        pGain.gain.exponentialRampToValueAtTime(0.0001, pulseTime + 0.09);

        osc.connect(pFilter);
        pFilter.connect(pGain);
        pGain.connect(this.musicGain);

        osc.start(pulseTime);
        osc.stop(pulseTime + 0.1);
      }, pulseIntervalMs);

    } catch {
      // Safe fallback
    }
  }

  private stopAmbientMusic() {
    if (!this.isMusicRunning) return;
    this.isMusicRunning = false;

    if (this.pulseInterval !== null) {
      clearInterval(this.pulseInterval);
      this.pulseInterval = null;
    }
    if (this.chordInterval !== null) {
      clearInterval(this.chordInterval);
      this.chordInterval = null;
    }

    try {
      if (this.droneOsc1) {
        this.droneOsc1.stop();
        this.droneOsc1.disconnect();
        this.droneOsc1 = null;
      }
      if (this.droneOsc2) {
        this.droneOsc2.stop();
        this.droneOsc2.disconnect();
        this.droneOsc2 = null;
      }
      if (this.padGain) {
        this.padGain.disconnect();
        this.padGain = null;
      }
    } catch {
      // Ignored
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    if (muted) {
      // Smooth fade-out in 0.4s
      this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.4);
    } else {
      // Smooth fade-in to comfortable ambient level (0.16)
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      if (!this.isMusicRunning) {
        this.startAmbientMusic();
      }
      this.masterGain.gain.linearRampToValueAtTime(0.16, now + 0.6);
    }
  }

  public playSoundEffect(type: 'click' | 'success' | 'toggle' | 'upgrade') {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    try {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      const now = this.ctx.currentTime;

      if (type === 'click') {
        // High-tech tactile click
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

        g.gain.setValueAtTime(0.08, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

        osc.connect(g);
        g.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'toggle') {
        // Futuristic mode switch
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(580, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.06);

        g.gain.setValueAtTime(0.07, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

        osc.connect(g);
        g.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'success' || type === 'upgrade') {
        // Corporate victory chime (two ascending pure fifths)
        [587.33, 880.00, 1174.66].forEach((freq, i) => {
          if (!this.ctx || !this.sfxGain) return;
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          const noteTime = now + (i * 0.07);

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, noteTime);

          g.gain.setValueAtTime(0.09, noteTime);
          g.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.35);

          osc.connect(g);
          g.connect(this.sfxGain);
          osc.start(noteTime);
          osc.stop(noteTime + 0.4);
        });
      }
    } catch {
      // Ignored
    }
  }

  public destroy() {
    this.stopAmbientMusic();
    if (this.ctx) {
      try {
        this.ctx.close().catch(() => {});
      } catch {
        // Ignored
      }
      this.ctx = null;
    }
  }
}

// Singleton reference for /The-SEO-Game lifecycle
let audioEngineInstance: StrategicAudioEngine | null = null;

export function useGameAudio() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const engineRef = useRef<StrategicAudioEngine | null>(null);

  useEffect(() => {
    // Instantiate audio engine solely for this page
    if (!audioEngineInstance) {
      audioEngineInstance = new StrategicAudioEngine();
    }
    engineRef.current = audioEngineInstance;

    // Check session preference if user previously toggled mute
    const savedMute = sessionStorage.getItem('seo_game_sound_muted');
    const initialMuted = savedMute === 'true';
    setIsMuted(initialMuted);
    engineRef.current.setMuted(initialMuted);

    // Auto-unlock listener for first user interaction
    const unlockAudio = () => {
      if (engineRef.current) {
        const unlocked = engineRef.current.unlockAndPlay();
        if (unlocked) {
          setIsPlaying(true);
        }
      }
    };

    // Attempt subtle immediate start if permitted by browser
    try {
      const unlocked = engineRef.current.unlockAndPlay();
      if (unlocked) {
        setIsPlaying(true);
      }
    } catch {
      // Expected if browser blocks unprompted autoplay
    }

    // Attach listeners for first interaction
    window.addEventListener('click', unlockAudio, { once: true, passive: true });
    window.addEventListener('keydown', unlockAudio, { once: true, passive: true });
    window.addEventListener('touchstart', unlockAudio, { once: true, passive: true });

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);

      // Clean up audio completely when navigating away from /The-SEO-Game
      if (audioEngineInstance) {
        audioEngineInstance.destroy();
        audioEngineInstance = null;
      }
    };
  }, []);

  const toggleSound = useCallback(() => {
    if (!engineRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    engineRef.current.setMuted(nextMuted);
    sessionStorage.setItem('seo_game_sound_muted', String(nextMuted));

    if (!nextMuted) {
      engineRef.current.unlockAndPlay();
      setIsPlaying(true);
      engineRef.current.playSoundEffect('toggle');
    } else {
      engineRef.current.playSoundEffect('toggle');
    }
  }, [isMuted]);

  const playSfx = useCallback((type: 'click' | 'success' | 'toggle' | 'upgrade') => {
    if (engineRef.current) {
      engineRef.current.playSoundEffect(type);
    }
  }, []);

  const triggerAudioUnlock = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.unlockAndPlay();
      setIsPlaying(true);
    }
  }, []);

  return {
    isPlaying,
    isMuted,
    toggleSound,
    playSfx,
    triggerAudioUnlock
  };
}
