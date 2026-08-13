import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ShieldCheck, Lock, User, Mail, Eye, EyeOff, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

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

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'talent', // Triggers insertion into talent_profiles
            full_name: fullName,
          }
        }
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        // Clear form state (zero local storage used)
        setFullName('');
        setEmail('');
        setPassword('');
        setLoading(false);

        // Trigger success callback if provided
        if (onSuccess) {
          onSuccess();
        } else {
          // Standard SPA navigation fallback to Talent Dashboard route
          window.history.pushState({}, '', '/talent-profile');
          window.dispatchEvent(new Event('popstate'));
        }
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred during talent registration.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-8 px-4 text-left">
      <div className="bg-white border-4 border-neutral-950 p-6 sm:p-8 rounded-none shadow-[8px_8px_0px_0px_rgba(0,168,107,1)] space-y-6 relative">
        
        {/* Top Badge */}
        <div className="inline-flex items-center gap-1.5 bg-[#00A86B] text-white px-3 py-1 font-mono text-[10px] font-black uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span>Vetted Talent Pipeline</span>
        </div>

        {/* Header Section */}
        <div className="space-y-2 border-l-4 border-neutral-950 pl-4">
          <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-neutral-950">
            Apply as Vetted Talent
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 font-bold uppercase tracking-wide leading-snug">
            Join the top 3% of digital operators. Get vetted, get hired.
          </p>
        </div>

        {/* Form Error Alert */}
        {error && (
          <div className="p-3.5 bg-red-50 border-l-4 border-red-600 text-red-900 text-xs font-semibold rounded-none space-y-1 animate-fadeIn">
            <div className="text-red-700 font-mono text-[10px] uppercase font-black flex items-center gap-1.5">
              <span>⚠️ Signup Failed</span>
            </div>
            <p className="text-[11px] leading-relaxed font-medium">
              {error}
            </p>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          {/* Full Name Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-neutral-700 font-black uppercase block tracking-wider">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                disabled={loading}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Marcus Vance"
                className="w-full border-2 border-neutral-300 pl-10 pr-4 py-3 focus:outline-none focus:border-[#00A86B] bg-neutral-50 focus:bg-white text-xs font-bold text-neutral-900 tracking-wide rounded-none disabled:opacity-50 transition-colors"
              />
            </div>
          </div>

          {/* Email Address Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-neutral-700 font-black uppercase block tracking-wider">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="talent@domain.com"
                className="w-full border-2 border-neutral-300 pl-10 pr-4 py-3 focus:outline-none focus:border-[#00A86B] bg-neutral-50 focus:bg-white text-xs font-bold text-neutral-900 tracking-wide rounded-none disabled:opacity-50 transition-colors"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-neutral-700 font-black uppercase block tracking-wider">
              Password (Min 6 Characters) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
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
                className="w-full border-2 border-neutral-300 pl-10 pr-11 py-3 focus:outline-none focus:border-[#00A86B] bg-neutral-50 focus:bg-white text-xs font-bold text-neutral-900 tracking-wide rounded-none disabled:opacity-50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-700 focus:outline-none cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Value Prop Micro Checklist */}
          <div className="pt-2 pb-1 space-y-1.5 border-t border-dashed border-neutral-200">
            <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-600 font-bold uppercase">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00A86B]" />
              <span>Instant evaluation & assessment gateway</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-600 font-bold uppercase">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00A86B]" />
              <span>Zero placement fees & direct hiring access</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-[#00A86B] hover:bg-emerald-600 text-white font-black py-4 px-6 rounded-none text-xs uppercase tracking-wider border-2 border-neutral-950 flex items-center justify-center gap-2 cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Creating Talent Account...</span>
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
          <div className="text-center pt-3 border-t border-neutral-200">
            <span className="text-[11px] uppercase font-bold text-neutral-500">
              Already registered?{' '}
            </span>
            <button
              onClick={onSwitchToLogin}
              disabled={loading}
              className="text-[11px] uppercase font-black text-[#00A86B] hover:underline cursor-pointer"
            >
              Sign In Here
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
