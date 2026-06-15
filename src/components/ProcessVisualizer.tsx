import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  BrainCircuit, 
  ShieldCheck, 
  Briefcase, 
  Award, 
  ArrowRight,
  TrendingUp,
  UserCheck,
  CheckCircle2,
  FileCheck,
  Building
} from 'lucide-react';
import { StepInfo } from '../types';

// Hero Pathway Stages
const PILAR_STAGES = [
  {
    id: 'training',
    label: 'Training',
    icon: BookOpen,
    color: 'emerald',
    description: 'Practical Skill Building',
    detailedInfo: 'Candidates undergo structured, intensive bootcamps focused on SEO, Paid Ads, Social Media, Lifecycle Email, and AI Automation workflows.'
  },
  {
    id: 'assessment',
    label: 'Assessment',
    icon: BrainCircuit,
    color: 'emerald',
    description: 'AI & Peer Scored Tests',
    detailedInfo: 'Strict practical exams test theoretical expertise and technical operational capability. Candidates are graded on clean execution and efficiency.'
  },
  {
    id: 'verification',
    label: 'Verification',
    icon: ShieldCheck,
    color: 'emerald',
    description: 'Identity & Score Audited',
    detailedInfo: 'We perform robust identity verification (KYC), verify credential source legitimacy, and audit exam logs to append the official DSP Talent Hub stamp.'
  },
  {
    id: 'internship',
    label: 'Internship',
    icon: Briefcase,
    color: 'emerald',
    description: 'Supervised Placement',
    detailedInfo: 'Verified candidates participate in structured 12-week placements with growth companies, building real metrics and verified project logs.'
  },
  {
    id: 'employment',
    label: 'Employment',
    icon: Award,
    color: 'emerald',
    description: 'Full Career Placement',
    detailedInfo: 'Armed with a living portfolio of verified work and direct client testimonials, talent seamlessly transitions to permanent direct hires.'
  }
];

export function HeroInteractivePipeline() {
  const [activeStageIdx, setActiveStageIdx] = useState(2); // Start with 'Verification' highlighted

  // Auto rotate stage highlight every few seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStageIdx((prev) => (prev + 1) % PILAR_STAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-white border border-neutral-200/90 rounded-3xl p-6 md:p-8 shadow-sm">
      {/* Visual Pipeline Bar */}
      <div className="relative flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 pb-8">
        
        {/* Connector Line */}
        <div className="absolute left-[30px] md:left-0 top-[20px] md:top-1/2 bottom-12 md:bottom-auto w-[2px] md:w-full h-full md:h-[2px] bg-neutral-100 -translate-y-1 md:-translate-y-1/2 z-0 hidden md:block" />
        
        {/* Filled/Active line progress */}
        <div 
          className="absolute left-0 top-[20px] md:top-1/2 w-[2px] md:w-full h-full md:h-[2px] bg-emerald-500/30 -translate-y-1/2 transition-all duration-700 ease-out z-0 hidden md:block"
          style={{
            clipPath: `polygon(0 0, ${(activeStageIdx + 1) * 20}% 0, ${(activeStageIdx + 1) * 20}% 100%, 0 100%)`
          }}
        />

        {PILAR_STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isPassed = idx < activeStageIdx;
          const isActive = idx === activeStageIdx;
          
          return (
            <button
              key={stage.id}
              onClick={() => setActiveStageIdx(idx)}
              className="relative z-10 flex md:flex-col items-center gap-4 md:gap-3 text-left md:text-center group focus:outline-none w-full md:w-auto cursor-pointer"
            >
              {/* Node Icon Circle */}
              <div 
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  isActive 
                    ? 'bg-neutral-900 text-white scale-110 shadow-md ring-4 ring-emerald-500/20' 
                    : isPassed 
                    ? 'bg-brand-50 text-brand-primary border border-brand-200' 
                    : 'bg-neutral-50 text-neutral-400 border border-neutral-200'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              {/* Text metadata */}
              <div className="space-y-0.5 md:space-y-1">
                <span className="text-[10px] font-mono text-neutral-400 font-bold uppercase tracking-wider block">
                  Stage {idx + 1}
                </span>
                <span className={`text-sm font-semibold block transition-colors duration-200 ${
                  isActive ? 'text-neutral-900 font-bold' : 'text-neutral-600 group-hover:text-black'
                }`}>
                  {stage.label}
                </span>
                <span className="text-[11px] text-neutral-400 hidden xl:block">
                  {stage.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Stage Detailed Panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStageIdx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-brand-50 p-5 rounded-2xl border border-brand-100 flex flex-col sm:flex-row items-center gap-5 justify-between text-left"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <p className="font-mono text-xs uppercase tracking-widest font-semibold text-brand-700">
                DSP Talent Hub Pillar Breakdown
              </p>
            </div>
            <h4 className="font-display font-semibold text-lg text-neutral-900">
              {PILAR_STAGES[activeStageIdx].label} Lifecycle
            </h4>
            <p className="text-sm text-neutral-600 max-w-xl leading-relaxed">
              {PILAR_STAGES[activeStageIdx].detailedInfo}
            </p>
          </div>

          <a
            href="#live-talent-directory"
            className="flex-shrink-0 inline-flex items-center gap-2 text-xs font-mono font-bold bg-neutral-900 text-white hover:bg-neutral-800 px-4 py-2.5 rounded-xl self-start sm:self-center transition"
          >
            <span>See Active Candidates</span>
            <ArrowRight className="w-3.5 h-3.5 text-brand-primary" />
          </a>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Interactive Steps cards for How it Works section
const STEPS: StepInfo[] = [
  {
    step: 1,
    title: 'Learn',
    subtitle: 'Structured Talent Bootcamps',
    description: 'Talent candidates complete comprehensive specialized training tracks constructed by field experts. We exclude speculative theoretical models, focusing strictly on high-impact current execution methodologies.',
    badge: 'Curriculum Certified',
    details: [
      'Interactive practical assignments',
      'Real-world software tools usage',
      'Regular peer review feedback'
    ]
  },
  {
    step: 2,
    title: 'The Gauntlet',
    subtitle: 'Brutal 48-Hour Assessment',
    description: 'Candidates undergo "The Gauntlet" — a brutal 48-hour scenario-based assessment that filters for real-world execution. Most applicants fail within the first two hours. We subject applicants to exhaustive technical verification targeting complex automated marketing/AI workloads.',
    badge: '90+ Score Threshold',
    details: [
      'Realistic sandbox scenario workloads',
      'Real-time automated code/workflow testing',
      'Soft-skills & business communication readiness'
    ]
  },
  {
    step: 3,
    title: 'Get Verified',
    subtitle: 'Robust Quality & Identity Seal',
    description: 'Candidates who pass the high-bar assessments undergo robust audits. We execute secure KYC identity matching, ensure compliance logs, and cross-reference background certificates before branding them as Verified.',
    badge: 'DSP Talent Verified Stamp',
    details: [
      'Secure government KYC checks',
      'Anti-cheat assessment logs verification',
      'Verified dossier published on directory'
    ]
  },
  {
    step: 4,
    title: 'Build Experience',
    subtitle: 'Supervised Real Industry Placements',
    description: 'Verified candidates participate in guided 12-week placements with scale-up companies, resolving active growth briefs. This ensures they achieve genuine business statistics before stepping to the global discoverability.',
    badge: 'Internship Managed Placements',
    details: [
      'Direct client accountability',
      'Guidance by professional marketing mentors',
      'Metric tracking of impact on live tasks'
    ]
  },
  {
    step: 5,
    title: 'Get Discovered',
    subtitle: 'Live Intelligence Employer Sourcing',
    description: 'High-intent employers unlock search tools on the DSP Talent Hub Directory to recruit verified, proven specialists directly. Say goodbye to spam candidates and slow recruiting pipelines.',
    badge: 'Instant Direct Connection',
    details: [
      'Direct interview requests features',
      'Detailed vetted transcripts access',
      'Transparent availability indicator'
    ]
  }
];

export function FiveStepVisualizer() {
  const [selectedStep, setSelectedStep] = useState<number>(3); // Default highlighting "Get Verified"

  return (
    <div className="space-y-8">
      {/* Interactive Step Index Navigation */}
      <div className="grid grid-cols-5 gap-2 max-w-xl mx-auto">
        {STEPS.map((step) => {
          const isSelected = selectedStep === step.step;
          return (
            <button
              key={step.step}
              onClick={() => setSelectedStep(step.step)}
              className={`py-3 rounded-2xl text-center border transition-all duration-300 relative cursor-pointer ${
                isSelected
                  ? 'border-neutral-900 bg-neutral-900 text-white shadow-md'
                  : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:text-neutral-800'
              }`}
            >
              <div className="font-mono text-xs font-bold">0{step.step}</div>
              <div className="text-xs font-semibold mt-0.5 hidden sm:block">{step.title}</div>
              {isSelected && (
                <motion.span 
                  layoutId="step-indicator"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[3px] bg-brand-primary rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Steps Layout Card */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-6 md:p-10 shadow-xs max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          {STEPS.map((step) => {
            if (step.step !== selectedStep) return null;
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
              >
                {/* Left Text Detail */}
                <div className="space-y-5 text-left">
                  <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-100 text-xs font-mono font-bold px-3 py-1.5 rounded-full">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{step.badge}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="font-mono text-sm text-neutral-400 font-semibold block">STEP 0{step.step}</span>
                    <h4 className="font-display font-medium text-2xl lg:text-3xl text-neutral-900 tracking-tight">
                      {step.subtitle}
                    </h4>
                  </div>

                  <p className="text-neutral-600 text-sm leading-relaxed">
                    {step.description}
                  </p>

                  <div className="border-t border-neutral-100 pt-4 space-y-2">
                    <span className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider block">Verified Core Protocols:</span>
                    <ul className="space-y-2">
                      {step.details.map((detail, dIdx) => (
                        <li key={dIdx} className="text-xs text-neutral-700 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Right Mock UI/Diagram representation */}
                <div className="bg-neutral-50 p-6 md:p-8 rounded-2xl border border-neutral-200/80 relative overflow-hidden h-[300px] flex items-center justify-center">
                  
                  {/* Background grid lines */}
                  <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-60" />
                  
                  {step.step === 1 && (
                    <div className="relative z-10 w-full max-w-sm space-y-3 bg-white p-5 rounded-2xl border border-neutral-300 shadow-sm text-left">
                      <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                        <span className="text-xs font-mono text-neutral-400 font-semibold uppercase">Workspace Training Sandbox</span>
                        <BookOpen className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div className="w-[85%] h-full bg-emerald-500" />
                      </div>
                      <div className="text-xs text-neutral-500 flex justify-between">
                        <span>Cohort Progress: SEO Essentials</span>
                        <span className="font-bold text-neutral-800">85% Complete</span>
                      </div>
                      <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-100 flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs text-neutral-700 font-mono">Module 4: Semantic Silos Resolved</span>
                      </div>
                    </div>
                  )}

                  {step.step === 2 && (
                    <div className="relative z-10 w-full max-w-sm space-y-3 bg-white p-5 rounded-2xl border border-neutral-300 shadow-sm text-left">
                      <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                        <span className="text-xs font-mono text-amber-500 font-bold uppercase flex items-center gap-1">
                          <BrainCircuit className="w-3.5 h-3.5" /> Assessment Live
                        </span>
                        <span className="text-[10px] font-mono bg-neutral-100 px-2 py-0.5 rounded">ID: AVX_928</span>
                      </div>
                      <div className="space-y-1.5 py-1">
                        <div className="flex justify-between text-xs">
                          <span>API Setup Execution Accuracy</span>
                          <span className="font-mono font-bold text-neutral-800">96.8%</span>
                        </div>
                        <div className="h-1.5 bg-neutral-100 rounded-full"><div className="w-[96.8%] h-full bg-brand-primary" /></div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span>Response Deliverables Time Delay</span>
                          <span className="font-mono font-bold text-neutral-800">Optimal (4m)</span>
                        </div>
                        <div className="h-1.5 bg-neutral-100 rounded-full"><div className="w-full h-full bg-emerald-500" /></div>
                      </div>
                      <div className="text-[11px] font-semibold text-center bg-emerald-50 text-emerald-800 py-1.5 rounded-xl border border-emerald-100">
                        ✓ Score: 96/100 · Elite Performance Tier
                      </div>
                    </div>
                  )}

                  {step.step === 3 && (
                    <div className="relative z-10 w-full max-w-sm bg-white p-6 rounded-2xl border-2 border-neutral-900 shadow-sm text-center space-y-4">
                      <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h5 className="font-display font-bold text-neutral-900 text-base">DSP Talent Verification Approved</h5>
                        <p className="text-xs text-neutral-400">KYC Verified · Credentials Audited · Account Activated</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2 border-t border-neutral-100 pt-3">
                        <div>
                          <span className="text-[10px] text-neutral-400 block uppercase">Seal No</span>
                          <span className="text-xs font-bold font-mono text-neutral-800">#481-VF</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-neutral-400 block uppercase">Audited By</span>
                          <span className="text-xs font-bold font-mono text-neutral-800 font-bold">DSP AI</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-neutral-400 block uppercase">Status</span>
                          <span className="text-xs font-bold font-mono text-emerald-600">Active</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {step.step === 4 && (
                    <div className="relative z-10 w-full max-w-sm space-y-3 bg-white p-5 rounded-2xl border border-neutral-300 shadow-sm text-left">
                      <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                        <span className="text-xs font-mono text-neutral-400 font-semibold uppercase">Supervised Active Placement</span>
                        <Building className="w-4 h-4 text-neutral-400" />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">A</div>
                        <div>
                          <p className="text-xs font-bold text-neutral-800">Acme Analytics Agency</p>
                          <p className="text-[10px] text-neutral-400">Internship Project Term - 12 Weeks</p>
                        </div>
                      </div>
                      <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-100 space-y-1">
                        <span className="text-[10px] text-neutral-400 block">Verified Business Outcome:</span>
                        <p className="text-xs text-neutral-800 font-medium">Re-mapped Klaviyo email list flows increasing click rates by 18%.</p>
                      </div>
                    </div>
                  )}

                  {step.step === 5 && (
                    <div className="relative z-10 w-full max-w-sm space-y-3 bg-white p-5 rounded-2xl border-2 border-emerald-500 shadow-md text-left">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                          <span className="text-xs font-mono text-neutral-500 font-bold uppercase">Employer Discovery</span>
                        </div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">Active Offer</span>
                      </div>
                      
                      <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
                        <p className="text-xs text-neutral-500 font-mono">Incoming Request From:</p>
                        <p className="text-sm font-bold text-neutral-900">Chief Growth Officer @ Stripe Solutions</p>
                      </div>

                      <div className="text-xs text-[#10b981] font-semibold text-center py-1 bg-emerald-50 rounded border border-emerald-100">
                        Verified Match Established
                      </div>
                    </div>
                  )}

                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
