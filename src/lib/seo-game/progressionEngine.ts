/**
 * THE SEO GAME — PROGRESSION, MISSIONS & ECONOMY ENGINE
 * 
 * Evaluates missions, achievements, levels, and resource rewards based strictly
 * on authoritative stored database state. Guarantees that rewards are awarded
 * exactly once, audited in the wallet transaction ledger, and level thresholds
 * are strictly enforced.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export interface ProgressionReport {
  newlyCompletedMissions: Array<{
    id: string;
    code: string;
    title: string;
    xp_reward: number;
    coin_reward: number;
  }>;
  newlyUnlockedAchievements: Array<{
    id: string;
    code: string;
    title: string;
    xp_reward: number;
    coin_reward: number;
  }>;
  totalXpAwarded: number;
  totalCoinsAwarded: number;
  playerLevel: number;
  playerXp: number;
  leveledUp: boolean;
  levelTitle: string;
}

/**
 * Generates a deterministic RFC 4122 v4 UUID from a namespace and key
 */
export function generateDeterministicUuid(namespace: string, key: string | number): string {
  const hash = crypto.createHash('sha256').update(`${namespace}:${key}`).digest('hex');
  return [
    hash.substring(0, 8),
    hash.substring(8, 12),
    '4' + hash.substring(13, 16),
    ((parseInt(hash.substring(16, 18), 16) & 0x3f) | 0x80).toString(16).padStart(2, '0') + hash.substring(18, 20),
    hash.substring(20, 32)
  ].join('-');
}

/**
 * Evaluates all missions and achievements against real stored database records
 */
export async function evaluateProgressionAndMissions(params: {
  playerId: string;
  businessId: string;
  websiteId: string;
  currentDay: number;
  supabase: SupabaseClient;
}): Promise<ProgressionReport> {
  const { playerId, businessId, websiteId, currentDay, supabase } = params;

  // 1. Fetch current player profile and wallet
  const { data: player } = await supabase
    .from('seo_game_players')
    .select('id, level, xp, current_day')
    .eq('id', playerId)
    .single();

  const { data: wallet } = await supabase
    .from('seo_game_wallets')
    .select('coins, energy, ai_credits, max_energy')
    .eq('player_id', playerId)
    .single();

  let curXp = player?.xp || 0;
  let curLevel = player?.level || 1;
  let curCoins = wallet?.coins || 0;

  // 2. Fetch ground-truth state from database
  const { count: pagesCount } = await supabase
    .from('seo_game_pages')
    .select('*', { count: 'exact', head: true })
    .eq('website_id', websiteId);

  const { count: indexedCount } = await supabase
    .from('seo_game_pages')
    .select('*', { count: 'exact', head: true })
    .eq('website_id', websiteId)
    .eq('indexed', true);

  const { count: targetsCount } = await supabase
    .from('seo_game_keyword_targets')
    .select('*', { count: 'exact', head: true });

  const { data: keywords } = await supabase
    .from('seo_game_keywords')
    .select('current_position')
    .eq('website_id', websiteId);

  const { data: playerState } = await supabase
    .from('seo_game_player_state')
    .select('authority_score, technical_score, ai_visibility_score')
    .eq('player_id', playerId)
    .maybeSingle();

  // Check SERP competitor outranking
  const { data: serpWins } = await supabase
    .from('seo_game_serp_results')
    .select('position, business_id')
    .eq('business_id', businessId)
    .lte('position', 10);

  const hasTop100 = (keywords || []).some(k => k.current_position !== null && k.current_position <= 100);
  const hasTop10 = (keywords || []).some(k => k.current_position !== null && k.current_position <= 10);
  const hasPosition1 = (keywords || []).some(k => k.current_position === 1);
  const outrankedCompetitor = (serpWins && serpWins.length > 0) || hasTop10;

  // 3. Load Missions & Player's Mission Progress
  const { data: missions } = await supabase
    .from('seo_game_missions')
    .select('*')
    .eq('is_active', true);

  const { data: progressList } = await supabase
    .from('seo_game_mission_progress')
    .select('*')
    .eq('player_id', playerId);

  const newlyCompletedMissions: ProgressionReport['newlyCompletedMissions'] = [];
  let addedXp = 0;
  let addedCoins = 0;

  if (missions && missions.length > 0) {
    for (const m of missions) {
      const existingProg = (progressList || []).find(p => p.mission_id === m.id);
      if (existingProg?.completed) {
        continue; // Already rewarded!
      }

      let isQualified = false;
      switch (m.code) {
        case 'CREATE_BUSINESS':
          isQualified = Boolean(businessId);
          break;
        case 'CREATE_FIRST_PAGE':
          isQualified = (pagesCount || 0) >= 1;
          break;
        case 'TARGET_FIRST_KEYWORD':
          isQualified = (targetsCount || 0) >= 1;
          break;
        case 'FIRST_RANKING':
          isQualified = hasTop100;
          break;
        case 'TOP_10':
          isQualified = hasTop10;
          break;
        case 'BEAT_COMPETITOR':
          isQualified = Boolean(outrankedCompetitor);
          break;
        case 'TECHNICAL_FIX':
          isQualified = (playerState?.technical_score || 0) >= 60;
          break;
        case 'AI_VISIBILITY':
          isQualified = (playerState?.ai_visibility_score || 0) >= 40;
          break;
        default:
          break;
      }

      if (isQualified) {
        const now = new Date().toISOString();
        await supabase
          .from('seo_game_mission_progress')
          .upsert({
            player_id: playerId,
            mission_id: m.id,
            progress: 1,
            target: 1,
            completed: true,
            completed_at: now,
            updated_at: now
          });

        addedXp += m.xp_reward || 0;
        addedCoins += m.coin_reward || 0;
        newlyCompletedMissions.push({
          id: m.id,
          code: m.code,
          title: m.title,
          xp_reward: m.xp_reward || 0,
          coin_reward: m.coin_reward || 0
        });

        // Log wallet transaction for coin reward
        if (m.coin_reward > 0) {
          curCoins += m.coin_reward;
          await supabase.from('seo_game_wallet_transactions').insert({
            id: generateDeterministicUuid(playerId, `mission-${m.code}`),
            player_id: playerId,
            transaction_type: 'bonus',
            currency: 'coins',
            amount: m.coin_reward,
            balance_after: curCoins,
            description: `Mission Reward: ${m.title}`,
            reference_type: 'mission_reward',
            reference_id: m.id,
            created_at: now
          });
        }
      }
    }
  }

  // 4. Load Achievements & Player Achievements
  const { data: achievements } = await supabase
    .from('seo_game_achievements')
    .select('*');

  const { data: unlockedAchievements } = await supabase
    .from('seo_game_player_achievements')
    .select('*')
    .eq('player_id', playerId);

  const newlyUnlockedAchievements: ProgressionReport['newlyUnlockedAchievements'] = [];

  if (achievements && achievements.length > 0) {
    for (const a of achievements) {
      const alreadyUnlocked = (unlockedAchievements || []).some(ua => ua.achievement_id === a.id);
      if (alreadyUnlocked) {
        continue;
      }

      let unlocked = false;
      switch (a.code) {
        case 'FIRST_PAGE':
          unlocked = (pagesCount || 0) >= 1;
          break;
        case 'FIRST_RANKING':
          unlocked = hasTop100;
          break;
        case 'PAGE_ONE':
          unlocked = hasTop10;
          break;
        case 'SERP_DOMINATOR':
          unlocked = hasPosition1;
          break;
        case 'COMPETITOR_SLAYER':
          unlocked = Boolean(outrankedCompetitor);
          break;
        case 'AI_VISIBLE':
          unlocked = (playerState?.ai_visibility_score || 0) >= 50;
          break;
        default:
          break;
      }

      if (unlocked) {
        const now = new Date().toISOString();
        const achEntryId = generateDeterministicUuid(playerId, `ach-${a.code}`);
        await supabase
          .from('seo_game_player_achievements')
          .insert({
            id: achEntryId,
            player_id: playerId,
            achievement_id: a.id,
            unlocked_at: now
          });

        addedXp += a.xp_reward || 0;
        addedCoins += a.coin_reward || 0;
        newlyUnlockedAchievements.push({
          id: a.id,
          code: a.code,
          title: a.title,
          xp_reward: a.xp_reward || 0,
          coin_reward: a.coin_reward || 0
        });

        if (a.coin_reward > 0) {
          curCoins += a.coin_reward;
          await supabase.from('seo_game_wallet_transactions').insert({
            id: generateDeterministicUuid(playerId, `ach-coin-${a.code}`),
            player_id: playerId,
            transaction_type: 'bonus',
            currency: 'coins',
            amount: a.coin_reward,
            balance_after: curCoins,
            description: `Achievement Reward: ${a.title}`,
            reference_type: 'achievement_reward',
            reference_id: a.id,
            created_at: now
          });
        }
      }
    }
  }

  // 5. Apply XP updates and verify Level progression
  curXp += addedXp;

  const { data: levels } = await supabase
    .from('seo_game_levels')
    .select('level, title, xp_required')
    .order('level');

  let newLevel = curLevel;
  let newLevelTitle = 'SEO Apprentice';

  if (levels && levels.length > 0) {
    for (const lvl of levels) {
      if (curXp >= lvl.xp_required) {
        newLevel = lvl.level;
        newLevelTitle = lvl.title;
      }
    }
  }

  const leveledUp = newLevel > curLevel;

  // Persist updated wallet coins and player level/xp if any rewards granted
  if (addedXp > 0 || addedCoins > 0 || leveledUp) {
    await supabase
      .from('seo_game_players')
      .update({
        level: newLevel,
        xp: curXp,
        updated_at: new Date().toISOString()
      })
      .eq('id', playerId);

    if (addedCoins > 0) {
      await supabase
        .from('seo_game_wallets')
        .update({
          coins: curCoins,
          updated_at: new Date().toISOString()
        })
        .eq('player_id', playerId);
    }
  }

  return {
    newlyCompletedMissions,
    newlyUnlockedAchievements,
    totalXpAwarded: addedXp,
    totalCoinsAwarded: addedCoins,
    playerLevel: newLevel,
    playerXp: curXp,
    leveledUp,
    levelTitle: newLevelTitle
  };
}
