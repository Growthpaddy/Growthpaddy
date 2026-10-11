import React, { useState } from 'react';
import { 
  X, 
  Monitor, 
  Search, 
  FileText, 
  Zap, 
  Coins, 
  Cpu, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight, 
  Calendar, 
  TrendingUp, 
  Layers, 
  BarChart3, 
  Loader2, 
  Plus, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Building2,
  DollarSign
} from 'lucide-react';
import { CANONICAL_ACTION_TYPES } from '../../../lib/seo-game/actionTypes';

interface SEOWorkstationModalProps {
  isOpen: boolean;
  onClose: () => void;
  dashboard: any;
  selectedPageId: string | null;
  onSelectPageId: (id: string) => void;
  onTriggerAction: (actionCode: string, payload?: any) => Promise<void>;
  onPublishPage: (pageId: string) => Promise<void>;
  onToggleRobots: (pageId: string, allowIndex: boolean) => Promise<void>;
  onAdvanceDay: () => Promise<void>;
  onCreateNewPage: (title: string) => Promise<void>;
  isProcessingAction: string | null;
  isAdvancingDay: boolean;
  playSfx?: (type: 'click' | 'confirm' | 'workstation' | 'day_advance') => void;
}

export function SEOWorkstationModal({
  isOpen,
  onClose,
  dashboard,
  selectedPageId,
  onSelectPageId,
  onTriggerAction,
  onPublishPage,
  onToggleRobots,
  onAdvanceDay,
  onCreateNewPage,
  isProcessingAction,
  isAdvancingDay,
  playSfx
}: SEOWorkstationModalProps) {
  const [activeTab, setActiveTab] = useState<'pages' | 'keywords' | 'audit' | 'serp' | 'operations'>('pages');
  const [newPageTitle, setNewPageTitle] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (!isOpen || !dashboard) return null;

  const { player, business, website, wallet, pages = [], keywords = [], competitors = [], metrics } = dashboard;
  const activePage = pages.find((p: any) => p.id === selectedPageId) || pages[0];

  const handleTabSwitch = (tab: typeof activeTab) => {
    playSfx?.('click');
    setActiveTab(tab);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden text-slate-100"
        onClick={e => e.stopPropagation()}
      >
        {/* 1. TOP DUAL-MONITOR RIG HEADER */}
        <div className="h-16 px-6 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[#18B892] flex items-center justify-center">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white tracking-wide">
                  SEO Specialist Executive Terminal
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ONLINE · DAY {player?.current_day || 1}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {business?.name || 'Apex Strategic Digital'} · {website?.domain || 'omnicorp-seo.com'}
              </p>
            </div>
          </div>

          {/* Quick Resource Ledger HUD */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-amber-300">
              <Coins className="w-3.5 h-3.5" />
              <span>{wallet?.coins ?? 1000}</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-cyan-300">
              <Zap className="w-3.5 h-3.5" />
              <span>{wallet?.energy ?? 100}/{wallet?.max_energy ?? 100}</span>
            </div>
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-indigo-300">
              <Cpu className="w-3.5 h-3.5" />
              <span>{wallet?.ai_credits ?? 100} AI</span>
            </div>

            <button
              onClick={() => {
                playSfx?.('click');
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="Return to 3D Office Environment"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. OPERATIONAL TABS NAVIGATION */}
        <div className="px-6 py-2 border-b border-slate-800/80 bg-slate-900/60 flex items-center gap-2 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => handleTabSwitch('pages')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'pages' 
                ? 'bg-[#18B892] text-slate-950 font-bold shadow-md' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>1. Website & Pages ({pages.length})</span>
          </button>

          <button
            onClick={() => handleTabSwitch('keywords')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'keywords' 
                ? 'bg-[#18B892] text-slate-950 font-bold shadow-md' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>2. Keyword Research ({keywords.length})</span>
          </button>

          <button
            onClick={() => handleTabSwitch('audit')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'audit' 
                ? 'bg-[#18B892] text-slate-950 font-bold shadow-md' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>3. Technical SEO & Optimizations</span>
          </button>

          <button
            onClick={() => handleTabSwitch('serp')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'serp' 
                ? 'bg-[#18B892] text-slate-950 font-bold shadow-md' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>4. SERP Arena & Competitors</span>
          </button>

          <button
            onClick={() => handleTabSwitch('operations')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'operations' 
                ? 'bg-[#18B892] text-slate-950 font-bold shadow-md' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>5. Financial Funnel & Day Advance</span>
          </button>
        </div>

        {/* 3. TAB WORKSPACE PANELS */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 1: WEBSITE & PAGES */}
          {activeTab === 'pages' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-base text-white">Content Architecture & Indexing Lifecycle</h4>
                  <p className="text-xs text-slate-400">
                    Draft, publish, and inspect robots directives to ensure pages achieve Google indexation.
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="py-2 px-3.5 rounded-xl bg-[#18B892] hover:bg-[#15a381] text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Draft New Page (5 En, ₦75)</span>
                </button>
              </div>

              {/* Pages Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pages.map((p: any) => (
                  <div 
                    key={p.id}
                    onClick={() => onSelectPageId(p.id)}
                    className={`p-4 rounded-2xl border transition cursor-pointer ${
                      selectedPageId === p.id 
                        ? 'bg-slate-800/90 border-[#18B892] shadow-lg shadow-[#18B892]/10' 
                        : 'bg-slate-800/40 border-slate-700/80 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-white line-clamp-1">{p.title}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        p.indexed ? 'bg-emerald-500/20 text-emerald-400' :
                        p.published_at ? 'bg-amber-500/20 text-amber-400' :
                        'bg-slate-700 text-slate-300'
                      }`}>
                        {p.indexed ? 'INDEXED' : p.published_at ? 'PUBLISHED' : 'DRAFT'}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-400 font-mono mb-4">
                      <div className="flex justify-between">
                        <span>Quality Score:</span>
                        <span className="text-white font-bold">{p.content_quality_score || 50}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Page Speed:</span>
                        <span className="text-white font-bold">{p.page_speed_score || 50}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Robots Directive:</span>
                        <span className={p.robots_index ? 'text-emerald-400' : 'text-rose-400'}>
                          {p.robots_index ? 'ALLOW INDEX' : 'NOINDEX BLOCKED'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-700/60">
                      {!p.published_at ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onPublishPage(p.id);
                          }}
                          className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer"
                        >
                          Publish Page
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleRobots(p.id, !p.robots_index);
                          }}
                          className={`w-full py-1.5 px-3 rounded-lg font-bold text-xs transition cursor-pointer ${
                            p.robots_index 
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30' 
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                          }`}
                        >
                          {p.robots_index ? 'Set Noindex (Test)' : 'Enable Indexing'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: KEYWORD RESEARCH */}
          {activeTab === 'keywords' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-base text-white">Target Keyword Portfolio</h4>
                  <p className="text-xs text-slate-400">
                    High-intent search queries monitored daily in the simulated search index.
                  </p>
                </div>
                <button
                  onClick={() => onTriggerAction('KEYWORD_RESEARCH')}
                  disabled={Boolean(isProcessingAction)}
                  className="py-2 px-3.5 rounded-xl bg-[#18B892] hover:bg-[#15a381] text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  <Search className="w-4 h-4" />
                  <span>Execute Keyword Research (3 En, ₦25)</span>
                </button>
              </div>

              <div className="rounded-2xl border border-slate-700/80 overflow-hidden bg-slate-950/60">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-800 text-slate-300 border-b border-slate-700">
                    <tr>
                      <th className="py-3 px-4">Keyword Query</th>
                      <th className="py-3 px-4">Search Volume</th>
                      <th className="py-3 px-4">Difficulty</th>
                      <th className="py-3 px-4">Commercial Intent</th>
                      <th className="py-3 px-4 text-right">Current Position</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {keywords.map((k: any) => (
                      <tr key={k.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-bold text-white">{k.keyword}</td>
                        <td className="py-3 px-4 text-slate-300">{k.search_volume?.toLocaleString() || 1200} / mo</td>
                        <td className="py-3 px-4 text-amber-400">{k.difficulty || 45}/100</td>
                        <td className="py-3 px-4 text-cyan-400 font-semibold">{k.intent || 'Commercial'}</td>
                        <td className="py-3 px-4 text-right">
                          <span className={`px-2 py-0.5 rounded font-bold ${
                            k.current_position && k.current_position <= 3 ? 'bg-emerald-500/20 text-emerald-400' :
                            k.current_position && k.current_position <= 10 ? 'bg-blue-500/20 text-blue-400' :
                            'bg-slate-800 text-slate-400'
                          }`}>
                            {k.current_position ? `#${k.current_position}` : 'Unranked'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: TECHNICAL SEO & OPTIMIZATION ACTIONS */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-base text-white">Direct SEO Operations Suite</h4>
                <p className="text-xs text-slate-400">
                  Execute server-authoritative optimizations to lift algorithm scores across the 10-factor ranking matrix.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    code: 'TECHNICAL_AUDIT',
                    title: 'Run Technical SEO Audit',
                    desc: 'Eliminate crawl bottlenecks, 404s, speed issues, and rendering latency.',
                    cost: '8 Energy · ₦100 · 10 AI',
                    reward: '+75 XP',
                    actionLabel: 'Execute Audit'
                  },
                  {
                    code: 'OPTIMIZE_PAGE',
                    title: 'Optimize Content & Intent',
                    desc: 'Enhance E-E-A-T signals, meta tags, and semantic query alignment.',
                    cost: '4 Energy · ₦60 · 5 AI',
                    reward: '+40 XP',
                    actionLabel: 'Optimize Page'
                  },
                  {
                    code: 'INTERNAL_LINKING',
                    title: 'Build Contextual Internal Links',
                    desc: 'Distribute PageRank across high-priority commercial target silos.',
                    cost: '3 Energy · ₦40 · 0 AI',
                    reward: '+30 XP',
                    actionLabel: 'Link Silo'
                  },
                  {
                    code: 'CONTENT_EXPANSION',
                    title: 'Topical Content Expansion',
                    desc: 'Add comprehensive subtopics and subject matter authority depth.',
                    cost: '7 Energy · ₦120 · 10 AI',
                    reward: '+90 XP',
                    actionLabel: 'Expand Content'
                  },
                  {
                    code: 'AUTHORITY_CAMPAIGN',
                    title: 'High-Trust Authority Campaign',
                    desc: 'Acquire high-quality editorial links from recognized referring domains.',
                    cost: '10 Energy · ₦250 · 5 AI',
                    reward: '+125 XP',
                    actionLabel: 'Launch Campaign'
                  },
                  {
                    code: 'AI_VISIBILITY_ANALYSIS',
                    title: 'Generative AI Citation Simulation',
                    desc: 'Optimize entity salience for generative engine citations and LLM answers.',
                    cost: '8 Energy · ₦150 · 15 AI',
                    reward: '+100 XP',
                    actionLabel: 'Simulate AI Citations'
                  }
                ].map(action => (
                  <div key={action.code} className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <h5 className="font-bold text-sm text-white">{action.title}</h5>
                      <p className="text-xs text-slate-400">{action.desc}</p>
                      <div className="flex items-center justify-between text-[11px] font-mono pt-1 text-slate-300">
                        <span className="text-emerald-400">{action.cost}</span>
                        <span className="text-cyan-400 font-bold">{action.reward}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onTriggerAction(action.code, { pageId: activePage?.id })}
                      disabled={Boolean(isProcessingAction)}
                      className="w-full py-2 px-3 rounded-xl bg-[#18B892] hover:bg-[#15a381] text-slate-950 font-bold text-xs tracking-wider transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      {isProcessingAction === action.code ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <span>{action.actionLabel}</span>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SERP ARENA & COMPETITORS */}
          {activeTab === 'serp' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-base text-white">Market Incumbents & Competitor Tracking</h4>
                <p className="text-xs text-slate-400">
                  Daily simulated search results and competitor movements across your tracked keywords.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {competitors.map((comp: any) => (
                  <div key={comp.id || comp.name} className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-sm text-white">{comp.name}</h5>
                      <p className="text-xs text-slate-400 font-mono">{comp.domain}</p>
                      <span className="text-[10px] text-cyan-400 font-mono mt-1 block">
                        Authority: {comp.authority_score || 55}/100 · Market Share: {comp.market_share || 15}%
                      </span>
                    </div>
                    <span className="text-xs font-mono px-3 py-1 rounded-xl bg-slate-900 border border-slate-700 text-slate-300">
                      INCUMBENT
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: FINANCIAL FUNNEL & ADVANCE DAY */}
          {activeTab === 'operations' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-base text-white">Daily Simulation Engine (Day Advance)</h4>
                  <p className="text-xs text-slate-400 max-w-xl mt-1">
                    Advancing to Day {(player?.current_day || 1) + 1} executes the search crawler, recalculates rankings, distributes impressions, delivers organic traffic, and collects client retainers.
                  </p>
                </div>
                <button
                  onClick={onAdvanceDay}
                  disabled={isAdvancingDay}
                  className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-[#18B892] hover:bg-[#15a381] text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-[#18B892]/25 transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isAdvancingDay ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Simulating Search Market...</span>
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" />
                      <span>ADVANCE BUSINESS DAY</span>
                    </>
                  )}
                </button>
              </div>

              {/* Financial Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Working Capital</span>
                  <span className="text-xl font-bold text-emerald-400 font-mono">
                    ₦{(business?.current_budget || 500000).toLocaleString()}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Daily Search Clicks</span>
                  <span className="text-xl font-bold text-white font-mono">
                    {metrics?.dailyClicks || 0} Clicks
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Commercial Leads</span>
                  <span className="text-xl font-bold text-cyan-400 font-mono">
                    {metrics?.dailyLeads || 0} Leads
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700">
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Client Revenue</span>
                  <span className="text-xl font-bold text-amber-400 font-mono">
                    ₦{(metrics?.grossRevenue || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* 4. MODAL FOOTER */}
        <div className="h-14 px-6 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Authoritative PostgreSQL Database Sync Enabled</span>
          <button
            onClick={() => {
              playSfx?.('click');
              onClose();
            }}
            className="text-slate-300 hover:text-white transition cursor-pointer"
          >
            Close Terminal (Esc)
          </button>
        </div>

      </div>

      {/* DRAFT PAGE SUB-MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="max-w-md w-full p-6 rounded-3xl bg-slate-900 border border-slate-700 space-y-4">
            <h4 className="font-bold text-base text-white">Publish New Page Draft</h4>
            <input
              type="text"
              value={newPageTitle}
              onChange={e => setNewPageTitle(e.target.value)}
              placeholder="e.g. Enterprise SEO Consulting Services"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-[#18B892]"
            />
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-1/2 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (newPageTitle.trim()) {
                    await onCreateNewPage(newPageTitle.trim());
                    setNewPageTitle('');
                    setShowCreateModal(false);
                  }
                }}
                className="w-1/2 py-2 rounded-xl bg-[#18B892] text-slate-950 text-xs font-bold"
              >
                Create Page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
