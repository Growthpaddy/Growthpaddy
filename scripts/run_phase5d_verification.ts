/**
 * THE SEO GAME — PHASE 5D END-TO-END VERIFICATION & ACCEPTANCE AUDIT
 * Complete automated testing for authentication, player initialization,
 * lifecycle stages, action processing, simulation engine, and security.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.VITE_SUPABASE_URL || '';
const anonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!url || !anonKey || !serviceKey) {
  console.error('Missing required environment keys (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY)');
  process.exit(1);
}

const sbAuth = createClient(url, anonKey);
const sbAdmin = createClient(url, serviceKey);

async function runPhase5DVerification() {
  console.log('================================================================');
  console.log('THE SEO GAME — PHASE 5D AUDIT & ACCEPTANCE SUITE');
  console.log('================================================================\n');

  let totalTests = 0;
  let passedTests = 0;

  // ------------------------------------------------------------------
  // SECTION 1: AUTHENTICATION, ENTRY & SAFE IDEMPOTENT INITIALIZATION
  // ------------------------------------------------------------------
  console.log('>>> SECTION 1: AUTHENTICATION, ENTRY & IDEMPOTENT INITIALIZATION');

  // Test 1.1: Existing Player Authentication
  totalTests++;
  console.log('--- TEST 1.1: Existing Player Authentication ---');
  const { data: auth1, error: auth1Err } = await sbAuth.auth.signInWithPassword({
    email: 'audit_suite_tester@seogame.local',
    password: 'AuditPassword123!'
  });

  const t1_1Passed = !auth1Err && !!auth1.session?.access_token;
  console.log('Auth Status:', t1_1Passed ? 'SUCCESS' : 'FAILED', auth1Err?.message || '');
  if (t1_1Passed) passedTests++;
  console.log(`TEST 1.1 RESULT: ${t1_1Passed ? 'PASSED ✓' : 'FAILED ✗'}\n`);

  const token = auth1?.session?.access_token || '';
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  // Test 1.2: Expired / Invalid Session Rejection (401)
  totalTests++;
  console.log('--- TEST 1.2: Expired / Invalid Session Rejection ---');
  const invalidRes = await fetch('http://localhost:3000/api/seo-game/dashboard-data', {
    headers: { Authorization: 'Bearer invalid_or_expired_token_xyz' }
  });
  const t1_2Passed = invalidRes.status === 401;
  console.log('Invalid Token Response Status:', invalidRes.status, `(Expected: 401)`);
  if (t1_2Passed) passedTests++;
  console.log(`TEST 1.2 RESULT: ${t1_2Passed ? 'PASSED ✓' : 'FAILED ✗'}\n`);

  // Test 1.3: Authoritative Dashboard & State Synchronization
  totalTests++;
  console.log('--- TEST 1.3: Authoritative Dashboard State Synchronization ---');
  const dashRes = await fetch('http://localhost:3000/api/seo-game/dashboard-data', { headers });
  const dashboard = await dashRes.json();
  const t1_3Passed = dashRes.status === 200 && 
                     dashboard.success === true && 
                     !!dashboard.player?.id && 
                     !!dashboard.business?.id && 
                     !!dashboard.website?.id && 
                     !!dashboard.wallet;

  console.log('Dashboard Sync Status:', dashRes.status);
  console.log('Resolved Entities:', {
    playerId: dashboard.player?.id,
    businessName: dashboard.business?.name,
    websiteDomain: dashboard.website?.domain,
    walletCoins: dashboard.wallet?.coins,
    walletEnergy: dashboard.wallet?.energy,
    pagesCount: dashboard.pages?.length,
    keywordsCount: dashboard.keywords?.length
  });
  if (t1_3Passed) passedTests++;
  console.log(`TEST 1.3 RESULT: ${t1_3Passed ? 'PASSED ✓' : 'FAILED ✗'}\n`);

  const playerId = dashboard.player?.id;
  const businessId = dashboard.business?.id;
  const websiteId = dashboard.website?.id;

  // Reset wallet and day for deterministic simulation test run
  await sbAdmin.from('seo_game_wallets').update({ coins: 1500, energy: 100, ai_credits: 100 }).eq('player_id', playerId);
  await sbAdmin.from('seo_game_players').update({ current_day: 1 }).eq('id', playerId);
  await sbAdmin.from('seo_game_actions').delete().eq('player_id', playerId);

  // ------------------------------------------------------------------
  // SECTION 2: COMPLETE REAL GAMEPLAY SEQUENCE
  // ------------------------------------------------------------------
  console.log('>>> SECTION 2: COMPLETE REAL GAMEPLAY ACTION SEQUENCE');

  // Test 2.1: Create Page via Canonical Action
  totalTests++;
  console.log('--- TEST 2.1: Create Website Page Action ---');
  const createPageRes = await fetch('http://localhost:3000/api/seo-game/process-action', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      playerId,
      actionCode: 'CREATE_PAGE',
      businessId,
      websiteId,
      payload: { pageTitle: `Audit Guide to Technical SEO ${Date.now()}` }
    })
  });
  const createPageJson = await createPageRes.json();
  const t2_1Passed = createPageRes.status === 200 && createPageJson.success === true;
  console.log('Create Page Status:', createPageRes.status);
  console.log('Feedback:', createPageJson.feedback?.title || createPageJson.message);
  if (t2_1Passed) passedTests++;
  console.log(`TEST 2.1 RESULT: ${t2_1Passed ? 'PASSED ✓' : 'FAILED ✗'}\n`);

  // Refresh pages to get the newly created page
  const { data: currentPages } = await sbAdmin.from('seo_game_pages').select('*').eq('website_id', websiteId).order('created_at', { ascending: false });
  const targetPage = currentPages?.[0];
  if (!targetPage) throw new Error('Target page could not be found.');
  console.log(`Target Page ID: ${targetPage.id} (Title: ${targetPage.title}, Published: ${!!targetPage.published_at})`);

  // Test 2.2: Publish Page (Draft -> Published)
  totalTests++;
  console.log('--- TEST 2.2: Publish Website Page ---');
  const pubRes = await fetch('http://localhost:3000/api/seo-game/lifecycle/publish-page', {
    method: 'POST',
    headers,
    body: JSON.stringify({ pageId: targetPage.id })
  });
  const pubJson = await pubRes.json();
  const t2_2Passed = pubRes.status === 200 && pubJson.success === true;
  console.log('Publish Status:', pubRes.status, pubJson.message);
  if (t2_2Passed) passedTests++;
  console.log(`TEST 2.2 RESULT: ${t2_2Passed ? 'PASSED ✓' : 'FAILED ✗'}\n`);

  // Test 2.3: Toggle Robots Directive (Allow Index vs Noindex)
  totalTests++;
  console.log('--- TEST 2.3: Toggle Robots Directive ---');
  const robotsRes = await fetch('http://localhost:3000/api/seo-game/lifecycle/toggle-robots-directive', {
    method: 'POST',
    headers,
    body: JSON.stringify({ pageId: targetPage.id, allowIndex: true })
  });
  const robotsJson = await robotsRes.json();
  const t2_3Passed = robotsRes.status === 200 && robotsJson.success === true && robotsJson.page?.robots_index === true;
  console.log('Robots Status:', robotsRes.status, 'robots_index =', robotsJson.page?.robots_index);
  if (t2_3Passed) passedTests++;
  console.log(`TEST 2.3 RESULT: ${t2_3Passed ? 'PASSED ✓' : 'FAILED ✗'}\n`);

  // Test 2.4: Keyword Research Action
  totalTests++;
  console.log('--- TEST 2.4: Keyword Research Action ---');
  const kwRes = await fetch('http://localhost:3000/api/seo-game/process-action', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      playerId,
      actionCode: 'KEYWORD_RESEARCH',
      businessId,
      websiteId
    })
  });
  const kwJson = await kwRes.json();
  const t2_4Passed = kwRes.status === 200 && kwJson.success === true;
  console.log('Keyword Action Status:', kwRes.status);
  console.log('Feedback:', kwJson.feedback?.title || kwJson.message);
  if (t2_4Passed) passedTests++;
  console.log(`TEST 2.4 RESULT: ${t2_4Passed ? 'PASSED ✓' : 'FAILED ✗'}\n`);

  // Fetch or create keyword target
  let { data: keywords } = await sbAdmin.from('seo_game_keywords').select('*').eq('website_id', websiteId);
  if (!keywords || keywords.length === 0) {
    const { data: newKw } = await sbAdmin.from('seo_game_keywords').insert({
      website_id: websiteId,
      keyword: 'technical seo audit checklist',
      search_volume: 3400,
      difficulty: 42,
      intent: 'Commercial',
      current_position: 18
    }).select().single();
    keywords = [newKw];
  }
  const targetKeyword = keywords[0];

  // Test 2.5: Assign Keyword Target to Page
  totalTests++;
  console.log('--- TEST 2.5: Assign Keyword Target to Page ---');
  const assignRes = await fetch('http://localhost:3000/api/seo-game/lifecycle/assign-keyword', {
    method: 'POST',
    headers,
    body: JSON.stringify({ pageId: targetPage.id, keywordId: targetKeyword.id })
  });
  const assignJson = await assignRes.json();
  const t2_5Passed = assignRes.status === 200 && assignJson.success === true;
  console.log('Assign Keyword Status:', assignRes.status, assignJson.message);
  if (t2_5Passed) passedTests++;
  console.log(`TEST 2.5 RESULT: ${t2_5Passed ? 'PASSED ✓' : 'FAILED ✗'}\n`);

  // Test 2.6: Crawl & Quality Inspection (CRAWLED -> EVALUATED -> INDEXED)
  totalTests++;
  console.log('--- TEST 2.6: Crawl & Quality Evaluation (Indexing Gate) ---');
  const crawlRes = await fetch('http://localhost:3000/api/seo-game/lifecycle/crawl-page', {
    method: 'POST',
    headers,
    body: JSON.stringify({ pageId: targetPage.id })
  });
  const crawlJson = await crawlRes.json();
  const t2_6Passed = crawlRes.status === 200 && crawlJson.success === true && crawlJson.page?.indexed === true;
  console.log('Crawl Status:', crawlRes.status, 'Indexed:', crawlJson.page?.indexed, 'Quality:', crawlJson.page?.content_quality_score);
  if (t2_6Passed) passedTests++;
  console.log(`TEST 2.6 RESULT: ${t2_6Passed ? 'PASSED ✓' : 'FAILED ✗'}\n`);

  // Test 2.7: Technical SEO Optimization
  totalTests++;
  console.log('--- TEST 2.7: Technical SEO Optimization Action ---');
  const techRes = await fetch('http://localhost:3000/api/seo-game/process-action', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      playerId,
      actionCode: 'TECHNICAL_AUDIT',
      businessId,
      websiteId,
      pageId: targetPage.id
    })
  });
  const techJson = await techRes.json();
  const t2_7Passed = techRes.status === 200 && techJson.success === true;
  console.log('Technical Optimization Status:', techRes.status, techJson.feedback?.title);
  if (t2_7Passed) passedTests++;
  console.log(`TEST 2.7 RESULT: ${t2_7Passed ? 'PASSED ✓' : 'FAILED ✗'}\n`);

  // Test 2.8: SERP Ranking Simulation
  totalTests++;
  console.log('--- TEST 2.8: SERP Ranking Simulation ---');
  const serpRes = await fetch('http://localhost:3000/api/seo-game/simulate-serp', {
    method: 'POST',
    headers,
    body: JSON.stringify({ keywordId: targetKeyword.id })
  });
  const serpJson = await serpRes.json();
  const topTen = serpJson.outcome?.topTenResults || serpJson.serpResults;
  const t2_8Passed = serpRes.status === 200 && serpJson.success === true && Array.isArray(topTen);
  console.log('SERP Status:', serpRes.status, 'Top 10 Count:', topTen?.length, 'Player Position:', serpJson.outcome?.playerPosition);
  if (t2_8Passed) passedTests++;
  console.log(`TEST 2.8 RESULT: ${t2_8Passed ? 'PASSED ✓' : 'FAILED ✗'}\n`);

  // Test 2.9: Advance Business Day & Business Funnel
  totalTests++;
  console.log('--- TEST 2.9: Advance Simulation Day ---');
  const advRes = await fetch('http://localhost:3000/api/seo-game/advance-day', { method: 'POST', headers });
  const advJson = await advRes.json();
  const t2_9Passed = advRes.status === 200 && advJson.success === true && advJson.summary?.currentDay === 2;
  console.log('Advance Day Status:', advRes.status);
  console.log('Simulation Results:', {
    day: advJson.summary?.currentDay,
    dailyClicks: advJson.summary?.dailyClicks,
    dailyLeads: advJson.summary?.dailyLeads,
    dailyCustomers: advJson.summary?.dailyCustomers,
    grossRevenue: advJson.summary?.grossRevenue,
    netProfit: advJson.summary?.netProfit,
    energyRestored: advJson.summary?.energyRestored
  });
  if (t2_9Passed) passedTests++;
  console.log(`TEST 2.9 RESULT: ${t2_9Passed ? 'PASSED ✓' : 'FAILED ✗'}\n`);

  // ------------------------------------------------------------------
  // SECTION 3: DATA INTEGRITY, ATOMICITY & SECURITY
  // ------------------------------------------------------------------
  console.log('>>> SECTION 3: DATA INTEGRITY, ATOMICITY & SECURITY AUDIT');

  // Test 3.1: Day Advance Idempotency (Prevent Double Simulation)
  totalTests++;
  console.log('--- TEST 3.1: Day Advance Idempotency Protection ---');
  // Attempt to advance again immediately without performing turns
  const dupAdvRes = await fetch('http://localhost:3000/api/seo-game/advance-day', { method: 'POST', headers });
  const dupAdvJson = await dupAdvRes.json();
  const t3_1Passed = dupAdvJson.cached === true || 
                     dupAdvJson.idempotentReplay === true ||
                     dupAdvJson.message?.includes('already been completed') ||
                     dupAdvRes.status === 409 ||
                     dupAdvRes.status === 400;
  console.log('Repeat Advance Day Status:', dupAdvRes.status, dupAdvJson.message || `Replayed cached result`);
  if (t3_1Passed) passedTests++;
  console.log(`TEST 3.1 RESULT: ${t3_1Passed ? 'PASSED ✓' : 'FAILED ✗'}\n`);

  // Test 3.2: Cross-Player Resource Tampering Prevention (Tenant Isolation)
  totalTests++;
  console.log('--- TEST 3.2: Multi-Tenant Ownership Authorization ---');
  // Attempt to perform an action on a fake or foreign business entity
  const foreignBizId = '00000000-0000-0000-0000-000000000000';
  const tamperRes = await fetch('http://localhost:3000/api/seo-game/process-action', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      playerId,
      actionCode: 'CREATE_PAGE',
      businessId: foreignBizId,
      websiteId,
      payload: { pageTitle: 'Illegal Tamper Page' }
    })
  });
  const tamperJson = await tamperRes.json();
  const t3_2Passed = tamperRes.status === 403 && tamperJson.error === 'UNAUTHORIZED_BUSINESS';
  console.log('Tamper Attempt Status:', tamperRes.status, `(Expected: 403 UNAUTHORIZED_BUSINESS)`);
  if (t3_2Passed) passedTests++;
  console.log(`TEST 3.2 RESULT: ${t3_2Passed ? 'PASSED ✓' : 'FAILED ✗'}\n`);

  // Test 3.3: Resource Deficit Protection (No partial deduction on deficit)
  totalTests++;
  console.log('--- TEST 3.3: Resource Deficit Atomic Protection ---');
  // Set energy to 1 and attempt an action requiring 8 energy
  await sbAdmin.from('seo_game_wallets').update({ energy: 1, coins: 500 }).eq('player_id', playerId);
  const deficitRes = await fetch('http://localhost:3000/api/seo-game/process-action', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      playerId,
      actionCode: 'TECHNICAL_AUDIT',
      businessId,
      websiteId,
      pageId: targetPage.id
    })
  });
  const deficitJson = await deficitRes.json();
  const { data: walletAfterDeficit } = await sbAdmin.from('seo_game_wallets').select('*').eq('player_id', playerId).single();
  const t3_3Passed = (deficitRes.status === 400 || deficitRes.status === 200) && 
                     deficitJson.success === false && 
                     walletAfterDeficit.energy === 1; // Energy was preserved, no partial deduction!

  console.log('Deficit Action Result: success =', deficitJson.success, deficitJson.feedback?.summary);
  console.log('Wallet Energy Preserved:', walletAfterDeficit.energy === 1 ? 'YES (1/100)' : 'NO');
  if (t3_3Passed) passedTests++;
  console.log(`TEST 3.3 RESULT: ${t3_3Passed ? 'PASSED ✓' : 'FAILED ✗'}\n`);

  // Restore wallet energy for test user
  await sbAdmin.from('seo_game_wallets').update({ energy: 100, coins: 1500, ai_credits: 100 }).eq('player_id', playerId);

  // Test 3.4: Client Bundle Leak Audit
  totalTests++;
  console.log('--- TEST 3.4: Client-Side Secret Leak Audit ---');
  // Check build output or bundle for service role secret
  const fs = await import('fs');
  const path = await import('path');
  const distDir = path.resolve('./dist');
  let leaked = false;
  if (fs.existsSync(distDir)) {
    const files = fs.readdirSync(distDir, { recursive: true }) as string[];
    for (const f of files) {
      if (typeof f === 'string' && (f.endsWith('.js') || f.endsWith('.html'))) {
        const content = fs.readFileSync(path.join(distDir, f), 'utf-8');
        if (content.includes(serviceKey)) {
          leaked = true;
          break;
        }
      }
    }
  }
  const t3_4Passed = !leaked;
  console.log('Service Role Key Leaked in Dist Bundle:', leaked ? 'CRITICAL LEAK' : 'NONE DETECTED ✓');
  if (t3_4Passed) passedTests++;
  console.log(`TEST 3.4 RESULT: ${t3_4Passed ? 'PASSED ✓' : 'FAILED ✗'}\n`);

  // ------------------------------------------------------------------
  // SUMMARY
  // ------------------------------------------------------------------
  console.log('================================================================');
  console.log(`PHASE 5D ACCEPTANCE AUDIT COMPLETE: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('================================================================');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runPhase5DVerification().catch(err => {
  console.error('Fatal Verification Failure:', err);
  process.exit(1);
});
