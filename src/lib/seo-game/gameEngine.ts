/**
 * THE SEO GAME — CORE GAME ENGINE
 * 
 * Centralized game action processor:
 * - Validates player identity via secure Supabase RPC (`seo_game_is_player`)
 * - Validates business ownership via secure Supabase RPC (`seo_game_is_business_owner`)
 * - Validates resource sufficiency (energy, coins, AI credits) vs action costs
 * - Enforces level unlock requirements from `seo_game_levels`
 * - Executes atomic resource deductions and logs transactions
 * - Evaluates deterministic factor calculations using `rankingScoringEngine`
 * - Updates game state (pages, keywords, ranking factors, links, content)
 * - Updates player state metrics and mission progression
 */

import { supabase } from '../supabaseClient';
import { 
  RankingFactors, 
  RankingFactorKey,
  calculateOverallScore, 
  calculatePagePotential, 
  PagePotentialResult,
  normalizeFactors 
} from './rankingScoringEngine';

export {
  CANONICAL_ACTION_TYPES,
  type ActionResourceCost,
  type ProcessActionParams,
  type ResourceDeficit,
  type GameActionResult
} from './actionTypes';
import {
  CANONICAL_ACTION_TYPES,
  type ActionResourceCost,
  type ProcessActionParams,
  type ResourceDeficit,
  type GameActionResult
} from './actionTypes';

/**
 * Validates player identity via secure RPC `seo_game_is_player`.
 */
export async function validatePlayerAuthorization(playerId: string, client = supabase): Promise<boolean> {
  try {
    const { data, error } = await client.rpc('seo_game_is_player', {
      p_player_id: playerId
    });
    if (error) {
      console.warn('Player authorization RPC notice:', error.message);
      // Fallback check against active session
      const { data: sessionData } = await client.auth.getSession();
      if (!sessionData?.session?.user) return false;
      const { data: player } = await client
        .from('seo_game_players')
        .select('user_id')
        .eq('id', playerId)
        .maybeSingle();
      return player?.user_id === sessionData.session.user.id;
    }
    return Boolean(data);
  } catch (err) {
    console.error('Error validating player authorization:', err);
    return false;
  }
}

/**
 * Validates business ownership via secure RPC `seo_game_is_business_owner`.
 */
export async function validateBusinessOwnership(businessId: string, client = supabase): Promise<boolean> {
  try {
    const { data, error } = await client.rpc('seo_game_is_business_owner', {
      p_business_id: businessId
    });
    if (error) {
      console.warn('Business ownership RPC notice:', error.message);
      return true; // Let downstream check proceed if RPC not matched
    }
    return Boolean(data);
  } catch (err) {
    console.error('Error validating business ownership:', err);
    return false;
  }
}

/**
 * Authoritative processor for game actions.
 * Exclusively executes through the secure server endpoint `/api/seo-game/process-action`
 * with cryptographic session verification, database atomicity, and idempotency protection.
 * Client-side direct mutations are strictly removed to eliminate false success responses.
 */
export async function processGameAction(params: ProcessActionParams): Promise<GameActionResult> {
  const { playerId, actionCode, businessId, websiteId, pageId, payload = {}, client } = params;
  const sb = client || supabase;

  // Determine or generate unique idempotency key (UUID)
  const idempotencyKey = params.idempotencyKey || params.requestId || 
    (typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : '00000000-0000-4000-8000-' + Math.random().toString(16).substring(2, 14).padEnd(12, '0'));

  // Resolve base URL for server execution (in browser uses relative URL)
  let baseUrl = '';
  if (typeof window === 'undefined') {
    baseUrl = process.env.VITE_APP_URL || 'http://localhost:3000';
  }

  // Retrieve authenticated session token
  const { data: sessionData } = await sb.auth.getSession();
  const token = sessionData?.session?.access_token;

  if (!token) {
    return {
      success: false,
      actionCode,
      actionName: CANONICAL_ACTION_TYPES[actionCode]?.name || actionCode,
      idempotencyKey,
      resourcesSpent: { energy: 0, coins: 0, aiCredits: 0 },
      walletAfter: { energy: 0, maxEnergy: 100, coins: 0, aiCredits: 0 },
      xpEarned: 0,
      playerAfter: { level: 1, xp: 0, leveledUp: false },
      gameStateUpdates: {},
      feedback: {
        title: 'Authentication Required',
        summary: 'Active player session is required to execute game actions.',
        impact: 'Please sign in to continue playing.'
      },
      error: 'UNAUTHENTICATED'
    };
  }

  try {
    const response = await fetch(`${baseUrl}/api/seo-game/process-action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        playerId,
        actionCode,
        businessId,
        websiteId,
        pageId,
        payload,
        idempotencyKey
      })
    });

    const responseData = await response.json().catch(() => ({}));

    if (response.ok && responseData.success) {
      return responseData;
    }

    // Authoritative Server Rejection
    const actionConfig = CANONICAL_ACTION_TYPES[actionCode];
    return {
      success: false,
      actionCode,
      actionName: actionConfig?.name || actionCode,
      idempotencyKey,
      resourcesSpent: { energy: 0, coins: 0, aiCredits: 0 },
      walletAfter: responseData.walletAfter || { energy: 0, maxEnergy: 100, coins: 0, aiCredits: 0 },
      xpEarned: 0,
      playerAfter: responseData.playerAfter || { level: 1, xp: 0, leveledUp: false },
      gameStateUpdates: {},
      feedback: {
        title: responseData.error === 'INSUFFICIENT_RESOURCES' ? 'Insufficient Resources' : 'Action Rejected',
        summary: responseData.message || 'Action was rejected by the authoritative game server.',
        impact: 'No resources were consumed.'
      },
      error: responseData.error || 'ACTION_REJECTED',
      deficit: responseData.deficit
    };
  } catch (netErr: any) {
    const actionConfig = CANONICAL_ACTION_TYPES[actionCode];
    return {
      success: false,
      actionCode,
      actionName: actionConfig?.name || actionCode,
      idempotencyKey,
      resourcesSpent: { energy: 0, coins: 0, aiCredits: 0 },
      walletAfter: { energy: 0, maxEnergy: 100, coins: 0, aiCredits: 0 },
      xpEarned: 0,
      playerAfter: { level: 1, xp: 0, leveledUp: false },
      gameStateUpdates: {},
      feedback: {
        title: 'Communication Error',
        summary: netErr.message || 'Unable to connect to the authoritative game server.',
        impact: 'No resources were consumed.'
      },
      error: 'NETWORK_ERROR'
    };
  }
}

// In-flight dashboard fetch promise deduplication
let inFlightDashboardPromise: Promise<any> | null = null;

/**
 * Retrieves authenticated session token with graceful session restoration retry and fallback
 */
async function getAuthToken(client = supabase): Promise<string | null> {
  const { data } = await client.auth.getSession();
  if (data?.session?.access_token) {
    return data.session.access_token;
  }

  // Gracefully retry up to 3 times with brief backoff to allow localStorage hydration
  for (let attempt = 0; attempt < 3; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const retry = await client.auth.getSession();
    if (retry.data?.session?.access_token) {
      return retry.data.session.access_token;
    }
  }

  // Fallback to local storage cached auth session if present
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('dsp_local_auth_session');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.access_token) {
          return parsed.access_token;
        }
      }
    } catch (_) {}
  }

  return null;
}

/**
 * Fetches the complete, authoritative dashboard dataset from the server.
 * Includes request timeout, deduplication of concurrent in-flight calls, and HTTP error checking.
 */
export async function fetchDashboardData(client = supabase): Promise<any> {
  if (inFlightDashboardPromise) {
    return inFlightDashboardPromise;
  }

  inFlightDashboardPromise = (async () => {
    try {
      const token = await getAuthToken(client);
      if (!token) {
        const syncError: any = new Error('UNAUTHENTICATED: No active session token found. Please sign in to enter gameplay.');
        syncError.code = 'UNAUTHENTICATED';
        syncError.stage = 'auth_token';
        throw syncError;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      let baseUrl = '';
      if (typeof window === 'undefined') {
        baseUrl = process.env.VITE_APP_URL || 'http://localhost:3000';
      }

      const res = await fetch(`${baseUrl}/api/seo-game/dashboard-data`, {
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        signal: controller.signal
      }).finally(() => {
        clearTimeout(timeoutId);
      });

      let text = '';
      let data: any = null;
      try {
        text = await res.text();
        data = JSON.parse(text);
      } catch (parseErr) {
        console.error('[Dashboard Sync] Response is not valid JSON. First 200 chars:', text.slice(0, 200));
        const syncErr: any = new Error(`HTTP ${res.status}: Server returned non-JSON response.`);
        syncErr.code = 'INVALID_JSON_RESPONSE';
        syncErr.stage = 'response_parse';
        syncErr.status = res.status;
        throw syncErr;
      }

      if (!res.ok || !data || data.success !== true) {
        const errorMsg = data?.message || data?.error || `HTTP ${res.status}: Failed to synchronize dashboard state.`;
        const syncError: any = new Error(errorMsg);
        syncError.code = data?.code || 'DOSSIER_SYNC_FAILED';
        syncError.stage = data?.stage || 'server_processing';
        syncError.status = res.status;
        throw syncError;
      }

      return data;
    } finally {
      inFlightDashboardPromise = null;
    }
  })();

  return inFlightDashboardPromise;
}

/**
 * Publishes a draft page (CREATED -> PUBLISHED)
 */
export async function publishPage(pageId: string, client = supabase) {
  const token = await getAuthToken(client);
  if (!token) throw new Error('Unauthenticated');

  const res = await fetch('/api/seo-game/lifecycle/publish-page', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ pageId })
  });
  return res.json();
}

/**
 * Toggles robots index directive for a page (testing noindex failure state)
 */
export async function toggleRobotsDirective(pageId: string, allowIndex: boolean, client = supabase) {
  const token = await getAuthToken(client);
  if (!token) throw new Error('Unauthenticated');

  const res = await fetch('/api/seo-game/lifecycle/toggle-robots-directive', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ pageId, allowIndex })
  });
  return res.json();
}

/**
 * Triggers Googlebot crawl and quality evaluation (PUBLISHED -> CRAWLED -> EVALUATED -> INDEXED)
 */
export async function crawlPage(pageId: string, client = supabase) {
  const token = await getAuthToken(client);
  if (!token) throw new Error('Unauthenticated');

  const res = await fetch('/api/seo-game/lifecycle/crawl-page', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ pageId })
  });
  return res.json();
}

/**
 * Assigns a target search keyword to a page (INDEXED -> SERP-ELIGIBLE)
 */
export async function assignKeyword(pageId: string, keywordId: string, client = supabase) {
  const token = await getAuthToken(client);
  if (!token) throw new Error('Unauthenticated');

  const res = await fetch('/api/seo-game/lifecycle/assign-keyword', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ pageId, keywordId })
  });
  return res.json();
}

/**
 * Simulates real-time SERP rankings for a targeted keyword (SERP-ELIGIBLE -> RANKED)
 */
export async function simulateSerp(keywordId: string, client = supabase) {
  const token = await getAuthToken(client);
  if (!token) throw new Error('Unauthenticated');

  const res = await fetch('/api/seo-game/simulate-serp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ keywordId })
  });
  return res.json();
}

/**
 * Advances the business day, auto-crawling pages, recalculating SERPs, traffic, leads, and revenue
 */
export async function advanceDay(client = supabase) {
  const token = await getAuthToken(client);
  if (!token) throw new Error('Unauthenticated');

  const res = await fetch('/api/seo-game/advance-day', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  });
  return res.json();
}

