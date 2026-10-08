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
  Sparkles,
  CheckCircle2,
  Sliders,
  Layers,
  ArrowUpRight,
  Radio,
  Compass
} from 'lucide-react';

interface BuildingInfo {
  id: string;
  name: string;
  corporateTitle: string;
  category: string;
  level: number;
  floors: number;
  status: string;
  buff: string;
  metric: string;
  secondaryMetric: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  description: string;
  infrastructureRole: string;
}

const BUILDINGS: BuildingInfo[] = [
  {
    id: 'hq',
    name: 'Apex Commercial Tower',
    corporateTitle: 'Corporate Headquarters',
    category: 'Commercial Skyscraper',
    level: 4,
    floors: 54,
    status: 'Operational · High Authority',
    buff: '+25% Organic Conversion Lift',
    metric: 'Domain Authority: 48',
    secondaryMetric: 'Grade-A Real Estate Anchor',
    icon: Building2,
    accentColor: '#18B892',
    description: 'Central commercial glass skyscraper anchoring all digital revenue pipelines, brand equity, and transactional conversions.',
    infrastructureRole: 'Corporate Governance & Monetization'
  },
  {
    id: 'keywords',
    name: 'OmniSearch Intelligence Lab',
    corporateTitle: 'Market Scouting Hub',
    category: 'Research Tower',
    level: 3,
    floors: 28,
    status: 'Tracking 120 High-Intent Queries',
    buff: '+40% Intent Precision Multiplier',
    metric: 'Target KWs: 42 Active',
    secondaryMetric: 'Commercial CPC: $14.80 saved/click',
    icon: Search,
    accentColor: '#06B6D4',
    description: 'Advanced financial center scouting transactional search volume, intent gaps, and competitor organic vulnerabilities.',
    infrastructureRole: 'Market Intelligence & Query Modeling'
  },
  {
    id: 'content',
    name: 'Nexus Media Atrium',
    corporateTitle: 'Editorial & Creative Studio',
    category: 'Architectural Glass Pavilion',
    level: 4,
    floors: 14,
    status: '5 Pillar Clusters Live',
    buff: 'E-E-A-T Signal Multiplier',
    metric: 'Publishing Velocity: 4/wk',
    secondaryMetric: 'Topical Authority: 84/100',
    icon: FileText,
    accentColor: '#8B5CF6',
    description: 'Contemporary glass-enclosed creative hub producing authoritative guides, case studies, and structured cluster hubs.',
    infrastructureRole: 'Topical Authority & Content Velocity'
  },
  {
    id: 'technical',
    name: 'Data Horizon Tech Campus',
    corporateTitle: 'Infrastructure & Crawl Center',
    category: 'Server & Tech Pavilion',
    level: 5,
    floors: 8,
    status: '0 Bottlenecks · 98ms Server TTFB',
    buff: '100% Core Web Vitals Pass',
    metric: 'Index Coverage: 100%',
    secondaryMetric: 'Daily Crawl Budget: 94% utilized',
    icon: Cpu,
    accentColor: '#10B981',
    description: 'Low-slung modern brutalist tech facility maintaining schema architectures, edge caching, and crawl bot hygiene.',
    infrastructureRole: 'High-Performance Search Infrastructure'
  },
  {
    id: 'links',
    name: 'SkyBridge PR Citadel',
    corporateTitle: 'Digital PR & Network Hub',
    category: 'Twin Connected Towers',
    level: 3,
    floors: 36,
    status: '18 High-Trust Placements',
    buff: '+15 Link Equity Velocity',
    metric: 'Avg Domain Rating: 72',
    secondaryMetric: 'Editorial Press Mentions: 9',
    icon: Network,
    accentColor: '#F59E0B',
    description: 'Twin business towers connected by a luminous skybridge, earning editorial backlinks from tier-1 national publications.',
    infrastructureRole: 'Brand Reputation & Backlink Acquisition'
  },
  {
    id: 'analytics',
    name: 'C-Suite Telemetry Deck',
    corporateTitle: 'Operations & CRO Center',
    category: 'Penthouse Command Floor',
    level: 4,
    floors: 42,
    status: 'Monitoring 18.4K Live Sessions',
    buff: 'Real-time Algorithm Drop Alerts',
    metric: '18.4K Monthly Visits',
    secondaryMetric: 'Conversion Rate: 3.42%',
    icon: BarChart3,
    accentColor: '#3B82F6',
    description: 'High-rise command floor continuously tracking impression velocity, SERP volatility, and conversion funnel efficiency.',
    infrastructureRole: 'Continuous Performance & CRO Diagnostics'
  },
  {
    id: 'ai-visibility',
    name: 'Generative AI Research Center',
    corporateTitle: 'GEO & LLM Visibility Pavilion',
    category: 'Futuristic Corporate Pavilion',
    level: 2,
    floors: 10,
    status: 'AI Overview Grounding Active',
    buff: 'ChatGPT & Gemini Entity Citations',
    metric: 'Citation Share: 68%',
    secondaryMetric: 'Brand Entity Confidence: 91%',
    icon: Bot,
    accentColor: '#EC4899',
    description: 'Aerodynamic technology campus optimizing brand authority for generative answers across Google AI Overviews and Perplexity.',
    infrastructureRole: 'Generative Engine Optimization (GEO)'
  }
];

interface GameDistrictVisualProps {
  playSfx?: (type: 'click' | 'success' | 'toggle' | 'upgrade') => void;
}

export function GameDistrictVisual({ playSfx }: GameDistrictVisualProps) {
  const [activeBuildingId, setActiveBuildingId] = useState<string>('hq');
  const [xp, setXp] = useState<number>(3450);
  const [energy, setEnergy] = useState<number>(88);
  const [lastActionMessage, setLastActionMessage] = useState<string | null>(null);
  const [isExecutingAction, setIsExecutingAction] = useState<boolean>(false);
  const [selectedSector, setSelectedSector] = useState<'financial' | 'tech' | 'creative'>('financial');

  const activeBuilding = BUILDINGS.find(b => b.id === activeBuildingId) || BUILDINGS[0];

  const handleSelectBuilding = (id: string) => {
    setActiveBuildingId(id);
    if (playSfx) {
      playSfx('click');
    }
  };

  const handleExecuteSprint = () => {
    if (energy < 10) return;
    setIsExecutingAction(true);
    setEnergy(prev => Math.max(0, prev - 10));
    setXp(prev => prev + 150);
    setLastActionMessage(`Sprint executed on ${activeBuilding.name}: +150 XP gained!`);

    if (playSfx) {
      playSfx('upgrade');
    }

    setTimeout(() => {
      setIsExecutingAction(false);
    }, 600);

    setTimeout(() => {
      setLastActionMessage(null);
    }, 4000);
  };

  return (
    <div className="w-full bg-[#070D18]/95 border border-slate-800/90 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-2xl relative overflow-hidden backdrop-blur-xl">
      
      {/* Background Grid Pattern & Atmospheric Corporate Lighting */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0f_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0f_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#18B892]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Executive Strategy HUD Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/90 pb-3 mb-4 text-xs">
        
        {/* Corporate Identity & Authority */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#18B892] via-[#0E7A60] to-cyan-700 p-0.5 shadow-md shadow-[#18B892]/20">
            <div className="w-full h-full bg-[#091120] rounded-[10px] flex items-center justify-center font-black text-white text-xs">
              LV12
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 font-bold text-slate-100 text-xs">
              <span className="tracking-wide">Apex Commercial Realty Corp</span>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#18B892]/15 text-[#18B892] border border-[#18B892]/30">
                SERP #3
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
              <span>Domain Authority: 48</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-300">Commercial Real Estate Niche</span>
              <span className="text-slate-600">·</span>
              <span className="text-emerald-400 font-bold">Targeting #1</span>
            </div>
          </div>
        </div>

        {/* Live Game Currency & Telemetry Bar */}
        <div className="flex items-center gap-2.5 font-mono text-[11px]">
          {/* Experience XP */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-[#18B892]" />
            <span className="text-slate-200 font-bold">{xp.toLocaleString()} XP</span>
            <div className="w-10 h-1.5 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
              <div 
                className="h-full bg-[#18B892] transition-all duration-300"
                style={{ width: `${Math.min(100, ((xp % 1000) / 1000) * 100)}%` }} 
              />
            </div>
          </div>

          {/* Energy Pool */}
          <div className="flex items-center gap-1 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800 text-amber-300">
            <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold">{energy}/100</span>
          </div>

          {/* SEO Working Capital */}
          <div className="flex items-center gap-1 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800 text-emerald-400">
            <Coins className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold">$42.5K</span>
          </div>
        </div>

      </div>

      {/* Floating Action Feedback Notification */}
      {lastActionMessage && (
        <div className="relative z-20 mb-3 px-3.5 py-1.5 bg-[#18B892]/20 border border-[#18B892]/60 rounded-xl text-xs font-mono text-emerald-300 flex items-center justify-between shadow-lg shadow-[#18B892]/10 animate-fadeIn">
          <span className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#18B892]" />
            <span>{lastActionMessage}</span>
          </span>
          <span className="text-[10px] text-emerald-400 font-bold tracking-wider">STRATEGY UPDATED</span>
        </div>
      )}

      {/* Modern Business Skyline Canvas & Metropolitan District */}
      <div className="relative z-10 bg-gradient-to-b from-[#091122] via-[#070D18] to-[#040810] border border-slate-800/90 rounded-2xl p-3 sm:p-5 overflow-hidden">
        
        {/* District Status Header */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-3 border-b border-slate-800/70 pb-2.5">
          <div className="flex items-center gap-2 font-mono">
            <Radio className="w-3.5 h-3.5 text-[#18B892] animate-pulse" />
            <span className="text-slate-200 font-semibold uppercase tracking-wider text-[10px]">
              Metropolitan Business District · Sector 01
            </span>
          </div>
          
          <div className="flex items-center gap-3 text-[10px] font-mono">
            <span className="hidden sm:inline text-slate-400">
              Crawlway Traffic: <strong className="text-emerald-400">842 req/sec</strong>
            </span>
            <span className="text-[#18B892] flex items-center gap-1 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#18B892] animate-ping" />
              Live Corporate Simulation
            </span>
          </div>
        </div>

        {/* Realistic High-Rise Architectural Skyline & City Roads Illustration */}
        <div className="relative w-full h-36 sm:h-44 rounded-xl mb-4 bg-gradient-to-b from-[#0B1528] to-[#050912] border border-slate-800/80 overflow-hidden select-none">
          
          {/* Subtle Ambient Night Sky & Starry Gradients */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#1e293b25_0%,transparent_70%)] pointer-events-none" />
          
          {/* Distant Corporate High-Rise Silhouettes */}
          <div className="absolute bottom-10 inset-x-0 flex items-end justify-between px-4 opacity-25 pointer-events-none">
            <div className="w-8 h-24 bg-slate-700/60 rounded-t-sm" />
            <div className="w-12 h-32 bg-slate-700/50 rounded-t-sm" />
            <div className="w-10 h-28 bg-slate-700/40 rounded-t-sm" />
            <div className="w-14 h-36 bg-slate-700/50 rounded-t-sm" />
            <div className="w-9 h-26 bg-slate-700/60 rounded-t-sm" />
            <div className="w-11 h-30 bg-slate-700/40 rounded-t-sm" />
            <div className="w-16 h-34 bg-slate-700/50 rounded-t-sm" />
          </div>

          {/* Primary High-Rise Business Towers & Campuses Elevation */}
          <div className="absolute bottom-7 inset-x-0 flex items-end justify-around px-2 sm:px-6">
            
            {/* 1. Technical Data Horizon Campus (Brutalist Server Facility) */}
            <div 
              onClick={() => handleSelectBuilding('technical')}
              className={`relative flex flex-col items-center cursor-pointer transition-transform duration-200 group ${
                activeBuildingId === 'technical' ? 'scale-105' : 'hover:scale-102 opacity-85'
              }`}
            >
              {activeBuildingId === 'technical' && (
                <div className="absolute -top-6 text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/40 whitespace-nowrap animate-bounce">
                  98ms TTFB
                </div>
              )}
              {/* Rooftop Tech Antennas */}
              <div className="w-0.5 h-3 bg-emerald-500/80" />
              <div className="w-14 sm:w-16 h-18 sm:h-22 bg-gradient-to-b from-slate-800 to-slate-900 border-x border-t border-emerald-500/40 rounded-t-md p-1 flex flex-col justify-between shadow-lg">
                <div className="grid grid-cols-3 gap-0.5">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="h-1 bg-emerald-400/40 rounded-[1px] animate-pulse" style={{ animationDelay: `${i * 120}ms` }} />
                  ))}
                </div>
                <div className="text-[7px] font-mono text-center text-emerald-400 font-bold uppercase truncate">
                  TECH LAB
                </div>
              </div>
            </div>

            {/* 2. OmniSearch Intelligence Tower (28 Floors) */}
            <div 
              onClick={() => handleSelectBuilding('keywords')}
              className={`relative flex flex-col items-center cursor-pointer transition-transform duration-200 group ${
                activeBuildingId === 'keywords' ? 'scale-105' : 'hover:scale-102 opacity-85'
              }`}
            >
              {activeBuildingId === 'keywords' && (
                <div className="absolute -top-6 text-[9px] font-mono font-bold text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-500/40 whitespace-nowrap animate-bounce">
                  120 KWs Live
                </div>
              )}
              <div className="w-1 h-2 bg-cyan-400/80" />
              <div className="w-12 sm:w-14 h-24 sm:h-28 bg-gradient-to-b from-slate-800 to-[#0A1322] border-x border-t border-cyan-500/40 rounded-t-md p-1 flex flex-col justify-between shadow-lg">
                <div className="grid grid-cols-2 gap-0.5 pt-1">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="h-1 bg-cyan-300/30 rounded-[1px]" />
                  ))}
                </div>
                <div className="text-[7px] font-mono text-center text-cyan-300 font-bold uppercase truncate">
                  QUERY HQ
                </div>
              </div>
            </div>

            {/* 3. CORE HEADQUARTERS: Apex Commercial Tower (54-Story Glass Skyscraper) */}
            <div 
              onClick={() => handleSelectBuilding('hq')}
              className={`relative flex flex-col items-center cursor-pointer transition-transform duration-200 group z-10 ${
                activeBuildingId === 'hq' ? 'scale-105' : 'hover:scale-102 opacity-95'
              }`}
            >
              {/* Spire & Authority Beacon */}
              <div className="relative flex flex-col items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-[#18B892] animate-ping" />
                <div className="w-0.5 h-5 bg-gradient-to-t from-[#18B892] to-white" />
              </div>

              {activeBuildingId === 'hq' && (
                <div className="absolute -top-7 text-[9px] font-mono font-extrabold text-slate-950 bg-[#18B892] px-2 py-0.5 rounded-full shadow-lg shadow-[#18B892]/40 whitespace-nowrap animate-pulse">
                  APEX CORE · DA 48
                </div>
              )}

              {/* 54-Story Tower Facade with Curtain Glass Grid */}
              <div className="w-16 sm:w-20 h-28 sm:h-34 bg-gradient-to-b from-[#10242E] via-[#0B1A24] to-[#060F17] border-x-2 border-t-2 border-[#18B892] rounded-t-lg p-1.5 flex flex-col justify-between shadow-2xl shadow-[#18B892]/20">
                {/* Lit Office Windows (Simulating Corporate Floors Working) */}
                <div className="grid grid-cols-4 gap-0.5 pt-1">
                  {[...Array(20)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1 rounded-[1px] ${
                        i % 3 === 0 ? 'bg-[#18B892]/80' : i % 5 === 0 ? 'bg-amber-300/70' : 'bg-slate-600/40'
                      }`} 
                    />
                  ))}
                </div>

                <div className="bg-[#08131E] border border-[#18B892]/40 rounded px-1 py-0.5 text-center">
                  <span className="text-[8px] font-black font-mono text-[#18B892] tracking-wider block">
                    APEX HQ
                  </span>
                </div>
              </div>
            </div>

            {/* 4. SkyBridge PR Citadel (Twin Business Towers Connected by Glass Bridge) */}
            <div 
              onClick={() => handleSelectBuilding('links')}
              className={`relative flex flex-col items-center cursor-pointer transition-transform duration-200 group ${
                activeBuildingId === 'links' ? 'scale-105' : 'hover:scale-102 opacity-85'
              }`}
            >
              {activeBuildingId === 'links' && (
                <div className="absolute -top-6 text-[9px] font-mono font-bold text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/40 whitespace-nowrap animate-bounce">
                  18 DR 72 Links
                </div>
              )}
              {/* Twin Towers with Skybridge */}
              <div className="relative flex items-end gap-1">
                {/* Left Tower */}
                <div className="w-7 sm:w-8 h-22 sm:h-26 bg-gradient-to-b from-slate-800 to-[#14120D] border-x border-t border-amber-500/40 rounded-t p-0.5 flex flex-col justify-between">
                  <div className="grid grid-cols-2 gap-0.5">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="h-1 bg-amber-400/40 rounded-[1px]" />
                    ))}
                  </div>
                  <span className="text-[6px] font-mono text-amber-400 text-center">T1</span>
                </div>

                {/* Illuminated Skybridge */}
                <div className="absolute top-10 inset-x-0 h-2 bg-gradient-to-r from-amber-500/60 to-amber-400/60 border-y border-amber-300 z-10" />

                {/* Right Tower */}
                <div className="w-7 sm:w-8 h-22 sm:h-26 bg-gradient-to-b from-slate-800 to-[#14120D] border-x border-t border-amber-500/40 rounded-t p-0.5 flex flex-col justify-between">
                  <div className="grid grid-cols-2 gap-0.5">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="h-1 bg-amber-400/40 rounded-[1px]" />
                    ))}
                  </div>
                  <span className="text-[6px] font-mono text-amber-400 text-center">T2</span>
                </div>
              </div>
            </div>

            {/* 5. Nexus Media Atrium (Architectural Creative Cube) */}
            <div 
              onClick={() => handleSelectBuilding('content')}
              className={`relative flex flex-col items-center cursor-pointer transition-transform duration-200 group ${
                activeBuildingId === 'content' ? 'scale-105' : 'hover:scale-102 opacity-85'
              }`}
            >
              {activeBuildingId === 'content' && (
                <div className="absolute -top-6 text-[9px] font-mono font-bold text-purple-300 bg-purple-950/80 px-1.5 py-0.5 rounded border border-purple-500/40 whitespace-nowrap animate-bounce">
                  5 Clusters Live
                </div>
              )}
              <div className="w-14 sm:w-16 h-16 sm:h-20 bg-gradient-to-b from-slate-800 to-[#120B20] border-x border-t border-purple-500/40 rounded-t-xl p-1 flex flex-col justify-between shadow-lg">
                <div className="grid grid-cols-3 gap-0.5 pt-1">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="h-1 bg-purple-400/30 rounded-[1px]" />
                  ))}
                </div>
                <div className="text-[7px] font-mono text-center text-purple-300 font-bold uppercase truncate">
                  EDITORIAL
                </div>
              </div>
            </div>

          </div>

          {/* Metropolitan City Roads & Thoroughfares (Crawlway Ave & Organic Expressway) */}
          <div className="absolute bottom-0 inset-x-0 h-7 bg-[#050A14] border-t border-slate-700/80 flex items-center justify-between px-3 text-[8px] font-mono text-slate-400 z-20">
            {/* Road Label */}
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>CRAWLWAY AVE</span>
            </span>

            {/* Animated Traffic Light Streaks (Representing Crawl Requests & Visitors) */}
            <div className="flex-1 mx-3 h-1 bg-slate-900 rounded-full relative overflow-hidden">
              <div className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-[#18B892] to-transparent animate-pulse" style={{ left: '35%' }} />
              <div className="absolute inset-y-0 w-12 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" style={{ left: '70%', animationDelay: '300ms' }} />
            </div>

            {/* Expressway Label */}
            <span className="flex items-center gap-1">
              <span>ORGANIC EXPRESSWAY</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#18B892] animate-pulse" />
            </span>
          </div>

        </div>

        {/* Corporate Facilities Matrix Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          
          {BUILDINGS.map((building) => {
            const Icon = building.icon;
            const isSelected = building.id === activeBuildingId;
            const isHQ = building.id === 'hq';

            return (
              <button
                key={building.id}
                onClick={() => handleSelectBuilding(building.id)}
                className={`group relative text-left p-3 rounded-xl transition-all duration-200 cursor-pointer focus:outline-none ${
                  isHQ ? 'sm:col-span-1 border-2' : 'border'
                } ${
                  isSelected
                    ? 'bg-slate-800/90 border-[#18B892] shadow-lg shadow-[#18B892]/20 -translate-y-0.5'
                    : 'bg-slate-900/60 hover:bg-slate-800/50 border-slate-800/90 hover:border-slate-700'
                }`}
              >
                {/* Core HQ Badge */}
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
                      {building.floors} Floors · Lv.{building.level}
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

                {/* Signature Neon Line when selected */}
                {isSelected && (
                  <div className="absolute inset-x-2 -bottom-[1px] h-[2px] bg-[#18B892] rounded-full shadow-[0_0_8px_#18B892]" />
                )}
              </button>
            );
          })}

        </div>

        {/* Selected Facility Detailed Corporate Console */}
        <div className="mt-3.5 bg-slate-950/90 border border-slate-800/90 rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-extrabold text-white text-xs">{activeBuilding.name}</span>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {activeBuilding.corporateTitle} · {activeBuilding.floors} Floors
              </span>
              <span className="text-[10px] text-[#18B892] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {activeBuilding.buff}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              {activeBuilding.description}
            </p>
            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2 pt-0.5">
              <span>Infrastructure: {activeBuilding.infrastructureRole}</span>
              <span className="text-slate-600">·</span>
              <span className="text-cyan-400 font-semibold">{activeBuilding.secondaryMetric}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
            <div className="text-right hidden sm:block">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-mono">Status</span>
              <span className="text-[11px] font-mono font-bold text-slate-200">{activeBuilding.status}</span>
            </div>

            <button
              onClick={handleExecuteSprint}
              disabled={isExecutingAction || energy < 10}
              className="px-3.5 py-2 rounded-xl bg-[#18B892] hover:bg-[#15a381] disabled:opacity-50 text-slate-950 text-xs font-mono font-black flex items-center gap-1.5 shadow-lg shadow-[#18B892]/25 active:scale-95 transition cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              <span>{isExecutingAction ? 'Executing Sprint...' : 'Deploy 48h Sprint (+150 XP)'}</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
