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
      className="relative bg-[#05090F] text-white pt-10 pb-14 sm:pt-14 sm:pb-18 lg:pt-20 lg:pb-24 overflow-hidden border-b border-slate-900 min-h-[540px] sm:min-h-[580px] lg:min-h-[640px] flex items-center"
      style={{
        backgroundImage: `url("${heroBackgroundImg}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center right',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Desktop/Tablet gradient overlay: dark left to transparent right */}
      <div 
        className="hidden md:block absolute inset-0 bg-gradient-to-r from-[#05090F] via-[#05090F]/90 to-transparent lg:w-[68%] pointer-events-none z-0" 
      />

      {/* Mobile atmospheric gradient overlay: ensures crisp text readability on small screens */}
      <div 
        className="md:hidden absolute inset-0 bg-gradient-to-b from-[#05090F]/95 via-[#05090F]/88 to-[#05090F]/95 pointer-events-none z-0" 
      />

      {/* Subtle ambient radial background glow */}
      <div className="absolute top-0 right-1/4 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-[#16834A]/10 rounded-full blur-3xl pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* HERO HEADLINE & COPY */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6 lg:space-y-8 text-left">
            
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-[#0E1622]/90 border border-[#16834A]/50 text-[#18B892] text-[10px] sm:text-xs font-bold tracking-wider uppercase shadow-xs">
              <span>THE DIGITAL CAMPUX FOUNDER COMMUNITY</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-sans font-black text-3xl sm:text-4xl md:text-5xl lg:text-[62px] leading-[1.12] sm:leading-[1.1] lg:leading-[1.08] tracking-tight text-white drop-shadow-sm">
              Real Founders.<br />
              Real Stories.<br />
              Greater <span className="text-[#18B892]">Opportunities.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed max-w-xl font-normal drop-shadow-xs">
              A platform for young and emerging founders in Nigeria to share their stories, gain visibility, connect with a supportive community and unlock real opportunities.
            </p>

            {/* Mobile Visual Banner Card: shows the featured founder and handwritten note on small screens where background crops */}
            <div className="lg:hidden my-3 relative rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950/70 max-w-md">
              <div className="relative aspect-[16/9] w-full overflow-hidden">
                <img 
                  src={heroBackgroundImg} 
                  alt="Founder Stories in Focus" 
                  className="w-full h-full object-cover object-right"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-2.5 left-3 text-[11px] font-semibold text-[#18B892] bg-slate-950/80 px-2.5 py-1 rounded-full border border-[#16834A]/30">
                  Featured: Nigerian Founder Stories
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-1">
              <button
                onClick={onJoinClick}
                className="bg-[#16834A] hover:bg-[#13723f] text-white font-bold text-sm sm:text-base px-6 sm:px-7 py-3.5 rounded-full shadow-lg shadow-[#16834A]/25 transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <span>Join the Community</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onWatchIntroClick}
                className="bg-[#111A24]/90 hover:bg-[#182433] border border-slate-700/80 text-slate-200 font-semibold text-sm sm:text-base px-5 sm:px-6 py-3.5 rounded-full transition flex items-center justify-center gap-2.5 cursor-pointer backdrop-blur-xs active:scale-[0.98]"
              >
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                  <Play className="w-3 h-3 text-white fill-white ml-0.5" />
                </div>
                <span>Watch Intro (1 min)</span>
              </button>
            </div>

            {/* TRUST & STATS ROW */}
            <div className="pt-6 sm:pt-8 border-t border-slate-800/80 grid grid-cols-3 gap-2 sm:gap-4 lg:gap-6">
              
              {/* Stat 1 */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#16834A]/20 border border-[#16834A]/30 flex items-center justify-center text-[#18B892] shrink-0">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-white text-sm sm:text-base lg:text-lg tracking-tight">500+</div>
                  <div className="text-[10px] sm:text-xs text-slate-400 font-medium leading-tight">Founders Joining</div>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#18B892]/20 border border-[#18B892]/30 flex items-center justify-center text-[#18B892] shrink-0">
                  <Video className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-white text-sm sm:text-base lg:text-lg tracking-tight">Stories</div>
                  <div className="text-[10px] sm:text-xs text-slate-400 font-medium leading-tight">On YouTube</div>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#16834A]/20 border border-[#16834A]/30 flex items-center justify-center text-[#18B892] shrink-0">
                  <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#18B892] animate-pulse" />
                </div>
                <div>
                  <div className="font-extrabold text-white text-sm sm:text-base lg:text-lg tracking-tight">A Growing</div>
                  <div className="text-[10px] sm:text-xs text-slate-400 font-medium leading-tight">Supportive Community</div>
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT COLUMN: Spacer to allow the founder portrait and handwritten art on the right to shine unobstructed on desktop */}
          <div className="hidden lg:block lg:col-span-5 pointer-events-none" />

        </div>
      </div>

    </section>
  );
};
