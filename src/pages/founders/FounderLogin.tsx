import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2, Loader2, X, Mail } from 'lucide-react';
import { loginFounder, requestFounderPasswordReset } from '../../lib/founderAuth';

interface FounderLoginProps {
  onLoginSuccess: () => void;
  onNavigateToRegister: () => void;
  onNavigateHome: () => void;
  initialNotification?: string | null;
  initialEmail?: string;
}

export const FounderLogin: React.FC<FounderLoginProps> = ({
  onLoginSuccess,
  onNavigateToRegister,
  onNavigateHome,
  initialNotification,
  initialEmail = ''
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(initialNotification || null);

  // Forgot Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email.trim()) {
      setFormError('Please enter your email address.');
      return;
    }
    if (!password) {
      setFormError('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginFounder({
        email: email.trim().toLowerCase(),
        password
      });

      if (!result.success) {
        setFormError(result.error || 'Invalid email or password. Please verify your credentials.');
        setIsLoading(false);
        return;
      }

      // Success: Redirect to /founders/dashboard
      onLoginSuccess();
    } catch (err: any) {
      setFormError(err?.message || 'An unexpected connection error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetMessage(null);

    if (!resetEmail.trim() || !resetEmail.includes('@')) {
      setResetError('Please enter a valid email address.');
      return;
    }

    setResetLoading(true);

    try {
      const res = await requestFounderPasswordReset(resetEmail.trim());
      setResetMessage(res.message);
    } catch (err: any) {
      setResetError('Failed to process password reset. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F5F3] flex flex-col justify-between selection:bg-[#16834A]/20 selection:text-[#111111]">
      {/* TOP NAVIGATION BAR */}
      <header className="w-full bg-white border-b border-neutral-200/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 cursor-pointer select-none group text-left focus:outline-none"
            aria-label="Back to Digital Campux Home"
          >
            <span className="font-extrabold text-2xl tracking-tight text-[#111111] group-hover:text-neutral-800 transition">
              Digital
            </span>
            <span className="font-extrabold text-2xl tracking-tight text-[#16834A]">
              Campux
            </span>
          </button>

          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-500 hidden sm:inline">New to Digital Campux?</span>
            <button
              onClick={onNavigateToRegister}
              className="text-xs sm:text-sm font-semibold text-[#16834A] hover:text-[#13723f] px-3.5 py-1.5 rounded-lg border border-[#16834A]/30 hover:border-[#16834A] transition cursor-pointer"
            >
              Create Account
            </button>
          </div>
        </div>
      </header>

      {/* MAIN LOGIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex items-center justify-center">
        <div className="w-full bg-white rounded-3xl border border-neutral-200 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
          
          {/* LEFT COLUMN: BRAND VISUAL & FOUNDER TESTIMONIAL */}
          <div className="lg:col-span-5 relative bg-[#05080E] text-white p-8 sm:p-12 flex flex-col justify-between overflow-hidden">
            {/* Background Image with Scrim */}
            <img
              src="/src/assets/images/nigerian_woman_founder_1792406323111.jpg"
              alt="Digital Campux Emerging Founder"
              className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#05080E] via-[#05080E]/75 to-[#05080E]/40" />

            {/* Top Brand Marker */}
            <div className="relative z-10 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold tracking-wider uppercase text-[#18B892]">
                  Founders Hub
                </span>
                <span className="text-neutral-500">·</span>
                <span className="text-xs text-neutral-400">Digital Campux</span>
              </div>
              <p className="text-xs text-neutral-300 max-w-xs">
                Welcome back to your workspace. Manage your founder story, access opportunities and engage with the community.
              </p>
            </div>

            {/* Mid Quote / Purpose */}
            <div className="relative z-10 my-8 space-y-4">
              <div className="w-10 h-1 bg-[#16834A] rounded-full" />
              <blockquote className="text-lg sm:text-xl font-medium text-white leading-relaxed tracking-tight">
                "Building in Africa takes immense grit. Having a community that validates your journey and elevates your brand makes all the difference."
              </blockquote>
              <div className="text-xs text-neutral-400 space-y-0.5">
                <p className="font-semibold text-neutral-200">Digital Campux Founder Spotlight</p>
                <p>Authentic stories, real traction</p>
              </div>
            </div>

            {/* Bottom Community Stat */}
            <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400">
              <span>Over 500+ builders connected</span>
              <span className="text-[#18B892] font-semibold">100% Free Community</span>
            </div>
          </div>

          {/* RIGHT COLUMN: LOGIN FORM */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-14 flex flex-col justify-center">
            
            {/* Header / Titles */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={onNavigateHome}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition mb-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to website</span>
                </button>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight leading-snug">
                Welcome Back.
              </h1>
              <p className="text-sm text-neutral-600 leading-relaxed max-w-xl">
                Your founder journey continues here. Sign in to manage your profile, share your stories and stay connected with the community.
              </p>
            </div>

            {/* Welcome Notification Banner (Shown after registration) */}
            {successBanner && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-start gap-3 animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 text-[#16834A] shrink-0 mt-0.5" />
                <div className="space-y-0.5 flex-1">
                  <p className="font-bold text-[#16834A]">Account Created Successfully</p>
                  <p className="text-emerald-800">{successBanner}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSuccessBanner(null)}
                  className="text-emerald-600 hover:text-emerald-900 text-xs p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Error Alert */}
            {formError && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-3 animate-fadeIn">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-red-900">Sign In Error</p>
                  <p>{formError}</p>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              
              {/* Field 1: Email Address */}
              <div>
                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-[#16834A]">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (formError) setFormError(null);
                  }}
                  placeholder="founder@company.com"
                  required
                  autoFocus={!initialEmail}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white hover:border-neutral-400 text-sm text-[#111111] placeholder-neutral-400 focus:outline-none focus:border-[#16834A] focus:ring-2 focus:ring-[#16834A]/20 transition"
                />
              </div>

              {/* Field 2: Password with Forgot Password link & toggle */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider">
                    Password <span className="text-[#16834A]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email || '');
                      setIsForgotModalOpen(true);
                    }}
                    className="text-xs text-[#16834A] hover:text-[#13723f] font-semibold hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    placeholder="Enter your password"
                    required
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-neutral-300 bg-white hover:border-neutral-400 text-sm text-[#111111] placeholder-neutral-400 focus:outline-none focus:border-[#16834A] focus:ring-2 focus:ring-[#16834A]/20 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition p-1 cursor-pointer focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* CTA Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#16834A] hover:bg-[#13723f] disabled:bg-neutral-400 text-white font-bold py-3.5 px-6 rounded-xl transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] text-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Below Form Link */}
            <div className="mt-8 pt-6 border-t border-neutral-100 text-center">
              <p className="text-xs sm:text-sm text-neutral-600">
                New to Digital Campux?{' '}
                <button
                  type="button"
                  onClick={onNavigateToRegister}
                  className="font-bold text-[#16834A] hover:text-[#13723f] transition hover:underline cursor-pointer"
                >
                  Create an Account
                </button>
              </p>
            </div>

          </div>
        </div>
      </main>

      {/* FORGOT PASSWORD MODAL */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-5 relative shadow-2xl border border-neutral-200">
            <button
              onClick={() => {
                setIsForgotModalOpen(false);
                setResetMessage(null);
                setResetError(null);
              }}
              className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-700 w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#16834A] flex items-center justify-center mb-3">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-[#111111]">Reset Your Password</h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                Enter your account email address and we'll send you instructions to reset your password.
              </p>
            </div>

            {resetMessage ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#16834A] shrink-0 mt-0.5" />
                  <p>{resetMessage}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotModalOpen(false);
                    setResetMessage(null);
                  }}
                  className="w-full bg-[#16834A] text-white py-2 rounded-lg text-xs font-bold hover:bg-[#13723f] transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4 text-left">
                {resetError && (
                  <p className="text-xs text-red-600 font-medium">{resetError}</p>
                )}
                <div>
                  <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1.5">
                    Account Email
                  </label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="founder@company.com"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 text-sm text-[#111111] focus:outline-none focus:border-[#16834A] focus:ring-2 focus:ring-[#16834A]/20 transition"
                  />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="flex-1 py-2.5 rounded-xl bg-[#16834A] hover:bg-[#13723f] text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    {resetLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* QUIET FOOTER */}
      <footer className="w-full bg-white border-t border-neutral-200/80 py-4 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} Digital Campux Founders Community. All rights reserved.</span>
          <div className="flex items-center gap-4 text-neutral-500">
            <button onClick={onNavigateHome} className="hover:text-neutral-900 transition">Home</button>
            <span>·</span>
            <button onClick={onNavigateToRegister} className="hover:text-neutral-900 transition">Create Account</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
