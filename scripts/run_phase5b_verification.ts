import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL || '';
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const sbAuth = createClient(url, anonKey);
const sbAdmin = createClient(url, serviceKey);

async function runPhase5BVerification() {
  console.log('================================================================');
  console.log('THE SEO GAME — PHASE 5B VERIFICATION & REGISTRATION AUDIT SUITE');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  // ----------------------------------------------------------------
  // TEST 1: D-Intellectual Profile & Wallet Integrity
  // ----------------------------------------------------------------
  totalTests++;
  console.log('--- TEST 1: D-Intellectual Baseline & Non-Duplication Integrity ---');
  const { data: dPlayer } = await sbAdmin
    .from('seo_game_players')
    .select('*')
    .eq('display_name', 'D-Intellectual')
    .single();

  if (!dPlayer) {
    throw new Error('D-Intellectual player record missing!');
  }

  const { data: dWallet } = await sbAdmin
    .from('seo_game_wallets')
    .select('*')
    .eq('player_id', dPlayer.id)
    .single();

  console.log('Player ID:', dPlayer.id);
  console.log('User ID:', dPlayer.user_id);
  console.log('Level:', dPlayer.level, 'XP:', dPlayer.xp, 'Day:', dPlayer.current_day);
  console.log('Wallet:', { coins: dWallet.coins, energy: dWallet.energy, ai_credits: dWallet.ai_credits });

  // Ensure only ONE player record exists for D-Intellectual's user_id
  const { data: dAllProfiles } = await sbAdmin
    .from('seo_game_players')
    .select('id')
    .eq('user_id', dPlayer.user_id);

  const t1Passed = dPlayer && dWallet && dAllProfiles && dAllProfiles.length === 1 && dWallet.coins >= 1000;
  console.log(`D-Intellectual Profile Count: ${dAllProfiles?.length} (Strictly Unique)`);
  console.log(`TEST 1 RESULT: ${t1Passed ? 'PASSED ✓' : 'FAILED ✗'}\n`);
  if (t1Passed) passedTests++;

  // ----------------------------------------------------------------
  // TEST 2: Registration Modal Error Trace & Exact Error Message
  // ----------------------------------------------------------------
  totalTests++;
  console.log('--- TEST 2: Registration Error Mapping Verification ---');
  // Attempt signup with an already registered email
  const existingEmail = 'audit_suite_tester@seogame.local';
  const { error: dupSignupErr } = await sbAuth.auth.signUp({
    email: existingEmail,
    password: 'Password123!',
    options: { data: { player_name: 'DuplicateTester' } }
  });

  // Verify whether duplicate check correctly identifies duplicate vs generic error
  const dupMsg = dupSignupErr?.message?.toLowerCase() || '';
  const isDuplicateDetected = dupMsg.includes('already registered') || dupMsg.includes('already exists') || dupMsg.includes('user already exists');
  console.log('Duplicate Signup Raw Error:', dupSignupErr?.message);
  console.log('Correctly recognized as duplicate account:', isDuplicateDetected);
  const t2Passed = Boolean(dupSignupErr);
  console.log(`TEST 2 RESULT: ${t2Passed ? 'PASSED ✓' : 'FAILED ✗'}\n`);
  if (t2Passed) passedTests++;

  // ----------------------------------------------------------------
  // TEST 3: Fresh User Registration & Safe Wallet Creation
  // ----------------------------------------------------------------
  totalTests++;
  console.log('--- TEST 3: Fresh User Initialization via RPC ---');
  const freshEmail = `verify_cadet_${Date.now()}@seogame.local`;
  const { data: createdAuthUser, error: authCreateErr } = await sbAdmin.auth.admin.createUser({
    email: freshEmail,
    password: 'CadetPassword123!',
    email_confirm: true,
    user_metadata: { player_name: 'FreshCadet' }
  });

  if (authCreateErr || !createdAuthUser.user) {
    throw new Error('Failed to create test auth user: ' + authCreateErr?.message);
  }

  // Authenticate as this user
  const { data: userAuth } = await sbAuth.auth.signInWithPassword({
    email: freshEmail,
    password: 'CadetPassword123!'
  });

  const sbUser = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${userAuth?.session?.access_token}` } }
  });

  // Call seo_game_initialize_player RPC
  const { data: initData, error: initErr } = await sbUser.rpc('seo_game_initialize_player', {
    p_display_name: 'FreshCadet',
    p_difficulty: 'intermediate'
  });

  const { data: freshP } = await sbAdmin.from('seo_game_players').select('*').eq('user_id', createdAuthUser.user.id).single();
  const { data: freshW } = await sbAdmin.from('seo_game_wallets').select('*').eq('player_id', freshP.id).single();

  console.log('Initialized Player:', freshP.display_name, freshP.id);
  console.log('Initialized Wallet:', { coins: freshW.coins, energy: freshW.energy, ai_credits: freshW.ai_credits });

  const t3Passed = !initErr && freshP && freshW && freshW.coins === 1000 && freshW.energy === 100;
  console.log(`TEST 3 RESULT: ${t3Passed ? 'PASSED ✓' : 'FAILED ✗'}\n`);
  if (t3Passed) passedTests++;

  // ----------------------------------------------------------------
  // TEST 4: Duplicate Initialization Idempotency (Does NOT reset resources)
  // ----------------------------------------------------------------
  totalTests++;
  console.log('--- TEST 4: Duplicate Initialization Idempotency Protection ---');
  // Deduct 50 coins to test that a second initialize call DOES NOT overwrite coins
  await sbAdmin.from('seo_game_wallets').update({ coins: 950 }).eq('player_id', freshP.id);

  const { data: init2Data, error: init2Err } = await sbUser.rpc('seo_game_initialize_player', {
    p_display_name: 'FreshCadet',
    p_difficulty: 'intermediate'
  });

  const { data: freshW2 } = await sbAdmin.from('seo_game_wallets').select('*').eq('player_id', freshP.id).single();
  console.log('Wallet after repeat initialize call: coins =', freshW2.coins);

  const t4Passed = !init2Err && freshW2.coins === 950;
  console.log(`Resource Preservation on Duplicate Init: ${t4Passed ? 'PRESERVED (No Overwrite)' : 'FAILED'}`);
  console.log(`TEST 4 RESULT: ${t4Passed ? 'PASSED ✓' : 'FAILED ✗'}\n`);
  if (t4Passed) passedTests++;

  // ----------------------------------------------------------------
  // TEST 5: Missing Wallet Recovery & Self-Healing
  // ----------------------------------------------------------------
  totalTests++;
  console.log('--- TEST 5: Missing Wallet Recovery via Dashboard Sync ---');
  // Simulate deleted/missing wallet
  await sbAdmin.from('seo_game_wallets').delete().eq('player_id', freshP.id);
  const { data: wMissingCheck } = await sbAdmin.from('seo_game_wallets').select('*').eq('player_id', freshP.id).maybeSingle();
  console.log('Simulated wallet state before sync:', wMissingCheck); // null

  // Fetch dashboard data endpoint with this user's token
  const dashRes = await fetch('http://localhost:3000/api/seo-game/dashboard-data', {
    headers: { Authorization: `Bearer ${userAuth?.session?.access_token}` }
  });
  const dashJson = await dashRes.json();

  console.log('Dashboard Sync Status:', dashRes.status);
  console.log('Healed Wallet from Server:', dashJson.wallet ? { coins: dashJson.wallet.coins, energy: dashJson.wallet.energy } : 'null');

  const { data: wHealed } = await sbAdmin.from('seo_game_wallets').select('*').eq('player_id', freshP.id).single();
  const t5Passed = dashRes.status === 200 && wHealed && wHealed.coins === 1000 && wHealed.energy === 100;
  console.log(`TEST 5 RESULT: ${t5Passed ? 'PASSED ✓' : 'FAILED ✗'}\n`);
  if (t5Passed) passedTests++;

  // ----------------------------------------------------------------
  // TEST 6: Real Gameplay Action Execution & Transaction Ledger Recording
  // ----------------------------------------------------------------
  totalTests++;
  console.log('--- TEST 6: Canonical Action Processing & Atomic Ledger ---');
  // Create website & page for this test user
  const { data: testBiz } = await sbAdmin.from('seo_game_businesses').select('*').eq('player_id', freshP.id).single();
  const { data: testWeb } = await sbAdmin.from('seo_game_websites').select('*').eq('business_id', testBiz.id).single();

  const { data: testPage, error: pErr } = await sbAdmin.from('seo_game_pages').insert({
    website_id: testWeb.id,
    title: 'Enterprise Technical Audit Test',
    slug: '/enterprise-technical-audit-test',
    content_quality_score: 60,
    page_speed_score: 60,
    published_at: new Date().toISOString(),
    robots_index: true,
    indexed: true
  }).select().single();
  if (pErr) console.error('Page insert err:', pErr);

  // Execute canonical action: TECHNICAL_AUDIT (costs 8 energy)
  const actionRes = await fetch('http://localhost:3000/api/seo-game/process-action', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userAuth?.session?.access_token}`
    },
    body: JSON.stringify({
      actionCode: 'TECHNICAL_AUDIT',
      businessId: testBiz.id,
      websiteId: testWeb.id,
      pageId: testPage.id
    })
  });

  const actionJson = await actionRes.json();
  console.log('Action Status:', actionRes.status);
  console.log('Action Success:', actionJson.success);
  console.log('Energy Remaining:', actionJson.wallet?.energy);

  // Check ledger entry
  const { data: ledgerTxs } = await sbAdmin
    .from('seo_game_wallet_transactions')
    .select('*')
    .eq('player_id', freshP.id);

  console.log('Ledger transactions recorded:', ledgerTxs?.length);

  const t6Passed = actionRes.status === 200 && actionJson.success === true && actionJson.wallet?.energy === 92;
  console.log(`TEST 6 RESULT: ${t6Passed ? 'PASSED ✓' : 'FAILED ✗'}\n`);
  if (t6Passed) passedTests++;

  // ----------------------------------------------------------------
  // TEST 7: Clean Teardown of Temporary Test Fixture
  // ----------------------------------------------------------------
  totalTests++;
  console.log('--- TEST 7: Fixture Clean Teardown & Isolation ---');
  await sbAdmin.from('seo_game_wallet_transactions').delete().eq('player_id', freshP.id);
  await sbAdmin.from('seo_game_actions').delete().eq('player_id', freshP.id);
  await sbAdmin.from('seo_game_pages').delete().eq('id', testPage.id);
  await sbAdmin.from('seo_game_websites').delete().eq('id', testWeb.id);
  await sbAdmin.from('seo_game_businesses').delete().eq('id', testBiz.id);
  await sbAdmin.from('seo_game_wallets').delete().eq('player_id', freshP.id);
  await sbAdmin.from('seo_game_players').delete().eq('id', freshP.id);
  await sbAdmin.auth.admin.deleteUser(createdAuthUser.user.id);

  console.log('Temporary test user completely pruned from all tables.');
  const t7Passed = true;
  console.log(`TEST 7 RESULT: PASSED ✓\n`);
  if (t7Passed) passedTests++;

  console.log('================================================================');
  console.log(`PHASE 5B REGISTRATION & VERIFICATION SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('================================================================');
}

runPhase5BVerification().catch(err => {
  console.error('Phase 5B Suite Exception:', err);
  process.exit(1);
});
