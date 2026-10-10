import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  FileText, 
  Cpu, 
  TrendingUp, 
  Coins, 
  Zap, 
  ArrowRight, 
  ArrowLeft, 
  ChevronRight, 
  Sliders, 
  Wrench, 
  Layers, 
  Compass, 
  Users, 
  BarChart3, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink,
  Sparkles,
  Bot,
  Flame,
  Radio,
  Eye,
  RefreshCw,
  Loader2,
  Monitor,
  Terminal,
  Server
} from 'lucide-react';
import { EXECUTIVE_ADVISORS, ExecutiveAvatar } from '../../lib/seo-game/brandAssets';

interface ImmersiveOfficeViewProps {
  player: any;
  business: any;
  website: any;
  wallet: any;
  pages: any[];
  keywords: any[];
  competitors: any[];
  metrics: any;
  strategicAnalysis: any;
  onExitToDistrict: () => void;
  onOpenCockpitTab: (tab: 'command_centre' | 'lifecycle' | 'keywords' | 'competitors' | 'events' | 'actions' | 'business') => void;
  onTriggerAction: (actionCode: string, payload?: any) => void;
  onPublishPage: (pageId: string) => void;
  onDraftPageModal: () => void;
  onAdvanceDay: () => void;
  isAdvancingDay: boolean;
  isProcessingAction: string | null;
  playSfx?: (type: 'click' | 'confirm' | 'warning' | 'upgrade' | 'success' | 'toggle') => void;
}

export function ImmersiveOfficeView({
  player,
  business,
  website,
  wallet,
  pages,
  keywords,
  competitors,
  metrics,
  strategicAnalysis,
  onExitToDistrict,
  onOpenCockpitTab,
  onTriggerAction,
  onPublishPage,
  onDraftPageModal,
  onAdvanceDay,
  isAdvancingDay,
  isProcessingAction,
  playSfx
}: ImmersiveOfficeViewProps) {
  const [activeStation, setActiveStation] = useState<'desk' | 'content' | 'tech' | 'market' | 'ops'>('desk');

  const indexedCount = pages.filter(p => p.indexed).length;
  const draftCount = pages.filter(p => !p.published_at).length;
  const pageOneKeywords = keywords.filter(k => k.current_position && k.current_position <= 10).length;

  const officeStations = [
    {
      id: 'desk' as const,
      name: 'Executive Strategist Desk',
      role: 'Corporate Strategy & Governance',
      status: `Level ${player?.level || 1} Strategist · Day ${player?.current_day || 1}`,
      icon: Compass,
      accentColor: '#18B892',
      badge: 'Executive Suite',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      description: 'Your command desk overlooking the commercial district. Review strategic advisory briefs, consult executive leads, monitor business budget, and conclude the daily turn.',
      primaryMetric: `₦${(business?.current_budget || 500000).toLocaleString()}`,
      primaryLabel: 'Cash Budget',
      secondaryMetric: `${player?.xp || 0} XP`,
      secondaryLabel: 'Progression'
    },
    {
      id: 'content' as const,
      name: 'Editorial & Content Production Suite',
      role: 'Content Clusters & Entity Authority',
      status: `${pages.length} Pages (${draftCount} Drafts)`,
      icon: FileText,
      accentColor: '#D97706',
      badge: 'Content Studio',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      description: 'Dual-display workstations dedicated to researching search intent, drafting long-form pillar clusters, and publishing authoritative landing pages to your domain.',
      primaryMetric: `${pages.length} URLs`,
      primaryLabel: 'Asset Footprint',
      secondaryMetric: `${draftCount} Drafts`,
      secondaryLabel: 'Pending Publish'
    },
    {
      id: 'tech' as const,
      name: 'Technical SEO & Crawler Lab',
      role: 'Index Coverage & Server Directives',
      status: `${indexedCount} / ${pages.length} Pages Indexed`,
      icon: Cpu,
      accentColor: '#0891B2',
      badge: 'Technical Lab',
      badgeColor: 'bg-cyan-50 text-cyan-800 border-cyan-200',
      description: 'High-speed diagnostic terminals monitoring search bot crawls, canonical tags, robots.txt directives, and Core Web Vitals speed scores.',
      primaryMetric: `${indexedCount} Indexed`,
      primaryLabel: 'Googlebot Coverage',
      secondaryMetric: '100% Pass',
      secondaryLabel: 'Robots Health'
    },
    {
      id: 'market' as const,
      name: 'SERP & Market Intelligence Terminal',
      role: 'Search Rankings & Competitor Scouting',
      status: `${keywords.length} Target Keywords Active`,
      icon: Search,
      accentColor: '#2563EB',
      badge: 'Market Radar',
      badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
      description: 'Real-time multi-monitor display tracking buyer keyword search volume, competitive difficulty, commercial intent, and ranking positions against market leaders.',
      primaryMetric: `${pageOneKeywords} Page-1 KWs`,
      primaryLabel: 'Top 10 Visibility',
      secondaryMetric: `${keywords.length} Tracked`,
      secondaryLabel: 'Target Queries'
    },
    {
      id: 'ops' as const,
      name: 'Agency Operations & Sprints Board',
      role: 'Daily Action Processing',
      status: '9 Canonical Actions Ready',
      icon: Sliders,
      accentColor: '#7C3AED',
      badge: 'Operations Board',
      badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
      description: 'Wall-mounted tactical board for commissioning comprehensive technical audits, high-intent content refreshes, backlink campaigns, and page speed sprints.',
      primaryMetric: `${wallet?.energy || 100} / ${wallet?.max_energy || 100}`,
      primaryLabel: 'Daily Energy Pool',
      secondaryMetric: `${wallet?.coins || 1000}`,
      secondaryLabel: 'Coins Balance'
    }
  ];

  const currentStation = officeStations.find(s => s.id === activeStation) || officeStations[0];
  const advisor = EXECUTIVE_ADVISORS[0];

  return (
    <div className="space-y-6">
      
      {/* 1. TOP OFFICE NAVIGATION & TRANSIT BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <button 
              onClick={() => {
                playSfx?.('click');
                onExitToDistrict();
              }}
              className="hover:text-slate-900 transition flex items-center gap-1 text-slate-600 font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Commercial District</span>
            </button>
            <span aria-hidden="true">/</span>
            <span>Agency Tower Penthouse (Floor 24)</span>
            <span aria-hidden="true">/</span>
            <span className="text-emerald-700 font-semibold">Executive Suite</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <span>{business?.name || 'Apex Strategic Digital'}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              Agency Suite · Level {business?.business_level || 1}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Interactive penthouse agency environment. Select any workstation to review real-time search performance, draft assets, run crawler diagnostics, or advance the turn.
          </p>
        </div>

        {/* Right Action Suite */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              playSfx?.('click');
              onExitToDistrict();
            }}
            className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer flex items-center gap-1.5"
          >
            <Building2 className="w-4 h-4 text-slate-500" />
            <span>District Map</span>
          </button>

          <button
            onClick={() => {
              playSfx?.('confirm');
              onOpenCockpitTab('command_centre');
            }}
            className="px-4 py-2 rounded-lg bg-[#18B892] hover:bg-[#149a7a] text-slate-950 font-bold text-xs transition shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Compass className="w-4 h-4" />
            <span>Open Full Cockpit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. REALISTIC 2.5D ARCHITECTURAL ISOMETRIC OFFICE INTERIOR VIEW */}
      <div className="relative rounded-3xl border border-slate-200 bg-slate-950 overflow-hidden shadow-xl select-none min-h-[480px] sm:min-h-[540px] flex flex-col justify-between">
        
        {/* Panoramic Floor-to-Ceiling Window Skyline Backdrop */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&auto=format&fit=crop&q=80')` }}
        />

        {/* Ambient Room Lighting & Daylight Reflection on Glass */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/85 to-slate-900/40 pointer-events-none" />

        {/* Station Navigation Tabs Bar */}
        <div className="relative z-10 p-3.5 sm:p-4 flex items-center gap-1.5 overflow-x-auto bg-slate-950/75 backdrop-blur-md border-b border-slate-800">
          {officeStations.map(station => {
            const Icon = station.icon;
            const isCurrent = activeStation === station.id;
            return (
              <button
                key={station.id}
                onClick={() => {
                  setActiveStation(station.id);
                  playSfx?.('click');
                }}
                className={`py-2 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isCurrent 
                    ? 'bg-white text-slate-900 shadow-md scale-102' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-[#18B892]' : 'text-slate-400'}`} />
                <span>{station.name.split(' ')[0]} {station.name.split(' ')[1]}</span>
              </button>
            );
          })}
        </div>

        {/* 2.5D Isometric Architectural Office Suite SVG Room Canvas */}
        <div className="relative z-10 flex-1 flex items-center justify-center p-3 sm:p-6">
          <svg 
            viewBox="0 0 1000 480" 
            className="w-full h-auto max-w-4xl filter drop-shadow-2xl select-none"
            style={{ shapeRendering: 'geometricPrecision' }}
          >
            <defs>
              {/* Floor Parquet Wood & Acoustic Wall Gradients */}
              <linearGradient id="officeFloorWood" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1E293B" />
                <stop offset="50%" stopColor="#0F172A" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>

              <linearGradient id="windowSkyView" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0284C7" stopOpacity="0.1" />
              </linearGradient>

              <linearGradient id="deskWalnut" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#451A03" />
                <stop offset="100%" stopColor="#78350F" />
              </linearGradient>

              <linearGradient id="glassWhiteboard" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#F8FAFC" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* 1. ROOM SHELL: Isometric Floor Base */}
            <polygon 
              points="500,40 960,180 500,450 40,180" 
              fill="url(#officeFloorWood)" 
              stroke="#334155" 
              strokeWidth="2" 
            />

            {/* Isometric Hardwood Floor Plank Seams */}
            {[80, 120, 160, 200, 240, 280, 320, 360, 400].map((y, idx) => (
              <line 
                key={`plank-${idx}`} 
                x1={500 - (y - 40) * 1.5} 
                y1={y} 
                x2={500 + (y - 40) * 1.5} 
                y2={y} 
                stroke="#1E293B" 
                strokeWidth="1" 
                strokeOpacity="0.4" 
              />
            ))}

            {/* Rear Panoramic Glass Window Wall (Victoria Island North View) */}
            <polygon points="500,40 960,180 960,80 500,-60" fill="url(#windowSkyView)" stroke="#475569" strokeWidth="1.5" />
            <polygon points="500,40 40,180 40,80 500,-60" fill="url(#windowSkyView)" stroke="#475569" strokeWidth="1.5" />

            {/* Window Steel Mullions */}
            {[200, 350, 650, 800].map((x, idx) => (
              <line key={`win-mullion-${idx}`} x1={x} y1={x < 500 ? 180 - (500 - x) * 0.3 : 180 - (x - 500) * 0.3} x2={x} y2={x < 500 ? 80 - (500 - x) * 0.3 : 80 - (x - 500) * 0.3} stroke="#64748B" strokeWidth="2" />
            ))}

            {/* Architectural Ceiling Spotlight Cones (Soft Daylight Highlights) */}
            <polygon points="260,120 200,310 320,310" fill="#FFFFFF" fillOpacity="0.04" />
            <polygon points="500,120 440,310 560,310" fill="#FFFFFF" fillOpacity="0.04" />
            <polygon points="740,120 680,310 800,310" fill="#FFFFFF" fillOpacity="0.04" />

            {/* ======================================================== */}
            {/* WORKSTATION 1: EXECUTIVE STRATEGIST DESK (Center-Left) */}
            {/* ======================================================== */}
            <g 
              className="cursor-pointer transition-transform hover:-translate-y-1"
              onClick={() => {
                setActiveStation('desk');
                playSfx?.('click');
              }}
            >
              {/* Floor Selection Ring if Active */}
              {activeStation === 'desk' && (
                <ellipse cx="280" cy="300" rx="75" ry="32" fill="#18B892" fillOpacity="0.2" stroke="#18B892" strokeWidth="2" />
              )}
              {/* Desk Shadow */}
              <ellipse cx="280" cy="305" rx="60" ry="22" fill="#020617" fillOpacity="0.6" />

              {/* L-Shaped Executive Desk Structure */}
              <polygon points="230,260 330,290 290,325 190,295" fill="url(#deskWalnut)" stroke="#9A3412" strokeWidth="1" />
              {/* Desk Side Return */}
              <polygon points="190,295 240,310 230,335 180,320" fill="#451A03" />

              {/* Executive Chair (Ergonomic Leather High-Back) */}
              <ellipse cx="260" cy="250" rx="14" ry="10" fill="#0F172A" stroke="#334155" strokeWidth="1" />
              <rect x="252" y="225" width="16" height="22" rx="4" fill="#1E293B" stroke="#475569" strokeWidth="1" />

              {/* Dual Executive Displays & Laptop */}
              <rect x="245" y="245" width="28" height="18" rx="2" fill="#0F172A" stroke="#18B892" strokeWidth="1" />
              <rect x="278" y="255" width="22" height="15" rx="2" fill="#0F172A" stroke="#38BDF8" strokeWidth="1" />
              {/* Brass Desk Lamp */}
              <circle cx="215" cy="275" r="4" fill="#F59E0B" />
              <line x1="215" y1="275" x2="225" y2="280" stroke="#FBBF24" strokeWidth="1.5" />

              {/* Station Tag */}
              <rect x="210" y="325" width="140" height="22" rx="5" fill="#0F172A" stroke={activeStation === 'desk' ? '#18B892' : '#475569'} strokeWidth="1.5" />
              <text x="280" y="340" fill="#F8FAFC" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                ★ Executive Desk
              </text>
            </g>

            {/* ======================================================== */}
            {/* WORKSTATION 2: CONTENT & EDITORIAL SUITE (Far Left) */}
            {/* ======================================================== */}
            <g 
              className="cursor-pointer transition-transform hover:-translate-y-1"
              onClick={() => {
                setActiveStation('content');
                playSfx?.('click');
              }}
            >
              {activeStation === 'content' && (
                <ellipse cx="140" cy="225" rx="65" ry="26" fill="#D97706" fillOpacity="0.2" stroke="#D97706" strokeWidth="2" />
              )}
              <ellipse cx="140" cy="230" rx="50" ry="18" fill="#020617" fillOpacity="0.55" />

              {/* Maple Studio Desk */}
              <polygon points="100,195 180,218 155,245 75,222" fill="#B45309" stroke="#78350F" strokeWidth="1" />
              {/* Vertical Drafting Monitors */}
              <rect x="110" y="178" width="16" height="26" rx="2" fill="#0F172A" stroke="#F59E0B" strokeWidth="1" />
              <rect x="130" y="185" width="24" height="18" rx="2" fill="#0F172A" stroke="#FBBF24" strokeWidth="1" />

              <rect x="80" y="245" width="120" height="20" rx="5" fill="#0F172A" stroke={activeStation === 'content' ? '#F59E0B' : '#475569'} strokeWidth="1.5" />
              <text x="140" y="259" fill="#F8FAFC" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                Editorial & Content
              </text>
            </g>

            {/* ======================================================== */}
            {/* WORKSTATION 3: TECHNICAL CRAWLER LAB & SERVER (Far Right) */}
            {/* ======================================================== */}
            <g 
              className="cursor-pointer transition-transform hover:-translate-y-1"
              onClick={() => {
                setActiveStation('tech');
                playSfx?.('click');
              }}
            >
              {activeStation === 'tech' && (
                <ellipse cx="840" cy="225" rx="65" ry="26" fill="#0891B2" fillOpacity="0.2" stroke="#0891B2" strokeWidth="2" />
              )}
              <ellipse cx="840" cy="230" rx="50" ry="18" fill="#020617" fillOpacity="0.55" />

              {/* Enterprise Server Rack Cabinet */}
              <polygon points="800,170 850,185 850,230 800,215" fill="#0F172A" stroke="#0891B2" strokeWidth="1" />
              <polygon points="850,185 880,172 880,217 850,230" fill="#020617" stroke="#0891B2" strokeWidth="1" />
              <polygon points="800,170 850,185 880,172 830,157" fill="#1E293B" />

              {/* Pulsing Fiber Status LEDs */}
              <circle cx="820" cy="185" r="1.8" fill="#22D3EE" />
              <circle cx="820" cy="195" r="1.8" fill="#10B981" />
              <circle cx="820" cy="205" r="1.8" fill="#F59E0B" />

              {/* Diagnostic Bench Desk */}
              <polygon points="760,205 820,225 805,245 745,225" fill="#334155" />
              <rect x="765" y="198" width="22" height="15" rx="2" fill="#0F172A" stroke="#06B6D4" strokeWidth="1" />

              <rect x="770" y="245" width="130" height="20" rx="5" fill="#0F172A" stroke={activeStation === 'tech' ? '#06B6D4' : '#475569'} strokeWidth="1.5" />
              <text x="835" y="259" fill="#F8FAFC" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                Technical Crawler Lab
              </text>
            </g>

            {/* ======================================================== */}
            {/* WORKSTATION 4: SERP INTELLIGENCE TERMINAL (Center-Right) */}
            {/* ======================================================== */}
            <g 
              className="cursor-pointer transition-transform hover:-translate-y-1"
              onClick={() => {
                setActiveStation('market');
                playSfx?.('click');
              }}
            >
              {activeStation === 'market' && (
                <ellipse cx="680" cy="300" rx="75" ry="32" fill="#2563EB" fillOpacity="0.2" stroke="#2563EB" strokeWidth="2" />
              )}
              <ellipse cx="680" cy="305" rx="60" ry="22" fill="#020617" fillOpacity="0.6" />

              {/* Curved Analytics Station */}
              <polygon points="630,265 730,295 690,330 590,300" fill="#1E293B" stroke="#2563EB" strokeWidth="1" />
              {/* Multi-Screen Curved Bloomberg-Style Array */}
              <rect x="625" y="250" width="30" height="20" rx="2" fill="#0F172A" stroke="#3B82F6" strokeWidth="1" />
              <rect x="660" y="258" width="32" height="22" rx="2" fill="#0F172A" stroke="#60A5FA" strokeWidth="1" />

              {/* Screen Telemetry Lines */}
              <line x1="665" y1="268" x2="685" y2="268" stroke="#38BDF8" strokeWidth="1" />
              <line x1="665" y1="273" x2="680" y2="273" stroke="#34D399" strokeWidth="1" />

              <rect x="610" y="330" width="140" height="22" rx="5" fill="#0F172A" stroke={activeStation === 'market' ? '#2563EB' : '#475569'} strokeWidth="1.5" />
              <text x="680" y="345" fill="#F8FAFC" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                SERP Terminal
              </text>
            </g>

            {/* ======================================================== */}
            {/* WORKSTATION 5: OPERATIONS & SPRINTS BOARD (North Center Wall) */}
            {/* ======================================================== */}
            <g 
              className="cursor-pointer transition-transform hover:-translate-y-1"
              onClick={() => {
                setActiveStation('ops');
                playSfx?.('click');
              }}
            >
              {activeStation === 'ops' && (
                <ellipse cx="500" cy="205" rx="65" ry="24" fill="#7C3AED" fillOpacity="0.2" stroke="#7C3AED" strokeWidth="2" />
              )}

              {/* Framed Glass Architectural Whiteboard */}
              <polygon points="440,110 560,110 560,165 440,165" fill="url(#glassWhiteboard)" stroke="#64748B" strokeWidth="1.5" />
              {/* Whiteboard Stand & Frame */}
              <line x1="440" y1="165" x2="435" y2="195" stroke="#475569" strokeWidth="2" />
              <line x1="560" y1="165" x2="565" y2="195" stroke="#475569" strokeWidth="2" />

              {/* Sticky Notes & Sprint Tokens */}
              <rect x="455" y="120" width="14" height="12" fill="#FEF08A" />
              <rect x="475" y="120" width="14" height="12" fill="#BAE6FD" />
              <rect x="495" y="120" width="14" height="12" fill="#BBF7D0" />
              <rect x="520" y="120" width="14" height="12" fill="#FED7AA" />

              <rect x="435" y="200" width="130" height="22" rx="5" fill="#0F172A" stroke={activeStation === 'ops' ? '#8B5CF6' : '#475569'} strokeWidth="1.5" />
              <text x="500" y="215" fill="#F8FAFC" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                Operations Board
              </text>
            </g>

            {/* Indoor Architectural Potted Plants */}
            {[
              { x: 380, y: 155 },
              { x: 620, y: 155 },
              { x: 80, y: 310 },
              { x: 920, y: 310 }
            ].map((plant, idx) => (
              <g key={`office-plant-${idx}`}>
                <ellipse cx={plant.x} cy={plant.y} rx="8" ry="4" fill="#020617" fillOpacity="0.5" />
                <polygon points={`${plant.x - 5},${plant.y - 12} ${plant.x + 5},${plant.y - 12} ${plant.x + 4},${plant.y} ${plant.x - 4},${plant.y}`} fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1" />
                <circle cx={plant.x} cy={plant.y - 15} r="7" fill="#15803D" />
                <circle cx={plant.x - 2} cy={plant.y - 18} r="5" fill="#22C55E" />
              </g>
            ))}

          </svg>
        </div>

        {/* Ambient Station Info Strip */}
        <div className="relative z-10 bg-slate-950/90 backdrop-blur-md border-t border-slate-800 p-3.5 px-6 text-white text-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-slate-200">Active Workstation:</span>
            <span className="text-slate-300 font-medium">{currentStation.name}</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-[11px] font-mono">
            <span>Room Temp: 22°C</span>
            <span className="text-slate-700">|</span>
            <span>Network: 10Gbps Fiber Dedicated</span>
          </div>
        </div>

      </div>

      {/* 3. ACTIVE WORKSTATION OPERATIONAL CONSOLE */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-6">
        
        {/* Console Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${currentStation.badgeColor}`}>
                {currentStation.badge}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {currentStation.role}
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              {currentStation.name}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
              {currentStation.description}
            </p>
          </div>

          {/* Direct Station Quick Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {activeStation === 'desk' && (
              <button
                onClick={onAdvanceDay}
                disabled={isAdvancingDay}
                className="py-2.5 px-4 rounded-xl bg-[#18B892] hover:bg-[#149a7a] text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isAdvancingDay ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Simulating Day...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Advance Business Day</span>
                  </>
                )}
              </button>
            )}

            {activeStation === 'content' && (
              <button
                onClick={onDraftPageModal}
                className="py-2.5 px-4 rounded-xl bg-[#18B892] hover:bg-[#149a7a] text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Draft New Page</span>
              </button>
            )}

            {activeStation === 'tech' && (
              <button
                onClick={() => onTriggerAction('TECHNICAL_AUDIT')}
                disabled={Boolean(isProcessingAction)}
                className="py-2.5 px-4 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Cpu className="w-4 h-4" />
                <span>Run Technical Audit</span>
              </button>
            )}

            {activeStation === 'market' && (
              <button
                onClick={() => onOpenCockpitTab('keywords')}
                className="py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Open SERP Arena</span>
              </button>
            )}

            {activeStation === 'ops' && (
              <button
                onClick={() => onOpenCockpitTab('actions')}
                className="py-2.5 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              >
                <Sliders className="w-4 h-4" />
                <span>Open Operations Board</span>
              </button>
            )}
          </div>
        </div>

        {/* Station-Specific Interactive Panes */}
        {activeStation === 'desk' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Advisor Consultation Card */}
            <div className="md:col-span-2 p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex items-start gap-4 text-left">
              <ExecutiveAvatar avatar={advisor} size="lg" />
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{advisor.name}</span>
                  <span className="text-[10px] uppercase font-mono text-slate-500">Chief Strategy Advisor</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed italic">
                  "{strategicAnalysis?.primaryRecommendation?.description || 'Build comprehensive authority pillar pages to establish initial crawl indexation.'}"
                </p>
                <div className="pt-1 flex items-center gap-3">
                  <span className="text-[11px] font-semibold text-emerald-700">
                    Rationale: {strategicAnalysis?.primaryRecommendation?.rationale || 'Essential foundation.'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Economics Telemetry */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2 text-left">
              <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider block">Treasury Status</span>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Working Budget:</span>
                  <span className="font-bold text-slate-900">₦{(business?.current_budget || 500000).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Daily Deal Revenue:</span>
                  <span className="font-bold text-emerald-700">₦{(metrics?.revenue || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Leads Generated:</span>
                  <span className="font-bold text-slate-900">{metrics?.leads || 0}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeStation === 'content' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Recent Page Portfolio ({pages.length} total)</span>
              <button 
                onClick={() => onOpenCockpitTab('lifecycle')}
                className="text-emerald-700 font-semibold hover:underline"
              >
                View Complete Lifecycle Grid →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {pages.slice(0, 3).map(page => (
                <div key={page.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 truncate max-w-[180px]">
                      {page.title}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${page.indexed ? 'bg-emerald-100 text-emerald-800' : page.published_at ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'}`}>
                      {page.indexed ? 'INDEXED' : page.published_at ? 'PUBLISHED' : 'DRAFT'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex justify-between">
                    <span>Quality Score: {page.content_quality_score}/100</span>
                    <span>Words: {page.word_count || 0}</span>
                  </div>
                  {!page.published_at && (
                    <button
                      onClick={() => onPublishPage(page.id)}
                      className="w-full mt-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
                    >
                      Publish Page Now
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeStation === 'tech' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Googlebot Directives</span>
              <strong className="text-sm font-bold text-slate-900 block">
                {pages.filter(p => p.robots_index).length} Allow / {pages.filter(p => !p.robots_index).length} Noindex
              </strong>
              <p className="text-[11px] text-slate-500">Ensure commercial URLs permit crawling.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Core Web Vitals</span>
              <strong className="text-sm font-bold text-emerald-700 block">
                98ms Server TTFB (Good)
              </strong>
              <p className="text-[11px] text-slate-500">Passed all mobile & desktop thresholds.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Indexation Ratio</span>
              <strong className="text-sm font-bold text-blue-700 block">
                {pages.length > 0 ? Math.round((indexedCount / pages.length) * 100) : 0}% Coverage
              </strong>
              <p className="text-[11px] text-slate-500">{indexedCount} of {pages.length} eligible pages crawled.</p>
            </div>
          </div>
        )}

        {activeStation === 'market' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Tracked Target Queries ({keywords.length} active)</span>
              <button 
                onClick={() => onOpenCockpitTab('keywords')}
                className="text-blue-700 font-semibold hover:underline"
              >
                Inspect Full SERP Arena →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {keywords.slice(0, 3).map(kw => (
                <div key={kw.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 truncate max-w-[170px]">
                      "{kw.keyword}"
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      #{kw.current_position || 'Unranked'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex justify-between">
                    <span>Vol: {kw.search_volume?.toLocaleString() || 1000}/mo</span>
                    <span>Diff: {kw.difficulty}/100</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeStation === 'ops' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => onTriggerAction('TECHNICAL_AUDIT')}
              disabled={Boolean(isProcessingAction)}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition text-left space-y-1 cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Technical Health Audit</span>
                <span className="text-[10px] font-mono text-slate-500">8 Energy, 100 Coins</span>
              </div>
              <p className="text-[11px] text-slate-600">Scan for crawl anomalies and boost Core Web Vitals.</p>
            </button>

            <button
              onClick={() => onTriggerAction('CONTENT_EXPANSION')}
              disabled={Boolean(isProcessingAction)}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition text-left space-y-1 cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Topical Content Expansion</span>
                <span className="text-[10px] font-mono text-slate-500">7 Energy, 120 Coins</span>
              </div>
              <p className="text-[11px] text-slate-600">Enhance E-E-A-T signals and expand semantic topical depth.</p>
            </button>

            <button
              onClick={() => onTriggerAction('AUTHORITY_CAMPAIGN')}
              disabled={Boolean(isProcessingAction)}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition text-left space-y-1 cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">High-Authority Outreach</span>
                <span className="text-[10px] font-mono text-slate-500">10 Energy, 250 Coins</span>
              </div>
              <p className="text-[11px] text-slate-600">Secure enterprise editorial backlinks and domain authority.</p>
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
