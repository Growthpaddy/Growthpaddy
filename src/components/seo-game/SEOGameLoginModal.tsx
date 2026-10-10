import React, { useState } from 'react';
import { 
  X, 
  Gamepad2, 
  Mail, 
  Lock, 
  AlertCircle, 
  Loader2, 
  ChevronRight
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface SEOGameLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userData: { id: string; email: string; name?: string; playerRecord?: any }) => void;
  onSwitchToRegister: () => void;
  playSfx?: (type: 'click' | 'confirm' | 'warning' | 'upgrade' | 'success') => void;
}

export default function SEOGameLoginModal({
  isOpen,
  onClose,
  onSuccess,
  onSwitchToRegister,
  playSfx
}: SEOGameLoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid player email address.');
      playSfx?.('warning');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your access key / password.');
      playSfx?.('warning');
      return;
    }

    setLoading(true);

    try {
      // 1. Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password
      });

      if (authError) {
        if (
          authError.message?.toLowerCase().includes('invalid login credentials') ||
          authError.message?.toLowerCase().includes('invalid credentials') ||
          authError.message?.toLowerCase().includes('email not confirmed')
        ) {
          throw new Error('Incorrect player credentials. Please try again.');
        }
        throw new Error('Incorrect player credentials. Please try again.');
      }

      const sessionUser = authData?.user;
      if (!sessionUser) {
        throw new Error('Incorrect player credentials. Please try again.');
      }

      // 2. Load player profile from seo_game_players
      const { data: player, error: playerError } = await supabase
        .from('seo_game_players')
        .select('*')
        .eq('user_id', sessionUser.id)
        .maybeSingle();

      if (playerError) {
        console.warn('Error querying seo_game_players:', playerError);
      }

      let finalPlayerRecord = player;

      // If user is authenticated in Supabase but hasn't had their seo_game_players dossier created yet,
      // safely initialize it via RPC
      if (!finalPlayerRecord) {
        const fallbackName = sessionUser.user_metadata?.player_name || sessionUser.email?.split('@')[0] || 'Player';
        const { data: initData, error: initErr } = await supabase.rpc('seo_game_initialize_player', {
          p_display_name: fallbackName,
          p_difficulty: 'intermediate'
        });

        if (initErr) {
          console.warn('Initialization note on login:', initErr);
        }

        // Re-fetch player
        const { data: freshPlayer } = await supabase
          .from('seo_game_players')
          .select('*')
          .eq('user_id', sessionUser.id)
          .maybeSingle();
        finalPlayerRecord = freshPlayer || initData;
      }

      // Safe wallet self-healing: if player dossier exists but wallet is missing, provision it safely without duplicating existing balances
      if (finalPlayerRecord?.id) {
        const { data: userWallet } = await supabase
          .from('seo_game_wallets')
          .select('id')
          .eq('player_id', finalPlayerRecord.id)
          .maybeSingle();

        if (!userWallet) {
          await supabase.from('seo_game_wallets').insert({
            player_id: finalPlayerRecord.id,
            coins: 1000,
            energy: 100,
            max_energy: 100,
            ai_credits: 100
          });
        }
      }

      playSfx?.('confirm');
      
      onSuccess({
        id: sessionUser.id,
        email: sessionUser.email || email.trim(),
        name: finalPlayerRecord?.display_name || sessionUser.user_metadata?.player_name || email.split('@')[0],
        playerRecord: finalPlayerRecord
      });

      onClose();
    } catch (err: any) {
      console.error('SEO Game Sign In error:', err);
      const msg = err.message || 'Incorrect player credentials. Please try again.';
      setErrorMessage(msg);
      playSfx?.('warning');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto backdrop-blur-xl bg-black/80 animate-fadeIn">
      {/* Outer Glow container */}
      <div 
        className="relative w-full max-w-md rounded-3xl bg-[#090D16]/95 border border-[#18B892]/30 shadow-[0_0_50px_rgba(24,184,146,0.18)] p-6 sm:p-8 text-slate-100 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#18B892] to-transparent opacity-80" />
        
        {/* Subtle Decorative Grid Watermark */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#18B892]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => {
            playSfx?.('click');
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6 space-y-1.5 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18B892]/15 border border-[#18B892]/30 text-[#18B892] text-xs font-mono font-bold">
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>PLAYER AUTHENTICATION</span>
          </div>

          <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
            Sign In to SEO Game
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Access your business HQ, rankings, missions and game wallet.
          </p>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {/* Email */}
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5 font-bold uppercase tracking-wider">
              PLAYER EMAIL
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                disabled={loading}
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="player@domain.com"
                className="w-full bg-[#050811] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#18B892] focus:ring-1 focus:ring-[#18B892] transition font-sans disabled:opacity-60"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5 font-bold uppercase tracking-wider">
              ACCESS KEY / PASSWORD
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                disabled={loading}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-[#050811] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#18B892] focus:ring-1 focus:ring-[#18B892] transition font-sans disabled:opacity-60"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3.5 px-6 rounded-xl bg-[#18B892] hover:bg-[#149a7a] active:scale-[0.99] text-[#050811] font-display font-black text-sm sm:text-base tracking-wide transition-all shadow-[0_0_24px_rgba(24,184,146,0.4)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#050811]" />
                <span className="font-mono text-xs tracking-wider uppercase">AUTHENTICATING...</span>
              </>
            ) : (
              <>
                <span>ENTER GAME</span>
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link: Sign Up */}
        <div className="mt-5 pt-4 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-400">
            Don&apos;t have a player dossier yet?{' '}
            <button
              onClick={() => {
                playSfx?.('click');
                onClose();
                onSwitchToRegister();
              }}
              className="text-[#18B892] hover:underline font-bold transition ml-1 cursor-pointer"
            >
              CREATE ACCOUNT
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
