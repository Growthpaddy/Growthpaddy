import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  HelpCircle, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Users, 
  Unlock, 
  ArrowRight,
  TrendingUp,
  Award,
  AlertTriangle,
  Building2,
  Check
} from 'lucide-react';

interface PricingPlansProps {
  setEmployerSlots?: React.Dispatch<React.SetStateAction<number>>;
  setFeedbackMsg?: (msg: string) => void;
  navigateToPage?: (page: 'home' | 'directory' | 'employer' | 'talent' | 'assessment' | 'pricing') => void;
}

export default function PricingPlans({ 
  setEmployerSlots, 
  setFeedbackMsg,
  navigateToPage 
}: PricingPlansProps) {
  
  const [activeTier, setActiveTier] = useState<'employers' | 'talent'>('employers');
  const [successNotif, setSuccessNotif] = useState<string | null>(null);

  const handlePurchaseSlots = (slotsToAdd: number, priceLabel: string) => {
    if (setEmployerSlots) {
      setEmployerSlots(prev => Number((prev + slotsToAdd).toFixed(2)));
      setSuccessNotif(`Successfully added ${slotsToAdd} Sourcing Access Slot${slotsToAdd > 1 ? 's' : ''} (${priceLabel})! Your workspace balance is updated.`);
      setTimeout(() => setSuccessNotif(null), 5000);
    }
  };

  return (
    <div className="space-y-10 py-6 max-w-6xl mx-auto text-left">
      
      {/* Page Title Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-semibold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Transparent Pricing
        </span>
        <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
          Simple, Transparent Sourcing Plans
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Pay-as-you-go sourcing slots. No recurring contracts or placement markups. Hire directly and save up to 95%.
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
          <span>For Employers</span>
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
          <span>For Talent</span>
        </button>
      </div>

      {/* Checkout Success Notification banner */}
      {successNotif && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl max-w-xl mx-auto text-xs font-medium text-center shadow-xs animate-fadeIn">
          ✓ {successNotif}
        </div>
      )}

      {/* Tab Panels */}
      <div className="animate-fadeIn">
        
        {/* Tier Panel 1: Sourcing Teams (Employers) */}
        {activeTier === 'employers' && (
          <div className="space-y-8">
            
            {/* Value/Savings Callout Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-700 shadow-sm">
              <div className="space-y-1">
                <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">Recruiting Cost Arbitrage:</span>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  Traditional recruitment agencies charge <span className="text-white font-semibold">15% to 25%</span> of annual salary ($10,000+ per placement). With Digital Campux, you pay a flat per-slot access rate and recruit directly on your terms.
                </p>
              </div>
              <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold px-3 py-1.5 rounded-lg whitespace-nowrap">
                ~95% Average Savings
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch pt-2">
              
              {/* Package 1: Starter slot pass */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 space-y-6 flex flex-col justify-between shadow-xs hover:border-slate-300 transition">
                <div className="space-y-4">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Starter Pack</span>
                  <h3 className="font-display font-bold text-xl text-slate-900">Single Hire Slot</h3>
                  
                  <div className="space-y-0.5">
                    <p className="text-3xl font-extrabold font-display text-slate-900">
                      $99
                    </p>
                    <p className="text-xs text-slate-500 font-medium">One-time payment per slot</p>
                  </div>

                  <div className="border-t border-slate-100 pt-4 space-y-2.5 text-xs text-slate-600">
                    <p className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Unlock 1 verified candidate dossier</p>
                    <p className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 flex-shrink-0" /> View full portfolio audit scores</p>
                    <p className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Direct WhatsApp & email contact</p>
                    <p className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 flex-shrink-0" /> 0% ongoing salary commission</p>
                  </div>
                </div>

                <button
                  onClick={() => handlePurchaseSlots(1, 'Starter Single Slot')}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-xl text-xs cursor-pointer transition shadow-2xs"
                >
                  Acquire Starter Slot
                </button>
              </div>

              {/* Package 2: Recommended growth pack */}
              <div className="bg-white border-2 border-emerald-600 rounded-2xl p-6 sm:p-7 space-y-6 flex flex-col justify-between shadow-md relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs">
                  Most Popular · Save 20%
                </div>

                <div className="space-y-4 pt-1">
                  <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">Growth Scale</span>
                  <h3 className="font-display font-bold text-xl text-slate-900">Agency Bundle</h3>
                  
                  <div className="space-y-0.5">
                    <p className="text-3xl font-extrabold font-display text-slate-900 flex items-baseline gap-2">
                      $399
                      <span className="text-sm text-slate-400 font-normal line-through">$495</span>
                    </p>
                    <p className="text-xs text-emerald-700 font-semibold">Includes 5 active sourcing slots</p>
                  </div>

                  <div className="border-t border-emerald-100 pt-4 space-y-2.5 text-xs text-slate-700">
                    <p className="flex items-center gap-2 font-medium text-slate-900"><Check className="w-4 h-4 text-emerald-600 flex-shrink-0" /> 5 candidate profile unlocks</p>
                    <p className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Dedicated matchmaker support</p>
                    <p className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Priority interview scheduling</p>
                    <p className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Permanent talent database access</p>
                  </div>
                </div>

                <button
                  onClick={() => handlePurchaseSlots(5, 'Agency Bundle')}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs cursor-pointer transition shadow-xs"
                >
                  Acquire Agency Bundle
                </button>
              </div>

              {/* Package 3: Enterprise custom sourcing */}
              <div className="bg-slate-900 text-white p-6 sm:p-7 rounded-2xl space-y-6 flex flex-col justify-between border border-slate-800 shadow-xs">
                <div className="space-y-4">
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">Custom Volume</span>
                  <h3 className="font-display font-bold text-xl text-white">Enterprise Scale</h3>
                  
                  <div className="space-y-0.5">
                    <p className="text-3xl font-extrabold font-display text-white">
                      Custom
                    </p>
                    <p className="text-xs text-slate-400">Tailored recruitment pipelines</p>
                  </div>

                  <div className="border-t border-slate-800 pt-4 space-y-2.5 text-xs text-slate-300">
                    <p className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Unlimited candidate unlocks</p>
                    <p className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Custom technical assessments</p>
                    <p className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Guaranteed SLA replacement window</p>
                    <p className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> Custom invoicing & procurement</p>
                  </div>
                </div>

                <a
                  href="mailto:matchmaker@digitalcampux.com?subject=Enterprise%20Recruitment%20Custom%20Sourcing"
                  className="w-full bg-slate-800 hover:bg-slate-700 text-center font-semibold text-white py-2.5 px-4 rounded-xl text-xs block transition"
                >
                  Contact Enterprise Team
                </a>
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
                  Verification Pass
                </span>
                
                <h3 className="font-display font-bold text-2xl text-slate-900">Talent Accreditation</h3>
                
                <div className="space-y-0.5">
                  <p className="text-4xl font-extrabold font-display text-slate-900">
                    $45
                  </p>
                  <p className="text-xs text-slate-500 font-medium">One-time assessment fee · 100% money-back guarantee</p>
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-3 text-xs text-slate-600">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[11px] font-bold text-slate-800">Why Get Verified?</span>
                    <p className="text-slate-500 text-[11px] leading-relaxed">
                      Stand out from thousands of generic applicants with audited test scores, verified identity badges, and direct employer visibility.
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
                      <span>Retain 100% of your remote earnings with 0% platform cuts</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigateToPage && navigateToPage('talent')}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition shadow-xs"
              >
                <span>Start Skill Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
