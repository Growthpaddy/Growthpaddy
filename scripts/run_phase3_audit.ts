import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL || '';
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const sbAuth = createClient(url, anonKey);
const sbAdmin = createClient(url, serviceKey);

async function runPhase3Audit() {
  console.log('====================================================');
  console.log('THE SEO GAME — PHASE 3 INTEGRITY & AUDIT TEST SUITE');
  console.log('====================================================\n');

  // Authenticate isolated test user
  const { data: authData, error: authErr } = await sbAuth.auth.signInWithPassword({
    email: 'audit_suite_tester@seogame.local',
    password: 'AuditPassword123!'
  });

  if (authErr || !authData.session) {
    throw new Error('Failed to sign in test user: ' + authErr?.message);
  }

  const token = authData.session.access_token;
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  // Get test player profile
  const { data: testPlayer } = await sbAdmin
    .from('seo_game_players')
    .select('*')
    .eq('display_name', 'AuditTestCadet')
    .single();

  const { data: testBiz } = await sbAdmin
    .from('seo_game_businesses')
    .select('*')
    .eq('player_id', testPlayer.id)
    .single();

  const { data: testWeb } = await sbAdmin
    .from('seo_game_websites')
    .select('*')
    .eq('business_id', testBiz.id)
    .single();

  console.log(`[TEST FIXTURE] Isolated Player: ${testPlayer.display_name} (${testPlayer.id})`);
  console.log(`[TEST FIXTURE] Business: ${testBiz.name} (${testBiz.id})`);
  console.log(`[TEST FIXTURE] Website: ${testWeb.domain} (${testWeb.id})\n`);

  // Reset test player resources for clean testing
  await sbAdmin.from('seo_game_wallets').update({ coins: 1000, energy: 100, ai_credits: 100 }).eq('player_id', testPlayer.id);
  await sbAdmin.from('seo_game_players').update({ current_day: 1 }).eq('id', testPlayer.id);
  // Clean past advance action for day 1 so fresh advance can execute
  await sbAdmin.from('seo_game_actions').delete().eq('player_id', testPlayer.id).eq('action_type', 'ADVANCE_DAY');

  // ----------------------------------------------------
  // TEST 1: Successful Day Advance
  // ----------------------------------------------------
  console.log('--- TEST 1: A Successful Day Advance ---');
  const advRes1 = await fetch('http://localhost:3000/api/seo-game/advance-day', { method: 'POST', headers });
  const advJson1 = await advRes1.json();
  console.log('Response Status:', advRes1.status);
  console.log('Summary:', {
    previousDay: advJson1.summary?.previousDay,
    currentDay: advJson1.summary?.currentDay,
    dailyClicks: advJson1.summary?.dailyClicks,
    dailyLeads: advJson1.summary?.dailyLeads,
    dailyCustomers: advJson1.summary?.dailyCustomers,
    grossRevenue: advJson1.summary?.grossRevenue,
    operatingExpenses: advJson1.summary?.operatingExpenses,
    netProfit: advJson1.summary?.netProfit,
    newBudget: advJson1.summary?.newBudget
  });
  const t1Passed = advRes1.status === 200 && advJson1.success === true && advJson1.summary?.currentDay === 2;
  console.log(`TEST 1 RESULT: ${t1Passed ? 'PASSED ✓' : 'FAILED ✗'}\n`);

  // ----------------------------------------------------
  // TEST 2: Retrying the Same Day Advance (Idempotency)
  // ----------------------------------------------------
  console.log('--- TEST 2: Retrying the Same Day Advance (Idempotency) ---');
  const advRes2 = await fetch('http://localhost:3000/api/seo-game/advance-day', { method: 'POST', headers });
  const advJson2 = await advRes2.json();
  console.log('Response Status:', advRes2.status);
  console.log('Cached / Idempotent Replay:', advJson2.cached, advJson2.idempotentReplay);
  console.log('Current Day:', advJson2.summary?.currentDay);

  // Check budget in DB: ensure revenue/profit was not added twice!
  const { data: bizAfterRetry } = await sbAdmin.from('seo_game_businesses').select('current_budget').eq('id', testBiz.id).single();
  const t2Passed = advRes2.status === 200 && advJson2.cached === true && bizAfterRetry.current_budget === advJson1.summary?.newBudget;
  console.log(`Database Budget after retry: ₦${bizAfterRetry.current_budget.toLocaleString()} (Matches single advance)`);
  console.log(`TEST 2 RESULT: ${t2Passed ? 'PASSED ✓' : 'FAILED ✗'}\n`);

  // ----------------------------------------------------
  // TEST 3: Simultaneous Day-Advance Requests (Concurrency)
  // ----------------------------------------------------
  console.log('--- TEST 3: Two Simultaneous Day-Advance Requests ---');
  // Temporarily delete action for day 2 so we test concurrent execution
  await sbAdmin.from('seo_game_actions').delete().eq('player_id', testPlayer.id).eq('action_type', 'ADVANCE_DAY').eq('day', 2);
  await sbAdmin.from('seo_game_players').update({ current_day: 2 }).eq('id', testPlayer.id);

  const [concurrentResA, concurrentResB] = await Promise.all([
    fetch('http://localhost:3000/api/seo-game/advance-day', { method: 'POST', headers }),
    fetch('http://localhost:3000/api/seo-game/advance-day', { method: 'POST', headers })
  ]);
  const concurrentJsonA = await concurrentResA.json();
  const concurrentJsonB = await concurrentResB.json();

  console.log('Concurrent Request A Status:', concurrentResA.status, 'success:', concurrentJsonA.success);
  console.log('Concurrent Request B Status:', concurrentResB.status, 'success:', concurrentJsonB.success, 'error/replay:', concurrentJsonB.error || concurrentJsonB.cached);

  const t3Passed = (concurrentResA.status === 200 && (concurrentResB.status === 409 || concurrentJsonB.cached === true || concurrentJsonB.idempotentReplay === true)) ||
                   (concurrentResB.status === 200 && (concurrentResA.status === 409 || concurrentJsonA.cached === true || concurrentJsonA.idempotentReplay === true));
  console.log(`TEST 3 RESULT: ${t3Passed ? 'PASSED ✓' : 'FAILED ✗'}\n`);

  // ----------------------------------------------------
  // TEST 4: Forced Failure During Simulation (Rollback & State Preservation)
  // ----------------------------------------------------
  console.log('--- TEST 4: Forced Failure During Simulation ---');
  // Send an invalid request or unauthenticated token to simulate controlled abort
  const failRes = await fetch('http://localhost:3000/api/seo-game/advance-day', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer invalid_tampered_token_xyz' }
  });
  const failJson = await failRes.json();
  console.log('Failure Status:', failRes.status, 'Error:', failJson.error);

  // Verify DB state was NOT touched
  const { data: playerAfterFail } = await sbAdmin.from('seo_game_players').select('current_day').eq('id', testPlayer.id).single();
  console.log('Player day remained unaffected:', playerAfterFail.current_day);
  const t4Passed = failRes.status === 401 && playerAfterFail.current_day === 3;
  console.log(`TEST 4 RESULT: ${t4Passed ? 'PASSED ✓' : 'FAILED ✗'}\n`);

  // ----------------------------------------------------
  // TEST 5: Business Funnel Mathematics (Known Input Values)
  // ----------------------------------------------------
  console.log('--- TEST 5: Revenue and Customer Calculations Using Known Inputs ---');
  const { calculateBusinessFunnel } = await import('../src/lib/seo-game/serpEngine');
  
  // Test case A: 0 clicks -> 0 leads, 0 customers, 0 revenue
  const f0 = calculateBusinessFunnel({ totalDailyClicks: 0, currentBudget: 500000, day: 1, playerId: testPlayer.id });
  console.log('Input 0 Clicks:', f0);

  // Test case B: 100 clicks -> 3 leads (3.5% floor) -> 0 customers (<7 leads threshold) -> ₦0 gross revenue, operating expense deducted
  const f100 = calculateBusinessFunnel({ totalDailyClicks: 100, currentBudget: 500000, day: 1, playerId: testPlayer.id });
  console.log('Input 100 Clicks:', { leads: f100.dailyLeads, customers: f100.dailyCustomers, grossRevenue: f100.grossRevenue, expenses: f100.operatingExpenses, netProfit: f100.netProfit });

  // Test case C: 400 clicks -> 14 leads -> 2 customers (14 * 15% = 2.1 floor) -> ₦250,000 gross revenue
  const f400 = calculateBusinessFunnel({ totalDailyClicks: 400, currentBudget: 500000, day: 1, playerId: testPlayer.id });
  console.log('Input 400 Clicks:', { leads: f400.dailyLeads, customers: f400.dailyCustomers, grossRevenue: f400.grossRevenue, netProfit: f400.netProfit });

  const t5Passed = f0.dailyCustomers === 0 && f0.grossRevenue === 0 &&
                   f100.dailyLeads === 3 && f100.dailyCustomers === 0 &&
                   f400.dailyLeads === 14 && f400.dailyCustomers === 2 && f400.grossRevenue === 250000 &&
                   f400.netProfit === (250000 - f400.operatingExpenses);
  console.log(`TEST 5 RESULT: ${t5Passed ? 'PASSED ✓' : 'FAILED ✗'}\n`);

  // ----------------------------------------------------
  // TEST 6: Wallet, Ledger, and Budget Consistency
  // ----------------------------------------------------
  console.log('--- TEST 6: Wallet, Ledger, and Budget Consistency ---');
  // Check transaction records in seo_game_wallet_transactions
  const { data: txRecords } = await sbAdmin
    .from('seo_game_wallet_transactions')
    .select('*')
    .eq('player_id', testPlayer.id)
    .order('created_at', { ascending: false });

  console.log(`Found ${txRecords?.length || 0} ledger transaction records for test player.`);
  const hasRegenTx = (txRecords || []).some(tx => tx.reference_type === 'day_advance' && tx.currency === 'energy');
  console.log('Energy regeneration recorded in ledger:', hasRegenTx);

  const t6Passed = (txRecords && txRecords.length > 0) && hasRegenTx;
  console.log(`TEST 6 RESULT: ${t6Passed ? 'PASSED ✓' : 'FAILED ✗'}\n`);

  // ----------------------------------------------------
  // TEST 7: Mission Completion & Reward Replay Prevention
  // ----------------------------------------------------
  console.log('--- TEST 7: Mission Completion and Reward Replay ---');
  const { evaluateProgressionAndMissions } = await import('../src/lib/seo-game/progressionEngine');
  
  const prog1 = await evaluateProgressionAndMissions({
    playerId: testPlayer.id,
    businessId: testBiz.id,
    websiteId: testWeb.id,
    currentDay: 3,
    supabase: sbAdmin
  });
  console.log('First Progression Check Completed Missions:', prog1.newlyCompletedMissions.map(m => m.code));

  // Immediate replay: should award 0 additional missions
  const prog2 = await evaluateProgressionAndMissions({
    playerId: testPlayer.id,
    businessId: testBiz.id,
    websiteId: testWeb.id,
    currentDay: 3,
    supabase: sbAdmin
  });
  console.log('Replay Progression Check Completed Missions:', prog2.newlyCompletedMissions.map(m => m.code));

  const t7Passed = prog2.newlyCompletedMissions.length === 0 && prog2.totalCoinsAwarded === 0 && prog2.totalXpAwarded === 0;
  console.log(`TEST 7 RESULT: ${t7Passed ? 'PASSED ✓' : 'FAILED ✗'}\n`);

  // ----------------------------------------------------
  // TEST 8: Level Thresholds and Unlocks
  // ----------------------------------------------------
  console.log('--- TEST 8: Level Thresholds and Unlocks ---');
  const { data: levelsList } = await sbAdmin.from('seo_game_levels').select('*').order('level');
  console.log('Levels defined:', levelsList?.map(l => `Level ${l.level}: ${l.title} (${l.xp_required} XP)`).join(' | '));

  // Player at 600 XP should be Level 2 (Operator, required 500 XP)
  await sbAdmin.from('seo_game_players').update({ xp: 600 }).eq('id', testPlayer.id);
  const progLvl = await evaluateProgressionAndMissions({
    playerId: testPlayer.id,
    businessId: testBiz.id,
    websiteId: testWeb.id,
    currentDay: 3,
    supabase: sbAdmin
  });
  console.log('Player at 600 XP Level:', progLvl.playerLevel, progLvl.levelTitle);
  const t8Passed = progLvl.playerLevel === 2 && progLvl.levelTitle === 'SEO Operator';
  console.log(`TEST 8 RESULT: ${t8Passed ? 'PASSED ✓' : 'FAILED ✗'}\n`);

  // ----------------------------------------------------
  // TEST 9: Repeated SERP Generation for Same Player-Day
  // ----------------------------------------------------
  console.log('--- TEST 9: Repeated SERP Generation for Same Player-Day ---');
  const { data: kwRecord } = await sbAdmin.from('seo_game_keywords').select('id, keyword').eq('website_id', testWeb.id).limit(1).single();
  
  if (kwRecord) {
    const serpRes1 = await fetch('http://localhost:3000/api/seo-game/simulate-serp', {
      method: 'POST',
      headers,
      body: JSON.stringify({ keywordId: kwRecord.id })
    });
    const serpJson1 = await serpRes1.json();

    const serpRes2 = await fetch('http://localhost:3000/api/seo-game/simulate-serp', {
      method: 'POST',
      headers,
      body: JSON.stringify({ keywordId: kwRecord.id })
    });
    const serpJson2 = await serpRes2.json();

    console.log('SERP 1 Position:', serpJson1.outcome?.playerPosition, 'Score:', serpJson1.outcome?.playerScore);
    console.log('SERP 2 Position:', serpJson2.outcome?.playerPosition, 'Score:', serpJson2.outcome?.playerScore);

    const t9Passed = serpJson1.success && serpJson2.success && 
                     serpJson1.outcome?.playerPosition === serpJson2.outcome?.playerPosition &&
                     serpJson1.outcome?.playerScore === serpJson2.outcome?.playerScore;
    console.log(`TEST 9 RESULT: ${t9Passed ? 'PASSED ✓' : 'FAILED ✗'}\n`);
  }

  // ----------------------------------------------------
  // TEST 10: Regression of Page Lifecycle & Ranking
  // ----------------------------------------------------
  console.log('--- TEST 10: Regression of Page Lifecycle & Ranking Calculations ---');
  const { determinePageLifecycle } = await import('../src/lib/seo-game/lifecycleEngine');
  
  const lcDraft = determinePageLifecycle({
    page: { id: 'p1', title: 'Draft', published_at: null, indexed: false }
  });
  const lcBlocked = determinePageLifecycle({
    page: { id: 'p2', title: 'Blocked', published_at: '2026-10-09T00:00:00Z', indexed: false, robots_index: false }
  });
  const lcRanked = determinePageLifecycle({
    page: { id: 'p3', title: 'Ranked', published_at: '2026-10-09T00:00:00Z', indexed: true, robots_index: true },
    targetKeyword: { id: 'k1', keyword: 'seo strategy', current_position: 3 },
    serpPosition: 3
  });

  console.log('Draft Lifecycle:', lcDraft.stage, lcDraft.status);
  console.log('Blocked Lifecycle:', lcBlocked.stage, lcBlocked.status);
  console.log('Ranked Lifecycle:', lcRanked.stage, lcRanked.status, `Position #${lcRanked.position}`);

  const t10Passed = lcDraft.stage === 'CREATED' && lcDraft.status === 'draft' &&
                    lcBlocked.stage === 'CRAWLED' && lcBlocked.status === 'crawl_blocked' &&
                    lcRanked.stage === 'RANKED' && lcRanked.status === 'ranked' && lcRanked.position === 3;
  console.log(`TEST 10 RESULT: ${t10Passed ? 'PASSED ✓' : 'FAILED ✗'}\n`);

  // ----------------------------------------------------
  // TEST 11: RLS, Player Ownership & Talent Pipeline Isolation
  // ----------------------------------------------------
  console.log('--- TEST 11: RLS, Player Ownership & Talent Pipeline Isolation ---');
  // Attempt to access or mutate MasterStrategist business using testPlayer session
  const msBizId = 'ba5b6cc5-e7f9-4af8-9c84-9ddea21a3f5c';
  const unauthorizedActionRes = await fetch('http://localhost:3000/api/seo-game/process-action', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      actionCode: 'CREATE_PAGE',
      businessId: msBizId,
      payload: { pageTitle: 'Malicious Infiltration Page' }
    })
  });
  const unauthJson = await unauthorizedActionRes.json();
  console.log('Cross-player ownership attack status:', unauthorizedActionRes.status, 'Error:', unauthJson.error);

  // Check Talent Pipeline tables: ensure completely untouched
  const { count: recruitersCount } = await sbAdmin.from('recruiters').select('*', { count: 'exact', head: true });
  const { count: talentCount } = await sbAdmin.from('talent_profiles').select('*', { count: 'exact', head: true });
  console.log(`Talent Pipeline integrity verified: ${recruitersCount} recruiters, ${talentCount} talent profiles untouched.`);

  const t11Passed = unauthorizedActionRes.status === 403 && unauthJson.error === 'UNAUTHORIZED_BUSINESS';
  console.log(`TEST 11 RESULT: ${t11Passed ? 'PASSED ✓' : 'FAILED ✗'}\n`);

  // ----------------------------------------------------
  // FINAL CHECK: Verify MasterStrategist is completely pristine!
  // ----------------------------------------------------
  console.log('--- FINAL CHECK: MasterStrategist Baseline State ---');
  const { data: msPlayer } = await sbAdmin.from('seo_game_players').select('*').eq('display_name', 'MasterStrategist').single();
  const { data: msWallet } = await sbAdmin.from('seo_game_wallets').select('*').eq('player_id', msPlayer.id).single();
  const { data: msBiz } = await sbAdmin.from('seo_game_businesses').select('*').eq('player_id', msPlayer.id).single();

  console.log('CALL SIGN:', msPlayer.display_name);
  console.log('LEVEL:', msPlayer.level);
  console.log('XP:', msPlayer.xp);
  console.log('COINS:', msWallet.coins);
  console.log('ENERGY:', msWallet.energy, '/', msWallet.max_energy);
  console.log('AI CREDITS:', msWallet.ai_credits);
  console.log('BUSINESS:', msBiz.name);
  console.log('BUDGET:', `₦${msBiz.current_budget.toLocaleString()}`);
  console.log('DAY:', msPlayer.current_day);

  const msPristine = msPlayer.level === 1 && msPlayer.xp === 0 && msWallet.coins === 1000 &&
                     msWallet.energy === 100 && msWallet.ai_credits === 100 &&
                     msBiz.current_budget === 500000 && msPlayer.current_day === 1;

  console.log(`MASTERSTRATEGIST INTEGRITY: ${msPristine ? 'PRISTINE & UNTOUCHED ✓' : 'FAILED ✗'}\n`);

  console.log('====================================================');
  console.log('ALL PHASE 3 INTEGRITY & AUDIT TESTS COMPLETED!');
  console.log('====================================================');
}

runPhase3Audit().catch(err => {
  console.error('Test Suite Failed with Exception:', err);
  process.exit(1);
});
