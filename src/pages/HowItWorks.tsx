import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Terminal, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  Cpu, 
  Users, 
  Calendar, 
  Briefcase, 
  Percent, 
  RotateCcw, 
  Check, 
  X, 
  Zap, 
  ExternalLink,
  Layers,
  Award,
  ChevronRight,
  Code,
  FileCheck,
  TrendingUp,
  MessageSquare,
  ShieldAlert,
  ArrowUpRight,
  Headphones
} from 'lucide-react';

interface HowItWorksProps {
  onNavigateToDirectory?: () => void;
  onNavigateToPricing?: () => void;
  onOpenMatchmakingModal?: () => void;
}

export default function HowItWorks({
  onNavigateToDirectory,
  onNavigateToPricing,
  onOpenMatchmakingModal
}: HowItWorksProps) {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState<boolean>(false);
  const [consultationSubmitted, setConsultationSubmitted] = useState<boolean>(false);
  const [consultationForm, setConsultationForm] = useState({
    name: '',
    email: '',
    company: '',
    roleNeeded: 'Growth Marketing & UA Specialist',
    timeline: 'Within 48 Hours',
    notes: ''
  });

  const handleDirectoryClick = () => {
    if (onNavigateToDirectory) {
      onNavigateToDirectory();
    } else {
      window.history.pushState({}, '', '/talent-directory');
      window.dispatchEvent(new Event('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePricingClick = () => {
    if (onNavigateToPricing) {
      onNavigateToPricing();
    } else {
      window.history.pushState({}, '', '/pricing');
      window.dispatchEvent(new Event('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenConsultation = () => {
    if (onOpenMatchmakingModal) {
      onOpenMatchmakingModal();
    } else {
      setIsConsultationModalOpen(true);
    }
  };

  const handleConsultationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConsultationSubmitted(true);
  };

  const stepsData = [
    {
      step: 1,
      badge: 'STAGE 1: HARD SKILL PROVING GROUND',
      title: 'Automated & Technical Skill Audits',
      shortDesc: 'Candidates undergo live coding, marketing performance scenarios, and workflow audits before entering our pool.',
      icon: Terminal,
      color: 'from-emerald-500/20 to-teal-500/5',
      accentColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
      stats: 'Top 8.4% pass this stage',
      checklist: [
        'Automated live diagnostic coding sandbox & unit test validation',
        'Simulated $50k/mo ad spend performance gauntlet (ROAS, CAC, conversion loops)',
        'AI orchestration & LLM pipeline workflow validation (Make, Zapier, Python, LangChain)',
        'Strict 85%+ score requirement to advance to Stage 2'
      ],
      interactiveWidget: {
        title: 'Diagnostic Test Harness Telemetry',
        tag: 'LIVE BENCHMARK',
        metrics: [
          { label: 'Technical Accuracy', value: '98.4%', status: 'verified' },
          { label: 'Latency & Execution Speed', value: '1.2s', status: 'verified' },
          { label: 'Code Architecture Grade', value: 'Tier-A (Senior)', status: 'verified' },
          { label: 'Tool Mastery Index', value: '96 / 100', status: 'verified' }
        ],
        codeSnippet: `// Digital Campux Automated Audit Runner\nawait auditEngine.runGauntlet({\n  candidateTier: "Senior Growth Specialist",\n  tests: ["live_budget_allocation", "retargeting_funnel", "script_automation"],\n  passingScore: 0.85,\n  status: "ACCREDITED_TOP_3_PERCENT"\n});`
      }
    },
    {
      step: 2,
      badge: 'STAGE 2: BEHAVIORAL & ASYNC VETTING',
      title: 'Practical Vetting & Soft Skill Assessment',
      shortDesc: 'We evaluate async communication, problem-solving under tight deadlines, and remote collaboration tools.',
      icon: Cpu,
      color: 'from-cyan-500/20 to-blue-500/5',
      accentColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/30',
      stats: 'Top 4.2% pass this stage',
      checklist: [
        'Async video & documentation audits (Loom briefing, Notion PRDs, Linear tickets)',
        'Crisis simulation: live incident turnaround under a 60-minute time constraint',
        'English fluency, cross-timezone availability, and executive communication style',
        'Verified past portfolio deliverables & client reference back-channeling'
      ],
      interactiveWidget: {
        title: 'Async Communication Evaluation Matrix',
        tag: 'BEHAVIORAL SCORECARD',
        metrics: [
          { label: 'Communication Clarity', value: '99/100', status: 'verified' },
          { label: 'Deadline Adherence Under Pressure', value: '100%', status: 'verified' },
          { label: 'Stakeholder Empathy & Alignment', value: 'Exemplary', status: 'verified' },
          { label: 'Async Tool Fluent (Slack/Linear/Loom)', value: 'Native Master', status: 'verified' }
        ],
        codeSnippet: `[RUBRIC] Candidate ID #DC-9482\n→ Prompt: Sudden 40% Drop in Paid Conversion Under iOS Update\n→ Candidate Response: Diagnosed tracking gap within 22m, patched server-side CAPI event, submitted clean Loom explanation to CMO.\n→ Result: APPROVED FOR IMMEDIATE PLACEMENT`
      }
    },
    {
      step: 3,
      badge: 'STAGE 3: 48-HOUR TEAM INTEGRATION',
      title: 'Precision AI & Human Matchmaking',
      shortDesc: 'We match your exact project scope and stack requirements with specialists ready to deploy in under 48 hours.',
      icon: Users,
      color: 'from-indigo-500/20 to-purple-500/5',
      accentColor: 'text-indigo-400',
      borderColor: 'border-indigo-500/30',
      stats: 'Final Top 3% Certified',
      checklist: [
        'Vector-matched against your tech stack, marketing channels, and team timezone',
        'Dedicated Talent Partner reviews hand-selected top 2-3 candidate profiles',
        'Direct 1-click scheduling or immediate contract kick-off with zero red tape',
        'Day 1 onboarding ready: pre-briefed on your company deliverables and tools'
      ],
      interactiveWidget: {
        title: 'Precision Match Vector Engine',
        tag: '48H DEPLOYMENT READY',
        metrics: [
          { label: 'Scope Fit Index', value: '99.2%', status: 'verified' },
          { label: 'Time-to-First-Deploy', value: '< 48 Hours', status: 'verified' },
          { label: 'Culture & Timezone Overlap', value: '6+ Hours Synchronous', status: 'verified' },
          { label: 'Risk-Free Trial Period', value: '14 Days Included', status: 'verified' }
        ],
        codeSnippet: `// Deployment Dispatch Pipeline\nconst match = await matchmakingEngine.deployCandidate({\n  role: "AI Automation & Growth Architect",\n  stack: ["OpenAI", "Supabase", "Meta Ads", "Make.com"],\n  deploymentWindow: "48_HOURS",\n  guarantee: "14_DAY_NO_RISK_REPLACEMENT"\n});`
      }
    }
  ];

  return (
    <div className="bg-[#090D16] min-h-screen text-slate-100 selection:bg-emerald-500/30 selection:text-white">
      
      {/* Background ambient lighting effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-emerald-500/10 blur-[140px] rounded-full" />
        <div className="absolute top-[200px] left-1/4 w-[400px] h-[350px] bg-cyan-500/10 blur-[130px] rounded-full" />
        <div className="absolute top-[180px] right-1/4 w-[450px] h-[350px] bg-indigo-500/10 blur-[130px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 space-y-24">
        
        {/* ========================================================================= */}
        {/* HERO HEADER */}
        {/* ========================================================================= */}
        <section className="text-center max-w-4xl mx-auto space-y-6 pt-4 sm:pt-8">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-950/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-widest uppercase">
              STRICTLY AUDITED MATCHMAKING
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-display leading-[1.15]">
            How We Guarantee <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Top 3% Talent
            </span> For Your Team
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            From multi-stage technical gauntlets to instant 48-hour placement—here is how Digital Campux eliminates hiring risk.
          </p>

          {/* Key Value Stat Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-6 max-w-3xl mx-auto text-left">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 backdrop-blur-md">
              <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">3.0%</div>
              <div className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5">Strict Pass Rate</div>
            </div>
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 backdrop-blur-md">
              <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-400">&lt; 48h</div>
              <div className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5">Time to Deploy</div>
            </div>
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 backdrop-blur-md">
              <div className="text-xl sm:text-2xl font-bold font-mono text-indigo-400">0%</div>
              <div className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5">Recruiter Markup</div>
            </div>
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 backdrop-blur-md">
              <div className="text-xl sm:text-2xl font-bold font-mono text-teal-400">14 Days</div>
              <div className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5">Trial Guarantee</div>
            </div>
          </div>

          {/* Quick CTA Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={handleDirectoryClick}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all cursor-pointer"
            >
              <span>Explore Pre-Vetted Talent</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleOpenConsultation}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>Book Matchmaking Call</span>
              <Calendar className="w-4 h-4 text-emerald-400" />
            </button>
          </div>

        </section>

        {/* ========================================================================= */}
        {/* THE 3-STEP VERIFICATION GAUNTLET (INTERACTIVE STEP CARDS) */}
        {/* ========================================================================= */}
        <section className="space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4" />
              <span>THE 3-STEP VERIFICATION GAUNTLET</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-display">
              Engineered to Filter Out 97% of Applicants
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Click on each step below to inspect our automated benchmarks, live testing criteria, and quality scoring rubrics.
            </p>
          </div>

          {/* Step Selector Tabs (Interactive) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stepsData.map((stepItem) => {
              const isSelected = activeStep === stepItem.step;
              const IconComponent = stepItem.icon;

              return (
                <button
                  key={stepItem.step}
                  type="button"
                  onClick={() => setActiveStep(stepItem.step)}
                  className={`text-left p-5 sm:p-6 rounded-2xl border transition-all duration-200 cursor-pointer relative overflow-hidden group ${
                    isSelected
                      ? `bg-slate-900/90 ${stepItem.borderColor} shadow-xl shadow-black/40 ring-1 ring-emerald-500/20`
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  {/* Active highlight glow */}
                  {isSelected && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500" />
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-400 border border-slate-700/60">
                      Step 0{stepItem.step}
                    </span>
                    <span className={`text-xs font-mono font-semibold ${isSelected ? stepItem.accentColor : 'text-slate-500'}`}>
                      {stepItem.stats}
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      isSelected 
                        ? 'bg-slate-800 text-emerald-400 border-slate-700' 
                        : 'bg-slate-800/50 text-slate-400 border-slate-800 group-hover:text-slate-300'
                    }`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`font-display font-bold text-base sm:text-lg leading-snug ${
                        isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'
                      }`}>
                        {stepItem.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {stepItem.shortDesc}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Inspect Stage Details</span>
                    <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'rotate-90 text-emerald-400' : 'text-slate-600 group-hover:translate-x-0.5'}`} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Deep-Dive Interactive Showcase Panel */}
          {(() => {
            const current = stepsData.find(s => s.step === activeStep) || stepsData[0];
            const Icon = current.icon;

            return (
              <div className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
                
                {/* Background soft glow */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 blur-[100px] pointer-events-none rounded-full" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: Requirements & Explanation */}
                  <div className="lg:col-span-6 space-y-6 text-left">
                    <div className="space-y-2">
                      <span className="text-xs font-mono font-bold text-emerald-400 tracking-wider">
                        {current.badge}
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                        {current.title}
                      </h3>
                      <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                        {current.shortDesc}
                      </p>
                    </div>

                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                        Mandatory Audit Criteria
                      </h4>
                      <ul className="space-y-2.5">
                        {current.checklist.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-300">
                            <div className="w-5 h-5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-3 h-3" />
                            </div>
                            <span className="leading-snug">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <Award className="w-5 h-5 text-emerald-400" />
                        <div>
                          <span className="block font-bold text-white">Digital Campux Accreditation Standard</span>
                          <span className="block text-slate-400 text-[11px]">Enforced across all candidate tiers</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 font-mono font-bold text-[11px] border border-emerald-500/30">
                        Top 3% Target
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Interactive Audit Runner / Live Telemetry Screen */}
                  <div className="lg:col-span-6 space-y-4">
                    
                    {/* Simulated Console / Diagnostic Card */}
                    <div className="rounded-2xl border border-slate-800 bg-[#0B101B] overflow-hidden shadow-xl text-left font-mono">
                      
                      {/* Window Header */}
                      <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                          <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                          <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                          <span className="text-[11px] text-slate-400 font-sans font-semibold ml-2">
                            {current.interactiveWidget.title}
                          </span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/30">
                          {current.interactiveWidget.tag}
                        </span>
                      </div>

                      {/* Code and Evaluation Output */}
                      <div className="p-4 sm:p-5 space-y-4 text-xs">
                        <pre className="text-slate-300 text-[11px] sm:text-xs overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-emerald-300/90">
                          {current.interactiveWidget.codeSnippet}
                        </pre>

                        {/* Benchmark Metrics Grid */}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                          {current.interactiveWidget.metrics.map((metric, mIdx) => (
                            <div key={mIdx} className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                              <span className="text-[10px] text-slate-400 block uppercase">
                                {metric.label}
                              </span>
                              <div className="flex items-center justify-between mt-1">
                                <span className="font-bold text-sm text-white font-mono">
                                  {metric.value}
                                </span>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Step Navigation Button inside inspection */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => setActiveStep(activeStep === 1 ? 3 : activeStep - 1)}
                        className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 transition cursor-pointer"
                      >
                        ← Previous Step
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveStep(activeStep === 3 ? 1 : activeStep + 1)}
                        className="text-xs text-emerald-400 hover:text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-500/30 hover:border-emerald-500/60 transition cursor-pointer font-semibold"
                      >
                        Next: Stage 0{activeStep === 3 ? 1 : activeStep + 1} →
                      </button>
                    </div>

                  </div>

                </div>

              </div>
            );
          })()}

        </section>

        {/* ========================================================================= */}
        {/* RISK-FREE GUARANTEES & TRANSPARENCY SECTION */}
        {/* ========================================================================= */}
        <section className="space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              <Sparkles className="w-4 h-4" />
              <span>RADICAL HIRING TRANSPARENCY</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-display">
              Zero Risk. Zero Hidden Markups. Guaranteed Fit.
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Traditional staffing agencies hide 40% margin markups and lock you into 6-month commitments. We did the exact opposite.
            </p>
          </div>

          {/* 2-Column Feature Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            
            {/* Feature 1: 0% Markup Transparency */}
            <div className="p-7 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all duration-200 space-y-5 relative overflow-hidden group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg">
                <Percent className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    PAY DIRECT TO SPECIALISTS
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
                  0% Markup Transparency
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Traditional recruiting firms bill you $120/hr while paying the contractor only $60/hr. With Digital Campux, 100% of your talent rate goes straight to the specialist.
                </p>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-slate-800">
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Transparent flat platform software subscription—no commission cuts</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Higher specialist motivation &amp; 94% 1-year project retention rate</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Itemized invoices with no disguised operational markups</span>
                </div>
              </div>
            </div>

            {/* Feature 2: 48-Hour Placement Window */}
            <div className="p-7 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all duration-200 space-y-5 relative overflow-hidden group">
              <div className="w-12 h-12 rounded-2xl bg-cyan-950/70 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-lg">
                <Clock className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                    SKIP THE 6-WEEK SOURCING LOOP
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
                  48-Hour Placement Window
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Stop sifting through 200 unqualified resumes. Every talent in our pool is already audited, background checked, and ready to deploy into Slack, Linear, or GitHub in 48 hours.
                </p>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-slate-800">
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Immediate access to pre-cleared growth, AI, and development talent</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Instant 1-click scheduling or direct automated team dispatch</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Pre-briefed on remote culture, communication tools, and delivery speed</span>
                </div>
              </div>
            </div>

          </div>

          {/* Feature 3: Trial Period Replacement Guarantee (Wide Spotlight Card) */}
          <div className="p-7 sm:p-10 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/30 border border-slate-800 hover:border-emerald-500/40 transition-all text-left relative overflow-hidden">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold uppercase">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>14-DAY RISK-FREE COMMITMENT</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                  Trial Period Replacement Guarantee
                </h3>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                  Try your new specialist on live team tasks for up to two full weeks. If they are not an absolute 100% technical, operational, or cultural fit, we will either replace them with another accredited candidate within 48 hours or refund your placement.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="block text-[11px] font-mono text-slate-400 uppercase">Risk Exposure</span>
                    <span className="text-sm font-bold text-emerald-400">Zero Risk</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="block text-[11px] font-mono text-slate-400 uppercase">Replacement Speed</span>
                    <span className="text-sm font-bold text-cyan-400">Under 48h</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="block text-[11px] font-mono text-slate-400 uppercase">Contract Minimum</span>
                    <span className="text-sm font-bold text-indigo-400">No Lock-In</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h4 className="font-display font-bold text-base text-white">
                  Peace of Mind Hiring
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Join 180+ tech companies that scale engineering and growth without traditional recruiter headaches.
                </p>
                <button
                  type="button"
                  onClick={handleOpenConsultation}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition cursor-pointer"
                >
                  Schedule Initial Consultation
                </button>
              </div>

            </div>

          </div>

          {/* Comparison Matrix Table */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 text-center">
              How Digital Campux Compares
            </h4>
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-mono">
                    <th className="py-3.5 px-4 font-semibold">Evaluation Criteria</th>
                    <th className="py-3.5 px-4 font-bold text-emerald-400 bg-emerald-950/20">Digital Campux</th>
                    <th className="py-3.5 px-4 font-semibold">Traditional Staffing Agency</th>
                    <th className="py-3.5 px-4 font-semibold">Freelance Portals (Upwork/Fiverr)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr>
                    <td className="py-3 px-4 font-medium text-white">Vetting Rigor</td>
                    <td className="py-3 px-4 font-bold text-emerald-400 bg-emerald-950/10 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-400" />
                      Strict Top 3% Multi-Stage Gauntlet
                    </td>
                    <td className="py-3 px-4 text-slate-400">Basic resume screening</td>
                    <td className="py-3 px-4 text-slate-400">Zero vetting (unfiltered self-reporting)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-white">Recruiter Margins</td>
                    <td className="py-3 px-4 font-bold text-emerald-400 bg-emerald-950/10">0% Markups (100% to talent)</td>
                    <td className="py-3 px-4 text-rose-400">30% to 50% commission markup</td>
                    <td className="py-3 px-4 text-slate-400">10% - 20% platform cut on both sides</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-white">Time to Placement</td>
                    <td className="py-3 px-4 font-bold text-emerald-400 bg-emerald-950/10">Under 48 Hours</td>
                    <td className="py-3 px-4 text-slate-400">4 to 8 Weeks</td>
                    <td className="py-3 px-4 text-slate-400">Variable (sifting through spam bids)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium text-white">Replacement Guarantee</td>
                    <td className="py-3 px-4 font-bold text-emerald-400 bg-emerald-950/10">14-Day Free Replacement / Refund</td>
                    <td className="py-3 px-4 text-slate-400">30-day clause with complex paperwork</td>
                    <td className="py-3 px-4 text-rose-400">No guarantee after release of escrow</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </section>

        {/* ========================================================================= */}
        {/* HIGH-CONVERTING CALL-TO-ACTION (CTA) BANNER */}
        {/* ========================================================================= */}
        <section className="relative rounded-3xl overflow-hidden border border-emerald-500/40 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 p-8 sm:p-14 text-center shadow-2xl">
          
          {/* Glowing background accents */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 fill-emerald-400" />
              <span>READY TO DEPLOY THIS WEEK</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-display tracking-tight leading-tight">
              Ready to Hire Pre-Vetted <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Growth &amp; AI Talent?
              </span>
            </h2>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
              Skip the noisy resumes and slow hiring cycles. Review vetted profiles, verify candidate credentials, or let our matching team hand-pick your ideal specialist in under 48 hours.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                type="button"
                onClick={handleDirectoryClick}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all cursor-pointer"
                id="cta-browse-directory-btn"
              >
                <span>Browse Talent Directory</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleOpenConsultation}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition cursor-pointer"
                id="cta-book-matchmaking-btn"
              >
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Book Matchmaking Call</span>
              </button>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero Upfront Recruiting Fees</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>14-Day Free Replacement Guarantee</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Direct Slack &amp; GitHub Integration</span>
              </div>
            </div>

          </div>

        </section>

      </div>

      {/* ========================================================================= */}
      {/* INLINE MATCHMAKING CALL MODAL (FALLBACK / DIRECT POPUP) */}
      {/* ========================================================================= */}
      {isConsultationModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-[#0D131F] border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 text-left relative shadow-2xl">
            
            <button
              onClick={() => {
                setIsConsultationModalOpen(false);
                setConsultationSubmitted(false);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-white w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center transition cursor-pointer"
            >
              ✕
            </button>

            <div className="border-b border-slate-800 pb-4 space-y-1">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                <Calendar className="w-3 h-3" />
                <span>Direct Talent Matchmaking</span>
              </div>
              <h3 className="font-display font-bold text-xl sm:text-2xl text-white">
                Book a Matchmaking Call
              </h3>
              <p className="text-xs text-slate-400">
                Share your requirements. We will pair you with a senior talent coordinator and deliver 2-3 audited dossiers within 24 hours.
              </p>
            </div>

            {consultationSubmitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-display font-bold text-lg text-white">
                  Matchmaking Request Dispatched!
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                  Thank you, <strong>{consultationForm.name}</strong>. Our senior matchmaking coordinator is matching your criteria for <strong>{consultationForm.roleNeeded}</strong> and will follow up at <strong>{consultationForm.email}</strong> shortly.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsConsultationModalOpen(false);
                      setConsultationSubmitted(false);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer transition"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConsultationSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300 block">Your Name</label>
                    <input
                      type="text"
                      required
                      value={consultationForm.name}
                      onChange={(e) => setConsultationForm({ ...consultationForm, name: e.target.value })}
                      placeholder="e.g. Elena Rostova"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300 block">Work Email</label>
                    <input
                      type="email"
                      required
                      value={consultationForm.email}
                      onChange={(e) => setConsultationForm({ ...consultationForm, email: e.target.value })}
                      placeholder="alex@company.com"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300 block">Company Name</label>
                    <input
                      type="text"
                      required
                      value={consultationForm.company}
                      onChange={(e) => setConsultationForm({ ...consultationForm, company: e.target.value })}
                      placeholder="e.g. HyperScale AI"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 text-xs text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300 block">Placement Window</label>
                    <select
                      value={consultationForm.timeline}
                      onChange={(e) => setConsultationForm({ ...consultationForm, timeline: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 text-xs text-white cursor-pointer"
                    >
                      <option value="Within 48 Hours">Within 48 Hours (Immediate)</option>
                      <option value="1-2 Weeks">Within 1-2 Weeks</option>
                      <option value="Exploring Pipeline">Exploring Upcoming Pipeline</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300 block">Role Specialization Needed</label>
                  <select
                    value={consultationForm.roleNeeded}
                    onChange={(e) => setConsultationForm({ ...consultationForm, roleNeeded: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 text-xs text-white cursor-pointer"
                  >
                    <option value="Growth Marketing & UA Specialist">Growth Marketing &amp; UA Specialist</option>
                    <option value="AI Automation & Pipeline Engineer">AI Automation &amp; Pipeline Engineer</option>
                    <option value="Full-Stack Web & Next.js Developer">Full-Stack Web &amp; Next.js Developer</option>
                    <option value="Technical SEO & Content Architect">Technical SEO &amp; Content Architect</option>
                    <option value="PPC & Performance Paid Ads Lead">PPC &amp; Performance Paid Ads Lead</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300 block">Project Scope or Tech Stack (Optional)</label>
                  <textarea
                    rows={2}
                    value={consultationForm.notes}
                    onChange={(e) => setConsultationForm({ ...consultationForm, notes: e.target.value })}
                    placeholder="Briefly describe your stack, deliverables, or required tools..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 focus:outline-none focus:border-emerald-500 text-xs text-white resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Matchmaking Request</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
