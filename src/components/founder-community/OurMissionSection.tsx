import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, X } from 'lucide-react';
import femaleFounderImg from '../../assets/images/nigerian_woman_founder_1792406323111.jpg';

export const OurMissionSection: React.FC = () => {
  const [isMissionModalOpen, setIsMissionModalOpen] = useState(false);

  return (
    <section id="our-mission" className="bg-white py-16 sm:py-20 lg:py-28 border-b border-slate-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* LEFT COLUMN: PHOTOGRAPH WITH GREEN DECORATIVE DOODLE */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-[420px]">
              
              {/* Decorative hand-drawn green glowing arc doodle behind image */}
              <svg 
                className="absolute -top-6 -left-6 w-32 h-32 text-[#18B892] z-0 pointer-events-none opacity-80" 
                viewBox="0 0 100 100" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round"
              >
                <path d="M 20 80 Q 10 20 70 15 Q 90 20 85 45" />
              </svg>

              {/* Founder Image Container */}
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 bg-slate-100 group">
                <img
                  src={femaleFounderImg}
                  alt="Young Nigerian Female Founder wearing Build Create Grow t-shirt"
                  className="w-full h-auto object-cover object-center max-h-[460px] transition duration-500 group-hover:scale-[1.02]"
                  loading="lazy"
                />
              </div>

            </div>
          </div>

          {/* RIGHT COLUMN: MISSION CONTENT & HANDWRITTEN ACCENT */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              
              <div className="space-y-5 max-w-xl">
                {/* Tag pill */}
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#F3F5F3] border border-[#16834A]/40 text-[#16834A] text-xs font-bold tracking-wider uppercase">
                  <span>OUR MISSION</span>
                </div>

                {/* Headline */}
                <h2 className="font-sans font-black text-3xl sm:text-4xl lg:text-[44px] leading-[1.15] tracking-tight text-neutral-900">
                  A platform for every Nigerian founder with a story.
                </h2>

                {/* Body paragraph */}
                <p className="text-neutral-600 text-base sm:text-lg leading-relaxed font-normal">
                  We are building a community where young and emerging founders can freely share their journeys — the wins, the struggles and everything in between. Through storytelling, conversations and real connections, we aim to create visibility, enable learning and open doors to opportunities.
                </p>

                {/* CTA Button */}
                <div className="pt-2">
                  <button
                    onClick={() => setIsMissionModalOpen(true)}
                    className="bg-[#16834A] hover:bg-[#13723f] text-white font-bold text-sm sm:text-base px-6 sm:px-7 py-3 sm:py-3.5 rounded-full shadow-md shadow-[#16834A]/20 transition flex items-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    <span>Learn More About Our Mission</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* RIGHT HANDWRITTEN ACCENT */}
              <div className="shrink-0 text-right sm:text-left pt-2 select-none pointer-events-none">
                <div 
                  className="text-[#16834A] font-bold text-2xl sm:text-3xl leading-snug drop-shadow-xs"
                  style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
                >
                  <p>Different</p>
                  <p>Founders.</p>
                  <p className="text-neutral-800">Same Dream.</p>
                  <p className="text-[#18B892]">A Greater</p>
                  <p className="text-[#18B892]">Nigeria.</p>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* MISSION MODAL FOR "LEARN MORE ABOUT OUR MISSION" */}
      {isMissionModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsMissionModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 relative space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#16834A]/10 text-[#16834A] flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-xl text-neutral-900">
                  Our Mission & Vision
                </h3>
              </div>
              <button
                onClick={() => setIsMissionModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm text-neutral-600 leading-relaxed">
              <p>
                Across Nigeria's 36 states, brilliant individuals are turning constraints into creativity — founding tech startups, building digital services, creating employment, and solving everyday societal problems.
              </p>
              <p>
                Yet traditional media channels often focus exclusively on founders who have already raised millions in venture capital. Digital Campux exists to spotlight the early-stage, bootstrapped, and emerging builders when visibility matters most.
              </p>
              <div className="p-4 rounded-2xl bg-[#F3F5F3] border border-slate-200 text-xs text-neutral-800 space-y-2">
                <div className="font-bold text-neutral-900 uppercase tracking-wider text-[11px] text-[#16834A]">
                  Core Principles
                </div>
                <ul className="space-y-1.5 list-disc list-inside">
                  <li><strong>Authentic Storytelling:</strong> Raw conversations, real challenges, unfiltered lessons.</li>
                  <li><strong>Equal Access:</strong> No paywalls or PR agency fees to be heard.</li>
                  <li><strong>Collaborative Community:</strong> Founders helping founders build sustainable enterprises.</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setIsMissionModalOpen(false)}
              className="w-full bg-[#16834A] hover:bg-[#13723f] text-white py-3 rounded-xl font-bold text-sm transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
