import React from 'react';
import { Building2, Compass, TrendingUp, Trophy, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    title: 'CREATE YOUR BUSINESS',
    description: 'Choose an industry, define your goals and launch your website.',
    subtext: 'Pick from Real Estate, B2B SaaS, Health & Wellness, or E-commerce.',
    icon: Building2,
    badge: 'STAGE 1'
  },
  {
    step: '02',
    title: 'COMPLETE MISSIONS',
    description: 'Follow guided missions that teach practical SEO strategies.',
    subtext: 'Carry out keyword audits, content architecture, and technical sprint fixes.',
    icon: Compass,
    badge: 'STAGE 2'
  },
  {
    step: '03',
    title: 'SEE REAL RESULTS',
    description: 'Watch rankings, traffic, visibility and competitors change based on your decisions.',
    subtext: 'Experience live SERP movements and algorithm feedback loops in real time.',
    icon: TrendingUp,
    badge: 'STAGE 3'
  },
  {
    step: '04',
    title: 'LEVEL UP',
    description: 'Unlock new features, advanced challenges and deeper SEO skills.',
    subtext: 'Earn verified skill credentials, climb leaderboard tiers, and unlock GEO simulators.',
    icon: Trophy,
    badge: 'STAGE 4'
  }
];

export function HowItWorksTimeline({ onStartPlayingClick }: { onStartPlayingClick?: () => void }) {
  return (
    <section id="how-it-works" className="py-16 sm:py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-20 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-[#18B892]">
            <span>GAMEPLAY PROGRESSION TIMELINE</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-4xl lg:text-5xl text-white tracking-tight">
            Start Your SEO Journey in 4 Simple Steps
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            A clear progression tree that turns theoretical search engine principles into instinctive strategic reflexes.
          </p>
        </div>

        {/* 4 Connected Checkpoints */}
        <div className="relative">
          
          {/* Subtle glowing horizontal connector line (desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-[10%] right-[10%] -translate-y-8 h-0.5 bg-gradient-to-r from-slate-800 via-[#18B892]/60 to-slate-800 shadow-[0_0_12px_#18B892]" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {STEPS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div 
                  key={item.step}
                  className="bg-[#09101E]/90 border border-slate-800/90 hover:border-[#18B892]/40 rounded-2xl sm:rounded-3xl p-6 text-left transition-all duration-300 hover:-translate-y-1 group flex flex-col justify-between"
                >
                  <div>
                    {/* Numbered Circular Marker with Game Icon */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="relative flex items-center justify-center">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#18B892] to-cyan-700 p-0.5 shadow-lg shadow-[#18B892]/20 group-hover:shadow-[#18B892]/40 transition">
                          <div className="w-full h-full bg-[#080E1C] rounded-[14px] flex items-center justify-center font-black font-display text-white text-lg">
                            {item.step}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-[#18B892] bg-[#18B892]/10 px-2.5 py-1 rounded-md border border-[#18B892]/30">
                        {item.badge}
                      </span>
                    </div>

                    {/* Step Title */}
                    <h3 className="font-display font-black text-base sm:text-lg text-white mb-2 group-hover:text-white">
                      {item.title}
                    </h3>

                    {/* Explanation */}
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-3">
                      {item.description}
                    </p>

                    <p className="text-[11px] text-slate-500 font-mono">
                      {item.subtext}
                    </p>
                  </div>

                  {/* Bottom Checkpoint indicator */}
                  <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center gap-2 text-[10px] font-mono text-slate-400">
                    <Icon className="w-3.5 h-3.5 text-[#18B892]" />
                    <span>Progression unlocked</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
