import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  ChevronRight, 
  Sparkles, 
  CheckCircle2, 
  Check, 
  Award, 
  TrendingUp, 
  Users, 
  Briefcase, 
  Activity, 
  FileText, 
  Search, 
  Zap, 
  ThumbsUp, 
  ArrowUpRight,
  Monitor,
  Database,
  Building2,
  Clock,
  Heart,
  Globe,
  Terminal,
  Cpu,
  Layers,
  CheckCircle,
  HelpCircle,
  Lock,
  LineChart,
  FileSpreadsheet
} from 'lucide-react';

import { Header, Footer } from './components/HeaderAndFooter';
import TalentDirectory from './components/TalentDirectory';
import { HeroInteractivePipeline, FiveStepVisualizer } from './components/ProcessVisualizer';
import FAQSection from './components/FAQSection';
import { BadgeExplanation } from './types';

// Badges Section Data
const TRUST_BADGES: BadgeExplanation[] = [
  {
    id: 'b1',
    name: 'Verified Intern',
    iconName: 'Users',
    tagline: 'Supercharged & Ready to Deploy',
    description: 'Entry-level talent who have completed rigorous training in digital roles and validated technical execution basics through structured practical assignments.',
    bgColor: 'bg-emerald-500/5',
    borderColor: 'border-emerald-500/20',
    textColor: 'text-emerald-700'
  },
  {
    id: 'b2',
    name: 'Verified Professional',
    iconName: 'ShieldCheck',
    tagline: 'Expert Vetted Executioners',
    description: 'Experienced professionals of marketing and AI execution with certified histories, who passed technical, architectural, and business communication benchmarks.',
    bgColor: 'bg-teal-500/5',
    borderColor: 'border-teal-500/20',
    textColor: 'text-teal-700'
  },
  {
    id: 'b3',
    name: 'Internship Graduate',
    iconName: 'Briefcase',
    tagline: 'Proven by Supervised Metrics',
    description: 'Vetted candidates who have successfully finished an elite 12-week commercial placement where their deliverables, performance reviews, and metrics were certified.',
    bgColor: 'bg-blue-500/5',
    borderColor: 'border-blue-500/20',
    textColor: 'text-blue-700'
  },
  {
    id: 'b4',
    name: 'Employer Recommended',
    iconName: 'ThumbsUp',
    tagline: 'Highly Rated by Modern Teams',
    description: 'Recognized stars with outstanding references and professional recommendations directly provided by verified growth agency partners within the DSP Talent Hub platform.',
    bgColor: 'bg-indigo-500/5',
    borderColor: 'border-indigo-500/20',
    textColor: 'text-indigo-700'
  },
  {
    id: 'b5',
    name: 'Top Performer',
    iconName: 'Award',
    tagline: 'The Top 5% Vetting Score',
    description: 'Elite candidates demonstrating flawless execution on real-world benchmark tests, placing them in the highest tier of verified professional candidates.',
    bgColor: 'bg-amber-500/5',
    borderColor: 'border-amber-500/20',
    textColor: 'text-amber-800'
  }
];

export default function App() {
  // Navigation Routing State
  const [currentPage, setCurrentPage] = useState<'home' | 'problem' | 'how-it-works' | 'tracks' | 'directory' | 'portfolio' | 'badges'>('home');

  // Stats Animation logic
  const [stats, setStats] = useState({
    verifiedTalent: 0,
    internshipsCompleted: 0,
    employersHiring: 0,
    projectsDelivered: 0
  });

  useEffect(() => {
    const duration = 1500;
    const steps = 40;
    const stepTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      setStats({
        verifiedTalent: Math.floor((4821 / steps) * step),
        internshipsCompleted: Math.floor((1240 / steps) * step),
        employersHiring: Math.floor((850 / steps) * step),
        projectsDelivered: Math.floor((3110 / steps) * step)
      });

      if (step >= steps) {
        setStats({
          verifiedTalent: 4821,
          internshipsCompleted: 1240,
          employersHiring: 850,
          projectsDelivered: 3110
        });
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  // Sandbox interactive simulator states (demonstrate DSP Talent Hub vetting logic dynamically)
  const [testStage, setTestStage] = useState<'idle' | 'testing' | 'verified'>('idle');
  const [testResultScore, setTestResultScore] = useState(0);
  const [sandboxCandidateName, setSandboxCandidateName] = useState('Alex Rivera');
  const [sandboxRole, setSandboxRole] = useState<'SEO' | 'AI Automation' | 'PPC'>('AI Automation');

  const getGauntletLogs = (score: number) => {
    const logs: string[] = [];
    if (score >= 2) {
      logs.push("⏱️ [0-2 Hours]: Initialized system audit. Filtering for real-world execution capacity. Setup environment check.");
    }
    if (score >= 20) {
      logs.push("⚙️ [2-12 Hours]: Executing structural automation scripts and configuring multi-stage data pipelines.");
    }
    if (score >= 45) {
      logs.push("📊 [12-24 Hours]: Testing keyword coverage, checking response latency & debugging pipeline failures.");
    }
    if (score >= 70) {
      logs.push("🛡️ [24-36 Hours]: Reviewing anti-cheat telemetry data and environment security parameters.");
    }
    if (score >= 90) {
      logs.push("🏆 [36-48 Hours]: Finalizing peer recommendation dossiers and appending verified skill badges.");
    }
    return logs;
  };

  const runVettingSimulation = () => {
    setTestStage('testing');
    setTestResultScore(0);
    // Simulate grading increment
    let score = 0;
    const interval = setInterval(() => {
      score += Math.floor(Math.random() * 8) + 4;
      if (score >= 94) {
        setTestResultScore(96);
        setTestStage('verified');
        clearInterval(interval);
      } else {
        setTestResultScore(score);
      }
    }, 120);
  };

  // Badge interactive detail toggle
  const [selectedBadgeId, setSelectedBadgeId] = useState<string>('b2');

  // Employer contact modal
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);
  const [hireForm, setHireForm] = useState({ name: '', company: '', roleNeeded: 'AI Automation', message: '' });
  const [hireSubmitted, setHireSubmitted] = useState(false);

  // Talent Fellowship application mock
  const [isTalentModalOpen, setIsTalentModalOpen] = useState(false);
  const [talentForm, setTalentForm] = useState({ name: '', email: '', track: 'Internship Track', skills: '' });
  const [talentSubmitted, setTalentSubmitted] = useState(false);

  // Helper to change page and scroll smoothly
  const navigateToPage = (pageName: 'home' | 'problem' | 'how-it-works' | 'tracks' | 'directory' | 'portfolio' | 'badges') => {
    setCurrentPage(pageName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-neutral-900 selection:bg-emerald-500/20 flex flex-col font-sans">
      
      {/* Premium Notification Banner */}
      <div className="bg-neutral-950 py-2.5 px-4 text-center text-xs text-neutral-300 font-sans font-medium flex items-center justify-center gap-2 flex-wrap border-b border-neutral-900">
        <span className="bg-red-600 text-white font-mono font-bold px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider animate-pulse">The Gauntlet</span>
        <span className="font-secondary">A brutal 48-hour scenario-based assessment that filters for real-world execution. Most applicants fail within the first two hours.</span>
        <button 
          onClick={() => navigateToPage('how-it-works')} 
          className="text-white hover:text-red-400 underline transition font-semibold ml-1 cursor-pointer font-mono text-[11px]"
        >
          Check Survival Rates →
        </button>
      </div>

      {/* Premium Navigation Header */}
      <Header 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        openHireModal={() => setIsHireModalOpen(true)}
        openTalentModal={() => setIsTalentModalOpen(true)}
      />

      {/* MAIN CONTAINER */}
      <main className="flex-grow font-secondary">
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >

            {/* ======================================= */}
            {/* VIEW 1 — HOME OVERVIEW HUB              */}
            {/* ======================================= */}
            {currentPage === 'home' && (
              <div>
                {/* HERO AREA WITH FLOATING TECH ICONS */}
                <section className="relative pt-12 md:pt-20 pb-20 px-4 sm:px-6 lg:px-8 border-b border-neutral-200/40 bg-zinc-50/40 overflow-hidden">
                  
                  {/* Subtle technical lines background */}
                  <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none" />
                  <div className="absolute right-0 top-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute left-1/4 bottom-0 w-80 h-80 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

                  {/* Subtle animated floating tech icons on left and right */}
                  <motion.div
                    animate={{ y: [-10, 10, -10] }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute left-12 top-1/4 hidden lg:flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-neutral-200/50 shadow-xs text-xs font-mono font-bold text-neutral-800"
                  >
                    <Terminal className="w-3.5 h-3.5 text-emerald-500" />
                    <span>$ make audit_test</span>
                  </motion.div>

                  <motion.div
                    animate={{ y: [8, -8, 8] }}
                    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    className="absolute right-16 top-1/3 hidden lg:flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-neutral-200/50 shadow-xs text-xs font-mono font-bold text-neutral-800"
                  >
                    <Cpu className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
                    <span>Gemini-1.5-Pro</span>
                  </motion.div>

                  <motion.div
                    animate={{ y: [-6, 6, -6] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                    className="absolute left-20 bottom-1/4 hidden lg:flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-neutral-200/50 shadow-xs text-xs font-mono font-semibold text-neutral-600"
                  >
                    <Database className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified Talent Profile</span>
                  </motion.div>

                  <motion.div
                    animate={{ y: [10, -10, 10] }}
                    transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                    className="absolute right-24 bottom-1/3 hidden lg:flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-neutral-200/50 shadow-xs text-xs font-mono font-semibold text-neutral-600"
                  >
                    <LineChart className="w-3.5 h-3.5 text-emerald-500" />
                    <span>94% Placements KPI</span>
                  </motion.div>

                  <div className="max-w-5xl mx-auto text-center space-y-10 relative z-10">
                    
                    {/* Minimalist Tagline Chip */}
                    <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-500/20 px-3.5 py-1.5 rounded-full shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                      <p className="text-[10px] font-mono font-bold text-emerald-800 uppercase tracking-wider">
                        Proven Competence • 100% Free Candidate Track
                      </p>
                    </div>

                    {/* Headline Display Text */}
                    <div className="max-w-4xl mx-auto space-y-5">
                      <h1 className="font-display font-semibold text-4xl sm:text-5xl md:text-6.5xl text-neutral-950 tracking-tight leading-[1.08]">
                        Hire Digital Experts Who have Been{' '}
                        <strong className="text-emerald-700 bg-emerald-50 px-3 py-0.5 rounded-xl border border-emerald-500/10 font-bold block sm:inline-block mt-2 sm:mt-0">
                          Trained, Tested & Verified
                        </strong>
                      </h1>
                      
                      <p className="text-sm sm:text-base md:text-lg text-neutral-500 max-w-2xl mx-auto leading-relaxed font-normal font-secondary">
                        DSP Talent Hub bridges the trust gap. We vet candidates through "The Gauntlet" — a brutal 48-hour scenario-based assessment that filters for real-world execution. Most applicants fail within the first two hours.
                      </p>
                    </div>

                    {/* High Precision CTA Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
                      <button
                        onClick={() => navigateToPage('directory')}
                        className="w-full bg-neutral-950 hover:bg-neutral-900 text-white font-bold px-7 py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition duration-200 cursor-pointer shadow-md"
                      >
                        <span>Search Filter Directory</span>
                        <ArrowRight className="w-4 h-4 text-emerald-400" />
                      </button>

                      <button
                        onClick={() => navigateToPage('tracks')}
                        className="w-full bg-white hover:bg-neutral-50 text-neutral-800 font-bold px-7 py-3 rounded-xl text-xs border border-neutral-300 flex items-center justify-center gap-2 transition duration-200 cursor-pointer shadow-xs"
                      >
                        <span>Analyze Fellowship Tracks</span>
                        <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                      </button>
                    </div>

                    {/* Large Blueprint Teaser Illustration */}
                    <div className="pt-8 max-w-5xl mx-auto">
                      <div className="bg-white border border-neutral-200/70 rounded-3xl p-5 md:p-7 shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200/50 pb-4 mb-6 text-left">
                          <div>
                            <span className="text-[10px] uppercase font-mono font-bold text-neutral-400 tracking-widest">DSP Protocol Engine</span>
                            <h3 className="font-display font-medium text-lg text-neutral-900">Interactive Talent Placement Lifecycle</h3>
                          </div>
                          <button 
                            onClick={() => navigateToPage('how-it-works')}
                            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 pt-2 sm:pt-0 cursor-pointer"
                          >
                            <span>How Vetting works</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <HeroInteractivePipeline />
                      </div>
                    </div>

                    {/* Supported Roles Directory Summary */}
                    <div className="pt-6 flex flex-wrap justify-center items-center gap-x-10 gap-y-3.5 text-[11px] text-neutral-500 font-mono">
                      <span className="font-bold text-neutral-400 uppercase tracking-widest">Verified Roles:</span>
                      <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" /> AI AUTOMATION ARCHITECTS</span>
                      <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" /> TECHNICAL SEO MANAGERS</span>
                      <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" /> PAID SEARCH SPECIALISTS</span>
                    </div>

                  </div>
                </section>

                {/* 3 CORE PILLARS TEASER CARD SECTION */}
                <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-neutral-100">
                  <div className="max-w-6xl mx-auto space-y-12">
                    <div className="text-center max-w-2xl mx-auto space-y-3">
                      <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded">Core Foundations</span>
                      <h2 className="font-display font-medium text-2xl sm:text-3xl text-neutral-950 tracking-tight">Vetting Designed Around Evidence</h2>
                      <p className="text-neutral-500 text-xs sm:text-sm font-secondary">
                        Traditional job boards rely on unchecked claims. DSP Talent Hub establishes truth by testing actual operational outputs inside secure instances.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                      <div className="border border-neutral-200/60 p-6 sm:p-8 rounded-2xl bg-neutral-50/50 hover:bg-neutral-50 hover:border-neutral-900 transition-all duration-350 flex flex-col justify-between">
                        <div className="space-y-4">
                          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 border border-orange-200/50 flex items-center justify-center">
                            <AlertCircle className="w-5 h-5" />
                          </div>
                          <h3 className="font-display font-bold text-neutral-900 text-base">The System Is Broken</h3>
                          <p className="text-neutral-500 text-xs leading-relaxed font-secondary">
                            Mismatched talent outcomes waste recruitment capital and drag down operational velocity. Resumes do not show practical engineering capability.
                          </p>
                        </div>
                        <button
                          onClick={() => navigateToPage('problem')}
                          className="mt-6 inline-flex items-center gap-1 text-xs font-bold text-neutral-800 hover:text-emerald-600 self-start cursor-pointer text-left"
                        >
                          <span>Analyze Broken Sourcing</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="border border-neutral-200/60 p-6 sm:p-8 rounded-2xl bg-neutral-50/50 hover:bg-neutral-50 hover:border-neutral-900 transition-all duration-350 flex flex-col justify-between">
                        <div className="space-y-4">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/50 flex items-center justify-center">
                            <Activity className="w-5 h-5" />
                          </div>
                          <h3 className="font-display font-bold text-neutral-900 text-base">Metric-Driven Performance Exams</h3>
                          <p className="text-neutral-500 text-xs leading-relaxed font-secondary">
                            We deploy advanced diagnostic test suites targeting complex workloads (workflow automation, search visibility, launching paid marketing clusters) and review real deliverables.
                          </p>
                        </div>
                        <button
                          onClick={() => navigateToPage('how-it-works')}
                          className="mt-6 inline-flex items-center gap-1 text-xs font-bold text-neutral-800 hover:text-emerald-600 self-start cursor-pointer text-left"
                        >
                          <span>View Our Vetting Standards</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="border border-neutral-200/60 p-6 sm:p-8 rounded-2xl bg-neutral-50/50 hover:bg-neutral-50 hover:border-neutral-900 transition-all duration-350 flex flex-col justify-between">
                        <div className="space-y-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/50 flex items-center justify-center">
                            <FileText className="w-5 h-5" />
                          </div>
                          <h3 className="font-display font-bold text-neutral-900 text-base">Verified Performance Dossier</h3>
                          <p className="text-neutral-500 text-xs leading-relaxed font-secondary">
                            We compile rigorous hands-on performance results, completed milestone project deliverables, and real 12-week commercial placement metrics into an authenticated dossier for each candidate.
                          </p>
                        </div>
                        <button
                          onClick={() => navigateToPage('portfolio')}
                          className="mt-6 inline-flex items-center gap-1 text-xs font-bold text-neutral-800 hover:text-emerald-600 self-start cursor-pointer text-left"
                        >
                          <span>Explore Certified Portfolios</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* VETTING EXPLAINER TEASER SLIDER (Interative badge dashboard widget) */}
                <section className="py-20 px-4 sm:px-6 lg:px-8 bg-neutral-50/40 border-b border-neutral-200/30">
                  <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                    
                    <div className="lg:col-span-5 text-left space-y-5">
                      <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase tracking-widest bg-emerald-100/60 px-2.5 py-1 rounded">Vetting Protocol Seal</span>
                      <h2 className="font-display font-medium text-3xl text-neutral-950 tracking-tight leading-none">Standardized Quality Seals</h2>
                      <p className="text-neutral-500 text-sm leading-relaxed font-secondary">
                        We append audited, tamper-proof quality badges containing actual grading metrics. Sourcing teams can directly view score diagnostics for every single individual.
                      </p>
                      
                      <div className="space-y-2 pt-2">
                        {TRUST_BADGES.slice(0, 3).map((badge) => (
                          <button
                            key={badge.id}
                            onClick={() => {
                              setSelectedBadgeId(badge.id);
                              navigateToPage('badges');
                            }}
                            className="w-full text-left p-3.5 rounded-xl border border-neutral-200/60 bg-white hover:border-neutral-900 cursor-pointer flex items-center gap-3 transition-all duration-200"
                          >
                            <div className={`w-8 h-8 rounded-lg ${badge.bgColor} ${badge.borderColor} ${badge.textColor} flex items-center justify-center border font-bold text-xs`}>
                              <ShieldCheck className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-xs text-neutral-900">{badge.name}</p>
                              <p className="text-[11px] text-neutral-400 font-secondary mt-0.5">{badge.tagline}</p>
                            </div>
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => navigateToPage('badges')}
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 pt-2 cursor-pointer"
                      >
                        <span>View Vetting Schema Standards</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="lg:col-span-1" />

                    <div className="lg:col-span-6 bg-white border border-neutral-200/85 p-6 md:p-8 rounded-3xl text-left space-y-6 shadow-xs relative">
                      <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/5 rounded-full pointer-events-none blur-xl" />
                      <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-emerald-600" />
                        <span className="font-mono text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Dynamic Skills Assessment Simulator</span>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-display font-bold text-neutral-900 text-lg">Verify Real-World Performance</h4>
                        <p className="text-xs text-neutral-500 font-secondary leading-relaxed">
                          Click below to execute the live simulator and observe how the DSP Talent Hub platform audits technical skills, API workflows, and keyword strategy execution.
                        </p>

                        <div className="bg-neutral-950 text-neutral-200 rounded-xl p-4 md:p-5 border border-neutral-900 font-mono text-xs space-y-2 h-[220px] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-800">
                          <p className="text-neutral-500"># Initializing "The Gauntlet" telemetry parser...</p>
                          <p className="text-neutral-400"># Candidate Reference: Alex Rivera (AI Automation)</p>
                          {testStage === 'idle' && (
                            <p className="text-amber-500 animate-pulse">⚡ Status: STANDBY. Click "Run Skills Evaluation" below to simulate assessment audits.</p>
                          )}
                          {testStage === 'testing' && (
                            <div className="space-y-1.5">
                              <p className="text-blue-400 animate-pulse">⚡ Actively tracking execution scorecard: {testResultScore}% completed...</p>
                              {getGauntletLogs(testResultScore).map((log, i) => (
                                <p key={i} className="text-neutral-300 text-[11px] pl-2 border-l border-neutral-800 animate-fade-in">{log}</p>
                              ))}
                            </div>
                          )}
                          {testStage === 'verified' && (
                            <div className="space-y-2">
                              <p className="text-emerald-400 font-bold">✓ GAUNTLET AUDIT COMPLETED: {testResultScore}/100 certified.</p>
                              <p className="text-neutral-400">Status: CREDENTIALS SIGNED & DIGITALLY APPROVED.</p>
                              <p className="text-amber-500 font-semibold text-[11px]">★ Elite 5% Top Performer approved for Active Placement Sourcing.</p>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={runVettingSimulation}
                          disabled={testStage === 'testing'}
                          className="w-full bg-neutral-950 hover:bg-neutral-900 text-white font-bold py-3 px-5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
                          <span>{testStage === 'testing' ? 'Evaluating Skills...' : 'Run Skills Evaluation'}</span>
                        </button>
                      </div>
                    </div>

                  </div>
                </section>

                {/* COUNTERS STATS */}
                <section className="py-16 px-4 bg-zinc-50 border-b border-neutral-200/30">
                  <div className="max-w-4xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 text-center text-neutral-900">
                    <div className="space-y-1">
                      <p className="font-display font-bold text-3xl sm:text-4xl text-neutral-950">{stats.verifiedTalent.toLocaleString()}+</p>
                      <p className="text-[11px] font-mono font-bold uppercase text-neutral-400 tracking-wider">Vetted Dossiers</p>
                    </div>
                    <div className="space-y-1">
                      <p className="font-display font-bold text-3xl sm:text-4xl text-neutral-1000 text-neutral-950">{stats.internshipsCompleted.toLocaleString()}+</p>
                      <p className="text-[11px] font-mono font-bold uppercase text-neutral-400 tracking-wider">Managed Placements</p>
                    </div>
                    <div className="space-y-1">
                      <p className="font-display font-bold text-3xl sm:text-4xl text-neutral-950">{stats.employersHiring.toLocaleString()}+</p>
                      <p className="text-[11px] font-mono font-bold uppercase text-neutral-400 tracking-wider">Hiring Agencies</p>
                    </div>
                    <div className="space-y-1">
                      <p className="font-display font-bold text-3xl sm:text-4xl text-neutral-950">{stats.projectsDelivered.toLocaleString()}+</p>
                      <p className="text-[11px] font-mono font-bold uppercase text-neutral-400 tracking-wider">Audited Deliverables</p>
                    </div>
                  </div>
                </section>

                <FAQSection />
              </div>
            )}


            {/* ======================================= */}
            {/* VIEW 2 — THE PROBLEM PAGE               */}
            {/* ======================================= */}
            {currentPage === 'problem' && (
              <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-4xl mx-auto space-y-16 text-left">
                  
                  {/* Page Title */}
                  <div className="space-y-4">
                    <span className="text-[10px] uppercase font-mono font-bold text-neutral-400 tracking-widest block">Operational Inefficiencies</span>
                    <h1 className="font-display font-bold text-4xl sm:text-5xl text-neutral-950 tracking-tight leading-none">
                      Why Resume Sourcing is Terminally Broken
                    </h1>
                    <p className="text-sm sm:text-base text-neutral-500 max-w-2xl font-secondary leading-relaxed">
                      Traditional hiring lists are plagued with unverified resume padding, excessive recruiting commission fees, and massive mismatch rates, resulting in hundreds of wasted hours.
                    </p>
                  </div>

                  {/* High Contrast Side-by-Side Comparison Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    <div className="border border-red-200/50 p-6 md:p-8 rounded-2xl bg-red-50/10 space-y-6">
                      <h3 className="font-display font-bold text-neutral-900 text-lg flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        <span>Traditional Sourcing Models</span>
                      </h3>
                      
                      <ul className="space-y-4 text-xs text-neutral-600 font-secondary">
                        <li className="flex items-start gap-2.5">
                          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                          <span><strong>Self-Reported Resumes:</strong> Open to inflation, exaggerations, or unverified software proficiencies.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                          <span><strong>Prestige-Driven Filtering:</strong> Biased toward university pedigree rather than verified capability.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                          <span><strong>Extremely Slow Timelines:</strong> Sourcing managers spend weeks filtering, screening, and interviewing.</span>
                        </li>
                      </ul>
                    </div>

                    <div className="border border-emerald-200/50 p-6 md:p-8 rounded-2xl bg-emerald-50/10 space-y-6">
                      <h3 className="font-display font-bold text-emerald-950 text-lg flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>The DSP Talent Hub Standard</span>
                      </h3>
                      
                      <ul className="space-y-4 text-xs text-neutral-600 font-secondary">
                        <li className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span><strong>Verified Performance Portfolios:</strong> Every candidate profile displays objective technical exam scores and direct, certified deliverables.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span><strong>Competence-First Standard:</strong> Talent is selected purely based on automated operational audits.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span><strong>Near-Instant Sourcing:</strong> Employers download structured summaries containing certified scoring records.</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Systemic Recruitment Obstacles Cards */}
                  <div className="space-y-6 pt-6">
                    <h3 className="font-display font-medium text-xl text-neutral-900 border-b border-neutral-100 pb-3">Recruitment Obstacles We Eliminate</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-6 bg-neutral-50 rounded-xl border border-neutral-250/20 space-y-2">
                        <p className="font-mono text-xs font-bold text-neutral-400">OBSTACLE 01</p>
                        <h4 className="font-bold text-neutral-950 text-sm">Skills Bluffing</h4>
                        <p className="text-xs text-neutral-500 leading-relaxed font-secondary">
                          "Familiar with SEO" often means watching a quick video tutorial. We enforce actual competency exams ensuring true platform capability.
                        </p>
                      </div>

                      <div className="p-6 bg-neutral-50 rounded-xl border border-neutral-250/20 space-y-2">
                        <p className="font-mono text-xs font-bold text-neutral-400">OBSTACLE 02</p>
                        <h4 className="font-bold text-neutral-950 text-sm">Long Sourcing Lag</h4>
                        <p className="text-xs text-neutral-500 leading-relaxed font-secondary">
                          Agencies waste weeks checking references. We make performance scores transparent, lowering hiring timelines by several weeks.
                        </p>
                      </div>

                      <div className="p-6 bg-neutral-50 rounded-xl border border-neutral-250/20 space-y-2">
                        <p className="font-mono text-xs font-bold text-neutral-450">OBSTACLE 03</p>
                        <h4 className="font-bold text-neutral-950 text-sm">Absence of Oversight</h4>
                        <p className="text-xs text-neutral-500 leading-relaxed font-secondary">
                          Internships lack structured accountability benchmarks. We continuously track commercial deliverables during matched 12-week placements.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Direct Call to Action */}
                  <div className="bg-neutral-950 text-white rounded-3xl p-6 sm:p-10 text-center space-y-6 relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
                    <h3 className="font-display font-bold text-2xl sm:text-3xl text-white">Ready to transition to an evidence-based hiring protocol?</h3>
                    <p className="text-neutral-400 text-xs sm:text-sm max-w-xl mx-auto font-secondary">
                      Stop guessing. Browse the active, verified roster now, or submit your specific tech placement criteria.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                      <button 
                        onClick={() => navigateToPage('directory')} 
                        className="w-full sm:w-auto bg-[#10b981] hover:bg-emerald-500 text-neutral-950 font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider cursor-pointer"
                      >
                        Explore Roster
                      </button>
                      <button 
                        onClick={() => setIsHireModalOpen(true)}
                        className="w-full sm:w-auto bg-neutral-900 border border-neutral-800 text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider cursor-pointer"
                      >
                        Request Custom Shortlist
                      </button>
                    </div>
                  </div>

                </div>
              </section>
            )}


            {/* ======================================= */}
            {/* VIEW 3 — HOW IT WORKS PAGE              */}
            {/* ======================================= */}
            {currentPage === 'how-it-works' && (
              <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-5xl mx-auto space-y-16 text-left">
                  
                  {/* Page Title */}
                  <div className="space-y-4">
                    <span className="text-[10px] uppercase font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-sm tracking-wider inline-block">The Five Stages</span>
                    <h1 className="font-display font-bold text-4xl sm:text-5xl text-neutral-950 tracking-tight leading-none">
                      How DSP Talent Hub Vetting Runs
                    </h1>
                    <p className="text-sm sm:text-base text-neutral-500 max-w-2xl font-secondary leading-relaxed">
                      Our system is designed to provide complete protection against credential bluffing through robust skill testing, identity audits, and placement dashboards.
                    </p>
                  </div>

                  {/* Five Step Visualizer element */}
                  <div className="border border-neutral-100 rounded-3xl p-5 md:p-8 bg-zinc-50/60 shadow-2xs">
                    <FiveStepVisualizer />
                  </div>

                  {/* Real Vetting Simulator Sandbox Interface */}
                  <div className="bg-neutral-50 border border-neutral-200 p-6 md:p-10 rounded-3xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    
                    <div className="lg:col-span-5 space-y-5">
                      <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 border-emerald-200 border text-xs font-mono px-3 py-1 rounded-full font-bold">
                        <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                        <span>Interactive Competency Demo</span>
                      </div>
                      <h3 className="font-display font-bold text-2xl text-neutral-900 leading-tight">
                        Experience Our Automated Evaluation Sequence
                      </h3>
                      <p className="text-xs text-neutral-500 leading-relaxed font-secondary">
                        Pick a target role and check how DSP Talent Hub reviews technical capability. Every live audit inspects execution accuracy and grading thresholds before certifying candidate portfolios.
                      </p>

                      <div className="space-y-3 pt-2">
                        <div className="flex gap-2 flex-wrap items-center">
                          <label className="text-[10px] font-mono text-neutral-400 font-bold uppercase">Target Specialization:</label>
                          <div className="flex gap-1.5">
                            {(['AI Automation', 'SEO', 'PPC'] as const).map((r) => (
                              <button
                                key={r}
                                onClick={() => {
                                  setSandboxRole(r);
                                  setSandboxCandidateName(r === 'SEO' ? 'Amara Okafor' : r === 'PPC' ? 'Liam Vance' : 'Marcus Chen');
                                  setTestStage('idle');
                                }}
                                className={`text-[10px] uppercase font-mono font-bold px-2.5 py-1 rounded-lg border cursor-pointer transition ${
                                  sandboxRole === r 
                                    ? 'border-neutral-950 bg-neutral-950 text-white' 
                                    : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                                }`}
                              >
                                {r}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-7 bg-neutral-950 text-neutral-200 rounded-2xl p-5 md:p-6 border border-neutral-900 shadow-xl font-mono text-xs space-y-4">
                      
                      <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                        </div>
                        <span className="text-neutral-500 text-[10px]">DSP-GAUNTLET-v3.0.sh</span>
                        <span className="text-neutral-500 text-[10px]">Status: ONLINE</span>
                      </div>

                      <div className="space-y-2 font-mono leading-relaxed h-[220px] overflow-y-auto text-neutral-300 bg-neutral-950 p-3 rounded-xl border border-neutral-800 scrollbar-thin scrollbar-thumb-neutral-800">
                        <p className="text-neutral-500"># DSP Talent Hub evaluation engine initialized.</p>
                        <p className="text-neutral-450 flex items-center gap-1.5">
                          <span className="text-emerald-400">$</span> run-gauntlet --target="{sandboxCandidateName}" --track="{sandboxRole}"
                        </p>
                        
                        {testStage === 'idle' && (
                          <p className="text-amber-500 animate-pulse">✓ Ready. Click "Evaluate Portfolio" below to run interactive "Gauntlet" checks.</p>
                        )}

                        {testStage === 'testing' && (
                          <div className="space-y-1.5">
                            <p className="text-blue-400 animate-pulse">⚡ Executing robust 48h active diagnostic telemetry [Completion: {testResultScore}%]</p>
                            {getGauntletLogs(testResultScore).map((log, i) => (
                              <p key={i} className="text-neutral-400 text-xs pl-2 border-l border-neutral-800 animate-fade-in">{log}</p>
                            ))}
                          </div>
                        )}

                        {testStage === 'verified' && (
                          <div className="space-y-2 text-neutral-300">
                            <p className="text-emerald-400 font-bold">✓ THE GAUNTLET PASSED FOR {sandboxCandidateName.toUpperCase()}</p>
                            <p className="text-neutral-450">· Verified Score: <span className="text-white font-bold">{testResultScore} / 100</span> (Threshold: 90)</p>
                            <p className="text-neutral-450">· Vetting Status: <span className="text-emerald-500 font-bold">LICENSED & DEPLOYABLE</span></p>
                            <p className="text-neutral-500"># Real-world outputs audited. Account added to live discoverable roster.</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-neutral-900">
                        <div className="text-neutral-500 text-[10px] text-left">
                          Required Score: <span className="text-white font-semibold">90/100</span> to attain stamp seal
                        </div>
                        
                        <button
                          onClick={runVettingSimulation}
                          disabled={testStage === 'testing'}
                          className={`px-4 py-2 rounded-xl uppercase tracking-wider font-bold text-xs flex items-center justify-center gap-1.5 w-full sm:w-auto transition cursor-pointer ${
                            testStage === 'testing'
                              ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                              : 'bg-emerald-500 hover:bg-emerald-600 text-neutral-950'
                          }`}
                        >
                          <Zap className="w-3 h-3" />
                          <span>Evaluate Portfolio</span>
                        </button>
                      </div>

                    </div>

                  </div>

                </div>
              </section>
            )}


            {/* ======================================= */}
            {/* VIEW 4 — CHOOSE YOUR TRACK PAGE          */}
            {/* ======================================= */}
            {currentPage === 'tracks' && (
              <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-6xl mx-auto space-y-16 text-left">
                  
                  {/* Page Title */}
                  <div className="text-center max-w-2xl mx-auto space-y-3">
                    <span className="text-[10px] uppercase font-mono font-bold text-neutral-450 bg-emerald-50 text-emerald-800 border border-emerald-500/20 px-3 py-1 rounded-full tracking-wider inline-block">Fellowship Core Tracks</span>
                    <h1 className="font-display font-medium text-4xl text-neutral-950 tracking-tight leading-none">
                      Select Your Placement Track
                    </h1>
                    <p className="text-neutral-500 text-sm max-w-xl mx-auto font-secondary">
                      DSP Talent Hub services two core pathways designed to support the growth standards of digital marketing agencies and enterprise operations.
                    </p>
                  </div>

                  {/* Track Cards */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto pt-6">
                    
                    {/* Internship Track */}
                    <div className="border-2 border-neutral-200 hover:border-neutral-900 p-8 md:p-10 rounded-3xl bg-neutral-50/40 relative overflow-hidden flex flex-col justify-between transition-all duration-300 group shadow-xs">
                      <div className="space-y-6">
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-emerald-700 bg-emerald-50 border border-emerald-200/50 px-2.5 py-1 rounded">
                          MENTORED ENTRY PROGRAM
                        </span>
                        
                        <div className="space-y-2">
                          <h3 className="font-display font-bold text-2xl text-neutral-950">Internship Track</h3>
                          <p className="text-neutral-500 text-xs sm:text-sm font-secondary leading-relaxed">
                            For aspiring candidates seeking hands-on, practical commercial experience in digital roles. Build valid deliverables and match to structured 12-week placements with stellar mentors.
                          </p>
                        </div>

                        <div className="pt-4 border-t border-neutral-100 space-y-3">
                          <p className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">Key Deliverables:</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-700">
                            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> 100% Free fellowship checks</div>
                            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> Hands-on practical diagnostics</div>
                            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> Verified placement stipend</div>
                            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> Roster discoverability</div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-8">
                        <button
                          onClick={() => {
                            setTalentForm(prev => ({ ...prev, track: 'Internship Track' }));
                            setIsTalentModalOpen(true);
                          }}
                          className="w-full text-center bg-white hover:bg-neutral-950 hover:text-white border border-neutral-900 text-neutral-900 font-bold py-3 px-5 rounded-xl text-xs transition duration-200 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>Explore Internship Fellowship</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Professional Track */}
                    <div className="border-2 border-neutral-200 hover:border-neutral-900 p-8 md:p-10 rounded-3xl bg-neutral-50/40 relative overflow-hidden flex flex-col justify-between transition-all duration-300 group shadow-xs">
                      <div className="space-y-6">
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase text-white bg-neutral-950 px-2.5 py-1 rounded">
                          IMMEDIATE ROSTER HIRING
                        </span>
                        
                        <div className="space-y-2">
                          <h3 className="font-display font-bold text-2xl text-neutral-950">Professional Track</h3>
                          <p className="text-neutral-500 text-xs sm:text-sm font-secondary leading-relaxed">
                            For certified marketing, ad tech, and operations specialists seeking instant full-time, part-time, or remote roles. Highlight actual campaign performance and skip screen filters.
                          </p>
                        </div>

                        <div className="pt-4 border-t border-neutral-100 space-y-3">
                          <p className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">Key Deliverables:</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-700">
                            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> Advanced performance metrics</div>
                            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> Verified metric credentials</div>
                            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> Immediate agency routing</div>
                            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> Verified salary guarantees</div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-8">
                        <button
                          onClick={() => {
                            setTalentForm(prev => ({ ...prev, track: 'Professional Track' }));
                            setIsTalentModalOpen(true);
                          }}
                          className="w-full text-center bg-neutral-950 hover:bg-neutral-900 border border-neutral-950 text-white font-bold py-3 px-5 rounded-xl text-xs transition duration-200 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>Explore Professional Track</span>
                          <ArrowRight className="w-3.5 h-3.5 text-emerald-450" />
                        </button>
                      </div>
                    </div>

                  </div>

                </div>
              </section>
            )}


            {/* ======================================= */}
            {/* VIEW 5 — DIRECTORY PAGE                 */}
            {/* ======================================= */}
            {currentPage === 'directory' && (
              <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto space-y-12 text-left">
                  
                  {/* Page Title */}
                  <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-neutral-100 pb-8">
                    <div className="space-y-4">
                      <span className="text-[10px] uppercase font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md tracking-wider inline-block">Real-time Catalog</span>
                      <h1 className="font-display font-medium text-4xl text-neutral-950 tracking-tight leading-none">
                        Live Talent Directory
                      </h1>
                      <p className="text-neutral-500 text-sm max-w-2xl font-secondary">
                        Search and filter our verified marketing and AI Automation experts. Open individual profiles to inspect audited credentials, score diagnostics, and client references logs.
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                      <span>Synced with 8 Active Cohorts</span>
                    </div>
                  </div>

                  {/* Render the full searchable, interactable components directory */}
                  <div className="border border-neutral-200/60 p-4 rounded-3xl bg-neutral-50/30">
                    <TalentDirectory />
                  </div>

                </div>
              </section>
            )}


            {/* ======================================= */}
            {/* VIEW 6 — PORTFOLIO / LEDGER ECOSYSTEM   */}
            {/* ======================================= */}
            {currentPage === 'portfolio' && (
              <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-4xl mx-auto space-y-16 text-left animate-fade-in font-secondary">
                  
                  {/* Page Title */}
                  <div className="space-y-4">
                    <span className="text-[10px] uppercase font-mono font-bold text-neutral-400 tracking-widest block font-bold">Verified Accomplishment Records</span>
                    <h1 className="font-display font-bold text-4xl sm:text-5xl text-neutral-950 tracking-tight leading-none">
                      Interactive Performance Portfolios
                    </h1>
                     <p className="text-sm sm:text-base text-neutral-500 max-w-2xl font-secondary leading-relaxed">
                      Every cohort candidate builds an authentic, auditable portfolio on DSP Talent Hub. Each deliverable maps test outcomes, practical project details, and real supervised client outcomes.
                    </p>
                  </div>

                  {/* 3 stages grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                    <div className="border border-neutral-200/60 p-6 rounded-2xl bg-[#f8fafc] space-y-3">
                      <span className="font-bold text-neutral-850 bg-neutral-100 text-neutral-900 border border-neutral-200 text-xs px-2 py-0.5 rounded font-mono">STEP 01</span>
                      <h4 className="font-display font-bold text-neutral-900 text-base">Class Deliverables</h4>
                      <p className="text-neutral-500 text-xs leading-relaxed font-secondary">
                        All technical tasks resolved during technical benchmark exams are preserved with code correctness scores, test outcomes, and architectural reviews.
                      </p>
                    </div>

                    <div className="border border-neutral-200/60 p-6 rounded-2xl bg-[#f8fafc] space-y-3">
                      <span className="font-bold text-neutral-850 bg-neutral-100 text-neutral-900 border border-neutral-200 text-xs px-2 py-0.5 rounded font-mono">STEP 02</span>
                      <h4 className="font-display font-bold text-neutral-900 text-base">Supervised Internships</h4>
                      <p className="text-neutral-500 text-xs leading-relaxed font-secondary">
                        Matched candidates track active KPIs (conversion lifts, PPC cost reduction, semantic search growth) during supervised commercial assignments.
                      </p>
                    </div>

                    <div className="border border-neutral-200/60 p-6 rounded-2xl bg-[#f8fafc] space-y-3">
                      <span className="font-bold text-neutral-850 bg-neutral-100 text-neutral-900 border border-neutral-200 text-xs px-2 py-0.5 rounded font-mono">STEP 03</span>
                      <h4 className="font-display font-bold text-neutral-900 text-base">Verified Milestones</h4>
                      <p className="text-neutral-500 text-xs leading-relaxed font-secondary">
                        Acme enterprise managers and growth agency partners submit direct feedback reviews, generating authenticated 360 recommendation reports.
                      </p>
                    </div>
                  </div>

                  {/* Automated Ledger Events list */}
                  <div className="bg-neutral-950 border-2 border-neutral-900 rounded-3xl p-6 md:p-8 space-y-6">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-mono text-xs uppercase text-neutral-400">DSP Real-Time Verification Feed</span>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-600">Updated seconds ago</span>
                    </div>

                    <div className="space-y-4 font-mono text-xs leading-relaxed">
                      <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 flex items-start gap-3">
                        <span className="text-emerald-500">[COHORT 08]</span>
                        <div>
                          <p className="text-white font-bold">Sarah Jenkins added custom Google Tag Manager audit</p>
                          <p className="text-neutral-500">"Validated conversion tracking parameters on e-commerce cart" - scoring audit logs show 98% accuracy.</p>
                        </div>
                      </div>

                      <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 flex items-start gap-3">
                        <span className="text-blue-400">[PLACEMENT]</span>
                        <div>
                          <p className="text-white font-bold">Acme Group approved PPC milestone report</p>
                          <p className="text-neutral-500">Liam Vance configured automated budget allocation pipeline - overall lead generation cost dropped by -24%.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </section>
            )}


            {/* ======================================= */}
            {/* VIEW 7 — BADGES STANDARDS PAGE           */}
            {/* ======================================= */}
            {currentPage === 'badges' && (
              <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-4xl mx-auto space-y-16 text-left">
                  
                  {/* Page Title */}
                  <div className="space-y-4 text-center max-w-2xl mx-auto">
                    <span className="text-[10px] uppercase font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full tracking-wider inline-block">Evaluation Standards</span>
                    <h1 className="font-display font-medium text-4xl text-neutral-950 tracking-tight leading-none">
                      Trust Badges Standard Schema
                    </h1>
                    <p className="text-sm text-neutral-500 font-secondary leading-relaxed">
                      Every badge in our ecosystem represents extensive practical assessment benchmarks. We provide transparent access to scores and logs to maintain complete clarity.
                    </p>
                  </div>

                  {/* Interactive selector + detail cards */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-6">
                    
                    {/* Badge selector list left */}
                    <div className="lg:col-span-5 flex flex-col gap-3">
                      {TRUST_BADGES.map((badge) => (
                        <button
                          key={badge.id}
                          onClick={() => setSelectedBadgeId(badge.id)}
                          className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all duration-300 cursor-pointer ${
                            selectedBadgeId === badge.id 
                              ? 'bg-white border-neutral-950 shadow-md ring-1 ring-neutral-950/5' 
                              : 'bg-white border-neutral-200/50 hover:border-neutral-300 text-neutral-600'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border font-bold ${badge.bgColor} ${badge.borderColor} ${badge.textColor}`}>
                              <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-xs text-neutral-950">{badge.name}</p>
                              <p className="text-[10px] text-neutral-400 mt-0.5">{badge.tagline}</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-neutral-400" />
                        </button>
                      ))}
                    </div>

                    {/* Badge explainer panel right */}
                    <div className="lg:col-span-1" />

                    <div className="lg:col-span-6">
                      <div className="bg-white border-2 border-neutral-900 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                        {TRUST_BADGES.map((badge) => {
                          if (badge.id !== selectedBadgeId) return null;
                          return (
                            <div key={badge.id} className="space-y-6 text-left">
                              <div className="space-y-3">
                                <span className="text-[9px] uppercase font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-sm">VETTING STANDARD PACKET</span>
                                <h3 className="font-display font-bold text-2xl text-neutral-950 flex items-center gap-2">
                                  {badge.name}
                                </h3>
                                <p className="text-emerald-700 font-mono text-[10px] font-bold uppercase tracking-wider">{badge.tagline}</p>
                              </div>

                              <p className="text-xs text-neutral-600 leading-relaxed font-secondary">
                                {badge.description}
                              </p>

                              <div className="border border-neutral-200 bg-neutral-50 px-4 py-4 rounded-xl space-y-2">
                                <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold block">Mandatory Auditing Checks:</span>
                                
                                <div className="space-y-2.5 text-xs text-neutral-700">
                                  <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Standard identity & KYC audit log</p>
                                  <p className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Anti-cheat secure browser & IP monitoring</p>
                                  <p className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Verified mentor supervisor reviews</p>
                                  <p className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Encrypted metric verification key</p>
                                </div>
                              </div>

                              <button
                                onClick={() => navigateToPage('directory')}
                                className="w-full bg-neutral-950 hover:bg-neutral-900 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 uppercase tracking-wider"
                              >
                                <span>Find {badge.name} candidates</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                </div>
              </section>
            )}

          </motion.div>
        </AnimatePresence>

        {/* GENERAL CALL TO ACTION SPLIT-BANNER */}
        <section className="py-20 md:py-24 px-4 sm:px-6 lg:px-8 bg-neutral-950 text-white relative text-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-4xl mx-auto space-y-8 relative z-10">
            <div className="space-y-4">
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-full max-w-xs mx-auto text-center font-secondary">VERIFOLIO PLACEMENT NETWORK</span>
              <h2 className="font-display font-medium text-3xl sm:text-4.5xl text-white tracking-tight leading-none pt-2">
                Begin Sourcing Candidates Sourced on Evidence
              </h2>
              <p className="text-neutral-400 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed font-secondary">
                Secure top-tier interns or direct hiring professionals graded on technical excellence and verified through actual, live deliverables.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-sm mx-auto">
              <button
                onClick={() => setIsHireModalOpen(true)}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-bold px-6 py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition duration-200"
              >
                <span>Find Talent</span>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-950 stroke-[2.5]" />
              </button>

              <button
                onClick={() => setIsTalentModalOpen(true)}
                className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold px-6 py-3 rounded-xl text-xs border border-neutral-800 flex items-center justify-center gap-1.5 cursor-pointer transition duration-200"
              >
                <span>Apply as Candidate</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400" />
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* ======================================= */}
      {/* DIALOG MODE: MODAL FOR EMPLOYERS        */}
      {/* ======================================= */}
      {isHireModalOpen && (
        <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-neutral-200 max-w-lg w-full p-6 md:p-8 space-y-6 text-left relative shadow-2xl font-secondary">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/50">Employer Sourcing</span>
                <h3 className="font-display font-medium text-2xl text-neutral-950 mt-4 leading-none">Start Sourcing Talent</h3>
                <p className="text-xs text-neutral-400 mt-1.5">Specify which verified disciplines your team has immediate placement roles for.</p>
              </div>
              <button 
                onClick={() => { setIsHireModalOpen(false); setHireSubmitted(false); }}
                className="text-neutral-400 hover:text-neutral-850 p-1.5 rounded-lg hover:bg-neutral-100 transition cursor-pointer font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {hireSubmitted ? (
              <div className="p-8 text-center bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="font-bold text-neutral-950">Placement Request Scheduled!</h4>
                <p className="text-xs text-neutral-600">Our Talent Intelligence Coordinator will search matches within our certified candidate directory and email curated profiles within 2 hours.</p>
                <button 
                  onClick={() => { setIsHireModalOpen(false); setHireSubmitted(false); }}
                  className="bg-neutral-950 hover:bg-neutral-900 text-white font-semibold py-2 px-4 rounded-xl text-xs cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form 
                onSubmit={(e) => { e.preventDefault(); setHireSubmitted(true); }}
                className="space-y-4 text-xs"
              >
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-neutral-400 font-bold uppercase block">Your Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={hireForm.name} 
                    onChange={(e) => setHireForm({ ...hireForm, name: e.target.value })}
                    placeholder="Enter your name" 
                    className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-neutral-50/50 focus:bg-white text-xs text-neutral-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-neutral-400 font-bold uppercase block">Company Name</label>
                  <input 
                    type="text" 
                    required 
                    value={hireForm.company}
                    onChange={(e) => setHireForm({ ...hireForm, company: e.target.value })}
                    placeholder="e.g. Acme digital agencies" 
                    className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-neutral-50/50 focus:bg-white text-xs text-neutral-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-neutral-400 font-bold uppercase block">Discipline Required</label>
                  <select 
                    value={hireForm.roleNeeded}
                    onChange={(e) => setHireForm({ ...hireForm, roleNeeded: e.target.value })}
                    className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-neutral-50/55 text-xs text-neutral-800"
                  >
                    <option value="AI Automation">AI Automation Operations (Zapier, Python, Make)</option>
                    <option value="SEO">Technical SEO (Keyword Maps, Clusters)</option>
                    <option value="PPC">PPC Acquisition (Meta, Google, PPC Ad Sets)</option>
                    <option value="Growth Marketing">Growth Marketing Specialist</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-neutral-400 font-bold uppercase block">Core Scope Summary</label>
                  <textarea 
                    value={hireForm.message}
                    onChange={(e) => setHireForm({ ...hireForm, message: e.target.value })}
                    rows={3} 
                    placeholder="Stipend parameters, timelines, tool prerequisites..." 
                    className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-neutral-50/50 focus:bg-white text-xs text-neutral-800"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-neutral-950 hover:bg-neutral-900 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider cursor-pointer"
                >
                  Download Selected shortlists
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* DIALOG MODE: MODAL FOR TALENT COHORT    */}
      {/* ======================================= */}
      {isTalentModalOpen && (
        <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-neutral-200 max-w-lg w-full p-6 md:p-8 space-y-6 text-left relative shadow-2xl font-secondary">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/50">Fellowship Candidate Entry</span>
                <h3 className="font-display font-medium text-2xl text-neutral-950 mt-4 leading-none">Apply to Fellowship Track</h3>
                <p className="text-xs text-neutral-400 mt-1.5">Submit screening criteria to receive active diagnostics reviews.</p>
              </div>
              <button 
                onClick={() => { setIsTalentModalOpen(false); setTalentSubmitted(false); }}
                className="text-neutral-400 hover:text-neutral-850 p-1.5 rounded-lg hover:bg-neutral-100 transition cursor-pointer font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {talentSubmitted ? (
              <div className="p-8 text-center bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="font-bold text-neutral-950">Diagnostic Request Pending!</h4>
                <p className="text-xs text-neutral-600">Verification exams and background checks will be sent to your email destination within 15 minutes.</p>
                <button 
                  onClick={() => { setIsTalentModalOpen(false); setTalentSubmitted(false); }}
                  className="bg-neutral-950 hover:bg-neutral-900 text-white font-semibold py-2 px-4 rounded-xl text-xs cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form 
                onSubmit={(e) => { e.preventDefault(); setTalentSubmitted(true); }}
                className="space-y-4 text-xs"
              >
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-neutral-400 font-bold uppercase block">Your Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={talentForm.name} 
                    onChange={(e) => setTalentForm({ ...talentForm, name: e.target.value })}
                    placeholder="Enter your name" 
                    className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-neutral-50/50 focus:bg-white text-xs text-neutral-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-neutral-400 font-bold uppercase block">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    value={talentForm.email} 
                    onChange={(e) => setTalentForm({ ...talentForm, email: e.target.value })}
                    placeholder="you@cohort-agency.com" 
                    className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-neutral-50/50 focus:bg-white text-xs text-neutral-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-neutral-400 font-bold uppercase block">Placement Pathway Selected</label>
                  <select 
                    value={talentForm.track}
                    onChange={(e) => setTalentForm({ ...talentForm, track: e.target.value })}
                    className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-neutral-50/50 text-xs text-neutral-800"
                  >
                    <option value="Internship Track">Internship Track (Mentored Internship Placement)</option>
                    <option value="Professional Track">Professional Track (Immediate Agency Roster Matching)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-neutral-400 font-bold uppercase block">Key Proficiencies Accustomed with</label>
                  <input 
                    type="text" 
                    value={talentForm.skills}
                    onChange={(e) => setTalentForm({ ...talentForm, skills: e.target.value })}
                    placeholder="Zapier, Make, GA4, technical SEO audit tools, Keyword Map datasets, content clusters..." 
                    className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-neutral-50/50 focus:bg-white text-xs text-neutral-800"
                  />
                </div>

                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-150 inline-block font-secondary text-[11px] text-neutral-600 leading-relaxed">
                  📢 <strong>Note:</strong> Enrollment diagnostic checks are strictly vetted on coding guidelines and anti-cheat checks. Complete with attention to criteria specifications.
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-neutral-950 hover:bg-neutral-900 text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider cursor-pointer"
                >
                  Generate Vetting Diagnostic
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Structured Footer */}
      <Footer setCurrentPage={setCurrentPage} />

    </div>
  );
}
