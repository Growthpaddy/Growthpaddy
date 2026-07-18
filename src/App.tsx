import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Award, 
  TrendingUp, 
  Briefcase, 
  ArrowUpRight,
  Zap,
  Lock,
  MessageCircle,
  HelpCircle,
  Sparkles,
  Users,
  ChevronRight
} from 'lucide-react';

import { Header, Footer } from './components/HeaderAndFooter';
import TalentDirectory from './components/TalentDirectory';
import FAQSection from './components/FAQSection';
import HomeOverview from './components/HomeOverview';
import EmployerWorkspace from './components/EmployerWorkspace';
import TalentDashboard from './components/TalentDashboard';
import PracticeAssessment from './components/PracticeAssessment';
import PricingPlans from './components/PricingPlans';
import ConversationalOnboarding from './components/ConversationalOnboarding';
import ConfettiSuccess from './components/ConfettiSuccess';

export default function App() {
  // Navigation State
  const [currentPage, setCurrentPage] = useState<'home' | 'directory' | 'employer' | 'talent' | 'assessment' | 'pricing'>('home');

  // Confetti Success States
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiMessage, setConfettiMessage] = useState('SUCCESSFULLY REGISTERED!');

  // Shared Global States
  const [employerSlots, setEmployerSlots] = useState<number>(1);
  const [isTalentPaid, setIsTalentPaid] = useState<boolean>(false);
  
  // Sign In State
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInError, setSignInError] = useState('');

  // Seed default demo accounts in localStorage if not already present
  useEffect(() => {
    const existing = localStorage.getItem('dsp_registered_users');
    if (!existing) {
      const demoUsers = [
        {
          email: 'recruiter@dsp.com',
          password: 'password123',
          userName: 'Marcus Sterling',
          userType: 'recruiter',
          onboarding: {
            userType: 'recruiter',
            userName: 'Marcus Sterling',
            orgName: 'Sterling Growth Capital',
            orgSize: '11-50',
            industry: 'SaaS / B2B',
            neededRole: 'AI Automation Operations Architect'
          }
        },
        {
          email: 'talent@dsp.com',
          password: 'password123',
          userName: 'Alex Rivers',
          userType: 'talent',
          onboarding: {
            userType: 'talent',
            userName: 'Alex Rivers',
            careerGoal: 'Full-Time Remote',
            specialty: 'AI Automation',
            experienceLevel: 'Professional',
            email: 'talent@dsp.com'
          }
        }
      ];
      localStorage.setItem('dsp_registered_users', JSON.stringify(demoUsers));
    }
  }, []);

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError('');

    if (!signInEmail.trim() || !signInPassword.trim()) {
      setSignInError('Please provide both email and password.');
      return;
    }

    const rawUsers = localStorage.getItem('dsp_registered_users');
    const users = rawUsers ? JSON.parse(rawUsers) : [];

    const found = users.find(
      (u: any) => u.email.toLowerCase() === signInEmail.toLowerCase().trim() && u.password === signInPassword
    );

    if (found) {
      setOnboardingData(found.onboarding);
      setIsSignInModalOpen(false);
      setSignInEmail('');
      setSignInPassword('');
      // Navigate to correct dashboard based on user type
      if (found.userType === 'recruiter') {
        setCurrentPage('directory');
      } else if (found.userType === 'talent') {
        setCurrentPage('talent');
      } else {
        setCurrentPage('home');
      }
    } else {
      setSignInError('Invalid credentials. If you entered a password during onboarding, use that email/password. Or use recruiter@dsp.com / password123 to instantly login!');
    }
  };
  const [onboardingData, setOnboardingData] = useState<{
    userType: 'talent' | 'recruiter' | null;
    userName: string;
    careerGoal?: 'Internship' | 'Freelance' | 'Full-Time Remote';
    specialty?: string;
    experienceLevel?: 'Fresher' | 'Professional';
    email?: string;
    orgName?: string;
    orgSize?: string;
    industry?: string;
    neededRole?: string;
  } | null>(null);

  // Modals Core Settings
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);
  const [hireForm, setHireForm] = useState({ name: '', company: '', roleNeeded: 'AI Automation', message: '' });
  const [hireSubmitted, setHireSubmitted] = useState(false);

  const [isTalentModalOpen, setIsTalentModalOpen] = useState(false);
  const [talentForm, setTalentForm] = useState({ name: '', email: '', track: 'Internship Track', skills: '' });
  const [talentSubmitted, setTalentSubmitted] = useState(false);

  const navigateToPage = (pageName: 'home' | 'directory' | 'employer' | 'talent' | 'assessment' | 'pricing') => {
    setCurrentPage(pageName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white text-neutral-850 font-sans antialiased selection:bg-emerald-500/30 selection:text-neutral-900">
      
      {/* GLOBAL HEADER */}
      <Header 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        openHireModal={() => setIsHireModalOpen(true)}
        openTalentModal={() => setIsTalentModalOpen(true)}
        employerSlots={employerSlots}
        isLoggedIn={onboardingData !== null}
        userName={onboardingData?.userName || ''}
        userType={onboardingData?.userType || null}
        onSignInClick={() => {
          setSignInError('');
          setIsSignInModalOpen(true);
        }}
        onSignOutClick={() => {
          setOnboardingData(null);
          setCurrentPage('home');
        }}
      />

      {/* PRIMARY VIEWS CONTAINER */}
      <main className="min-h-[70vh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            
            {/* View 1: Home/Overview Landing Page */}
            {currentPage === 'home' && (
              onboardingData === null ? (
                <div className="w-full bg-neutral-50 min-h-[75vh]">
                  <ConversationalOnboarding 
                    onComplete={(data) => {
                      setOnboardingData(data);
                      // Trigger confetti success state
                      setConfettiMessage(data.userType === 'recruiter' ? 'RECRUITER PORTAL DEPLOYED!' : 'TALENT PROFILE ACTIVATED!');
                      setShowConfetti(true);
                      // Save to registered users list in local storage so they can sign in with it later!
                      if (data.email && data.password) {
                        const existing = localStorage.getItem('dsp_registered_users');
                        const users = existing ? JSON.parse(existing) : [];
                        // Prevent duplicate entries of the same email
                        const filtered = users.filter((u: any) => u.email.toLowerCase() !== data.email?.toLowerCase());
                        filtered.push({
                          email: data.email,
                          password: data.password,
                          userName: data.userName,
                          userType: data.userType,
                          onboarding: data
                        });
                        localStorage.setItem('dsp_registered_users', JSON.stringify(filtered));
                      }
                      if (data.userType === 'recruiter') {
                        setCurrentPage('directory'); // Go straight to directory to see filtered matches!
                      } else if (data.userType === 'talent') {
                        setCurrentPage('talent'); // Go straight to Phase-Stepped Talent Dashboard!
                      }
                    }}
                  />
                </div>
              ) : (
                <div>
                  <div className="bg-emerald-600 text-white p-3 text-center text-xs font-black uppercase tracking-wider flex flex-col sm:flex-row items-center justify-between px-6 sm:px-12 gap-2 border-b-2 border-neutral-950">
                    <span>⚡ ACTIVE WORKSPACE: ADDRESSING YOU AS {onboardingData.userName.toUpperCase()} ({onboardingData.userType === 'talent' ? 'VETTED TALENT PIPELINE' : onboardingData.userType === 'recruiter' ? 'RECRUITER PORTAL' : 'GUEST EXPLORER'})</span>
                    <button 
                      onClick={() => {
                        setOnboardingData(null);
                        setCurrentPage('home');
                      }}
                      className="bg-white hover:bg-neutral-100 text-neutral-950 font-black py-1 px-3 border border-neutral-950 rounded-none text-[9px] cursor-pointer uppercase tracking-widest transition duration-150"
                    >
                      RESET SESSION / RE-ENTER PIPELINE
                    </button>
                  </div>
                  <HomeOverview 
                    navigateToPage={navigateToPage} 
                    openHireModal={() => setIsHireModalOpen(true)} 
                    openTalentModal={() => setIsTalentModalOpen(true)} 
                  />
                </div>
              )
            )}

            {/* View 2: Find Talent (Directory Page) */}
            {currentPage === 'directory' && (
              <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
                <div className="text-left border-b border-neutral-100 pb-6 space-y-3">
                  <span className="text-[10px] font-mono font-bold bg-emerald-50 border border-emerald-150 text-emerald-800 px-3 py-1 rounded-full uppercase tracking-wider inline-block">
                    Audited Candidates Directory
                  </span>
                  <h1 className="font-display font-medium text-3xl sm:text-4.5xl text-neutral-900 tracking-tight leading-none pt-1">
                    Find Digitally Verified Professionals
                  </h1>
                  <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl font-secondary leading-relaxed">
                    Instantly browse and unlock specialized candidates with certified skill metrics. Zero empty claims tolerated—every profile is backed by actual audited projects.
                  </p>
                </div>

                <TalentDirectory 
                  employerSlots={employerSlots} 
                  setEmployerSlots={setEmployerSlots} 
                  navigateToPricing={() => navigateToPage('pricing')} 
                  onboardingData={onboardingData || undefined}
                />
              </section>
            )}

            {/* View 3: Employer Workspace (Sourcing Dashboard) */}
            {currentPage === 'employer' && (
              <EmployerWorkspace 
                employerSlots={employerSlots} 
                setEmployerSlots={setEmployerSlots} 
                navigateToPage={navigateToPage} 
              />
            )}

            {/* View 4: Talent Workspace (Portfolio checklist / upgrade pass) */}
            {currentPage === 'talent' && (
              <TalentDashboard 
                isTalentPaid={isTalentPaid} 
                setIsTalentPaid={setIsTalentPaid} 
                navigateToPage={navigateToPage} 
                onboardingData={onboardingData || { userName: 'Candidate Specialist', experienceLevel: 'Professional' }}
              />
            )}

            {/* View 5: Practice Assessment */}
            {currentPage === 'assessment' && (
              <PracticeAssessment />
            )}

            {/* View 6: Pricing Plans */}
            {currentPage === 'pricing' && (
              <PricingPlans 
                setEmployerSlots={setEmployerSlots} 
                navigateToPage={navigateToPage} 
              />
            )}

          </motion.div>
        </AnimatePresence>
      </main>

      {/* GLOBAL SUPPORT & FAQ (Displayed above footer to reinforce trust metrics) */}
      <FAQSection />

      {/* GENERAL CALL TO ACTION SLIT-BANNER (Included once on App root to keep UI dynamic) */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-[#092013] text-white relative text-center overflow-hidden">
        {/* Fine grid design highlights */}
        <div className="absolute inset-0 bg-[#092013] bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-550/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-6 relative z-10 text-center">
          <div className="space-y-4">
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block bg-white/5 border border-white/10 px-3 py-1 rounded-full max-w-xs mx-auto text-center font-secondary">Verified Sourcing Pipeline</span>
            <h2 className="font-display font-medium text-3xl sm:text-4xl text-white tracking-tight leading-tight pt-1">
              Connect Sourced on Authentic Evidence
            </h2>
            <p className="text-neutral-400 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed font-secondary">
              Acquire top-performing digital talent graded through scenario assessments and verified by actual live project parameters.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-sm mx-auto pt-2">
            <button
              onClick={() => navigateToPage('directory')}
              className="w-full bg-[#10b981] hover:bg-emerald-500 text-neutral-950 font-bold px-6 py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition duration-205"
            >
              <span>Snoop Verified Talent</span>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-950 stroke-[2.5]" />
            </button>

            <button
              onClick={() => navigateToPage('talent')}
              className="w-full bg-white/5 hover:bg-white/10 text-white font-bold px-6 py-3.5 rounded-xl text-xs border border-white/10 flex items-center justify-center gap-1.5 cursor-pointer transition duration-205"
            >
              <span>Build Proof Portfolio</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400" />
            </button>
          </div>
        </div>
      </section>

      {/* ======================================= */}
      {/* DIALOG MODE: MODAL FOR EMPLOYERS        */}
      {/* ======================================= */}
      {isHireModalOpen && (
        <div className="fixed inset-0 bg-neutral-950/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-neutral-200 max-w-lg w-full p-6 md:p-8 space-y-6 text-left relative shadow-2xl font-secondary">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-emerald-850 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">Consultant Routing</span>
                <h3 className="font-display font-semibold text-2xl text-neutral-950 mt-4 leading-none">Custom Placement Proposal</h3>
                <p className="text-xs text-neutral-450 mt-1.5">Brief our sourcing coordinators on your target metrics and tools prerequisites.</p>
              </div>
              <button 
                onClick={() => { setIsHireModalOpen(false); setHireSubmitted(false); }}
                className="text-neutral-450 hover:text-neutral-800 p-1.5 rounded-lg hover:bg-neutral-100 transition cursor-pointer font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {hireSubmitted ? (
              <div className="p-8 text-center bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-4">
                <CheckCircle2 className="w-12 h-12 text-[#10b981] mx-auto animate-bounce" />
                <h4 className="font-bold text-neutral-950">Proposal Scheduled!</h4>
                <p className="text-xs text-neutral-600">A Talent Advisor will inspect our active registries and email custom matched candidate models within 2 business hours.</p>
                <button 
                  onClick={() => { setIsHireModalOpen(false); setHireSubmitted(false); }}
                  className="bg-neutral-950 hover:bg-neutral-900 text-white font-semibold py-2 px-4 rounded-xl text-xs cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form 
                onSubmit={(e) => { 
                  e.preventDefault(); 
                  setHireSubmitted(true); 
                  setConfettiMessage('PLACEMENT PROPOSAL SUBMITTED!');
                  setShowConfetti(true);
                }}
                className="space-y-4 text-xs font-sans"
              >
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-neutral-400 font-bold uppercase block">Contact Full Name</label>
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
                  <label className="text-[9px] font-mono text-neutral-400 font-bold uppercase block">Company Name</label>
                  <input 
                    type="text" 
                    required 
                    value={hireForm.company}
                    onChange={(e) => setHireForm({ ...hireForm, company: e.target.value })}
                    placeholder="e.g. Acme Tech Agencies" 
                    className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-neutral-50/50 focus:bg-white text-xs text-neutral-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-neutral-400 font-bold uppercase block">Core Specialization Needed</label>
                  <select 
                    value={hireForm.roleNeeded}
                    onChange={(e) => setHireForm({ ...hireForm, roleNeeded: e.target.value })}
                    className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-neutral-50/55 text-xs text-neutral-805"
                  >
                    <option value="AI Automation">AI Automation Operations (Zapier, Python, Make, n8n)</option>
                    <option value="Technical SEO">Technical SEO & Programmatic clustering</option>
                    <option value="Paid Acquisition">PPC Acquisition Advertising (Google Ads, Meta Ads)</option>
                    <option value="Growth Marketing">Growth Marketing Specialist</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-neutral-400 font-bold uppercase block">Scope Details / Notes</label>
                  <textarea 
                    value={hireForm.message}
                    onChange={(e) => setHireForm({ ...hireForm, message: e.target.value })}
                    rows={3} 
                    placeholder="Budget, key tool preferences, startup parameters..." 
                    className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-neutral-50/50 focus:bg-white text-xs text-neutral-800"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-[#0d1c11] hover:bg-neutral-900 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider cursor-pointer"
                >
                  Send Placement Brief
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
        <div className="fixed inset-0 bg-neutral-950/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-neutral-200 max-w-lg w-full p-6 md:p-8 space-y-6 text-left relative shadow-2xl font-secondary">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-emerald-850 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">Vetting Registration</span>
                <h3 className="font-display font-medium text-2xl text-neutral-950 mt-4 leading-none">Join Verified Directory</h3>
                <p className="text-xs text-neutral-400 mt-1.5">Attempt scenario-based assessments and create proof of competence.</p>
              </div>
              <button 
                onClick={() => { setIsTalentModalOpen(false); setTalentSubmitted(false); }}
                className="text-neutral-400 hover:text-neutral-805 p-1.5 rounded-lg hover:bg-neutral-100 transition cursor-pointer font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {talentSubmitted ? (
              <div className="p-8 text-center bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-4">
                <CheckCircle2 className="w-12 h-12 text-[#10b981] mx-auto animate-bounce" />
                <h4 className="font-bold text-neutral-950">Registration Pending!</h4>
                <p className="text-xs text-neutral-600">Verification parameters and practice credentials files have been compiled for your email.</p>
                <button 
                  onClick={() => { setIsTalentModalOpen(false); setTalentSubmitted(false); }}
                  className="bg-neutral-950 hover:bg-neutral-900 text-white font-semibold py-2 px-4 rounded-xl text-xs cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form 
                onSubmit={(e) => { 
                  e.preventDefault(); 
                  setTalentSubmitted(true); 
                  setConfettiMessage('TALENT VERIFICATION INITIATED!');
                  setShowConfetti(true);
                }}
                className="space-y-4 text-xs font-sans"
              >
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-neutral-400 font-bold uppercase block">Professional Full Name</label>
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
                  <label className="text-[9px] font-mono text-neutral-400 font-bold uppercase block">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    value={talentForm.email} 
                    onChange={(e) => setTalentForm({ ...talentForm, email: e.target.value })}
                    placeholder="you@corporate-domain.com" 
                    className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-neutral-50/50 focus:bg-white text-xs text-neutral-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-neutral-400 font-bold uppercase block">Specialization Tier</label>
                  <select 
                    value={talentForm.track}
                    onChange={(e) => setTalentForm({ ...talentForm, track: e.target.value })}
                    className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-neutral-50/50 text-xs text-neutral-800"
                  >
                    <option value="Professional Track">Professional Verification (immediate listing)</option>
                    <option value="Internship Track">Supervised Internship Pathway (junior placement)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-neutral-400 font-bold uppercase block">Digital Toolsets Proficiencies</label>
                  <input 
                    type="text" 
                    value={talentForm.skills}
                    onChange={(e) => setTalentForm({ ...talentForm, skills: e.target.value })}
                    placeholder="e.g. Zapier, Make, GA4, Semrush, Technical crawls, custom campaign configurations" 
                    className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-neutral-50/50 focus:bg-white text-xs text-neutral-800"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-[#0a1b10] hover:bg-neutral-900 text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase cursor-pointer"
                >
                  Begin Verification
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* SIGN IN MODAL */}
      {isSignInModalOpen && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white border-4 border-neutral-950 max-w-md w-full p-6 sm:p-8 space-y-6 text-left relative shadow-[8px_8px_0px_0px_rgba(16,185,129,1)]">
            
            <div className="flex items-start justify-between border-b-2 border-dashed border-neutral-200 pb-4">
              <div>
                <span className="text-[9px] uppercase font-mono font-black text-emerald-700 bg-emerald-50 border border-emerald-150 px-2 py-0.5">
                  AUTHENTICATION ENGINE
                </span>
                <h3 className="font-display font-black text-xl text-neutral-950 uppercase tracking-tight mt-2 leading-none">
                  Sign In to Workspace
                </h3>
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mt-1.5">
                  Access your vetting pipelines or sourcing dashboards instantly.
                </p>
              </div>
              <button 
                onClick={() => { setIsSignInModalOpen(false); setSignInEmail(''); setSignInPassword(''); setSignInError(''); }}
                className="text-neutral-400 hover:text-neutral-950 p-1.5 transition cursor-pointer font-black text-lg border-2 border-transparent hover:border-neutral-950"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-neutral-400 font-extrabold uppercase block tracking-wider">EMAIL ADDRESS</label>
                <input 
                  type="email" 
                  required 
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  placeholder="you@domain.com" 
                  className="w-full border-2 border-neutral-300 rounded-none px-4 py-3 focus:outline-none focus:border-emerald-600 bg-neutral-50 focus:bg-white text-xs font-bold text-neutral-900 tracking-wide"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono text-neutral-400 font-extrabold uppercase block tracking-wider">PASSWORD</label>
                <input 
                  type="password" 
                  required 
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full border-2 border-neutral-300 rounded-none px-4 py-3 focus:outline-none focus:border-emerald-600 bg-neutral-50 focus:bg-white text-xs font-bold text-neutral-900 tracking-wide"
                />
              </div>

              {signInError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-[10.5px] font-bold text-rose-700 uppercase tracking-wider leading-relaxed">
                  ⚠️ {signInError}
                </div>
              )}

              <button 
                type="submit" 
                className="w-full bg-neutral-950 hover:bg-neutral-900 text-white font-black py-3 px-4 rounded-none text-xs uppercase tracking-widest transition cursor-pointer flex items-center justify-center gap-1.5 border-2 border-neutral-950 shadow-[4px_4px_0px_0px_rgba(16,185,129,1)] hover:shadow-none"
              >
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>SIGN IN NOW</span>
              </button>
            </form>

            <div className="bg-neutral-50 p-4 border border-neutral-200 text-[10px] font-mono text-neutral-600 space-y-1.5 uppercase leading-relaxed font-semibold">
              <span className="font-extrabold text-emerald-700 block">💡 INSTANT DEMO TESTING:</span>
              <div className="space-y-0.5">
                <div>• Hiring Partner: <strong className="text-neutral-900">recruiter@dsp.com</strong> / <strong className="text-neutral-900">password123</strong></div>
                <div>• Specialist: <strong className="text-neutral-900">talent@dsp.com</strong> / <strong className="text-neutral-900">password123</strong></div>
              </div>
            </div>

            <div className="text-center pt-2 border-t border-dashed border-neutral-200">
              <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                New to the platform?{' '}
              </span>
              <button
                onClick={() => {
                  setIsSignInModalOpen(false);
                  setOnboardingData(null);
                  setCurrentPage('home');
                }}
                className="text-[10px] uppercase font-black text-emerald-600 hover:text-emerald-800 hover:underline tracking-wider cursor-pointer"
              >
                Start Onboarding to Register
              </button>
            </div>

          </div>
        </div>
      )}

      {/* GLOBAL FOOTER */}
      <Footer setCurrentPage={setCurrentPage} />

      {/* CONFETTI SUCCESS TRIGGER */}
      <ConfettiSuccess 
        isActive={showConfetti} 
        onComplete={() => setShowConfetti(false)} 
        message={confettiMessage} 
      />

    </div>
  );
}
