import React, { useState } from 'react';
import { 
  X, 
  Gamepad2, 
  User, 
  Mail, 
  Lock, 
  AlertCircle, 
  Loader2, 
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export type SEOExperienceLevel = 'beginner' | 'strategist' | 'expert';

interface SEOGameRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSwitchToLogin: () => void;
  playSfx?: (type: 'click' | 'confirm' | 'warning' | 'upgrade' | 'success') => void;
}

export default function SEOGameRegistrationModal({
  isOpen,
  onClose,
  onSuccess,
  onSwitchToLogin,
  playSfx
}: SEOGameRegistrationModalProps) {
  const [playerName, setPlayerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<SEOExperienceLevel>('strategist');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Post-registration states
  const [isSuccessConfirmed, setIsSuccessConfirmed] = useState(false);
  const [isEmailConfirmationRequired, setIsEmailConfirmationRequired] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // UX Validation
    if (!playerName.trim()) {
      setErrorMessage('Please enter your Player Name / Call Sign');
      playSfx?.('warning');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please provide a valid operator email address');
      playSfx?.('warning');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Your access key does not meet the required security requirements.');
      playSfx?.('warning');
      return;
    }

    setLoading(true);
    setLoadingStep('CREATING DOSSIER...');

    try {
      // 1. Create Supabase Auth Account
      const cleanEmail = email.trim().toLowerCase();
      const cleanPlayerName = playerName.trim();

      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            player_name: cleanPlayerName,
            difficulty: experienceLevel,
            app_context: 'the-seo-game'
          }
        }
      });

      if (authErr) {
        if (
          authErr.message?.toLowerCase().includes('already registered') || 
          authErr.message?.toLowerCase().includes('already exists') ||
          authErr.status === 400 && authErr.message?.toLowerCase().includes('user already exists')
        ) {
          throw new Error('An active player dossier already exists for this email. Sign in instead.');
        }
        if (authErr.message?.toLowerCase().includes('password')) {
          throw new Error('Your access key does not meet the required security requirements.');
        }
        throw new Error('An active player dossier already exists for this email. Sign in instead.');
      }

      // Check if session was returned or if email confirmation is required
      let currentSession = authData?.session;

      if (!currentSession) {
        // Double check session in case auto-confirmed
        const { data: sessionData } = await supabase.auth.getSession();
        currentSession = sessionData?.session;
      }

      if (!currentSession) {
        // Supabase requires email verification
        playSfx?.('confirm');
        setIsEmailConfirmationRequired(true);
        setLoading(false);
        return;
      }

      // 2. Step: Initialize Player Using RPC
      setLoadingStep('INITIALIZING PLAYER...');

      // Map 'strategist' to database enum 'intermediate' (beginner, intermediate, advanced, expert)
      // while keeping UI labels BEGINNER, STRATEGIST, EXPERT
      let dbDifficulty: 'beginner' | 'intermediate' | 'expert' = 'intermediate';
      if (experienceLevel === 'beginner') {
        dbDifficulty = 'beginner';
      } else if (experienceLevel === 'expert') {
        dbDifficulty = 'expert';
      } else {
        dbDifficulty = 'intermediate';
      }

      const { error: rpcErr } = await supabase.rpc('seo_game_initialize_player', {
        p_display_name: cleanPlayerName,
        p_difficulty: dbDifficulty
      });

      if (rpcErr) {
        // If player already initialized or error
        if (rpcErr.message?.toLowerCase().includes('already exists') || rpcErr.message?.toLowerCase().includes('already initialized')) {
          // Profile exists, safe to proceed to sign in
        } else {
          console.error('RPC Error:', rpcErr);
          throw new Error("We couldn't initialize your player dossier. Please try again.");
        }
      }

      // 3. Successful Signup confirmation sequence
      playSfx?.('confirm');
      setIsSuccessConfirmed(true);

      // SIGNUP → SAVE TO SUPABASE → REDIRECT TO SIGN IN
      setTimeout(() => {
        onSuccess();
        onClose();
        onSwitchToLogin();
      }, 2400);

    } catch (err: any) {
      console.error('SEO Game Registration error:', err);
      const msg = err.message || "We couldn't initialize your player dossier. Please try again.";
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
        className="relative w-full max-w-lg rounded-3xl bg-[#090D16]/95 border border-[#18B892]/30 shadow-[0_0_50px_rgba(24,184,146,0.18)] p-6 sm:p-8 text-slate-100 overflow-hidden"
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

        {/* CONDITION 1: EMAIL VERIFICATION REQUIRED */}
        {isEmailConfirmationRequired ? (
          <div className="py-6 text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#18B892]/15 border border-[#18B892]/40 flex items-center justify-center text-[#18B892]">
              <Mail className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight uppercase">
                DOSSIER CREATED
              </h2>
              <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                Check your email to verify your player account before entering the game.
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={() => {
                  playSfx?.('click');
                  onClose();
                  onSwitchToLogin();
                }}
                className="w-full py-3.5 px-6 rounded-xl bg-[#18B892] hover:bg-[#149a7a] text-[#050811] font-display font-black text-sm tracking-wide transition cursor-pointer"
              >
                RETURN TO SIGN IN
              </button>
            </div>
          </div>
        ) : isSuccessConfirmed ? (
          /* CONDITION 2: SUCCESS TRANSITION SCREEN */
          <div className="py-8 text-center space-y-5 animate-fadeIn">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#18B892]/20 border border-[#18B892]/50 flex items-center justify-center text-[#18B892] shadow-lg shadow-[#18B892]/20">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight uppercase">
                DOSSIER CREATED
              </h2>
              <p className="font-mono text-sm font-bold text-[#18B892] tracking-wider uppercase">
                PLAYER PROFILE INITIALIZED
              </p>
              <p className="text-xs text-slate-400 font-mono tracking-wide pt-2">
                REDIRECTING TO AUTHENTICATION...
              </p>
            </div>

            <div className="flex justify-center pt-2">
              <div className="w-32 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-[#18B892] animate-pulse w-full" />
              </div>
            </div>
          </div>
        ) : (
          /* CONDITION 3: STANDARD REGISTRATION FORM */
          <>
            {/* Header */}
            <div className="mb-6 space-y-1.5 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18B892]/15 border border-[#18B892]/30 text-[#18B892] text-xs font-mono font-bold">
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>PLAYER ACCESS PROTOCOL</span>
              </div>

              <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
                Create Your Strategist Dossier
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Create your player account and enter the SEO world.
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
              {/* Player Name / Call Sign */}
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5 font-bold uppercase tracking-wider">
                  PLAYER NAME / CALL SIGN
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    disabled={loading}
                    value={playerName}
                    onChange={e => setPlayerName(e.target.value)}
                    placeholder="Enter call sign"
                    className="w-full bg-[#050811] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#18B892] focus:ring-1 focus:ring-[#18B892] transition font-sans disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Operator Email */}
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5 font-bold uppercase tracking-wider">
                  OPERATOR EMAIL
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    disabled={loading}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="operator@company.com"
                    className="w-full bg-[#050811] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#18B892] focus:ring-1 focus:ring-[#18B892] transition font-sans disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Access Key / Password */}
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
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full bg-[#050811] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#18B892] focus:ring-1 focus:ring-[#18B892] transition font-sans disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Experience Level Selector */}
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-2 font-bold uppercase tracking-wider">
                  EXPERIENCE LEVEL
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { key: 'beginner', title: 'BEGINNER', subtitle: 'Fundamentals' },
                    { key: 'strategist', title: 'STRATEGIST', subtitle: 'Balanced' },
                    { key: 'expert', title: 'EXPERT', subtitle: 'Algorithm Master' }
                  ].map(lvl => {
                    const isSelected = experienceLevel === lvl.key;
                    return (
                      <button
                        key={lvl.key}
                        type="button"
                        disabled={loading}
                        onClick={() => {
                          playSfx?.('click');
                          setExperienceLevel(lvl.key as SEOExperienceLevel);
                        }}
                        className={`py-2 px-3 rounded-xl border text-xs font-mono transition-all text-center cursor-pointer flex flex-col items-center gap-1 ${
                          isSelected
                            ? 'bg-[#18B892]/20 border-[#18B892] text-white shadow-[0_0_15px_rgba(24,184,146,0.25)]'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        } disabled:opacity-60 disabled:cursor-not-allowed`}
                      >
                        <span className="font-bold">{lvl.title}</span>
                        <span className="text-[10px] text-slate-400">
                          {lvl.subtitle}
                        </span>
                      </button>
                    );
                  })}
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
                    <span className="uppercase font-mono text-xs tracking-wider">{loadingStep || 'CREATING DOSSIER...'}</span>
                  </>
                ) : (
                  <>
                    <span>CREATE PLAYER DOSSIER</span>
                    <ChevronRight className="w-4 h-4 stroke-[3]" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Link: Sign In */}
            <div className="mt-5 pt-4 border-t border-slate-800 text-center">
              <p className="text-xs text-slate-400">
                Already have an active dossier?{' '}
                <button
                  onClick={() => {
                    playSfx?.('click');
                    onClose();
                    onSwitchToLogin();
                  }}
                  className="text-[#18B892] hover:underline font-bold transition ml-1 cursor-pointer"
                >
                  Sign In
                </button>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
