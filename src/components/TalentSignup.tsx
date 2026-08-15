import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ShieldCheck, Lock, User, Mail, Eye, EyeOff, ArrowRight, Sparkles, CheckCircle2, Check } from 'lucide-react';

interface TalentSignupProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export default function TalentSignup({ onSuccess, onSwitchToLogin }: TalentSignupProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'talent',
          full_name: fullName,
        }
      }
    });

    if (error) {
      console.error("Supabase Signup Error:", error);
      setError(error.message || "Signup failed. Please try again.");
      setLoading(false);
      return;
    }

    // If user object is created successfully, proceed directly to dashboard
    if (data.user) {
      setFullName('');
      setEmail('');
      setPassword('');
      setLoading(false);

      if (onSuccess) {
        onSuccess();
      }
      window.history.pushState({}, '', '/talent-profile');
      window.dispatchEvent(new Event('popstate'));
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-6 px-4 text-left">
      <div className="bg-white border border-slate-200/90 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6 relative">
        
        {/* Top Badge */}
        <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2.5 py-1 rounded-full text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Talent Fast-Track</span>
        </div>

        {/* Header Section */}
        <div className="space-y-1.5">
          <h3 className="font-display font-bold text-2xl text-slate-900">
            Join Digital Campux
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Get audited, receive your verified scorecard, and connect directly with top global employers.
          </p>
        </div>

        {/* Form Error Alert */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl space-y-0.5 animate-fadeIn">
            <span className="font-semibold block">Signup Notice:</span>
            <p className="text-[11px] leading-relaxed">{error}</p>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          {/* Full Name Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Full Legal Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                disabled={loading}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full border border-slate-200 pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50 focus:bg-white text-xs text-slate-900 rounded-xl disabled:opacity-50 transition"
              />
            </div>
          </div>

          {/* Email Address Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Work Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@domain.com"
                className="w-full border border-slate-200 pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50 focus:bg-white text-xs text-slate-900 rounded-xl disabled:opacity-50 transition"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Password (Min 6 Characters) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-slate-200 pl-10 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50 focus:bg-white text-xs text-slate-900 rounded-xl disabled:opacity-50 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 focus:outline-none cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Value Prop Micro Checklist */}
          <div className="pt-2 pb-1 space-y-1.5 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Diagnostic skill assessment & proof of work</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>0% ongoing agency commission fee</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Talent Account</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </>
            )}
          </button>
        </form>

        {/* Footer switch to sign in if callback provided */}
        {onSwitchToLogin && (
          <div className="text-center pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              Already registered?{' '}
            </span>
            <button
              onClick={onSwitchToLogin}
              disabled={loading}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
            >
              Sign In Here
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
