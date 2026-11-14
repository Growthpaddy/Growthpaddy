import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight, ArrowLeft, Check, AlertCircle, Loader2 } from 'lucide-react';
import { registerFounder, validateFounderRegistration } from '../../lib/founderAuth';

interface FounderRegisterProps {
  onNavigateToLogin: (registeredEmail?: string) => void;
  onNavigateHome: () => void;
}

export const FounderRegister: React.FC<FounderRegisterProps> = ({
  onNavigateToLogin,
  onNavigateHome
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [website, setWebsite] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setFormError(null);
    setFieldErrors({});

    const validation = validateFounderRegistration({
      full_name: fullName,
      email,
      password,
      business_name: businessName,
      website
    });

    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }

    if (!agreeTerms) {
      setFormError('Please accept the Digital Campux community terms to continue.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerFounder({
        full_name: fullName,
        email,
        password,
        business_name: businessName,
        website
      });

      if (!result.success) {
        setFormError(result.error || 'Failed to create your account. Please try again.');
        return;
      }

      // Success: Redirect to /founders/login with welcome notification
      onNavigateToLogin(email.trim().toLowerCase());
    } catch (err: any) {
      setFormError(err?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
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
            <span className="text-xs text-neutral-500 hidden sm:inline">Already a member?</span>
            <button
              onClick={() => onNavigateToLogin()}
              className="text-xs sm:text-sm font-semibold text-[#16834A] hover:text-[#13723f] px-3.5 py-1.5 rounded-lg border border-[#16834A]/30 hover:border-[#16834A] transition cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* MAIN REGISTRATION CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex items-center justify-center">
        <div className="w-full bg-white rounded-3xl border border-neutral-200 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[660px]">
          
          {/* LEFT COLUMN: BRAND VISUAL & COMMUNITY PROMISE */}
          <div className="lg:col-span-5 relative bg-[#05080E] text-white p-8 sm:p-12 flex flex-col justify-between overflow-hidden">
            {/* Background Image with Scrim */}
            <img
              src="/src/assets/images/nigerian_founder_hero_1792406308716.jpg"
              alt="Digital Campux Nigerian Founder in Focus"
              className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-luminosity scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#05080E] via-[#05080E]/75 to-[#05080E]/40" />

            {/* Top Brand Marker */}
            <div className="relative z-10 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold tracking-wider uppercase text-[#18B892]">
                  Founders Community
                </span>
                <span className="text-neutral-500">·</span>
                <span className="text-xs text-neutral-400">Nigeria</span>
              </div>
              <p className="text-xs text-neutral-300 max-w-xs">
                A dedicated community giving early-stage and emerging builders the visibility they deserve.
              </p>
            </div>

            {/* Mid Quote / Vision */}
            <div className="relative z-10 my-8 space-y-4">
              <div className="w-10 h-1 bg-[#16834A] rounded-full" />
              <blockquote className="text-lg sm:text-xl font-medium text-white leading-relaxed tracking-tight">
                "Traditional media focuses on founders who already raised millions. Digital Campux exists to spotlight builders when visibility matters most."
              </blockquote>
              <div className="text-xs text-neutral-400 space-y-0.5">
                <p className="font-semibold text-neutral-200">Digital Campux Editorial Initiative</p>
                <p>Curated founder stories &amp; builder-first network</p>
              </div>
            </div>

            {/* Bottom Pillar Checklist */}
            <div className="relative z-10 pt-4 border-t border-white/10 space-y-2 text-xs text-neutral-300">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#18B892] shrink-0" />
                <span>Feature opportunities on Founder Stories video channel</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#18B892] shrink-0" />
                <span>Private peer network of Nigerian founders</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#18B892] shrink-0" />
                <span>Zero fluff, zero vanity metrics — builder-first</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: 5-FIELD REGISTRATION FORM */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-14 flex flex-col justify-center">
            
            {/* Header / Titles */}
            <div className="space-y-2 mb-8">
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
                Your Story Deserves to Be Seen.
              </h1>
              <p className="text-sm text-neutral-600 leading-relaxed max-w-xl">
                Join the Digital Campux Founders Community. Connect with fellow founders, share your journey and give your business the visibility it deserves.
              </p>
            </div>

            {/* Error Alert */}
            {formError && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-3 animate-fadeIn">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-red-900">Registration Notice</p>
                  <p>{formError}</p>
                </div>
              </div>
            )}

            {/* Registration Form (Strictly 5 Fields) */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" noValidate>
              
              {/* Field 1: Full Name (Required) */}
              <div>
                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-[#16834A]">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (formError) setFormError(null);
                    if (fieldErrors.full_name) {
                      setFieldErrors((prev) => ({ ...prev, full_name: '' }));
                    }
                  }}
                  placeholder="Your full name"
                  required
                  className={`w-full px-4 py-3 rounded-xl border ${
                    fieldErrors.full_name 
                      ? 'border-red-400 bg-red-50/30' 
                      : 'border-neutral-300 bg-white hover:border-neutral-400'
                  } text-sm text-[#111111] placeholder-neutral-400 focus:outline-none focus:border-[#16834A] focus:ring-2 focus:ring-[#16834A]/20 transition`}
                />
                {fieldErrors.full_name && (
                  <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.full_name}</p>
                )}
              </div>

              {/* Field 2: Email Address (Required) */}
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
                    if (fieldErrors.email) {
                      setFieldErrors((prev) => ({ ...prev, email: '' }));
                    }
                  }}
                  placeholder="founder@company.com"
                  required
                  className={`w-full px-4 py-3 rounded-xl border ${
                    fieldErrors.email 
                      ? 'border-red-400 bg-red-50/30' 
                      : 'border-neutral-300 bg-white hover:border-neutral-400'
                  } text-sm text-[#111111] placeholder-neutral-400 focus:outline-none focus:border-[#16834A] focus:ring-2 focus:ring-[#16834A]/20 transition`}
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.email}</p>
                )}
              </div>

              {/* Field 3: Password (Required with Visibility Toggle) */}
              <div>
                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1.5">
                  Password <span className="text-[#16834A]">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (formError) setFormError(null);
                      if (fieldErrors.password) {
                        setFieldErrors((prev) => ({ ...prev, password: '' }));
                      }
                    }}
                    placeholder="Create a secure password (min. 8 characters)"
                    required
                    className={`w-full px-4 py-3 pr-12 rounded-xl border ${
                      fieldErrors.password 
                        ? 'border-red-400 bg-red-50/30' 
                        : 'border-neutral-300 bg-white hover:border-neutral-400'
                    } text-sm text-[#111111] placeholder-neutral-400 focus:outline-none focus:border-[#16834A] focus:ring-2 focus:ring-[#16834A]/20 transition`}
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
                {fieldErrors.password && (
                  <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.password}</p>
                )}
              </div>

              {/* Field 4: Business Name (Optional) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider">
                    Business Name
                  </label>
                  <span className="text-[11px] text-neutral-400 font-medium">Optional</span>
                </div>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Your business or venture name"
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white hover:border-neutral-400 text-sm text-[#111111] placeholder-neutral-400 focus:outline-none focus:border-[#16834A] focus:ring-2 focus:ring-[#16834A]/20 transition"
                />
              </div>

              {/* Field 5: Website (Optional) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider">
                    Website
                  </label>
                  <span className="text-[11px] text-neutral-400 font-medium">Optional</span>
                </div>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => {
                    setWebsite(e.target.value);
                    if (fieldErrors.website) {
                      setFieldErrors((prev) => ({ ...prev, website: '' }));
                    }
                  }}
                  placeholder="https://yourbusiness.com"
                  className={`w-full px-4 py-3 rounded-xl border ${
                    fieldErrors.website 
                      ? 'border-red-400 bg-red-50/30' 
                      : 'border-neutral-300 bg-white hover:border-neutral-400'
                  } text-sm text-[#111111] placeholder-neutral-400 focus:outline-none focus:border-[#16834A] focus:ring-2 focus:ring-[#16834A]/20 transition`}
                />
                {fieldErrors.website && (
                  <p className="mt-1 text-xs text-red-600 font-medium">{fieldErrors.website}</p>
                )}
              </div>

              {/* Terms Consent Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-[#16834A] focus:ring-[#16834A] border-neutral-300 cursor-pointer"
                  />
                  <span className="text-xs text-neutral-600 leading-normal">
                    I agree to the Digital Campux Community Guidelines. My profile will remain in review until verified by our editorial team.
                  </span>
                </label>
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
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create My Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Below Form Link */}
            <div className="mt-6 pt-6 border-t border-neutral-100 text-center">
              <p className="text-xs sm:text-sm text-neutral-600">
                Already part of the community?{' '}
                <button
                  type="button"
                  onClick={() => onNavigateToLogin()}
                  className="font-bold text-[#16834A] hover:text-[#13723f] transition hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </p>
            </div>

          </div>
        </div>
      </main>

      {/* QUIET FOOTER */}
      <footer className="w-full bg-white border-t border-neutral-200/80 py-4 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} Digital Campux Founders Community. All rights reserved.</span>
          <div className="flex items-center gap-4 text-neutral-500">
            <button onClick={onNavigateHome} className="hover:text-neutral-900 transition">Home</button>
            <span>·</span>
            <button onClick={() => onNavigateToLogin()} className="hover:text-neutral-900 transition">Founder Login</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
