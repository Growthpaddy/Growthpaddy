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
      if (path.startsWith('/signup') || path.startsWith('/recruiter-signup')) {
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

  const handleSelectPackage = (packageId: string) => {
    navigate(`/recruiter-signup?package=${packageId}`);
  };

  return (
    <div className="space-y-10 py-8 max-w-5xl mx-auto px-4 text-left font-sans selection:bg-emerald-500 selection:text-white">
      
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

      {/* 2-TIER PACKAGES GRID (Starter ₦35,000 & Enterprise ₦250,000) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch pt-2">
        {RECRUITER_PACKAGES.map((pkg) => {
          const isEnterprise = pkg.id === 'Enterprise';

          return (
            <div 
              key={pkg.id}
              id={`package-card-${pkg.id.toLowerCase()}`}
              className={`bg-white rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col justify-between transition relative ${
                pkg.isRecommended 
                  ? 'border-2 border-emerald-600 shadow-lg' 
                  : 'border border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-md'
              }`}
            >
              {pkg.isRecommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-0.5 rounded-full shadow-xs">
                  Most Popular
                </div>
              )}

              <div className="space-y-4 pt-1">
                <div className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-md ${
                  isEnterprise 
                    ? 'bg-amber-50 text-amber-900 border border-amber-300' 
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}>
                  {isEnterprise ? (
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                  <span>{pkg.tagline}</span>
                </div>
                
                <h3 className="font-display font-bold text-2xl text-slate-900">
                  {pkg.name}
                </h3>
                
                <div className="space-y-0.5">
                  <p className="text-4xl font-extrabold font-display text-slate-900">
                    {pkg.price}
                  </p>
                  <p className={`text-xs font-medium ${isEnterprise ? 'text-amber-800 font-semibold' : 'text-emerald-700 font-semibold'}`}>
                    {pkg.billingCycle === 'One-Time' 
                      ? 'One-Time Sourcing License' 
                      : 'Annual Unlimited Access'}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-3 text-xs text-slate-600">
                  {pkg.features.map((feature, idx) => (
                    <p key={idx} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className={idx === 0 ? 'font-bold text-slate-900' : ''}>{feature}</span>
                    </p>
                  ))}
                </div>
              </div>

              <button
                type="button"
                id={`select-package-${pkg.id.toLowerCase()}-btn`}
                onClick={() => handleSelectPackage(pkg.id)}
                className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold cursor-pointer transition shadow-xs flex items-center justify-center gap-2 ${
                  pkg.isRecommended 
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold shadow-md' 
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                <span>Select {pkg.name} Package</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
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
