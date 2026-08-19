import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  ShieldCheck,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

interface TalentQuizBannerProps {
  phase1Status?: 'pending' | 'passed' | 'cooldown' | string;
  phase2Unlocked?: boolean;
  nextRetryDate?: string | null;
  courseUrl?: string;
  score?: number | null;
  onStartAssessment?: () => void;
  onNavigateToPhase2?: () => void;
}

export const TalentQuizBanner: React.FC<TalentQuizBannerProps> = ({
  phase1Status = 'pending',
  phase2Unlocked = false,
  nextRetryDate = null,
  courseUrl = 'https://learnwithdsp.com/',
  score = null,
  onStartAssessment,
  onNavigateToPhase2,
}) => {
  // Calculate remaining cooldown time
  const [daysRemaining, setDaysRemaining] = useState<number>(0);
  const [hoursRemaining, setHoursRemaining] = useState<number>(0);
  const [isCooldownExpired, setIsCooldownExpired] = useState<boolean>(false);

  useEffect(() => {
    if (!nextRetryDate) {
      setIsCooldownExpired(true);
      return;
    }

    const calculateCooldown = () => {
      const targetTime = new Date(nextRetryDate).getTime();
      const currentTime = Date.now();
      const diffMs = targetTime - currentTime;

      if (diffMs <= 0) {
        setIsCooldownExpired(true);
        setDaysRemaining(0);
        setHoursRemaining(0);
      } else {
        setIsCooldownExpired(false);
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        setDaysRemaining(days);
        setHoursRemaining(hours);
      }
    };

    calculateCooldown();
    const timer = setInterval(calculateCooldown, 60000); // refresh every minute

    return () => clearInterval(timer);
  }, [nextRetryDate]);

  // =========================================================================
  // 1. PHASE 2 UNLOCKED STATE (`phase_2_unlocked === true` or `phase1Status === 'passed'`)
  // =========================================================================
  if (phase2Unlocked || phase1Status === 'passed') {
    return (
      <div 
        id="talent-quiz-banner-passed"
        className="w-full bg-linear-to-r from-emerald-900 via-slate-900 to-slate-900 border border-emerald-500/40 rounded-2xl p-6 sm:p-7 text-white shadow-sm relative overflow-hidden"
      >
        {/* Glow background accent */}
        <div className="absolute right-0 top-0 w-80 h-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-mono font-bold tracking-wide">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>PHASE 1 ACCREDITATION PASSED</span>
              {score !== null && score !== undefined && (
                <span className="ml-1 px-1.5 py-0.5 bg-emerald-500/30 rounded text-[10px]">
                  Score: {score}%
                </span>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Phase 2 Practical Case Studies Unlocked</span>
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            </h3>

            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Congratulations! You have passed the core skill evaluation and your Phase 2 verified case study module is now accessible. Showcase your live campaigns and client outcomes to top hiring employers.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            {onNavigateToPhase2 ? (
              <button
                onClick={onNavigateToPhase2}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 px-6 rounded-xl text-xs flex items-center gap-2 shadow-sm transition hover:scale-[1.02] cursor-pointer"
              >
                <span>Proceed to Phase 2 Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified Status Active</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. COOLDOWN ACTIVE STATE (`phase_1_status === 'cooldown'`)
  // =========================================================================
  if (phase1Status === 'cooldown' && !isCooldownExpired) {
    const formattedDate = nextRetryDate ? new Date(nextRetryDate).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) : 'in a few days';

    return (
      <div 
        id="talent-quiz-banner-cooldown"
        className="w-full bg-slate-900 border border-amber-500/40 rounded-2xl p-6 sm:p-7 text-white shadow-sm relative overflow-hidden"
      >
        {/* Subtle warning glow */}
        <div className="absolute right-0 top-0 w-72 h-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-mono font-bold tracking-wide">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>ASSESSMENT RETAKE COOLDOWN ACTIVE</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Cooldown in Progress — Retake Available on {formattedDate}</span>
            </h3>

            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Your previous quiz attempt did not reach the passing threshold. During this cooldown window ({daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} {hoursRemaining} {hoursRemaining === 1 ? 'hr' : 'hrs'} remaining), hone your digital strategy with our recommended curriculum before retaking the assessment.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <a
              href={courseUrl || 'https://learnwithdsp.com/'}
              target="_blank"
              rel="noreferrer"
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold py-3 px-5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition hover:scale-[1.02] cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Take Digital & Growth Marketing Refresher Course</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. COOLDOWN EXPIRED / READY TO RETAKE STATE
  // =========================================================================
  if (phase1Status === 'cooldown' && isCooldownExpired) {
    return (
      <div 
        id="talent-quiz-banner-retake-ready"
        className="w-full bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 sm:p-7 text-white shadow-sm relative overflow-hidden"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-mono font-bold tracking-wide">
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              <span>COOLDOWN COMPLETED • RETAKE ELIGIBLE</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Your Assessment Retake Window is Now Open
            </h3>

            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Your study cooldown has expired. You are fully eligible to retake the Phase 1 Digital Marketing Assessment and unlock your Phase 2 profile verification.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            {onStartAssessment && (
              <button
                onClick={onStartAssessment}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 px-6 rounded-xl text-xs flex items-center gap-2 shadow-sm transition hover:scale-[1.02] cursor-pointer"
              >
                <span>Start Assessment Retake</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. DEFAULT / PENDING ASSESSMENT STATE
  // =========================================================================
  return (
    <div 
      id="talent-quiz-banner-pending"
      className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 text-white shadow-sm relative overflow-hidden"
    >
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono font-bold tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>PHASE 1 SKILL VERIFICATION</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Complete Assessment to Unlock Verified Badge & Phase 2
          </h3>

          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Take the quick 10-minute digital marketing accreditation test to verify your core skills, gain priority placement in recruiter searches, and unlock Phase 2 case studies.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          {onStartAssessment && (
            <button
              onClick={onStartAssessment}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl text-xs flex items-center gap-2 shadow-sm transition hover:scale-[1.02] cursor-pointer"
            >
              <span>Begin Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TalentQuizBanner;
