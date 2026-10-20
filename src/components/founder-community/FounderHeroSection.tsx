import React from 'react';
import { ArrowRight, Play, Users, Video } from 'lucide-react';
import heroFounderImg from '../../assets/images/nigerian_founder_hero_1792406308716.jpg';

interface FounderHeroSectionProps {
  onJoinClick: () => void;
  onWatchIntroClick: () => void;
}

export const FounderHeroSection: React.FC<FounderHeroSectionProps> = ({
  onJoinClick,
  onWatchIntroClick
}) => {
  return (
    <section id="hero" className="relative bg-[#080D14] text-white pt-12 pb-16 lg:pt-16 lg:pb-24 overflow-hidden border-b border-slate-900">
      
      {/* Subtle ambient radial background glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#16834A]/10 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-0 left-10 w-[400px] h-[400px] bg-[#18B892]/5 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT COLUMN: HERO HEADLINE & COPY */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111A24]/90 border border-[#16834A]/50 text-[#18B892] text-[11px] sm:text-xs font-bold tracking-wider uppercase">
              <span>THE DIGITAL CAMPUX FOUNDER COMMUNITY</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-sans font-black text-4xl sm:text-5xl lg:text-[62px] leading-[1.08] tracking-tight text-white">
              Real Founders.<br />
              Real Stories.<br />
              Greater <span className="text-[#18B892]">Opportunities.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl font-normal">
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
                className="bg-[#111A24] hover:bg-[#182433] border border-slate-700/80 text-slate-200 font-semibold text-sm sm:text-base px-6 py-3.5 rounded-full transition flex items-center gap-2.5 cursor-pointer"
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
                <div className="w-10 h-10 rounded-xl bg-[#16834A]/15 border border-[#16834A]/30 flex items-center justify-center text-[#18B892] shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-white text-base sm:text-lg tracking-tight">500+</div>
                  <div className="text-[11px] sm:text-xs text-slate-400 font-medium">Founders Joining</div>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#18B892]/15 border border-[#18B892]/30 flex items-center justify-center text-[#18B892] shrink-0">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-white text-base sm:text-lg tracking-tight">Stories</div>
                  <div className="text-[11px] sm:text-xs text-slate-400 font-medium">On YouTube</div>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#16834A]/15 border border-[#16834A]/30 flex items-center justify-center text-[#18B892] shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#18B892] animate-pulse" />
                </div>
                <div>
                  <div className="font-extrabold text-white text-base sm:text-lg tracking-tight">A Growing</div>
                  <div className="text-[11px] sm:text-xs text-slate-400 font-medium">Supportive Community</div>
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT COLUMN: HERO FOUNDER IMAGE & HANDWRITTEN ANNOTATIONS */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[420px]">
              
              {/* TOP RIGHT HANDWRITTEN LIST */}
              <div className="absolute -top-6 sm:-top-8 -right-2 sm:-right-4 z-20 text-right pointer-events-none select-none">
                <div 
                  className="text-slate-300 font-normal text-xl sm:text-2xl leading-tight opacity-90"
                  style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
                >
                  <p>Founders</p>
                  <p>Ideas</p>
                  <p>People</p>
                  <p>Opportunities</p>
                  <p className="text-[#18B892] font-semibold">Nigeria</p>
                </div>
              </div>

              {/* FOUNDER PHOTOGRAPH CONTAINER */}
              <div className="relative rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl bg-slate-900 group">
                <img
                  src={heroFounderImg}
                  alt="Young Nigerian Tech Founder with Laptop"
                  className="w-full h-auto object-cover object-center max-h-[520px] transition duration-500 group-hover:scale-[1.02]"
                  loading="eager"
                />
                
                {/* Subtle gradient vignette at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#080D14]/80 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* BOTTOM RIGHT HANDWRITTEN ARROW & NOTE */}
              <div className="absolute -bottom-6 -right-2 sm:-right-6 z-20 flex items-center gap-2 pointer-events-none select-none">
                {/* Hand-drawn SVG curving arrow */}
                <svg 
                  className="w-12 h-12 text-[#18B892] transform -rotate-12" 
                  viewBox="0 0 50 50" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M 10 38 Q 28 42 35 24 Q 40 12 25 15" />
                  <path d="M 22 10 L 25 15 L 20 20" />
                </svg>

                <span 
                  className="text-[#18B892] font-bold text-2xl sm:text-3xl leading-none drop-shadow-md whitespace-nowrap"
                  style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
                >
                  Your story<br />could be next.
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>

    </section>
  );
};
