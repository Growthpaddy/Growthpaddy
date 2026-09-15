import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  Building2, 
  User, 
  Mail, 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Check, 
  ArrowRight, 
  Sparkles, 
  Eye, 
  EyeOff,
  Zap,
  Briefcase,
  Users,
  Layers
} from 'lucide-react';

export interface RecruiterSignupFormData {
  email: string;
  password: string;
  companyName: string;
  companySize: string;
  industry: string;
  targetTalentType: 'full_time' | 'contract' | 'part_time'; // matches public.placement_type ENUM
  selectedPackage: 'Starter' | 'Growth' | 'Enterprise';
}

// Step 2: Recruiter Signup Handler (exact implementation)
export const handleRecruiterSignUp = async (formData: {
  email: string;
  password: string;
  companyName: string;
  companySize: string;
  industry: string;
  targetTalentType: 'full_time' | 'contract' | 'part_time'; // matches public.placement_type ENUM
  selectedPackage: 'Starter' | 'Growth' | 'Enterprise';
}) => {
  // 1. Sign up user with metadata
  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        role: 'recruiter', // Triggers public.handle_new_recruiter_signup()
        company_name: formData.companyName,
        company_size: formData.companySize,
        industry: formData.industry,
        target_talent_type: formData.targetTalentType,
        subscribed_package: formData.selectedPackage,
      },
    },
  });

  if (error) {
    alert(`Signup Error: ${error.message}`);
    return;
  }

  // Local sandbox backup sync
  const userId = data?.user?.id || `rec_${formData.email.replace(/[^a-zA-Z0-9]/g, '_')}`;
  const profileRecord = {
    id: userId,
    user_id: userId,
    company_name: formData.companyName,
    organization_name: formData.companyName,
    company_size: formData.companySize,
    organization_size: formData.companySize,
    industry: formData.industry,
    industry_vertical: formData.industry,
    target_talent_type: formData.targetTalentType,
    subscribed_package: formData.selectedPackage,
    selected_package: formData.selectedPackage,
    max_contacts: formData.selectedPackage === 'Starter' ? 5 : formData.selectedPackage === 'Growth' ? 25 : 99999,
    contacts_unlocked_count: 0,
    created_at: new Date().toISOString()
  };

  try {
    localStorage.setItem(`mock_recruiter_profiles_${userId}`, JSON.stringify(profileRecord));
    localStorage.setItem('dsp_recruiter_profile', JSON.stringify(profileRecord));
    const rawUsers = localStorage.getItem('dsp_registered_users');
    const users = rawUsers ? JSON.parse(rawUsers) : [];
    const cleanEmail = formData.email.toLowerCase();
    const idx = users.findIndex((u: any) => u.email?.toLowerCase() === cleanEmail);
    const regUser = {
      email: formData.email,
      password: formData.password,
      userName: formData.companyName,
      userType: 'recruiter',
      companyName: formData.companyName,
      selectedPackage: formData.selectedPackage,
      onboarding: profileRecord
    };
    if (idx >= 0) users[idx] = regUser; else users.push(regUser);
    localStorage.setItem('dsp_registered_users', JSON.stringify(users));

    // Optional direct write to recruiter_profiles in case trigger is disabled or table exists
    if (data?.user?.id) {
      await supabase.from('recruiter_profiles').upsert(profileRecord, { onConflict: 'user_id' });
    }
  } catch (_) {}

  // 2. Sign out immediately so recruiter is not auto-logged in
  await supabase.auth.signOut();

  // 3. Redirect to Recruiter Login page with success message
  alert('Account created successfully! Please sign in with your credentials to access your recruiter dashboard.');
  window.location.href = '/recruiter-login';
};

interface RecruiterSignupProps {
  initialPackage?: 'Starter' | 'Growth' | 'Enterprise' | 'starter_tier' | 'annual_unlimited';
  onNavigateToLogin?: () => void;
  onNavigateToHome?: () => void;
}

export default function RecruiterSignup({
  initialPackage = 'Starter',
  onNavigateToLogin,
  onNavigateToHome
}: RecruiterSignupProps) {
  // Parse package from query params or props
  const [selectedPackage, setSelectedPackage] = useState<'Starter' | 'Growth' | 'Enterprise'>(() => {
    const params = new URLSearchParams(window.location.search);
    const pkg = params.get('package');
    if (pkg === 'Enterprise' || pkg === 'annual_unlimited' || pkg === 'annual') return 'Enterprise';
    if (pkg === 'Growth') return 'Growth';
    if (pkg === 'Starter' || pkg === 'starter_tier' || pkg === 'starter') return 'Starter';
    if (initialPackage === 'annual_unlimited' || initialPackage === 'Enterprise') return 'Enterprise';
    if (initialPackage === 'Growth') return 'Growth';
    return 'Starter';
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pkg = params.get('package');
    if (pkg === 'Enterprise' || pkg === 'annual_unlimited' || pkg === 'annual') {
      setSelectedPackage('Enterprise');
    } else if (pkg === 'Growth') {
      setSelectedPackage('Growth');
    } else if (pkg === 'Starter' || pkg === 'starter_tier' || pkg === 'starter') {
      setSelectedPackage('Starter');
    } else if (initialPackage) {
      if (initialPackage === 'annual_unlimited' || initialPackage === 'Enterprise') setSelectedPackage('Enterprise');
      else if (initialPackage === 'Growth') setSelectedPackage('Growth');
      else setSelectedPackage('Starter');
    }
  }, [initialPackage]);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companySize, setCompanySize] = useState('11-50');
  const [industry, setIndustry] = useState('Software & AI Technology');
  const [targetTalentType, setTargetTalentType] = useState<'full_time' | 'contract' | 'part_time'>('full_time');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanCompany = companyName.trim();

    if (!cleanEmail || !password || !cleanCompany || !companySize || !industry || !targetTalentType) {
      alert('Please fill out all required fields.');
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      await handleRecruiterSignUp({
        email: cleanEmail,
        password,
        companyName: cleanCompany,
        companySize,
        industry,
        targetTalentType,
        selectedPackage,
      });
    } catch (err: any) {
      const msg = err?.message || 'An unexpected error occurred during signup.';
      alert(`Signup Error: ${msg}`);
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const navToLogin = () => {
    if (onNavigateToLogin) {
      onNavigateToLogin();
    } else {
      window.location.href = '/recruiter-login';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 text-left font-sans selection:bg-emerald-500 selection:text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-1 rounded-full text-xs font-mono font-bold tracking-wide uppercase">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Digital Campux Recruiter Gateway</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display tracking-tight">
            Register Employer Hiring Account
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Gain direct WhatsApp and email access to audited, top 1% Nigerian growth marketers, AI engineers, and technical builders with 0% ongoing salary commissions.
          </p>
        </div>

        {/* REGISTRATION FORM */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
          
          {/* Package Selection Toggles */}
          <div className="space-y-3">
            <label className="block text-xs font-mono font-bold uppercase text-slate-700">
              1. Select Your Hiring Sourcing Package:
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Package 1: Starter */}
              <button
                type="button"
                onClick={() => setSelectedPackage('Starter')}
                className={`p-5 rounded-2xl border-2 text-left transition flex flex-col justify-between space-y-3 cursor-pointer ${
                  selectedPackage === 'Starter'
                    ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                      Pay-As-You-Go
                    </span>
                    {selectedPackage === 'Starter' && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    )}
                  </div>
                  <h3 className="font-display font-bold text-lg text-slate-900">
                    Starter
                  </h3>
                  <p className="text-2xl font-black text-slate-900 font-display">
                    ₦35,000 <span className="text-xs font-normal text-slate-500">/ One-Time</span>
                  </p>
                </div>

                <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-200/70">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>5 Pre-Vetted</strong> Contact Unlocks</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Direct WhatsApp & verified email</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>0% Ongoing placement fees</span>
                  </li>
                </ul>
              </button>

              {/* Package 2: Growth */}
              <button
                type="button"
                onClick={() => setSelectedPackage('Growth')}
                className={`p-5 rounded-2xl border-2 text-left transition flex flex-col justify-between space-y-3 cursor-pointer relative ${
                  selectedPackage === 'Growth'
                    ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-900 bg-blue-100/80 px-2 py-0.5 rounded">
                      Multi-Hire
                    </span>
                    {selectedPackage === 'Growth' && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    )}
                  </div>
                  <h3 className="font-display font-bold text-lg text-slate-900">
                    Growth
                  </h3>
                  <p className="text-2xl font-black text-slate-900 font-display">
                    ₦120,000 <span className="text-xs font-normal text-slate-500">/ Quarter</span>
                  </p>
                </div>

                <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-200/70">
                  <li className="flex items-center gap-2 text-slate-900 font-medium">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>25 Pre-Vetted</strong> Contact Unlocks</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Priority Matching & Pipeline Support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Full dossier & portfolio access</span>
                  </li>
                </ul>
              </button>

              {/* Package 3: Enterprise */}
              <button
                type="button"
                onClick={() => setSelectedPackage('Enterprise')}
                className={`p-5 rounded-2xl border-2 text-left transition flex flex-col justify-between space-y-3 cursor-pointer relative ${
                  selectedPackage === 'Enterprise'
                    ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="absolute -top-3 right-4 bg-emerald-600 text-white text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                  Recommended
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded">
                      Scale Hiring
                    </span>
                    {selectedPackage === 'Enterprise' && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    )}
                  </div>
                  <h3 className="font-display font-bold text-lg text-slate-900">
                    Enterprise
                  </h3>
                  <p className="text-2xl font-black text-slate-900 font-display">
                    ₦250,000 <span className="text-xs font-normal text-slate-500">/ Year</span>
                  </p>
                </div>

                <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-200/70">
                  <li className="flex items-center gap-2 text-slate-900 font-medium">
                    <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>UNLIMITED</strong> Talent Unlocks (365 Days)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>3-Month Co-Supervision</strong> Support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Dedicated Talent Matchmaker</span>
                  </li>
                </ul>
              </button>

            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <label className="block text-xs font-mono font-bold uppercase text-slate-700">
                2. Organization & Hiring Requirements:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Company Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Company Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Acme Corporation"
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 focus:bg-white transition"
                    />
                  </div>
                </div>

                {/* Company Size */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Company Size <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={companySize}
                      onChange={(e) => setCompanySize(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 focus:bg-white transition cursor-pointer"
                    >
                      <option value="1-10">1-10 Employees (Seed / Early Stage)</option>
                      <option value="11-50">11-50 Employees (Startup / Growth)</option>
                      <option value="51-200">51-200 Employees (Scaleup / Mid-Market)</option>
                      <option value="201-500">201-500 Employees (Enterprise)</option>
                      <option value="500+">500+ Employees (Global Enterprise)</option>
                    </select>
                  </div>
                </div>

                {/* Industry */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Industry Vertical <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 focus:bg-white transition cursor-pointer"
                    >
                      <option value="Software & AI Technology">Software & AI Technology</option>
                      <option value="Fintech & Financial Services">Fintech & Financial Services</option>
                      <option value="Digital Marketing & Growth Agency">Digital Marketing & Growth Agency</option>
                      <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                      <option value="Healthcare & HealthTech">Healthcare & HealthTech</option>
                      <option value="EdTech & Education">EdTech & Education</option>
                      <option value="Logistics & Supply Chain">Logistics & Supply Chain</option>
                      <option value="Consulting & Professional Services">Consulting & Professional Services</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Target Talent Placement Type (matches public.placement_type ENUM) */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Target Talent Placement Type <span className="text-rose-500">*</span>
                  <span className="ml-2 font-mono text-[10px] text-slate-400 font-normal">
                    (matches public.placement_type ENUM)
                  </span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setTargetTalentType('full_time')}
                    className={`py-3 px-4 rounded-xl border text-xs font-medium cursor-pointer transition flex items-center justify-between ${
                      targetTalentType === 'full_time'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <span>Full-Time (full_time)</span>
                    {targetTalentType === 'full_time' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetTalentType('contract')}
                    className={`py-3 px-4 rounded-xl border text-xs font-medium cursor-pointer transition flex items-center justify-between ${
                      targetTalentType === 'contract'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <span>Contract (contract)</span>
                    {targetTalentType === 'contract' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetTalentType('part_time')}
                    className={`py-3 px-4 rounded-xl border text-xs font-medium cursor-pointer transition flex items-center justify-between ${
                      targetTalentType === 'part_time'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <span>Part-Time (part_time)</span>
                    {targetTalentType === 'part_time' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </button>
                </div>
              </div>

              {/* Login Credentials Section */}
              <div className="border-t border-slate-100 pt-4 space-y-4">
                <label className="block text-xs font-mono font-bold uppercase text-slate-700">
                  3. Account Credentials:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Work Email <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="recruiter@company.com"
                        className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Create Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
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
                </div>
              </div>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition"
            >
              {loading ? (
                <span>Registering Recruiter Account...</span>
              ) : (
                <>
                  <span>Complete Signup & Redirect to Login ({selectedPackage} Package)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <p className="text-xs text-slate-500">
                Already have an active employer account?{' '}
                <button
                  type="button"
                  onClick={navToLogin}
                  className="font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  Sign In to Recruiter Portal
                </button>
              </p>
            </div>
          </form>

        </div>

      </div>
    </div>
  );
}
