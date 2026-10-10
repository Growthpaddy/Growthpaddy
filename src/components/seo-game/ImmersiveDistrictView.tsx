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
  ExternalLink, 
  ShieldCheck, 
  Compass, 
  BarChart3, 
  Users, 
  Radio, 
  Layers, 
  Sparkles, 
  ChevronRight,
  Eye,
  Info,
  Sun,
  Sunset,
  Navigation
} from 'lucide-react';
import { REAL_BRANDS, CompanyLogo } from '../../lib/seo-game/brandAssets';

interface ImmersiveDistrictViewProps {
  player: any;
  business: any;
  website: any;
  wallet: any;
  pages: any[];
  keywords: any[];
  competitors: any[];
  metrics: any;
  onEnterOffice: () => void;
  onOpenCockpitTab: (tab: 'command_centre' | 'lifecycle' | 'keywords' | 'competitors' | 'events' | 'actions' | 'business') => void;
  playSfx?: (type: 'click' | 'confirm' | 'warning' | 'upgrade' | 'success' | 'toggle') => void;
}

export function ImmersiveDistrictView({
  player,
  business,
  website,
  wallet,
  pages,
  keywords,
  competitors,
  metrics,
  onEnterOffice,
  onOpenCockpitTab,
  playSfx
}: ImmersiveDistrictViewProps) {
  const [selectedHub, setSelectedHub] = useState<string>('agency_hq');
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'golden_hour'>('day');

  const indexedCount = pages.filter(p => p.indexed).length;
  const pageOneKeywords = keywords.filter(k => k.current_position && k.current_position <= 10).length;

  const districtHubs = [
    {
      id: 'agency_hq',
      name: business?.name || 'Apex Strategic Digital HQ',
      type: 'PLAYER_HEADQUARTERS',
      category: 'Commercial Penthouse & Agency Suites',
      status: `Operating Level ${business?.business_level || 1} · Grade-A Office`,
      badge: 'Your Corporate Base',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      accentColor: '#18B892',
      metricLabel: 'Working Capital',
      metricValue: `₦${(business?.current_budget || 500000).toLocaleString()}`,
      secondaryLabel: 'Indexed Portfolio',
      secondaryValue: `${indexedCount} / ${pages.length} Pages`,
      description: 'Your premier digital agency office tower anchoring search operations, strategic editorial pipelines, and commercial client revenue.',
      primaryActionLabel: 'Enter Agency Headquarters',
      primaryAction: () => {
        playSfx?.('confirm');
        onEnterOffice();
      },
      secondaryActionLabel: 'Open Operations Board',
      secondaryAction: () => {
        playSfx?.('click');
        onOpenCockpitTab('actions');
      }
    },
    {
      id: 'search_exchange',
      name: 'Victoria Commercial Search Exchange',
      type: 'MARKET_EXCHANGE',
      category: 'Financial District SERP Arena',
      status: `${competitors.length > 0 ? competitors.length : 10} Market Giants Active`,
      badge: 'Live Market Field',
      badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
      accentColor: '#2563EB',
      metricLabel: 'Target Commercial KWs',
      metricValue: `${keywords.length} Tracked`,
      secondaryLabel: 'Page 1 Rankings',
      secondaryValue: `${pageOneKeywords} Queries`,
      description: 'The central search stock floor where commercial buyer queries resolve daily against Flutterwave, MTN, PwC, and Dangote Group.',
      primaryActionLabel: 'Inspect Search Rankings',
      primaryAction: () => {
        playSfx?.('click');
        onOpenCockpitTab('keywords');
      },
      secondaryActionLabel: 'Analyze Incumbents',
      secondaryAction: () => {
        playSfx?.('click');
        onOpenCockpitTab('competitors');
      }
    },
    {
      id: 'editorial_pavilion',
      name: 'Nexus Media & Editorial Pavilion',
      type: 'CONTENT_STUDIO',
      category: 'Contemporary Glass Publishing Hub',
      status: `${pages.length} URL Assets Deployed`,
      badge: 'Content & E-E-A-T',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      accentColor: '#D97706',
      metricLabel: 'Content Authority',
      metricValue: `${pages.length > 0 ? Math.round(pages.reduce((acc, p) => acc + (p.content_quality_score || 50), 0) / pages.length) : 50}/100`,
      secondaryLabel: 'Draft Pipeline',
      secondaryValue: `${pages.filter(p => !p.published_at).length} In Review`,
      description: 'High-depth research studio creating authoritative landing pages, comprehensive pillar articles, and E-E-A-T trust signals.',
      primaryActionLabel: 'Open Pages & Lifecycle',
      primaryAction: () => {
        playSfx?.('click');
        onOpenCockpitTab('lifecycle');
      },
      secondaryActionLabel: 'Draft New Landing Page',
      secondaryAction: () => {
        playSfx?.('click');
        onOpenCockpitTab('lifecycle');
      }
    },
    {
      id: 'infrastructure_datacenter',
      name: 'Horizon Tech & Crawl Infrastructure',
      type: 'TECH_CAMPUS',
      category: 'Data & Technical Audit Campus',
      status: 'Googlebot Crawler Sim Active',
      badge: 'Crawl & Indexing',
      badgeColor: 'bg-cyan-50 text-cyan-800 border-cyan-200',
      accentColor: '#0891B2',
      metricLabel: 'Technical Health',
      metricValue: `${pages.length > 0 ? Math.round(pages.reduce((acc, p) => acc + (p.technical_health_score || 50), 0) / pages.length) : 60}/100`,
      secondaryLabel: 'Indexation Rate',
      secondaryValue: `${pages.length > 0 ? Math.round((indexedCount / pages.length) * 100) : 0}%`,
      description: 'High-speed cloud servers managing robots.txt directives, Core Web Vitals, server response times, and indexation pipelines.',
      primaryActionLabel: 'Run Technical Audits',
      primaryAction: () => {
        playSfx?.('click');
        onOpenCockpitTab('actions');
      },
      secondaryActionLabel: 'Inspect Crawl Directives',
      secondaryAction: () => {
        playSfx?.('click');
        onOpenCockpitTab('lifecycle');
      }
    },
    {
      id: 'banking_capital_plaza',
      name: 'Broad Street Commercial Banking Plaza',
      type: 'FINANCIAL_PLAZA',
      category: 'Capital & Treasury Center',
      status: 'Daily Commercial Conversion',
      badge: 'Business Treasury',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
      accentColor: '#475569',
      metricLabel: 'Gross Deal Revenue',
      metricValue: `₦${(metrics?.revenue || 0).toLocaleString()}`,
      secondaryLabel: 'Customer Deals',
      secondaryValue: `${metrics?.customers || 0} Closed`,
      description: 'Commercial banking and investment center converting organic search clicks into enterprise leads and paying enterprise customers.',
      primaryActionLabel: 'Review Economics & Cash Flow',
      primaryAction: () => {
        playSfx?.('click');
        onOpenCockpitTab('business');
      },
      secondaryActionLabel: 'Executive Command Center',
      secondaryAction: () => {
        playSfx?.('click');
        onOpenCockpitTab('command_centre');
      }
    }
  ];

  const activeHub = districtHubs.find(h => h.id === selectedHub) || districtHubs[0];

  return (
    <div className="space-y-6">
      
      {/* 1. DISTRICT HERO HEADER & LIGHTING CONTROL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Victoria Commercial Island District</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700 font-semibold">Simulated Business World</span>
            <span aria-hidden="true">·</span>
            <span>{timeOfDay === 'day' ? 'High Daylight' : 'Golden Hour'} Horizon</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <span>Metropolitan Commercial District</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              Victoria Island Sector
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            A living commercial center. Inspect the Search Exchange, deploy editorial clusters from the Media Atrium, monitor tech crawlers, and visit your Agency Headquarters.
          </p>
        </div>

        {/* Ambient lighting toggles & quick transit */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => { setTimeOfDay('day'); playSfx?.('toggle'); }}
              className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer flex items-center gap-1.5 ${timeOfDay === 'day' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Daylight 12:00</span>
            </button>
            <button
              onClick={() => { setTimeOfDay('golden_hour'); playSfx?.('toggle'); }}
              className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer flex items-center gap-1.5 ${timeOfDay === 'golden_hour' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <Sunset className="w-3.5 h-3.5 text-orange-500" />
              <span>Afternoon 16:30</span>
            </button>
          </div>

          <button
            onClick={() => {
              playSfx?.('confirm');
              onEnterOffice();
            }}
            className="px-4 py-2 rounded-lg bg-[#18B892] hover:bg-[#149a7a] text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <Building2 className="w-4 h-4" />
            <span>Enter Agency Office</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. REALISTIC 2.5D ARCHITECTURAL ISOMETRIC DISTRICT CANVAS */}
      <div className={`relative rounded-3xl border border-slate-200 overflow-hidden shadow-md transition-colors duration-700 ${timeOfDay === 'day' ? 'bg-gradient-to-b from-sky-100 via-slate-100 to-slate-200' : 'bg-gradient-to-b from-amber-100/90 via-slate-100 to-slate-300'}`}>
        
        {/* Realistic Skyline Atmosphere Backdrop */}
        <div 
          className="absolute inset-0 opacity-[0.12] bg-cover bg-bottom pointer-events-none transition-opacity"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&auto=format&fit=crop&q=80')` }}
        />

        {/* Directional Sunlight Cone */}
        <div 
          className={`absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none transition-all duration-700 ${timeOfDay === 'day' ? 'bg-amber-200/35' : 'bg-orange-400/35'}`} 
        />

        {/* 2.5D Isometric Architecture SVG Viewport */}
        <div className="relative z-10 w-full min-h-[460px] sm:min-h-[520px] flex items-center justify-center p-3 sm:p-6">
          <svg 
            viewBox="0 0 1000 560" 
            className="w-full h-auto max-w-5xl filter drop-shadow-md select-none"
            style={{ shapeRendering: 'geometricPrecision' }}
          >
            <defs>
              {/* Dynamic Facade Gradients (Light vs Golden Hour) */}
              <linearGradient id="agencyGlassLight" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={timeOfDay === 'day' ? '#5EEAD4' : '#FDE68A'} stopOpacity="0.9" />
                <stop offset="40%" stopColor={timeOfDay === 'day' ? '#0F766E' : '#D97706'} stopOpacity="0.95" />
                <stop offset="100%" stopColor={timeOfDay === 'day' ? '#115E59' : '#92400E'} stopOpacity="0.98" />
              </linearGradient>

              <linearGradient id="exchangeGlassLight" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={timeOfDay === 'day' ? '#93C5FD' : '#FDBA74'} stopOpacity="0.9" />
                <stop offset="50%" stopColor={timeOfDay === 'day' ? '#2563EB' : '#C2410C'} stopOpacity="0.95" />
                <stop offset="100%" stopColor={timeOfDay === 'day' ? '#1E3A8A' : '#7C2D12'} stopOpacity="0.98" />
              </linearGradient>

              <linearGradient id="mediaGlassLight" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={timeOfDay === 'day' ? '#FDE68A' : '#FED7AA'} stopOpacity="0.9" />
                <stop offset="50%" stopColor={timeOfDay === 'day' ? '#D97706' : '#EA580C'} stopOpacity="0.95" />
                <stop offset="100%" stopColor={timeOfDay === 'day' ? '#78350F' : '#9A3412'} stopOpacity="0.98" />
              </linearGradient>

              <linearGradient id="techGlassLight" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={timeOfDay === 'day' ? '#67E8F9' : '#FCD34D'} stopOpacity="0.9" />
                <stop offset="50%" stopColor={timeOfDay === 'day' ? '#0891B2' : '#B45309'} stopOpacity="0.95" />
                <stop offset="100%" stopColor={timeOfDay === 'day' ? '#164E63' : '#78350F'} stopOpacity="0.98" />
              </linearGradient>

              <linearGradient id="bankStoneLight" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={timeOfDay === 'day' ? '#CBD5E1' : '#FDE68A'} stopOpacity="0.9" />
                <stop offset="50%" stopColor={timeOfDay === 'day' ? '#64748B' : '#B45309'} stopOpacity="0.95" />
                <stop offset="100%" stopColor={timeOfDay === 'day' ? '#334155' : '#78350F'} stopOpacity="0.98" />
              </linearGradient>

              {/* Plaza Stone & Asphalt */}
              <linearGradient id="plazaPavement" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={timeOfDay === 'day' ? '#E2E8F0' : '#E7DFD5'} />
                <stop offset="100%" stopColor={timeOfDay === 'day' ? '#CBD5E1' : '#D1C7BA'} />
              </linearGradient>

              <linearGradient id="asphaltRoadway" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="100%" stopColor="#1E293B" />
              </linearGradient>
            </defs>

            {/* 1. GROUND PLANE: Landscaped Commercial Plaza Base */}
            <polygon 
              points="500,50 970,260 500,520 30,260" 
              fill="url(#plazaPavement)" 
              stroke="#94A3B8" 
              strokeWidth="2" 
            />

            {/* Manicured Landscaping Lawns */}
            <polygon points="500,90 880,250 800,285 500,150" fill={timeOfDay === 'day' ? '#86EFAC' : '#A3E635'} fillOpacity="0.5" stroke="#4ADE80" strokeWidth="1" />
            <polygon points="500,90 120,250 200,285 500,150" fill={timeOfDay === 'day' ? '#86EFAC' : '#A3E635'} fillOpacity="0.5" stroke="#4ADE80" strokeWidth="1" />

            {/* Granite Paved Promenade Walkways */}
            <polygon points="460,260 540,260 580,360 420,360" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1" />
            
            {/* Water Feature / Reflection Basin with Fountain */}
            <ellipse cx="500" cy="310" rx="42" ry="18" fill="#0EA5E9" fillOpacity="0.45" stroke="#38BDF8" strokeWidth="1.5" />
            <ellipse cx="500" cy="310" rx="28" ry="12" fill="#38BDF8" fillOpacity="0.6" />
            <circle cx="500" cy="308" r="4" fill="#FFFFFF" />

            {/* Perimeter Roadways & Transit Corridors */}
            <polygon points="500,160 900,335 860,355 500,200" fill="url(#asphaltRoadway)" />
            <polygon points="500,160 100,335 140,355 500,200" fill="url(#asphaltRoadway)" />
            <polygon points="500,200 500,510 475,510 475,200" fill="#334155" fillOpacity="0.5" />

            {/* Roadway White Lane Markings */}
            <line x1="490" y1="200" x2="135" y2="345" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="6,8" strokeOpacity="0.9" />
            <line x1="510" y1="200" x2="865" y2="345" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="6,8" strokeOpacity="0.9" />

            {/* Pedestrian Crosswalks (Crisp Zebra Stripes) */}
            {[0, 1, 2, 3, 4].map(idx => (
              <line key={`cross-l-${idx}`} x1={260 + idx * 6} y1={290 - idx * 2} x2={275 + idx * 6} y2={305 - idx * 2} stroke="#FFFFFF" strokeWidth="2.5" strokeOpacity="0.85" />
            ))}
            {[0, 1, 2, 3, 4].map(idx => (
              <line key={`cross-r-${idx}`} x1={720 + idx * 6} y1={290 + idx * 2} x2={735 + idx * 6} y2={305 + idx * 2} stroke="#FFFFFF" strokeWidth="2.5" strokeOpacity="0.85" />
            ))}

            {/* ======================================================== */}
            {/* 2. PLAYER AGENCY TOWER (Apex Strategic Heights: Center-Left Anchor) */}
            {/* ======================================================== */}
            <g 
              className="cursor-pointer transition-transform hover:-translate-y-1.5 duration-200"
              onClick={() => {
                setSelectedHub('agency_hq');
                playSfx?.('click');
              }}
            >
              {/* Directional Cast Ground Shadow */}
              <ellipse 
                cx={timeOfDay === 'day' ? 370 : 395} 
                cy={timeOfDay === 'day' ? 335 : 345} 
                rx={timeOfDay === 'day' ? 85 : 110} 
                ry={timeOfDay === 'day' ? 26 : 30} 
                fill="#0F172A" 
                fillOpacity={timeOfDay === 'day' ? 0.25 : 0.35} 
              />

              {/* Concrete Podium Plinth with Canopy Entrance */}
              <polygon points="370,250 445,290 370,330 295,290" fill="#1E293B" stroke="#334155" strokeWidth="1" />
              {/* Glass Entrance Canopy */}
              <polygon points="350,285 390,305 370,315 330,295" fill="#5EEAD4" fillOpacity="0.6" stroke="#2DD4BF" strokeWidth="1" />

              {/* Tower Mid-Rise Section (Tier 1) */}
              <polygon points="305,285 370,320 370,140 305,110" fill="url(#agencyGlassLight)" stroke="#0F766E" strokeWidth="1" />
              <polygon points="370,320 435,285 435,105 370,140" fill="#115E59" stroke="#042F2E" strokeWidth="1" />

              {/* Recessed Architectural Spandrel Bands & Floor Slabs */}
              {[140, 165, 190, 215, 240, 265].map((y, i) => (
                <g key={`ag-fl-${i}`}>
                  <line x1="305" y1={y - 30} x2="370" y2={y} stroke="#CCFBF1" strokeWidth="1.2" strokeOpacity="0.75" />
                  <line x1="370" y1={y} x2="435" y2={y - 35} stroke="#14B8A6" strokeWidth="1.2" strokeOpacity="0.6" />
                </g>
              ))}

              {/* Vertical Mullion Ribs (Pinstripe Glass Depth) */}
              <line x1="325" y1="120" x2="325" y2="295" stroke="#FFFFFF" strokeWidth="0.8" strokeOpacity="0.4" />
              <line x1="350" y1="130" x2="350" y2="310" stroke="#FFFFFF" strokeWidth="0.8" strokeOpacity="0.4" />

              {/* Tower Penthouse Setback (Tier 2: Executive Crown) */}
              <polygon points="320,110 370,135 420,110 370,85" fill="#042F2E" stroke="#14B8A6" strokeWidth="1" />
              <polygon points="320,110 370,135 370,75 320,55" fill="url(#agencyGlassLight)" />
              <polygon points="370,135 420,110 420,50 370,75" fill="#134E4A" />

              {/* Rooftop Helipad / Communication Spire */}
              <polygon points="330,55 370,75 410,55 370,35" fill="#334155" stroke="#18B892" strokeWidth="1.5" />
              <ellipse cx="370" cy="55" rx="14" ry="7" fill="none" stroke="#F8FAFC" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="370" y1="35" x2="370" y2="8" stroke="#18B892" strokeWidth="2.5" />
              <circle cx="370" cy="8" r="3" fill="#10B981" />

              {/* Corporate Identity Badge */}
              <rect x="290" y="70" width="160" height="28" rx="6" fill="#0F172A" stroke="#18B892" strokeWidth="1.5" />
              <text x="370" y="88" fill="#F8FAFC" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">
                ★ {business?.name ? business.name.slice(0, 18) : 'Apex Strategic Agency'}
              </text>
            </g>

            {/* ======================================================== */}
            {/* 3. SEARCH MARKET EXCHANGE (Center-Right Financial Tower) */}
            {/* ======================================================== */}
            <g 
              className="cursor-pointer transition-transform hover:-translate-y-1.5 duration-200"
              onClick={() => {
                setSelectedHub('search_exchange');
                playSfx?.('click');
              }}
            >
              {/* Directional Cast Shadow */}
              <ellipse 
                cx={timeOfDay === 'day' ? 640 : 665} 
                cy={timeOfDay === 'day' ? 325 : 335} 
                rx={timeOfDay === 'day' ? 85 : 110} 
                ry={timeOfDay === 'day' ? 26 : 30} 
                fill="#0F172A" 
                fillOpacity={timeOfDay === 'day' ? 0.25 : 0.35} 
              />

              {/* Financial Exchange Base */}
              <polygon points="635,245 710,285 635,325 560,285" fill="#1E293B" />

              {/* Main Body (Left Facade) */}
              <polygon points="565,280 635,315 635,135 565,105" fill="url(#exchangeGlassLight)" stroke="#1D4ED8" strokeWidth="1" />
              {/* Main Body (Right Facade) */}
              <polygon points="635,315 705,280 705,100 635,135" fill="#172554" stroke="#1E3A8A" strokeWidth="1" />

              {/* Floor Slabs */}
              {[135, 160, 185, 210, 235, 260].map((y, i) => (
                <g key={`ex-fl-${i}`}>
                  <line x1="565" y1={y - 30} x2="635" y2={y} stroke="#BFDBFE" strokeWidth="1.2" strokeOpacity="0.7" />
                  <line x1="635" y1={y} x2="705" y2={y - 35} stroke="#3B82F6" strokeWidth="1.2" strokeOpacity="0.55" />
                </g>
              ))}

              {/* Real-time SERP Market Ticker Screen on Facade */}
              <rect x="580" y="175" width="50" height="14" fill="#0F172A" stroke="#3B82F6" strokeWidth="1" />
              <text x="605" y="185" fill="#60A5FA" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                SERP LIVE #1
              </text>

              {/* Roof Crown */}
              <polygon points="565,105 635,135 705,100 635,75" fill="#93C5FD" stroke="#3B82F6" strokeWidth="1" />
              <line x1="635" y1="75" x2="635" y2="45" stroke="#3B82F6" strokeWidth="2.5" />
              <circle cx="635" cy="45" r="3" fill="#60A5FA" />

              {/* Corporate Badge */}
              <rect x="560" y="75" width="150" height="26" rx="6" fill="#0F172A" stroke="#3B82F6" strokeWidth="1.5" />
              <text x="635" y="92" fill="#F8FAFC" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">
                Commercial Search Exchange
              </text>
            </g>

            {/* ======================================================== */}
            {/* 4. NEXUS MEDIA & EDITORIAL PAVILION (West Cluster) */}
            {/* ======================================================== */}
            <g 
              className="cursor-pointer transition-transform hover:-translate-y-1.5 duration-200"
              onClick={() => {
                setSelectedHub('editorial_pavilion');
                playSfx?.('click');
              }}
            >
              <ellipse cx="205" cy="250" rx="65" ry="20" fill="#0F172A" fillOpacity={timeOfDay === 'day' ? 0.22 : 0.3} />

              <polygon points="145,230 205,255 205,145 145,120" fill="url(#mediaGlassLight)" stroke="#D97706" strokeWidth="1" />
              <polygon points="205,255 265,230 265,120 205,145" fill="#78350F" stroke="#451A03" strokeWidth="1" />
              <polygon points="145,120 205,145 265,120 205,95" fill="#FDE68A" stroke="#F59E0B" strokeWidth="1" />

              {/* Tier 2 Terrace */}
              <polygon points="165,120 205,135 245,120 205,105" fill="#86EFAC" fillOpacity="0.8" />

              {[145, 175, 205].map((y, i) => (
                <line key={`me-l-${i}`} x1="145" y1={y - 25} x2="205" y2={y} stroke="#FEF3C7" strokeWidth="1" strokeOpacity="0.6" />
              ))}

              <rect x="135" y="80" width="140" height="24" rx="6" fill="#0F172A" stroke="#F59E0B" strokeWidth="1.5" />
              <text x="205" y="96" fill="#F8FAFC" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">
                Nexus Media Pavilion
              </text>
            </g>

            {/* ======================================================== */}
            {/* 5. HORIZON TECH CAMPUS (East Datacenter) */}
            {/* ======================================================== */}
            <g 
              className="cursor-pointer transition-transform hover:-translate-y-1.5 duration-200"
              onClick={() => {
                setSelectedHub('infrastructure_datacenter');
                playSfx?.('click');
              }}
            >
              <ellipse cx="795" cy="245" rx="65" ry="20" fill="#0F172A" fillOpacity={timeOfDay === 'day' ? 0.22 : 0.3} />

              <polygon points="735,225 795,250 795,140 735,115" fill="url(#techGlassLight)" stroke="#0891B2" strokeWidth="1" />
              <polygon points="795,250 855,225 855,115 795,140" fill="#164E63" stroke="#083344" strokeWidth="1" />
              <polygon points="735,115 795,140 855,115 795,90" fill="#A5F3FC" stroke="#06B6D4" strokeWidth="1" />

              {/* Pulsing Status Fiber Indicators */}
              <circle cx="770" cy="170" r="2.5" fill="#22D3EE" />
              <circle cx="770" cy="190" r="2.5" fill="#22D3EE" />
              <circle cx="770" cy="210" r="2.5" fill="#22D3EE" />

              <rect x="725" y="75" width="140" height="24" rx="6" fill="#0F172A" stroke="#06B6D4" strokeWidth="1.5" />
              <text x="795" y="91" fill="#F8FAFC" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">
                Horizon Tech Campus
              </text>
            </g>

            {/* ======================================================== */}
            {/* 6. BROAD STREET BANKING PLAZA (North Institutional Anchor) */}
            {/* ======================================================== */}
            <g 
              className="cursor-pointer transition-transform hover:-translate-y-1.5 duration-200"
              onClick={() => {
                setSelectedHub('banking_capital_plaza');
                playSfx?.('click');
              }}
            >
              <ellipse cx="500" cy="150" rx="60" ry="18" fill="#0F172A" fillOpacity={timeOfDay === 'day' ? 0.2 : 0.28} />

              {/* Stone Columns & Bank Facade */}
              <polygon points="455,135 500,155 500,75 455,55" fill="url(#bankStoneLight)" stroke="#475569" strokeWidth="1" />
              <polygon points="500,155 545,135 545,55 500,75" fill="#1E293B" stroke="#0F172A" strokeWidth="1" />
              <polygon points="455,55 500,75 545,55 500,38" fill="#E2E8F0" stroke="#64748B" strokeWidth="1" />

              <rect x="435" y="24" width="130" height="22" rx="5" fill="#0F172A" stroke="#64748B" strokeWidth="1" />
              <text x="500" y="39" fill="#F8FAFC" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">
                Commercial Banking Plaza
              </text>
            </g>

            {/* Plaza Landscaped Broadleaf & Palm Trees */}
            {[
              { cx: 330, cy: 380, r: 8 },
              { cx: 355, cy: 395, r: 9 },
              { cx: 645, cy: 380, r: 8 },
              { cx: 670, cy: 395, r: 9 },
              { cx: 470, cy: 405, r: 7 },
              { cx: 530, cy: 405, r: 7 },
              { cx: 240, cy: 295, r: 7 },
              { cx: 760, cy: 295, r: 7 },
            ].map((t, idx) => (
              <g key={`tree-foliage-${idx}`}>
                <ellipse cx={t.cx} cy={t.cy + 6} rx={t.r * 1.1} ry={t.r * 0.45} fill="#0F172A" fillOpacity="0.28" />
                <circle cx={t.cx} cy={t.cy} r={t.r} fill="#15803D" />
                <circle cx={t.cx - 2} cy={t.cy - 2} r={t.r * 0.75} fill="#22C55E" fillOpacity="0.75" />
              </g>
            ))}

            {/* Scale-Accurate Executive Sedans & Transit Vehicles */}
            <g>
              {/* Executive Black Sedan moving right */}
              <rect x="375" y="275" width="20" height="9" rx="2" fill="#0F172A" />
              <rect x="380" y="276" width="10" height="7" rx="1" fill="#38BDF8" fillOpacity="0.8" />
              {/* Corporate Silver SUV moving left */}
              <rect x="670" y="275" width="22" height="10" rx="2" fill="#94A3B8" />
              <rect x="675" y="276" width="12" height="8" rx="1" fill="#1E293B" />
              {/* Red Executive Coupe */}
              <rect x="525" y="445" width="18" height="9" rx="2" fill="#BE123C" />
            </g>

            {/* Subtle Pedestrian Silhouettes */}
            {[
              { x: 440, y: 340 },
              { x: 450, y: 345 },
              { x: 560, y: 340 },
              { x: 570, y: 345 },
              { x: 380, y: 345 },
            ].map((p, idx) => (
              <g key={`pedestrian-${idx}`}>
                <circle cx={p.x} cy={p.y} r="1.8" fill="#1E293B" />
                <line x1={p.x} y1={p.y + 1.8} x2={p.x} y2={p.y + 7} stroke="#1E293B" strokeWidth="1.5" />
              </g>
            ))}

          </svg>
        </div>

        {/* Dynamic District Status Bar at Bottom */}
        <div className="relative z-10 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-white p-3.5 px-6 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#18B892] animate-pulse" />
            <span className="font-bold text-slate-100">Live District Telemetry:</span>
            <span className="text-slate-300">
              {competitors.length > 0 ? competitors.length : 10} corporate domains active · Googlebot crawler simulation live · Turn advances 24h
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-300 font-mono text-[11px]">
            <span>Commercial Real Estate: Grade-A Central Anchor</span>
            <span className="text-slate-600">|</span>
            <span>Broad Street Exchange: Open</span>
          </div>
        </div>

      </div>

      {/* 3. SELECTED DISTRICT HUB DOSSIER CARD */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${activeHub.badgeColor}`}>
                {activeHub.badge}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {activeHub.category}
              </span>
            </div>

            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              {activeHub.name}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
              {activeHub.description}
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
            <button
              onClick={activeHub.primaryAction}
              className="py-2.5 px-4 rounded-xl bg-[#18B892] hover:bg-[#149a7a] text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <span>{activeHub.primaryActionLabel}</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={activeHub.secondaryAction}
              className="py-2 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>{activeHub.secondaryActionLabel}</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Grid for this Hub */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
              {activeHub.metricLabel}
            </span>
            <strong className="text-base sm:text-lg font-bold text-slate-900 block">
              {activeHub.metricValue}
            </strong>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
              {activeHub.secondaryLabel}
            </span>
            <strong className="text-base sm:text-lg font-bold text-slate-900 block">
              {activeHub.secondaryValue}
            </strong>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
              Facility Status
            </span>
            <strong className="text-xs sm:text-sm font-semibold text-emerald-700 block truncate">
              {activeHub.status}
            </strong>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
              Primary Role
            </span>
            <span className="text-xs font-medium text-slate-700 block truncate">
              {activeHub.id === 'agency_hq' ? 'Executive Agency Command' : activeHub.id === 'search_exchange' ? 'Algorithmic SERP Resolution' : 'Operational Production'}
            </span>
          </div>
        </div>

      </div>

      {/* 4. REAL-WORLD COMMERCIAL DISTRICT NEIGHBORS (PwC, Flutterwave, MTN, Dangote) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#18B892]" />
              <span>Real Market Incumbents in This Commercial Zone</span>
            </h4>
            <p className="text-xs text-slate-500">
              Authentic enterprises with established digital authority operating in your simulated sector.
            </p>
          </div>

          <button
            onClick={() => onOpenCockpitTab('competitors')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Market Incumbents</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {Object.values(REAL_BRANDS).slice(0, 4).map(brand => (
            <div 
              key={brand.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-sm transition space-y-2 text-left"
            >
              <div className="flex items-center justify-between">
                <CompanyLogo name={brand.name} domain={brand.domain} size="md" />
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold">
                  DA {brand.baselineAuthority}
                </span>
              </div>
              <div>
                <strong className="text-xs font-bold text-slate-900 block truncate">
                  {brand.name}
                </strong>
                <span className="text-[11px] text-slate-500 block truncate">
                  {brand.domain}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                {brand.simulatedStrategy}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
