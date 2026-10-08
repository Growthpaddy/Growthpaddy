import React from 'react';
import { ArrowRight, Gamepad2, ShieldCheck, Sparkles } from 'lucide-react';

interface FinalCTAProps {
  onCreateAccountClick: () => void;
  onSignInClick: () => void;
  isLoggedIn: boolean;
  onStartPlayingClick: () => void;
}

export function FinalCTA({
  onCreateAccountClick,
  onSignInClick,
  isLoggedIn,
  onStartPlayingClick
}: FinalCTAProps) {
  return (
    <section className="py-20 sm:py-28 relative overflow-hidden">
      
      {/* Background radial dramatic glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-[#18B892]/15 via-cyan-500/10 to-transparent rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        
        <div className="p-8 sm:p-14 rounded-3xl sm:rounded-[36px] bg-gradient-to-b from-[#0B1424] via-[#080E1C] to-[#050912] border-2 border-slate-800/90 hover:border-[#18B892]/50 transition-all duration-300 shadow-2xl text-center space-y-6 relative overflow-hidden">
          
          {/* Subtle top indicator */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-[#18B892]/40 text-[#18B892] text-xs font-mono font-bold tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#18B892] animate-pulse" />
            <span>START FREE · PLAY IN BROWSER</span>
          </div>

          {/* Heading */}
          <h2 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.1]">
            Ready to Build, Rank & Grow?
          </h2>

          {/* Supporting Copy */}
          <div className="max-w-xl mx-auto space-y-2 text-slate-300 text-sm sm:text-base leading-relaxed">
            <p>
              Stop learning SEO only by watching videos.
            </p>
            <p className="font-semibold text-slate-200">
              Build a business. Make decisions. See what happens. Learn from the results.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            {isLoggedIn ? (
              <button
                onClick={onStartPlayingClick}
                className="w-full sm:w-auto px-8 py-4 rounded-xl sm:rounded-2xl bg-[#18B892] hover:bg-[#15a381] text-slate-950 font-black text-sm sm:text-base tracking-wide shadow-xl shadow-[#18B892]/30 flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
              >
                <span>🎮 Launch Your Game Session</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={onCreateAccountClick}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl sm:rounded-2xl bg-[#18B892] hover:bg-[#15a381] text-slate-950 font-black text-sm sm:text-base tracking-wide shadow-xl shadow-[#18B892]/30 flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
                >
                  <span>🎮 Create Your Free Account</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={onSignInClick}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl sm:rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-200 font-bold text-sm tracking-wide transition cursor-pointer"
                >
                  Sign In
                </button>
              </>
            )}
          </div>

          {/* Subtext info */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#18B892]" />
              No credit card required
            </span>
            <span className="text-slate-600">·</span>
            <span>Instant web simulator access</span>
            <span className="text-slate-600">·</span>
            <span>Zero client risk</span>
          </div>

        </div>

      </div>
    </section>
  );
}
