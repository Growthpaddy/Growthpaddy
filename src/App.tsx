import { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
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
  Heart
} from 'lucide-react';

import { Header, Footer } from './components/HeaderAndFooter';
import TalentDirectory from './components/TalentDirectory';
import { HeroInteractivePipeline, FiveStepVisualizer } from './components/ProcessVisualizer';
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
    description: 'Recognized stars with outstanding references and professional recommendations directly provided by verified growth agency partners on the Verifolio ledger.',
    bgColor: 'bg-indigo-500/5',
    borderColor: 'border-indigo-500/20',
    textColor: 'text-indigo-700'
  },
  {
    id: 'b5',
    name: 'Top Performer',
    iconName: 'Award',
    tagline: 'The Top 5% Vetting Score',
    description: 'Elite candidates demonstrating flawless execution in advanced sandboxes, placing them in the highest tier of competence audits within our global ecosystem.',
    bgColor: 'bg-amber-500/5',
    borderColor: 'border-amber-500/20',
    textColor: 'text-amber-800'
  }
];

export default function App() {
  // Stats Animation logic
  const [stats, setStats] = useState({
    verifiedTalent: 0,
    internshipsCompleted: 0,
    employersHiring: 0,
    projectsDelivered: 0
  });

  useEffect(() => {
    const duration = 2000;
    const steps = 50;
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

  // Sandbox interactive simulator states (demonstrate Verifolio vetting logic dynamically)
  const [testStage, setTestStage] = useState<'idle' | 'testing' | 'verified'>('idle');
  const [testResultScore, setTestResultScore] = useState(0);
  const [sandboxCandidateName, setSandboxCandidateName] = useState('Alex Rivera');
  const [sandboxRole, setSandboxRole] = useState<'SEO' | 'AI Automation' | 'PPC'>('AI Automation');

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
    }, 100);
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

  return (
    <div className="min-h-screen bg-[#fafbfa] text-neutral-900 selection:bg-brand-primary/20 flex flex-col font-sans">
      
      {/* Dynamic Promo Banner */}
      <div className="bg-neutral-950 py-2 px-4 text-center text-xs text-neutral-300 font-medium flex items-center justify-center gap-1.5 flex-wrap">
        <span className="bg-emerald-500 text-neutral-950 font-mono font-bold px-1.5 py-0.5 rounded text-[10px]">NEW VERSION</span>
        <span>Every candidate is certified with cryptographic vetting logs on the live Ledger.</span>
        <a href="#how-it-works" className="text-white hover:text-brand-primary underline transition font-semibold ml-1">Explore our Vetting Standard →</a>
      </div>

      {/* Premium Navigation Header */}
      <Header />

      {/* MAIN CONTAINER */}
      <main className="flex-grow">
        
        {/* ======================================= */}
        {/* SECTION 1 — HERO                        */}
        {/* ======================================= */}
        <section className="relative pt-12 md:pt-20 pb-20 px-4 sm:px-6 lg:px-8 border-b border-neutral-100 overflow-hidden">
          {/* Subtle elegant background elements */}
          <div className="absolute right-0 top-0 w-1/3 h-1/2 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
          <div className="absolute -left-12 top-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto text-center space-y-12">
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-1.5 bg-brand-light px-3.5 py-1.5 rounded-full border border-brand-200/50 shadow-xs animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <p className="text-xs font-mono font-bold text-brand-dark uppercase tracking-widest">
                Where Verified Talent Meets Opportunity
              </p>
            </div>

            {/* Core Titles */}
            <div className="max-w-4xl mx-auto space-y-6">
              <h1 className="font-display font-medium text-4xl sm:text-5xl md:text-6xl text-neutral-950 tracking-tight leading-[1.05]">
                Hire Talent That Has Been{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 font-bold text-[#064e43]">Trained, Tested, and Verified</span>
                  <span className="absolute left-0 bottom-1.5 w-full h-[6px] bg-brand-200 -z-0 rounded-full" />
                </span>
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed font-normal">
                Discover internship-ready and employment-ready digital professionals who have completed rigorous training, passed competency assessments, and demonstrated practical capability.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#live-talent-directory"
                className="w-full sm:w-auto text-center bg-neutral-900 hover:bg-neutral-800 text-white font-semibold px-8 py-4 rounded-2xl text-sm flex items-center justify-center gap-2 transition duration-200 cursor-pointer shadow-md"
              >
                <span>Find Talent</span>
                <ChevronRight className="w-4 h-4 text-emerald-400" />
              </a>

              <a
                href="#choose-your-path"
                className="w-full sm:w-auto text-center bg-white hover:bg-neutral-100 text-neutral-800 font-semibold px-8 py-4 rounded-2xl text-sm border border-neutral-350 flex items-center justify-center gap-2 transition duration-200 cursor-pointer shadow-xs"
              >
                <span>Join As Talent</span>
                <ArrowUpRight className="w-4 h-4 text-neutral-400" />
              </a>
            </div>

            {/* Interactive Hero Illustration of the 5 Pillars */}
            <div className="max-w-5xl mx-auto pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-left border-b border-neutral-200/60 pb-3">
                  <div>
                    <span className="text-xs uppercase font-mono font-bold text-neutral-400">Verifolio System Blueprint</span>
                    <h3 className="font-display font-bold text-neutral-900 text-lg">Interactive Talent Placement Lifecycle</h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-sans">
                    <span>Scroll or Click Nodes to Inspect Vetting Pillar</span>
                  </div>
                </div>
                
                {/* Embedded custom interactive workflow diagram */}
                <HeroInteractivePipeline />
              </div>
            </div>

            {/* Quick trust metrics row */}
            <div className="pt-8 border-t border-neutral-100 flex flex-wrap justify-center items-center gap-x-12 gap-y-6 text-xs text-neutral-500">
              <span className="font-semibold uppercase tracking-wider text-neutral-400">Supported Placement Ecosystem Roles:</span>
              <span className="flex items-center gap-1.5 font-medium"><Check className="w-4 h-4 text-brand-primary" /> Technical SEO specialists</span>
              <span className="flex items-center gap-1.5 font-medium"><Check className="w-4 h-4 text-brand-primary" /> Growth Engineers</span>
              <span className="flex items-center gap-1.5 font-medium"><Check className="w-4 h-4 text-brand-primary" /> AI Automation Architects</span>
              <span className="flex items-center gap-1.5 font-medium"><Check className="w-4 h-4 text-brand-primary" /> PPC Marketers</span>
            </div>

          </div>
        </section>

        {/* ======================================= */}
        {/* SECTION 2 — THE PROBLEM                 */}
        {/* ======================================= */}
        <section id="the-problem" className="py-20 px-4 sm:px-6 lg:px-8 bg-neutral-950 text-white relative overflow-hidden">
          <div className="absolute left-0 bottom-0 w-1/4 h-1/2 bg-[linear-gradient(to_bottom,transparent,#042f20/30)] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto space-y-16">
            
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block">Structural Inefficiencies</span>
              <h2 className="font-display font-medium text-3xl sm:text-4.5xl tracking-tight">The Hiring Process Is Broken</h2>
              <p className="text-[#a4b4a6] text-sm sm:text-base max-w-2xl mx-auto">
                Traditional recruiting networks are plagued with unverified resume bloat, slow cycle times, and misaligned skills, creating costly mismatch problems for both recruiters and aspiring stars.
              </p>
            </div>

            {/* 3 Broken Pillar Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Card 1: Traditional Job Boards */}
              <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between text-left group hover:border-neutral-700 transition duration-300">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-red-500/10 text-red-400 rounded-2xl flex items-center justify-center">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-white">Traditional Job Boards</h3>
                  <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
                    Based entirely on unvalidated resumes. Open application filters lead to a flood of spam applicants, creating hundreds of hours of manual labor.
                  </p>
                </div>
                <ul className="mt-6 pt-6 border-t border-neutral-800 space-y-2 text-xs text-neutral-500">
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-400" /> Anyone can write profiles with no check</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-400" /> Zero verified practical metrics or skills</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-400" /> High attrition rate from misplaced hires</li>
                </ul>
              </div>

              {/* Card 2: Businesses */}
              <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between text-left group hover:border-neutral-700 transition duration-300">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-red-500/10 text-red-400 rounded-2xl flex items-center justify-center">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-white">Businesses</h3>
                  <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
                    Recruiters cannot easily identify actual capability. Sourcing is forced to pass through expensive headhunters or slow background check providers.
                  </p>
                </div>
                <ul className="mt-6 pt-6 border-t border-neutral-800 space-y-2 text-xs text-neutral-500">
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-400" /> Flood of unqualified cover letters</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-400" /> Extremely slow candidate selection delays</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-400" /> Lack of standardized vetting tests</li>
                </ul>
              </div>

              {/* Card 3: Talent */}
              <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between text-left group hover:border-neutral-700 transition duration-300">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-red-500/10 text-red-400 rounded-2xl flex items-center justify-center">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-white">Talent</h3>
                  <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
                    Highly trained and capable digital professionals struggle to find opportunities, hidden away in job board listing filters with no way to demonstrate real metrics.
                  </p>
                </div>
                <ul className="mt-6 pt-6 border-t border-neutral-800 space-y-2 text-xs text-neutral-500">
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-400" /> Low visibility in classic databases</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-400" /> Unfair reliance on school prestige</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-400" /> No direct, trusted channel to partners</li>
                </ul>
              </div>

            </div>

          </div>
        </section>

        {/* ======================================= */}
        {/* SECTION 3 — HOW VERIFOLIO WORKS         */}
        {/* ======================================= */}
        <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#f5f7f5]/40 border-b border-neutral-100 text-center relative">
          <div className="max-w-7xl mx-auto space-y-12">
            
            <div className="space-y-4 max-w-3xl mx-auto">
              <span className="text-xs font-mono font-bold text-brand-dark bg-brand-100 px-3 py-1 rounded-full uppercase tracking-widest inline-block">The Five Stages</span>
              <h2 className="font-display font-medium text-3xl sm:text-4.5xl text-neutral-950 tracking-tight">How Verifolio Works</h2>
              <p className="text-neutral-600 text-sm max-w-xl mx-auto font-normal">
                An airtight pipeline built for zero-error talent matching. Discover our strict vetting steps designed to save employers thousands of recruiting hours.
              </p>
            </div>

            {/* Dynamic Step visualizer component */}
            <FiveStepVisualizer />

          </div>
        </section>

        {/* ======================================= */}
        {/* INTERACTIVE COMPONENT: VETTING SIMULATOR */}
        {/* ======================================= */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-neutral-100">
          <div className="max-w-7xl mx-auto">
            <div className="bg-neutral-50 rounded-3xl border border-neutral-200/90 p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left">
              
              <div className="lg:col-span-5 space-y-6">
                <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 border-emerald-200 border text-xs font-mono px-3 py-1 rounded-full font-bold">
                  <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                  <span>Deno Vetting Terminal</span>
                </div>
                <h3 className="font-display font-bold text-2xl md:text-3xl text-neutral-900 leading-tight">
                  Simulate Our AI-Powered Vetting Audit
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  Verifolio doesn't trust resumes. Experience how we evaluate candidates in our simulation engine. Every audit evaluates syntax precision, delivery turnaround, and operational correctness.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex gap-2">
                    <label className="text-xs font-mono text-neutral-400 font-bold uppercase self-center">1. Pick Candidate Target Role:</label>
                    <div className="flex gap-1">
                      {(['AI Automation', 'SEO', 'PPC'] as const).map((r) => (
                        <button
                          key={r}
                          onClick={() => {
                            setSandboxRole(r);
                            setSandboxCandidateName(r === 'SEO' ? 'Amara Okafor' : r === 'PPC' ? 'Liam Vance' : 'Marcus Chen');
                            setTestStage('idle');
                          }}
                          className={`text-[10px] uppercase font-mono font-bold px-2 py-1 rounded border cursor-pointer transition ${
                            sandboxRole === r 
                              ? 'border-neutral-900 bg-neutral-900 text-white' 
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

              {/* Simulation Screen Wrapper */}
              <div className="lg:col-span-7 bg-neutral-950 text-neutral-200 rounded-2xl p-5 md:p-6 border-2 border-neutral-800 shadow-xl font-mono text-xs space-y-4">
                
                <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <span className="text-neutral-500 text-[10px]">VERIFOLIO-SANDBOX-v2.8.sh</span>
                  <span className="text-neutral-500 text-[10px]">Status: ONLINE</span>
                </div>

                <div className="space-y-2 font-mono leading-relaxed h-[180px] overflow-y-auto text-neutral-400 bg-neutral-950 p-2 rounded">
                  <p className="text-neutral-500"># Verifolio automated compiler initialized.</p>
                  <p className="text-neutral-300 flex items-center gap-1.5">
                    <span className="text-emerald-400">$</span> fetch --dossier --target="{sandboxCandidateName}" --role="{sandboxRole}"
                  </p>
                  
                  {testStage === 'idle' && (
                    <p className="text-amber-500 animate-pulse">✓ Ready to execute. Click "Evaluate Portfolio" below to begin real-time verification sequence.</p>
                  )}

                  {testStage === 'testing' && (
                    <div className="space-y-1">
                      <p className="text-blue-400 animate-pulse">⚡ Compiling local container... injecting {sandboxRole} test suites.</p>
                      <p className="text-neutral-400">⚡ Injecting credentials and background security check... STATUS: PASSED</p>
                      <p className="text-[#a4b4a6]">⚡ running AI analysis code logs (Score progress: {testResultScore}%)</p>
                      <div className="h-1 w-full bg-neutral-900 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 transition-all duration-100" 
                          style={{ width: `${testResultScore}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {testStage === 'verified' && (
                    <div className="space-y-1.5 text-neutral-300">
                      <p className="text-emerald-400">✓ VETTING VERIFICATION COMPLETED FOR {sandboxCandidateName.toUpperCase()}</p>
                      <p className="text-neutral-400">· Final Grading Score: <span className="text-white font-bold">{testResultScore} / 100</span> (Passed Threshold: 90)</p>
                      <p className="text-neutral-400">· Identity Audit Check: <span className="text-emerald-500">VERIFIED</span></p>
                      <p className="text-neutral-400">· Deliverable Integrity Code: <span className="text-emerald-500">SECURE-LEDGER-SIGNED</span></p>
                      <p className="text-emerald-400 font-bold bg-emerald-900/20 p-2 rounded inline-block mt-2">
                        ✓ Candidate status marked as: DIRECTLY INTERNSHIP-READY
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-neutral-900">
                  <div className="text-neutral-500 text-[10px] text-left">
                    Target Score Threshold: <span className="text-white font-semibold">90/100</span> to attain Verified Seal
                  </div>
                  
                  <button
                    onClick={runVettingSimulation}
                    disabled={testStage === 'testing'}
                    className={`px-4 py-2.5 rounded-xl uppercase tracking-wider font-bold text-xs flex items-center justify-center gap-1.5 w-full sm:w-auto transition cursor-pointer ${
                      testStage === 'testing'
                        ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                        : 'bg-[#10b981] hover:bg-emerald-600 text-neutral-950'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Evaluate Portfolio</span>
                  </button>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* ======================================= */}
        {/* SECTION 4 — CHOOSE YOUR PATH            */}
        {/* ======================================= */}
        <section id="choose-your-path" className="py-20 px-4 sm:px-6 lg:px-8 bg-white relative">
          <div className="max-w-7xl mx-auto space-y-16">
            
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-xs font-mono font-bold text-brand-dark uppercase tracking-widest block">Core Pathways</span>
              <h2 className="font-display font-medium text-3xl sm:text-4.5xl text-neutral-950 tracking-tight">Choose Your Track</h2>
              <p className="text-neutral-600 text-sm max-w-xl mx-auto">
                Verifolio services two distinct talent categories to match the growth velocity and operational standards of modern teams.
              </p>
            </div>

            {/* 2 Large Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
              
              {/* Card One: Internship Track */}
              <div className="bg-[#fafbfa] border-2 border-neutral-200 hover:border-neutral-900 p-8 md:p-10 rounded-3xl flex flex-col justify-between text-left transition-all duration-300 shadow-xs hover:shadow-md relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-lg pointer-events-none" />
                
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-1.5 uppercase font-mono text-[10px] font-bold bg-neutral-900 text-emerald-400 px-3 py-1 rounded-full">
                    <span>Aspiring Professionals</span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-display font-bold text-2xl text-neutral-950">Internship Track</h3>
                    <p className="text-neutral-500 text-sm leading-relaxed">
                      Perfect for aspiring digital professionals looking to gain practical experience and kickstart their commercial marketing or automation career.
                    </p>
                  </div>

                  {/* Feature Lists */}
                  <div className="space-y-3 pt-4 border-t border-neutral-100">
                    <span className="text-[10px] font-mono font-bold uppercase text-neutral-400 tracking-wider block">Key Deliverables:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { title: 'AI assessment', desc: 'Custom code/performance audit' },
                        { title: 'Internship matching', desc: 'With top-tier agency partners' },
                        { title: 'Skill development', desc: 'Expert mentors guidelines' },
                        { title: 'Portfolio building', desc: 'Chronicles actual deliverables' },
                        { title: 'Employer visibility', desc: 'Included in active directory list' }
                      ].map((feat, idx) => (
                        <div key={idx} className="space-y-0.5">
                          <div className="text-xs font-semibold text-neutral-900 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary flex-shrink-0" />
                            {feat.title}
                          </div>
                          <p className="text-[11px] text-neutral-500 pl-5">{feat.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-8">
                  <button 
                    onClick={() => {
                      setTalentForm(prev => ({ ...prev, track: 'Internship Track' }));
                      setIsTalentModalOpen(true);
                    }}
                    className="w-full text-center bg-white hover:bg-neutral-950 hover:text-white border border-neutral-900 text-neutral-900 font-bold py-3.5 px-6 rounded-2xl text-sm transition duration-200 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Explore Internship Opportunities</span>
                    <ArrowRight className="w-4 h-4 text-emerald-500" />
                  </button>
                </div>
              </div>

              {/* Card Two: Professional Track */}
              <div className="bg-[#fafbfa] border-2 border-neutral-200 hover:border-neutral-900 p-8 md:p-10 rounded-3xl flex flex-col justify-between text-left transition-all duration-300 shadow-xs hover:shadow-md relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-lg pointer-events-none" />
                
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-1.5 uppercase font-mono text-[10px] font-bold bg-[#10b981]/20 text-brand-dark px-3 py-1 rounded-full border border-[#10b981]/30">
                    <span>Immediate Employment Hiring</span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-display font-bold text-2xl text-neutral-950">Professional Track</h3>
                    <p className="text-neutral-500 text-sm leading-relaxed">
                      For certified commercial specialists seeking immediate full-time, part-time, freelance, or remote digital opportunities with established teams.
                    </p>
                  </div>

                  {/* Feature Lists */}
                  <div className="space-y-3 pt-4 border-t border-neutral-100">
                    <span className="text-[10px] font-mono font-bold uppercase text-neutral-400 tracking-wider block">Key Deliverables:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { title: 'Advanced assessment', desc: 'Enterprise scenario stress test' },
                        { title: 'Talent verification', desc: 'Secure KYC & references audit' },
                        { title: 'Portfolio showcase', desc: 'Interactive live analytics charts' },
                        { title: 'Employer discovery', desc: 'Direct direct match interface' },
                        { title: 'Career growth', desc: 'Transition pipeline to director' }
                      ].map((feat, idx) => (
                        <div key={idx} className="space-y-0.5">
                          <div className="text-xs font-semibold text-neutral-900 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                            {feat.title}
                          </div>
                          <p className="text-[11px] text-neutral-500 pl-5">{feat.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-8">
                  <button 
                    onClick={() => {
                      setTalentForm(prev => ({ ...prev, track: 'Professional Track' }));
                      setIsTalentModalOpen(true);
                    }}
                    className="w-full text-center bg-neutral-900 hover:bg-white hover:text-neutral-950 hover:border-neutral-900 text-white font-bold py-3.5 px-6 rounded-2xl text-sm transition duration-200 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Explore Professional Opportunities</span>
                    <ArrowRight className="w-4 h-4 text-emerald-400" />
                  </button>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ======================================= */}
        {/* SECTION 5 — WHY EMPLOYERS TRUST US      */}
        {/* ======================================= */}
        <section id="trust-badges" className="py-20 px-4 sm:px-6 lg:px-8 bg-neutral-50/50 border-y border-neutral-100 text-center relative">
          <div className="max-w-7xl mx-auto space-y-12">
            
            <div className="space-y-4 max-w-3xl mx-auto">
              <span className="text-xs font-mono font-bold text-brand-dark uppercase tracking-widest block">Strict Evaluation Protocol</span>
              <h2 className="font-display font-medium text-3xl sm:text-4.5xl text-neutral-950 tracking-tight">Every Listed Talent Has Been Evaluated</h2>
              <p className="text-neutral-600 text-sm max-w-xl mx-auto">
                No self-appointed claims or inflated resumes. We audit every single candidate across multiple tiers, appending specific quality badges containing encrypted performance data.
              </p>
            </div>

            {/* Interactive Badge List & Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto text-left">
              
              {/* Badges Stack Left */}
              <div className="lg:col-span-5 flex flex-col gap-3">
                {TRUST_BADGES.map((badge) => {
                  const isSelected = selectedBadgeId === badge.id;
                  return (
                    <button
                      key={badge.id}
                      onClick={() => setSelectedBadgeId(badge.id)}
                      className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all duration-350 cursor-pointer ${
                        isSelected 
                          ? 'bg-white border-neutral-950 shadow-md ring-1 ring-neutral-950/5' 
                          : 'bg-white border-neutral-200/50 hover:border-neutral-300 text-neutral-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border font-semibold ${badge.bgColor} ${badge.borderColor} ${badge.textColor}`}>
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-display font-semibold text-neutral-950 text-sm">{badge.name}</p>
                          <p className="text-[11px] text-neutral-400 mt-0.5">{badge.tagline}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-neutral-400" />
                    </button>
                  );
                })}
              </div>

              {/* Explainer Panel Right */}
              <div className="lg:col-span-7">
                <div className="bg-white border-2 border-neutral-900 rounded-3xl p-6 md:p-10 h-full flex flex-col justify-between space-y-6 shadow-md">
                  {TRUST_BADGES.map((badge) => {
                    if (badge.id !== selectedBadgeId) return null;
                    return (
                      <div key={badge.id} className="space-y-6 text-left flex flex-col justify-between h-full">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] uppercase font-mono text-neutral-400 font-bold">Standard Certification Protocol</span>
                          </div>
                          
                          <div className="space-y-1">
                            <h3 className="font-display font-bold text-3xl text-neutral-950 flex items-center gap-2">
                              {badge.name} 
                              <span className="text-xs bg-emerald-100 text-brand-dark px-2 py-0.5 rounded-md font-mono font-normal">Active Seal</span>
                            </h3>
                            <p className="text-emerald-700 font-mono text-xs font-semibold">{badge.tagline.toUpperCase()}</p>
                          </div>

                          <p className="text-sm text-neutral-600 leading-relaxed pt-2">
                            {badge.description}
                          </p>
                        </div>

                        {/* Audit check items */}
                        <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-3">
                          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block font-bold">Vetting Checklist Processed:</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              <span>Standard KYC Reference</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              <span>IP Anti-Cheat Exam Audit</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              <span>Live Mentor Performance Panel</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              <span>Output Ledger Cryptography Sync</span>
                            </div>
                          </div>
                        </div>

                        <a 
                          href="#live-talent-directory"
                          className="w-full text-center bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-3 rounded-2xl text-xs flex items-center justify-center gap-2"
                        >
                          <span>Filter Directory For {badge.name}s</span>
                          <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ======================================= */}
        {/* SECTION 6 — LIVE TALENT DIRECTORY PREVIEW*/}
        {/* ======================================= */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#fafbfa] border-b border-neutral-100">
          <div className="max-w-7xl mx-auto space-y-12">
            
            {/* Section Header */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
              <div className="space-y-4 text-left">
                <span className="text-xs font-mono font-bold text-brand-dark bg-brand-light border border-brand-200/50 px-3.5 py-1.5 rounded-full uppercase tracking-widest inline-block">Real-time Catalog</span>
                <h2 className="font-display font-medium text-3xl sm:text-4.5xl text-neutral-950 tracking-tight leading-none">
                  Live Talent Directory
                </h2>
                <p className="text-neutral-600 text-sm max-w-xl font-normal leading-relaxed">
                  Search, inspect, and connect directly with vetted internship and employment professionals. Click on a candidate to view their complete metric breakdown and Living Portfolio deliverables.
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-neutral-500 self-start md:self-end font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Ledger Synchronized with 8 Cohorts</span>
              </div>
            </div>

            {/* Imported directory component */}
            <TalentDirectory />

          </div>
        </section>

        {/* ======================================= */}
        {/* SECTION 7 — PORTFOLIO ECOSYSTEM         */}
        {/* ======================================= */}
        <section id="portfolio-ecosystem" className="py-20 px-4 sm:px-6 lg:px-8 bg-neutral-950 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/4 h-1/4 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />
          
          <div className="max-w-7xl mx-auto space-y-12">
            
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block">No Prior Experience Required</span>
              <h2 className="font-display font-medium text-3xl sm:text-4.5xl tracking-tight">Every Talent Builds a Living Portfolio</h2>
              <p className="text-neutral-400 text-sm max-w-xl mx-auto">
                Candidates do not need established portfolios before joining. The Verifolio platform enables them to construct a validated showcase naturally as they deliver items.
              </p>
            </div>

            {/* Living Portfolio visualizer blocks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
              
              <div className="bg-neutral-900 border border-neutral-800 p-6 sm:p-8 rounded-3xl text-left space-y-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                  01
                </div>
                <h4 className="font-display font-semibold text-lg text-white">Audited Class Deliverables</h4>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Every assignment resolved in the training sandbox is converted to an interactive code or operational block on the portfolio ledger, detailing speed analytics and errors audit logs.
                </p>
                <div className="pt-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">Includes: API sandboxes, Keyword maps, content clusters</span>
                </div>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-6 sm:p-8 rounded-3xl text-left space-y-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                  02
                </div>
                <h4 className="font-display font-semibold text-lg text-white">12-Week Managed Internships</h4>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  As candidates work with scale-up clients during guided internships, they capture real-time KPI data (such as user conversion, PPC savings, organic visits index) into their dashboard.
                </p>
                <div className="pt-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">Includes: Live Meta & Google ads accounts metrics, Klaviyo recovery logs</span>
                </div>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 p-6 sm:p-8 rounded-3xl text-left space-y-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                  03
                </div>
                <h4 className="font-display font-semibold text-lg text-white">Client References & Reviews</h4>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  Real employer sponsors review milestones and sign off on credentials. This generates a cryptographic validation block that employers can trace back directly on our platform.
                </p>
                <div className="pt-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">Includes: Vetted recommendations, performance reports, scorecard charts</span>
                </div>
              </div>

            </div>

            {/* Automated growth pipeline mock ui widget (vibe stripe/ deel style dashboard) */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 md:p-8 text-left max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="font-mono text-xs uppercase text-neutral-400">Verifolio Ledger Event Stream</span>
                </div>
                <span className="text-[10px] font-mono text-neutral-500">Updated seconds ago</span>
              </div>

              <div className="space-y-4 text-xs font-mono">
                <div className="flex items-start gap-4 p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                  <div className="bg-emerald-500/10 p-1.5 rounded-lg text-emerald-400 font-bold text-[10px]">COHORT #8</div>
                  <div className="space-y-1">
                    <p className="text-white font-semibold">Sarah Jenkins added custom automation deliverable to dossier</p>
                    <p className="text-neutral-500">"Zapier webhook setup routing 10,000 requests into Notion CRM" - impact verified via API test run (98%)</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                  <div className="bg-blue-500/10 p-1.5 rounded-lg text-blue-400 font-bold text-[10px]">INTERN PLACEMENT</div>
                  <div className="space-y-1">
                    <p className="text-white font-semibold">A Acme Analytics approved marketing performance audit</p>
                    <p className="text-neutral-500">Amara Okafor completed technical SEO directory implementation - organically index page grew traffic by +34%</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ======================================= */}
        {/* SECTION 8 — EMPLOYER SECTION            */}
        {/* ======================================= */}
        <section id="employer-features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-neutral-100 text-left">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-8">
              <div className="space-y-4">
                <span className="text-xs font-mono font-bold text-brand-dark bg-brand-light px-3 py-1 rounded-full uppercase tracking-widest inline-block">For Hiring Managers</span>
                <h2 className="font-display font-medium text-3.5xl sm:text-4.5xl text-neutral-950 tracking-tight leading-[1.1]">
                  Find Trusted Talent Without Guesswork
                </h2>
                <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
                  Stop looking through spam resume pipelines. Verifolio gives standard hiring teams access to vetted, trained, and tested digital executioners who are ready to make a commercial impact on day one.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-neutral-100">
                {[
                  { title: 'Verified candidates only', desc: 'No unverified or low-quality applicants' },
                  { title: 'Skills-based live search', desc: 'Query and sort by real tested scores' },
                  { title: 'Internship talent pool', desc: '12-week placements with metric tracking' },
                  { title: 'Professional talent pool', desc: 'Full-time specialists ready to execute' },
                  { title: 'Assessment records access', desc: 'Inspect code, writing, and strategic plans' },
                  { title: 'Portfolio visibility', desc: 'Living dossiers synchronized via ledger' }
                ].map((feat, idx) => (
                  <div key={idx} className="space-y-1 text-left">
                    <div className="font-semibold text-sm text-neutral-900 flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-brand-dark flex items-center justify-center font-bold text-xs">✓</div>
                      {feat.title}
                    </div>
                    <p className="text-xs text-neutral-500 pl-7">{feat.desc}</p>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setIsHireModalOpen(true)}
                  className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-850 text-white font-bold py-4 px-8 rounded-2xl text-sm transition duration-150 cursor-pointer shadow-md"
                >
                  <span>Start Sourcing Verified Candidates</span>
                  <ArrowRight className="w-4 h-4 text-emerald-400" />
                </button>
              </div>
            </div>

            {/* Visual preview representation of search panel */}
            <div className="lg:col-span-6 bg-[#f3faf5]/50 border border-brand-200/50 p-6 md:p-8 rounded-3xl relative overflow-hidden space-y-6">
              <div className="absolute right-0 top-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-xl pointer-events-none" />
              
              <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm space-y-4 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
                    <Search className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-xs text-neutral-400 uppercase tracking-widest font-mono">Talent Intelligence Panel</h5>
                    <p className="text-sm font-semibold text-neutral-800">Advanced Filter: 'AI Automation' + 'Score &gt; 94'</p>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="p-3 bg-neutral-50 rounded-xl flex items-center justify-between border border-neutral-100">
                    <div className="flex items-center gap-3">
                      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150" alt="Marcus" className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <p className="text-xs font-bold text-neutral-950">Marcus Chen</p>
                        <p className="text-[10px] text-neutral-400">AI Automation Operations</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">99 Grade</span>
                  </div>

                  <div className="p-3 bg-neutral-50 rounded-xl flex items-center justify-between border border-neutral-100 opacity-80">
                    <div className="flex items-center gap-3">
                      <img src="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150" alt="Jordan" className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <p className="text-xs font-bold text-neutral-950">Jordan Miller</p>
                        <p className="text-[10px] text-neutral-400">AI Workflows Developer</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">95 Grade</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white/70 rounded-2xl border border-neutral-200 text-xs text-neutral-600 leading-relaxed text-left">
                ⚡ <strong>Smart Hiring Metric:</strong> Sourcing managers report a 4x drop in interview times and a 94% retention rate on candidates placed from our verified pool.
              </div>
            </div>

          </div>
        </section>

        {/* ======================================= */}
        {/* SECTION 9 — TALENT SECTION              */}
        {/* ======================================= */}
        <section id="join-network-talent" className="py-20 px-4 sm:px-6 lg:px-8 bg-neutral-950 text-white relative">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Visual Left Showcase */}
            <div className="lg:col-span-5 bg-neutral-900 border border-neutral-800 p-6 sm:p-8 rounded-3xl space-y-6 text-left">
              <span className="text-[10px] uppercase tracking-widest font-mono bg-[#10b981]/20 text-[#10b981] px-2.5 py-1 rounded">
                Fellowship Sandbox Veto
              </span>
              
              <div className="space-y-4">
                <h4 className="font-display font-medium text-lg text-white">How Candidates Enter:</h4>
                <div className="space-y-3 font-mono text-xs text-neutral-400">
                  <div className="flex items-start gap-2.5">
                    <span className="text-[#10b981] font-bold">01.</span>
                    <p>Apply for specialized fellowship.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-[#10b981] font-bold">02.</span>
                    <p>Initiate robust technical diagnostic audits.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-[#10b981] font-bold">03.</span>
                    <p>Get processed through verification checks.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-[#10b981] font-bold">04.</span>
                    <p>Fulfill supervised mock/live client tasks.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-[#10b981] font-bold">05.</span>
                    <p>Dossier published on the live discovery directory.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Text Right Details */}
            <div className="lg:col-span-7 space-y-8 text-left">
              <div className="space-y-4">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block">For Digital Professionals</span>
                <h2 className="font-display font-medium text-3.5xl sm:text-4.5xl text-white tracking-tight leading-[1.1]">
                  Turn Your Active Learning Into True Opportunity
                </h2>
                <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
                  Stop applying to sterile resume portals. On Verifolio, your performance, exams diagnostic reports, and supervised milestones speak for you. Gain direct pathway to internship, references, and immediate hires.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">✓</div>
                  <p className="text-sm font-semibold text-white">100% Free for approved candidates selected to fellowship tracks.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">✓</div>
                  <p className="text-sm font-semibold text-white">Guaranteed mentor auditing feedback and score reports.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">✓</div>
                  <p className="text-sm font-semibold text-white">Continuous ledger records tracking your metric milestones.</p>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setIsTalentModalOpen(true)}
                  className="bg-white hover:bg-neutral-100 text-neutral-900 font-bold py-4 px-8 rounded-2xl text-sm transition duration-150 cursor-pointer flex items-center gap-2"
                >
                  <span>Apply to Fellowship Track</span>
                  <ArrowRight className="w-4 h-4 text-emerald-500" />
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* ======================================= */}
        {/* SECTION 10 — TRUST & STATS              */}
        {/* ======================================= */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#fafbfa] border-b border-neutral-100">
          <div className="max-w-7xl mx-auto">
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 text-center max-w-4xl mx-auto">
              
              <div className="p-4 space-y-1.5 border-r border-neutral-200 last:border-0">
                <p className="font-display font-bold text-3xl sm:text-4xl text-neutral-950">
                  {stats.verifiedTalent.toLocaleString()}+
                </p>
                <div className="text-xs font-mono font-medium text-neutral-400 tracking-wider uppercase">Verified Talent</div>
                <div className="text-[10px] text-emerald-600">Active Dossiers</div>
              </div>

              <div className="p-4 space-y-1.5 border-r border-neutral-200 last:border-0">
                <p className="font-display font-bold text-3xl sm:text-4xl text-neutral-950">
                  {stats.internshipsCompleted.toLocaleString()}+
                </p>
                <div className="text-xs font-mono font-medium text-neutral-400 tracking-wider uppercase">Internships Completed</div>
                <div className="text-[10px] text-emerald-600">100% Placed</div>
              </div>

              <div className="p-4 space-y-1.5 border-r border-neutral-200 last:border-0">
                <p className="font-display font-bold text-3xl sm:text-4xl text-neutral-950">
                  {stats.employersHiring.toLocaleString()}+
                </p>
                <div className="text-xs font-mono font-medium text-neutral-400 tracking-wider uppercase">Employers Sourcing</div>
                <div className="text-[10px] text-emerald-600">Active Partners</div>
              </div>

              <div className="p-4 space-y-1.5 last:border-0">
                <p className="font-display font-bold text-3xl sm:text-4xl text-neutral-950">
                  {stats.projectsDelivered.toLocaleString()}+
                </p>
                <div className="text-xs font-mono font-medium text-neutral-400 tracking-wider uppercase">Projects Delivered</div>
                <div className="text-[10px] text-emerald-600">Real Metric Outcomes</div>
              </div>

            </div>

          </div>
        </section>

        {/* ======================================= */}
        {/* SECTION 11 — FINAL CTA                  */}
        {/* ======================================= */}
        <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-neutral-950 text-white relative text-center overflow-hidden">
          {/* Subtle decoration elements */}
          <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(to_bottom,transparent,rgba(16,185,129,0.03))]" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-4xl mx-auto space-y-10 relative z-10">
            
            <div className="space-y-4">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block">Verifolio Talent Network</span>
              <h2 className="font-display font-semibold text-3.5xl sm:text-5xl md:text-5.5xl text-white tracking-tight leading-[1.1]">
                The Future of Hiring Starts With Verification
              </h2>
              <p className="text-neutral-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                Join a premium digital talent ecosystem designed around verified capability, trusted practical metrics, and zero placement guesswork.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setIsHireModalOpen(true)}
                className="w-full sm:w-auto text-center bg-[#10b981] hover:bg-emerald-500 text-neutral-950 font-bold px-8 py-4 rounded-2xl text-sm flex items-center justify-center gap-2 transition duration-200 cursor-pointer shadow-md"
              >
                <span>Find Talent</span>
                <ChevronRight className="w-4 h-4 text-emerald-950" />
              </button>

              <button
                onClick={() => setIsTalentModalOpen(true)}
                className="w-full sm:w-auto text-center bg-neutral-900 hover:bg-neutral-800 text-white font-bold px-8 py-4 rounded-2xl text-sm border border-neutral-800 flex items-center justify-center gap-2 transition duration-200 cursor-pointer shadow-xs"
              >
                <span>Join As Talent</span>
                <ArrowUpRight className="w-4 h-4 text-neutral-400" />
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
          <div className="bg-white rounded-3xl border-2 border-neutral-900 max-w-lg w-full p-6 md:p-8 space-y-6 text-left relative shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">Employer Sourcing</span>
                <h3 className="font-display font-bold text-2xl text-neutral-900 mt-3">Start Sourcing Talent</h3>
                <p className="text-xs text-neutral-500 mt-1">Tell us which verified discipline your team requires immediately.</p>
              </div>
              <button 
                onClick={() => { setIsHireModalOpen(false); setHireSubmitted(false); }}
                className="text-neutral-400 hover:text-neutral-800 p-1 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {hireSubmitted ? (
              <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-100 space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="font-bold text-neutral-900">Request Received Successfully!</h4>
                <p className="text-xs text-neutral-600">Our Talent Intelligence Lead is compiling matching sandboxes logs and will schedule a demo with your team inside 2 hours.</p>
                <button 
                  onClick={() => { setIsHireModalOpen(false); setHireSubmitted(false); }}
                  className="bg-neutral-900 text-white font-medium py-2 px-4 rounded-xl text-xs"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form 
                onSubmit={(e) => { e.preventDefault(); setHireSubmitted(true); }}
                className="space-y-4 text-sm"
              >
                <div className="space-y-1">
                  <label className="text-xs font-mono text-neutral-500 font-bold uppercase block">Your Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={hireForm.name} 
                    onChange={(e) => setHireForm({ ...hireForm, name: e.target.value })}
                    placeholder="Enter your name" 
                    className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-neutral-500 font-bold uppercase block">Company / Agency Name</label>
                  <input 
                    type="text" 
                    required 
                    value={hireForm.company}
                    onChange={(e) => setHireForm({ ...hireForm, company: e.target.value })}
                    placeholder="e.g. Acme Agency" 
                    className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-neutral-500 font-bold uppercase block">Requirement Specialization</label>
                  <select 
                    value={hireForm.roleNeeded}
                    onChange={(e) => setHireForm({ ...hireForm, roleNeeded: e.target.value })}
                    className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary bg-white"
                  >
                    <option value="AI Automation">AI Automation Operations Archive</option>
                    <option value="SEO">Technical SEO Strategist</option>
                    <option value="PPC">PPC Acquisition Expert</option>
                    <option value="Growth Marketing">Growth Marketing Specialist</option>
                    <option value="Social Media">Social Brand Builder</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-neutral-500 font-bold uppercase block">Core Role Description</label>
                  <textarea 
                    value={hireForm.message}
                    onChange={(e) => setHireForm({ ...hireForm, message: e.target.value })}
                    rows={3} 
                    placeholder="Describe budget, stipend or immediate permanent hires indicators..." 
                    className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-[#111311] hover:bg-neutral-800 text-white font-bold py-3 px-4 rounded-xl text-xs transition uppercase tracking-wider"
                >
                  Generate Shortlist Now
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
          <div className="bg-white rounded-3xl border-2 border-neutral-900 max-w-lg w-full p-6 md:p-8 space-y-6 text-left relative shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-[#10b981] bg-emerald-50 px-2.5 py-1 rounded-md">Talent Fellowship Entry</span>
                <h3 className="font-display font-bold text-2xl text-neutral-900 mt-3">Apply to fellowship</h3>
                <p className="text-xs text-neutral-500 mt-1">Get audited, verified, placed, and discovered by leading agency sponsors.</p>
              </div>
              <button 
                onClick={() => { setIsTalentModalOpen(false); setTalentSubmitted(false); }}
                className="text-neutral-400 hover:text-neutral-800 p-1 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {talentSubmitted ? (
              <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-100 space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="font-bold text-neutral-900">Fellowship Diagnostic Registered!</h4>
                <p className="text-xs text-neutral-600">We have sent the initial diagnostic screening test link to your email setup. Complete it inside 48 hours to secure review.</p>
                <button 
                  onClick={() => { setIsTalentModalOpen(false); setTalentSubmitted(false); }}
                  className="bg-neutral-900 text-white font-medium py-2 px-4 rounded-xl text-xs"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form 
                onSubmit={(e) => { e.preventDefault(); setTalentSubmitted(true); }}
                className="space-y-4 text-sm"
              >
                <div className="space-y-1">
                  <label className="text-xs font-mono text-neutral-500 font-bold uppercase block">Your Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={talentForm.name} 
                    onChange={(e) => setTalentForm({ ...talentForm, name: e.target.value })}
                    placeholder="Enter your name" 
                    className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-neutral-500 font-bold uppercase block">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    value={talentForm.email} 
                    onChange={(e) => setTalentForm({ ...talentForm, email: e.target.value })}
                    placeholder="you@example.com" 
                    className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-neutral-500 font-bold uppercase block">Target Fellowship Track</label>
                  <select 
                    value={talentForm.track}
                    onChange={(e) => setTalentForm({ ...talentForm, track: e.target.value })}
                    className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-1"
                  >
                    <option value="Internship Track">Internship Track (Aspiring Star)</option>
                    <option value="Professional Track">Professional Track (Certified Specialist)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-neutral-500 font-bold uppercase block">Core Skills / Tools You Are Acquainted With</label>
                  <input 
                    type="text" 
                    value={talentForm.skills}
                    onChange={(e) => setTalentForm({ ...talentForm, skills: e.target.value })}
                    placeholder="SEO, GA4, Make.com, Zapier, Python..." 
                    className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1"
                  />
                </div>

                <div className="text-[11px] text-neutral-500 leading-relaxed bg-[#f3faf5] p-3 rounded-xl border border-[#d5f2e0]">
                  📌 Our cohorts launch on a rolling 14-day window. Background checks and identification proofs (KYC) are requested upon screen pass indicator.
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-[#111311] hover:bg-neutral-800 text-white font-bold py-3.5 px-4 rounded-xl text-xs transition uppercase tracking-wider"
                >
                  Generate Screening Test
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Structured Footer */}
      <Footer />

    </div>
  );
}
