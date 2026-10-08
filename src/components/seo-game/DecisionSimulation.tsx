import React, { useState } from 'react';
import { 
  Check, 
  ArrowUp, 
  ArrowDown, 
  Search, 
  Zap, 
  Sparkles, 
  Layers, 
  TrendingUp, 
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

export function DecisionSimulation() {
  const [activeDecision, setActiveDecision] = useState<'default' | 'audit' | 'cluster' | 'backlinks'>('default');

  // Dynamic ranking outcomes based on player's chosen strategic move
  const getDecisionState = () => {
    switch (activeDecision) {
      case 'audit':
        return {
          rank: '#2 ↑',
          score: 89,
          trafficChange: '+28% Organic Lift',
          message: 'Fixed 14 404s & Canonical Loops: Crawl budget redirected to target pillar pages.'
        };
      case 'cluster':
        return {
          rank: '#1 ↑',
          score: 96,
          trafficChange: '+64% Authority Surge',
          message: 'Topical Authority Cluster complete: Won Google Featured Snippet for main query.'
        };
      case 'backlinks':
        return {
          rank: '#2 ↑',
          score: 91,
          trafficChange: '+35% Referral Lift',
          message: 'Acquired 3 editorial real estate citations with relevant anchor distribution.'
        };
      default:
        return {
          rank: '#3 ↑',
          score: 76,
          trafficChange: '+14% Baseline Velocity',
          message: 'Baseline ranking after initial on-page keyword targeting & metadata configuration.'
        };
    }
  };

  const decisionData = getDecisionState();

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-[#06090F] via-[#091122] to-[#06090F] relative overflow-hidden">
      
      {/* Background radial glow */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#18B892]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* LEFT: Realistic Simulated Search Results Interface */}
          <div className="lg:col-span-7 text-left">
            
            <div className="bg-[#080E1C] border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
              
              {/* Top Query Bar */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#18B892]" />
                  <span>Interactive Cause & Effect Console</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  Target: best apartments in lagos
                </span>
              </div>

              {/* Simulated Search Box */}
              <div className="bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 text-xs text-slate-200">
                <Search className="w-4 h-4 text-[#18B892]" />
                <span className="font-semibold">best apartments in lagos</span>
                <span className="ml-auto text-[10px] font-mono text-slate-400">
                  48.2k vol/mo
                </span>
              </div>

              {/* Dynamic Rankings List */}
              <div className="space-y-2.5 pt-1">
                
                {/* Result 1 */}
                <div className={`p-3 rounded-xl border transition-all ${
                  activeDecision === 'cluster' 
                    ? 'bg-slate-900/50 border-slate-800' 
                    : 'bg-slate-900/50 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-0.5">
                    <span className="font-bold text-slate-300">
                      {activeDecision === 'cluster' ? '#2' : '#1'} · lagosprimerealty.ng
                    </span>
                    <span>Score: 92</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-blue-400 truncate">
                    Luxury Apartments in Lagos | Ikoyi & Victoria Island
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1">
                    Inspected serviced flats with uninterrupted power and security.
                  </p>
                </div>

                {/* Result 2 */}
                <div className={`p-3 rounded-xl border transition-all ${
                  activeDecision === 'audit' || activeDecision === 'backlinks'
                    ? 'bg-slate-900/50 border-slate-800' 
                    : 'bg-slate-900/50 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-0.5">
                    <span className="font-bold text-slate-300">
                      {activeDecision === 'cluster' ? '#3' : activeDecision === 'default' ? '#2' : '#3'} · urbannesthomes.com
                    </span>
                    <span>Score: 88</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-blue-400 truncate">
                    Modern Serviced Apartments for Rent in Lagos (2026 Guide)
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1">
                    Direct landlord verification with zero intermediary markups.
                  </p>
                </div>

                {/* HIGHLIGHTED: Your Business with green border */}
                <div className="p-4 rounded-xl bg-[#0D1C2E] border-2 border-[#18B892] shadow-xl shadow-[#18B892]/20 relative">
                  <div className="absolute top-2.5 right-3 flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-950 bg-[#18B892] px-2 py-0.5 rounded">
                      YOUR BUSINESS
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-slate-300 mb-1">
                    <span className="text-[#18B892] font-black text-sm flex items-center gap-1">
                      {decisionData.rank}
                    </span>
                    <span className="text-slate-400">· apexrealty.ng/best-apartments-lagos</span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-emerald-300">
                    Top 15 Best Apartments in Lagos: Inspected Rates & Amenities
                  </h4>

                  <p className="text-[11px] text-slate-300 mt-1">
                    Curated guide to prime residential apartments in Lagos with neighborhood safety audits and verified power uptime.
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-[#18B892]/20 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-[#18B892]">
                    <span>Score: {decisionData.score}/100</span>
                    <span>{decisionData.trafficChange}</span>
                  </div>
                </div>

                {/* Result 4 */}
                <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-[11px]">
                  <div className="flex items-center justify-between text-slate-400 font-mono mb-0.5">
                    <span>#4 · naijapropertyhub.com</span>
                    <span>Score: 72</span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-400 truncate">
                    Find Cheap & Luxury Apartments in Lagos State
                  </h4>
                </div>

                {/* Result 5 */}
                <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-[11px]">
                  <div className="flex items-center justify-between text-slate-400 font-mono mb-0.5">
                    <span>#5 · lekkiapartments.ng</span>
                    <span>Score: 69</span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-400 truncate">
                    Lekki Luxury Waterfront & Chevron Flats for Rent
                  </h4>
                </div>

              </div>

              {/* In-Game Decision Controls */}
              <div className="pt-3 border-t border-slate-800/80">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-2">
                  Test In-Game Strategic Moves:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => setActiveDecision('audit')}
                    className={`p-2 rounded-lg text-[11px] font-semibold text-left transition border cursor-pointer ${
                      activeDecision === 'audit'
                        ? 'bg-[#18B892] text-slate-950 border-[#18B892]'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    ⚡ Technical Audit & Speed
                  </button>

                  <button
                    onClick={() => setActiveDecision('cluster')}
                    className={`p-2 rounded-lg text-[11px] font-semibold text-left transition border cursor-pointer ${
                      activeDecision === 'cluster'
                        ? 'bg-[#18B892] text-slate-950 border-[#18B892]'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    📝 Launch Topical Cluster
                  </button>

                  <button
                    onClick={() => setActiveDecision('backlinks')}
                    className={`p-2 rounded-lg text-[11px] font-semibold text-left transition border cursor-pointer ${
                      activeDecision === 'backlinks'
                        ? 'bg-[#18B892] text-slate-950 border-[#18B892]'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    🔗 Digital PR Link Sprint
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT: High-Converting Explanation */}
          <div className="lg:col-span-5 text-left space-y-6">
            
            {/* Game Badge */}
            <div className="inline-flex flex-col p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-0.5 text-left font-mono font-black text-xs tracking-wider">
              <span className="text-[#18B892]">PLAY.</span>
              <span className="text-cyan-400">LEARN.</span>
              <span className="text-white">RANK.</span>
              <span className="text-amber-400">GROW.</span>
            </div>

            <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight leading-[1.1]">
              See the Results <br />
              of Your Decisions
            </h2>

            <div className="space-y-3 text-sm sm:text-base text-slate-300 leading-relaxed">
              <p>
                Every action you take in the game affects your rankings, traffic and growth.
              </p>
              <p className="text-slate-400">
                Experience SEO cause and effect in a realistic, risk-free environment where algorithm logic responds to your real strategic execution.
              </p>
            </div>

            {/* Checklist items */}
            <div className="space-y-3 text-sm text-slate-200">
              {[
                'Realistic SERP simulation',
                'Dynamic competitors',
                'Algorithm updates',
                'AI search visibility',
                'Live ranking movement'
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#18B892]/20 border border-[#18B892]/40 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-[#18B892]" />
                  </div>
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
