import React from 'react';
import { Gamepad2 } from 'lucide-react';

interface SEOGameHeaderProps {
  isLoggedIn: boolean;
  userName?: string;
  onSignInClick: () => void;
  onStartPlayingClick: () => void;
  isSoundMuted?: boolean;
  onToggleSound?: () => void;
  volume?: number;
  onVolumeChange?: (vol: number) => void;
}

export function SEOGameHeader({
  isLoggedIn,
  userName,
  onSignInClick,
  onStartPlayingClick,
  isSoundMuted = false,
  onToggleSound,
  volume = 0.2,
  onVolumeChange
}: SEOGameHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#070B14]/90 backdrop-blur-md border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
        
        {/* Brand / Title: DSP Academy + THE SEO GAME */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#18B892] via-[#0E7A60] to-[#0A4D3C] p-0.5 shadow-md shadow-[#18B892]/20">
              <div className="w-full h-full bg-[#080E1A] rounded-[10px] flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-[#18B892]" />
              </div>
            </div>
            
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase font-mono">
                DSP Academy
              </span>
              <span className="font-extrabold text-base sm:text-lg tracking-wider text-white flex items-center gap-1.5 leading-none">
                THE SEO GAME
                <span className="w-1.5 h-1.5 rounded-full bg-[#18B892] animate-pulse" />
              </span>
            </div>
          </div>
        </div>

        {/* Right Bar: Sound control + SIGN IN / START PLAYING */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          
          {/* Sound Control */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={onToggleSound}
              title={isSoundMuted ? "Game Sound: Off (Click to turn on)" : "Game Sound: On (Click to mute)"}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer select-none active:scale-95 ${
                isSoundMuted
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'bg-[#18B892]/20 text-[#18B892]'
              }`}
              aria-label={isSoundMuted ? "Turn game sound on" : "Turn game sound off"}
            >
              <span className="text-sm leading-none" role="img" aria-label={isSoundMuted ? "Muted" : "Active"}>
                {isSoundMuted ? '🔇' : '🔊'}
              </span>
              <span className={`text-[10px] uppercase ${isSoundMuted ? 'text-slate-400' : 'text-emerald-400'}`}>
                {isSoundMuted ? 'SOUND OFF' : 'GAME SOUND'}
              </span>
            </button>

            {/* Micro Volume Slider */}
            {onVolumeChange && !isSoundMuted && (
              <div className="hidden sm:flex items-center px-1.5" title={`Volume: ${Math.round(volume * 100)}%`}>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                  className="w-14 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#18B892]"
                  aria-label="Volume slider"
                />
              </div>
            )}
          </div>

          {/* User Status / Auth Button */}
          {isLoggedIn ? (
            <button
              onClick={onStartPlayingClick}
              className="px-4 py-2 rounded-xl bg-[#18B892] hover:bg-[#15a381] text-slate-950 font-black text-xs sm:text-sm tracking-wide transition shadow-md shadow-[#18B892]/20 cursor-pointer"
            >
              🎮 {userName ? userName.toUpperCase() : 'PLAY'}
            </button>
          ) : (
            <button
              onClick={onSignInClick}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-200 font-bold text-xs sm:text-sm tracking-wide transition cursor-pointer"
            >
              SIGN IN
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
