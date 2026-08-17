import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  Building2, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface RecruiterLoginProps {
  onNavigateToDashboard?: () => void;
  onNavigateToSignup?: () => void;
  onNavigateToHome?: () => void;
}

export default function RecruiterLogin({
  onNavigateToDashboard,
  onNavigateToSignup,
  onNavigateToHome
}: RecruiterLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingVerificationNotice, setPendingVerificationNotice] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setPendingVerificationNotice(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter your business email and password.');
      return;
    }

    setLoading(true);

    try {
      // 1. Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      if (authError) {
        throw authError;
      }

      const user = authData?.user;
      if (!user) {
        throw new Error('Authentication succeeded but user record was not returned.');
      }

      // 2. Fetch live recruiter profile from public.recruiters
      const { data: recruiterData, error: recruiterErr } = await supabase
        .from('recruiters')
        .select('*')
        .or(`user_id.eq.${user.id},id.eq.${user.id}`)
        .maybeSingle();

      if (recruiterData) {
        if (recruiterData.payment_status === 'pending_verification') {
          setPendingVerificationNotice('Your recruiter account is currently in Review Mode awaiting GTBank payment verification (typically under 1 hour). You can proceed to the dashboard to monitor status or message support.');
        }
      }

      // 3. Route to dashboard
      if (onNavigateToDashboard) {
        onNavigateToDashboard();
      } else {
        window.history.pushState({}, '', '/recruiter/dashboard');
        window.dispatchEvent(new Event('popstate'));
      }
    } catch (err: any) {
      console.error('Recruiter sign in error:', err);
      let msg = err.message || 'Invalid login credentials.';
      if (msg.toLowerCase().includes('invalid login credentials')) {
        msg = 'Invalid business email or password. Please verify your credentials or register a new recruiter account.';
      }
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const navToSignup = () => {
    if (onNavigateToSignup) {
      onNavigateToSignup();
    } else {
      window.history.pushState({}, '', '/recruiter/signup');
      window.dispatchEvent(new Event('popstate'));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 text-left font-sans selection:bg-emerald-500 selection:text-white flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full space-y-8">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>Employer Sourcing Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tracking-tight">
            Recruiter Sign In
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            Access unlocked candidate dossiers, WhatsApp outreach, and candidate portfolio audits.
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Pending Verification Notice */}
          {pendingVerificationNotice && (
            <div className="p-4 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl text-xs flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{pendingVerificationNotice}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Business Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition"
            >
              {loading ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Notice */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-[11px] text-slate-500 space-y-1">
            <span className="font-bold text-slate-700 block">Bank Transfer Verification:</span>
            <p>
              If you just completed your GTBank transfer, accounts are activated within 1 hour by our verification team.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 text-center space-y-2">
            <p className="text-xs text-slate-600">
              Need a new recruiter hiring account?{' '}
              <button
                type="button"
                onClick={navToSignup}
                className="font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                Register Recruiter Account
              </button>
            </p>
            
            <p className="text-xs text-slate-500">
              Are you a job candidate?{' '}
              <a
                href="/talent"
                onClick={(e) => {
                  e.preventDefault();
                  window.history.pushState({}, '', '/talent');
                  window.dispatchEvent(new Event('popstate'));
                }}
                className="text-slate-700 hover:text-emerald-700 font-semibold"
              >
                Go to Candidate Portal
              </a>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
