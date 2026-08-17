import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  ArrowRight, 
  Sparkles, 
  Eye, 
  EyeOff,
  Clock,
  Layers,
  Infinity as InfinityIcon,
  Zap,
  CreditCard
} from 'lucide-react';

interface RecruiterSignupProps {
  initialPackage?: 'starter_tier' | 'annual_unlimited';
  onNavigateToLogin?: () => void;
  onNavigateToHome?: () => void;
}

export default function RecruiterSignup({
  initialPackage = 'starter_tier',
  onNavigateToLogin,
  onNavigateToHome
}: RecruiterSignupProps) {
  // Read package from query params if available
  const [selectedPackage, setSelectedPackage] = useState<'starter_tier' | 'annual_unlimited'>(() => {
    const params = new URLSearchParams(window.location.search);
    const pkg = params.get('package');
    if (pkg === 'annual_unlimited' || pkg === 'annual') return 'annual_unlimited';
    if (pkg === 'starter_tier' || pkg === 'starter') return 'starter_tier';
    return initialPackage;
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pkg = params.get('package');
    if (pkg === 'annual_unlimited' || pkg === 'annual') {
      setSelectedPackage('annual_unlimited');
    } else if (pkg === 'starter_tier' || pkg === 'starter') {
      setSelectedPackage('starter_tier');
    } else if (initialPackage) {
      setSelectedPackage(initialPackage);
    }
  }, [initialPackage]);

  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successSubmitted, setSuccessSubmitted] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('3003427360');
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 3000);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!companyName.trim() || !contactPerson.trim() || !businessEmail.trim() || !phoneNumber.trim() || !password) {
      setErrorMessage('Please complete all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      // 1. Sign up Supabase Auth user
      const metadata = {
        role: 'recruiter',
        user_type: 'recruiter',
        full_name: contactPerson.trim(),
        company_name: companyName.trim(),
        phone_number: phoneNumber.trim(),
        selected_package: selectedPackage,
        payment_status: 'pending_verification'
      };

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: businessEmail.trim().toLowerCase(),
        password,
        options: {
          data: metadata
        }
      });

      let userId = authData?.user?.id;

      if (authError) {
        // If user already exists, try signing in to bind profile
        if (authError.message.toLowerCase().includes('already registered')) {
          const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
            email: businessEmail.trim().toLowerCase(),
            password
          });
          if (signInErr) {
            throw new Error('An account with this email already exists. Please login instead.');
          }
          userId = signInData?.user?.id;
        } else {
          throw authError;
        }
      }

      if (!userId) {
        throw new Error('Account creation failed. Please check your details and try again.');
      }

      // 2. Persist record into public.recruiters
      const recruiterPayload = {
        user_id: userId,
        id: userId,
        company_name: companyName.trim(),
        contact_person: contactPerson.trim(),
        business_email: businessEmail.trim().toLowerCase(),
        phone_number: phoneNumber.trim(),
        selected_package: selectedPackage,
        payment_status: 'pending_verification',
        contacts_unlocked_count: 0,
        max_contacts: selectedPackage === 'starter_tier' ? 5 : 99999,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error: recruiterDbError } = await supabase
        .from('recruiters')
        .upsert(recruiterPayload, { onConflict: 'user_id' });

      if (recruiterDbError) {
        console.warn('Upsert recruiters error, retrying id:', recruiterDbError.message);
        await supabase
          .from('recruiters')
          .upsert({ ...recruiterPayload, id: userId });
      }

      // 3. Upsert user_roles & recruiter_profiles for backwards ecosystem compatibility
      try {
        await supabase
          .from('user_roles')
          .upsert({ user_id: userId, role: 'recruiter' });

        await supabase
          .from('recruiter_profiles')
          .upsert({
            id: userId,
            organization_name: companyName.trim(),
            email: businessEmail.trim().toLowerCase(),
            industry_vertical: 'Digital Growth / Tech',
            needed_talent_role: 'Full-Time Dedicated Talent',
            updated_at: new Date().toISOString()
          });
      } catch (legacyErr) {
        console.warn('Legacy table sync warning:', legacyErr);
      }

      setSuccessSubmitted(true);
    } catch (err: any) {
      console.error('Recruiter registration failed:', err);
      setErrorMessage(err.message || 'Unable to register recruiter account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const navToLogin = () => {
    if (onNavigateToLogin) {
      onNavigateToLogin();
    } else {
      window.history.pushState({}, '', '/recruiter/login');
      window.dispatchEvent(new Event('popstate'));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 text-left font-sans selection:bg-emerald-500 selection:text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-1 rounded-full text-xs font-mono font-bold tracking-wide uppercase">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>GrowthPaddy Recruiter Gateway</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display tracking-tight">
            Register Employer Hiring Account
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Gain direct WhatsApp and email access to audited, top 1% Nigerian growth marketers, AI engineers, and technical builders with 0% ongoing salary commissions.
          </p>
        </div>

        {successSubmitted ? (
          /* REGISTRATION SUCCESS CARD WITH GTBANK INSTRUCTIONS */
          <div className="bg-white border-2 border-emerald-500 rounded-3xl p-6 sm:p-10 shadow-lg space-y-6 animate-fadeIn">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold font-display text-slate-900">
                Registration Submitted Successfully!
              </h2>
              <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                Your recruiter account for <strong>{companyName}</strong> has been registered with the <strong>{selectedPackage === 'starter_tier' ? 'Starter Hiring Pack (₦35,000)' : 'Annual Scale & Co-Pilot Access (₦250,000)'}</strong>.
              </p>
            </div>

            {/* Bank Transfer Box */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 space-y-4 border border-slate-800 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
                    GTBank Official Account Transfer
                  </span>
                </div>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold px-3 py-1 rounded-lg">
                  {selectedPackage === 'starter_tier' ? '₦35,000' : '₦250,000'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 uppercase font-mono text-[10px] block">Bank Name</span>
                  <span className="font-bold text-sm text-white">Guaranty Trust Bank (GTBank)</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-mono text-[10px] block">Account Name</span>
                  <span className="font-bold text-sm text-white">DSP Academy Ltd</span>
                  <span className="text-[10px] text-slate-400 block">(Parent Training Organization)</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-mono text-[10px] block">Account Number</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono font-black text-xl text-emerald-400 tracking-wider">3003427360</span>
                    <button
                      type="button"
                      onClick={handleCopyAccount}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition cursor-pointer"
                      title="Copy Account Number"
                    >
                      {copiedAccount ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-mono text-[10px] block">Transfer Reference</span>
                  <span className="font-mono text-xs text-slate-300 block mt-1">
                    {companyName.replace(/\s+/g, '')}-{businessEmail.split('@')[0]}
                  </span>
                </div>
              </div>
            </div>

            {/* Warning Policy Box */}
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-amber-950 text-xs">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold uppercase font-mono text-[11px] text-amber-900">
                  Verification Policy Notice
                </p>
                <p className="leading-relaxed">
                  <strong>IMPORTANT:</strong> All recruiter accounts remain in Review Mode upon registration until GTBank payment is verified by our team (typically within 1 hour). Once verified, full contact unlock features will automatically activate upon sign-in.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={navToLogin}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-8 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition"
              >
                <span>Proceed to Recruiter Sign-In</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={`https://wa.me/2348169664607?text=${encodeURIComponent(`Hello GrowthPaddy Support, I just registered a recruiter account for ${companyName} (${businessEmail}) and completed the GTBank transfer for ${selectedPackage === 'starter_tier' ? '₦35,000' : '₦250,000'}. Please verify my account.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold py-3.5 px-6 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-xs"
              >
                <span>Send Transfer Proof on WhatsApp</span>
              </a>
            </div>
          </div>
        ) : (
          /* REGISTRATION FORM */
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
            
            {/* Package Selection Toggles */}
            <div className="space-y-3">
              <label className="block text-xs font-mono font-bold uppercase text-slate-700">
                1. Select Your Hiring Sourcing Tier:
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Starter Hiring Pack */}
                <button
                  type="button"
                  onClick={() => setSelectedPackage('starter_tier')}
                  className={`p-5 rounded-2xl border-2 text-left transition flex flex-col justify-between space-y-3 cursor-pointer ${
                    selectedPackage === 'starter_tier'
                      ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                        Pay-As-You-Go
                      </span>
                      {selectedPackage === 'starter_tier' && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      )}
                    </div>
                    <h3 className="font-display font-bold text-lg text-slate-900">
                      Starter Hiring Pack
                    </h3>
                    <p className="text-2xl font-black text-slate-900 font-display">
                      ₦35,000 <span className="text-xs font-normal text-slate-500">/ One-Time</span>
                    </p>
                  </div>

                  <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-200/70">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span><strong>5 Pre-Vetted Talent</strong> Contact Unlocks</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Direct WhatsApp & verified email access</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>0% Ongoing placement fees or commissions</span>
                    </li>
                  </ul>
                </button>

                {/* Annual Scale & Co-Pilot Access */}
                <button
                  type="button"
                  onClick={() => setSelectedPackage('annual_unlimited')}
                  className={`p-5 rounded-2xl border-2 text-left transition flex flex-col justify-between space-y-3 cursor-pointer relative ${
                    selectedPackage === 'annual_unlimited'
                      ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="absolute -top-3 right-4 bg-emerald-600 text-white text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                    Recommended Scale
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded">
                        Co-Pilot Included
                      </span>
                      {selectedPackage === 'annual_unlimited' && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      )}
                    </div>
                    <h3 className="font-display font-bold text-lg text-slate-900">
                      Annual Scale & Co-Pilot Access
                    </h3>
                    <p className="text-2xl font-black text-slate-900 font-display">
                      ₦250,000 <span className="text-xs font-normal text-slate-500">/ Year</span>
                    </p>
                  </div>

                  <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-200/70">
                    <li className="flex items-center gap-2 text-slate-900 font-medium">
                      <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span><strong>UNLIMITED</strong> Talent Contact Unlocks (365 Days)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span><strong>3-Month Talent Integration Co-Supervision</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Dedicated Talent Matchmaker Account Support</span>
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
            <form onSubmit={handleSignup} className="space-y-6">
              <div className="space-y-4">
                <label className="block text-xs font-mono font-bold uppercase text-slate-700">
                  2. Organization & Contact Details:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Company Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Company / Organization Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Sterling Ventures, Acme SaaS"
                        className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  {/* Contact Person Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Hiring Manager / Recruiter Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        placeholder="e.g. Marcus Sterling"
                        className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  {/* Business Email */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Business Work Email <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={businessEmail}
                        onChange={(e) => setBusinessEmail(e.target.value)}
                        placeholder="e.g. marcus@sterlingventures.com"
                        className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  {/* Phone / WhatsApp Number */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Phone / WhatsApp Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="e.g. +234 812 345 6789"
                        className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 focus:bg-white transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Create Secure Password <span className="text-rose-500">*</span>
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* GTBank Details Preview Banner */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 space-y-3 border border-slate-800 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-mono text-[11px] font-bold uppercase text-emerald-400">
                    Official GTBank Payment Account
                  </span>
                  <span className="text-xs font-bold text-slate-300">
                    Amount: {selectedPackage === 'starter_tier' ? '₦35,000' : '₦250,000'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-mono block">Bank</span>
                    <span className="font-semibold text-white">Guaranty Trust Bank (GTBank)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-mono block">Account Name</span>
                    <span className="font-semibold text-white">DSP Academy Ltd</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-mono block">Account Number</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono font-bold text-sm text-emerald-400">3003427360</span>
                      <button
                        type="button"
                        onClick={handleCopyAccount}
                        className="text-slate-400 hover:text-white"
                        title="Copy Account Number"
                      >
                        {copiedAccount ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification Policy Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>IMPORTANT:</strong> All recruiter accounts remain in Review Mode upon registration until GTBank payment is verified by our team (typically within 1 hour). Once verified, full contact unlock features will automatically activate upon sign-in.
                </p>
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
                    <span>Complete Registration ({selectedPackage === 'starter_tier' ? '₦35,000 Starter' : '₦250,000 Annual'})</span>
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
        )}

      </div>
    </div>
  );
}
