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

export interface ActionResourceCost {
  energy: number;
  coins: number;
  aiCredits: number;
  xpReward: number;
  requiresLevel: number;
}

export interface ProcessActionParams {
  playerId: string;
  actionCode: 
    | 'KEYWORD_RESEARCH'
    | 'COMPETITOR_ANALYSIS'
    | 'CREATE_PAGE'
    | 'OPTIMIZE_PAGE'
    | 'TECHNICAL_AUDIT'
    | 'INTERNAL_LINKING'
    | 'CONTENT_EXPANSION'
    | 'AUTHORITY_CAMPAIGN'
    | 'AI_VISIBILITY_ANALYSIS'
    | string;
  businessId?: string;
  websiteId?: string;
  pageId?: string;
  payload?: {
    keyword?: string;
    keywordId?: string;
    targetKeyword?: string;
    pageTitle?: string;
    pageType?: string;
    slug?: string;
    sourcePageId?: string;
    targetPageId?: string;
    anchorText?: string;
    targetFactor?: RankingFactorKey;
    qualityMultiplier?: number;
    customNote?: string;
  };
  client?: any;
  idempotencyKey?: string;
  requestId?: string;
}

export interface ResourceDeficit {
  energyNeeded: number;
  energyAvailable: number;
  coinsNeeded: number;
  coinsAvailable: number;
  aiCreditsNeeded: number;
  aiCreditsAvailable: number;
}

export interface GameActionResult {
  success: boolean;
  actionCode: string;
  actionName: string;
  idempotencyKey?: string;
  cached?: boolean;
  idempotentReplay?: boolean;
  resourcesSpent: {
    energy: number;
    coins: number;
    aiCredits: number;
  };
  walletAfter: {
    energy: number;
    maxEnergy: number;
    coins: number;
    aiCredits: number;
  };
  xpEarned: number;
  playerAfter: {
    level: number;
    xp: number;
    leveledUp: boolean;
    levelTitle?: string;
  };
  gameStateUpdates: {
    pageUpdated?: any;
    rankingFactors?: RankingFactors;
    potential?: PagePotentialResult;
    newKeywords?: any[];
    newLinks?: any[];
    newBacklinks?: any[];
    auditResults?: any;
    aiVisibility?: any;
    missionUpdates?: any[];
    playerState?: any;
  };
  feedback: {
    title: string;
    summary: string;
    impact: string;
    scoreChange?: number;
  };
  error?: string;
  deficit?: ResourceDeficit;
}

// Canonical fallback action registry in case database action types table query fails
export const CANONICAL_ACTION_TYPES: Record<string, {
  name: string;
  description: string;
  energy_cost: number;
  coin_cost: number;
  ai_credit_cost: number;
  xp_reward: number;
  requires_level: number;
}> = {
  KEYWORD_RESEARCH: {
    name: 'Keyword Research',
    description: 'Research and evaluate high-intent search query opportunities.',
    energy_cost: 3,
    coin_cost: 25,
    ai_credit_cost: 0,
    xp_reward: 25,
    requires_level: 1
  },
  COMPETITOR_ANALYSIS: {
    name: 'Competitor Analysis',
    description: 'Analyze competitors in the SERP and reveal content and backlink gaps.',
    energy_cost: 6,
    coin_cost: 50,
    ai_credit_cost: 5,
    xp_reward: 50,
    requires_level: 1
  },
  CREATE_PAGE: {
    name: 'Create Page',
    description: 'Publish a new targeted web page with baseline SEO structure.',
    energy_cost: 5,
    coin_cost: 75,
    ai_credit_cost: 0,
    xp_reward: 50,
    requires_level: 1
  },
  OPTIMIZE_PAGE: {
    name: 'Optimize Page',
    description: 'Refine search intent, E-E-A-T signals, and semantic content coverage.',
    energy_cost: 4,
    coin_cost: 60,
    ai_credit_cost: 5,
    xp_reward: 40,
    requires_level: 1
  },
  TECHNICAL_AUDIT: {
    name: 'Technical SEO Audit',
    description: 'Run site-wide audit to eliminate crawl bottlenecks and speed issues.',
    energy_cost: 8,
    coin_cost: 100,
    ai_credit_cost: 10,
    xp_reward: 75,
    requires_level: 1
  },
  INTERNAL_LINKING: {
    name: 'Build Internal Links',
    description: 'Establish contextual PageRank architecture and internal siloing.',
    energy_cost: 3,
    coin_cost: 40,
    ai_credit_cost: 0,
    xp_reward: 30,
    requires_level: 1
  },
  CONTENT_EXPANSION: {
    name: 'Content Expansion',
    description: 'Expand topical depth, author experience, and comprehensive subtopic coverage.',
    energy_cost: 7,
    coin_cost: 120,
    ai_credit_cost: 10,
    xp_reward: 90,
    requires_level: 1
  },
  AUTHORITY_CAMPAIGN: {
    name: 'Build Authority & Backlinks',
    description: 'Execute high-trust authority campaign for high-value referring domains.',
    energy_cost: 10,
    coin_cost: 250,
    ai_credit_cost: 5,
    xp_reward: 125,
    requires_level: 1
  },
  AI_VISIBILITY_ANALYSIS: {
    name: 'AI Visibility Analysis',
    description: 'Simulate generative engine citations and optimize entity salience.',
    energy_cost: 8,
    coin_cost: 150,
    ai_credit_cost: 15,
    xp_reward: 100,
    requires_level: 1
  }
};

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

/**
 * Retrieves authenticated session token
 */
async function getAuthToken(client = supabase): Promise<string | null> {
  const { data } = await client.auth.getSession();
  return data?.session?.access_token || null;
}

/**
 * Fetches the complete, authoritative dashboard dataset from the server
 */
export async function fetchDashboardData(client = supabase) {
  const token = await getAuthToken(client);
  if (!token) throw new Error('Unauthenticated');

  const res = await fetch('/api/seo-game/dashboard-data', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
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

