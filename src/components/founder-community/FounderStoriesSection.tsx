import React, { useState } from 'react';
import { Play, ArrowRight, X, ExternalLink } from 'lucide-react';
import podcastThumbnail from '../../assets/images/podcast_interview_thumbnail_1792406338723.jpg';

export const FounderStoriesSection: React.FC = () => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  return (
    <section id="founder-stories" className="bg-[#090E16] text-white py-16 sm:py-20 lg:py-28 border-b border-slate-900 relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#16834A]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* LEFT COLUMN: HEADLINE & COPY */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Tag pill */}
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#111A24] border border-[#16834A]/50 text-[#18B892] text-xs font-bold tracking-wider uppercase">
              <span>FOUNDER STORIES</span>
            </div>

            {/* Headline */}
            <h2 className="font-sans font-black text-3xl sm:text-4xl lg:text-[46px] leading-[1.12] tracking-tight text-white">
              Real Conversations.<br />
              Real Founders.
            </h2>

            {/* Paragraph */}
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-normal">
              We feature founders one-on-one on the Ezeji Patrick YouTube channel — honest conversations about their journeys, challenges, lessons and big dreams.
            </p>

            {/* Watch CTA Button */}
            <div className="pt-2">
              <a
                href="https://www.youtube.com/@EzejiPatrick"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 bg-[#16834A] hover:bg-[#13723f] text-white font-bold text-sm sm:text-base px-6 sm:px-7 py-3.5 rounded-full shadow-lg shadow-[#16834A]/25 transition cursor-pointer active:scale-[0.98]"
              >
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <Play className="w-2.5 h-2.5 text-white fill-white ml-0.5" />
                </div>
                <span>Watch Founder Stories on YouTube</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </a>
            </div>

          </div>

          {/* RIGHT COLUMN: VIDEO PREVIEW CARD */}
          <div className="lg:col-span-7">
            <div 
              onClick={() => setIsVideoModalOpen(true)}
              className="relative rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl bg-slate-900 group cursor-pointer"
            >
              {/* VIDEO THUMBNAIL */}
              <div className="aspect-video w-full relative overflow-hidden bg-slate-950">
                <img
                  src={podcastThumbnail}
                  alt="Founder interview podcast in studio with microphone"
                  className="w-full h-full object-cover object-center transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Ambient dark overlay */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/25 transition duration-300" />

                {/* CENTRAL PLAY BUTTON */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/90 group-hover:bg-white text-[#16834A] flex items-center justify-center shadow-2xl transition duration-300 transform group-hover:scale-110">
                    <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current ml-1" />
                  </div>
                </div>

                {/* LOWER RIGHT WATERMARK */}
                <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md border border-white/10 px-3.5 py-1.5 rounded-full text-[11px] font-semibold text-slate-200">
                  Ezeji Patrick Channel
                </div>

                {/* TOP RIGHT HANDWRITTEN ANNOTATION */}
                <div className="absolute top-4 right-6 pointer-events-none select-none text-right">
                  <div 
                    className="text-white/90 font-bold text-lg sm:text-xl leading-none drop-shadow-md"
                    style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
                  >
                    <p>Founders</p>
                    <p>Ideas</p>
                    <p>Growth</p>
                    <p className="text-[#18B892]">Nigeria</p>
                  </div>
                  {/* Small curved arrow */}
                  <svg 
                    className="w-6 h-6 text-[#18B892] inline-block -rotate-45 mt-1" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinecap="round"
                  >
                    <path d="M 5 19 Q 15 20 18 10" />
                    <path d="M 12 8 L 18 10 L 16 16" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* VIDEO PREVIEW MODAL */}
      {isVideoModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setIsVideoModalOpen(false)}
        >
          <div 
            className="bg-slate-900 rounded-3xl overflow-hidden max-w-3xl w-full border border-slate-800 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-slate-950 flex items-center justify-between border-b border-slate-800">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Play className="w-4 h-4 text-[#18B892] fill-[#18B892]" />
                <span>Founder Stories — Ezeji Patrick Channel</span>
              </span>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video w-full bg-black relative">
              <iframe
                className="w-full h-full"
                src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="Founder Interview Preview"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="p-4 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
              <span>Subscribe on YouTube for weekly episodes featuring Nigerian founders</span>
              <a
                href="https://www.youtube.com/@EzejiPatrick"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#18B892] hover:underline font-semibold flex items-center gap-1"
              >
                <span>Visit YouTube Channel</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
