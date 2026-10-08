import React, { useState } from 'react';
import { 
  Search, 
  ArrowUp, 
  ArrowDown, 
  Minus, 
  Sparkles, 
  Bot, 
  HelpCircle, 
  MapPin, 
  Video, 
  TrendingUp, 
  ExternalLink,
  ShieldAlert,
  Zap,
  Globe
} from 'lucide-react';

interface SERPItem {
  id: string;
  rank: number;
  prevRank: number;
  name: string;
  url: string;
  title: string;
  snippet: string;
  score: number;
  isPlayer: boolean;
  arrow: 'up' | 'down' | 'same';
  badges?: string[];
}

const INITIAL_RESULTS: SERPItem[] = [
  {
    id: 'lagos-prime',
    rank: 1,
    prevRank: 1,
    name: 'LagosPrime Realty',
    url: 'https://lagosprimerealty.ng/luxury-apartments',
    title: 'Luxury Apartments in Lagos | Ikoyi, Victoria Island & Lekki Phase 1',
    snippet: 'Browse verified listings of serviced 2 & 3 bedroom luxury apartments across Lagos with 24/7 security, power backup and swimming pools.',
    score: 92,
    isPlayer: false,
    arrow: 'same'
  },
  {
    id: 'urban-nest',
    rank: 2,
    prevRank: 2,
    name: 'UrbanNest Homes',
    url: 'https://urbannesthomes.com/apartments-lagos',
    title: 'Modern Serviced Apartments for Rent in Lagos (2026 Guide)',
    snippet: 'Verified flats and short let apartments in Ikeja GRA and Lekki. Direct owner bookings with zero agency markups.',
    score: 88,
    isPlayer: false,
    arrow: 'same'
  },
  {
    id: 'your-business',
    rank: 3,
    prevRank: 5,
    name: 'Your Business (Apex Realty)',
    url: 'https://apexrealty.ng/best-apartments-lagos',
    title: 'Top 15 Best Apartments in Lagos: Inspected Rates & Amenities',
    snippet: 'Curated guide to prime residential apartments in Lagos. Filter by neighborhood, rental yield, generator uptime, and neighborhood safety audits.',
    score: 76,
    isPlayer: true,
    arrow: 'up',
    badges: ['Target Pillar', 'Core Web Vitals 99', 'Schema: ApartmentComplex']
  },
  {
    id: 'naija-property',
    rank: 4,
    prevRank: 3,
    name: 'NaijaProperty Hub',
    url: 'https://naijapropertyhub.com/lagos-rentals',
    title: 'Find Cheap & Luxury Apartments in Lagos State',
    snippet: 'Explore over 3,400 properties across Lagos Mainland and Island. Compare rental prices and landlord reviews.',
    score: 72,
    isPlayer: false,
    arrow: 'down'
  },
  {
    id: 'lekki-apartments',
    rank: 5,
    prevRank: 4,
    name: 'Lekki Apartments',
    url: 'https://lekkiapartments.ng/rent',
    title: 'Lekki Luxury Waterfront & Chevron Flats for Rent',
    snippet: 'Furnished apartments and duplex flats in Lekki Phase 1, Osapa London and Ikate with waterfront views.',
    score: 69,
    isPlayer: false,
    arrow: 'down'
  }
];

export function SERPSimulation() {
  const [activeTab, setActiveTab] = useState<'organic' | 'ai' | 'paa' | 'local' | 'videos'>('organic');
  const [results, setResults] = useState<SERPItem[]>(INITIAL_RESULTS);
  const [isSimulatingBoost, setIsSimulatingBoost] = useState(false);
  const [hasBoosted, setHasBoosted] = useState(false);

  const simulateOptimizationAction = () => {
    setIsSimulatingBoost(true);
    setTimeout(() => {
      setResults(prev => {
        if (!hasBoosted) {
          // Boost player from #3 to #1!
          return [
            {
              id: 'your-business',
              rank: 1,
              prevRank: 3,
              name: 'Your Business (Apex Realty)',
              url: 'https://apexrealty.ng/best-apartments-lagos',
              title: 'Top 15 Best Apartments in Lagos: Inspected Rates & Amenities',
              snippet: 'Curated guide to prime residential apartments in Lagos. Filter by neighborhood, rental yield, generator uptime, and neighborhood safety audits.',
              score: 95,
              isPlayer: true,
              arrow: 'up',
              badges: ['Top 1 Authority', 'Featured Snippet Won', 'GEO Optimized']
            },
            {
              ...prev[0],
              rank: 2,
              arrow: 'down'
            },
            {
              ...prev[1],
              rank: 3,
              arrow: 'down'
            },
            prev[3],
            prev[4]
          ];
        } else {
          return INITIAL_RESULTS;
        }
      });
      setHasBoosted(!hasBoosted);
      setIsSimulatingBoost(false);
    }, 450);
  };

  return (
    <div className="w-full bg-[#080E1C] border border-slate-800/90 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-2xl relative text-left">
      
      {/* Top Simulation Badge & Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800 flex items-center gap-1.5">
            <Globe className="w-3 h-3 text-[#18B892]" />
            SERP Simulation Engine · Live Sandbox
          </span>
        </div>

        {/* Action Toggle to trigger cause & effect */}
        <button
          onClick={simulateOptimizationAction}
          disabled={isSimulatingBoost}
          className={`text-[11px] font-mono font-bold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
            hasBoosted
              ? 'bg-amber-950/40 border-amber-600/60 text-amber-300 hover:bg-amber-900/50'
              : 'bg-[#18B892]/15 border-[#18B892]/60 text-[#18B892] hover:bg-[#18B892]/25'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>{hasBoosted ? 'Reset SERP Simulation' : '⚡ Simulate On-Page Fix (+Score)'}</span>
        </button>
      </div>

      {/* Simulated Search Bar */}
      <div className="mt-3.5 bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 text-xs text-slate-200">
        <Search className="w-4 h-4 text-[#18B892] shrink-0" />
        <span className="font-medium tracking-wide">best apartments in lagos</span>
        <span className="ml-auto text-[10px] font-mono text-slate-500 hidden sm:inline">
          Approx. 48,200 monthly searches · KD 44
        </span>
      </div>

      {/* SERP Category Tabs */}
      <div className="flex items-center gap-1.5 sm:gap-2 mt-3 border-b border-slate-800/80 pb-2 text-[11px] font-semibold overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('organic')}
          className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'organic'
              ? 'bg-[#18B892] text-slate-950 font-bold shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <span>Organic</span>
          <span className="text-[9px] font-mono opacity-80">(5)</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'ai'
              ? 'bg-[#18B892] text-slate-950 font-bold shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Bot className="w-3 h-3 text-cyan-400" />
          <span>AI Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('paa')}
          className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'paa'
              ? 'bg-[#18B892] text-slate-950 font-bold shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <HelpCircle className="w-3 h-3" />
          <span>People Also Ask</span>
        </button>

        <button
          onClick={() => setActiveTab('local')}
          className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'local'
              ? 'bg-[#18B892] text-slate-950 font-bold shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <MapPin className="w-3 h-3" />
          <span>Local Pack</span>
        </button>

        <button
          onClick={() => setActiveTab('videos')}
          className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'videos'
              ? 'bg-[#18B892] text-slate-950 font-bold shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Video className="w-3 h-3" />
          <span>Videos</span>
        </button>
      </div>

      {/* Tab 1: ORGANIC SERP RANKINGS */}
      {activeTab === 'organic' && (
        <div className="mt-3.5 space-y-2.5">
          {results.map((item) => {
            const isPlayer = item.isPlayer;

            return (
              <div
                key={item.id}
                className={`p-3 rounded-xl transition-all duration-300 relative ${
                  isPlayer
                    ? 'bg-[#0E1B2C] border-2 border-[#18B892] shadow-lg shadow-[#18B892]/20'
                    : 'bg-slate-900/50 border border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Header line with Rank & URL */}
                <div className="flex items-center justify-between gap-2 text-[10px] font-mono mb-1">
                  <div className="flex items-center gap-2">
                    <span 
                      className={`font-black px-2 py-0.5 rounded text-xs flex items-center gap-1 ${
                        isPlayer
                          ? 'bg-[#18B892] text-slate-950'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      #{item.rank}
                      {item.arrow === 'up' && <ArrowUp className="w-3 h-3 text-emerald-950" />}
                      {item.arrow === 'down' && <ArrowDown className="w-3 h-3 text-rose-400" />}
                      {item.arrow === 'same' && <Minus className="w-3 h-3 text-slate-400" />}
                    </span>

                    <span className="text-slate-400 truncate max-w-[200px] sm:max-w-xs">
                      {item.url}
                    </span>
                  </div>

                  {/* SEO Score & Ranking Movement */}
                  <div className="flex items-center gap-2">
                    {isPlayer && (
                      <span className="text-[10px] font-bold text-[#18B892] uppercase tracking-wider bg-[#18B892]/10 px-2 py-0.5 rounded border border-[#18B892]/30">
                        PLAYER SITE
                      </span>
                    )}
                    <span className="text-slate-400">
                      Score: <strong className={isPlayer ? 'text-[#18B892]' : 'text-slate-200'}>{item.score}</strong>
                    </span>
                  </div>
                </div>

                {/* Page Title */}
                <h4 className={`text-xs sm:text-sm font-bold truncate leading-snug ${
                  isPlayer ? 'text-[#38ef7d]' : 'text-blue-400 hover:underline'
                }`}>
                  {item.title}
                </h4>

                {/* Snippet */}
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                  {item.snippet}
                </p>

                {/* Badges for Player */}
                {isPlayer && item.badges && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-2 pt-2 border-t border-[#18B892]/20 text-[9px] font-mono text-emerald-300">
                    {item.badges.map((badge, idx) => (
                      <span key={idx} className="bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                        ✓ {badge}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: AI OVERVIEW SIMULATION */}
      {activeTab === 'ai' && (
        <div className="mt-3.5 p-3.5 bg-gradient-to-br from-[#0B1526] to-[#0A101D] border border-cyan-500/30 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
            <Bot className="w-4 h-4 text-cyan-400" />
            <span>Generative AI Overview (Simulated Perplexity & Search Grounding)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            When searching for luxury and residential rentals in Lagos, top choices cluster across Ikoyi, Victoria Island, and Lekki Phase 1. Key evaluation criteria include 24/7 dedicated generator uptime, gated security access, and proximity to major arterial routes.
          </p>
          <div className="border-t border-slate-800 pt-2.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1.5">
              Grounding Citations Referenced by LLM:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="bg-slate-900 p-2 rounded-lg border border-[#18B892]/50 text-emerald-300 flex items-center justify-between">
                <span>1. Apex Realty (Your Business)</span>
                <span className="text-[9px] font-mono bg-[#18B892]/20 px-1.5 py-0.5 rounded">Citation #1</span>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 text-slate-400 flex items-center justify-between">
                <span>2. LagosPrime Realty</span>
                <span className="text-[9px] font-mono bg-slate-800 px-1.5 py-0.5 rounded">Citation #2</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: PEOPLE ALSO ASK */}
      {activeTab === 'paa' && (
        <div className="mt-3.5 space-y-2 text-xs">
          {[
            'How much does a 2 bedroom apartment cost to rent in Lagos?',
            'What are the safest neighborhoods to rent in Lagos for expats?',
            'What is the difference between service charge and rent in Lekki?',
            'How do I avoid agency fraud when renting in Lagos?'
          ].map((q, idx) => (
            <div key={idx} className="bg-slate-900/70 border border-slate-800 p-2.5 rounded-lg flex items-center justify-between text-slate-300">
              <span>{q}</span>
              <span className="text-slate-500 font-mono text-[10px]">Pillar Intent</span>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: LOCAL PACK */}
      {activeTab === 'local' && (
        <div className="mt-3.5 p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2 text-xs">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <MapPin className="w-4 h-4" />
            <span>Local 3-Pack Map Simulation (Google Business Profile Rank)</span>
          </div>
          <div className="space-y-1.5 text-[11px] text-slate-300">
            <div className="p-2 bg-slate-950 rounded border border-[#18B892]/50 flex justify-between">
              <span>★ 4.9 Apex Realty · Admiralty Way, Lekki</span>
              <span className="text-[#18B892] font-mono font-bold">Local #1</span>
            </div>
            <div className="p-2 bg-slate-950 rounded border border-slate-800 flex justify-between text-slate-400">
              <span>★ 4.7 LagosPrime Offices · Victoria Island</span>
              <span className="font-mono">Local #2</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: VIDEOS */}
      {activeTab === 'videos' && (
        <div className="mt-3.5 p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2 text-xs text-slate-300">
          <div className="flex items-center gap-2 text-rose-400 font-bold">
            <Video className="w-4 h-4" />
            <span>Video Rich Snippets (YouTube Video Carousel Grounding)</span>
          </div>
          <p className="text-[11px] text-slate-400">
            In-game video schema allows you to capture video carousel snippets for high-intent search queries.
          </p>
        </div>
      )}

      {/* Mini Ranking Trajectory Footnote */}
      <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-[#18B892]" />
          <span>Historical Trajectory: #8 (Week 1) → #5 (Week 2) → #{hasBoosted ? '1 (Current)' : '3 (Current)'}</span>
        </div>
        <span className="text-slate-500">Live SERP battle simulator · DSP Engine</span>
      </div>

    </div>
  );
}
