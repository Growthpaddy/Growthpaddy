import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Users, 
  Unlock, 
  ArrowRight, 
  Building2, 
  Check,
  Award,
  Clock,
  Briefcase
} from 'lucide-react';

interface PricingPlansProps {
  setEmployerSlots?: React.Dispatch<React.SetStateAction<number>>;
  setFeedbackMsg?: (msg: string) => void;
  navigateToPage?: (page: any) => void;
}

export default function PricingPlans({ 
  setEmployerSlots, 
  setFeedbackMsg,
  navigateToPage 
}: PricingPlansProps) {
  const [activeTier, setActiveTier] = useState<'employers' | 'talent'>('employers');

  const handleSelectPackage = (pkg: 'starter_tier' | 'annual_unlimited') => {
    window.history.pushState({}, '', `/recruiter/signup?package=${pkg}`);
    window.dispatchEvent(new Event('popstate'));
  };

  return (
    <div className="space-y-10 py-6 max-w-6xl mx-auto text-left">
      
      {/* Page Title Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-semibold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Transparent Pricing
        </span>
        <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
          Enterprise Talent Sourcing Plans
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Source pre-vetted Nigerian tech & AI talents directly with zero commission on salaries. Verified candidate channels with instant GTBank invoice settlement.
        </p>
      </div>

      {/* Switch Toggles Tab */}
      <div className="flex bg-slate-100 p-1 rounded-xl max-w-xs mx-auto border border-slate-200">
        <button
          onClick={() => setActiveTier('employers')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTier === 'employers' 
              ? 'bg-white text-slate-900 shadow-xs font-bold' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>For Recruiters</span>
        </button>
        
        <button
          onClick={() => setActiveTier('talent')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTier === 'talent' 
              ? 'bg-white text-slate-900 shadow-xs font-bold' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>For Talents</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="animate-fadeIn">
        
        {/* Tier Panel 1: Sourcing Teams (Employers) */}
        {activeTier === 'employers' && (
          <div className="space-y-8">
            
            {/* Value/Savings Callout Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-700 shadow-sm">
              <div className="space-y-1">
                <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">Zero Commission Guarantee:</span>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  Traditional recruitment agencies take <span className="text-white font-semibold">20% to 30%</span> of first-year talent salaries. With GrowthPaddy, you pay a flat sourcing fee and interview, hire, and negotiate directly.
                </p>
              </div>
              <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold px-3 py-1.5 rounded-lg whitespace-nowrap">
                0% Placement Commission
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch pt-2 max-w-4xl mx-auto">
              
              {/* Package 1: Starter Hiring Pack */}
              <div className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col justify-between shadow-xs transition">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-md">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Pay-As-You-Go</span>
                  </div>
                  
                  <h3 className="font-display font-bold text-2xl text-slate-900">
                    Starter Hiring Pack
                  </h3>
                  
                  <div className="space-y-0.5">
                    <p className="text-4xl font-extrabold font-display text-slate-900">
                      ₦35,000
                    </p>
                    <p className="text-xs text-slate-500 font-medium">One-Time Payment</p>
                  </div>

                  <div className="border-t border-slate-100 pt-4 space-y-3 text-xs text-slate-600">
                    <p className="flex items-center gap-2 font-medium text-slate-900">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span><strong>5 Pre-Vetted Candidate</strong> Contact Unlocks</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Direct WhatsApp & Verified Email access</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Full Technical Dossiers & Audited Work History</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>0% Ongoing placement or salary commission</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectPackage('starter_tier')}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl text-xs cursor-pointer transition shadow-xs flex items-center justify-center gap-2"
                >
                  <span>Register for Starter Pack (₦35k)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Package 2: Annual Scale & Co-Pilot Access */}
              <div className="bg-white border-2 border-emerald-600 rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col justify-between shadow-md relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs">
                  Recommended Enterprise Tier
                </div>

                <div className="space-y-4 pt-1">
                  <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-300 text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-md">
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                    <span>Scale Hiring</span>
                  </div>

                  <h3 className="font-display font-bold text-2xl text-slate-900">
                    Annual Scale & Co-Pilot
                  </h3>
                  
                  <div className="space-y-0.5">
                    <p className="text-4xl font-extrabold font-display text-slate-900">
                      ₦250,000
                    </p>
                    <p className="text-xs text-emerald-700 font-semibold">Per Year · Unlimited Sourcing</p>
                  </div>

                  <div className="border-t border-emerald-100 pt-4 space-y-3 text-xs text-slate-700">
                    <p className="flex items-center gap-2 font-bold text-slate-900">
                      <Zap className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span><strong>UNLIMITED Candidate Unlocks</strong> for 365 Days</span>
                    </p>
                    <p className="flex items-center gap-2 font-medium text-slate-900">
                      <Award className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span><strong>3-Month Talent Integration Co-Supervision</strong></span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Dedicated Matchmaker & Priority Shortlisting</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Guaranteed SLA Talent Replacement support</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectPackage('annual_unlimited')}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-xs cursor-pointer transition shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Register for Annual Scale (₦250k)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Tier Panel 2: Digital Professionals (Talent) */}
        {activeTier === 'talent' && (
          <div className="max-w-md mx-auto pt-2 text-left space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm flex flex-col justify-between">
              
              <div className="space-y-4">
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 inline-block">
                  Candidate Verification
                </span>
                
                <h3 className="font-display font-bold text-2xl text-slate-900">GrowthPaddy Vetting</h3>
                
                <div className="space-y-0.5">
                  <p className="text-4xl font-extrabold font-display text-slate-900">
                    Free / 100% Retained
                  </p>
                  <p className="text-xs text-slate-500 font-medium">Earn full salaries · 0% commission deducted</p>
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-3 text-xs text-slate-600">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[11px] font-bold text-slate-800">Why Get Vetted?</span>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Stand out from thousands of applicants with verified test scores, unblurred portfolio avatars, and direct employer visibility.
                    </p>
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Instant priority placement in verified recruiter search</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Audited scorecard badge on your public candidate URL</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Retain 100% of your earnings with 0% platform cuts</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  window.history.pushState({}, '', '/talent-profile');
                  window.dispatchEvent(new Event('popstate'));
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-xs"
              >
                <span>Edit Candidate Dossier</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
