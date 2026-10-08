import React from 'react';
import { ArrowRight, Gamepad2 } from 'lucide-react';

interface FinalCTAProps {
  onStartPlayingClick: () => void;
}

export function FinalCTA({
  onStartPlayingClick
}: FinalCTAProps) {
  return (
    <section className="py-20 sm:py-28 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-[#18B892]/15 via-cyan-500/10 to-transparent rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
        <div className="p-10 sm:p-16 rounded-3xl sm:rounded-[36px] bg-gradient-to-b from-[#0B1424] via-[#080E1C] to-[#050912] border border-slate-800 hover:border-[#18B892]/40 transition-all duration-300 shadow-2xl space-y-6">
          <h2 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-none uppercase">
            READY TO RANK?
          </h2>

          <div className="pt-2 flex justify-center">
            <button
              onClick={onStartPlayingClick}
              className="inline-flex items-center justify-center gap-2.5 px-8 sm:px-10 py-4 sm:py-5 rounded-2xl bg-[#18B892] hover:bg-[#15a381] text-slate-950 font-black text-base sm:text-lg tracking-wide shadow-xl shadow-[#18B892]/25 hover:shadow-[#18B892]/40 transition-all duration-200 cursor-pointer active:scale-95"
            >
              <span>🎮 START PLAYING</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
