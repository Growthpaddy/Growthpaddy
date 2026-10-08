import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { GameDistrictVisual } from './GameDistrictVisual';
import { SERPSimulation } from './SERPSimulation';

interface SEOGameHeroProps {
  onStartPlayingClick: () => void;
  onSignInClick: () => void;
  isLoggedIn: boolean;
  playSfx?: (type: 'click' | 'success' | 'toggle' | 'upgrade') => void;
  triggerAudioUnlock?: () => void;
}

export function SEOGameHero({
  onStartPlayingClick,
  onSignInClick,
  isLoggedIn,
  playSfx,
  triggerAudioUnlock
}: SEOGameHeroProps) {
  const [heroViewMode, setHeroViewMode] = useState<'district' | 'serp'>('district');

  const handleModeSwitch = (mode: 'district' | 'serp') => {
    if (playSfx) playSfx('toggle');
    if (triggerAudioUnlock) triggerAudioUnlock();
    setHeroViewMode(mode);
  };

  return (
    <section id="hero" className="relative w-full pt-6 sm:pt-10 pb-12 sm:pb-16 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-[#18B892]/12 via-cyan-500/10 to-transparent rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        
        {/* HERO TITLE & CTAS */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl text-white tracking-tight leading-[1.05] uppercase">
            LEARN SEO. PLAY THE GAME.
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 font-medium tracking-wide">
            Build a business. Make decisions. Rank pages. Beat competitors.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <button
              onClick={onStartPlayingClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl sm:rounded-2xl bg-[#18B892] hover:bg-[#15a381] text-slate-950 font-black text-base tracking-wide shadow-xl shadow-[#18B892]/25 hover:shadow-[#18B892]/45 transition-all duration-200 cursor-pointer active:scale-95"
            >
              <span>🎮 START PLAYING</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            {!isLoggedIn && (
              <button
                onClick={onSignInClick}
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl sm:rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-200 font-bold text-base tracking-wide transition-all cursor-pointer"
              >
                SIGN IN
              </button>
            )}
          </div>
        </div>

        {/* DOMINANT GAME WORLD: Realistic Business Environment */}
        <div className="w-full">
          {/* View Switcher Controls */}
          <div className="flex items-center justify-between mb-3 px-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#18B892] animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-wider text-slate-300 uppercase">
                {heroViewMode === 'district' ? 'CENTRAL HQ & DISTRICT SIMULATOR' : 'LIVE SERP RANKINGS ENGINE'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-mono">
              <button
                onClick={() => handleModeSwitch('district')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  heroViewMode === 'district'
                    ? 'bg-[#18B892]/20 text-[#18B892] border border-[#18B892]/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Business District
              </button>
              <button
                onClick={() => handleModeSwitch('serp')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  heroViewMode === 'serp'
                    ? 'bg-[#18B892]/20 text-[#18B892] border border-[#18B892]/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                SERP Simulator
              </button>
            </div>
          </div>

          {/* Interactive World View */}
          {heroViewMode === 'district' ? (
            <GameDistrictVisual playSfx={playSfx} />
          ) : (
            <SERPSimulation playSfx={playSfx} />
          )}
        </div>

      </div>
    </section>
  );
}
