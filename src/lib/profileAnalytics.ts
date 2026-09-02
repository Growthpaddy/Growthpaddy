import { supabase } from './supabaseClient';

export interface VisitorLocationStat {
  country: string;
  city: string;
  count: number;
  percentage: number;
  countryCode?: string;
  lastVisited?: string;
}

export interface CountryStat {
  country: string;
  count: number;
  percentage: number;
  code: string;
}

export interface ProfileAnalyticsData {
  totalViews: number;
  totalClicks: number;
  clickThroughRate: number;
  uniqueVisitors: number;
  recentViews: number;
  topLocations: VisitorLocationStat[];
  topCountries: CountryStat[];
  weeklyTrend: Array<{ day: string; views: number; clicks: number }>;
}

/**
 * Get country flag emoji from 2-letter code or country name
 */
export const getCountryFlag = (code?: string, countryName?: string): string => {
  if (code && code.length === 2 && code !== 'XX') {
    const codeUpper = code.toUpperCase();
    try {
      const codePoints = codeUpper
        .split('')
        .map((char) => 127397 + char.charCodeAt(0));
      return String.fromCodePoint(...codePoints);
    } catch {
      // fallback to name matching
    }
  }

  if (!countryName) return '🌐';
  const c = countryName.toLowerCase();

  if (c.includes('united states') || c.includes('usa') || c.includes('america')) return '🇺🇸';
  if (c.includes('united kingdom') || c.includes('uk') || c.includes('britain') || c.includes('england')) return '🇬🇧';
  if (c.includes('nigeria')) return '🇳🇬';
  if (c.includes('germany') || c.includes('deutschland')) return '🇩🇪';
  if (c.includes('canada')) return '🇨🇦';
  if (c.includes('singapore')) return '🇸🇬';
  if (c.includes('france')) return '🇫🇷';
  if (c.includes('netherlands') || c.includes('holland')) return '🇳🇱';
  if (c.includes('australia')) return '🇦🇺';
  if (c.includes('india')) return '🇮🇳';
  if (c.includes('ireland')) return '🇮🇪';
  if (c.includes('south africa')) return '🇿🇦';
  if (c.includes('united arab emirates') || c.includes('dubai') || c.includes('uae')) return '🇦🇪';
  if (c.includes('kenya')) return '🇰🇪';
  if (c.includes('ghana')) return '🇬🇭';
  if (c.includes('switzerland')) return '🇨🇭';
  if (c.includes('sweden')) return '🇸🇪';
  if (c.includes('brazil')) return '🇧🇷';
  if (c.includes('japan')) return '🇯🇵';

  return '🌍';
};

/**
 * Capture Live Location on Visitor/Employer Views
 * Fetches IP location using https://ipapi.co/json/ (or https://ipwho.is/)
 * and fires the Supabase RPC function record_talent_view
 */
export const recordView = async (talentId: string): Promise<{ success: boolean; country?: string; city?: string }> => {
  if (!talentId) return { success: false };

  let country = 'Unknown';
  let countryCode = 'XX';
  let city = 'Unknown';

  try {
    // 1. Try ipapi.co
    const res = await fetch('https://ipapi.co/json/', {
      headers: { Accept: 'application/json' }
    });
    if (res.ok) {
      const geo = await res.json();
      country = geo.country_name || geo.country || 'Unknown';
      countryCode = geo.country_code || geo.country_code_iso3 || 'XX';
      city = geo.city || 'Unknown';
    } else {
      throw new Error(`ipapi.co status ${res.status}`);
    }
  } catch {
    // 2. Fallback to ipwho.is if ipapi is blocked
    try {
      const res2 = await fetch('https://ipwho.is/');
      if (res2.ok) {
        const geo2 = await res2.json();
        country = geo2.country || 'Unknown';
        countryCode = geo2.country_code || 'XX';
        city = geo2.city || 'Unknown';
      }
    } catch {
      // Ignore network errors and proceed with fallback RPC
    }
  }

  try {
    if (country !== 'Unknown' || countryCode !== 'XX') {
      await supabase.rpc('record_talent_view', {
        p_talent_id: talentId,
        p_event_type: 'profile_view',
        p_country: country,
        p_country_code: countryCode,
        p_city: city
      });
    } else {
      await supabase.rpc('record_talent_view', { p_talent_id: talentId });
    }
  } catch (err) {
    // Fallback if RPC fails or table is accessed directly
    try {
      await supabase.rpc('record_talent_view', { p_talent_id: talentId });
    } catch (rpcErr) {
      // Fallback: direct table insert to analytics_events if RPC function is not installed
      try {
        await supabase.from('analytics_events').insert({
          talent_id: talentId,
          event_type: 'profile_view',
          country: country || 'Unknown',
          country_code: countryCode || 'XX',
          city: city || 'Unknown',
          created_at: new Date().toISOString()
        });
      } catch (insertErr) {
        console.warn('[Analytics] direct fallback insert note:', insertErr);
      }
    }
  }

  // Also update talent_profiles views counter if accessible
  try {
    const { data: tp } = await supabase
      .from('talent_profiles')
      .select('id, profile_views_count, view_count')
      .eq('id', talentId)
      .maybeSingle();

    if (tp) {
      const currentViews = Number(tp.profile_views_count ?? tp.view_count ?? 0);
      const nextViews = currentViews + 1;
      await supabase
        .from('talent_profiles')
        .update({
          profile_views_count: nextViews,
          view_count: nextViews,
          updated_at: new Date().toISOString()
        })
        .eq('id', talentId);
    }
  } catch {
    // ignore
  }

  return { success: true, country, city };
};

/**
 * Backward-compatible alias for recordView
 */
export const recordProfileView = async (
  talentId: string,
  _options?: { force?: boolean; candidateName?: string }
): Promise<{ success: boolean; country: string; city: string; newViewCount?: number }> => {
  const result = await recordView(talentId);
  return {
    success: result.success,
    country: result.country || 'Unknown',
    city: result.city || 'Unknown'
  };
};

/**
 * Record a profile interaction/click event
 */
export const recordProfileClick = async (talentId: string): Promise<void> => {
  if (!talentId) return;

  try {
    await supabase.rpc('record_talent_click', { p_talent_id: talentId });
  } catch {
    try {
      await supabase.from('analytics_events').insert({
        talent_id: talentId,
        event_type: 'profile_click',
        country: 'Unknown',
        country_code: 'XX',
        city: 'Unknown',
        created_at: new Date().toISOString()
      });
    } catch {
      // ignore
    }
  }

  try {
    const { data: cur } = await supabase
      .from('talent_profiles')
      .select('id, click_count')
      .eq('id', talentId)
      .maybeSingle();

    const curClicks = Number(cur?.click_count || 0);
    await supabase
      .from('talent_profiles')
      .update({
        click_count: curClicks + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', talentId);
  } catch {
    // ignore
  }
};

/**
 * Query analytics_events for the active user's profile:
 * - Total Impressions: COUNT(*) from analytics_events where talent_id = profile.id
 * - Top Visitor Locations: Group analytics_events by country and city to calculate percentages
 * - Real country flags & names (e.g. United States (42%), United Kingdom (28%), Nigeria (15%))
 * - Zero demo data
 */
export async function getProfileAnalytics(
  talentId: string,
  rawProfile?: any
): Promise<ProfileAnalyticsData> {
  if (!talentId) {
    return {
      totalViews: 0,
      totalClicks: 0,
      clickThroughRate: 0,
      uniqueVisitors: 0,
      recentViews: 0,
      topLocations: [],
      topCountries: [],
      weeklyTrend: []
    };
  }

  // 1. Fetch raw analytics_events from Supabase
  let events: any[] = [];
  try {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('talent_id', talentId)
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      events = data;
    }
  } catch (err) {
    console.warn('[ProfileAnalytics] Note on fetching analytics_events:', err);
  }

  // 2. Fetch profile views count from talent_profiles
  let profileViews = rawProfile?.profile_views_count ?? rawProfile?.view_count ?? 0;
  let profileClicks = rawProfile?.click_count ?? 0;

  try {
    const { data: prof } = await supabase
      .from('talent_profiles')
      .select('id, profile_views_count, view_count, click_count')
      .eq('id', talentId)
      .maybeSingle();

    if (prof) {
      profileViews = Math.max(profileViews, Number(prof.profile_views_count ?? prof.view_count ?? 0));
      profileClicks = Math.max(profileClicks, Number(prof.click_count ?? 0));
    }
  } catch {
    // ignore
  }

  // Total Impressions: COUNT(*) from analytics_events where talent_id = profile.id
  const totalImpressions = Math.max(events.length, profileViews);

  // Group by country and city
  const locationMap = new Map<string, { country: string; city: string; count: number; countryCode: string; lastVisited: string }>();

  events.forEach((ev) => {
    const countryName = (ev.country || ev.p_country || ev.viewer_country || 'Unknown').trim();
    const cityName = (ev.city || ev.p_city || ev.viewer_city || 'Unknown').trim();
    const code = (ev.country_code || ev.p_country_code || ev.countryCode || 'XX').trim();
    const key = `${countryName}__${cityName}`;

    const existing = locationMap.get(key);
    if (existing) {
      existing.count += 1;
      if (ev.created_at && (!existing.lastVisited || new Date(ev.created_at) > new Date(existing.lastVisited))) {
        existing.lastVisited = ev.created_at;
      }
    } else {
      locationMap.set(key, {
        country: countryName,
        city: cityName,
        count: 1,
        countryCode: code,
        lastVisited: ev.created_at || new Date().toISOString()
      });
    }
  });

  const locationList = Array.from(locationMap.values());
  const effectiveTotal = Math.max(totalImpressions, 1);

  const topLocations: VisitorLocationStat[] = locationList
    .sort((a, b) => b.count - a.count)
    .map((item) => ({
      country: item.country,
      city: item.city,
      count: item.count,
      countryCode: item.countryCode,
      percentage: totalImpressions > 0 ? Math.round((item.count / effectiveTotal) * 100) : 0,
      lastVisited: item.lastVisited
    }));

  // Country aggregations
  const countryMap = new Map<string, { country: string; count: number; code: string }>();
  topLocations.forEach((loc) => {
    const cur = countryMap.get(loc.country);
    if (cur) {
      cur.count += loc.count;
    } else {
      countryMap.set(loc.country, { country: loc.country, count: loc.count, code: loc.countryCode || 'XX' });
    }
  });

  const topCountries: CountryStat[] = Array.from(countryMap.values())
    .sort((a, b) => b.count - a.count)
    .map((c) => ({
      country: c.country,
      count: c.count,
      code: c.code,
      percentage: totalImpressions > 0 ? Math.round((c.count / effectiveTotal) * 100) : 0
    }));

  // Group by day for weekly trend (last 7 days)
  const now = new Date();
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyTrendMap = new Map<string, { day: string; views: number; clicks: number }>();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dayLabel = daysOfWeek[d.getDay()];
    const dateStr = d.toISOString().split('T')[0];
    weeklyTrendMap.set(dateStr, { day: dayLabel, views: 0, clicks: 0 });
  }

  events.forEach((ev) => {
    if (ev.created_at) {
      const dateStr = new Date(ev.created_at).toISOString().split('T')[0];
      const entry = weeklyTrendMap.get(dateStr);
      if (entry) {
        if (ev.event_type === 'profile_click') {
          entry.clicks += 1;
        } else {
          entry.views += 1;
        }
      }
    }
  });

  const weeklyTrend = Array.from(weeklyTrendMap.values());

  const clickThroughRate = totalImpressions > 0
    ? Number(((profileClicks / totalImpressions) * 100).toFixed(1))
    : 0;

  return {
    totalViews: totalImpressions,
    totalClicks: profileClicks,
    clickThroughRate,
    uniqueVisitors: topLocations.length > 0 ? topLocations.reduce((acc, curr) => acc + curr.count, 0) : totalImpressions,
    recentViews: events.filter((e) => {
      if (!e.created_at) return false;
      const diffDays = (Date.now() - new Date(e.created_at).getTime()) / (1000 * 60 * 60 * 24);
      return diffDays <= 7;
    }).length,
    topLocations,
    topCountries,
    weeklyTrend
  };
}
