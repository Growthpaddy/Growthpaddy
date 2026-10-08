import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  FileText, 
  Cpu, 
  Network, 
  BarChart3, 
  Bot, 
  Zap, 
  Coins, 
  TrendingUp, 
  Activity, 
  Layers, 
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Sliders
} from 'lucide-react';

interface BuildingInfo {
  id: string;
  name: string;
  category: string;
  level: number;
  status: string;
  buff: string;
  metric: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  description: string;
}

const BUILDINGS: BuildingInfo[] = [
  {
    id: 'hq',
    name: 'YOUR BUSINESS',
    category: 'Corporate Headquarters',
    level: 4,
    status: 'Operational · High Authority',
    buff: '+25% Organic Conversion Rate',
    metric: 'Domain Authority: 48',
    icon: Building2,
    accentColor: '#18B892',
    description: 'Central hub anchoring all digital operations, revenue generation, and brand equity.'
  },
  {
    id: 'keywords',
    name: 'Keyword Research',
    category: 'Market Intelligence Lab',
    level: 3,
    status: 'Scouting 120 High-Intent Queries',
    buff: '+40% Intent Precision',
    metric: 'Target KWs: 42 Active',
    icon: Search,
    accentColor: '#06B6D4',
    description: 'Identifies transactional search volume, zero-click patterns, and competitor ranking gaps.'
  },
  {
    id: 'content',
    name: 'Content Studio',
    category: 'Editorial & Creative Hub',
    level: 4,
    status: '5 Pillar Pages Deployed',
    buff: 'E-E-A-T Signal Multiplier',
    metric: 'Publishing Velocity: 4/wk',
    icon: FileText,
    accentColor: '#8B5CF6',
    description: 'Produces high-converting cluster content and authoritative guides tailored for search intent.'
  },
  {
    id: 'technical',
    name: 'Technical SEO',
    category: 'Infrastructure & Crawl Center',
    level: 5,
    status: '0 Crawl Errors · 98ms TTFB',
    buff: '100% Core Web Vitals Pass',
    metric: 'Index Coverage: 100%',
    icon: Cpu,
    accentColor: '#10B981',
    description: 'Maintains schema markup, robots directive hygiene, and millisecond mobile page speeds.'
  },
  {
    id: 'links',
    name: 'Link Building',
    category: 'Digital PR & Network Hub',
    level: 3,
    status: '18 High-Trust Referrals',
    buff: '+15 Link Equity Velocity',
    metric: 'Avg DR: 72',
    icon: Network,
    accentColor: '#F59E0B',
    description: 'Earns editorial citations and contextual backlinks to outrank entrenched legacy domains.'
  },
  {
    id: 'analytics',
    name: 'Analytics Deck',
    category: 'Telemetry & CRO Station',
    level: 4,
    status: 'Tracking Live SERP Traffic',
    buff: 'Real-time Drop Alerts',
    metric: '18.4K Monthly Visits',
    icon: BarChart3,
    accentColor: '#3B82F6',
    description: 'Monitors impression share, click-through rates, and algorithmic fluctuation anomalies.'
  },
  {
    id: 'ai-visibility',
    name: 'AI Visibility',
    category: 'Generative Engine Hub (GEO)',
    level: 2,
    status: 'AI Overview Grounding Active',
    buff: 'ChatGPT & Gemini Citations',
    metric: 'Citation Share: 68%',
    icon: Bot,
    accentColor: '#EC4899',
    description: 'Optimizes entity authority for LLM search engines, Perplexity answers, and AI Overviews.'
  }
];

export function GameDistrictVisual() {
  const [activeBuildingId, setActiveBuildingId] = useState<string>('hq');
  const activeBuilding = BUILDINGS.find(b => b.id === activeBuildingId) || BUILDINGS[0];

  return (
    <div className="w-full bg-[#080E1C]/95 border border-slate-800/90 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-2xl relative overflow-hidden backdrop-blur-xl">
      
      {/* Background Grid Pattern & Ambient Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#18B892]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Game HUD bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/90 pb-3 mb-4 text-xs">
        
        {/* Player Profile & Level */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#18B892] to-cyan-600 p-0.5">
            <div className="w-full h-full bg-[#0B1220] rounded-[6px] flex items-center justify-center font-black text-white text-[11px]">
              LV12
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-slate-100 text-xs">
              <span>Apex Realty Corp</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#18B892] animate-ping" />
            </div>
            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
              <span>SERP Rank: #3</span>
              <span className="text-slate-600">·</span>
              <span className="text-[#18B892]">Niche: Real Estate</span>
            </div>
          </div>
        </div>

        {/* Game Currency / Stats Bar */}
        <div className="flex items-center gap-3 font-mono text-[11px]">
          {/* XP */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
            <Sparkles className="w-3 h-3 text-[#18B892]" />
            <span className="text-slate-300 font-semibold">3,450 XP</span>
            <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
              <div className="w-[69%] h-full bg-[#18B892]" />
            </div>
          </div>

          {/* Energy */}
          <div className="flex items-center gap-1 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800 text-amber-300">
            <Zap className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>88/100</span>
          </div>

          {/* Coins / SEO Budget */}
          <div className="flex items-center gap-1 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800 text-emerald-400">
            <Coins className="w-3 h-3 text-emerald-400" />
            <span>$42.5K</span>
          </div>
        </div>

      </div>

      {/* Main District Canvas - Modern High-Rise Business Campus */}
      <div className="relative z-10 bg-gradient-to-b from-[#091020] to-[#060A14] border border-slate-800/80 rounded-2xl p-4 sm:p-6 overflow-hidden">
        
        {/* District Header Label */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-3 border-b border-slate-800/60 pb-2">
          <div className="flex items-center gap-1.5 font-mono">
            <Sliders className="w-3.5 h-3.5 text-[#18B892]" />
            <span className="text-slate-200 font-semibold uppercase tracking-wider text-[10px]">
              Digital District Simulation · Sector 01
            </span>
          </div>
          <span className="text-[10px] text-[#18B892] font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#18B892] animate-pulse" />
            Live Strategy Grid
          </span>
        </div>

        {/* Isometric / Modern Campus Architecture Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
          
          {BUILDINGS.map((building) => {
            const Icon = building.icon;
            const isSelected = building.id === activeBuildingId;
            const isHQ = building.id === 'hq';

            return (
              <button
                key={building.id}
                onClick={() => setActiveBuildingId(building.id)}
                className={`group relative text-left p-3 rounded-xl transition-all duration-200 cursor-pointer focus:outline-none ${
                  isHQ ? 'sm:col-span-1 border-2' : 'border'
                } ${
                  isSelected
                    ? 'bg-slate-800/90 border-[#18B892] shadow-lg shadow-[#18B892]/15 -translate-y-0.5'
                    : 'bg-slate-900/60 hover:bg-slate-800/50 border-slate-800/90 hover:border-slate-700'
                }`}
              >
                {/* Glowing Corner Indicator for HQ */}
                {isHQ && (
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    <span className="text-[9px] font-mono font-bold text-slate-950 bg-[#18B892] px-1.5 py-0.5 rounded">
                      CORE HQ
                    </span>
                  </div>
                )}

                {/* Building Icon & Modern High-Rise Visual */}
                <div className="flex items-center gap-2.5 mb-2">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ 
                      backgroundColor: `${building.accentColor}18`, 
                      border: `1px solid ${building.accentColor}40` 
                    }}
                  >
                    <Icon className="w-4 h-4" style={{ color: building.accentColor }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-bold text-slate-100 truncate group-hover:text-white">
                      {building.name}
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono truncate">
                      Lv.{building.level} · {building.category.split(' ')[0]}
                    </div>
                  </div>
                </div>

                {/* Status Indicator Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                    <span className="truncate">{building.metric}</span>
                    {isSelected && (
                      <span className="text-[#18B892] flex items-center gap-0.5">
                        <TrendingUp className="w-2.5 h-2.5" /> Active
                      </span>
                    )}
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${building.level * 20}%`, 
                        backgroundColor: building.accentColor 
                      }} 
                    />
                  </div>
                </div>

                {/* Subtle Neon Line when selected */}
                {isSelected && (
                  <div className="absolute inset-x-2 -bottom-[1px] h-[2px] bg-[#18B892] rounded-full shadow-[0_0_8px_#18B892]" />
                )}
              </button>
            );
          })}

        </div>

        {/* Selected Building Telemetry Console */}
        <div className="mt-3.5 bg-slate-950/80 border border-slate-800/90 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-xs">{activeBuilding.name}</span>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {activeBuilding.category}
              </span>
              <span className="text-[10px] text-[#18B892] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {activeBuilding.buff}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              {activeBuilding.description}
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <div className="text-right">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-mono">Current Status</span>
              <span className="text-[11px] font-mono font-bold text-slate-200">{activeBuilding.status}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
