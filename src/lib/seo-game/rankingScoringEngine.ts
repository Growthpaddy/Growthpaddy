/**
 * THE SEO GAME — CENTRALIZED RANKING SCORING ENGINE
 * 
 * Deterministic scoring model using all 10 core factors from `seo_game_ranking_factors`.
 * Calculates overall page potential, projected SERP positions, AI visibility potential,
 * and identifies bottlenecks and optimization ROI.
 */

export interface RankingFactors {
  intent_match: number;       // 0-100: Alignment with primary query search intent
  content_quality: number;    // 0-100: E-E-A-T, originality, depth, helpfulness
  topical_coverage: number;   // 0-100: Semantic breadth, entities & related subtopics
  backlink_score: number;     // 0-100: External referring domains, link equity & relevance
  authority_score: number;    // 0-100: Domain topical authority & trust
  technical_health: number;   // 0-100: Core Web Vitals, crawlability, indexability, clean HTML
  internal_link_score: number;// 0-100: Internal PageRank architecture & contextual anchor text
  engagement_score: number;   // 0-100: CTR, simulated dwell time & user interaction signals
  entity_score: number;       // 0-100: Named entity salience, structured data & schema
  freshness_score: number;    // 0-100: Recency, maintenance & update velocity
}

export type RankingFactorKey = keyof RankingFactors;

export interface FactorDefinition {
  key: RankingFactorKey;
  label: string;
  weight: number;
  category: 'CONTENT' | 'AUTHORITY' | 'TECHNICAL' | 'AI_AND_SIGNALS';
  description: string;
}

/**
 * Standardized factor weight matrix summing strictly to 1.0 (100%).
 * Mirrors modern algorithmic ranking weights:
 * - Content & Relevance (Intent + Content + Topical): 46%
 * - Authority & Links (Backlinks + Domain Authority + Internal Links): 32%
 * - Technical & Performance: 10%
 * - Search Signals & AI (Engagement + Entity + Freshness): 12%
 */
export const RANKING_FACTOR_DEFINITIONS: Record<RankingFactorKey, FactorDefinition> = {
  intent_match: {
    key: 'intent_match',
    label: 'Search Intent Match',
    weight: 0.18,
    category: 'CONTENT',
    description: 'Alignment with user query intent (Informational, Transactional, Commercial, Navigational).'
  },
  content_quality: {
    key: 'content_quality',
    label: 'Content Quality & E-E-A-T',
    weight: 0.16,
    category: 'CONTENT',
    description: 'Originality, depth, author experience, expertise, and helpfulness.'
  },
  topical_coverage: {
    key: 'topical_coverage',
    label: 'Topical Coverage & Depth',
    weight: 0.12,
    category: 'CONTENT',
    description: 'Comprehensive coverage of subtopics, entities, and semantically related terms.'
  },
  backlink_score: {
    key: 'backlink_score',
    label: 'Backlink Authority & Equity',
    weight: 0.14,
    category: 'AUTHORITY',
    description: 'Quantity, quality, relevance, and trust of incoming referring domains.'
  },
  authority_score: {
    key: 'authority_score',
    label: 'Domain Authority & Brand Trust',
    weight: 0.10,
    category: 'AUTHORITY',
    description: 'Holistic topical domain authority, brand signals, and niche reputation.'
  },
  technical_health: {
    key: 'technical_health',
    label: 'Technical Health & Core Web Vitals',
    weight: 0.10,
    category: 'TECHNICAL',
    description: 'Speed, mobile responsiveness, crawlability, indexability, and clean architecture.'
  },
  internal_link_score: {
    key: 'internal_link_score',
    label: 'Internal Link Equity',
    weight: 0.08,
    category: 'AUTHORITY',
    description: 'Internal PageRank distribution, contextual link silos, and descriptive anchors.'
  },
  engagement_score: {
    key: 'engagement_score',
    label: 'User Engagement Signals',
    weight: 0.05,
    category: 'AI_AND_SIGNALS',
    description: 'Simulated click-through rate (CTR), dwell time, and low bounce signals.'
  },
  entity_score: {
    key: 'entity_score',
    label: 'Entity Salience & Schema',
    weight: 0.04,
    category: 'AI_AND_SIGNALS',
    description: 'Structured data (JSON-LD), entity disambiguation, and knowledge graph connection.'
  },
  freshness_score: {
    key: 'freshness_score',
    label: 'Content Freshness',
    weight: 0.03,
    category: 'AI_AND_SIGNALS',
    description: 'Recent publication, revision recency, and timely topic alignment.'
  }
};

export type RankingTier = 
  | 'TOP_3'        // Positions 1-3 (Dominant CTR & organic traffic)
  | 'PAGE_1_HIGH'  // Positions 4-7 (Solid first page presence)
  | 'PAGE_1_LOW'   // Positions 8-10 (Bottom of first page)
  | 'PAGE_2'       // Positions 11-20 (Second page)
  | 'PAGE_3_5'     // Positions 21-50 (Page 3 to 5)
  | 'UNRANKED';    // > 50 (Index periphery)

export interface FactorAnalysisItem {
  key: RankingFactorKey;
  label: string;
  weight: number;
  rawScore: number;
  weightedContribution: number;
  maxPossibleContribution: number;
  gap: number; // Potential score points that could be gained
  status: 'EXCELLENT' | 'STRONG' | 'NEEDS_WORK' | 'CRITICAL_DEFICIT';
}

export interface PagePotentialResult {
  overall_score: number; // 0-100 deterministic overall score
  ranking_tier: RankingTier;
  tier_label: string;
  estimated_max_position: number; // Projected best SERP rank
  projected_ctr_percentage: number; // Estimated SERP CTR
  ai_visibility_potential: number; // 0-100 rating for AI Search Engines (Perplexity, ChatGPT, SGE)
  factors: RankingFactors;
  factor_breakdown: FactorAnalysisItem[];
  primary_bottleneck: FactorAnalysisItem;
  top_opportunity: FactorAnalysisItem;
  recommendations: string[];
}

/**
 * Clamps a score strictly between 0 and 100.
 */
export function clampScore(score: number): number {
  if (isNaN(score)) return 0;
  return Math.min(100, Math.max(0, Math.round(score * 10) / 10));
}

/**
 * Normalizes an arbitrary factors object, ensuring all 10 keys are present and clamped.
 */
export function normalizeFactors(input: Partial<RankingFactors>): RankingFactors {
  const result: RankingFactors = {
    intent_match: 0,
    content_quality: 0,
    topical_coverage: 0,
    backlink_score: 0,
    authority_score: 0,
    technical_health: 0,
    internal_link_score: 0,
    engagement_score: 0,
    entity_score: 0,
    freshness_score: 0
  };

  for (const key of Object.keys(RANKING_FACTOR_DEFINITIONS) as RankingFactorKey[]) {
    result[key] = clampScore(Number(input[key] ?? 0));
  }

  return result;
}

/**
 * Deterministically computes the composite overall score (0 - 100).
 * Overall score = SUM(factor_score * factor_weight)
 */
export function calculateOverallScore(input: Partial<RankingFactors>): number {
  const factors = normalizeFactors(input);
  let total = 0;

  for (const key of Object.keys(RANKING_FACTOR_DEFINITIONS) as RankingFactorKey[]) {
    const weight = RANKING_FACTOR_DEFINITIONS[key].weight;
    total += factors[key] * weight;
  }

  // Rounded to 2 decimal places deterministically
  return Math.round(total * 100) / 100;
}

/**
 * Projects the achievable SERP position based on overall score and keyword difficulty.
 * Deterministic formula:
 * Baseline: 100 score -> Rank 1. 0 score -> Rank 100.
 * Adjusted for keyword difficulty (0 to 100, default 40).
 */
export function projectSerpPosition(
  overallScore: number, 
  keywordDifficulty = 40,
  competitorAuthority = 50
): number {
  const effectiveScore = clampScore(overallScore);
  
  // Difficulty resistance factor (0.5 to 1.5)
  const difficultyModifier = 1 + ((keywordDifficulty - 40) / 100) * 0.4;
  const competitorModifier = 1 + ((competitorAuthority - 50) / 100) * 0.3;
  const netDifficulty = Math.max(0.7, difficultyModifier * competitorModifier);

  // If score is 95+ and difficulty is manageable, top 1-3 is unlocked
  if (effectiveScore >= 95) {
    const pos = Math.max(1, Math.round(1 + (100 - effectiveScore) * 0.4 * netDifficulty));
    return Math.min(3, pos);
  }
  
  if (effectiveScore >= 85) {
    const pos = Math.max(2, Math.round(2 + ((95 - effectiveScore) / 10) * 4 * netDifficulty));
    return Math.min(6, pos);
  }

  if (effectiveScore >= 70) {
    const pos = Math.max(5, Math.round(5 + ((85 - effectiveScore) / 15) * 5 * netDifficulty));
    return Math.min(10, pos);
  }

  if (effectiveScore >= 50) {
    const pos = Math.max(11, Math.round(11 + ((70 - effectiveScore) / 20) * 9 * netDifficulty));
    return Math.min(20, pos);
  }

  if (effectiveScore >= 30) {
    const pos = Math.max(21, Math.round(21 + ((50 - effectiveScore) / 20) * 29 * netDifficulty));
    return Math.min(50, pos);
  }

  const pos = Math.max(51, Math.round(51 + ((30 - effectiveScore) / 30) * 49 * netDifficulty));
  return Math.min(100, pos);
}

/**
 * Calculates AI Search Visibility potential (0-100).
 * Driven primarily by Entity Salience (35%), Content Quality (35%), and Topical Coverage (30%).
 */
export function calculateAiVisibilityPotential(factors: RankingFactors): number {
  const aiScore = (
    factors.entity_score * 0.35 +
    factors.content_quality * 0.35 +
    factors.topical_coverage * 0.30
  );
  return Math.round(aiScore * 10) / 10;
}

/**
 * Main Centralized Calculation:
 * Evaluates the full potential of a page from its ranking factors.
 */
export function calculatePagePotential(
  inputFactors: Partial<RankingFactors>,
  keywordContext?: { searchVolume?: number; keywordDifficulty?: number; competitorAuthority?: number }
): PagePotentialResult {
  const factors = normalizeFactors(inputFactors);
  const overall_score = calculateOverallScore(factors);
  
  const kd = keywordContext?.keywordDifficulty ?? 40;
  const ca = keywordContext?.competitorAuthority ?? 50;
  const estimated_max_position = projectSerpPosition(overall_score, kd, ca);

  // Deterministic Tier classification
  let ranking_tier: RankingTier = 'UNRANKED';
  let tier_label = 'Unranked / Inactive';
  let projected_ctr_percentage = 0.5;

  if (overall_score >= 88 && estimated_max_position <= 3) {
    ranking_tier = 'TOP_3';
    tier_label = 'Top 3 Podium (Dominant Visibility)';
    projected_ctr_percentage = estimated_max_position === 1 ? 32.5 : estimated_max_position === 2 ? 18.2 : 11.4;
  } else if (overall_score >= 75 && estimated_max_position <= 7) {
    ranking_tier = 'PAGE_1_HIGH';
    tier_label = 'Page 1 High (#4 - #7)';
    projected_ctr_percentage = 6.8;
  } else if (overall_score >= 60 && estimated_max_position <= 10) {
    ranking_tier = 'PAGE_1_LOW';
    tier_label = 'Page 1 Low (#8 - #10)';
    projected_ctr_percentage = 3.2;
  } else if (overall_score >= 45 && estimated_max_position <= 20) {
    ranking_tier = 'PAGE_2';
    tier_label = 'Page 2 (#11 - #20)';
    projected_ctr_percentage = 1.1;
  } else if (overall_score >= 25 && estimated_max_position <= 50) {
    ranking_tier = 'PAGE_3_5';
    tier_label = 'Page 3 to 5 (#21 - #50)';
    projected_ctr_percentage = 0.4;
  } else {
    ranking_tier = 'UNRANKED';
    tier_label = 'Unranked / Deep Index (> #50)';
    projected_ctr_percentage = 0.1;
  }

  // Factor breakdown and analysis
  const factor_breakdown: FactorAnalysisItem[] = (
    Object.keys(RANKING_FACTOR_DEFINITIONS) as RankingFactorKey[]
  ).map((key) => {
    const def = RANKING_FACTOR_DEFINITIONS[key];
    const rawScore = factors[key];
    const weightedContribution = Math.round(rawScore * def.weight * 100) / 100;
    const maxPossibleContribution = Math.round(100 * def.weight * 100) / 100;
    const gap = Math.round((maxPossibleContribution - weightedContribution) * 100) / 100;

    let status: FactorAnalysisItem['status'] = 'CRITICAL_DEFICIT';
    if (rawScore >= 80) status = 'EXCELLENT';
    else if (rawScore >= 60) status = 'STRONG';
    else if (rawScore >= 40) status = 'NEEDS_WORK';

    return {
      key,
      label: def.label,
      weight: def.weight,
      rawScore,
      weightedContribution,
      maxPossibleContribution,
      gap,
      status
    };
  });

  // Sort by gap to determine biggest ROI opportunity
  const sortedByOpportunity = [...factor_breakdown].sort((a, b) => b.gap - a.gap);
  const top_opportunity = sortedByOpportunity[0];

  // Sort by lowest raw score weighted by impact to identify primary bottleneck
  const sortedByBottleneck = [...factor_breakdown].sort((a, b) => {
    const penaltyA = (100 - a.rawScore) * a.weight;
    const penaltyB = (100 - b.rawScore) * b.weight;
    return penaltyB - penaltyA;
  });
  const primary_bottleneck = sortedByBottleneck[0];

  // Formulate actionable recommendations
  const recommendations: string[] = [];
  if (primary_bottleneck.rawScore < 50) {
    recommendations.push(
      `Critical: Elevate ${primary_bottleneck.label} (currently ${primary_bottleneck.rawScore}/100) to unlock Page 1 potential.`
    );
  }
  if (top_opportunity.key !== primary_bottleneck.key && top_opportunity.gap > 3) {
    recommendations.push(
      `High ROI: Optimize ${top_opportunity.label} for an immediate +${top_opportunity.gap.toFixed(1)} point boost.`
    );
  }
  if (factors.technical_health < 60) {
    recommendations.push('Run Technical Audit: Resolve crawlability and speed bottlenecks.');
  }
  if (factors.backlink_score < 40 && factors.content_quality >= 70) {
    recommendations.push('Launch Authority Campaign: High quality content needs external link signals to rank.');
  }
  if (factors.entity_score < 40) {
    recommendations.push('Enhance Entity Schema: Add structured data to qualify for AI Overview citations.');
  }

  const ai_visibility_potential = calculateAiVisibilityPotential(factors);

  return {
    overall_score,
    ranking_tier,
    tier_label,
    estimated_max_position,
    projected_ctr_percentage,
    ai_visibility_potential,
    factors,
    factor_breakdown,
    primary_bottleneck,
    top_opportunity,
    recommendations
  };
}
