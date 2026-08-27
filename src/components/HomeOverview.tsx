import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  Briefcase, 
  Award, 
  Users, 
  Lock, 
  ArrowUpRight, 
  UserCheck, 
  Clock, 
  DollarSign, 
  Check, 
  X, 
  ChevronRight,
  TrendingUp,
  Building2,
  FileText,
  Star,
  Layers,
  Code,
  Cpu,
  BarChart3,
  Search
} from 'lucide-react';
import { FeaturedSpecialists } from './FeaturedSpecialists';
import { Hero } from './home/Hero';

interface HomeOverviewProps {
  navigateToPage: (page: 'home' | 'directory' | 'employer' | 'talent' | 'assessment' | 'pricing' | 'admin' | 'admin-login') => void;
  openHireModal: () => void;
  openTalentModal: () => void;
}

export default function HomeOverview({ navigateToPage, openHireModal, openTalentModal }: HomeOverviewProps) {
  return (
    <div className="bg-slate-50/60 text-slate-900 text-left selection:bg-emerald-500/20 selection:text-emerald-900">
      
      {/* ==========================================
          1. HERO SECTION (Interactive Grid & High-End Dark Theme)
          ========================================== */}
      <Hero 
        navigateToPage={navigateToPage} 
        openHireModal={openHireModal} 
        openTalentModal={openTalentModal}
        title="Unlock the World's Elite AI & Growth Talent"
        subtitle="We curate the top 5% of digital operators, AI workflow architects, and performance growth specialists. Cut your sourcing cycles by 80% with verified technical accreditation and direct hiring."
      />

      {/* ==========================================
          2. CORE VALUE PILLARS & FEATURE GRID (4-Card Execution Theme)
          ========================================== */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-emerald-700 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Built for High-Velocity Teams</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Why high-growth founders and hiring managers switch to Digital Campux
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Eliminate traditional recruiting friction with verified technical accreditation and direct talent connections.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: 80% Sourcing Acceleration */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-emerald-500/40 transition-all duration-200 flex flex-col justify-between space-y-5">
            <div className="space-y-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900 leading-snug">
                80% Sourcing Acceleration
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bypass traditional 6-week hiring delays. Our automated diagnostic pipelines deliver curated shortlists of high-performing growth talent within 48 hours.
              </p>
            </div>
            <div className="pt-3.5 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-mono font-semibold text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Under 48h shortlists</span>
            </div>
          </div>

          {/* Card 2: 60% Sourcing Cost Savings */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-emerald-500/40 transition-all duration-200 flex flex-col justify-between space-y-5">
            <div className="space-y-3.5">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900 leading-snug">
                60% Sourcing Cost Savings
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Eliminate massive recruitment agency markups and costly mis-hires with transparent, direct access to audited remote digital operators.
              </p>
            </div>
            <div className="pt-3.5 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-mono font-semibold text-blue-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>0% recurring markups</span>
            </div>
          </div>

          {/* Card 3: AI-Workflow Integration */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-emerald-500/40 transition-all duration-200 flex flex-col justify-between space-y-5">
            <div className="space-y-3.5">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900 leading-snug">
                AI-Workflow Integration
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our growth specialists leverage modern AI automation, predictive tools, and automated workflows to deliver 3x faster campaign execution and operational throughput.
              </p>
            </div>
            <div className="pt-3.5 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-mono font-semibold text-indigo-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>3x campaign execution</span>
            </div>
          </div>

          {/* Card 4: Audited Proof of Work */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-emerald-500/40 transition-all duration-200 flex flex-col justify-between space-y-5">
            <div className="space-y-3.5">
              <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900 leading-snug">
                Audited Proof of Work
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every candidate completes real-world scenario tests and technical panel audits before earning their Digital Campux Verified badge—ensuring zero mis-hire risk.
              </p>
            </div>
            <div className="pt-3.5 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-mono font-semibold text-teal-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>Zero mis-hire risk</span>
            </div>
          </div>

        </div>
      </section>

      {/* ==========================================
          3. FEATURED PRE-VETTED SPECIALISTS
          ========================================== */}
      <FeaturedSpecialists 
        onNavigateToDirectory={() => navigateToPage('directory')}
        onOpenTalentModal={openTalentModal}
      />

      {/* ==========================================
          4. 3-STEP ACCREDITATION WORKFLOW
          ========================================== */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 text-left">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-emerald-700 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>Structured Verification Engine</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight">
            How candidates earn the Digital Campux accreditation stamp
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            A 3-step quality gateway that replaces traditional resume guesswork with verified execution data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Step 1 */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-7 sm:p-8 space-y-4 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-mono font-bold text-xs flex items-center justify-center">
              01
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900">
              Diagnostic Skill Gateway
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every applicant completes an intensive diagnostic assessing core algorithmic, architectural, and growth fundamentals under strict anti-cheat conditions.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-7 sm:p-8 space-y-4 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-mono font-bold text-xs flex items-center justify-center">
              02
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900">
              Practical Scenario Gauntlet
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Candidates build real-world systems: full-stack integrations, complex marketing pipelines, and automated agent workflows audited for code quality and execution.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-7 sm:p-8 space-y-4 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-mono font-bold text-xs flex items-center justify-center">
              03
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900">
              KYC & Direct Discovery
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Identity-verified specialists are published to the live directory with public portfolios and instant direct connection for employers.
            </p>
          </div>

        </div>
      </section>

      {/* ==========================================
          5. COMPARISON MATRIX (SaaS Table)
          ========================================== */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 text-left">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-emerald-700 uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Platform Comparison</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Digital Campux vs. Traditional Alternatives
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            See why leading companies are moving away from legacy recruiting agencies and freelance marketplaces.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500">
                <th className="py-4 px-6">Feature / Capability</th>
                <th className="py-4 px-6 text-emerald-800 bg-emerald-50/70 font-bold">
                  ⚡ Digital Campux
                </th>
                <th className="py-4 px-6">Traditional Agencies</th>
                <th className="py-4 px-6">Freelance Marketplaces</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-4 px-6 font-semibold text-slate-900">Time-to-Hire</td>
                <td className="py-4 px-6 bg-emerald-50/40 text-emerald-700 font-bold font-mono">
                  &lt; 48 Hours
                </td>
                <td className="py-4 px-6 text-slate-500">4 to 8 Weeks</td>
                <td className="py-4 px-6 text-slate-500">Days to Weeks (Variable)</td>
              </tr>

              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-4 px-6 font-semibold text-slate-900">Vetting Process</td>
                <td className="py-4 px-6 bg-emerald-50/40 text-emerald-700 font-bold">
                  Audited Practical Scenarios
                </td>
                <td className="py-4 px-6 text-slate-500">Resume Screening (Unproven)</td>
                <td className="py-4 px-6 text-slate-500">Self-Reported / Review Spam</td>
              </tr>

              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-4 px-6 font-semibold text-slate-900">Fee Structure</td>
                <td className="py-4 px-6 bg-emerald-50/40 text-emerald-700 font-bold font-mono">
                  0% Ongoing Commission
                </td>
                <td className="py-4 px-6 text-slate-500">15%–25% Salary Cut</td>
                <td className="py-4 px-6 text-slate-500">10%–20% Platform Fee</td>
              </tr>

              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-4 px-6 font-semibold text-slate-900">Proof of Work</td>
                <td className="py-4 px-6 bg-emerald-50/40 text-emerald-700 font-bold">
                  Live Portfolio & Code Artifacts
                </td>
                <td className="py-4 px-6 text-slate-500">Text Resumes Only</td>
                <td className="py-4 px-6 text-slate-500">Subjective Star Ratings</td>
              </tr>

            </tbody>
          </table>
        </div>
      </section>

      {/* ==========================================
          6. CONVERSION CTA BANNER (High-End SaaS Style)
          ========================================== */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-8 sm:p-14 shadow-xl border border-slate-800 space-y-6 relative overflow-hidden">
          
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>Guaranteed Speed & Cost Efficiency</span>
          </div>

          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white max-w-2xl mx-auto tracking-tight">
            Accelerate Your Growth. Cut Sourcing Costs. Zero Risk.
          </h2>

          <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto leading-relaxed">
            Get matched with audited AI-native growth talent today and start scaling immediately.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <button
              onClick={() => navigateToPage('directory')}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3.5 px-7 rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md transition"
            >
              <span>Browse Available Talent →</span>
            </button>

            <button
              onClick={openTalentModal}
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold py-3.5 px-7 rounded-xl text-sm border border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <span>Apply as a Specialist →</span>
            </button>
          </div>

        </div>
      </section>

    </div>
  );
}
