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
  AlertTriangle
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
      setSuccessNotif(`Successfully purchased ${slotsToAdd} Sourcing Access Slots (${priceLabel})! Your workspace balance is updated.`);
      setTimeout(() => setSuccessNotif(null), 5000);
    }
  };

  return (
    <div className="space-y-10 py-10 px-4 sm:px-6 lg:px-8 bg-neutral-50/50">
      
      {/* Page Title Header */}
      <div className="text-left space-y-4 max-w-4xl mx-auto border-l-4 border-neutral-950 pl-6">
        <span className="text-[11px] uppercase font-mono font-bold text-emerald-700 tracking-widest block">
          TRANSPARENT VALUE MATRIX
        </span>
        <h1 className="font-display font-black text-4xl sm:text-6xl text-neutral-950 uppercase tracking-tight leading-none pt-1">
          SOURCING PLANS.
        </h1>
        <p className="text-xs font-bold text-[#111] max-w-lg uppercase tracking-wider leading-relaxed">
          Pay-as-you-go sourcing slots. No complex recurring subscriptions. Hire direct to bypass legacy agency markup.
        </p>
      </div>

      {/* Switch Toggles tab */}
      <div className="flex bg-neutral-200 border-2 border-neutral-950 rounded-none max-w-sm mx-auto relative z-10 p-1">
        <button
          onClick={() => setActiveTier('employers')}
          className={`flex-1 py-2.5 px-4 text-[10px] uppercase font-black rounded-none transition cursor-pointer flex items-center justify-center gap-2
            ${activeTier === 'employers' 
              ? 'bg-neutral-950 text-white shadow-sm' 
              : 'text-neutral-700 hover:text-neutral-950 bg-transparent'}`}
        >
          <Unlock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Sourcing Slots</span>
        </button>
        
        <button
          onClick={() => setActiveTier('talent')}
          className={`flex-1 py-2.5 px-4 text-[10px] uppercase font-black rounded-none transition cursor-pointer flex items-center justify-center gap-2
            ${activeTier === 'talent' 
              ? 'bg-neutral-950 text-white shadow-sm' 
              : 'text-neutral-700 hover:text-neutral-950 bg-transparent'}`}
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
          <span>Verification Pass</span>
        </button>
      </div>

      {/* Checkout Success Notif banner */}
      {successNotif && (
        <div className="bg-neutral-950 border-4 border-neutral-950 text-emerald-400 p-4 rounded-none max-w-2xl mx-auto text-xs font-black uppercase tracking-wide text-center animate-pulse shadow-[4px_4px_0px_0px_rgba(16,185,129,1)]">
          {successNotif}
        </div>
      )}

      {/* Tab Panels */}
      <div className="max-w-5xl mx-auto animate-fadeIn">
        
        {/* Tier Panel 1: Sourcing Teams (Employers) */}
        {activeTier === 'employers' && (
          <div className="space-y-10">
            
            {/* Value/Savings Callout Banner */}
            <div className="bg-neutral-950 text-white rounded-none p-5 sm:p-6 text-left border-2 border-neutral-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[4px_4px_0px_0px_rgba(16,185,129,1)]">
              <div className="space-y-1">
                <span className="text-[9px] font-mono font-black text-emerald-400 uppercase tracking-widest block">RECRUITMENT ARBITRAGE SAVINGS:</span>
                <p className="text-xs uppercase font-bold text-neutral-300 leading-relaxed max-w-2xl">
                  Traditional recruitment firms charge a fee of <strong className="text-white">15% to 20%</strong> of the candidate's salary (an average of $10,000+ per hire). DSP Talent Hub bypasses this completely. You pay a trivial, one-time slot rate and hire direct on your own terms.
                </p>
              </div>
              <div className="bg-[#033c2a] text-emerald-300 font-mono text-xs font-black px-3.5 py-1.5 rounded-none border border-emerald-600 block uppercase">
                SAVINGS: ~98% PER HIRE
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch pt-2 text-left">
              
              {/* Package 1: Starter slot pass */}
              <div className="bg-white border-2 border-neutral-950 p-6 sm:p-8 rounded-none space-y-6 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="space-y-4">
                  <span className="text-[9px] font-mono text-neutral-400 font-extrabold uppercase tracking-wider block">Starter Entry</span>
                  <h4 className="font-display font-black text-xl text-neutral-950 uppercase leading-none">Starter Slot</h4>
                  
                  <div className="space-y-1">
                    <p className="text-4xl font-black font-display text-neutral-950">
                      $99
                    </p>
                    <p className="text-[9.5px] uppercase font-bold text-neutral-400 font-mono font-black">One-off Access. Permanent.</p>
                  </div>

                  <div className="border-t border-dashed border-neutral-200 pt-4 space-y-2.5 text-[11px] text-neutral-600 font-bold uppercase tracking-wider">
                    <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Unlock 1.0 Client Contacts</p>
                    <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> View 2 Verified Case Studies</p>
                    <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Unlimited notepad logs</p>
                  </div>
                </div>

                <button
                  onClick={() => handlePurchaseSlots(1, 'Starter Slot Pass')}
                  className="w-full bg-neutral-950 hover:bg-neutral-900 text-white font-black py-3 px-4 rounded-none text-xs uppercase tracking-widest cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,0.15)]"
                >
                  ACQUIRE STARTER PART
                </button>
              </div>

              {/* Package 2: Recommended growth pack */}
              <div className="bg-white border-4 border-neutral-950 p-6 sm:p-8 rounded-none space-y-6 flex flex-col justify-between shadow-[8px_8px_0px_0px_rgba(16,185,129,1)] relative">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white font-mono text-[9px] uppercase font-black tracking-widest px-3 py-1 border-2 border-neutral-950">
                  RECOMMENDED & 20% DISCOUNT
                </div>

                <div className="space-y-4 pt-1">
                  <span className="text-[9px] font-mono text-emerald-700 font-extrabold uppercase tracking-wider block">Volume Sourcing</span>
                  <h4 className="font-display font-black text-xl text-neutral-950 uppercase leading-none">Agency Pack</h4>
                  
                  <div className="space-y-1">
                    <p className="text-4xl font-black font-display text-neutral-950 flex items-baseline gap-1.5">
                      $399
                      <span className="text-xs text-neutral-400 font-normal line-through">$495</span>
                    </p>
                    <p className="text-[9.5px] text-emerald-800 font-black font-mono uppercase">20% off standard billing slot rate</p>
                  </div>

                  <div className="border-t border-dashed border-[#a7f3d0] pt-4 space-y-2.5 text-[11px] text-neutral-600 font-black uppercase tracking-wider">
                    <p className="flex items-center gap-2 text-neutral-950"><CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Includes 5.0 active slots</p>
                    <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Unlock 10 full dossiers</p>
                    <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Dedicated matching coordinators</p>
                    <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Permanent pipeline caching</p>
                  </div>
                </div>

                <button
                  onClick={() => handlePurchaseSlots(5, 'Agency Professional')}
                  className="w-full bg-[#033c2a] hover:bg-emerald-950 text-white font-black py-4 px-4 rounded-none text-xs uppercase tracking-widest cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,0.15)]"
                >
                  ACQUIRE AGENCY PACK
                </button>
              </div>

              {/* Package 3: Enterprise custom sourcing */}
              <div className="bg-neutral-950 text-white p-6 sm:p-8 rounded-none space-y-6 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-neutral-950">
                <div className="space-y-4">
                  <span className="text-[9px] font-mono text-cyan-300 font-extrabold uppercase tracking-wider block">Custom Sourcing Volume</span>
                  <h4 className="font-display font-black text-xl text-white uppercase leading-none">Enterprise</h4>
                  
                  <div className="space-y-1">
                    <p className="text-2xl font-black font-display text-white uppercase">
                      Custom scale
                    </p>
                    <p className="text-[9.5px] uppercase font-bold text-neutral-400 font-mono font-black">Tailored parameter setups</p>
                  </div>

                  <div className="border-t border-dashed border-neutral-800 pt-4 space-y-2.5 text-[11px] text-neutral-400 font-bold uppercase tracking-wider">
                    <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" /> Unlimited candidate unlocks</p>
                    <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" /> Personal audit vetting streams</p>
                    <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" /> Guaranteed SLAs & fast replacements</p>
                  </div>
                </div>

                <a
                  href="mailto:hiring@dsptalenthub.com?subject=Enterprise%20Recruitment%20Custom%20Sourcing"
                  className="w-full bg-neutral-850 hover:bg-neutral-800 text-center font-black text-white py-3 px-4 rounded-none text-xs uppercase tracking-widest block block-button leading-none flex items-center justify-center h-[43px] cursor-pointer"
                >
                  TALK TO INTEL CORPS
                </a>
              </div>

            </div>
          </div>
        )}

        {/* Tier Panel 2: Digital Professionals (Talent) */}
        {activeTier === 'talent' && (
          <div className="max-w-xl mx-auto pt-4 text-left space-y-8">
            <div className="bg-white border-4 border-neutral-950 p-6 sm:p-10 rounded-none space-y-6 shadow-[8px_8px_0px_0px_rgba(16,185,129,0.7)] flex flex-col justify-between">
              
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-mono font-black bg-neutral-950 text-white border-2 border-neutral-950 px-3 py-1 rounded-none">
                    ONBOARDING ACCREDITATION PASS
                  </span>
                </div>
                
                <h4 className="font-display font-black text-2xl uppercase text-neutral-950 leading-tight">Verification Pass</h4>
                
                <div className="space-y-1">
                  <p className="text-4xl font-black font-display text-neutral-950">
                    $45
                  </p>
                  <p className="text-[10px] text-neutral-500 uppercase font-black font-mono">One-time entry pass fee. Fully refundable.</p>
                </div>

                {/* Plain, clear English of Gained value versus lost opportunity */}
                <div className="border-t border-neutral-200 pt-4 space-y-4 text-xs font-semibold uppercase tracking-wider text-neutral-700">
                  <div className="bg-neutral-50 p-3 border border-neutral-300 space-y-2">
                    <span className="text-[8.5px] font-mono font-black text-rose-700">⚠️ THE COST OF REMAINING INVISIBLE:</span>
                    <p className="text-[10px] leading-relaxed text-neutral-500 font-bold">
                      Applications on typical remote boards get buried instantly behind 2,000+ unverified resumes. By ignoring verification, you prolong your job hunt and lose out on remote global rates worth thousands of dollars monthly.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <p>Instant priority listing on recruiters' vetting directories.</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <p>Build persistent case-dossiers outlining your real tool execution metrics.</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <p>Retain 100% of your global pay package. No platform cuts.</p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigateToPage && navigateToPage('talent')}
                className="w-full bg-[#033c2a] hover:bg-neutral-950 text-white font-black py-4 px-4 rounded-none text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-colors duration-150 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              >
                <span>OBTAIN VALIDATION PASS</span>
                <ArrowRight className="w-4 h-4 text-emerald-400 animate-pulse" />
              </button>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
