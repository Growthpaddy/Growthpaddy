import React from 'react';

const FEATURE_ITEMS = [
  'KEYWORDS',
  'CONTENT',
  'TECHNICAL SEO',
  'AUTHORITY',
  'SERP',
  'AI SEARCH'
];

export function FeatureStrip() {
  return (
    <section className="relative py-8 border-y border-slate-800/80 bg-[#070D18]/70 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {FEATURE_ITEMS.map((item, idx) => (
            <div
              key={item}
              className="group relative flex items-center justify-center p-3 sm:p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-[#18B892]/40 transition-all duration-200"
            >
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#18B892] group-hover:scale-125 transition-transform" />
                <span className="font-mono text-xs sm:text-sm font-black tracking-widest text-slate-200 group-hover:text-white uppercase">
                  {item}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
