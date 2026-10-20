import React from 'react';
import { ArrowRight, Play, Users, Video } from 'lucide-react';
import heroBackgroundImg from '../../assets/images/Founder Stories in Focus.png';

interface FounderHeroSectionProps {
  onJoinClick: () => void;
  onWatchIntroClick: () => void;
}

export const FounderHeroSection: React.FC<FounderHeroSectionProps> = ({
  onJoinClick,
  onWatchIntroClick
}) => {
  return (
    <section 
      id="hero" 
      className="relative bg-[#05090F] text-white pt-12 pb-16 lg:pt-16 lg:pb-24 overflow-hidden border-b border-slate-900 min-h-[580px] lg:min-h-[640px] flex items-center"
      style={{
        backgroundImage: `url("${heroBackgroundImg}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'right 20% center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Restrained dark gradient overlay to guarantee copy legibility while keeping the founder and handwritten artwork clearly visible */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-[#05090F] via-[#05090F]/90 to-transparent lg:w-[68%] pointer-events-none z-0" 
      />
      <div 
        className="absolute inset-0 bg-[#05090F]/30 lg:hidden pointer-events-none z-0" 
      />

      {/* Subtle ambient radial background glow */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#16834A]/10 rounded-full blur-3xl pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* HERO HEADLINE & COPY */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left">
            
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0E1622]/90 border border-[#16834A]/50 text-[#18B892] text-[11px] sm:text-xs font-bold tracking-wider uppercase shadow-xs">
              <span>THE DIGITAL CAMPUX FOUNDER COMMUNITY</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-sans font-black text-4xl sm:text-5xl lg:text-[62px] leading-[1.08] tracking-tight text-white drop-shadow-sm">
              Real Founders.<br />
              Real Stories.<br />
              Greater <span className="text-[#18B892]">Opportunities.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl font-normal drop-shadow-xs">
              A platform for young and emerging founders in Nigeria to share their stories, gain visibility, connect with a supportive community and unlock real opportunities.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                onClick={onJoinClick}
                className="bg-[#16834A] hover:bg-[#13723f] text-white font-bold text-sm sm:text-base px-7 py-3.5 rounded-full shadow-lg shadow-[#16834A]/25 transition flex items-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <span>Join the Community</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onWatchIntroClick}
                className="bg-[#111A24]/90 hover:bg-[#182433] border border-slate-700/80 text-slate-200 font-semibold text-sm sm:text-base px-6 py-3.5 rounded-full transition flex items-center gap-2.5 cursor-pointer backdrop-blur-xs"
              >
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                  <Play className="w-3 h-3 text-white fill-white ml-0.5" />
                </div>
                <span>Watch Intro (1 min)</span>
              </button>
            </div>

            {/* TRUST & STATS ROW */}
            <div className="pt-6 sm:pt-8 border-t border-slate-800/80 grid grid-cols-3 gap-3 sm:gap-6">
              
              {/* Stat 1 */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#16834A]/20 border border-[#16834A]/30 flex items-center justify-center text-[#18B892] shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-white text-base sm:text-lg tracking-tight">500+</div>
                  <div className="text-[11px] sm:text-xs text-slate-400 font-medium">Founders Joining</div>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#18B892]/20 border border-[#18B892]/30 flex items-center justify-center text-[#18B892] shrink-0">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-white text-base sm:text-lg tracking-tight">Stories</div>
                  <div className="text-[11px] sm:text-xs text-slate-400 font-medium">On YouTube</div>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#16834A]/20 border border-[#16834A]/30 flex items-center justify-center text-[#18B892] shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#18B892] animate-pulse" />
                </div>
                <div>
                  <div className="font-extrabold text-white text-base sm:text-lg tracking-tight">A Growing</div>
                  <div className="text-[11px] sm:text-xs text-slate-400 font-medium">Supportive Community</div>
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT COLUMN: Spacer to allow the founder portrait and handwritten art on the right to shine unobstructed */}
          <div className="hidden lg:block lg:col-span-5 pointer-events-none" />

        </div>
      </div>

    </section>
  );
};
