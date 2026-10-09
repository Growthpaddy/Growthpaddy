/**
 * THE SEO GAME — SEO PAGE LIFECYCLE ENGINE
 * Authoritative lifecycle state machine for website pages.
 * 
 * Distinct Stages:
 * 1. CREATED: Draft stage. Page created, unpublished, unindexed.
 * 2. PUBLISHED: Page is live on domain, but not yet indexed by search engines.
 * 3. CRAWLED: Simulated search-engine crawler discovers URL and inspects crawl directives (robots.txt, noindex).
 * 4. EVALUATED: Quality, technical health, search intent, and ranking factors evaluated against algorithm standards.
 * 5. INDEXED: Accepted into search engine index when requirements are met.
 * 6. SERP-ELIGIBLE: Indexed and mapped to a target search query keyword.
 * 7. RANKED: Actively competing in SERP with a live position based on central ranking scoring model.
 */

import { RankingFactors, calculateOverallScore } from './rankingScoringEngine';

export type PageLifecycleStage = 
  | 'CREATED'
  | 'PUBLISHED'
  | 'CRAWLED'
  | 'EVALUATED'
  | 'INDEXED'
  | 'SERP_ELIGIBLE'
  | 'RANKED';

export type PageLifecycleStatus =
  | 'draft'
  | 'pending_crawl'
  | 'crawl_blocked'
  | 'evaluation_failed'
  | 'indexed'
  | 'missing_keyword'
  | 'serp_eligible'
  | 'ranked';

export interface PageLifecycleInfo {
  stage: PageLifecycleStage;
  status: PageLifecycleStatus;
  stageIndex: number; // 0 (CREATED) to 6 (RANKED)
  stageLabel: string;
  isDraft: boolean;
  isPublished: boolean;
  isCrawled: boolean;
  isEvaluated: boolean;
  isIndexed: boolean;
  isSerpEligible: boolean;
  isRanked: boolean;
  position: number | null;
  statusHeadline: string;
  statusDescription: string;
  failureReason?: string;
  correctiveAction?: string;
  overallScore?: number;
  targetKeyword?: string;
  qualityPassed: boolean;
  technicalPassed: boolean;
  directivePassed: boolean;
}

export const LIFECYCLE_STAGES: Array<{
  stage: PageLifecycleStage;
  label: string;
  index: number;
  description: string;
}> = [
  { stage: 'CREATED', label: '1. Created (Draft)', index: 0, description: 'Page exists as draft on your CMS.' },
  { stage: 'PUBLISHED', label: '2. Published', index: 1, description: 'Live on the web, awaiting Googlebot discovery.' },
  { stage: 'CRAWLED', label: '3. Crawled', index: 2, description: 'Googlebot fetched URL and verified crawl directives.' },
  { stage: 'EVALUATED', label: '4. Evaluated', index: 3, description: 'Algorithm evaluated technical health & E-E-A-T quality.' },
  { stage: 'INDEXED', label: '5. Indexed', index: 4, description: 'Successfully added to Google search index repository.' },
  { stage: 'SERP_ELIGIBLE', label: '6. SERP-Eligible', index: 5, description: 'Mapped to targeted search query and query intent.' },
  { stage: 'RANKED', label: '7. Ranked', index: 6, description: 'Receiving live position in Google search results.' },
];

/**
 * Quality evaluation thresholds for indexing qualification
 */
export const LIFECYCLE_THRESHOLDS = {
  MIN_CONTENT_QUALITY: 40,
  MIN_TECHNICAL_HEALTH: 40,
  MIN_INTENT_MATCH: 35,
  MIN_OVERALL_SCORE: 38
};

/**
 * Evaluates the authoritative lifecycle state of a page
 */
export function determinePageLifecycle(params: {
  page: {
    id: string;
    title: string;
    published_at: string | null;
    indexed: boolean;
    robots_index?: boolean | null;
    robots_follow?: boolean | null;
    content_quality_score?: number | null;
    page_speed_score?: number | null;
    search_intent_score?: number | null;
  };
  rankingFactors?: RankingFactors | null;
  targetKeyword?: {
    id: string;
    keyword: string;
    current_position?: number | null;
  } | null;
  serpPosition?: number | null;
}): PageLifecycleInfo {
  const { page, rankingFactors, targetKeyword, serpPosition } = params;

  const isPublished = Boolean(page.published_at);
  const isIndexed = Boolean(page.indexed);
  const robotsIndex = page.robots_index !== false; // Default true unless explicitly false

  const contentScore = page.content_quality_score ?? rankingFactors?.content_quality ?? 50;
  const techScore = page.page_speed_score ?? rankingFactors?.technical_health ?? 50;
  const intentScore = page.search_intent_score ?? rankingFactors?.intent_match ?? 50;
  const overallScore = rankingFactors ? calculateOverallScore(rankingFactors) : Math.round((contentScore + techScore + intentScore) / 3);

  const directivePassed = robotsIndex;
  const contentPassed = contentScore >= LIFECYCLE_THRESHOLDS.MIN_CONTENT_QUALITY;
  const technicalPassed = techScore >= LIFECYCLE_THRESHOLDS.MIN_TECHNICAL_HEALTH;
  const qualityPassed = contentPassed && technicalPassed && overallScore >= LIFECYCLE_THRESHOLDS.MIN_OVERALL_SCORE;

  const position = serpPosition ?? targetKeyword?.current_position ?? null;
  const isRanked = isIndexed && Boolean(targetKeyword) && position !== null && position > 0 && position <= 100;
  const isSerpEligible = isIndexed && Boolean(targetKeyword);

  // STAGE 1: CREATED (Draft)
  if (!isPublished) {
    return {
      stage: 'CREATED',
      status: 'draft',
      stageIndex: 0,
      stageLabel: 'Draft (Created)',
      isDraft: true,
      isPublished: false,
      isCrawled: false,
      isEvaluated: false,
      isIndexed: false,
      isSerpEligible: false,
      isRanked: false,
      position: null,
      statusHeadline: 'Page Draft Saved',
      statusDescription: 'Page exists in draft mode and is not live on your domain. Search engine crawlers cannot discover unpublished drafts.',
      correctiveAction: 'Publish page to deploy it live and queue it for Googlebot discovery.',
      overallScore,
      targetKeyword: targetKeyword?.keyword,
      qualityPassed,
      technicalPassed,
      directivePassed
    };
  }

  // STAGE 2-5: PUBLISHED, BUT NOT YET INDEXED
  if (isPublished && !isIndexed) {
    // Failure State: Blocked by robots directive (noindex)
    if (!directivePassed) {
      return {
        stage: 'CRAWLED',
        status: 'crawl_blocked',
        stageIndex: 2,
        stageLabel: 'Crawl Blocked',
        isDraft: false,
        isPublished: true,
        isCrawled: true,
        isEvaluated: false,
        isIndexed: false,
        isSerpEligible: false,
        isRanked: false,
        position: null,
        statusHeadline: 'Crawl Disallowed: meta noindex detected',
        statusDescription: 'Googlebot encountered a meta robots="noindex" tag. The crawler observed the page but refused to include it in the index.',
        failureReason: 'The robots_index directive is set to false, explicitly preventing Google from indexing this page.',
        correctiveAction: 'Remove noindex directive and set robots_index to true to permit search engine indexation.',
        overallScore,
        targetKeyword: targetKeyword?.keyword,
        qualityPassed: false,
        technicalPassed,
        directivePassed: false
      };
    }

    // Failure State: Excluded by Quality / Evaluation threshold
    if (!qualityPassed) {
      const reasons: string[] = [];
      const fixes: string[] = [];
      if (!contentPassed) {
        reasons.push(`Thin Content Quality (${contentScore}/100 < ${LIFECYCLE_THRESHOLDS.MIN_CONTENT_QUALITY})`);
        fixes.push('Run On-Page Optimization or Content Expansion');
      }
      if (!technicalPassed) {
        reasons.push(`Technical Performance Lag (${techScore}/100 < ${LIFECYCLE_THRESHOLDS.MIN_TECHNICAL_HEALTH})`);
        fixes.push('Run Technical SEO Audit');
      }
      if (overallScore < LIFECYCLE_THRESHOLDS.MIN_OVERALL_SCORE) {
        reasons.push(`Overall Factor Score Below Index Threshold (${overallScore}/100 < ${LIFECYCLE_THRESHOLDS.MIN_OVERALL_SCORE})`);
      }

      return {
        stage: 'EVALUATED',
        status: 'evaluation_failed',
        stageIndex: 3,
        stageLabel: 'Evaluation Excluded',
        isDraft: false,
        isPublished: true,
        isCrawled: true,
        isEvaluated: true,
        isIndexed: false,
        isSerpEligible: false,
        isRanked: false,
        position: null,
        statusHeadline: 'Crawled — Excluded by Quality Rater Evaluation',
        statusDescription: 'Googlebot crawled the page, but algorithm quality gates excluded it from the index due to quality/performance criteria.',
        failureReason: reasons.join(' · '),
        correctiveAction: fixes.join(' and ') + ' to satisfy the Helpful Content quality threshold.',
        overallScore,
        targetKeyword: targetKeyword?.keyword,
        qualityPassed: false,
        technicalPassed,
        directivePassed: true
      };
    }

    // Pending Crawl & Indexation Pass
    return {
      stage: 'PUBLISHED',
      status: 'pending_crawl',
      stageIndex: 1,
      stageLabel: 'Published (Pending Crawl)',
      isDraft: false,
      isPublished: true,
      isCrawled: false,
      isEvaluated: false,
      isIndexed: false,
      isSerpEligible: false,
      isRanked: false,
      position: null,
      statusHeadline: 'Published — Queued for Googlebot',
      statusDescription: 'Page is published live. Googlebot will crawl and evaluate index eligibility during the next crawl pass or day cycle.',
      correctiveAction: 'Run Crawler Inspection or Advance Day to execute search engine crawl.',
      overallScore,
      targetKeyword: targetKeyword?.keyword,
      qualityPassed,
      technicalPassed,
      directivePassed: true
    };
  }

  // STAGE 5-7: INDEXED
  if (isIndexed) {
    // Missing keyword targeting
    if (!targetKeyword) {
      return {
        stage: 'INDEXED',
        status: 'missing_keyword',
        stageIndex: 4,
        stageLabel: 'Indexed (No Keyword)',
        isDraft: false,
        isPublished: true,
        isCrawled: true,
        isEvaluated: true,
        isIndexed: true,
        isSerpEligible: false,
        isRanked: false,
        position: null,
        statusHeadline: 'Indexed in Web Repository',
        statusDescription: 'Page is successfully stored in Google\'s search index, but has no assigned target keyword. It cannot enter specific SERP competitions without a query target.',
        failureReason: 'No keyword mapping found in campaign targets.',
        correctiveAction: 'Execute Keyword Research and assign a target keyword to qualify for live SERP rankings.',
        overallScore,
        qualityPassed: true,
        technicalPassed: true,
        directivePassed: true
      };
    }

    // STAGE 7: RANKED
    if (isRanked && position !== null) {
      return {
        stage: 'RANKED',
        status: 'ranked',
        stageIndex: 6,
        stageLabel: `Ranked #${position}`,
        isDraft: false,
        isPublished: true,
        isCrawled: true,
        isEvaluated: true,
        isIndexed: true,
        isSerpEligible: true,
        isRanked: true,
        position,
        statusHeadline: `Ranked #${position} in Google SERP`,
        statusDescription: `Live in search results for "${targetKeyword.keyword}". Generating impressions and organic clicks based on ranking position.`,
        correctiveAction: position > 1 ? 'Build backlinks and internal link silos to challenge higher-ranking competitors.' : 'Maintain topical freshness to defend #1 position.',
        overallScore,
        targetKeyword: targetKeyword.keyword,
        qualityPassed: true,
        technicalPassed: true,
        directivePassed: true
      };
    }

    // STAGE 6: SERP-ELIGIBLE (Targeted, but awaiting SERP simulation or outside Top 100)
    return {
      stage: 'SERP_ELIGIBLE',
      status: 'serp_eligible',
      stageIndex: 5,
      stageLabel: 'SERP-Eligible',
      isDraft: false,
      isPublished: true,
      isCrawled: true,
      isEvaluated: true,
      isIndexed: true,
      isSerpEligible: true,
      isRanked: false,
      position: null,
      statusHeadline: 'SERP-Eligible — In Competition Queue',
      statusDescription: `Targeting "${targetKeyword.keyword}". Awaiting day simulation or competitive authority score is currently below position #100.`,
      correctiveAction: 'Advance Day or execute Authority Campaigns to boost ranking potential above competitors.',
      overallScore,
      targetKeyword: targetKeyword.keyword,
      qualityPassed: true,
      technicalPassed: true,
      directivePassed: true
    };
  }

  // Fallback
  return {
    stage: 'CREATED',
    status: 'draft',
    stageIndex: 0,
    stageLabel: 'Draft',
    isDraft: true,
    isPublished: false,
    isCrawled: false,
    isEvaluated: false,
    isIndexed: false,
    isSerpEligible: false,
    isRanked: false,
    position: null,
    statusHeadline: 'Draft Status',
    statusDescription: 'Page state initialized.',
    overallScore,
    qualityPassed: false,
    technicalPassed: false,
    directivePassed: true
  };
}
