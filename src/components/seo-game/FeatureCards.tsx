import React from 'react';
import { Hammer, Swords, Sparkles, Briefcase, ArrowUpRight } from 'lucide-react';

const FEATURES = [
  {
    id: 'build',
    title: 'BUILD & OPTIMIZE',
    tagline: 'Technical & Content Architecture',
    copy: 'Create pages, optimize content and fix technical SEO problems in a simulated production environment.',
    icon: Hammer,
    accent: '#18B892',
    accentClass: 'text-[#18B892] group-hover:text-[#38ef7d]',
    borderClass: 'group-hover:border-[#18B892]/50'
  },
  {
    id: 'compete',
    title: 'COMPETE IN SERPs',
    tagline: 'Realistic Algorithm Battles',
    copy: 'Go head-to-head with realistic competitors and fight for search rankings across fluctuating SERP positions.',
    icon: Swords,
    accent: '#06B6D4',
    accentClass: 'text-cyan-400 group-hover:text-cyan-300',
    borderClass: 'group-hover:border-cyan-500/50'
  },
  {
    id: 'ai-search',
    title: 'MASTER AI SEARCH',
    tagline: 'Generative Engine Optimization',
    copy: 'Learn how websites become discoverable and cited across AI search, ChatGPT answers, and Google AI Overviews.',
    icon: Sparkles,
    accent: '#8B5CF6',
    accentClass: 'text-purple-400 group-hover:text-purple-300',
    borderClass: 'group-hover:border-purple-500/50'
  },
  {
    id: 'skills',
    title: 'REAL-WORLD SEO SKILLS',
    tagline: 'Client & Enterprise Application',
    copy: 'Develop practical SEO skills that can be directly applied to actual businesses, ecommerce brands, and client projects.',
    icon: Briefcase,
    accent: '#F59E0B',
    accentClass: 'text-amber-400 group-hover:text-amber-300',
    borderClass: 'group-hover:border-amber-500/50'
  }
];

export function FeatureCards() {
  return (
    <section id="features" className="py-14 sm:py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-[#18B892]">
            <span>CORE GAMEPLAY PILLARS</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-white tracking-tight">
            How The Strategy Game Works
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Every mechanic mirrors real search engine behavior, allowing you to master cause and effect without risking live client penalties.
          </p>
        </div>

        {/* 4 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {FEATURES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`group relative p-6 rounded-2xl sm:rounded-3xl bg-[#090F1E]/80 border border-slate-800/90 ${item.borderClass} transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/60 flex flex-col justify-between text-left backdrop-blur-sm`}
              >
                <div>
                  {/* Icon & Mini Pill */}
                  <div className="flex items-center justify-between mb-5">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ 
                        backgroundColor: `${item.accent}14`, 
                        border: `1px solid ${item.accent}33` 
                      }}
                    >
                      <Icon className="w-6 h-6" style={{ color: item.accent }} />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition-colors" />
                  </div>

                  {/* Title & Tagline */}
                  <div className="space-y-1 mb-3">
                    <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-slate-400 block">
                      {item.tagline}
                    </span>
                    <h3 className="font-display font-black text-lg text-white tracking-wide group-hover:text-white">
                      {item.title}
                    </h3>
                  </div>

                  {/* Copy */}
                  <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed">
                    {item.copy}
                  </p>
                </div>

                {/* Subtle bottom indicator */}
                <div className="pt-6 mt-6 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Interactive module</span>
                  <span className="text-[#18B892] opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore →
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
