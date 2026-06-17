import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Search, 
  Zap, 
  Briefcase, 
  ChevronRight,
  TrendingUp,
  Award,
  Users,
  Lock,
  ArrowUpRight,
  UserCheck,
  AlertTriangle,
  Scale
} from 'lucide-react';

interface HomeOverviewProps {
  navigateToPage: (page: 'home' | 'directory' | 'employer' | 'talent' | 'assessment' | 'pricing') => void;
  openHireModal: () => void;
  openTalentModal: () => void;
}

export default function HomeOverview({ navigateToPage, openHireModal, openTalentModal }: HomeOverviewProps) {
  // Alternating Hero image state
  const [heroImageIndex, setHeroImageIndex] = useState(0);

  // Stats Counters
  const [stats, setStats] = useState({
    verifiedTalent: 3420,
    employersRegistered: 810,
    portfoliosCreated: 5120,
    successfulConnections: 92
  });

  useEffect(() => {
    // Alternate hero images every 5 seconds
    const imageInterval = setInterval(() => {
      setHeroImageIndex((prev) => (prev === 0 ? 1 : 0));
    }, 5000);

    // Minor stats ticking for live feel
    const statInterval = setInterval(() => {
      setStats(prev => ({
        verifiedTalent: prev.verifiedTalent + (Math.random() > 0.7 ? 1 : 0),
        employersRegistered: prev.employersRegistered + (Math.random() > 0.9 ? 1 : 0),
        portfoliosCreated: prev.portfoliosCreated + (Math.random() > 0.8 ? 1 : 0),
        successfulConnections: 94
      }));
    }, 8500);

    return () => {
      clearInterval(imageInterval);
      clearInterval(statInterval);
    };
  }, []);

  const regeneratedHeroImage = '/src/assets/images/regenerated_image_1781655390414.jpg';
  const HERO_IMAGES = [
    {
      url: regeneratedHeroImage,
      caption: 'Sourcing with objective data-backed talent portfolios',
      label: 'Verified Direct Talent'
    },
    {
      url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=800',
      caption: 'Expert digital operations specialist proving competence',
      label: 'Execution is the Proof'
    }
  ];

  return (
    <div className="space-y-20 bg-[#fafbfc] pb-16">
      
      {/* 1. HERO SECTION (Clear, Urgent Value Proposition) */}
      <section className="relative pt-12 md:pt-20 pb-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-neutral-900/10 overflow-hidden text-left animate-fadeIn">
        {/* Subtle grid backing */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          
          {/* Left Column (Clarity and core pain-solving statement) */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="inline-flex items-center gap-2 bg-neutral-950 px-3 py-1.5 rounded-none border-l-4 border-emerald-500">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">
                VETTED AFRICAN DIGITAL OPERATORS
              </span>
            </div>

            <h1 className="font-display font-black text-4xl sm:text-6xl text-neutral-950 uppercase tracking-tight leading-[1.05]">
              HIRE ACTIVE PROOF, <br />
              <span className="text-emerald-700">NOT FABRICATED RESUMES.</span>
            </h1>

            <p className="text-sm sm:text-base text-neutral-700 font-bold max-w-xl uppercase tracking-wider leading-relaxed border-l-2 border-neutral-300 pl-4">
              Stop filtering through bloated CVs. DSP Talent Hub provides instant access to pre-vetted digital specialists possessing verified skill scores, real projects, and audited case studies.
            </p>

            {/* Crucial Value indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
              <div className="border-2 border-neutral-950 bg-neutral-50 p-3 text-left">
                <span className="text-xs font-mono font-black text-emerald-800 block">0% ASSIST FEES</span>
                <p className="text-[10px] uppercase text-neutral-500 mt-1 font-bold">Hire directly. No bloated agency commissions.</p>
              </div>
              <div className="border-2 border-neutral-950 bg-neutral-50 p-3 text-left">
                <span className="text-xs font-mono font-black text-emerald-800 block">100% AUDITED</span>
                <p className="text-[10px] uppercase text-neutral-500 mt-1 font-bold">Candidates pass scenario audits before being listed.</p>
              </div>
              <div className="border-2 border-neutral-950 bg-neutral-50 p-3 text-left">
                <span className="text-xs font-mono font-black text-emerald-800 block">IMMEDIATE START</span>
                <p className="text-[10px] uppercase text-neutral-500 mt-1 font-bold">Fast-onboarding remote operators available now.</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-3">
              <button
                onClick={() => navigateToPage('directory')}
                className="bg-neutral-950 hover:bg-neutral-900 text-white font-black py-4 px-6 rounded-none text-xs uppercase tracking-widest border-2 border-neutral-950 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_0px_rgba(16,185,129,1)]"
              >
                <span>BROWSE VERIFIED TALENT</span>
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </button>

              <button
                onClick={() => navigateToPage('talent')}
                className="bg-white hover:bg-neutral-50 border-2 border-neutral-950 text-neutral-950 font-black py-4 px-6 rounded-none text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>GET VERIFIED AS TALENT</span>
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
              </button>
            </div>

          </div>

          {/* Right Column (Minimal Clean Photo Frame) */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            
            <div className="w-full max-w-sm bg-neutral-950 p-2 rounded-none border-4 border-neutral-950 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
              <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={heroImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0"
                  >
                    <img 
                      src={HERO_IMAGES[heroImageIndex].url}
                      alt={HERO_IMAGES[heroImageIndex].caption}
                      className="w-full h-full object-cover grayscale transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-neutral-950/40" />
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="bg-neutral-950 p-3 text-left">
                <span className="font-mono text-[10px] uppercase font-bold text-emerald-400">
                  {HERO_IMAGES[heroImageIndex].label}
                </span>
                <p className="text-[9px] text-neutral-400 uppercase font-mono mt-0.5">{HERO_IMAGES[heroImageIndex].caption}</p>
              </div>
            </div>

            {/* Floating Trust Indicator */}
            <div className="absolute -top-3 -right-3 bg-emerald-600 border-2 border-neutral-950 text-white rounded-none py-1.5 px-3 z-20 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-950" />
              <span className="font-mono text-[9px] uppercase font-black tracking-wider text-white">SKILLS SECURED</span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. THE VALUE & LOSS ASSESSMENT SECTION (What they lose vs what they gain) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        
        <div className="bg-neutral-950 text-white rounded-none p-6 sm:p-10 border-4 border-neutral-950 shadow-[6px_6px_0px_0px_rgba(16,185,129,1)] text-left space-y-8">
          
          <div className="border-b border-neutral-800 pb-5">
            <span className="text-[10px] uppercase font-mono text-emerald-400 font-extrabold tracking-widest block">COST / VALUE ASSESSMENT</span>
            <h2 className="font-display font-black text-2xl sm:text-4xl text-white uppercase tracking-tight mt-1">
              THE TRUE COST OF FAILING TO ADAPT YOUR HIRING
            </h2>
            <p className="text-xs text-neutral-400 uppercase tracking-widest font-bold mt-1 max-w-2xl leading-relaxed">
              Standard resume platforms lead to severe hiring waste. Transition to a proof-first network to shield your organization from bad placements.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            
            {/* The Losses Box (Traditional Recruiting) */}
            <div className="bg-neutral-900 border-2 border-red-900 p-6 sm:p-8 rounded-none space-y-6">
              <div className="flex items-center gap-2 text-rose-500">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <h3 className="font-display font-black text-base uppercase tracking-tight">VULNERABILITIES OF TYPICAL RECRUITMENT</h3>
              </div>
              <p className="text-xs text-neutral-300 font-bold uppercase tracking-wider">What your business is losing daily by using standard job boards:</p>
              
              <ul className="space-y-4 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                <li className="flex items-start gap-3">
                  <span className="text-rose-500 font-bold font-mono text-xs mt-0.5">➔</span>
                  <div>
                    <strong className="text-white block font-black">40+ Hours Wasted Per Role:</strong> 
                    Filtering through hundreds of generic CVs with exaggerated skills and no real evidence.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-500 font-bold font-mono text-xs mt-0.5">➔</span>
                  <div>
                    <strong className="text-white block font-black">$15,000 Average Loss per Bad Hire:</strong> 
                    Onboarding individuals who look stellar on paper but struggle to set up basic tracking or automations.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-rose-500 font-bold font-mono text-xs mt-0.5">➔</span>
                  <div>
                    <strong className="text-white block font-black">Missed Direct Access:</strong> 
                    Middleman agencies take up to 20% of annual salaries, locking you out of direct, fast relationship structures.
                  </div>
                </li>
              </ul>
            </div>

            {/* The Gains Box (DSP Talent Hub Solution) */}
            <div className="bg-neutral-900 border-2 border-emerald-950 p-6 sm:p-8 rounded-none space-y-6">
              <div className="flex items-center gap-2 text-emerald-400">
                <Scale className="w-5 h-5 flex-shrink-0" />
                <h3 className="font-display font-black text-base uppercase tracking-tight">THE DSP EVIDENCE PROTECTION ADVANTAGE</h3>
              </div>
              <p className="text-xs text-neutral-300 font-bold uppercase tracking-wider">What your business gains instantly by using our platform:</p>

              <ul className="space-y-4 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 font-bold font-mono text-xs mt-0.5">➔</span>
                  <div>
                    <strong className="text-white block font-black">Vetted Competence Scores:</strong> 
                    Candidates take rigorous workflow assessments on tools like Zapier, Make, GA4 prior to directory listing.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 font-bold font-mono text-xs mt-0.5">➔</span>
                  <div>
                    <strong className="text-white block font-black">Audited Evidence Case Files:</strong> 
                    Every candidate features verified, objective metrics directly, representing high-intent problem solvers.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 font-bold font-mono text-xs mt-0.5">➔</span>
                  <div>
                    <strong className="text-white block font-black">Direct Commission-Free Hires:</strong> 
                    Utilize transparent pay-as-you-go slots to acquire full direct lines and coordinate immediately. Saves up to $10,000+ per hire.
                  </div>
                </li>
              </ul>
            </div>

          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-neutral-800">
            <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold">
              ⚡ READY TO SHIELD YOUR VALUE? ACCESS OUR NETWORK IN A FEW CLICK STEPS.
            </p>
            <button
              onClick={() => navigateToPage('directory')}
              className="bg-emerald-400 hover:bg-emerald-500 text-neutral-950 text-xs font-black py-2.5 px-5 rounded-none uppercase tracking-widest transition cursor-pointer"
            >
              Audited Directory Catalog
            </button>
          </div>

        </div>

      </section>

      {/* 3. PLATFORM FLOW CHART (Minimalist Blueprint & Action Guides) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        
        <div className="text-left space-y-4 mb-10 border-l-4 border-neutral-900 pl-6">
          <span className="text-[11px] uppercase font-mono font-bold text-emerald-700 tracking-widest block">
            HOW IT OPERATES (MINIMALIST FLOW)
          </span>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-neutral-950 uppercase tracking-tight">
            NO COMPLEX SYSTEMS. PURE EVIDENCE.
          </h2>
          <p className="text-xs font-bold text-neutral-500 max-w-lg uppercase tracking-wider">
            Our straightforward ecosystem serves both employers and creators efficiently.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Employers Column */}
          <div className="bg-white border-2 border-neutral-950 p-6 sm:p-8 rounded-none text-left flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-700" />
                <h3 className="font-display font-black text-xl text-neutral-950 uppercase">1. FOR INCOMING EMPLOYERS</h3>
              </div>
              <p className="text-xs uppercase text-neutral-500 tracking-wider font-semibold leading-relaxed">
                Find exactly who you need, inspect their actual project metrics, write team feedback logs, and match direct-to-hire easily.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-2 text-xs font-bold uppercase tracking-wider text-neutral-700">
                  <span className="font-mono text-emerald-700 font-black">▸ Step 01:</span>
                  <span>Browse profiles sorted by real tool execution competencies.</span>
                </div>
                <div className="flex items-start gap-2 text-xs font-bold uppercase tracking-wider text-neutral-700">
                  <span className="font-mono text-emerald-700 font-black">▸ Step 02:</span>
                  <span>Audit candidate case studies, results, and recommendations.</span>
                </div>
                <div className="flex items-start gap-2 text-xs font-bold uppercase tracking-wider text-neutral-700">
                  <span className="font-mono text-emerald-700 font-black">▸ Step 03:</span>
                  <span>Grab Sourcing Slots to instantly unlock verified direct contact lines.</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigateToPage('directory')}
              className="mt-6 w-full text-center py-3 bg-neutral-950 hover:bg-neutral-900 font-black text-white text-xs uppercase tracking-wider rounded-none"
            >
              BROWSE SIFTING CONSOLE
            </button>
          </div>

          {/* Creators / Talent Column */}
          <div className="bg-white border-2 border-neutral-950 p-6 sm:p-8 rounded-none text-left flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(4,120,87,1)]">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-700" />
                <h3 className="font-display font-black text-xl text-neutral-950 uppercase">2. FOR DIGITAL CREATORS</h3>
              </div>
              <p className="text-xs uppercase text-neutral-500 tracking-wider font-semibold leading-relaxed">
                Stand out immediately to global hiring companies. Stop getting ghosted in generic job boards. Let your proof speak.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-2 text-xs font-bold uppercase tracking-wider text-neutral-700">
                  <span className="font-mono text-emerald-800 font-black">▸ Step 01:</span>
                  <span>Register and test your skills in our assessment sandbox.</span>
                </div>
                <div className="flex items-start gap-2 text-xs font-bold uppercase tracking-wider text-neutral-700">
                  <span className="font-mono text-emerald-800 font-black">▸ Step 02:</span>
                  <span>Obtain a Verification Pass to lock your certified project files.</span>
                </div>
                <div className="flex items-start gap-2 text-xs font-bold uppercase tracking-wider text-neutral-700">
                  <span className="font-mono text-emerald-800 font-black">▸ Step 03:</span>
                  <span>We feature you globally to high-budget remote agencies.</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigateToPage('talent')}
              className="mt-6 w-full text-center py-3 bg-emerald-700 hover:bg-emerald-850 font-black text-white text-xs uppercase tracking-wider rounded-none"
            >
              BUILD PROOF PORTFOLIO
            </button>
          </div>

        </div>

      </section>

      {/* 4. KEY CAPABILITIES (Minimalist Bento Highlights) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        
        <div className="text-left space-y-2 mb-8 border-l-4 border-emerald-600 pl-6">
          <span className="text-[10px] uppercase font-mono font-bold text-neutral-500 tracking-widest block">SYSTEM CORE</span>
          <h3 className="font-display font-black text-2xl uppercase text-neutral-955 tracking-tight">PLATFORM PARAMETERS</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          <div className="bg-white border-2 border-neutral-950 p-5 text-left rounded-none">
            <Zap className="w-5 h-5 text-emerald-600 mb-2" />
            <h4 className="font-display font-black text-xs uppercase text-neutral-950">Vetting Assessments</h4>
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold mt-1">
              Multiple-choice scenario challenges mapping practical parameters on tools like Zapier, Make, and Ahrefs.
            </p>
          </div>

          <div className="bg-white border-2 border-neutral-950 p-5 text-left rounded-none">
            <Award className="w-5 h-5 text-emerald-600 mb-2" />
            <h4 className="font-display font-black text-xs uppercase text-neutral-950">Objective Portfolios</h4>
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold mt-1">
              Case study metrics are certified by program partners to safeguard absolute compliance.
            </p>
          </div>

          <div className="bg-white border-2 border-neutral-950 p-5 text-left rounded-none">
            <Search className="w-5 h-5 text-emerald-600 mb-2" />
            <h4 className="font-display font-black text-xs uppercase text-neutral-950">Direct Connection</h4>
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold mt-1">
              Commitment-based sourcing slots replace tedious middleman conversations. Reach creators in 1 click.
            </p>
          </div>

        </div>

      </section>

      {/* 5. LIVE NETWORK METRICS (Dynamic counters) */}
      <section className="bg-white py-10 border-t-2 border-b-2 border-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            
            <div className="space-y-1">
              <p className="text-3xl sm:text-5xl font-black font-display text-emerald-700 tracking-tight leading-none">
                {stats.verifiedTalent.toLocaleString()}+
              </p>
              <p className="text-[9px] font-black text-neutral-900 uppercase tracking-widest font-mono mt-1">
                VETTED CREATORS REGISTERED
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-3xl sm:text-5xl font-black font-display text-neutral-950 tracking-tight leading-none">
                {stats.employersRegistered.toLocaleString()}+
              </p>
              <p className="text-[9px] font-black text-neutral-900 uppercase tracking-widest font-mono mt-1">
                COMPANIES SOURCING ACTIVE
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-3xl sm:text-5xl font-black font-display text-neutral-950 tracking-tight leading-none">
                {stats.portfoliosCreated.toLocaleString()}+
              </p>
              <p className="text-[9px] font-black text-neutral-900 uppercase tracking-widest font-mono mt-1">
                CASE CERTIFICATIONS APPROVED
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-3xl sm:text-5xl font-black font-display text-emerald-800 tracking-tight leading-none">
                {stats.successfulConnections}%
              </p>
              <p className="text-[9px] font-black text-neutral-900 uppercase tracking-widest font-mono mt-1">
                HIRING SUCCESS SCORE
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 6. IMMERSIVE OUTCOMES CTA BOX */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
        <div className="bg-neutral-950 text-white rounded-none border-4 border-neutral-950 p-8 sm:p-12 text-center space-y-5 relative overflow-hidden shadow-[6px_6px_0px_0px_rgba(16,185,129,1)]">
          
          <h3 className="font-display font-black text-2xl sm:text-4xl text-white uppercase tracking-tight leading-none">
            READY TO OUTSOURCE THE RECRUITMENT BOTTLENECK?
          </h3>
          
          <p className="text-neutral-400 text-xs max-w-md mx-auto uppercase tracking-wider font-bold leading-relaxed">
            Protect your growth timeline. Connect directly with highly skilled digital specialists who have proven their competence.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-3">
            <button 
              onClick={() => navigateToPage('directory')} 
              className="bg-emerald-400 hover:bg-emerald-500 text-neutral-950 font-black px-6 py-3.5 rounded-none text-xs uppercase tracking-widest cursor-pointer transition-colors"
            >
              START SOURCING
            </button>
            <button 
              onClick={() => navigateToPage('pricing')} 
              className="bg-transparent hover:bg-neutral-900 border-2 border-white text-white font-black px-6 py-3.5 rounded-none text-xs uppercase tracking-widest cursor-pointer transition-colors"
            >
              VIEW SLOT OPTIONS
            </button>
          </div>
          
        </div>
      </section>

    </div>
  );
}
