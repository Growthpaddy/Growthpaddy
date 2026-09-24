import React from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Zap, 
  Users, 
  BarChart3, 
  Sparkles,
  CheckCircle2,
  Briefcase
} from 'lucide-react';
import heroTeamImage from '../../assets/images/hero_professionals_collaborating_1790269787354.jpg';

export interface HeroProps {
  navigateToPage?: (
    page: 'home' | 'directory' | 'employer' | 'talent' | 'assessment' | 'pricing' | 'admin' | 'admin-login' | any,
    extraParams?: { package?: 'starter_tier' | 'annual_unlimited'; slug?: string }
  ) => void;
  openHireModal?: () => void;
  openTalentModal?: () => void;
  title?: string;
  subtitle?: string;
}

export const Hero: React.FC<HeroProps> = ({
  navigateToPage,
  openHireModal,
  openTalentModal,
  title = "Unlock the World's Elite AI & Growth Talent",
  subtitle = "We curate the top 5% of digital operators, AI workflow architects, and performance growth specialists. Cut your sourcing cycles by 80% with verified technical accreditation and direct hiring."
}) => {
  const handlePrimaryClick = () => {
    if (navigateToPage) {
      navigateToPage('directory');
    } else if (openHireModal) {
      openHireModal();
    }
  };

  const handleSecondaryClick = () => {
    if (openTalentModal) {
      openTalentModal();
    } else if (navigateToPage) {
      navigateToPage('talent');
    }
  };

  return (
    <section className="bg-white text-slate-900 border-b border-slate-200/80 pt-10 sm:pt-14 pb-14 sm:pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* ========================================================================= */}
        {/* TOP ROW: TWO-COLUMN COMPOSITION (TEXT ON LEFT, VISUAL ON RIGHT) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* LEFT COLUMN: HERO CONTENT */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-7 text-left">
            
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200/90 px-3.5 py-1.5 rounded-full text-slate-700 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span className="font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-800">
                Speed-Driven Talent Network
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight text-slate-950 leading-[1.12]">
              Unlock the World's Elite AI & Growth Talent —{' '}
              <span className="text-emerald-600 inline-block font-extrabold">
                At 60% Less Cost.
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
              {subtitle}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <button
                type="button"
                onClick={handlePrimaryClick}
                className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold py-3.5 px-6 rounded-xl text-sm flex items-center justify-center gap-2.5 cursor-pointer shadow-sm hover:shadow transition-all duration-150 group"
                id="hero-deploy-talent-btn"
              >
                <span>Deploy Vetted Talent in 48 Hours →</span>
              </button>

              <button
                type="button"
                onClick={handleSecondaryClick}
                className="bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 hover:text-slate-950 font-semibold py-3.5 px-6 rounded-xl text-sm border border-slate-200/90 hover:border-slate-300 flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-all duration-150"
                id="hero-apply-specialist-btn"
              >
                <span>Apply as a Specialist →</span>
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN: PREMIUM VISUAL WITH FLOATING UI CARD */}
          <div className="lg:col-span-5 relative mt-4 lg:mt-0">
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/90 shadow-xl bg-slate-100">
              <img 
                src={heroTeamImage} 
                alt="Modern technology professionals collaborating"
                className="w-full h-[360px] sm:h-[440px] object-cover object-center"
                referrerPolicy="no-referrer"
              />

              {/* Floating UI Card Overlay matching reference image */}
              <div className="absolute top-4 right-4 sm:top-5 sm:right-5 bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xl max-w-[210px] text-left transition-transform hover:scale-[1.02]">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs mb-3">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-display font-extrabold text-slate-950 text-sm leading-tight">
                    Hire.
                  </h4>
                  <h4 className="font-display font-extrabold text-slate-950 text-sm leading-tight">
                    Scale.
                  </h4>
                  <h4 className="font-display font-extrabold text-slate-950 text-sm leading-tight">
                    Grow Faster.
                  </h4>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug mt-2">
                  Verified talent for the modern business.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* BOTTOM ROW: 4 HERO METRIC CARDS */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-12 sm:mt-16 pt-8 border-t border-slate-100">
          
          {/* Card 1: < 48 Hours */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-xs transition-shadow text-left flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-bold font-mono text-slate-950 block leading-tight">
                &lt; 48 Hours
              </span>
              <span className="text-xs text-slate-500 font-medium block mt-0.5">
                Average Matching Time
              </span>
            </div>
          </div>

          {/* Card 2: Top 3% */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-xs transition-shadow text-left flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-bold font-mono text-slate-950 block leading-tight">
                Top 3%
              </span>
              <span className="text-xs text-slate-500 font-medium block mt-0.5">
                Vetted Acceptance Rate
              </span>
            </div>
          </div>

          {/* Card 3: 0% Markups */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-xs transition-shadow text-left flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-bold font-mono text-slate-950 block leading-tight">
                0% Markups
              </span>
              <span className="text-xs text-slate-500 font-medium block mt-0.5">
                Direct Salary Billing
              </span>
            </div>
          </div>

          {/* Card 4: 100% Audited */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-xs transition-shadow text-left flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-bold font-mono text-slate-950 block leading-tight">
                100% Audited
              </span>
              <span className="text-xs text-slate-500 font-medium block mt-0.5">
                Verified Technical Output
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default Hero;
