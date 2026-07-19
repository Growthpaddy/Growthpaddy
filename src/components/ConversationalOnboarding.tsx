import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  Sparkles, 
  User, 
  Building, 
  Check, 
  HelpCircle, 
  ChevronRight, 
  Compass, 
  Briefcase, 
  Zap, 
  Target,
  ShieldCheck,
  Lock,
  ArrowLeft
} from 'lucide-react';

export interface OnboardingData {
  userType: 'talent' | 'recruiter' | null;
  userName: string;
  full_name?: string; // Mapped alias for database compatibility
  // Talent path fields
  careerGoal?: 'Internship' | 'Freelance Gigs' | 'Full-Time Remote Job';
  specialty?: string;
  experienceLevel?: 'Fresher/Newbie' | 'Seasoned Professional';
  email?: string;
  password?: string;
  // Recruiter path fields
  orgName?: string;
  orgSize?: string;
  industry?: string;
  neededRole?: 'Interns' | 'Project Freelancers' | 'Full-Time Dedicated Talent';
}

interface ConversationalOnboardingProps {
  onComplete: (data: OnboardingData) => void;
}

export default function ConversationalOnboarding({ onComplete }: ConversationalOnboardingProps) {
  const [step, setStep] = useState<number>(0);
  const [data, setData] = useState<OnboardingData>({
    userType: null,
    userName: '',
    careerGoal: 'Full-Time Remote Job',
    specialty: 'AI Automation',
    experienceLevel: 'Seasoned Professional',
    email: '',
    password: '',
    orgName: '',
    orgSize: '11-50',
    industry: 'Tech',
    neededRole: 'Full-Time Dedicated Talent'
  });

  const [inputError, setInputError] = useState('');

  // Specialties matching prompt requirement
  const specialties = [
    { id: 'SEO', label: 'SEO Specialization', desc: 'Technical crawling, programmatic clusters, content distribution' },
    { id: 'Media Buying', label: 'Media Buying', desc: 'Paid acquisition strategy, ROI scaling, native ads, PPC campaigns' },
    { id: 'CRO', label: 'Conversion Rate Optimization (CRO)', desc: 'User flows auditing, A/B testing, visual hierarchy upgrades' },
    { id: 'WordPress & AI App Dev', label: 'WordPress & AI App Dev', desc: 'Modern landing stacks, custom plugins, low-code API wraps' },
    { id: 'AI Automation', label: 'AI Automation Operations', desc: 'Make.com pipelines, Zapier triggers, custom n8n flows' },
    { id: 'Graphic/Video Production', label: 'Graphic/Video Production', desc: 'High-conversion ad assets, visual design assets, cinematic editing' }
  ];

  const handleNext = () => {
    setInputError('');

    // Step 1 validation
    if (step === 1 && data.userType === 'recruiter') {
      if (!data.orgName?.trim()) {
        setInputError('Please specify your organization name to configure pipeline.');
        return;
      }
    }

    // Step 2 validation
    if (step === 2 && data.userType === 'talent') {
      if (!data.userName.trim()) {
        setInputError('Let us get acquainted! Please share your full name.');
        return;
      }
    }

    // Advance
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setInputError('');
    setStep(prev => Math.max(0, prev - 1));
  };

  const selectUserType = (type: 'talent' | 'recruiter') => {
    setData(prev => ({ ...prev, userType: type }));
    setStep(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInputError('');

    if (!data.email?.trim() || !data.email.includes('@')) {
      setInputError('Please enter a valid corporate or professional email address.');
      return;
    }

    if (!data.password || data.password.length < 6) {
      setInputError('For security assurance, password must be at least 6 characters.');
      return;
    }

    // MAP VARIABLE ALIASES HERE TO MATCH SUPABASE DATABASE EXPECTATIONS
    const optimizedPayload = {
      ...data,
      full_name: data.userName // Duplicates to full_name so the Database Trigger catches it smoothly
    };

    // All validated, complete onboarding with aligned database fields
    onComplete(optimizedPayload);
  };

  // Step 0 - Split role choice
  if (step === 0) {
    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.12,
          delayChildren: 0.1
        }
      }
    };

    const itemVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: {
          type: "spring",
          stiffness: 100,
          damping: 15
        }
      }
    };

    return (
      <motion.div 
        id="onboarding-welcome-container" 
        className="w-full py-16 px-4 sm:px-6 lg:px-8 bg-neutral-50 border-b border-neutral-200"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-6xl mx-auto space-y-12 text-center">
          
          {/* Header Area */}
          <motion.div className="space-y-4 max-w-3xl mx-auto" variants={itemVariants}>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-150 px-3 py-1 rounded-md shadow-[2px_2px_0px_0px_rgba(16,185,129,0.15)]">
              <Sparkles className="w-3 h-3 text-[#10b981] animate-spin" />
              PREMIUM REAL-TIME EVIDENCE SOURCING
            </span>
            <h2 className="font-display font-black text-3xl sm:text-5xl text-neutral-950 uppercase tracking-tight leading-none">
              Are you looking for growth opportunities, or looking to hire?
            </h2>
            <p className="text-neutral-500 text-xs sm:text-sm uppercase tracking-wider font-extrabold leading-relaxed">
              Connect directly through real-time workflow evidence. Match verified remote digital experts with top growth companies.
            </p>
          </motion.div>

          {/* Interactive Split Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            
            {/* Card A: Digital Specialist (Talent) */}
            <motion.button
              variants={itemVariants}
              onClick={() => selectUserType('talent')}
              className="group text-left border-4 border-neutral-950 bg-white hover:bg-neutral-50/30 transition-all duration-300 p-8 sm:p-10 cursor-pointer flex flex-col justify-between h-[360px] relative rounded-xl shadow-[8px_8px_0px_0px_rgba(16,185,129,0.2)] hover:shadow-[12px_12px_0px_0px_rgba(16,185,129,1)] hover:-translate-y-1 hover:-translate-x-1"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-emerald-50 border-2 border-neutral-950 text-emerald-600 flex items-center justify-center rounded-lg group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <span className="text-[9px] font-mono font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 border border-emerald-100 rounded-md uppercase tracking-widest">
                    VETTED SPECIALIST
                  </span>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-display font-black text-neutral-950 text-xl uppercase tracking-wide">
                    I am Talent
                  </h3>
                  <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider leading-relaxed">
                    I want to verify my actual operations skills, build a certified project dossier, and unlock remote placements.
                  </p>
                </div>
              </div>

              <div className="border-t border-dashed border-neutral-200 pt-5 flex items-center justify-between text-[10px] font-mono font-black uppercase text-emerald-800">
                <div className="flex gap-4">
                  <span>✦ certified portfolio</span>
                  <span>✦ diagnostic audits</span>
                </div>
                <div className="flex items-center gap-1 font-black">
                  <span>START PIPELINE</span>
                  <ChevronRight className="w-3.5 h-3.5 stroke-[3px] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.button>

            {/* Card B: Hiring Partner (Recruiter) */}
            <motion.button
              variants={itemVariants}
              onClick={() => selectUserType('recruiter')}
              className="group text-left border-4 border-neutral-950 bg-white hover:bg-neutral-50/30 transition-all duration-300 p-8 sm:p-10 cursor-pointer flex flex-col justify-between h-[360px] relative rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.15)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-neutral-100 border-2 border-neutral-950 text-neutral-800 flex items-center justify-center rounded-lg group-hover:bg-neutral-950 group-hover:text-white transition-colors duration-300">
                    <Building className="w-6 h-6" />
                  </div>
                  <span className="text-[9px] font-mono font-black text-neutral-700 bg-neutral-100 px-2.5 py-1 border border-neutral-200 rounded-md uppercase tracking-widest">
                    DIRECT RECRUITMENT
                  </span>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-display font-black text-neutral-950 text-xl uppercase tracking-wide">
                    I am a Recruiter
                  </h3>
                  <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider leading-relaxed">
                    I want to bypass agency commissions, access audited portfolios, and coordinate directly with top-tier operators.
                  </p>
                </div>
              </div>

              <div className="border-t border-dashed border-neutral-200 pt-5 flex items-center justify-between text-[10px] font-mono font-black uppercase text-emerald-800">
                <div className="flex gap-4">
                  <span>✦ commission-free</span>
                  <span>✦ transparent metrics</span>
                </div>
                <div className="flex items-center gap-1 font-black text-neutral-950">
                  <span>ENTER PORTAL</span>
                  <ChevronRight className="w-3.5 h-3.5 stroke-[3px] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.button>

          </div>

          {/* Skip Option Footer */}
          <motion.div className="pt-8 text-center" variants={itemVariants}>
            <button 
              onClick={() => onComplete({
                userType: null,
                userName: 'Guest Operator',
                full_name: 'Guest Operator'
              })}
              className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-neutral-500 hover:text-neutral-950 hover:underline tracking-wider cursor-pointer bg-transparent border-0"
            >
              <span>Skip Onboarding & Explore Platform</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>

        </div>
      </motion.div>
    );
  }

  // Active steps render (1 to 4)
  const totalSteps = 5; // step 0 (Role Selection) is the 1st screen, then 1, 2, 3, 4 represent the remaining 4 screens
  const progressPercent = ((step + 1) / totalSteps) * 100;

  return (
    <div id="onboarding-flow-container" className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
      
      {/* SaaS Step-Based Progress Bar */}
      <div className="w-full bg-neutral-200 h-2 mb-10 overflow-hidden rounded-full">
        <div 
          className="bg-[#00A86B] h-full transition-all duration-500 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        
        {/* ======================================================== */}
        {/* TALENT BRANCH STEPS                                      */}
        {/* ======================================================== */}

        {/* Talent - Step 1 (Screen 2): Objective Choice */}
        {step === 1 && data.userType === 'talent' && (
          <motion.div
            key="talent-step1"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white border-2 border-neutral-200 p-8 sm:p-10 text-left space-y-6 shadow-sm rounded-2xl"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#00A86B] font-extrabold block">
                02. CAREER OBJECTIVE
              </span>
              <h3 className="text-2xl font-display font-black text-slate-900 uppercase">
                What is your immediate career goal?
              </h3>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                Select your primary engagement format to filter optimized roles.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {[
                { id: 'Internship', title: 'Internship', desc: 'Accelerated entry positions with guided workspace mentors.' },
                { id: 'Freelance Gigs', title: 'Freelance Gigs', desc: 'Task-driven, hourly sprint contract opportunities.' },
                { id: 'Full-Time Remote Job', title: 'Full-Time Remote Job', desc: 'Secure direct permanent contract placements with global brands.' }
              ].map((opt) => {
                const isSelected = data.careerGoal === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setData({ ...data, careerGoal: opt.id as any })}
                    className={`p-5 text-left transition duration-300 border-2 flex flex-col justify-between h-40 rounded-xl cursor-pointer focus:outline-none
                      ${isSelected 
                        ? 'border-[#00A86B] bg-[#00A86B]/5 shadow-sm' 
                        : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100/50'}`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className="text-xs font-black text-slate-900 uppercase tracking-wide">{opt.title}</span>
                      {isSelected && (
                        <div className="w-4 h-4 bg-[#00A86B] rounded-full flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider leading-relaxed mt-3">{opt.desc}</p>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-neutral-100">
              <button
                type="button"
                onClick={handleBack}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" /> Back
              </button>
              
              <button
                type="button"
                onClick={handleNext}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-widest flex items-center gap-1.5 transition shadow-[2px_2px_0px_0px_rgba(0,168,107,1)]"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Talent - Step 2 (Screen 3): Name Capture */}
        {step === 2 && data.userType === 'talent' && (
          <motion.div
            key="talent-step2"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white border-2 border-neutral-200 p-8 sm:p-10 text-left space-y-6 shadow-sm rounded-2xl"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#00A86B] font-extrabold block">
                03. IDENTITY PROFILE
              </span>
              <h3 className="text-2xl font-display font-black text-slate-900 uppercase">
                Let's get acquainted. What is your name?
              </h3>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                Your name will customize your subsequent assessment modules.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-slate-400 font-extrabold uppercase tracking-wider block">YOUR FULL NAME</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chisom Okafor"
                    value={data.userName}
                    onChange={(e) => setData({ ...data, userName: e.target.value })}
                    className="w-full border-2 border-slate-200 focus:border-[#00A86B] rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none uppercase tracking-wide transition duration-150"
                  />
                </div>
              </div>

              {inputError && (
                <p className="text-xs text-rose-600 font-bold uppercase tracking-wider">⚠️ {inputError}</p>
              )}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-neutral-100">
              <button
                type="button"
                onClick={handleBack}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" /> Back
              </button>
              
              <button
                type="button"
                onClick={handleNext}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-widest flex items-center gap-1.5 transition shadow-[2px_2px_0px_0px_rgba(0,168,107,1)]"
              >
                <span>Personalize Setup</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Talent - Step 3 (Screen 4): Personalized Skill & Level */}
        {step === 3 && data.userType === 'talent' && (
          <motion.div
            key="talent-step3"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white border-2 border-neutral-200 p-8 sm:p-10 text-left space-y-6 shadow-sm rounded-2xl"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#00A86B] font-extrabold block">
                04. CAPABILITY MATRIX
              </span>
              <h3 className="text-2xl font-display font-black text-slate-900 uppercase">
                Thanks, {data.userName}!
              </h3>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                Since you're looking for <span className="text-[#00A86B] font-black">"{data.careerGoal}"</span>, what is your primary expertise?
              </p>
            </div>

            {/* Specialties Option chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {specialties.map((spec) => {
                const isSelected = data.specialty === spec.id;
                return (
                  <button
                    key={spec.id}
                    type="button"
                    onClick={() => setData({ ...data, specialty: spec.id })}
                    className={`p-4 text-left border-2 transition rounded-xl cursor-pointer focus:outline-none flex items-start gap-3
                      ${isSelected 
                        ? 'border-[#00A86B] bg-[#00A86B]/5' 
                        : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100/50'}`}
                  >
                    <div className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center flex-shrink-0
                      ${isSelected ? 'bg-[#00A86B] border-[#00A86B]' : 'border-neutral-400 bg-white'}`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                    </div>
                    <div>
                      <strong className="text-xs uppercase tracking-wide text-slate-800 block font-black">{spec.id}</strong>
                      <span className="text-[9px] text-slate-500 uppercase tracking-wider block mt-1 leading-snug font-semibold">{spec.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Baseline Entry Level */}
            <div className="border-t border-dashed border-neutral-200 pt-5 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono font-black text-slate-700 block">Select your baseline entry level</span>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">This configures diagnostic vetting difficulty thresholds:</p>
              </div>

              <div className="flex gap-4">
                {[
                  { id: 'Fresher/Newbie', label: 'Fresher/Newbie', desc: '1-2 Years experienced. Polished fundamentals, ready for live checks.' },
                  { id: 'Seasoned Professional', label: 'Seasoned Professional', desc: '3+ Years verified operations. Deployed systems, scalable KPI management.' }
                ].map((level) => {
                  const isSel = data.experienceLevel === level.id;
                  return (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => setData({ ...data, experienceLevel: level.id as any })}
                      className={`flex-1 p-4 text-left border-2 transition rounded-xl cursor-pointer focus:outline-none
                        ${isSel 
                          ? 'border-slate-800 bg-slate-50' 
                          : 'border-neutral-200 hover:border-slate-300 bg-white'}`}
                    >
                      <strong className="text-xs uppercase tracking-wide text-slate-900 block font-black">{level.label}</strong>
                      <p className="text-[9px] text-slate-500 uppercase tracking-wider leading-relaxed mt-1.5 font-bold">{level.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-neutral-100">
              <button
                type="button"
                onClick={handleBack}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" /> Back
              </button>
              
              <button
                type="button"
                onClick={handleNext}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-widest flex items-center gap-1.5 transition shadow-[2px_2px_0px_0px_rgba(0,168,107,1)]"
              >
                <span>Continue to Gateway</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Talent - Step 4 (Screen 5): Vetting Gateway */}
        {step === 4 && data.userType === 'talent' && (
          <motion.div
            key="talent-step4"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white border-2 border-neutral-200 p-8 sm:p-10 text-left space-y-6 shadow-sm rounded-2xl"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#00A86B] font-extrabold block">
                05. VETTING CONSOLE GATEWAY
              </span>
              <h3 className="text-2xl font-display font-black text-slate-900 uppercase">
                Awesome setup, {data.userName}.
              </h3>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold leading-relaxed">
                To get you listed on the job board, you'll need to pass our 4-Phase Vetting Process. Setup your access credentials to save your progress dossier before launching the quiz.
              </p>
            </div>

            {/* Credentials Block */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-slate-400 font-extrabold uppercase tracking-wider block">CHOOSE EMAIL ADDRESS</label>
                  <input
                    type="email"
                    required
                    placeholder="chisom@domain.com"
                    value={data.email}
                    onChange={(e) => setData({ ...data, email: e.target.value })}
                    className="w-full border-2 border-slate-200 focus:border-[#00A86B] rounded-xl py-3 px-4 text-xs font-bold text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none tracking-wide transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-slate-400 font-extrabold uppercase tracking-wider block">SECURE ACCESS PASSWORD</label>
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={data.password}
                    onChange={(e) => setData({ ...data, password: e.target.value })}
                    className="w-full border-2 border-slate-200 focus:border-[#00A86B] rounded-xl py-3 px-4 text-xs font-bold text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none tracking-wide transition"
                  />
                </div>
              </div>

              {inputError && (
                <p className="text-xs text-rose-600 font-bold uppercase tracking-wider">⚠️ {inputError}</p>
              )}

              <div className="bg-emerald-50/50 p-4 border border-emerald-100 rounded-xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#00A86B] flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider leading-relaxed">
                  Ready to start your timed quiz? Passing Phase 1 instantly locks your matching eligibility and places your audited scorecard on our recruitment pipelines.
                </p>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" /> Back
                </button>
                
                <button
                  type="submit"
                  className="bg-[#00A86B] hover:bg-[#00905a] text-white font-black py-4 px-6 rounded-xl text-xs uppercase tracking-widest flex items-center gap-1.5 transition shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] cursor-pointer"
                >
                  <span>Begin Phase 1: Skill Quiz</span>
                  <ArrowRight className="w-4 h-4 text-emerald-100" />
                </button>
              </div>
            </form>
          </motion.div>
        )}


        {/* ======================================================== */}
        {/* RECRUITER BRANCH STEPS                                   */}
        {/* ======================================================== */}

        {/* Recruiter - Step 1 (Screen 2): Company Baseline */}
        {step === 1 && data.userType === 'recruiter' && (
          <motion.div
            key="recruiter-step1"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white border-2 border-neutral-200 p-8 sm:p-10 text-left space-y-6 shadow-sm rounded-2xl"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#00A86B] font-extrabold block">
                02. COMPANY CORE BASELINE
              </span>
              <h3 className="text-2xl font-display font-black text-slate-900 uppercase">
                What is the name of your organization and your team size?
              </h3>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                Setup your business credentials to source tailored specialists.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-slate-400 font-extrabold uppercase tracking-wider block">COMPANY OR ORGANIZATION NAME</label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sterling Ventures"
                    value={data.orgName}
                    onChange={(e) => setData({ ...data, orgName: e.target.value })}
                    className="w-full border-2 border-slate-200 focus:border-[#00A86B] rounded-xl py-3 pl-10 pr-4 text-xs font-bold text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none uppercase tracking-wide transition duration-150"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono text-slate-400 font-extrabold uppercase tracking-wider block">TEAM SIZE CATEGORY</label>
                <select
                  value={data.orgSize}
                  onChange={(e) => setData({ ...data, orgSize: e.target.value })}
                  className="w-full border-2 border-slate-200 focus:border-[#00A86B] rounded-xl py-3 px-4 text-xs font-bold text-slate-900 bg-slate-50/50 focus:outline-none uppercase tracking-wide transition cursor-pointer"
                >
                  <option value="1-10">1-10 Operators (Seed / Early Stage)</option>
                  <option value="11-50">11-50 Operators (Growth Stage Venture)</option>
                  <option value="51-200">51-200 Operators (SME scale)</option>
                  <option value="200+">200+ Operators (Enterprise Scale)</option>
                </select>
              </div>

              {inputError && (
                <p className="text-xs text-rose-600 font-bold uppercase tracking-wider">⚠️ {inputError}</p>
              )}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-neutral-100">
              <button
                type="button"
                onClick={handleBack}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" /> Back
              </button>
              
              <button
                type="button"
                onClick={handleNext}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-widest flex items-center gap-1.5 transition shadow-[2px_2px_0px_0px_rgba(0,168,107,1)]"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Recruiter - Step 2 (Screen 3): Industry Profile */}
        {step === 2 && data.userType === 'recruiter' && (
          <motion.div
            key="recruiter-step2"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white border-2 border-neutral-200 p-8 sm:p-10 text-left space-y-6 shadow-sm rounded-2xl"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#00A86B] font-extrabold block">
                03. INDUSTRY VERTICAL
              </span>
              <h3 className="text-2xl font-display font-black text-slate-900 uppercase">
                Which industry vertical does {data.orgName} dominate?
              </h3>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                This helps customize the diagnostic projects and specialities recommended to you.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              {['Tech', 'E-commerce', 'Fintech', 'Agency', 'Other'].map((ind) => {
                const isSelected = data.industry === ind;
                return (
                  <button
                    key={ind}
                    type="button"
                    onClick={() => setData({ ...data, industry: ind })}
                    className={`p-4 border-2 text-left transition rounded-xl cursor-pointer focus:outline-none flex flex-col justify-between h-28
                      ${isSelected 
                        ? 'border-[#00A86B] bg-[#00A86B]/5' 
                        : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100/50'}`}
                  >
                    <span className="text-xs font-black uppercase text-slate-800 tracking-wider leading-snug">{ind}</span>
                    {isSelected ? (
                      <span className="text-[9px] font-mono text-[#00A86B] font-black uppercase">✓ Selected</span>
                    ) : (
                      <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">Activate</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-neutral-100">
              <button
                type="button"
                onClick={handleBack}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" /> Back
              </button>
              
              <button
                type="button"
                onClick={handleNext}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-widest flex items-center gap-1.5 transition shadow-[2px_2px_0px_0px_rgba(0,168,107,1)]"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Recruiter - Step 3 (Screen 4): Talent Persona Target */}
        {step === 3 && data.userType === 'recruiter' && (
          <motion.div
            key="recruiter-step3"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white border-2 border-neutral-200 p-8 sm:p-10 text-left space-y-6 shadow-sm rounded-2xl"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#00A86B] font-extrabold block">
                04. TALENT COMPETENCY TARGET
              </span>
              <h3 className="text-2xl font-display font-black text-slate-900 uppercase">
                Perfect. We have growth experts ready.
              </h3>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                What type of talent are you looking to deploy right now, <span className="font-extrabold text-[#00A86B]">{data.orgName}</span>?
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {[
                { id: 'Interns', label: 'Interns', desc: 'Pre-vetted digital specialists ready for hands-on guidance assignments.' },
                { id: 'Project Freelancers', label: 'Project Freelancers', desc: 'Flexible specialists for immediate project sprints and campaign audits.' },
                { id: 'Full-Time Dedicated Talent', label: 'Full-Time Dedicated Talent', desc: 'Long-term permanent additions to integrate deeply inside operations.' }
              ].map((role) => {
                const isSelected = data.neededRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setData({ ...data, neededRole: role.id as any })}
                    className={`w-full p-4 text-left border-2 transition rounded-xl cursor-pointer focus:outline-none flex items-center justify-between
                      ${isSelected 
                        ? 'border-[#00A86B] bg-[#00A86B]/5 font-black' 
                        : 'border-neutral-200 bg-neutral-50 hover:bg-neutral-100/50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center
                        ${isSelected ? 'bg-[#00A86B] border-[#00A86B]' : 'border-neutral-400 bg-white'}`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                      <div>
                        <span className="text-xs uppercase tracking-wide text-slate-800 font-black block">{role.label}</span>
                        <span className="text-[9px] text-neutral-400 uppercase tracking-wider mt-0.5 block font-semibold">{role.desc}</span>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="text-[9px] font-mono bg-[#00A86B] text-white px-2 py-1 rounded-md uppercase tracking-widest font-bold">
                        Filter Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-neutral-100">
              <button
                type="button"
                onClick={handleBack}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" /> Back
              </button>
              
              <button
                type="button"
                onClick={handleNext}
                className="bg-[#0f172a] hover:bg-slate-800 text-white font-black py-4 px-6 rounded-xl text-xs uppercase tracking-widest flex items-center gap-1.5 transition shadow-[3px_3px_0px_0px_rgba(0,168,107,1)]"
              >
                <span>Continue to Handshake</span>
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Recruiter - Step 4 (Screen 5): Dashboard Handshake */}
        {step === 4 && data.userType === 'recruiter' && (
          <motion.div
            key="recruiter-step4"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white border-2 border-neutral-200 p-8 sm:p-10 text-left space-y-6 shadow-sm rounded-2xl"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#00A86B] font-extrabold block">
                05. MATCHING SYSTEM HANDSHAKE
              </span>
              <h3 className="text-2xl font-display font-black text-slate-900 uppercase">
                We're filtering our vetted pool for you.
              </h3>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold leading-relaxed">
                Let's head to your customized matching dashboard! Setup corporate credentials to lock your sourcing slots and save your custom filters.
              </p>
            </div>

            {/* Credentials Block */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-slate-400 font-extrabold uppercase tracking-wider">CORPORATE WORK EMAIL</label>
                  <input
                    type="email"
                    required
                    placeholder="sourcing@firm.com"
                    value={data.email}
                    onChange={(e) => setData({ ...data, email: e.target.value })}
                    className="w-full border-2 border-slate-200 focus:border-[#00A86B] rounded-xl py-3 px-4 text-xs font-bold text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none tracking-wide transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-slate-400 font-extrabold uppercase tracking-wider block">CHOOSE SECURE PASSWORD</label>
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={data.password}
                    onChange={(e) => setData({ ...data, password: e.target.value })}
                    className="w-full border-2 border-slate-200 focus:border-[#00A86B] rounded-xl py-3 px-4 text-xs font-bold text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none tracking-wide transition"
                  />
                </div>
              </div>

              {inputError && (
                <p className="text-xs text-rose-600 font-bold uppercase tracking-wider">⚠️ {inputError}</p>
              )}

              <div className="bg-emerald-50/50 p-4 border border-emerald-100 rounded-xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#00A86B] flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider leading-relaxed">
                  Matched portfolios will have direct contact lines unlocked. You can immediately review evidence checklists and invite talent to private operations briefs.
                </p>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" /> Back
                </button>
                
                <button
                  type="submit"
                  className="bg-[#00A86B] hover:bg-[#00905a] text-white font-black py-4 px-6 rounded-xl text-xs uppercase tracking-widest flex items-center gap-1.5 transition shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] cursor-pointer"
                >
                  <span>View Matched Talent</span>
                  <ArrowRight className="w-4 h-4 text-emerald-100" />
                </button>
              </div>
            </form>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}