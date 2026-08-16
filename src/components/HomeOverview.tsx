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

interface HomeOverviewProps {
  navigateToPage: (page: 'home' | 'directory' | 'employer' | 'talent' | 'assessment' | 'pricing' | 'admin' | 'admin-login') => void;
  openHireModal: () => void;
  openTalentModal: () => void;
}

export default function HomeOverview({ navigateToPage, openHireModal, openTalentModal }: HomeOverviewProps) {
  return (
    <div className="bg-slate-50/60 text-slate-900 text-left selection:bg-emerald-500/20 selection:text-emerald-900">
      
      {/* ==========================================
          1. HERO SECTION (Modern SaaS Layout)
          ========================================== */}
      <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 bg-gradient-to-b from-white via-slate-50/50 to-slate-50 overflow-hidden">
        {/* Subtle decorative mesh background */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.04] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto space-y-8 relative z-10">
          
          {/* Live Status Pill */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2.5 bg-emerald-50/90 text-emerald-800 border border-emerald-200/80 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold shadow-xs max-w-full">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-[8.5px] min-[360px]:text-[9.5px] min-[420px]:text-[11px] sm:text-xs uppercase tracking-tight min-[380px]:tracking-wide font-bold whitespace-nowrap overflow-hidden text-ellipsis">
              ⚡ Speed-First Recruitment • Save up to 60% on Talent Sourcing
            </span>
          </div>

          {/* Main Headline & Subtitle */}
          <div className="max-w-4xl space-y-5">
            <h1 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-7xl text-slate-900 tracking-tight leading-[1.08]">
              Hire Top 1% Digital Talent in 48 Hours — <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">At 60% Less Cost.</span>
            </h1>
            
            <p className="text-base sm:text-xl text-slate-600 font-normal max-w-2xl leading-relaxed">
              Stop wasting weeks on unverified resumes. Digital Campux connects fast-growing teams with pre-vetted AI, Engineering, and Growth specialists backed by audited proof of work. Zero hiring risk. Guaranteed speed.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
            <button
              onClick={() => navigateToPage('directory')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 px-6 sm:px-8 rounded-xl text-sm flex items-center justify-center gap-2.5 cursor-pointer shadow-sm hover:shadow-md transition-all duration-150"
              id="hero-explore-talent-btn"
            >
              <Briefcase className="w-4 h-4 text-emerald-100" />
              <span>Hire Vetted Talent in 48 hrs →</span>
              <ArrowRight className="w-4 h-4 text-emerald-100" />
            </button>

            <button
              onClick={openTalentModal}
              className="bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-semibold py-3.5 px-6 sm:px-8 rounded-xl text-sm border border-slate-300/90 flex items-center justify-center gap-2.5 cursor-pointer shadow-xs hover:shadow-sm transition-all duration-150"
              id="hero-apply-talent-btn"
            >
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>Apply as a Specialist →</span>
            </button>
          </div>

          {/* Quick Metrics Strip */}
          <div className="pt-8 border-t border-slate-200/80">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-left">
                <span className="text-2xl font-extrabold font-mono text-emerald-600 block">&lt; 48 Hours</span>
                <span className="text-xs text-slate-500 font-medium block mt-1">Average Matching Time</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-left">
                <span className="text-2xl font-extrabold font-mono text-slate-900 block">Top 3%</span>
                <span className="text-xs text-slate-500 font-medium block mt-1">Acceptance Rate</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-left">
                <span className="text-2xl font-extrabold font-mono text-emerald-600 block">0% Markups</span>
                <span className="text-xs text-slate-500 font-medium block mt-1">Direct Salary Billing</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-left">
                <span className="text-2xl font-extrabold font-mono text-slate-900 block">100% Practical</span>
                <span className="text-xs text-slate-500 font-medium block mt-1">Audited Project Output</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ==========================================
          2. CORE VALUE PILLARS (Why Digital Campux)
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Pillar 1: 80% Faster Sourcing Cycles */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-7 sm:p-8 shadow-xs hover:shadow-md hover:border-emerald-500/40 transition-all duration-200 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900">
                80% Faster Sourcing Cycles
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Bypass weeks of manual resume screening. Our automated assessment pipelines deliver candidate shortlists in under 48 hours.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-mono font-semibold text-emerald-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Under 48h shortlists</span>
            </div>
          </div>

          {/* Pillar 2: Cut Hiring Costs by Up to 60% */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-7 sm:p-8 shadow-xs hover:shadow-md hover:border-emerald-500/40 transition-all duration-200 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900">
                Cut Hiring Costs by Up to 60%
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Eliminate expensive recruitment agency overheads while accessing top-tier digital specialists on flexible terms.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-mono font-semibold text-blue-700">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>0% recurring agency fees</span>
            </div>
          </div>

          {/* Pillar 3: Audited Proof of Work (Zero Mis-Hire Risk) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-7 sm:p-8 shadow-xs hover:shadow-md hover:border-emerald-500/40 transition-all duration-200 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900">
                Audited Proof of Work (Zero Mis-Hire Risk)
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Every candidate undergoes real-world scenario testing, technical panel audits, and portfolio checks before placement.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-mono font-semibold text-teal-700">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>Verified performance output</span>
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
            Accelerate Your Growth Without Overpaying for Talent
          </h2>

          <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto leading-relaxed">
            Get matched with audited specialists today and start shipping results immediately.
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
