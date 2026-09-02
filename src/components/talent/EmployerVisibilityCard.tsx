import React, { useState, useEffect, useCallback } from 'react';
import { 
  Eye, 
  MousePointerClick, 
  TrendingUp, 
  Globe2, 
  MapPin, 
  RefreshCw, 
  BarChart2, 
  ShieldCheck, 
  Sparkles,
  ArrowUpRight,
  Users,
  Radio
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { 
  getProfileAnalytics, 
  getCountryFlag, 
  ProfileAnalyticsData 
} from '../../lib/profileAnalytics';

interface EmployerVisibilityCardProps {
  profile: any;
  onShareProfile?: () => void;
}

export default function EmployerVisibilityCard({ profile, onShareProfile }: EmployerVisibilityCardProps) {
  const [analytics, setAnalytics] = useState<ProfileAnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | 'all'>('all');

  const loadAnalytics = useCallback(async (isSilent = false) => {
    if (!profile?.id) return;
    if (!isSilent) setLoading(true);
    try {
      const data = await getProfileAnalytics(profile.id, profile);
      setAnalytics(data);
    } catch (err) {
      console.warn('[EmployerVisibilityCard] Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [profile]);

  // Initial load and Supabase Realtime Channel subscription on analytics_events
  useEffect(() => {
    if (!profile?.id) return;

    loadAnalytics();

    // Supabase Realtime Channel subscription on analytics_events for INSERT operations matching talent_id
    const channel = supabase
      .channel(`analytics_events_channel_${profile.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'analytics_events',
          filter: `talent_id=eq.${profile.id}`
        },
        (payload) => {
          console.info('[Realtime] New analytics view event received:', payload);
          // Automatically update impressions badge and visitor location list in real-time with zero page refresh
          loadAnalytics(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id, loadAnalytics]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadAnalytics(true);
  };

  const totalImpressions = analytics?.totalViews ?? (profile?.profile_views_count ?? profile?.view_count ?? 0);
  const totalClicks = analytics?.totalClicks ?? (profile?.click_count ?? 0);
  const topLocations = analytics?.topLocations || [];
  const topCountries = analytics?.topCountries || [];

  const displayViews = timeframe === '7d' 
    ? (analytics?.recentViews ?? totalImpressions)
    : totalImpressions;

  const displayCtr = displayViews > 0 
    ? Number(((totalClicks / displayViews) * 100).toFixed(1)) 
    : 0;

  return (
    <section 
      id="employer-visibility-analytics-section"
      className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs space-y-6 text-left"
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shadow-2xs">
              <BarChart2 className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold font-display text-slate-900">
              Employer Visibility & Impressions
            </h2>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
              Live Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Real-time candidate profile impressions, recruiter interaction volume, and live IP geolocation tracking.
          </p>
        </div>

        {/* Action Controls & Timeframe Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <div className="inline-flex p-0.5 bg-slate-100 rounded-xl border border-slate-200/80 text-xs font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setTimeframe('7d')}
              className={`px-2.5 py-1 rounded-lg transition ${
                timeframe === '7d'
                  ? 'bg-white text-slate-900 font-bold shadow-2xs'
                  : 'hover:text-slate-900'
              }`}
            >
              7 Days
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('30d')}
              className={`px-2.5 py-1 rounded-lg transition ${
                timeframe === '30d'
                  ? 'bg-white text-slate-900 font-bold shadow-2xs'
                  : 'hover:text-slate-900'
              }`}
            >
              30 Days
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('all')}
              className={`px-2.5 py-1 rounded-lg transition ${
                timeframe === 'all'
                  ? 'bg-white text-slate-900 font-bold shadow-2xs'
                  : 'hover:text-slate-900'
              }`}
            >
              All Time
            </button>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl transition shadow-2xs cursor-pointer disabled:opacity-50"
            title="Refresh analytics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Key Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Profile Views / Impressions */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 sm:p-5 transition hover:border-emerald-300 hover:bg-emerald-50/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-slate-500 uppercase tracking-wider">
              Total Impressions
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-100/80 text-emerald-700">
              <Eye className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900">
              {displayViews.toLocaleString()}
            </span>
            {displayViews > 0 && (
              <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                <TrendingUp className="w-3 h-3" />
                Live
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
            <span>Logged via directory & public dossier</span>
          </p>
        </div>

        {/* Metric 2: Employer Clicks & Interactions */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 sm:p-5 transition hover:border-emerald-300 hover:bg-emerald-50/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-slate-500 uppercase tracking-wider">
              Employer Clicks
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-100/80 text-emerald-700">
              <MousePointerClick className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900">
              {totalClicks.toLocaleString()}
            </span>
            {totalClicks > 0 && (
              <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                <TrendingUp className="w-3 h-3" />
                Live
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            Direct unlocks, CV downloads & contact taps
          </p>
        </div>

        {/* Metric 3: Click-Through Rate (CTR) */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 sm:p-5 transition hover:border-emerald-300 hover:bg-emerald-50/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-slate-500 uppercase tracking-wider">
              Interaction Rate (CTR)
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-100/80 text-emerald-700">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900">
              {displayCtr}%
            </span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded-md">
              Live Ratio
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            Recruiter engagement ratio
          </p>
        </div>

        {/* Metric 4: Top Country / Location Reach */}
        <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 sm:p-5 transition hover:border-emerald-300 hover:bg-emerald-50/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-slate-500 uppercase tracking-wider">
              Global Reach
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-100/80 text-emerald-700">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900">
              {topCountries.length}
            </span>
            <span className="text-[11px] font-medium text-slate-500">
              countries
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
            <Globe2 className="w-3 h-3 text-slate-400" />
            <span>Across {topLocations.length} cities</span>
          </p>
        </div>
      </div>

      {/* Main Dual Grid: Top Visitor Locations Breakdown & Weekly Momentum */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        
        {/* LEFT COLUMN: Top Visitor Locations Table / Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Top Visitor Locations
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              IP Location Telemetry
            </span>
          </div>

          {/* Quick Country Pills with Real Flags & Percentages */}
          {topCountries.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pb-1">
              {topCountries.slice(0, 6).map((c, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-[11px] bg-white border border-slate-200/80 px-2.5 py-1 rounded-full text-slate-700 font-medium shadow-2xs"
                >
                  <span className="text-sm">{getCountryFlag(c.code, c.country)}</span>
                  <span className="font-semibold">{c.country}</span>
                  <span className="text-slate-500 text-[10px] font-mono font-bold">({c.percentage}%)</span>
                </span>
              ))}
            </div>
          )}

          {/* Detailed Locations Table / Breakdown List */}
          <div className="space-y-3">
            {topLocations.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs space-y-2">
                <Globe2 className="w-8 h-8 mx-auto text-slate-300" />
                <p className="font-medium text-slate-600">No visitor impressions recorded yet.</p>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  Geolocation telemetry logs will appear here in real time with country flags and percentage shares when recruiters view your portfolio.
                </p>
              </div>
            ) : (
              topLocations.slice(0, 6).map((loc, idx) => (
                <div 
                  key={idx}
                  className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs hover:border-slate-300 transition"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0">{getCountryFlag(loc.countryCode, loc.country)}</span>
                      <span className="font-bold text-slate-800 truncate">
                        {loc.city && loc.city !== 'Unknown' ? `${loc.city}, ` : ''}{loc.country}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="font-mono font-bold text-slate-900">
                        {loc.count} view{loc.count > 1 ? 's' : ''}
                      </span>
                      <span className="text-[10px] font-mono text-slate-600 bg-slate-100 font-bold px-1.5 py-0.5 rounded">
                        {loc.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, loc.percentage)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Weekly Momentum & Visibility Growth Insight (5 cols) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          
          {/* Weekly Traffic Momentum */}
          <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Weekly Momentum</span>
              </h3>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Live 7-Day Trend
              </span>
            </div>

            {/* Mini Activity Bar Grid */}
            <div className="grid grid-cols-7 gap-1.5 pt-2 items-end h-24">
              {(analytics?.weeklyTrend || []).map((item, dIdx) => {
                const maxVal = Math.max(...(analytics?.weeklyTrend.map((t) => t.views) || [1]), 1);
                const heightPct = item.views > 0 ? Math.min(100, Math.max(15, Math.round((item.views / maxVal) * 100))) : 8;
                return (
                  <div key={dIdx} className="flex flex-col items-center gap-1 group">
                    <div className="w-full bg-slate-200/80 rounded-t-md h-20 flex items-end justify-center p-0.5 relative">
                      <div 
                        className={`w-full rounded-t-sm transition-all duration-300 ${item.views > 0 ? 'bg-emerald-500 group-hover:bg-emerald-600' : 'bg-slate-300'}`}
                        style={{ height: `${heightPct}%` }}
                      />
                      {/* Tooltip on hover */}
                      <div className="absolute -top-7 hidden group-hover:flex bg-slate-900 text-white text-[10px] font-mono px-1.5 py-0.5 rounded shadow-md z-10 whitespace-nowrap">
                        {item.views} views
                      </div>
                    </div>
                    <span className="text-[10px] font-medium text-slate-500">
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Visibility Tip Banner */}
          <div className="bg-emerald-900 text-white rounded-2xl p-4.5 space-y-2 relative overflow-hidden shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-800 text-emerald-300 shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold font-display text-emerald-100">
                  Boost Your Recruiter Conversion
                </h4>
                <p className="text-[11px] text-emerald-200/90 leading-relaxed">
                  Candidates with <strong className="text-white font-semibold">Verified Badges</strong> & verified case studies convert 3.8x more profile views into paid hires.
                </p>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-end">
              <button
                type="button"
                onClick={onShareProfile}
                className="text-[11px] font-semibold text-emerald-200 hover:text-white bg-emerald-800/80 hover:bg-emerald-800 border border-emerald-700/80 px-3 py-1 rounded-xl transition inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Share Public Dossier</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
