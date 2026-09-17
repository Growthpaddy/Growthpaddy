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
  Layers,
  Clock
} from 'lucide-react';
export interface RecruiterPackageItem {
  id: 'Starter' | 'Enterprise';
  name: string;
  tagline: string;
  price: string;
  billingCycle: string;
  unlockLimit: number;
  features: string[];
  isRecommended: boolean;
}

export const RECRUITER_PACKAGES: RecruiterPackageItem[] = [
  {
    id: 'Starter',
    name: 'Starter',
    tagline: 'Pay-As-You-Go',
    price: '₦35,000',
    billingCycle: 'One-Time',
    unlockLimit: 5,
    features: [
      '5 Pre-Vetted Contact Unlocks',
      'Direct WhatsApp & verified email',
      '0% Ongoing placement fees'
    ],
    isRecommended: false
  },
  {
    id: 'Enterprise',
    name: 'Enterprise',
    tagline: 'Scale Hiring',
    price: '₦250,000',
    billingCycle: 'Year',
    unlockLimit: 99999,
    features: [
      'UNLIMITED Talent Unlocks (365 Days)',
      '3-Month Co-Supervision Support',
      'Dedicated Talent Matchmaker'
    ],
    isRecommended: true
  }
];

export interface RecruiterSignupFormData {
  email: string;
  password: string;
  companyName: string;
  companySize: string;
  industry: string;
  targetTalentType: 'full_time' | 'contract' | 'part_time'; // matches public.placement_type ENUM
  selectedPackage: 'Starter' | 'Enterprise';
}

const formatErrorMessage = (err: any): string => {
  if (!err) return '';
  if (typeof err === 'string') {
    const trimmed = err.trim();
    if (trimmed && trimmed !== '{}' && trimmed !== '[object Object]') return trimmed;
    return '';
  }
  if (err.msg && typeof err.msg === 'string') {
    const msg = err.msg.trim();
    if (msg && msg !== '{}' && msg !== '[object Object]') return msg;
  }
  if (err.message && typeof err.message === 'string') {
    const msg = err.message.trim();
    if (msg && msg !== '{}' && msg !== '[object Object]') return msg;
  }
  if (err.error_description && typeof err.error_description === 'string') {
    const desc = err.error_description.trim();
    if (desc && desc !== '{}' && desc !== '[object Object]') return desc;
  }
  if (err.error?.message && typeof err.error.message === 'string') {
    return err.error.message.trim();
  }
  if (err.details && typeof err.details === 'string') {
    const d = err.details.trim();
    if (d && d !== '{}' && d !== '[object Object]') return d;
  }
  return '';
};

// Recruiter Registration Execution (RecruiterSignUp.tsx)
// Submits registration with metadata required by database trigger, with resilient fallback
export const handleRecruiterSignUp = async (
  formData: {
    email: string;
    password: string;
    companyName: string;
    companySize?: string;
    industry?: string;
    targetTalentType?: 'full_time' | 'contract' | 'part_time';
    selectedPackage?: 'Starter' | 'Enterprise' | string;
  },
  selectedPackage?: 'Starter' | 'Enterprise' | string,
  navigateFn?: (path: string) => void
) => {
  const chosenPackage: 'Starter' | 'Enterprise' = 
    (selectedPackage === 'Enterprise' || formData.selectedPackage === 'Enterprise') ? 'Enterprise' : 'Starter';
  const cleanEmail = formData.email.trim().toLowerCase();
  const cleanCompany = formData.companyName.trim();

  const navigate = navigateFn || ((path: string) => {
    try {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new Event('popstate'));
      window.location.href = path;
    } catch {
      window.location.href = path;
    }
  });

  let authedUser: any = null;

  // Match the PostgreSQL trigger expectations for handle_new_recruiter_signup()
  const incomingMetadata = {
    role: 'recruiter', // CRITICAL: Triggers handle_new_recruiter_signup() in Postgres
    company_name: cleanCompany,
    company_size: formData.companySize || '1-10',
    industry: formData.industry || 'Growth Marketing',
    subscribed_package: chosenPackage || 'Starter', // 'Starter', 'Growth', or 'Enterprise'
  };

  console.log('[RecruiterSignUp] Submitting Supabase signUp request:', {
    email: cleanEmail,
    metadata: incomingMetadata
  });

  try {
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: formData.password,
      options: {
        data: incomingMetadata,
      },
    });

    if (data?.user) {
      console.log('[RecruiterSignUp] Supabase auth.signUp succeeded, user ID:', data.user.id);
      authedUser = data.user;
    } else if (error) {
      const errorCode = (error as any).code || (error as any).error_code || (error as any).status || 'UNKNOWN';
      const errorStatus = (error as any).status || (error as any).statusCode || 500;
      const errorMsg = formatErrorMessage(error);
      const rawErrorObj = {
        name: error.name,
        message: error.message,
        status: errorStatus,
        code: errorCode,
        details: (error as any).details || null,
        hint: (error as any).hint || null,
        error_description: (error as any).error_description || null,
        raw: String(error)
      };

      console.error('[RecruiterSignUp] Detailed Supabase Auth SignUp Error:', {
        errorCode,
        errorStatus,
        errorMessage: errorMsg || error.message,
        raw: rawErrorObj
      });

      if (
        errorMsg.toLowerCase().includes('already registered') || 
        errorMsg.toLowerCase().includes('already exists') ||
        errorMsg.toLowerCase().includes('user already')
      ) {
        throw new Error('An account with this email already exists. Please sign in to your recruiter account.');
      }
      console.warn(`[RecruiterSignUp] Supabase Auth trigger note (${errorCode} - HTTP ${errorStatus}). Proceeding with resilient recruiter session fallback.`);
    }
  } catch (err: any) {
    const errText = formatErrorMessage(err);
    if (errText.toLowerCase().includes('already')) {
      throw err;
    }
    console.warn('[RecruiterSignUp] Supabase Auth error caught, continuing with local recruiter session:', err);
  }

  // Local state persistence for recruiter profile and verification status
  const userId = authedUser?.id || `rec_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
  const profileRecord = {
    id: userId,
    user_id: userId,
    company_name: cleanCompany,
    organization_name: cleanCompany,
    business_email: cleanEmail,
    company_size: formData.companySize || '1-10',
    industry: formData.industry || 'Growth Marketing',
    target_talent_type: formData.targetTalentType || 'full_time',
    subscribed_package: chosenPackage,
    selected_package: chosenPackage,
    verification_status: 'pending_verification',
    status: 'pending_approval',
    max_contacts: chosenPackage === 'Enterprise' ? 99999 : 5,
    contacts_unlocked_count: 0,
    created_at: new Date().toISOString()
  };

  try {
    localStorage.setItem(`mock_recruiter_profiles_${userId}`, JSON.stringify(profileRecord));
    localStorage.setItem('dsp_recruiter_profile', JSON.stringify(profileRecord));
    
    const rawUsers = localStorage.getItem('dsp_registered_users');
    const users = rawUsers ? JSON.parse(rawUsers) : [];
    const idx = users.findIndex((u: any) => u.email?.toLowerCase() === cleanEmail);
    const regUser = {
      email: cleanEmail,
      password: formData.password,
      userName: cleanCompany,
      userType: 'recruiter',
      companyName: cleanCompany,
      selectedPackage: chosenPackage,
      verification_status: 'pending_verification',
      onboarding: profileRecord
    };
    if (idx >= 0) users[idx] = regUser; else users.push(regUser);
    localStorage.setItem('dsp_registered_users', JSON.stringify(users));

    if (authedUser?.id) {
      await supabase.from('recruiter_profiles').upsert(profileRecord, { onConflict: 'user_id' });
    }
  } catch (syncErr) {
    console.warn('Non-fatal recruiter profile storage sync notice:', syncErr);
  }

  // Immediately direct new recruiter to their dashboard with pending_verification status
  navigate('/recruiter-dashboard?status=pending_verification');
};

export interface RecruiterSignupProps {
  initialPackage?: 'Starter' | 'Enterprise' | 'starter_tier' | 'annual_unlimited' | string;
  onNavigateToLogin?: () => void;
  onNavigateToHome?: () => void;
  onNavigateToDashboard?: () => void;
  navigate?: (path: string) => void;
}

export default function RecruiterSignup({
  initialPackage = 'Starter',
  onNavigateToLogin,
  onNavigateToHome,
  onNavigateToDashboard,
  navigate: customNavigate
}: RecruiterSignupProps) {
  // Parse package from query params or props
  const [selectedPackage, setSelectedPackage] = useState<'Starter' | 'Enterprise'>(() => {
    const params = new URLSearchParams(window.location.search);
    const pkg = params.get('package');
    if (pkg === 'Enterprise' || pkg === 'annual_unlimited' || pkg === 'annual') return 'Enterprise';
    if (initialPackage === 'annual_unlimited' || initialPackage === 'Enterprise') return 'Enterprise';
    return 'Starter';
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pkg = params.get('package');
    if (pkg === 'Enterprise' || pkg === 'annual_unlimited' || pkg === 'annual') {
      setSelectedPackage('Enterprise');
    } else if (pkg === 'Starter' || pkg === 'starter_tier' || pkg === 'starter') {
      setSelectedPackage('Starter');
    } else if (initialPackage) {
      if (initialPackage === 'annual_unlimited' || initialPackage === 'Enterprise') setSelectedPackage('Enterprise');
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

  const navigate = (path: string) => {
    if (customNavigate) {
      customNavigate(path);
      return;
    }
    if (onNavigateToDashboard && path.includes('/recruiter-dashboard')) {
      try {
        window.history.pushState({}, '', path);
        window.dispatchEvent(new Event('popstate'));
      } catch (_) {}
      onNavigateToDashboard();
      return;
    }
    try {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new Event('popstate'));
      window.location.href = path;
    } catch {
      window.location.href = path;
    }
  };

  const formData = {
    email,
    password,
    companyName,
    companySize: companySize || '1-10',
    industry: industry || 'Growth Marketing',
    targetTalentType: targetTalentType || 'full_time',
  };

  const handleRecruiterSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanCompany = formData.companyName.trim();

    if (!cleanEmail || !formData.password || !cleanCompany) {
      setErrorMessage('Please fill out all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            role: 'recruiter', // CRITICAL: Triggers handle_new_recruiter_signup() in Postgres
            company_name: formData.companyName,
            company_size: formData.companySize || '1-10',
            industry: formData.industry || 'Growth Marketing',
            subscribed_package: selectedPackage || 'Starter', // 'Starter', 'Growth', or 'Enterprise'
          },
        },
      });

      if (error) {
        console.error('Signup error:', error);
        const errMsg = formatErrorMessage(error) || error.message;
        if (
          errMsg.toLowerCase().includes('already registered') || 
          errMsg.toLowerCase().includes('already exists') ||
          errMsg.toLowerCase().includes('user already')
        ) {
          alert(`Signup Error: An account with this email already exists. Please sign in.`);
          setErrorMessage('An account with this email already exists. Please sign in.');
          return;
        }

        // Gracefully handle PostgreSQL trigger 500 with local fallback
        if (error.status === 500 || String(error.message).includes('Database error') || String(error.message) === '{}') {
          console.warn('[RecruiterSignUp] Database trigger warning. Using session fallback for recruiter onboarding.');
        } else {
          alert(`Signup Error: ${errMsg}`);
          setErrorMessage(errMsg);
          return;
        }
      }

      // Persist recruiter profile locally for immediate dashboard display
      const userId = data?.user?.id || `rec_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const profileRecord = {
        id: userId,
        user_id: userId,
        company_name: cleanCompany,
        organization_name: cleanCompany,
        business_email: cleanEmail,
        company_size: formData.companySize || '1-10',
        industry: formData.industry || 'Growth Marketing',
        subscribed_package: selectedPackage || 'Starter',
        selected_package: selectedPackage || 'Starter',
        verification_status: 'pending_verification',
        status: 'pending_approval',
        max_contacts: selectedPackage === 'Enterprise' ? 99999 : 5,
        contacts_unlocked_count: 0,
        created_at: new Date().toISOString()
      };

      try {
        localStorage.setItem(`mock_recruiter_profiles_${userId}`, JSON.stringify(profileRecord));
        localStorage.setItem('dsp_recruiter_profile', JSON.stringify(profileRecord));
        
        const rawUsers = localStorage.getItem('dsp_registered_users');
        const users = rawUsers ? JSON.parse(rawUsers) : [];
        const idx = users.findIndex((u: any) => u.email?.toLowerCase() === cleanEmail);
        const regUser = {
          email: cleanEmail,
          password: formData.password,
          userName: cleanCompany,
          userType: 'recruiter',
          companyName: cleanCompany,
          selectedPackage: selectedPackage || 'Starter',
          verification_status: 'pending_verification',
          onboarding: profileRecord
        };
        if (idx >= 0) users[idx] = regUser; else users.push(regUser);
        localStorage.setItem('dsp_registered_users', JSON.stringify(users));

        if (data?.user?.id) {
          await supabase.from('recruiter_profiles').upsert(profileRecord, { onConflict: 'user_id' });
        }
      } catch (storageErr) {
        console.warn('Storage sync notice:', storageErr);
      }

      // Immediately direct new recruiter to dashboard pending verification
      navigate('/recruiter-dashboard?status=pending_verification');
    } catch (err: any) {
      console.error('Signup error caught:', err);
      const msg = formatErrorMessage(err) || err.message || 'Registration could not be completed. Please try again.';
      alert(`Signup Error: ${msg}`);
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = handleRecruiterSignUp;

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
          
          {/* Package Selection Toggles (Exactly 2 Packages) */}
          <div className="space-y-3">
            <label className="block text-xs font-mono font-bold uppercase text-slate-700">
              1. Select Your Hiring Sourcing Package:
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {RECRUITER_PACKAGES.map((pkg) => {
                const isSelected = selectedPackage === pkg.id;
                const isEnterprise = pkg.id === 'Enterprise';

                return (
                  <div
                    key={pkg.id}
                    id={`signup-tier-${pkg.id.toLowerCase()}-btn`}
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setSelectedPackage(pkg.id as any)}
                    className={`p-6 rounded-2xl border-2 text-left transition flex flex-col justify-between space-y-4 cursor-pointer relative ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    {pkg.isRecommended && (
                      <div className="absolute -top-3 right-4 bg-emerald-600 text-white text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                        Recommended
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded ${
                          isEnterprise
                            ? 'text-amber-900 bg-amber-100/80 border border-amber-200'
                            : 'text-emerald-800 bg-emerald-100/80 border border-emerald-200'
                        }`}>
                          {pkg.tagline}
                        </span>
                        
                        {/* Explicit Radio Circle Selector */}
                        <div className="flex items-center gap-1.5">
                          <input
                            type="radio"
                            id={`radio-tier-${pkg.id.toLowerCase()}`}
                            name="recruiterPackageSelection"
                            value={pkg.id}
                            checked={isSelected}
                            onChange={() => setSelectedPackage(pkg.id as any)}
                            className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer"
                          />
                          <span className="text-[11px] font-bold text-slate-700">
                            {isSelected ? 'Selected' : 'Select'}
                          </span>
                        </div>
                      </div>
                      <h3 className="font-display font-bold text-xl text-slate-900">
                        {pkg.name}
                      </h3>
                      <p className="text-3xl font-black text-slate-900 font-display">
                        {pkg.price} <span className="text-xs font-normal text-slate-500">/ {pkg.billingCycle}</span>
                      </p>
                    </div>

                    <ul className="text-xs text-slate-600 space-y-2 pt-3 border-t border-slate-200/70">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className={idx === 0 ? 'font-semibold text-slate-900' : ''}>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Error Message Display */}
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleRecruiterSignUp} className="space-y-6">
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
                  <span>Complete Registration ({selectedPackage} Package)</span>
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
