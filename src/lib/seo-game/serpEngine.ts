/**
 * THE SEO GAME — SERP SIMULATION & COMPETITOR ENGINE
 * 
 * Simulates real-time search engine results pages (SERPs), competitor dynamics,
 * organic CTR distribution, and daily performance metrics.
 * 
 * Central Truth:
 * All player page scores are driven by `rankingScoringEngine.ts`.
 */

import { RankingFactors, calculateOverallScore } from './rankingScoringEngine';

export interface SerpResultItem {
  position: number;
  isPlayer: boolean;
  businessId?: string;
  competitorId?: string;
  title: string;
  url: string;
  domain: string;
  rankingScore: number;
  previousPosition?: number | null;
  positionChange?: number;
  ctrPercentage: number;
  estimatedClicks: number;
  entityType: 'player_organic' | 'competitor_organic';
}

export interface SerpSimulationOutcome {
  serpId: string;
  keywordId: string;
  keyword: string;
  searchVolume: number;
  snapshotDay: number;
  playerPosition: number | null;
  previousPosition: number | null;
  positionChange: number;
  playerScore: number;
  playerCtr: number;
  playerImpressions: number;
  playerClicks: number;
  topTenResults: SerpResultItem[];
}

export const REALISTIC_CTR_CURVE: Record<number, number> = {
  1: 31.7,
  2: 15.8,
  3: 9.5,
  4: 6.3,
  5: 4.5,
  6: 3.2,
  7: 2.4,
  8: 1.8,
  9: 1.4,
  10: 1.1,
  11: 0.8,
  12: 0.6,
  13: 0.5,
  14: 0.4,
  15: 0.3,
  16: 0.3,
  17: 0.2,
  18: 0.2,
  19: 0.2,
  20: 0.1
};

export function getEstimatedCtrForPosition(pos: number | null): number {
  if (!pos || pos <= 0 || pos > 100) return 0;
  if (pos <= 20) return REALISTIC_CTR_CURVE[pos] || 0.1;
  if (pos <= 50) return 0.05;
  return 0.01;
}

export const SEED_COMPETITORS = [
  {
    name: 'Flutterwave',
    domain: 'flutterwave.com',
    industry: 'Technology',
    strategy: 'Enterprise API Documentation & Fintech Search Authority',
    difficulty: 58,
    authority_score: 78,
    content_score: 72,
    technical_score: 84
  },
  {
    name: 'PwC Nigeria',
    domain: 'pwc.com/ng',
    industry: 'Technology',
    strategy: 'High-Authority Research Papers & Executive Thought Leadership',
    difficulty: 68,
    authority_score: 88,
    content_score: 82,
    technical_score: 76
  },
  {
    name: 'MTN Nigeria',
    domain: 'mtn.ng',
    industry: 'Technology',
    strategy: 'Massive Telecom Infrastructure & High-Volume Domain Power',
    difficulty: 62,
    authority_score: 86,
    content_score: 65,
    technical_score: 80
  },
  {
    name: 'Konga Online',
    domain: 'konga.com',
    industry: 'Technology',
    strategy: 'High-Volume Catalog Indexation & Category Targeting',
    difficulty: 52,
    authority_score: 74,
    content_score: 68,
    technical_score: 72
  },
  {
    name: 'Dangote Group',
    domain: 'dangote.com',
    industry: 'Technology',
    strategy: 'Conglomerate Brand Equity & High-Value Media Mentions',
    difficulty: 56,
    authority_score: 83,
    content_score: 62,
    technical_score: 70
  },
  {
    name: 'Access Bank Plc',
    domain: 'accessbankplc.com',
    industry: 'Technology',
    strategy: 'Financial Trust Signals & Enterprise Schema Architecture',
    difficulty: 60,
    authority_score: 85,
    content_score: 70,
    technical_score: 78
  },
  {
    name: 'United Bank for Africa (UBA)',
    domain: 'ubagroup.com',
    industry: 'Technology',
    strategy: 'Pan-African Multi-Region Entity SEO & Brand Dominance',
    difficulty: 59,
    authority_score: 84,
    content_score: 69,
    technical_score: 75
  },
  {
    name: 'Jiji Marketplace',
    domain: 'jiji.ng',
    industry: 'Technology',
    strategy: 'User-Generated Content & Long-Tail Query Clustering',
    difficulty: 54,
    authority_score: 76,
    content_score: 78,
    technical_score: 73
  },
  {
    name: 'Unilever Nigeria',
    domain: 'unilever-ewa.com',
    industry: 'Technology',
    strategy: 'FMCG Brand Visibility & Consumer Search Intent',
    difficulty: 55,
    authority_score: 80,
    content_score: 64,
    technical_score: 71
  },
  {
    name: 'Polaris Bank',
    domain: 'polarisbanklimited.com',
    industry: 'Technology',
    strategy: 'Commercial Banking & Regional Search Optimization',
    difficulty: 48,
    authority_score: 71,
    content_score: 60,
    technical_score: 68
  }
];

/**
 * Deterministically generates competitor ranking scores for a given keyword
 */
export function calculateCompetitorKeywordScores(
  keyword: string, 
  competitors: any[]
): Array<{ competitor: any; score: number }> {
  // Deterministic seed hash from keyword string
  let hash = 0;
  for (let i = 0; i < keyword.length; i++) {
    hash = (hash << 5) - hash + keyword.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);

  return competitors.map((comp, idx) => {
    // Competitor base score combines authority, content, and tech
    const base = (comp.authority_score * 0.4) + (comp.content_score * 0.4) + (comp.technical_score * 0.2);
    // Deterministic offset (-6 to +6) per competitor and keyword
    const offset = ((absHash + idx * 37) % 13) - 6;
    const score = Math.max(15, Math.min(95, Math.round((base + offset) * 10) / 10));
    return { competitor: comp, score };
  });
}

/**
 * Simulates SERP rankings for a targeted keyword comparing player against competitors
 */
export function simulateSerpRankings(params: {
  keyword: {
    id: string;
    keyword: string;
    search_volume: number;
    difficulty: number;
    current_position?: number | null;
  };
  playerPage: {
    id: string;
    title: string;
    slug: string;
  };
  playerDomain: string;
  businessId: string;
  playerRankingFactors: RankingFactors;
  competitors: any[];
  currentDay: number;
}): SerpSimulationOutcome {
  const { keyword, playerPage, playerDomain, businessId, playerRankingFactors, competitors, currentDay } = params;

  // 1. Calculate authoritative player score from 10 factors
  const playerScore = calculateOverallScore(playerRankingFactors);

  // 2. Calculate competitor scores
  const compScores = calculateCompetitorKeywordScores(keyword.keyword, competitors);

  // 3. Assemble all entries
  const allEntries: Array<{
    isPlayer: boolean;
    businessId?: string;
    competitorId?: string;
    title: string;
    url: string;
    domain: string;
    score: number;
    previousPos?: number | null;
  }> = [
    {
      isPlayer: true,
      businessId,
      title: `${playerPage.title} | ${playerDomain}`,
      url: `https://${playerDomain}/${playerPage.slug}`,
      domain: playerDomain,
      score: playerScore,
      previousPos: keyword.current_position ?? null
    },
    ...compScores.map(({ competitor, score }) => ({
      isPlayer: false,
      competitorId: competitor.id,
      title: `${keyword.keyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}: The Definitive Guide | ${competitor.name}`,
      url: `https://${competitor.domain}/${keyword.keyword.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      domain: competitor.domain,
      score
    }))
  ];

  // 4. Deterministic Sort: Descending by score
  allEntries.sort((a, b) => b.score - a.score);

  // 5. Assign positions & calculate metrics
  let playerPosition: number | null = null;
  let playerCtr = 0;
  let playerImpressions = 0;
  let playerClicks = 0;

  const topTenResults: SerpResultItem[] = [];

  allEntries.forEach((entry, idx) => {
    const pos = idx + 1;
    const ctr = getEstimatedCtrForPosition(pos);
    const estimatedClicks = Math.round(keyword.search_volume * (ctr / 100));

    if (entry.isPlayer) {
      playerPosition = pos;
      playerCtr = ctr;
      playerImpressions = keyword.search_volume;
      playerClicks = estimatedClicks;
    }

    if (pos <= 10) {
      topTenResults.push({
        position: pos,
        isPlayer: entry.isPlayer,
        businessId: entry.businessId,
        competitorId: entry.competitorId,
        title: entry.title,
        url: entry.url,
        domain: entry.domain,
        rankingScore: entry.score,
        previousPosition: entry.isPlayer ? keyword.current_position : null,
        positionChange: entry.isPlayer && keyword.current_position 
          ? (keyword.current_position - pos) 
          : 0,
        ctrPercentage: ctr,
        estimatedClicks,
        entityType: entry.isPlayer ? 'player_organic' : 'competitor_organic'
      });
    }
  });

  const prev = keyword.current_position ?? null;
  const posChange = prev && playerPosition ? (prev - playerPosition) : 0;

  return {
    serpId: '', // To be filled on database insertion
    keywordId: keyword.id,
    keyword: keyword.keyword,
    searchVolume: keyword.search_volume,
    snapshotDay: currentDay,
    playerPosition,
    previousPosition: prev,
    positionChange: posChange,
    playerScore,
    playerCtr,
    playerImpressions,
    playerClicks,
    topTenResults
  };
}

export interface BusinessFunnelResult {
  dailyClicks: number;
  dailyLeads: number;
  dailyCustomers: number;
  grossRevenue: number;
  operatingExpenses: number;
  netProfit: number;
  previousBudget: number;
  newBudget: number;
}

/**
 * Deterministically evaluates the daily business funnel:
 * Organic Clicks -> Leads (3.5%) -> Paying Customers (15%) -> Gross Revenue (₦125,000/deal)
 * -> Operating Expenses -> Net Profit -> Updated Budget.
 * Avoids fractional customers or deals.
 */
export function calculateBusinessFunnel(params: {
  totalDailyClicks: number;
  currentBudget: number;
  day: number;
  playerId: string;
}): BusinessFunnelResult {
  const { totalDailyClicks, currentBudget } = params;

  // 1. Organic Clicks -> Qualified Leads (3.5% conversion)
  const dailyLeads = Math.floor(totalDailyClicks * 0.035);

  // 2. Qualified Leads -> Closed Deals / Customers (15% close rate)
  // Integer customers only: 1 customer per ~7 leads
  const dailyCustomers = Math.floor((dailyLeads * 15) / 100);

  // 3. Gross Revenue: ₦125,000 per closed deal
  const grossRevenue = dailyCustomers * 125000;

  // 4. Daily Operating Expenses: Baseline overhead + 1.5% infrastructure expense
  const operatingExpenses = Math.min(25000, 10000 + Math.floor(currentBudget * 0.015));

  // 5. Net Profit (Conceptually distinct from Gross Revenue)
  const netProfit = grossRevenue - operatingExpenses;

  // 6. Updated Business Budget (Cannot drop below 0)
  const newBudget = Math.max(0, currentBudget + netProfit);

  return {
    dailyClicks: totalDailyClicks,
    dailyLeads,
    dailyCustomers,
    grossRevenue,
    operatingExpenses,
    netProfit,
    previousBudget: currentBudget,
    newBudget
  };
}

export interface CompetitorDayActionOutcome {
  competitorId: string;
  competitorName: string;
  actionType: string;
  description: string;
  impactScore: number;
  newScores: {
    authority_score: number;
    content_score: number;
    technical_score: number;
  };
}

/**
 * Simulates daily competitor actions based on individual strategic profiles.
 * Guaranteed reproducible per competitor and day; uses deterministic IDs to prevent duplicate rows.
 */
export async function simulateDailyCompetitorActions(params: {
  competitors: any[];
  currentDay: number;
  keywords: any[];
  supabase: any;
}): Promise<CompetitorDayActionOutcome[]> {
  const { competitors, currentDay, keywords, supabase } = params;
  const outcomes: CompetitorDayActionOutcome[] = [];

  for (const comp of competitors) {
    let actionType = 'CONTENT_OPTIMIZATION';
    let description = 'Refined semantic content depth and on-page topical authority.';
    let impactScore = 1.0;
    let authDelta = 0;
    let contentDelta = 0;
    let techDelta = 0;

    switch (comp.strategy) {
      case 'Enterprise API Documentation & Fintech Search Authority':
        actionType = 'CONTENT_PUBLISHING';
        description = 'Published comprehensive developer API architecture guide and structured data.';
        contentDelta = 1.8;
        techDelta = 1.2;
        impactScore = 1.8;
        break;

      case 'High-Authority Research Papers & Executive Thought Leadership':
        actionType = 'AUTHORITY_OUTREACH';
        description = 'Published quarterly executive macroeconomic report with major financial press citations.';
        authDelta = 2.0;
        contentDelta = 1.5;
        impactScore = 2.0;
        break;

      case 'Massive Telecom Infrastructure & High-Volume Domain Power':
        actionType = 'TECHNICAL_UPGRADE';
        description = 'Expanded high-speed edge caching network across regional distribution points.';
        techDelta = 2.2;
        authDelta = 0.8;
        impactScore = 1.9;
        break;

      case 'High-Volume Catalog Indexation & Category Targeting':
        actionType = 'CONTENT_OPTIMIZATION';
        description = 'Optimized internal linking taxonomy across high-intent category search clusters.';
        contentDelta = 1.5;
        techDelta = 1.0;
        impactScore = 1.4;
        break;

      case 'Conglomerate Brand Equity & High-Value Media Mentions':
        actionType = 'AUTHORITY_OUTREACH';
        description = 'Secured high-level corporate media features and international business journal mentions.';
        authDelta = 2.2;
        impactScore = 2.2;
        break;

      case 'Financial Trust Signals & Enterprise Schema Architecture':
        actionType = 'TECHNICAL_UPGRADE';
        description = 'Implemented advanced FinancialProduct Schema and institutional security trust verifications.';
        techDelta = 1.8;
        authDelta = 1.0;
        impactScore = 1.6;
        break;

      case 'Pan-African Multi-Region Entity SEO & Brand Dominance':
        actionType = 'CONTENT_PUBLISHING';
        description = 'Expanded multi-region hreflang localization across pan-African digital banking portals.';
        contentDelta = 1.6;
        authDelta = 1.4;
        impactScore = 1.7;
        break;

      case 'User-Generated Content & Long-Tail Query Clustering':
        actionType = 'CONTENT_REFRESH';
        description = 'Refreshed algorithmic consumer listing entity graphs and seller review schema markup.';
        contentDelta = 1.7;
        techDelta = 0.9;
        impactScore = 1.5;
        break;

      case 'FMCG Brand Visibility & Consumer Search Intent':
        actionType = 'CONTENT_OPTIMIZATION';
        description = 'Optimized high-volume consumer intent pillar guides and household product entities.';
        contentDelta = 1.6;
        impactScore = 1.3;
        break;

      case 'Commercial Banking & Regional Search Optimization':
        actionType = 'CONTENT_REFRESH';
        description = 'Optimized regional commercial banking hub pages and local commercial intent signals.';
        contentDelta = 1.4;
        techDelta = 1.0;
        impactScore = 1.3;
        break;

      case 'Authority & Technical Domination':
        if (currentDay % 2 === 0) {
          actionType = 'TECHNICAL_UPGRADE';
          description = 'Upgraded CDN infrastructure and eliminated Core Web Vitals latency.';
          techDelta = 1.5;
          impactScore = 1.5;
        } else {
          actionType = 'AUTHORITY_OUTREACH';
          description = 'Secured high-authority industry media citation.';
          authDelta = 1.8;
          impactScore = 1.8;
        }
        break;

      case 'Content Depth & Semantic Clusters':
        actionType = 'CONTENT_PUBLISHING';
        description = 'Published deep topical entity cluster guide.';
        contentDelta = 2.0;
        impactScore = 2.0;
        break;

      case 'Fast Agile Content Marketing':
        actionType = 'CONTENT_REFRESH';
        description = 'Updated schema markup and refreshed publication timestamps.';
        contentDelta = 1.2;
        techDelta = 0.8;
        impactScore = 1.2;
        break;

      case 'Aggressive Backlink Profiles':
      default:
        actionType = 'LINK_BUILDING_CAMPAIGN';
        description = 'Acquired authoritative contextual backlinks in industry niche.';
        authDelta = 2.2;
        impactScore = 2.2;
        break;
    }

    const updatedAuthority = Math.min(95, Math.round(((comp.authority_score || 50) + authDelta) * 10) / 10);
    const updatedContent = Math.min(95, Math.round(((comp.content_score || 50) + contentDelta) * 10) / 10);
    const updatedTech = Math.min(95, Math.round(((comp.technical_score || 50) + techDelta) * 10) / 10);

    // Update competitor scores
    await supabase
      .from('seo_game_competitors')
      .update({
        authority_score: updatedAuthority,
        content_score: updatedContent,
        technical_score: updatedTech
      })
      .eq('id', comp.id);

    // Record action deterministically
    const crypto = await import('crypto');
    const hash = crypto.createHash('sha256').update(`${comp.id}:action-day-${currentDay}`).digest('hex');
    const actionId = [
      hash.substring(0, 8),
      hash.substring(8, 12),
      '4' + hash.substring(13, 16),
      ((parseInt(hash.substring(16, 18), 16) & 0x3f) | 0x80).toString(16).padStart(2, '0') + hash.substring(18, 20),
      hash.substring(20, 32)
    ].join('-');

    await supabase
      .from('seo_game_competitor_actions')
      .upsert({
        id: actionId,
        competitor_id: comp.id,
        action_type: actionType,
        impact_score: impactScore,
        description,
        created_at: new Date().toISOString()
      });

    // If publishing, record competitor page deterministically
    if (actionType === 'CONTENT_PUBLISHING' && keywords.length > 0) {
      const kw = keywords[0];
      const pageHash = crypto.createHash('sha256').update(`${comp.id}:page-day-${currentDay}`).digest('hex');
      const pageId = [
        pageHash.substring(0, 8),
        pageHash.substring(8, 12),
        '4' + pageHash.substring(13, 16),
        ((parseInt(pageHash.substring(16, 18), 16) & 0x3f) | 0x80).toString(16).padStart(2, '0') + pageHash.substring(18, 20),
        pageHash.substring(20, 32)
      ].join('-');

      await supabase
        .from('seo_game_competitor_pages')
        .upsert({
          id: pageId,
          competitor_id: comp.id,
          url: `https://${comp.domain}/${kw.keyword.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          title: `${kw.keyword}: Benchmark Guide`,
          page_type: 'blog',
          content_score: updatedContent,
          authority_score: updatedAuthority,
          relevance_score: 85,
          created_at: new Date().toISOString()
        });
    }

    outcomes.push({
      competitorId: comp.id,
      competitorName: comp.name,
      actionType,
      description,
      impactScore,
      newScores: {
        authority_score: updatedAuthority,
        content_score: updatedContent,
        technical_score: updatedTech
      }
    });
  }

  return outcomes;
}

