import React, { useState, useEffect } from 'react';
import { 
  Gamepad2, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles,
  Coins,
  Zap,
  Shield,
  Loader2,
  Building2,
  Lock
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { PageType } from '../types';

interface SEOGamePlayPlaceholderProps {
  userName?: string;
  userEmail?: string;
  isLoggedIn: boolean;
  navigateToPage: (page: PageType) => void;
  onOpenSignIn: () => void;
}

export default function SEOGamePlayPlaceholder({
  userName,
  userEmail,
  isLoggedIn,
  navigateToPage,
  onOpenSignIn
}: SEOGamePlayPlaceholderProps) {
  // Authentication & Profile state
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [playerData, setPlayerData] = useState<any>(null);
  const [walletData, setWalletData] = useState<any>(null);
  const [authError, setAuthError] = useState(false);

  // Flash entry animation sequence steps:
  // 1. 'PLAYER VERIFIED'
  // 2. 'LOADING SEO WORLD...'
  // 3. 'PREPARING YOUR BUSINESS HQ...'
  // 4. 'ENTERING THE SEO GAME...'
  // 5. 'READY' -> Shows temporary "SEO GAME INITIALIZING - Your player profile is ready."
  const [flashStep, setFlashStep] = useState<number>(1);
  const [flashComplete, setFlashComplete] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function verifyAndLoadPlayer() {
      setCheckingAuth(true);
      try {
        const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
        const currentSession = sessionData?.session;

        if (sessionErr || !currentSession?.user) {
          if (isMounted) {
            setAuthError(true);
            setCheckingAuth(false);
            onOpenSignIn();
          }
          return;
        }

        const user = currentSession.user;

        // 1. Load Player Profile from `seo_game_players`
        let { data: player, error: playerErr } = await supabase
          .from('seo_game_players')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        // If authenticated but no dossier exists, initialize via RPC
        if (!player) {
          const fallbackName = user.user_metadata?.player_name || user.email?.split('@')[0] || 'Strategist';
          await supabase.rpc('seo_game_initialize_player', {
            p_display_name: fallbackName,
            p_difficulty: 'intermediate'
          });

          const { data: createdPlayer } = await supabase
            .from('seo_game_players')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();
          player = createdPlayer;
        }

        if (isMounted && player) {
          setPlayerData(player);

          // 2. Read Player Wallet from `seo_game_wallets`
          const { data: wallet } = await supabase
            .from('seo_game_wallets')
            .select('*')
            .eq('player_id', player.id)
            .maybeSingle();

          if (wallet) {
            setWalletData(wallet);
          }
        }

        if (isMounted) {
          setCheckingAuth(false);
        }
      } catch (err) {
        console.error('Error verifying SEO game player:', err);
        if (isMounted) {
          setAuthError(true);
          setCheckingAuth(false);
          onOpenSignIn();
        }
      }
    }

    verifyAndLoadPlayer();

    return () => {
      isMounted = false;
    };
  }, [onOpenSignIn]);

  // Flash animation step timing (Total duration ~ 2.4 seconds)
  useEffect(() => {
    if (checkingAuth || authError) return;

    const t1 = setTimeout(() => setFlashStep(2), 600);   // LOADING SEO WORLD...
    const t2 = setTimeout(() => setFlashStep(3), 1200);  // PREPARING YOUR BUSINESS HQ...
    const t3 = setTimeout(() => setFlashStep(4), 1800);  // ENTERING THE SEO GAME...
    const t4 = setTimeout(() => {
      setFlashStep(5);
      setFlashComplete(true);
    }, 2400); // REVEAL INITIALIZING SCREEN

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [checkingAuth, authError]);

  // If not authenticated or error, display clean SEO Game redirect trigger
  if (authError || (!checkingAuth && !playerData)) {
    return (
      <div className="min-h-screen bg-[#06090F] text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="p-8 rounded-3xl bg-[#090D16] border border-slate-800 max-w-md w-full space-y-5 shadow-2xl">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="font-display font-black text-xl text-white">PLAYER AUTHENTICATION REQUIRED</h2>
            <p className="text-xs text-slate-400">
              Please authenticate with your player credentials to enter the SEO world.
            </p>
          </div>
          <div className="space-y-2 pt-2">
            <button
              onClick={onOpenSignIn}
              className="w-full py-3 px-5 rounded-xl bg-[#18B892] hover:bg-[#149a7a] text-slate-950 font-display font-black text-xs uppercase tracking-wider transition cursor-pointer"
            >
              Sign In to SEO Game
            </button>
            <button
              onClick={() => navigateToPage('the-seo-game')}
              className="w-full py-2.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-mono transition cursor-pointer"
            >
              Return to Landing Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 1. Initial Loading or Flash Animation Chamber (1.5 - 2.5s)
  if (checkingAuth || !flashComplete) {
    const flashMessages: Record<number, string> = {
      1: 'PLAYER VERIFIED',
      2: 'LOADING SEO WORLD...',
      3: 'PREPARING YOUR BUSINESS HQ...',
      4: 'ENTERING THE SEO GAME...'
    };

    return (
      <div className="min-h-screen bg-[#06090F] text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Ambient atmospheric glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#18B892]/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 text-center space-y-6 max-w-md">
          {/* Logo Badge */}
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-[#18B892] via-[#0E7A60] to-[#0A4D3C] p-0.5 shadow-2xl shadow-[#18B892]/30 animate-pulse">
            <div className="w-full h-full bg-[#080E1A] rounded-[22px] flex items-center justify-center">
              <Gamepad2 className="w-10 h-10 text-[#18B892]" />
            </div>
          </div>

          {/* Flash Step Message */}
          <div className="space-y-2">
            <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-wider uppercase">
              {flashMessages[flashStep] || 'PLAYER VERIFIED'}
            </h2>
            <p className="font-mono text-xs text-slate-400">
              Identity: <span className="text-[#18B892] font-bold">{playerData?.display_name || userName || 'Verified Strategist'}</span>
            </p>
          </div>

          {/* Precision Micro Progress Bar */}
          <div className="w-48 mx-auto h-1 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#18B892] transition-all duration-500 ease-out"
              style={{ width: `${(flashStep / 4) * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // 2. Temporary Player Entry Screen
  return (
    <div className="min-h-screen bg-[#06090F] text-slate-100 font-sans selection:bg-[#18B892]/30 selection:text-white flex flex-col justify-between">
      
      {/* Top Header Bar */}
      <header className="w-full bg-[#070D18]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <button
          onClick={() => navigateToPage('the-seo-game')}
          className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400 hover:text-[#18B892] transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Overview</span>
        </button>

        {/* Player Status Dossier Pill */}
        <div className="flex items-center gap-3">
          {/* Wallet Readout (From verified Supabase records) */}
          <div className="hidden sm:flex items-center gap-3 text-xs font-mono bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Coins className="w-3.5 h-3.5" />
              <span>{walletData?.coins?.toLocaleString() ?? 1000}</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1.5 text-[#18B892] font-bold">
              <Zap className="w-3.5 h-3.5" />
              <span>{walletData?.energy ?? 100}/{walletData?.max_energy ?? 100}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-[#18B892] animate-pulse" />
            <span className="text-slate-200 font-bold">
              {playerData?.display_name || userName || 'Strategist'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Chamber: TEMPORARY PLACEHOLDER */}
      <main className="max-w-3xl mx-auto px-4 py-16 sm:py-24 text-center space-y-8 flex-1 flex flex-col items-center justify-center">
        
        {/* Glow & Badge */}
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-[#091120] border-2 border-[#18B892]/40 flex items-center justify-center text-[#18B892] shadow-[0_0_40px_rgba(24,184,146,0.2)] mx-auto">
            <Building2 className="w-10 h-10" />
          </div>
        </div>

        {/* Required Screen Text */}
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18B892]/15 border border-[#18B892]/30 text-[#18B892] text-xs font-mono font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>AUTHENTICATION COMPLETE</span>
          </div>

          <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight uppercase">
            SEO GAME INITIALIZING
          </h1>

          <p className="font-mono text-sm sm:text-base text-slate-300">
            Your player profile is ready.
          </p>
        </div>

        {/* Player Profile & Wallet Dossier Card */}
        <div className="w-full max-w-md bg-[#080E1C] border border-slate-800 rounded-2xl p-5 text-left space-y-3.5 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <span className="text-slate-400">PLAYER DOSSIER</span>
            <span className="text-[#18B892] font-bold uppercase">{playerData?.difficulty || 'STRATEGIST'}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">CALL SIGN</span>
              <strong className="text-white text-xs block truncate mt-0.5">
                {playerData?.display_name || 'Strategist'}
              </strong>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">CURRENT LEVEL</span>
              <strong className="text-white text-xs block mt-0.5">
                LEVEL {playerData?.level || 1} (0 XP)
              </strong>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">STARTING COINS</span>
              <strong className="text-amber-400 text-xs flex items-center gap-1 mt-0.5 font-bold">
                <Coins className="w-3.5 h-3.5" />
                {walletData?.coins?.toLocaleString() ?? 1000}
              </strong>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">STARTING ENERGY</span>
              <strong className="text-[#18B892] text-xs flex items-center gap-1 mt-0.5 font-bold">
                <Zap className="w-3.5 h-3.5" />
                {walletData?.energy ?? 100} / {walletData?.max_energy ?? 100}
              </strong>
            </div>
          </div>

          <div className="pt-2 text-[11px] text-slate-500 text-center">
            Database records verified. Interactive dashboard will launch in Phase 2.
          </div>
        </div>

        {/* Back action */}
        <div>
          <button
            onClick={() => navigateToPage('the-seo-game')}
            className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
          >
            Return to SEO Game Landing
          </button>
        </div>

      </main>

      {/* Footer bar */}
      <footer className="w-full py-4 text-center text-xs font-mono text-slate-600 border-t border-slate-800/60">
        DSP Academy · THE SEO GAME · Secure Supabase Authentication
      </footer>

    </div>
  );
}
