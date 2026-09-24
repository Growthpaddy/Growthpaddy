import React from 'react';
import { 
  Users, 
  DollarSign, 
  Cpu, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  FileText, 
  Settings, 
  Award,
  Zap,
  TrendingUp,
  Layers
} from 'lucide-react';
import { FeaturedSpecialists } from './FeaturedSpecialists';
import { Hero } from './home/Hero';

interface HomeOverviewProps {
  navigateToPage: (
    page: 'home' | 'directory' | 'employer' | 'talent' | 'assessment' | 'pricing' | 'admin' | 'admin-login' | any,
    extraParams?: { package?: 'starter_tier' | 'annual_unlimited'; slug?: string }
  ) => void;
  openHireModal: () => void;
  openTalentModal: () => void;
}

export default function HomeOverview({ navigateToPage, openHireModal, openTalentModal }: HomeOverviewProps) {
  return (
    <div className="bg-white text-slate-900 text-left selection:bg-emerald-500/20 selection:text-emerald-900">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Exact two-column composition from reference image) */}
      {/* ========================================================================= */}
      <Hero 
        navigateToPage={navigateToPage} 
        openHireModal={openHireModal} 
        openTalentModal={openTalentModal}
        title="Unlock the World's Elite AI & Growth Talent"
        subtitle="We curate the top 5% of digital operators, AI workflow architects, and performance growth specialists. Cut your sourcing cycles by 80% with verified technical accreditation and direct hiring."
      />

      {/* ========================================================================= */}
      {/* 2. VALUE PROPOSITION SECTION: BUILT FOR HIGH-GROWTH TEAMS */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        
        {/* Section Header */}
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-emerald-600 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>Built for High-Growth Teams</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-[40px] text-slate-950 tracking-tight leading-tight">
            Why high-growth founders and hiring managers switch to Digital Campux
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            Eliminate traditional recruiting friction with verified technical accreditation and direct talent connections.
          </p>
        </div>

        {/* 4 Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: 80% Sourcing Acceleration */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-2xs hover:shadow-md transition-all duration-150 flex flex-col justify-between space-y-5">
            <div className="space-y-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-950 leading-snug">
                80% Sourcing Acceleration
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                Bypass traditional 6-week hiring delays. Get shortlisted engineers, analysts, and growth specialists in hours.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigateToPage('directory')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors pt-2 cursor-pointer w-fit"
            >
              <span>Learn how</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: 60% Sourcing Cost Savings */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-2xs hover:shadow-md transition-all duration-150 flex flex-col justify-between space-y-5">
            <div className="space-y-3.5">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-950 leading-snug">
                60% Sourcing Cost Savings
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                Eliminate recruitment agency margins and costly job ads. Direct access to vetted talent at optimal rates.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigateToPage('pricing')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors pt-2 cursor-pointer w-fit"
            >
              <span>See pricing</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: AI-Workflow Integration */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-2xs hover:shadow-md transition-all duration-150 flex flex-col justify-between space-y-5">
            <div className="space-y-3.5">
              <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-950 leading-snug">
                AI-Workflow Integration
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                Our talent is trained to leverage modern AI tools, automation platforms, and data workflows from day one.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigateToPage('directory')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors pt-2 cursor-pointer w-fit"
            >
              <span>Explore capabilities</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 4: Audited Proof of Work */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-2xs hover:shadow-md transition-all duration-150 flex flex-col justify-between space-y-5">
            <div className="space-y-3.5">
              <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-950 leading-snug">
                Audited Proof of Work
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed">
                Every candidate completes real-world scenario tests and technical audits. Access live portfolios and past results.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigateToPage('directory')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors pt-2 cursor-pointer w-fit"
            >
              <span>Learn more</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 3. LIVE CANDIDATE STREAM SECTION (Dark Navy with White Candidate Cards) */}
      {/* ========================================================================= */}
      <FeaturedSpecialists 
        onNavigateToDirectory={(slug?: string) => {
          if (slug) {
            navigateToPage('directory', { slug });
          } else {
            navigateToPage('directory');
          }
        }}
        onOpenTalentModal={openTalentModal}
      />

      {/* ========================================================================= */}
      {/* 4. VERIFICATION / ACCREDITATION ENGINE (3-Step Cards matching reference) */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 text-left" id="verification-engine">
        
        {/* Section Header with Right Link */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-emerald-600 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span>Structured Verification Engine</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-950 tracking-tight leading-tight">
              How candidates earn the Digital Campux accreditation stamp
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              A 3-step quality gateway that replaces traditional resume guesswork with verified execution data.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigateToPage('assessment')}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer self-start sm:self-auto shrink-0"
          >
            <span>Learn about our process</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Step Process Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Step 01 */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-7 sm:p-8 space-y-5 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-mono font-bold text-xs border border-emerald-100">
                01
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileText className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <h3 className="font-display font-bold text-lg text-slate-950">
              Diagnostic Skill Gateway
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Every applicant completes an intensive diagnostic assessment covering real-world tasks, tools, and domain fundamentals.
            </p>
          </div>

          {/* Step 02 */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-7 sm:p-8 space-y-5 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-mono font-bold text-xs border border-blue-100">
                02
              </span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Settings className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <h3 className="font-display font-bold text-lg text-slate-950">
              Practical Scenario Gauntlet
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Candidates build real project solutions: full-stack integrations, complex marketing pipelines, and automated workflows.
            </p>
          </div>

          {/* Step 03 */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-7 sm:p-8 space-y-5 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 font-mono font-bold text-xs border border-purple-100">
                03
              </span>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <h3 className="font-display font-bold text-lg text-slate-950">
              KYC & Direct Discovery
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Identity-verified specialists are added to the live directory with public portfolios and can be contacted directly by employers.
            </p>
          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 5. COMPARISON TABLE: DIGITAL CAMPUX VS TRADITIONAL ALTERNATIVES */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 text-left">
        
        {/* Section Header */}
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-emerald-600 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>Platform Comparison</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-950 tracking-tight leading-tight">
            Digital Campux vs. Traditional Alternatives
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            See why leading companies are moving away from legacy recruiting agencies and freelance marketplaces.
          </p>
        </div>

        {/* Table Container with Horizontal Scroll on Mobile */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                <th className="py-4.5 px-6 font-bold text-slate-700">Feature / Capability</th>
                <th className="py-4.5 px-6 text-emerald-800 bg-emerald-50/70 font-bold border-x border-emerald-100/70">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Digital Campux</span>
                  </div>
                </th>
                <th className="py-4.5 px-6 text-slate-600">Traditional Agencies</th>
                <th className="py-4.5 px-6 text-slate-600">Freelance Marketplaces</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-700">
              
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-4.5 px-6 font-medium text-slate-900">Time-to-Hire</td>
                <td className="py-4.5 px-6 bg-emerald-50/40 text-emerald-700 font-bold font-mono border-x border-emerald-100/70">
                  &lt; 48 Hours
                </td>
                <td className="py-4.5 px-6 text-slate-500">4 to 8 Weeks</td>
                <td className="py-4.5 px-6 text-slate-500">Days to Weeks (Variable)</td>
              </tr>

              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-4.5 px-6 font-medium text-slate-900">Vetting Process</td>
                <td className="py-4.5 px-6 bg-emerald-50/40 text-emerald-700 font-bold border-x border-emerald-100/70">
                  Audited Practical Scenarios
                </td>
                <td className="py-4.5 px-6 text-slate-500">Resume Screening (Unproven)</td>
                <td className="py-4.5 px-6 text-slate-500">Self-Reported / Review Spam</td>
              </tr>

              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-4.5 px-6 font-medium text-slate-900">Fee Structure</td>
                <td className="py-4.5 px-6 bg-emerald-50/40 text-emerald-700 font-bold font-mono border-x border-emerald-100/70">
                  0% Markup (Direct)
                </td>
                <td className="py-4.5 px-6 text-slate-500">15% - 25% Salary Cut</td>
                <td className="py-4.5 px-6 text-slate-500">10% - 20% Platform Fee</td>
              </tr>

              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-4.5 px-6 font-medium text-slate-900">Proof of Work</td>
                <td className="py-4.5 px-6 bg-emerald-50/40 text-emerald-700 font-bold border-x border-emerald-100/70">
                  Live Portfolio &amp; Code Artifacts
                </td>
                <td className="py-4.5 px-6 text-slate-500">Text Reference Only</td>
                <td className="py-4.5 px-6 text-slate-500">Subjective Star Ratings</td>
              </tr>

            </tbody>
          </table>
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 6. PRIMARY CTA BANNER: GUARANTEED SPEED & COST EFFICIENCY */}
      {/* ========================================================================= */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-[#0b1320] text-white rounded-3xl p-8 sm:p-14 border border-slate-800 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-8 text-left">
          
          {/* Left Text */}
          <div className="space-y-3.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Guaranteed Speed &amp; Cost Efficiency</span>
            </div>

            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight leading-tight">
              Accelerate Your Growth.<br />
              Cut Sourcing Costs. Zero Risk.
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Get matched with audited, AI-native growth talent today and start scaling immediately.
            </p>
          </div>

          {/* Right Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 shrink-0">
            <button
              type="button"
              onClick={() => navigateToPage('directory')}
              className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold py-3.5 px-6 rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow transition-all duration-150"
              id="cta-browse-available-talent-btn"
            >
              <span>Browse Available Talent →</span>
            </button>

            <button
              type="button"
              onClick={openTalentModal}
              className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold py-3.5 px-6 rounded-xl text-sm border border-slate-700/90 flex items-center justify-center gap-2 cursor-pointer transition-all duration-150"
              id="cta-apply-as-specialist-btn"
            >
              <span>Apply as a Specialist →</span>
            </button>
          </div>

        </div>
      </section>

    </div>
  );
}
