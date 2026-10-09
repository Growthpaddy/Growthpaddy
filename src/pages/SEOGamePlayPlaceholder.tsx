import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Gamepad2, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles,
  Coins,
  Zap,
  Shield,
  Loader2,
  Building2,
  Lock,
  Search,
  FileText,
  Sliders,
  Wrench,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Cpu,
  BarChart3,
  Flame,
  Award,
  Globe,
  Radio,
  Eye,
  Check,
  X,
  Calendar,
  Layers,
  ArrowUpRight,
  Users,
  Briefcase,
  RefreshCw,
  ExternalLink,
  Target,
  Compass,
  Newspaper,
  DollarSign,
  PieChart,
  Info,
  Scale
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { PageType } from '../types';
import { 
  processGameAction, 
  GameActionResult, 
  CANONICAL_ACTION_TYPES,
  fetchDashboardData,
  publishPage,
  toggleRobotsDirective,
  crawlPage,
  assignKeyword,
  simulateSerp,
  advanceDay
} from '../lib/seo-game/gameEngine';
import { 
  calculatePagePotential, 
  PagePotentialResult, 
  RankingFactors,
  RANKING_FACTOR_DEFINITIONS,
  RankingFactorKey
} from '../lib/seo-game/rankingScoringEngine';
import { LIFECYCLE_STAGES, PageLifecycleInfo } from '../lib/seo-game/lifecycleEngine';
import { 
  CompanyLogo, 
  EXECUTIVE_ADVISORS, 
  ExecutiveAvatar, 
  REAL_BRANDS, 
  findRealBrand 
} from '../lib/seo-game/brandAssets';
import { 
  analyzeStrategicSituation, 
  StrategicTradeOff, 
  StrategicRecommendation 
} from '../lib/seo-game/strategicAdvisory';

interface SEOGamePlayPlaceholderProps {
  userName?: string;
  userEmail?: string;
  isLoggedIn: boolean;
  navigateToPage: (page: PageType) => void;
  onOpenSignIn: () => void;
}

export default function SEOGamePlayPlaceholder({
  userName,
  userEmail,
  isLoggedIn,
  navigateToPage,
  onOpenSignIn
}: SEOGamePlayPlaceholderProps) {
  // Authentication & Dashboard State
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [dashboard, setDashboard] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'command_centre' | 'lifecycle' | 'keywords' | 'competitors' | 'events' | 'actions' | 'business'>('command_centre');

  // Selected entities for deep views
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [activeSerpSimulation, setActiveSerpSimulation] = useState<any | null>(null);
  const [daySummaryModal, setDaySummaryModal] = useState<any | null>(null);

  // Modals & Action Controls
  const [isProcessingAction, setIsProcessingAction] = useState<string | null>(null);
  const [isAdvancingDay, setIsAdvancingDay] = useState(false);
  const [actionNotice, setActionNotice] = useState<{
    type: 'success' | 'error';
    title: string;
    message: string;
    impact?: string;
  } | null>(null);

  // New page draft modal
  const [showCreatePageModal, setShowCreatePageModal] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [assignKeywordModalPageId, setAssignKeywordModalPageId] = useState<string | null>(null);

  // Flash sequence animation
  const [flashStep, setFlashStep] = useState<number>(1);
  const [flashComplete, setFlashComplete] = useState<boolean>(false);

  // Load authoritative game dashboard data from server
  const loadDashboardState = useCallback(async () => {
    try {
      const data = await fetchDashboardData();
      if (data?.success) {
        setDashboard(data);
        if (!selectedPageId && data.pages?.length > 0) {
          setSelectedPageId(data.pages[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  }, [selectedPageId]);

  useEffect(() => {
    let isMounted = true;

    async function verifyAndInitialize() {
      setCheckingAuth(true);
      try {
        const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
        const currentSession = sessionData?.session;

        if (sessionErr || !currentSession?.user) {
          if (isMounted) {
            setAuthError(true);
            setCheckingAuth(false);
            onOpenSignIn();
          }
          return;
        }

        const data = await fetchDashboardData();
        if (isMounted && data?.success) {
          setDashboard(data);
          if (data.pages?.length > 0) {
            setSelectedPageId(data.pages[0].id);
          }
        }
        if (isMounted) setCheckingAuth(false);
      } catch (err) {
        console.error('Initial verification error:', err);
        if (isMounted) {
          setAuthError(true);
          setCheckingAuth(false);
          onOpenSignIn();
        }
      }
    }

    verifyAndInitialize();

    return () => {
      isMounted = false;
    };
  }, [onOpenSignIn]);

  // Flash sequence timing
  useEffect(() => {
    if (checkingAuth || authError) return;

    const t1 = setTimeout(() => setFlashStep(2), 500);
    const t2 = setTimeout(() => setFlashStep(3), 1000);
    const t3 = setTimeout(() => setFlashStep(4), 1500);
    const t4 = setTimeout(() => {
      setFlashStep(5);
      setFlashComplete(true);
    }, 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [checkingAuth, authError]);

  // 1. Trigger Canonical Action
  async function handleTriggerAction(actionCode: string, payload: any = {}) {
    if (!dashboard?.player?.id) return;
    setIsProcessingAction(actionCode);
    setActionNotice(null);

    try {
      const result: GameActionResult = await processGameAction({
        playerId: dashboard.player.id,
        actionCode,
        businessId: dashboard.business?.id,
        websiteId: dashboard.website?.id,
        pageId: selectedPageId || dashboard.pages?.[0]?.id,
        payload
      });

      if (result.success) {
        await loadDashboardState();
        setActionNotice({
          type: 'success',
          title: result.feedback.title,
          message: result.feedback.summary,
          impact: result.feedback.impact
        });
      } else {
        setActionNotice({
          type: 'error',
          title: result.feedback.title || 'Action Rejected',
          message: result.feedback.summary || result.error || 'Failed to execute action.',
          impact: result.deficit 
            ? `Energy: ${result.deficit.energyAvailable}/${result.deficit.energyNeeded} · Coins: ${result.deficit.coinsAvailable}/${result.deficit.coinsNeeded}`
            : undefined
        });
      }
    } catch (err: any) {
      setActionNotice({
        type: 'error',
        title: 'Execution Error',
        message: err.message || 'Error occurred.'
      });
    } finally {
      setIsProcessingAction(null);
    }
  }

  // 2. Publish Page
  async function handlePublish(pageId: string) {
    setIsProcessingAction(`publish-${pageId}`);
    try {
      const res = await publishPage(pageId);
      if (res?.success) {
        await loadDashboardState();
        setActionNotice({
          type: 'success',
          title: 'Page Published!',
          message: res.message || 'Page is live on the web and queued for crawler discovery.'
        });
      } else {
        setActionNotice({
          type: 'error',
          title: 'Publish Failed',
          message: res.message || 'Unable to publish page.'
        });
      }
    } catch (err: any) {
      setActionNotice({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setIsProcessingAction(null);
    }
  }

  // 3. Toggle Robots Directives (Test Noindex)
  async function handleToggleRobots(pageId: string, currentAllow: boolean) {
    setIsProcessingAction(`robots-${pageId}`);
    try {
      const res = await toggleRobotsDirective(pageId, !currentAllow);
      if (res?.success) {
        await loadDashboardState();
        setActionNotice({
          type: 'success',
          title: 'Robots Directive Updated',
          message: res.message || 'Updated meta robots directive.'
        });
      } else {
        setActionNotice({ type: 'error', title: 'Failed', message: res.message || 'Failed to toggle robots directive.' });
      }
    } catch (err: any) {
      setActionNotice({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setIsProcessingAction(null);
    }
  }

  // 4. Crawl Page Inspection
  async function handleCrawlInspection(pageId: string) {
    setIsProcessingAction(`crawl-${pageId}`);
    try {
      const res = await crawlPage(pageId);
      if (res?.success) {
        await loadDashboardState();
        const lc = res.lifecycle;
        setActionNotice({
          type: lc.status === 'crawl_blocked' || lc.status === 'evaluation_failed' ? 'error' : 'success',
          title: lc.statusHeadline,
          message: lc.statusDescription,
          impact: lc.failureReason ? `Failure Gate: ${lc.failureReason}` : `Current State: ${lc.stageLabel}`
        });
      } else {
        setActionNotice({ type: 'error', title: 'Crawl Inspection Failed', message: res.message || 'Could not crawl page.' });
      }
    } catch (err: any) {
      setActionNotice({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setIsProcessingAction(null);
    }
  }

  // 5. Assign Keyword
  async function handleAssignKeyword(pageId: string, keywordId: string) {
    setIsProcessingAction(`assign-${pageId}`);
    try {
      const res = await assignKeyword(pageId, keywordId);
      if (res?.success) {
        setAssignKeywordModalPageId(null);
        await loadDashboardState();
        setActionNotice({
          type: 'success',
          title: 'Keyword Target Assigned',
          message: res.message || 'Page is now primary target for search query.'
        });
      } else {
        setActionNotice({ type: 'error', title: 'Assignment Failed', message: res.message || 'Could not assign keyword.' });
      }
    } catch (err: any) {
      setActionNotice({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setIsProcessingAction(null);
    }
  }

  // 6. Simulate Google SERP
  async function handleSimulateSerp(keywordId: string) {
    setIsProcessingAction(`serp-${keywordId}`);
    try {
      const res = await simulateSerp(keywordId);
      if (res?.success) {
        await loadDashboardState();
        setActiveSerpSimulation(res.outcome);
      } else {
        setActionNotice({
          type: 'error',
          title: 'SERP Simulation Ineligible',
          message: res.message || 'Target page must be indexed before competing in search results.'
        });
      }
    } catch (err: any) {
      setActionNotice({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setIsProcessingAction(null);
    }
  }

  // 7. Advance Business Day
  async function handleAdvanceDay() {
    setIsAdvancingDay(true);
    setActionNotice(null);
    try {
      const res = await advanceDay();
      if (res?.success) {
        await loadDashboardState();
        setDaySummaryModal(res.summary);
      } else {
        setActionNotice({
          type: 'error',
          title: 'Day Advance Failed',
          message: res.message || 'Could not advance to next business day.'
        });
      }
    } catch (err: any) {
      setActionNotice({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setIsAdvancingDay(false);
    }
  }

  // Handle create page form submission
  async function handleCreatePageSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newPageTitle.trim()) return;
    setShowCreatePageModal(false);
    await handleTriggerAction('CREATE_PAGE', { pageTitle: newPageTitle.trim() });
    setNewPageTitle('');
  }

  // Convenience accessors
  const player = dashboard?.player;
  const wallet = dashboard?.wallet;
  const business = dashboard?.business;
  const website = dashboard?.website;
  const pages: any[] = dashboard?.pages || [];
  const keywords: any[] = dashboard?.keywords || [];
  const competitors: any[] = dashboard?.competitors || [];
  const metrics = dashboard?.metrics;
  const playerState = dashboard?.playerState;
  const missions: any[] = dashboard?.missions || [];
  const events: any[] = dashboard?.events || [];
  const competitorActions: any[] = dashboard?.competitorActions || [];

  // Selected page 10-factor breakdown
  const selectedPage = pages.find(p => p.id === selectedPageId) || pages[0];
  const selectedPotential: PagePotentialResult | null = useMemo(() => {
    if (!selectedPage?.rankingFactors) return null;
    return calculatePagePotential(selectedPage.rankingFactors);
  }, [selectedPage]);

  // Strategic Situation Analysis
  const strategicAnalysis = useMemo(() => {
    return analyzeStrategicSituation({
      pages,
      keywords,
      metrics,
      wallet,
      business,
      competitors,
      currentDay: player?.current_day || 1
    });
  }, [pages, keywords, metrics, wallet, business, competitors, player?.current_day]);

  // Loading state
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-slate-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 text-[#18B892] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <div className="space-y-2">
            <h3 className="font-display font-black text-xl text-slate-900 tracking-tight">Loading Business HQ</h3>
            <p className="text-sm text-slate-500">Connecting to authoritative PostgreSQL session...</p>
          </div>
        </div>
      </div>
    );
  }

  // Auth Error Screen
  if (authError || !isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-slate-200 shadow-xl text-center space-y-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h3 className="font-display font-black text-xl text-slate-900">Protected Simulation Workspace</h3>
            <p className="text-sm text-slate-500">
              Authentication is required to access your company dashboard, resource wallets, and ranking records.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <button
              onClick={onOpenSignIn}
              className="w-full py-3 px-6 rounded-xl bg-[#18B892] hover:bg-[#149a7a] text-white font-bold text-sm tracking-wide transition shadow-md shadow-[#18B892]/20 cursor-pointer"
            >
              Sign In to Resume Game
            </button>
            <button
              onClick={() => navigateToPage('seo-game')}
              className="w-full py-2.5 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              Back to Game Overview
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Flash Sequence Transition
  if (!flashComplete) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-slate-200 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 text-[#18B892] flex items-center justify-center">
            <Sparkles className="w-8 h-8 animate-bounce" />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-mono text-emerald-600 font-bold uppercase tracking-widest block">
              INITIALIZING SIMULATION ENVIRONMENT
            </span>
            <h3 className="font-display font-black text-xl text-slate-900 tracking-tight">
              {flashStep === 1 && "Authenticating Executive Credentials..."}
              {flashStep === 2 && "Synchronizing Market Incumbents & Competitors..."}
              {flashStep === 3 && "Loading 10-Factor Search Algorithm Matrix..."}
              {flashStep >= 4 && "Entering Business Command Centre..."}
            </h3>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-[#18B892] h-full transition-all duration-300"
              style={{ width: `${(flashStep / 4) * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans flex flex-col antialiased">
      
      {/* 1. TOP EXECUTIVE COMMAND BAR (Restrained Dark Contrast Surface) */}
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          
          {/* Left: Brand Identity & Domain */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateToPage('seo-game')}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">Lobby</span>
            </button>
            <div className="h-4 w-px bg-slate-700 hidden sm:block" />
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#18B892]" />
              <span className="text-xs font-bold text-white tracking-wide truncate max-w-[140px] sm:max-w-none">
                {business?.name || 'OmniCorp SEO'}
              </span>
              <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
                ({website?.domain || 'omnicorp-seo.com'})
              </span>
            </div>
          </div>

          {/* Center: Live Day Counter & Advance Button */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">DAY</span>
              <span className="text-white font-bold">{player?.current_day || 1}</span>
            </div>

            <button
              onClick={handleAdvanceDay}
              disabled={isAdvancingDay}
              className="py-1.5 px-3.5 rounded-lg bg-[#18B892] hover:bg-[#149a7a] text-slate-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-md shadow-[#18B892]/20 flex items-center gap-1.5 disabled:opacity-50"
              title="Advance to next business day: runs crawler passes, recalculates SERPs, generates traffic & revenue"
            >
              {isAdvancingDay ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Simulating Day...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Advance Day</span>
                </>
              )}
            </button>
          </div>

          {/* Right: Wallets (Coins, Energy, AI Credits) & Player Level */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 text-xs font-mono bg-slate-800/90 px-3 py-1.5 rounded-lg border border-slate-700">
              <div className="flex items-center gap-1 text-amber-400 font-bold" title="Capital Coins">
                <Coins className="w-3.5 h-3.5" />
                <span>{wallet?.coins?.toLocaleString() ?? 1000}</span>
              </div>
              <span className="text-slate-600">|</span>
              <div className="flex items-center gap-1 text-emerald-400 font-bold" title="Daily Energy Capacity">
                <Zap className="w-3.5 h-3.5" />
                <span>{wallet?.energy ?? 100}/{wallet?.max_energy ?? 100}</span>
              </div>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <div className="items-center gap-1 text-sky-400 font-bold hidden sm:flex" title="AI Search Credits">
                <Cpu className="w-3.5 h-3.5" />
                <span>{wallet?.ai_credits ?? 100}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-[#18B892] animate-pulse" />
              <span className="text-slate-200 font-bold truncate max-w-[90px] sm:max-w-none">
                {player?.display_name || 'Strategist'}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#18B892]/20 text-[#18B892] font-bold">
                L{player?.level || 1}
              </span>
            </div>
          </div>

        </div>
      </header>

      {/* 2. REALISTIC COMMERCIAL DISTRICT DAYLIGHT HERO BANNER */}
      <div className="relative border-b border-slate-200 bg-white overflow-hidden shadow-xs">
        {/* Subtle high-rise office architecture backdrop */}
        <div 
          className="absolute inset-0 opacity-[0.07] bg-cover bg-center pointer-events-none"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&auto=format&fit=crop&q=80')` }}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Left: Business Dossier & Strategic Title */}
          <div className="space-y-2 text-left">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>{business?.industry || 'Technology'} Sector</span>
              <span aria-hidden="true">·</span>
              <span>Commercial District HQ</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-700 font-semibold">Simulated Search Environment</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <span>{business?.name || 'OmniCorp SEO'}</span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                Operating Level {business?.business_level || 1}
              </span>
            </h1>

            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              Target commercial buyer search queries, build topical entity depth, resolve crawl bottlenecks, and out-compete established market giants in Google organic search.
            </p>
          </div>

          {/* Right: Executive Advisor Card Spotlight */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 max-w-sm w-full shadow-sm text-left flex items-start gap-3">
            <ExecutiveAvatar avatar={EXECUTIVE_ADVISORS[0]} size="lg" />
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{EXECUTIVE_ADVISORS[0].name}</span>
                <span className="text-[10px] text-slate-500 uppercase font-mono">Strategy Lead</span>
              </div>
              <p className="text-xs text-slate-600 line-clamp-2 italic">
                "{strategicAnalysis.primaryRecommendation.description}"
              </p>
              <div className="pt-1">
                <button
                  onClick={() => {
                    if (strategicAnalysis.primaryRecommendation.actionCode) {
                      handleTriggerAction(strategicAnalysis.primaryRecommendation.actionCode);
                    } else if (strategicAnalysis.primaryRecommendation.id === 'publish_first_draft' && pages[0]) {
                      handlePublish(pages[0].id);
                    } else {
                      setActiveTab('lifecycle');
                    }
                  }}
                  className="text-xs font-bold text-[#18B892] hover:text-[#129273] inline-flex items-center gap-1 transition cursor-pointer"
                >
                  <span>{strategicAnalysis.primaryRecommendation.suggestedActionLabel || 'Review Strategy'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. MAIN WORKSPACE CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 flex-1 w-full text-left">
        
        {/* Real-time Feedback Alert Banner */}
        {actionNotice && (
          <div className={`p-4 rounded-xl border transition-all ${
            actionNotice.type === 'success'
              ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900 shadow-sm'
              : 'bg-rose-50/90 border-rose-200 text-rose-900 shadow-sm'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                {actionNotice.type === 'success' ? (
                  <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-md bg-rose-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                )}
                <div className="space-y-0.5">
                  <h4 className="font-bold text-sm">{actionNotice.title}</h4>
                  <p className="text-xs">{actionNotice.message}</p>
                  {actionNotice.impact && (
                    <p className="text-xs font-semibold text-emerald-700">{actionNotice.impact}</p>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setActionNotice(null)}
                className="text-slate-400 hover:text-slate-700 transition p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 4. REAL-TIME BUSINESS KPI METRICS STRIP (Crisp Clean White Cards) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-1 hover:shadow-md transition">
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">ORGANIC TRAFFIC</span>
            <strong className="text-slate-900 text-lg font-bold flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#18B892]" />
              {(metrics?.traffic || 0).toLocaleString()}
              <span className="text-xs text-slate-400 font-normal">clicks</span>
            </strong>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-1 hover:shadow-md transition">
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">GROSS REVENUE</span>
            <strong className="text-emerald-700 text-lg font-bold">
              ₦{(metrics?.revenue || 0).toLocaleString()}
            </strong>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-1 hover:shadow-md transition">
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">LEADS / DEALS</span>
            <strong className="text-slate-900 text-lg font-bold">
              {metrics?.leads || 0} <span className="text-slate-400 text-sm font-normal">/</span> {metrics?.customers || 0}
            </strong>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-1 hover:shadow-md transition">
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">INDEXED PAGES</span>
            <strong className="text-blue-700 text-lg font-bold">
              {pages.filter(p => p.indexed).length} <span className="text-slate-400 text-sm font-normal">/ {pages.length}</span>
            </strong>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-1 hover:shadow-md transition">
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">RANKING QUERIES</span>
            <strong className="text-indigo-700 text-lg font-bold">
              {keywords.filter(k => k.current_position && k.current_position <= 100).length}
              <span className="text-slate-400 text-xs font-normal ml-1">
                (Top 10: {keywords.filter(k => k.current_position && k.current_position <= 10).length})
              </span>
            </strong>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-1 hover:shadow-md transition">
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">BUSINESS BUDGET</span>
            <strong className="text-slate-900 text-lg font-bold">
              ₦{(business?.current_budget || 500000).toLocaleString()}
            </strong>
          </div>

        </div>

        {/* 5. NAVIGATION TABS (Zero-Pill Discipline: Clean Segmented Interactive Controls) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-xl overflow-x-auto border border-slate-300/80">
          
          <button
            onClick={() => setActiveTab('command_centre')}
            className={`py-2 px-3.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'command_centre'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <Compass className="w-4 h-4 text-[#18B892]" />
            <span>Command Centre</span>
          </button>

          <button
            onClick={() => setActiveTab('lifecycle')}
            className={`py-2 px-3.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'lifecycle'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Pages & Search Lifecycle ({pages.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('keywords')}
            className={`py-2 px-3.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'keywords'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Keywords & SERP Tracker ({keywords.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('competitors')}
            className={`py-2 px-3.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'competitors'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Market Incumbents ({competitors.length > 0 ? competitors.length : 10})</span>
          </button>

          <button
            onClick={() => setActiveTab('events')}
            className={`py-2 px-3.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'events'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <Newspaper className="w-4 h-4" />
            <span>Market Events & Updates ({events.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('actions')}
            className={`py-2 px-3.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'actions'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Strategic Operations (9)</span>
          </button>

          <button
            onClick={() => setActiveTab('business')}
            className={`py-2 px-3.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'business'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Financials & Missions</span>
          </button>

        </div>

        {/* ============================================================== */}
        {/* TAB 1: EXECUTIVE COMMAND CENTRE & STRATEGIC TRADE-OFFS         */}
        {/* ============================================================== */}
        {activeTab === 'command_centre' && (
          <div className="space-y-6">
            
            {/* Primary Strategic Recommendation Card */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <Target className="w-5 h-5 text-[#18B892]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
                      RECOMMENDED NEXT ACTION · {strategicAnalysis.primaryRecommendation.category}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">
                      {strategicAnalysis.primaryRecommendation.title}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (strategicAnalysis.primaryRecommendation.actionCode) {
                      handleTriggerAction(strategicAnalysis.primaryRecommendation.actionCode);
                    } else if (strategicAnalysis.primaryRecommendation.id === 'publish_first_draft' && pages[0]) {
                      handlePublish(pages[0].id);
                    } else if (strategicAnalysis.primaryRecommendation.id === 'create_first_page') {
                      setShowCreatePageModal(true);
                    } else {
                      setActiveTab('lifecycle');
                    }
                  }}
                  disabled={isProcessingAction !== null}
                  className="py-2.5 px-5 rounded-xl bg-[#18B892] hover:bg-[#149a7a] text-slate-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-md shadow-[#18B892]/20 inline-flex items-center gap-1.5 shrink-0"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Execute Recommendation</span>
                </button>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                {strategicAnalysis.primaryRecommendation.description}
              </p>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
                <Info className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <span>
                  <strong>Algorithm Rationale: </strong>
                  {strategicAnalysis.primaryRecommendation.rationale}
                </span>
              </div>
            </div>

            {/* Strategic Trade-offs Matrix */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Scale className="w-5 h-5 text-[#18B892]" />
                    Strategic Decision Dilemmas & Capital Trade-Offs
                  </h3>
                  <p className="text-xs text-slate-500">
                    Choose between competing business investments. Review explicit resource costs, expected upsides, and market uncertainties.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {strategicAnalysis.tradeOffs.map(trade => (
                  <div key={trade.id} className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4 flex flex-col justify-between">
                    <div className="space-y-2">
                      <h4 className="font-bold text-sm text-slate-900">{trade.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{trade.dilemma}</p>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
                      {/* Option A */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                        <strong className="text-slate-900 block font-semibold">{trade.optionA.title}</strong>
                        <p className="text-slate-600 text-[11px]">{trade.optionA.description}</p>
                        <div className="text-[11px] text-slate-500 space-y-0.5 pt-1">
                          <div><strong className="text-slate-700">Cost:</strong> {trade.optionA.costExplanation}</div>
                          <div><strong className="text-emerald-700">Upside:</strong> {trade.optionA.expectedUpside}</div>
                          <div><strong className="text-amber-700">Risk:</strong> {trade.optionA.riskOrUncertainty}</div>
                        </div>
                        {trade.optionA.actionCode && (
                          <button
                            onClick={() => handleTriggerAction(trade.optionA.actionCode!)}
                            disabled={isProcessingAction !== null}
                            className="w-full mt-2 py-1.5 px-3 rounded-lg bg-slate-200 hover:bg-[#18B892] text-slate-800 hover:text-slate-950 font-bold text-[11px] transition cursor-pointer"
                          >
                            Choose Option A
                          </button>
                        )}
                      </div>

                      {/* Option B */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                        <strong className="text-slate-900 block font-semibold">{trade.optionB.title}</strong>
                        <p className="text-slate-600 text-[11px]">{trade.optionB.description}</p>
                        <div className="text-[11px] text-slate-500 space-y-0.5 pt-1">
                          <div><strong className="text-slate-700">Cost:</strong> {trade.optionB.costExplanation}</div>
                          <div><strong className="text-emerald-700">Upside:</strong> {trade.optionB.expectedUpside}</div>
                          <div><strong className="text-amber-700">Risk:</strong> {trade.optionB.riskOrUncertainty}</div>
                        </div>
                        {trade.optionB.actionCode && (
                          <button
                            onClick={() => handleTriggerAction(trade.optionB.actionCode!)}
                            disabled={isProcessingAction !== null}
                            className="w-full mt-2 py-1.5 px-3 rounded-lg bg-slate-200 hover:bg-[#18B892] text-slate-800 hover:text-slate-950 font-bold text-[11px] transition cursor-pointer"
                          >
                            Choose Option B
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Real Executive Advisory Board (Photographic Human Portraits) */}
            <div className="space-y-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#18B892]" />
                  Executive Strategic Advisory Board
                </h3>
                <p className="text-xs text-slate-500">
                  Professional specialists guiding your company's search strategy, technical architecture, and market position.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {EXECUTIVE_ADVISORS.map(adv => (
                  <div key={adv.id} className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3 flex flex-col justify-between">
                    <div className="flex items-start gap-3">
                      <ExecutiveAvatar avatar={adv} size="lg" />
                      <div className="space-y-0.5 text-left">
                        <h4 className="font-bold text-sm text-slate-900">{adv.name}</h4>
                        <p className="text-xs text-slate-500">{adv.role}</p>
                        <span className="text-[10px] text-emerald-700 font-semibold uppercase">{adv.department}</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed italic">
                      "{adv.recommendedFocus}"
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recognized Real Brand Incumbents Preview */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Radio className="w-5 h-5 text-[#18B892]" />
                    Market Competitors & Recognizable Brands
                  </h3>
                  <p className="text-xs text-slate-500">
                    Real Nigerian & multinational enterprises competing for search intent in the simulated digital landscape.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('competitors')}
                  className="text-xs font-bold text-[#18B892] hover:underline"
                >
                  View Full Competitor Arena →
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {Object.values(REAL_BRANDS).slice(0, 5).map(brand => (
                  <div key={brand.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                    <CompanyLogo name={brand.name} domain={brand.domain} size="md" />
                    <div className="truncate text-left">
                      <span className="font-bold text-xs text-slate-900 block truncate">{brand.shortName}</span>
                      <span className="text-[10px] text-slate-500 font-mono block truncate">{brand.domain}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-[11px] text-slate-500 italic">
                * Note: Authentic brand identities are simulated market participants for realistic educational scenario testing.
              </div>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: PAGES & SEO LIFECYCLE (PHASE 2 CORE EXPERIENCE)         */}
        {/* ============================================================== */}
        {activeTab === 'lifecycle' && (
          <div className="space-y-6">
            
            {/* Header & Create Draft Trigger */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#18B892]" />
                  Authoritative SEO Page Lifecycle Pipeline
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Realistic 7-stage Google crawler progression: Drafts must be published, crawled, and evaluated before indexation & SERP eligibility.
                </p>
              </div>

              <button
                onClick={() => setShowCreatePageModal(true)}
                className="py-2.5 px-4 rounded-xl bg-[#18B892] hover:bg-[#149a7a] text-slate-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#18B892]/20"
              >
                <FileText className="w-4 h-4" />
                <span>Create Page Draft (5⚡·75🪙)</span>
              </button>
            </div>

            {/* Stages Legend / Pipeline Progression Banner */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-x-auto">
              <div className="flex items-center justify-between min-w-[700px] gap-2 text-xs">
                {LIFECYCLE_STAGES.map((s, idx) => (
                  <div key={s.stage} className="flex items-center gap-2 flex-1">
                    <div className="flex flex-col items-center text-center flex-1">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-slate-700">
                        {idx + 1}
                      </div>
                      <span className="font-bold text-slate-900 mt-1 uppercase text-[10px]">{s.stage.replace('_', ' ')}</span>
                      <span className="text-[10px] text-slate-500 line-clamp-1">{s.description}</span>
                    </div>
                    {idx < LIFECYCLE_STAGES.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Page List & Cards */}
            {pages.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white border border-dashed border-slate-300 text-center space-y-4 shadow-sm">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-slate-900">No Website Pages Created Yet</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Publish your first page draft to initialize your 10-factor baseline and begin the Google search lifecycle.
                  </p>
                </div>
                <button
                  onClick={() => setShowCreatePageModal(true)}
                  className="py-2.5 px-5 rounded-xl bg-[#18B892] hover:bg-[#149a7a] text-slate-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer inline-flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4" />
                  <span>Create Your First Page</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {pages.map((p) => {
                  const lc: PageLifecycleInfo = p.lifecycle;
                  const isSelected = selectedPageId === p.id;
                  const targetKw = p.targetKeyword;
                  const factors: RankingFactors | null = p.rankingFactors;

                  return (
                    <div 
                      key={p.id}
                      className={`p-5 rounded-2xl border transition-all text-left space-y-4 ${
                        isSelected 
                          ? 'bg-white border-[#18B892] shadow-md ring-1 ring-[#18B892]/20' 
                          : 'bg-white border-slate-200/90 shadow-sm hover:shadow-md'
                      }`}
                    >
                      {/* Top Bar of Page Card */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-base text-slate-900">{p.title}</span>
                            <span className="text-xs font-mono text-slate-500">/{p.slug}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span>Type: <strong className="text-slate-700 uppercase">{p.page_type}</strong></span>
                            <span>·</span>
                            <span>Robots: <strong className={p.robots_index !== false ? 'text-emerald-700' : 'text-rose-600'}>
                              {p.robots_index !== false ? 'index, follow' : 'noindex (BLOCKED)'}
                            </strong></span>
                            <span>·</span>
                            <span>Overall Potential: <strong className="text-emerald-700">{lc.overallScore ?? 'N/A'}/100</strong></span>
                          </div>
                        </div>

                        {/* Stage Badge */}
                        <div className="flex items-center gap-2">
                          <div className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 ${
                            lc.stage === 'RANKED' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' :
                            lc.stage === 'SERP_ELIGIBLE' ? 'bg-purple-50 border-purple-200 text-purple-800' :
                            lc.stage === 'INDEXED' ? 'bg-blue-50 border-blue-200 text-blue-800' :
                            lc.status === 'crawl_blocked' || lc.status === 'evaluation_failed' ? 'bg-rose-50 border-rose-200 text-rose-800' :
                            lc.stage === 'PUBLISHED' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                            'bg-slate-100 border-slate-200 text-slate-700'
                          }`}>
                            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                            <span>STAGE {lc.stageIndex + 1}: {lc.stageLabel}</span>
                          </div>
                        </div>
                      </div>

                      {/* Diagnostic Status Box */}
                      <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                        lc.status === 'crawl_blocked' || lc.status === 'evaluation_failed'
                          ? 'bg-rose-50 border-rose-200 text-rose-900'
                          : lc.isRanked
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}>
                        <div className="flex items-center justify-between">
                          <strong className="text-slate-900 flex items-center gap-1.5">
                            {lc.status === 'crawl_blocked' || lc.status === 'evaluation_failed' ? (
                              <AlertTriangle className="w-4 h-4 text-rose-600" />
                            ) : lc.isRanked ? (
                              <Award className="w-4 h-4 text-[#18B892]" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-blue-600" />
                            )}
                            {lc.statusHeadline}
                          </strong>
                          {lc.position && (
                            <span className="px-2 py-0.5 rounded bg-[#18B892] text-slate-950 font-bold text-xs">
                              Google SERP #{lc.position}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600">{lc.statusDescription}</p>
                        {lc.failureReason && (
                          <p className="text-xs text-rose-700 font-semibold">
                            Gate Failure: {lc.failureReason}
                          </p>
                        )}
                        {lc.correctiveAction && (
                          <p className="text-xs text-amber-800 font-medium">
                            Required Action: {lc.correctiveAction}
                          </p>
                        )}
                      </div>

                      {/* Interactive Controls & Stage Stepping Actions */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        
                        {/* Step 1 -> 2: Publish Draft */}
                        {lc.isDraft && (
                          <button
                            onClick={() => handlePublish(p.id)}
                            disabled={isProcessingAction !== null}
                            className="py-1.5 px-3 rounded-lg bg-[#18B892] hover:bg-[#149a7a] text-slate-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                          >
                            {isProcessingAction === `publish-${p.id}` ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Globe className="w-3.5 h-3.5" />
                            )}
                            <span>Publish Live to Web</span>
                          </button>
                        )}

                        {/* Step 2 -> 3/4/5: Run Crawler Inspection */}
                        {p.published_at && (
                          <button
                            onClick={() => handleCrawlInspection(p.id)}
                            disabled={isProcessingAction !== null}
                            className={`py-1.5 px-3 rounded-lg font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50 ${
                              !p.indexed 
                                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                            }`}
                          >
                            {isProcessingAction === `crawl-${p.id}` ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                            <span>{!p.indexed ? 'Trigger Googlebot Inspection' : 'Re-Inspect URL'}</span>
                          </button>
                        )}

                        {/* Testing Failure State: Toggle robots noindex */}
                        <button
                          onClick={() => handleToggleRobots(p.id, p.robots_index !== false)}
                          disabled={isProcessingAction !== null}
                          className="py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                          title="Simulate crawl failure by toggling meta noindex directive"
                        >
                          <Shield className="w-3.5 h-3.5 text-slate-500" />
                          <span>Toggle Directive ({p.robots_index !== false ? 'Set NOINDEX' : 'Set INDEX'})</span>
                        </button>

                        {/* Step 5 -> 6: Assign Target Keyword */}
                        {p.indexed && (
                          <button
                            onClick={() => setAssignKeywordModalPageId(p.id)}
                            className="py-1.5 px-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5"
                          >
                            <Target className="w-3.5 h-3.5" />
                            <span>{targetKw ? `Target: "${targetKw.keyword}"` : 'Assign Search Keyword'}</span>
                          </button>
                        )}

                        {/* Step 6 -> 7: Trigger Live SERP Simulation */}
                        {targetKw && p.indexed && (
                          <button
                            onClick={() => handleSimulateSerp(targetKw.id)}
                            disabled={isProcessingAction !== null}
                            className="py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                          >
                            {isProcessingAction === `serp-${targetKw.id}` ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Search className="w-3.5 h-3.5" />
                            )}
                            <span>Simulate Google SERP</span>
                          </button>
                        )}

                        {/* View 10-Factor Matrix Details */}
                        <button
                          onClick={() => setSelectedPageId(p.id)}
                          className={`py-1.5 px-3 rounded-lg text-xs transition cursor-pointer ml-auto ${
                            isSelected 
                              ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200' 
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          <span>{isSelected ? 'Viewing Factor Matrix' : 'Inspect Factor Matrix'}</span>
                        </button>
                      </div>

                      {/* Expanded Factor Breakdown for Selected Page */}
                      {isSelected && factors && selectedPotential && (
                        <div className="pt-3 border-t border-slate-100 space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-800 font-bold uppercase flex items-center gap-1.5">
                              <BarChart3 className="w-4 h-4 text-[#18B892]" />
                              Deterministic 10-Factor Score Breakdown ({selectedPotential.overall_score.toFixed(1)}/100)
                            </span>
                            <span className="text-emerald-700 font-bold uppercase text-xs">
                              Projected Tier: {selectedPotential.tier_label} · Max Rank: #{selectedPotential.estimated_max_position}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                            {selectedPotential.factor_breakdown.map(f => (
                              <div key={f.key} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-600 truncate text-[11px]">{f.label}</span>
                                  <strong className={f.rawScore >= 70 ? 'text-emerald-700 font-bold' : f.rawScore >= 40 ? 'text-amber-700' : 'text-rose-600'}>
                                    {f.rawScore}
                                  </strong>
                                </div>
                                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${f.rawScore >= 70 ? 'bg-[#18B892]' : f.rawScore >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                    style={{ width: `${f.rawScore}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Remediation Shortcuts */}
                          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500">
                            <span>Boost Factor Signals:</span>
                            <button
                              onClick={() => handleTriggerAction('OPTIMIZE_PAGE')}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer"
                            >
                              + Intent & Quality (+15)
                            </button>
                            <button
                              onClick={() => handleTriggerAction('TECHNICAL_AUDIT')}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer"
                            >
                              + Tech Health (+20)
                            </button>
                            <button
                              onClick={() => handleTriggerAction('CONTENT_EXPANSION')}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer"
                            >
                              + Depth & Word Count (+18)
                            </button>
                            <button
                              onClick={() => handleTriggerAction('AUTHORITY_CAMPAIGN')}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer"
                            >
                              + Backlinks (+18)
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: KEYWORDS & SERP TRACKER                                */}
        {/* ============================================================== */}
        {activeTab === 'keywords' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Search className="w-5 h-5 text-[#18B892]" />
                  Campaign Keyword & Live Google SERP Tracking
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Research queries, assign indexed landing pages, and observe live simulated search positions and CTR traffic.
                </p>
              </div>

              <button
                onClick={() => handleTriggerAction('KEYWORD_RESEARCH')}
                disabled={isProcessingAction !== null}
                className="py-2.5 px-4 rounded-xl bg-[#18B892] hover:bg-[#149a7a] text-slate-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#18B892]/20 disabled:opacity-50"
              >
                {isProcessingAction === 'KEYWORD_RESEARCH' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span>Run Keyword Research (3⚡·25🪙)</span>
              </button>
            </div>

            {keywords.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white border border-dashed border-slate-300 text-center space-y-4 shadow-sm">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
                  <Search className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-slate-900">No Keywords Researched Yet</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Execute keyword research to discover high-volume, low-competition queries tailored to your industry.
                  </p>
                </div>
                <button
                  onClick={() => handleTriggerAction('KEYWORD_RESEARCH')}
                  className="py-2.5 px-5 rounded-xl bg-[#18B892] hover:bg-[#149a7a] text-slate-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
                >
                  Discover Keywords
                </button>
              </div>
            ) : (
              <div className="w-full bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="py-3 px-4">Target Keyword</th>
                        <th className="py-3 px-3">Intent</th>
                        <th className="py-3 px-3">Volume</th>
                        <th className="py-3 px-3">Diff.</th>
                        <th className="py-3 px-3">SERP Rank</th>
                        <th className="py-3 px-3">Est. CTR</th>
                        <th className="py-3 px-3">Clicks</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {keywords.map(kw => {
                        const target = dashboard?.targets?.find((t: any) => t.keyword_id === kw.id);
                        const targetedPage = pages.find(p => p.id === target?.page_id);
                        const isRanked = kw.current_position && kw.current_position <= 100;

                        return (
                          <tr key={kw.id} className="hover:bg-slate-50/80 transition">
                            <td className="py-3 px-4">
                              <span className="font-bold text-slate-900 block">{kw.keyword}</span>
                              {targetedPage ? (
                                <span className="text-[11px] text-blue-700">
                                  Page: {targetedPage.title} {targetedPage.indexed ? '✓ (Indexed)' : '(Pending Index)'}
                                </span>
                              ) : (
                                <span className="text-[11px] text-amber-700">
                                  No Landing Page Assigned
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-slate-600 uppercase text-[10px] font-semibold">
                              {kw.intent}
                            </td>
                            <td className="py-3 px-3 text-slate-800 font-mono">
                              {(kw.search_volume || 0).toLocaleString()}
                            </td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                kw.difficulty <= 35 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                                kw.difficulty <= 55 ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                                'bg-rose-50 text-rose-800 border border-rose-200'
                              }`}>
                                {kw.difficulty}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              {isRanked ? (
                                <span className={`px-2 py-0.5 rounded font-bold ${
                                  kw.current_position <= 3 ? 'bg-[#18B892] text-slate-950' :
                                  kw.current_position <= 10 ? 'bg-blue-600 text-white' :
                                  'bg-slate-100 text-slate-800'
                                }`}>
                                  #{kw.current_position}
                                </span>
                              ) : (
                                <span className="text-slate-400">Unranked</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-slate-700 font-mono">
                              {kw.ctr ? `${kw.ctr}%` : '0%'}
                            </td>
                            <td className="py-3 px-3 text-emerald-700 font-bold font-mono">
                              {(kw.clicks || 0).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => handleSimulateSerp(kw.id)}
                                disabled={isProcessingAction !== null || !targetedPage?.indexed}
                                className="py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-[#18B892] text-slate-800 hover:text-slate-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer disabled:opacity-40"
                                title={!targetedPage?.indexed ? 'Target page must be crawled and indexed before simulating SERP' : 'Run SERP Simulation'}
                              >
                                {isProcessingAction === `serp-${kw.id}` ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin inline" />
                                ) : (
                                  <span>Simulate SERP</span>
                                )}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: MARKET INCUMBENTS & COMPETITORS (REAL RECOGNIZABLE BRANDS) */}
        {/* ============================================================== */}
        {activeTab === 'competitors' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Radio className="w-5 h-5 text-[#18B892]" />
                Simulated Market Incumbents & Competitor Field
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Recognizable Nigerian and international companies competing for search visibility in your market. Out-rank them through authority and topical depth.
              </p>
              <div className="mt-2 text-[11px] text-slate-400 italic">
                * Note: Authentic brand identities represent simulated market participants for realistic educational scenario testing.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {competitors.map((comp) => {
                const brand = findRealBrand(comp.name) || findRealBrand(comp.domain);
                
                return (
                  <div key={comp.id} className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3 text-xs hover:shadow-md transition">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <CompanyLogo name={comp.name} domain={comp.domain} size="md" />
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">{comp.name}</h4>
                          <span className="text-slate-500 text-[11px] font-mono">{comp.domain}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[10px] uppercase font-bold">
                        Diff: {comp.difficulty}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">
                      <strong>Search Strategy: </strong>
                      <span className="text-slate-800">{comp.strategy}</span>
                    </p>

                    <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-slate-500 block text-[10px] font-semibold">AUTHORITY</span>
                        <strong className="text-emerald-700 text-sm mt-0.5 block">{comp.authority_score}/100</strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-slate-500 block text-[10px] font-semibold">CONTENT DEPTH</span>
                        <strong className="text-blue-700 text-sm mt-0.5 block">{comp.content_score}/100</strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-slate-500 block text-[10px] font-semibold">TECHNICAL HEALTH</span>
                        <strong className="text-purple-700 text-sm mt-0.5 block">{comp.technical_score}/100</strong>
                      </div>
                    </div>

                    <button
                      onClick={() => handleTriggerAction('COMPETITOR_ANALYSIS')}
                      disabled={isProcessingAction !== null}
                      className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-[#18B892] text-slate-800 hover:text-slate-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Analyze Competitor Gaps (6⚡·50🪙)</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: MARKET EVENTS & ALGORITHM UPDATES                      */}
        {/* ============================================================== */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-[#18B892]" />
                Daily Market Events & Search Algorithm Updates
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Search engine algorithm updates, competitor manoeuvres, and industry developments processed deterministically per game day.
              </p>
            </div>

            {events.length === 0 ? (
              <div className="p-12 rounded-3xl bg-white border border-dashed border-slate-300 text-center space-y-3 shadow-sm">
                <Newspaper className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="font-bold text-base text-slate-900">No Events Logged Yet</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Advance business days to trigger market developments, Google crawler passes, and competitor counter-actions.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((evt) => (
                  <div key={evt.id} className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2 text-left">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          evt.severity === 'positive' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                          evt.severity === 'warning' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                          'bg-blue-50 text-blue-800 border border-blue-200'
                        }`}>
                          {evt.event_type.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-slate-400">Day {evt.day}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">Logged Authoritatively</span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900">{evt.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{evt.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 6: CANONICAL STRATEGIC OPERATIONS CONSOLE                  */}
        {/* ============================================================== */}
        {activeTab === 'actions' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-[#18B892]" />
                Authoritative Action Console (9 Level-1 Actions)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Every action mutates resources atomically via Postgres transactions. XP, levels, and factor signals update deterministically.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {Object.entries(CANONICAL_ACTION_TYPES).map(([code, action]) => (
                <div key={code} className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition text-xs">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                        +{action.xp_reward} XP
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">LVL {action.requires_level}</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 mt-2">{action.name}</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{action.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Cost: {action.energy_cost}⚡ · {action.coin_cost}🪙 {action.ai_credit_cost > 0 ? `· ${action.ai_credit_cost}🤖` : ''}</span>
                    </div>
                    <button
                      onClick={() => handleTriggerAction(code)}
                      disabled={isProcessingAction !== null}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-[#18B892] text-white hover:text-slate-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {isProcessingAction === code ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <span>Execute {action.name}</span>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 7: BUSINESS FINANCIALS & MISSIONS                          */}
        {/* ============================================================== */}
        {activeTab === 'business' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Business Profile Card */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="font-bold text-sm text-slate-900 uppercase flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#18B892]" />
                    Business Entity Dossier
                  </h4>
                  <span className="text-emerald-700 font-bold uppercase text-xs">
                    HEALTH: {playerState?.business_health ?? 100}%
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Company Name:</span>
                    <strong className="text-slate-900 font-bold">{business?.name || 'OmniCorp SEO'}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Industry Sector:</span>
                    <strong className="text-slate-900">{business?.industry || 'Technology'}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Available Business Budget:</span>
                    <strong className="text-emerald-700 text-sm font-bold">₦{(business?.current_budget || 500000).toLocaleString()}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Operating Level:</span>
                    <strong className="text-slate-900">Level {business?.business_level || 1}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Reputation Score:</span>
                    <strong className="text-slate-900">{business?.reputation || 50}/100</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Domain Authority:</span>
                    <strong className="text-emerald-700 font-bold">{business?.authority_score || 10}/100</strong>
                  </div>
                </div>
              </div>

              {/* Active Missions Card */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="font-bold text-sm text-slate-900 uppercase flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#18B892]" />
                    Active Missions & Growth Milestones
                  </h4>
                  <span className="text-slate-500 text-xs">
                    {missions.length} AVAILABLE
                  </span>
                </div>

                <div className="space-y-3">
                  {missions.map(m => {
                    const prog = dashboard?.missionProgress?.find((mp: any) => mp.mission_id === m.id);
                    const isCompleted = prog?.completed;

                    return (
                      <div key={m.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <strong className="text-slate-900 text-xs font-bold">{m.title}</strong>
                          <span className={`text-xs font-bold ${isCompleted ? 'text-emerald-700' : 'text-slate-500'}`}>
                            {isCompleted ? 'COMPLETED ✓' : `+${m.xp_reward} XP`}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">{m.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* CREATE PAGE MODAL */}
      {showCreatePageModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#18B892]" />
                Create New Website Page Draft
              </h3>
              <button 
                onClick={() => setShowCreatePageModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePageSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-700 font-bold block">Page Title / Topic</label>
                <input 
                  type="text"
                  placeholder="e.g. Enterprise SEO Strategy Guide"
                  value={newPageTitle}
                  onChange={e => setNewPageTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#18B892] focus:bg-white"
                  required
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                <span className="text-slate-900 font-bold block">Resource Requirements:</span>
                <span>5⚡ Energy · 75🪙 Coins · Reward: +50 XP</span>
                <span className="block text-emerald-700 font-medium">Created as Draft. Will require Publishing & Crawl to index.</span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isProcessingAction !== null || !newPageTitle.trim()}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#18B892] hover:bg-[#149a7a] text-slate-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer disabled:opacity-50"
                >
                  Confirm & Create Page
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreatePageModal(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN KEYWORD MODAL */}
      {assignKeywordModalPageId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-[#18B892]" />
                Select Search Query to Target
              </h3>
              <button 
                onClick={() => setAssignKeywordModalPageId(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto text-xs">
              {keywords.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No keywords found. Run keyword research first.</p>
              ) : (
                keywords.map(kw => (
                  <button
                    key={kw.id}
                    onClick={() => handleAssignKeyword(assignKeywordModalPageId, kw.id)}
                    className="w-full p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <strong className="text-slate-900 block font-bold">{kw.keyword}</strong>
                      <span className="text-[11px] text-slate-500">Vol: {kw.search_volume} · Diff: {kw.difficulty} · Intent: {kw.intent}</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 uppercase">Target →</span>
                  </button>
                ))
              )}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setAssignKeywordModalPageId(null)}
                className="py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIVE GOOGLE SERP PREVIEW MODAL */}
      {activeSerpSimulation && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-4 shadow-2xl text-left max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="space-y-0.5">
                <span className="text-[11px] text-emerald-700 font-bold uppercase tracking-wider block">
                  SIMULATED SEARCH ENGINE RESULTS PAGE (DESKTOP · NIGERIA & GLOBAL)
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  Search Query: "{activeSerpSimulation.keyword}"
                </h3>
              </div>
              <button 
                onClick={() => setActiveSerpSimulation(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Performance Summary Strip */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs shrink-0">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">YOUR RANKING POSITION</span>
                <strong className="text-slate-900 text-lg font-bold">
                  #{activeSerpSimulation.playerPosition ?? 'Unranked'}
                  <span className="text-slate-500 text-xs font-normal ml-2">
                    (Score: {activeSerpSimulation.playerScore?.toFixed(1)}/100)
                  </span>
                </strong>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[10px] uppercase font-semibold">ESTIMATED ORGANIC TRAFFIC</span>
                <strong className="text-emerald-700 text-sm font-bold">
                  {activeSerpSimulation.playerClicks} clicks/day ({activeSerpSimulation.playerCtr}% CTR)
                </strong>
              </div>
            </div>

            {/* Simulated Google Search Results List */}
            <div className="space-y-3 overflow-y-auto pr-1 flex-1">
              {activeSerpSimulation.topTenResults?.map((res: any) => (
                <div 
                  key={res.position}
                  className={`p-4 rounded-xl border transition ${
                    res.isPlayer 
                      ? 'bg-emerald-50/80 border-emerald-300 shadow-sm' 
                      : 'bg-white border-slate-200/90'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="flex items-center gap-1.5 truncate">
                      <strong className={`font-bold ${res.isPlayer ? 'text-emerald-700' : 'text-slate-700'}`}>
                        #{res.position}
                      </strong>
                      <span>·</span>
                      <span className="truncate font-mono">{res.url}</span>
                    </span>
                    <span className="text-[11px] shrink-0 font-bold ml-2">
                      Score: <strong className={res.isPlayer ? 'text-emerald-700' : 'text-slate-700'}>{res.rankingScore?.toFixed(1)}</strong>
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-blue-700 hover:underline cursor-pointer">
                    {res.title}
                  </h4>

                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    Comprehensive strategic analysis for {activeSerpSimulation.keyword}. Discover actionable frameworks, industry benchmarks, and proven optimization strategies.
                  </p>

                  {res.isPlayer && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px] uppercase">
                      ✓ YOUR RANKING PAGE
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 text-right shrink-0">
              <button
                onClick={() => setActiveSerpSimulation(null)}
                className="py-2.5 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
              >
                Close SERP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DAY ADVANCE CELEBRATION MODAL */}
      {daySummaryModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl text-left">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] text-emerald-700 font-bold uppercase tracking-wider block">
                  DAY COMPLETED · SIMULATION PASS
                </span>
                <h3 className="font-bold text-xl text-slate-900">
                  Welcome to Day {daySummaryModal.currentDay}!
                </h3>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-slate-600">Daily Organic Traffic:</span>
                <strong className="text-emerald-700 text-sm font-bold">
                  +{daySummaryModal.dailyClicks} clicks
                </strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-slate-600">Qualified Leads:</span>
                <strong className="text-amber-700 text-sm font-bold">
                  +{daySummaryModal.dailyLeads} leads
                </strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-slate-600">Closed Customers / Deals:</span>
                <strong className="text-blue-700 text-sm font-bold">
                  +{daySummaryModal.dailyCustomers} customer(s)
                </strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-slate-600">Gross Revenue Generated:</span>
                <strong className="text-emerald-700 text-sm font-bold">
                  +₦{(daySummaryModal.grossRevenue || 0).toLocaleString()}
                </strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-slate-600">Net Profit (After Overhead):</span>
                <strong className="text-slate-900 text-sm font-bold">
                  ₦{(daySummaryModal.netProfit || 0).toLocaleString()}
                </strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-slate-600">Energy Restored:</span>
                <strong className="text-slate-900 text-sm font-bold">
                  +{daySummaryModal.energyRestored}⚡ (Capacity: {daySummaryModal.currentEnergy}/100)
                </strong>
              </div>
            </div>

            <button
              onClick={() => setDaySummaryModal(null)}
              className="w-full py-3 px-5 rounded-xl bg-[#18B892] hover:bg-[#149a7a] text-slate-950 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
            >
              Resume Company Operations
            </button>
          </div>
        </div>
      )}

      {/* Footer bar */}
      <footer className="w-full py-4 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        DSP Academy · THE SEO GAME · Deterministic Ranking Engine & Realistic Business Simulation
      </footer>

    </div>
  );
}
