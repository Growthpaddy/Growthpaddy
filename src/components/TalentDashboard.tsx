import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck,
  CheckCircle2, 
  ArrowRight,
  CreditCard,
  Zap,
  Check,
  TrendingUp,
  AlertTriangle,
  Award
} from 'lucide-react';

interface TalentDashboardProps {
  isTalentPaid?: boolean;
  setIsTalentPaid?: React.Dispatch<React.SetStateAction<boolean>>;
  navigateToPage?: (page: 'home' | 'directory' | 'employer' | 'talent' | 'assessment' | 'pricing') => void;
}

export default function TalentDashboard({ 
  isTalentPaid = false, 
  setIsTalentPaid,
  navigateToPage 
}: TalentDashboardProps) {
  
  const [activeChecklist] = useState([
    { id: '1', task: 'Register basic details and competencies', done: true, key: 'register' },
    { id: '2', task: 'Choose digital specialization filter', done: true, key: 'specialty' },
    { id: '3', task: 'Take adaptive practice validation exam', done: false, key: 'assessment' },
    { id: '4', task: 'Gain Professional Verification fee pass', done: isTalentPaid, key: 'status' },
    { id: '5', task: 'Construct certified project evidence cases', done: isTalentPaid, key: 'case-studies' }
  ]);

  const [paymentForm, setPaymentForm] = useState({ cardNo: '', expDate: '', cvv: '', nameOnCard: '' });
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handlePayOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentForm.cardNo || !paymentForm.expDate || !paymentForm.cvv) return;
    setSubmittingPayment(true);
    
    // Simulate payment sequence
    setTimeout(() => {
      setSubmittingPayment(false);
      setPaymentSuccess(true);
      if (setIsTalentPaid) {
        setIsTalentPaid(true);
      }
    }, 2000);
  };

  // Compute profile progress score %
  const completedTasksCount = activeChecklist.filter(item => {
    if (item.key === 'status' || item.key === 'case-studies') {
      return isTalentPaid;
    }
    return item.done;
  }).length;
  const progressPercent = Math.round((completedTasksCount / activeChecklist.length) * 100);

  return (
    <div className="space-y-10 py-10 px-4 sm:px-6 lg:px-8 bg-neutral-50/50">
      
      {/* 1. Header Profile Panel */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 bg-white p-6 sm:p-8 border-4 border-neutral-950 rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-left">
        <div className="space-y-2 max-w-xl">
          <span className="text-[10px] uppercase font-mono font-black tracking-widest text-[#047857] bg-emerald-50 px-2.5 py-0.5 border border-emerald-950 inline-block">
            VERIFIED OPERATOR CONSOLE
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-neutral-950 uppercase tracking-tight leading-none pt-1">
            TALENT SPACE
          </h1>
          <p className="text-xs font-bold text-neutral-600 uppercase tracking-wider leading-relaxed">
            Verify real operational competence, configure searchable project dossier records, and pass adaptive sandbox parameters.
          </p>
        </div>

        {/* Profile Strength visualizer */}
        <div className="bg-neutral-950 text-white p-4 rounded-none border-2 border-neutral-950 text-left min-w-[280px] flex-shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono text-neutral-400 uppercase font-black tracking-widest block">VERIFICATION RATE</span>
            <span className="text-xs font-black text-emerald-400 font-mono">{progressPercent}%</span>
          </div>
          <div className="w-full bg-neutral-850 h-2 border border-neutral-950 rounded-none overflow-hidden">
            <div className="bg-[#10b981] h-full rounded-none" style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-1">
            Get verified to flag status: <span className="text-emerald-450 font-black font-mono">HIRING READY</span>
          </p>
        </div>
      </div>

      {/* Main layout block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Columns (Checklists, milestones) (Width: 6) */}
        <div className="lg:col-span-6 space-y-6 text-left animate-fadeIn">
          
          {/* Milestone List Card */}
          <div className="bg-white border-4 border-neutral-950 p-6 md:p-8 rounded-none space-y-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="font-display font-black text-lg text-neutral-950 uppercase tracking-tight">VERIFICATION MILESTONES</h3>
            <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Pass system tasks to list your verification badges securely:</p>
            
            <div className="space-y-3.5 pt-2">
              {activeChecklist.map((item) => {
                const isItemDone = (item.key === 'status' || item.key === 'case-studies') ? isTalentPaid : item.done;
                return (
                  <div key={item.id} className="flex items-start gap-4 p-4 rounded-none border-2 border-neutral-950 bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <div className={`w-6 h-6 rounded-none flex items-center justify-center flex-shrink-0 border-2 border-neutral-950 font-mono font-black text-[#111] text-xs
                      ${isItemDone ? 'bg-[#10b981] text-black' : 'bg-white'}`}
                    >
                      {isItemDone ? <Check className="w-4 h-4 text-black stroke-[3]" /> : <span className="text-[10.5px] leading-none">{item.id}</span>}
                    </div>
                    <div>
                      <h4 className={`text-xs uppercase tracking-wider font-extrabold ${isItemDone ? 'text-neutral-400 line-through' : 'text-neutral-950'}`}>
                        {item.task}
                      </h4>
                      {item.key === 'assessment' && !isItemDone && (
                        <button
                          onClick={() => navigateToPage && navigateToPage('assessment')}
                          className="mt-2 text-[10px] font-black uppercase tracking-widest text-[#047857] hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
                        >
                          <span>Attempt Adaptive Assessment</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Impressions stats panel */}
          <div className="bg-white border-4 border-neutral-950 p-6 md:p-8 rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <h3 className="font-display font-black text-base text-neutral-950 uppercase tracking-tight">IMPRESSIONS LOG</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-neutral-50 p-4 border-2 border-neutral-950 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-[8px] font-mono text-neutral-400 uppercase tracking-widest block font-black">RECRUITER VIEWS</span>
                <p className="text-2xl font-black text-neutral-950 font-mono mt-1">112</p>
                <span className="text-[9px] text-[#047857] font-black uppercase tracking-wider block mt-1">↑ 12% WEEKLY</span>
              </div>
              <div className="bg-neutral-50 p-4 border-2 border-neutral-950 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-[8px] font-mono text-neutral-400 uppercase tracking-widest block font-black">QUERY PASSES</span>
                <p className="text-2xl font-black text-neutral-950 font-mono mt-1">45</p>
                <span className="text-[9px] text-[#047857] font-black uppercase tracking-wider block mt-1">ACTIVE SEARCH</span>
              </div>
              <div className="bg-neutral-50 p-4 border-2 border-neutral-950 rounded-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-[8px] font-mono text-neutral-400 uppercase tracking-widest block font-black">PROFILE UNLOCKS</span>
                <p className="text-2xl font-black text-neutral-950 font-mono mt-1">{isTalentPaid ? '2' : '0'}</p>
                <span className="text-[9px] text-neutral-500 font-black uppercase tracking-wider block mt-1">DIRECT SHARES</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (High Impact Value comparison & checkout) (Width: 6) */}
        <div className="lg:col-span-6 text-left animate-fadeIn">
          
          <AnimatePresence mode="wait">
            {isTalentPaid ? (
              <motion.div
                key="paid"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-50 border-4 border-neutral-950 rounded-none p-6 sm:p-8 space-y-5 text-neutral-900 shadow-[6px_6px_0px_0px_rgba(16,185,129,1)]"
              >
                <div className="w-12 h-12 rounded-none bg-neutral-950 border-2 border-neutral-950 flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <ShieldCheck className="w-6 h-6 text-[#10b981]" />
                </div>
                <h3 className="font-display font-black text-xl text-neutral-950 uppercase tracking-tight pt-1">BADGE PERMISSIONS ACTIVE</h3>
                <p className="text-xs font-bold uppercase tracking-wider leading-relaxed text-neutral-600">
                  Onboarding verification fees have been successfully authorized. Your portfolio has been highlighted inside our employer sourcing console.
                </p>

                <div className="bg-white p-4 border-2 border-neutral-950 rounded-none text-xs space-y-3 font-semibold uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                    <span className="font-bold text-neutral-900">Portfolio Builder Enabled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                    <span className="font-bold text-neutral-900">Direct Recruiter Matching Turned On</span>
                  </div>
                  <p className="text-[9px] text-neutral-400 font-mono mt-1 font-bold">STATUS REFERENCE: CORE_INTEGRATION_LIVE</p>
                </div>

                <button
                  onClick={() => navigateToPage && navigateToPage('directory')}
                  className="w-full bg-neutral-950 hover:bg-neutral-900 text-white font-black py-4 px-4 rounded-none text-xs uppercase tracking-widest border border-neutral-950 shadow-[2px_2px_0px_0px_rgba(16,185,129,1)] cursor-pointer"
                >
                  AUDIT DIRECTORY LISTING
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="unpaid"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                
                {/* 1. SELLING VALUE FIRST COMPARISON BOX */}
                <div className="bg-neutral-950 text-white border-4 border-neutral-950 rounded-none p-6 sm:p-8 space-y-6 shadow-[6px_6px_0px_0px_rgba(16,185,129,1)]">
                  
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-mono font-black text-emerald-400 tracking-wider block">
                      WHY VERIFY? VALUE VS LOSS MATRIX
                    </span>
                    <h3 className="font-display font-black text-xl uppercase tracking-tight text-white leading-none pt-1">
                      CHOOSE VISIBILITY OVER INVISIBILITY.
                    </h3>
                    <p className="text-[11px] uppercase font-bold text-neutral-400 leading-normal">
                      A one-time verification investment locks in globally competitive remote placements. Avoid the traditional application rat race.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    
                    {/* The Losses Box */}
                    <div className="bg-neutral-905 border border-rose-900/50 p-4 space-y-3.5">
                      <span className="text-[9px] font-mono text-rose-500 font-extrabold uppercase tracking-wide flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        WHAT YOU LOSE UNVERIFIED:
                      </span>
                      <div className="space-y-2 text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                        <p className="leading-snug">
                          💔 <strong className="text-white">Resume Graveyard: </strong> Applications get trapped in automated ATS filters on generic job boards.
                        </p>
                        <p className="leading-snug">
                          💔 <strong className="text-white">Local Salary Pressure: </strong> Missing direct exposure to high-budget international startup contracts.
                        </p>
                      </div>
                    </div>

                    {/* The Gains Box */}
                    <div className="bg-neutral-905 border border-emerald-950 p-4 space-y-3.5">
                      <span className="text-[9px] font-mono text-emerald-400 font-extrabold uppercase tracking-wide flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5" />
                        WHAT YOU GAIN VERIFIED:
                      </span>
                      <div className="space-y-2 text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                        <p className="leading-snug">
                          🌟 <strong className="text-white">100% Direct Rates: </strong> Skip recruiters taking 30% cuts. Hire direct and retain 100% of your remote package.
                        </p>
                        <p className="leading-snug">
                          🌟 <strong className="text-white">Premium Spotlights: </strong> Verified scores highlight you permanently on recruiters' sourcing filters.
                        </p>
                      </div>
                    </div>

                  </div>

                </div>

                {/* 2. Simplified Payment Form Box */}
                <div className="bg-white border-4 border-neutral-950 p-6 sm:p-8 rounded-none space-y-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-emerald-800 uppercase tracking-widest block font-black">SECURE STRIPE CHECKOUT</span>
                      <h4 className="font-display font-black text-sm text-neutral-950 uppercase tracking-tight">VERIFICATION PASS ACCREDITATION</h4>
                    </div>
                    <span className="text-xl font-black font-display text-neutral-950">$45 <span className="text-[10px] uppercase text-neutral-400 font-bold tracking-wider font-mono">One-time</span></span>
                  </div>

                  {paymentSuccess ? (
                    <div className="p-4 text-center bg-emerald-50 border border-emerald-300 rounded-none text-xs space-y-3 font-bold uppercase tracking-wider">
                      <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                      <p className="font-black text-emerald-950">TRANSACTION COMPLETED SUCCESSFULLY</p>
                      <p className="text-[10px] text-neutral-500">Activating directory placement parameters. Ready...</p>
                    </div>
                  ) : (
                    <form onSubmit={handlePayOnboarding} className="space-y-4 text-xs font-mono">
                      
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-neutral-500 font-black block">Credit Card Number</label>
                        <input
                          type="text"
                          required
                          maxLength={19}
                          placeholder="4242 4242 4242 4242"
                          value={paymentForm.cardNo}
                          onChange={(e) => setPaymentForm({ ...paymentForm, cardNo: e.target.value })}
                          className="w-full bg-neutral-50 border-2 border-neutral-950 rounded-none py-2.5 px-4 text-neutral-950 placeholder:text-neutral-400 text-xs focus:outline-none focus:bg-white uppercase font-bold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase tracking-wider text-neutral-500 font-black block">Expiration Date</label>
                          <input
                            type="text"
                            required
                            placeholder="MM/YY"
                            maxLength={5}
                            value={paymentForm.expDate}
                            onChange={(e) => setPaymentForm({ ...paymentForm, expDate: e.target.value })}
                            className="w-full bg-neutral-50 border-2 border-neutral-950 rounded-none py-2.5 px-4 text-neutral-950 placeholder:text-neutral-400 text-xs focus:outline-none focus:bg-white uppercase font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase tracking-wider text-neutral-500 font-black block">CVC Security</label>
                          <input
                            type="password"
                            required
                            maxLength={3}
                            placeholder="•••"
                            value={paymentForm.cvv}
                            onChange={(e) => setPaymentForm({ ...paymentForm, cvv: e.target.value })}
                            className="w-full bg-neutral-50 border-2 border-neutral-950 rounded-none py-2.5 px-4 text-neutral-950 placeholder:text-neutral-400 text-xs focus:outline-none focus:bg-white font-bold"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase tracking-wider text-neutral-500 font-black block">Full Name on Card</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. John Doe"
                          value={paymentForm.nameOnCard}
                          onChange={(e) => setPaymentForm({ ...paymentForm, nameOnCard: e.target.value })}
                          className="w-full bg-neutral-50 border-2 border-neutral-950 rounded-none py-2.5 px-4 text-neutral-950 placeholder:text-neutral-400 text-xs focus:outline-none focus:bg-white uppercase font-bold"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submittingPayment}
                        className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black py-4 px-4 rounded-none text-xs uppercase cursor-pointer transition flex items-center justify-center gap-1.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
                      >
                        {submittingPayment ? (
                          <span>Verifying Credentials...</span>
                        ) : (
                          <>
                            <span>OBTAIN PROFESSIONAL VERIFICATION ($45)</span>
                            <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                          </>
                        )}
                      </button>

                      <p className="text-[9px] text-center text-neutral-400 leading-normal font-sans pt-1 font-bold uppercase tracking-wider">
                        🛡️ PCI-DSS Compliant Secure Ledger. Fully Refundable Core.
                      </p>

                    </form>
                  )}
                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>

    </div>
  );
}
