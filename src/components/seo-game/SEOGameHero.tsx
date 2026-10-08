import React, { useState } from 'react';
import { 
  ArrowRight, 
  Gamepad2, 
  CheckCircle2, 
  Sparkles, 
  Trophy, 
  Cpu, 
  Layers, 
  Building2, 
  Globe, 
  Zap, 
  ShieldCheck 
} from 'lucide-react';
import { GameDistrictVisual } from './GameDistrictVisual';
import { SERPSimulation } from './SERPSimulation';

interface SEOGameHeroProps {
  onStartPlayingClick: () => void;
  onSignInClick: () => void;
  isLoggedIn: boolean;
}

export function SEOGameHero({
  onStartPlayingClick,
  onSignInClick,
  isLoggedIn
}: SEOGameHeroProps) {
  const [heroViewMode, setHeroViewMode] = useState<'district' | 'serp'>('district');

  return (
    <section id="hero" className="relative w-full pt-8 sm:pt-14 pb-16 lg:pb-24 overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-[#18B892]/12 via-cyan-500/10 to-transparent rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-12 left-10 w-96 h-96 bg-[#18B892]/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT COLUMN: Main Value Prop & Headline */}
          <div className="lg:col-span-5 text-left space-y-6">
            
            {/* Badge: THE SEO STRATEGY GAME */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-[#18B892]/40 text-[#18B892] text-xs font-mono font-bold tracking-wider shadow-lg shadow-[#18B892]/10">
              <span className="w-2 h-2 rounded-full bg-[#18B892] animate-pulse" />
              <span>THE SEO STRATEGY GAME</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.08]">
              Learn SEO <br className="hidden sm:inline" />
              Playing <br />
              <span className="text-[#18B892] drop-shadow-[0_0_24px_rgba(24,184,146,0.35)]">
                THE SEO GAME
              </span>
            </h1>

            {/* Supporting Copy */}
            <div className="space-y-3 text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              <p>
                Build a real business. Create pages. Target keywords. Beat competitors. Survive algorithm updates.
              </p>
              <p className="font-semibold text-slate-200">
                Learn SEO by actually doing it — not just watching it.
              </p>
            </div>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <button
                onClick={onStartPlayingClick}
                className="group relative inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-[#18B892] hover:bg-[#15a381] text-slate-950 font-black text-sm sm:text-base tracking-wide shadow-xl shadow-[#18B892]/25 hover:shadow-[#18B892]/45 transition-all duration-200 cursor-pointer active:scale-95"
              >
                <span>🎮 Start Playing Now</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              {!isLoggedIn && (
                <button
                  onClick={onSignInClick}
                  className="inline-flex items-center justify-center px-6 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-500 text-slate-200 font-bold text-sm tracking-wide transition-all cursor-pointer"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Three Compact Game-Style Proof Indicators */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800/80">
              
              {/* Stat 1 */}
              <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 text-left">
                <div className="font-display font-black text-lg sm:text-2xl text-[#18B892] tracking-tight">
                  100+
                </div>
                <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider font-mono">
                  Realistic Missions
                </div>
              </div>

              {/* Stat 2 */}
              <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 text-left">
                <div className="font-display font-black text-lg sm:text-2xl text-cyan-400 tracking-tight">
                  Hands-on
                </div>
                <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider font-mono">
                  SEO Skills
                </div>
              </div>

              {/* Stat 3 */}
              <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 text-left">
                <div className="font-display font-black text-lg sm:text-2xl text-amber-400 tracking-tight">
                  Track
                </div>
                <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider font-mono">
                  Progress & Rewards
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT COLUMN: Realistic Interactive Game Preview */}
          <div className="lg:col-span-7">
            
            {/* View Switcher: Business District Campus vs Live SERP Simulation */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setHeroViewMode('district')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    heroViewMode === 'district'
                      ? 'bg-[#18B892] text-slate-950 font-bold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Business District HQ</span>
                </button>

                <button
                  onClick={() => setHeroViewMode('serp')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    heroViewMode === 'serp'
                      ? 'bg-[#18B892] text-slate-950 font-bold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Live SERP Battle (#3 ↑)</span>
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-slate-400">
                <span className="w-2 h-2 rounded-full bg-[#18B892] animate-ping" />
                <span>Engine Active</span>
              </div>
            </div>

            {/* Interactive Game Window */}
            {heroViewMode === 'district' ? (
              <GameDistrictVisual />
            ) : (
              <SERPSimulation />
            )}

            <div className="mt-2.5 text-center sm:text-right">
              <span className="text-[11px] font-mono text-slate-500">
                Interactive preview · Click buildings or simulate ranking actions
              </span>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}
