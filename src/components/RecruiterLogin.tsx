import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  Building2, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Loader2
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        alert(`Login Failed: ${error.message}`);
        setLoading(false);
        return;
      }

      // Sync recruiter profile locally for immediate dashboard display
      if (data?.user) {
        try {
          const { data: recruiter } = await supabase
            .from('recruiters')
            .select('*')
            .eq('user_id', data.user.id)
            .maybeSingle();

          if (recruiter) {
            localStorage.setItem('dsp_recruiter_profile', JSON.stringify(recruiter));
            localStorage.setItem(`mock_recruiter_profiles_${recruiter.id}`, JSON.stringify(recruiter));
            if (recruiter.user_id) {
              localStorage.setItem(`mock_recruiter_profiles_${recruiter.user_id}`, JSON.stringify(recruiter));
            }
          }
        } catch (_) {}
      }

      window.location.href = '/recruiter-dashboard';
    } catch (err: any) {
      console.error('Login Exception:', err);
      alert(`Login Failed: ${err.message || 'Check console'}`);
      setLoading(false);
    }
  };

  const handleRecruiterLogin = handleLogin;

  const navToSignup = () => {
    if (onNavigateToSignup) {
      onNavigateToSignup();
    } else {
      window.location.href = '/recruiter-signup';
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
            Access unlocked candidate dossiers, package contact limits, WhatsApp outreach, and candidate portfolio audits.
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
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700">
                  Account Password
                </label>
              </div>
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
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Authenticating Profile...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Recruiter Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Sourcing Package Notice */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 text-slate-800 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Automatic Package & Contact Limit Sync</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              When you log in, your account automatically queries your verified <code className="text-emerald-700 bg-white px-1 py-0.5 rounded border border-slate-200">recruiter_profiles</code> parameters (Starter 5 contacts, or Enterprise Unlimited) and routes you to your direct sourcing dashboard.
            </p>
          </div>

          {/* Action Links */}
          <div className="border-t border-slate-100 pt-4 space-y-2.5 text-center">
            <p className="text-xs text-slate-500">
              Need a new recruiter sourcing account?{' '}
              <button
                type="button"
                onClick={navToSignup}
                className="font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                Register Company Account
              </button>
            </p>

            <p className="text-xs text-slate-500">
              Need assistance?{' '}
              <a
                href="https://wa.me/2348169664607?text=Hello%20Digital%20Campux%20Support%2C%20I%20need%20help%20with%20my%20recruiter%20account."
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 hover:underline font-medium"
              >
                Contact WhatsApp Support
              </a>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

export const handleRecruiterSignIn = async (email: string, password: string) => {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password: password,
  });

  if (authError) {
    throw new Error(authError.message);
  }

  const { data: recruiter, error: profileError } = await supabase
    .from('recruiters')
    .select('*')
    .eq('user_id', authData.user.id)
    .single();

  if (profileError || !recruiter) {
    console.error('Profile query failed:', profileError);
  } else {
    localStorage.setItem('dsp_recruiter_profile', JSON.stringify(recruiter));
    localStorage.setItem(`mock_recruiter_profiles_${recruiter.id}`, JSON.stringify(recruiter));
    if (recruiter.user_id) {
      localStorage.setItem(`mock_recruiter_profiles_${recruiter.user_id}`, JSON.stringify(recruiter));
    }
  }

  window.location.href = '/recruiter-dashboard';
};
