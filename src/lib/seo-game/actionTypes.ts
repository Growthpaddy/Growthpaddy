/**
 * THE SEO GAME — CANONICAL ACTION TYPES & SCHEMAS
 * Decoupled action specifications safe for both client and server consumption.
 */

import type { RankingFactors, RankingFactorKey, PagePotentialResult } from './rankingScoringEngine';

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
