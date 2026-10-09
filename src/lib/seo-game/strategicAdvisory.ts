/**
 * THE SEO GAME — STRATEGIC ADVISORY & TRADE-OFFS ENGINE
 * 
 * Analyzes authoritative game state (pages, keywords, competitors, metrics, wallet)
 * to deliver clear strategic recommendations, identify operational bottlenecks, and
 * present structured investment trade-offs with explicit costs, benefits, and uncertainty.
 */

export interface StrategicRecommendation {
  id: string;
  category: 'URGENT' | 'HIGH_PRIORITY' | 'GROWTH' | 'EFFICIENCY';
  title: string;
  description: string;
  rationale: string;
  actionCode?: string;
  suggestedActionLabel?: string;
  impactPotential: 'Critical' | 'High' | 'Medium';
}

export interface StrategicTradeOff {
  id: string;
  title: string;
  dilemma: string;
  optionA: {
    title: string;
    description: string;
    costExplanation: string;
    expectedUpside: string;
    riskOrUncertainty: string;
    actionCode?: string;
  };
  optionB: {
    title: string;
    description: string;
    costExplanation: string;
    expectedUpside: string;
    riskOrUncertainty: string;
    actionCode?: string;
  };
}

/**
 * Evaluates current player game state to generate authoritative strategic guidance
 */
export function analyzeStrategicSituation(params: {
  pages: any[];
  keywords: any[];
  metrics: any;
  wallet: any;
  business: any;
  competitors: any[];
  currentDay: number;
}): {
  primaryRecommendation: StrategicRecommendation;
  allRecommendations: StrategicRecommendation[];
  tradeOffs: StrategicTradeOff[];
} {
  const { pages = [], keywords = [], metrics, wallet, business, competitors = [], currentDay } = params;

  const recommendations: StrategicRecommendation[] = [];

  // Check 1: Crawl directive blocks (robots_index === false)
  const blockedPages = pages.filter(p => p.published_at && p.robots_index === false);
  if (blockedPages.length > 0) {
    recommendations.push({
      id: 'unblock_crawlers',
      category: 'URGENT',
      title: `Unblock Crawlers on ${blockedPages.length} Page(s)`,
      description: `Page "${blockedPages[0].title}" has a "noindex" tag. Simulated search crawlers cannot evaluate or rank blocked pages.`,
      rationale: 'Search engine bots strictly obey noindex tags. Unblocking takes 0 resources and restores indexation eligibility.',
      actionCode: 'TECHNICAL_AUDIT',
      suggestedActionLabel: 'Review Crawl Directives',
      impactPotential: 'Critical'
    });
  }

  // Check 2: All pages in draft state
  const publishedPages = pages.filter(p => Boolean(p.published_at));
  if (pages.length > 0 && publishedPages.length === 0) {
    recommendations.push({
      id: 'publish_first_draft',
      category: 'URGENT',
      title: 'Publish Your Draft Pages',
      description: `You have ${pages.length} draft page(s) ready. Publication is required before Googlebot can discover and evaluate your content.`,
      rationale: 'Draft pages generate 0 impressions, 0 clicks, and 0 commercial leads. Publish to enter the crawl queue.',
      suggestedActionLabel: 'Publish Page to Domain',
      impactPotential: 'Critical'
    });
  }

  // Check 3: Zero pages created
  if (pages.length === 0) {
    recommendations.push({
      id: 'create_first_page',
      category: 'URGENT',
      title: 'Create Your First Authority Landing Page',
      description: 'Your business website has no pages. A comprehensive pillar page is the foundation for search engine rankings.',
      rationale: 'Without indexed URLs, search engines have no target to evaluate or rank for commercial buyer queries.',
      actionCode: 'CREATE_PAGE',
      suggestedActionLabel: 'Draft Initial Page (10 Energy, ₦50k)',
      impactPotential: 'Critical'
    });
  }

  // Check 4: Untargeted Keywords
  const targetedKeywordIds = new Set(pages.map(p => p.targetKeyword?.id).filter(Boolean));
  const untargetedKeywords = keywords.filter(k => !targetedKeywordIds.has(k.id));
  if (publishedPages.length > 0 && untargetedKeywords.length > 0 && targetedKeywordIds.size === 0) {
    recommendations.push({
      id: 'assign_target_keyword',
      category: 'HIGH_PRIORITY',
      title: 'Assign Target Keywords to Published Pages',
      description: `You have ${untargetedKeywords.length} researched keyword(s) with no assigned target page. Pair pages with search queries.`,
      rationale: 'A page cannot rank in Google SERPs without a primary targeted query to match search intent.',
      suggestedActionLabel: 'Connect Primary Keyword',
      impactPotential: 'High'
    });
  }

  // Check 5: Low Content Quality Score (< 65)
  const weakContentPages = pages.filter(p => (p.content_quality_score || 0) < 65);
  if (weakContentPages.length > 0) {
    recommendations.push({
      id: 'elevate_content_depth',
      category: 'GROWTH',
      title: 'Deepen Content Quality & Semantic Coverage',
      description: `Page "${weakContentPages[0].title}" has content quality ${weakContentPages[0].content_quality_score || 50}/100. Google requires deep, helpful insights.`,
      rationale: 'The central ranking model assigns 18% weight to Content Depth & Quality. Expanding to 1,500+ words elevates ranking potential.',
      actionCode: 'EXPAND_CONTENT',
      suggestedActionLabel: 'Expand Content (15 Energy, ₦75k)',
      impactPotential: 'High'
    });
  }

  // Check 6: Technical Bottlenecks (< 70)
  const weakTechPages = pages.filter(p => (p.page_speed_score || 0) < 70);
  if (weakTechPages.length > 0) {
    recommendations.push({
      id: 'fix_technical_health',
      category: 'EFFICIENCY',
      title: 'Resolve Page Speed & Technical Architecture',
      description: `Technical health is at ${weakTechPages[0].page_speed_score || 50}/100. Core Web Vitals latency hurts ranking efficiency.`,
      rationale: 'Technical health carries 10% direct weight and acts as a gateway for crawler efficiency and mobile evaluation.',
      actionCode: 'TECHNICAL_AUDIT',
      suggestedActionLabel: 'Run Technical Audit (20 Energy, ₦100k)',
      impactPotential: 'Medium'
    });
  }

  // Check 7: Budget Runway Preservation
  const currentBudget = business?.current_budget || 0;
  if (currentBudget < 150000) {
    recommendations.push({
      id: 'preserve_operating_runway',
      category: 'URGENT',
      title: 'Protect Business Capital & Operating Runway',
      description: `Available cash budget is ₦${currentBudget.toLocaleString()}. Daily operations incur fixed overhead. Prioritize high-margin actions.`,
      rationale: 'Businesses with negative cash flow cannot fund link outreach or technical upgrades. Avoid depletion before rankings mature.',
      impactPotential: 'Critical'
    });
  }

  // Default recommendation if in healthy steady state
  if (recommendations.length === 0) {
    recommendations.push({
      id: 'advance_market_position',
      category: 'GROWTH',
      title: 'Acquire Authoritative Media Citations & Backlinks',
      description: 'Your pages are healthy and indexed. Build external domain equity to outrank established market incumbents.',
      rationale: 'Domain authority carries 15% model weight. Outranking competitors requires persistent entity citations.',
      actionCode: 'BUILD_AUTHORITY',
      suggestedActionLabel: 'Authority Outreach (30 Energy, ₦150k)',
      impactPotential: 'High'
    });
  }

  // Structured Real-World Trade-Offs
  const tradeOffs: StrategicTradeOff[] = [
    {
      id: 'technical_vs_content',
      title: 'Technical Fixes vs. Content Expansion',
      dilemma: 'Should you eliminate Core Web Vitals latency first, or publish more comprehensive topical pages?',
      optionA: {
        title: 'Invest in Technical Infrastructure',
        description: 'Audit server TTFB, compress assets, and structure Schema JSON-LD.',
        costExplanation: '20 Energy · ₦100,000 capital',
        expectedUpside: 'Lifts crawl budget efficiency and ensures future pages pass evaluation thresholds.',
        riskOrUncertainty: 'Does not expand keyword coverage by itself; produces zero immediate impressions without content.',
        actionCode: 'TECHNICAL_AUDIT'
      },
      optionB: {
        title: 'Expand Semantic Content Depth',
        description: 'Publish deep entity clusters covering high-intent commercial queries.',
        costExplanation: '15 Energy · ₦75,000 capital',
        expectedUpside: 'Qualifies your domain for broad search queries and increases organic impression share.',
        riskOrUncertainty: 'If technical health remains low, search crawlers may delay indexing new URLs.',
        actionCode: 'EXPAND_CONTENT'
      }
    },
    {
      id: 'keyword_competition_choice',
      title: 'Low-Competition Long-Tail vs. High-Volume Head Terms',
      dilemma: 'Target accessible low-difficulty queries or challenge market giants (PwC, MTN) for high-value transactional terms?',
      optionA: {
        title: 'Target Accessible Long-Tail Terms (Diff < 35)',
        description: 'Target specific, lower-competition informational and commercial queries.',
        costExplanation: 'Standard creation cost · Low difficulty barrier',
        expectedUpside: 'Faster top-10 ranking trajectory; delivers initial early clicks and qualified leads sooner.',
        riskOrUncertainty: 'Total search volume is modest; requires multiple pages to scale total revenue.',
        actionCode: 'OPTIMIZE_PAGE'
      },
      optionB: {
        title: 'Compete for High-Volume Enterprise Queries (Diff > 55)',
        description: 'Target lucrative enterprise keywords directly contested by Flutterwave and Dangote.',
        costExplanation: 'Requires sustained authority and multiple optimization rounds',
        expectedUpside: 'Enormous transaction volume; single closed deal generates ₦125,000+ gross revenue.',
        riskOrUncertainty: 'Rankings may stall outside top 20 until domain authority reaches 70+.',
        actionCode: 'BUILD_AUTHORITY'
      }
    },
    {
      id: 'growth_vs_cash_conservation',
      title: 'Aggressive Capital Deployment vs. Cash Runway Buffer',
      dilemma: 'Spend budget on accelerated content and authority campaigns or maintain reserve capital for daily overhead?',
      optionA: {
        title: 'Maintain Cash Runway Buffer',
        description: 'Limit spending to on-page refinements and internal link structuring.',
        costExplanation: '0 Cash cost · Uses daily player energy only',
        expectedUpside: 'Protects business solvency; ensures overhead expenses never exceed budget.',
        riskOrUncertainty: 'Competitors advancing daily may widen their authority gap.',
        actionCode: 'INTERNAL_LINKING'
      },
      optionB: {
        title: 'Accelerate Growth via Authority Campaigns',
        description: 'Fund high-impact digital PR and authoritative industry citations.',
        costExplanation: '30 Energy · ₦150,000 cash outlay',
        expectedUpside: 'Accelerates domain authority score; lifts rankings across all indexed URLs simultaneously.',
        riskOrUncertainty: 'Backlink authority takes 1–3 simulated days to compound into measurable ranking moves.',
        actionCode: 'BUILD_AUTHORITY'
      }
    }
  ];

  return {
    primaryRecommendation: recommendations[0],
    allRecommendations: recommendations,
    tradeOffs
  };
}
