import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Sparkles, 
  Check, 
  ArrowRight, 
  Zap, 
  Award, 
  Clock, 
  ShieldCheck, 
  Lock,
  UserCheck,
  CheckCircle2
} from 'lucide-react';

export interface PackagesProps {
  navigateToPage?: (page: any, extraParams?: any) => void;
  navigate?: (path: string) => void;
}

export default function Packages({ navigateToPage, navigate: customNavigate }: PackagesProps) {
  const [intent, setIntent] = useState<string | null>(null);
  const [talentId, setTalentId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setIntent(params.get('intent'));
      setTalentId(params.get('talent_id'));
    }
  }, []);

  // Standard safe navigation helper
  const navigate = (path: string) => {
    if (customNavigate) {
      customNavigate(path);
      return;
    }
    if (navigateToPage) {
      if (path.startsWith('/recruiter-signup')) {
        const query = path.split('?')[1] || '';
        const params = new URLSearchParams(query);
        const pkg = params.get('package') || 'Starter';
        navigateToPage('recruiter-signup', { package: pkg });
        return;
      }
      if (path.startsWith('/recruiter-login')) {
        navigateToPage('recruiter-login');
        return;
      }
      if (path.startsWith('/directory')) {
        navigateToPage('directory');
        return;
      }
    }
    try {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new Event('popstate'));
    } catch {
      window.location.href = path;
    }
  };

  const handleSelectPackage = (selectedPackage: 'Starter' | 'Growth' | 'Enterprise') => {
    navigate(`/recruiter-signup?package=${selectedPackage}`);
  };

  return (
    <div className="space-y-10 py-8 max-w-6xl mx-auto px-4 text-left font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Intent Banner when redirected from "View Contact" in Directory */}
      {intent === 'view_contact' && (
        <div 
          id="intent-view-contact-banner"
          className="bg-emerald-50 border-2 border-emerald-500/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-fadeIn"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl shrink-0 mt-0.5">
              <Lock className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md inline-block mb-1">
                Candidate Contact Access
              </span>
              <h3 className="font-display font-bold text-base sm:text-lg text-emerald-950">
                Unlock Direct Contact Details {talentId ? `for Specialist #${talentId}` : ''}
              </h3>
              <p className="text-xs text-emerald-800 leading-relaxed max-w-2xl">
                To access verified WhatsApp numbers, emails, official CVs, and schedule interviews with 0% placement fees, choose a recruiter sourcing package below.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleSelectPackage('Starter')}
            className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>Instant Starter Access</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wide uppercase">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Transparent Sourcing Plans</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
          Recruiter Talent Sourcing Packages
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Access pre-vetted Nigerian tech & growth specialists directly. Pay a flat sourcing fee with 0% ongoing commission on talent salaries.
        </p>
      </div>

      {/* Zero Commission Callout */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800 shadow-md">
        <div className="space-y-1">
          <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
            Zero Agency Placement Commission:
          </span>
          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            Unlike traditional recruitment firms charging 20%–30% of candidate first-year salaries, Digital Campux provides unmasked WhatsApp and email contact profiles with fixed, transparent pricing.
          </p>
        </div>
        <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold px-3.5 py-2 rounded-xl whitespace-nowrap">
          0% Salary Commission
        </div>
      </div>

      {/* 3-TIER PACKAGES GRID (Starter, Growth, Enterprise) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch pt-2">
        
        {/* Tier 1: Starter */}
        <div 
          id="package-card-starter"
          className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col justify-between shadow-xs hover:shadow-md transition"
        >
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-md">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Pay-As-You-Go</span>
            </div>
            
            <h3 className="font-display font-bold text-2xl text-slate-900">
              Starter
            </h3>
            
            <div className="space-y-0.5">
              <p className="text-4xl font-extrabold font-display text-slate-900">
                ₦35,000
              </p>
              <p className="text-xs text-slate-500 font-medium">One-Time Sourcing License</p>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-3 text-xs text-slate-600">
              <p className="flex items-center gap-2 font-bold text-slate-900">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>5 Pre-Vetted Candidate</strong> Contact Unlocks</span>
              </p>
              <p className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Direct WhatsApp & Verified Email access</span>
              </p>
              <p className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Full Technical Dossiers & Audited Portfolios</span>
              </p>
              <p className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>0% Ongoing placement or salary commission</span>
              </p>
              <p className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Instant contact reveals once verified</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            id="select-package-starter-btn"
            onClick={() => handleSelectPackage('Starter')}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl text-xs cursor-pointer transition shadow-xs flex items-center justify-center gap-2"
          >
            <span>Select Starter Package</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Tier 2: Growth */}
        <div 
          id="package-card-growth"
          className="bg-white border-2 border-emerald-600 rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col justify-between shadow-lg relative"
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-0.5 rounded-full shadow-xs">
            Most Popular
          </div>

          <div className="space-y-4 pt-1">
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-md">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Scaling Teams</span>
            </div>

            <h3 className="font-display font-bold text-2xl text-slate-900">
              Growth
            </h3>
            
            <div className="space-y-0.5">
              <p className="text-4xl font-extrabold font-display text-slate-900">
                ₦95,000
              </p>
              <p className="text-xs text-emerald-700 font-semibold">Priority Quarterly Access</p>
            </div>

            <div className="border-t border-emerald-100 pt-4 space-y-3 text-xs text-slate-700">
              <p className="flex items-center gap-2 font-bold text-slate-900">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>15 Pre-Vetted Candidate</strong> Contact Unlocks</span>
              </p>
              <p className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Direct WhatsApp, Phone & Verified Email</span>
              </p>
              <p className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Priority Talent Matchmaking & Recommendations</span>
              </p>
              <p className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Direct 1-Click PDF Resume & Case Study Downloads</span>
              </p>
              <p className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>0% Commission fee guarantee on hires</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            id="select-package-growth-btn"
            onClick={() => handleSelectPackage('Growth')}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3.5 px-4 rounded-xl text-xs cursor-pointer transition shadow-md flex items-center justify-center gap-2"
          >
            <span>Select Growth Package</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Tier 3: Enterprise */}
        <div 
          id="package-card-enterprise"
          className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col justify-between shadow-xs hover:shadow-md transition"
        >
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-300 text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-md">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>Scale & Co-Pilot</span>
            </div>

            <h3 className="font-display font-bold text-2xl text-slate-900">
              Enterprise
            </h3>
            
            <div className="space-y-0.5">
              <p className="text-4xl font-extrabold font-display text-slate-900">
                ₦250,000
              </p>
              <p className="text-xs text-amber-800 font-semibold">Per Year · Unlimited Sourcing</p>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-3 text-xs text-slate-700">
              <p className="flex items-center gap-2 font-bold text-slate-900">
                <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>UNLIMITED Candidate Unlocks</strong> for 365 Days</span>
              </p>
              <p className="flex items-center gap-2 font-medium text-slate-900">
                <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>3-Month Talent Integration Co-Supervision</strong></span>
              </p>
              <p className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Dedicated Matchmaker & Priority Shortlisting</span>
              </p>
              <p className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Guaranteed SLA Talent Replacement Support</span>
              </p>
              <p className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Full Executive Audits & Co-Supervision</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            id="select-package-enterprise-btn"
            onClick={() => handleSelectPackage('Enterprise')}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl text-xs cursor-pointer transition shadow-xs flex items-center justify-center gap-2"
          >
            <span>Select Enterprise Package</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Recruiter Help / Login Bar */}
      <div className="pt-4 text-center">
        <p className="text-xs text-slate-500">
          Already have an active recruiter account?{' '}
          <button
            onClick={() => navigate('/recruiter-login')}
            className="text-emerald-700 font-bold hover:underline cursor-pointer"
          >
            Sign in to Recruiter Dashboard
          </button>
        </p>
      </div>

    </div>
  );
}
