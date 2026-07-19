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
import { useSupabase } from './context/SupabaseContext';
import { supabase } from './lib/supabaseClient';
import AdminOperations from './components/AdminOperations';
import { useSecureLogin } from './hooks/useSecureLogin';

export default function App() {
  const { 
    user, 
    signIn, 
    handleTalentRegistration, 
    handleRecruiterRegistration 
  } = useSupabase();

  const {
    loading: isSecureLoggingIn,
    error: secureLoginError,
    setError: setSecureLoginError,
    handleSecureLogin
  } = useSecureLogin();

  // Role toggle for sign-in gateway
  const [signInRole, setSignInRole] = useState<'talent' | 'recruiter'>('talent');

  // Navigation State
  const [currentPage, setCurrentPage] = useState<'home' | 'directory' | 'employer' | 'talent' | 'assessment' | 'pricing' | 'admin'>('home');

  // Helper to map currentPage to pathname
  const pageToPath = (page: 'home' | 'directory' | 'employer' | 'talent' | 'assessment' | 'pricing' | 'admin') => {
    switch (page) {
      case 'home': return '/';
      case 'directory': return '/directory';
      case 'employer': return '/recruiter-profile';
      case 'talent': return '/talent-profile';
      case 'assessment': return '/assessment';
      case 'pricing': return '/pricing';
      case 'admin': return '/admin-profile';
      default: return '/';
    }
  };

  // Helper to map pathname to currentPage
  const pathToPage = (path: string): 'home' | 'directory' | 'employer' | 'talent' | 'assessment' | 'pricing' | 'admin' => {
    const cleaned = path.replace(/\/$/, '').toLowerCase();
    if (cleaned === '/directory') return 'directory';
    if (cleaned === '/recruiter-profile') return 'employer';
    if (cleaned === '/talent-profile') return 'talent';
    if (cleaned === '/assessment') return 'assessment';
    if (cleaned === '/pricing') return 'pricing';
    if (cleaned === '/admin-profile') return 'admin';
    return 'home';
  };

  // 1. Initial Load and popstate (back/forward) listener
  useEffect(() => {
    const initialPage = pathToPage(window.location.pathname);
    if (initialPage !== currentPage) {
      setCurrentPage(initialPage);
    }

    const handlePopState = () => {
      const targetPage = pathToPage(window.location.pathname);
      setCurrentPage(targetPage);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // 2. Synchronize URL pathname on state change
  useEffect(() => {
    const currentPath = window.location.pathname;
    const targetPath = pageToPath(currentPage);
    if (currentPath !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  }, [currentPage]);

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

  // Modals Core Settings
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);
  const [hireForm, setHireForm] = useState({ name: '', company: '', roleNeeded: 'AI Automation', message: '' });
  const [hireSubmitted, setHireSubmitted] = useState(false);

  const [isTalentModalOpen, setIsTalentModalOpen] = useState(false);
  const [talentForm, setTalentForm] = useState({ name: '', email: '', track: 'Internship Track', skills: '' });
  const [talentSubmitted, setTalentSubmitted] = useState(false);

  // Active Onboarded User State
  const [onboardingData, setOnboardingData] = useState<{
    userType: 'talent' | 'recruiter' | null;
    userName: string;
    careerGoal?: 'Internship' | 'Freelance Gigs' | 'Full-Time Remote Job';
    specialty?: string;
    experienceLevel?: 'Fresher/Newbie' | 'Seasoned Professional';
    email?: string;
    orgName?: string;
    orgSize?: string;
    industry?: string;
    neededRole?: 'Interns' | 'Project Freelancers' | 'Full-Time Dedicated Talent';
  } | null>(null);

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
            careerGoal: 'Full-Time Remote Job',
            specialty: 'AI Automation',
            experienceLevel: 'Seasoned Professional',
            email: 'talent@dsp.com'
          }
        }
      ];
      localStorage.setItem('dsp_registered_users', JSON.stringify(demoUsers));
    }
  }, []);

  // Monitor Supabase session automatically and load profile details
  useEffect(() => {
    const syncSessionUser = async () => {
      if (!user) return;
      
      const userType = user.user_metadata?.user_type || 'talent';
      try {
        const table = userType === 'recruiter' ? 'recruiter_profiles' : 'talent_profiles';
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (data) {
          if (userType === 'recruiter') {
            setOnboardingData({
              userType: 'recruiter',
              userName: data.organization_name || user.user_metadata?.full_name || 'Recruiter Client',
              orgName: data.organization_name,
              orgSize: data.organization_size,
              industry: data.industry_vertical,
              neededRole: data.needed_talent_role,
              email: user.email
            });
          } else {
            setOnboardingData({
              userType: 'talent',
              userName: data.full_name || user.user_metadata?.full_name || 'Talent Specialist',
              careerGoal: data.career_goal,
              specialty: data.specialty,
              experienceLevel: data.experience_level,
              email: user.email
            });
            if (data.vetting_status === 'fee_paid' || data.vetting_status === 'completed') {
              setIsTalentPaid(true);
            }
          }
        }
      } catch (err) {
        console.warn('Could not load session parameters from database on refresh, utilizing localStorage coordinates.', err);
      }
    };
    syncSessionUser();
  }, [user]);

  // Handle Login Authentication with robust fallback
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError('');

    const email = signInEmail.trim();
    const password = signInPassword.trim();

    if (!email || !password) {
      setSignInError('Please provide both email and password.');
      return;
    }

    const result = await handleSecureLogin(email, password, signInRole);
    if (result.success) {
      setOnboardingData(result.onboarding);
      setIsSignInModalOpen(false);
      setSignInEmail('');
      setSignInPassword('');
      if (signInRole === 'recruiter') {
        setCurrentPage('employer');
      } else {
        setCurrentPage('talent');
      }
    }
  };

  const navigateToPage = (pageName: 'home' | 'directory' | 'employer' | 'talent' | 'assessment' | 'pricing' | 'admin') => {
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
                    onComplete={async (data) => {
                      setOnboardingData(data as any);
                      
                      // Trigger confetti success state
                      setConfettiMessage(data.userType === 'recruiter' ? 'RECRUITER PORTAL DEPLOYED!' : 'TALENT PROFILE ACTIVATED!');
                      setShowConfetti(true);

                      // Save user profile securely to Supabase using custom actions
                      if (data.email && data.password) {
                        if (data.userType === 'recruiter') {
                          await handleRecruiterRegistration(data.email, data.password, data as any);
                        } else if (data.userType === 'talent') {
                          await handleTalentRegistration(data.email, data.password, data as any);
                        }

                        // Write secondary LocalStorage fallback
                        const existing = localStorage.getItem('dsp_registered_users');
                        const users = existing ? JSON.parse(existing) : [];
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
                        setCurrentPage('directory'); // Go straight to directory
                      } else if (data.userType === 'talent') {
                        setCurrentPage('talent'); // Go straight to Talent dashboard
                      }
                    }}
                  />
                </div>
              ) : (
                <div>
                  <div className="bg-[#00A86B] text-white p-3 text-center text-xs font-black uppercase tracking-wider flex flex-col sm:flex-row items-center justify-between px-6 sm:px-12 gap-2 border-b-2 border-neutral-950">
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
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] uppercase font-mono font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 border border-emerald-950 inline-block">
                      VERIFIED DIRECTORY
                    </span>
                    <span className="text-[10px] uppercase font-mono font-black text-neutral-500 bg-neutral-100 border border-neutral-300 px-2.5 py-0.5 inline-block">
                      ACTIVE OPERATORS
                    </span>
                  </div>
                  <h2 className="font-display font-black text-3xl sm:text-4xl text-neutral-950 uppercase tracking-tight leading-none">
                    BROWSE DIGITAL OPERATORS & GROWTH SPECIALISTS
                  </h2>
                  <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">
                    Sourced candidates must clear Phase 1-3 screening protocols before catalog inclusion. Unlock actual candidate files below.
                  </p>
                </div>
                
                <TalentDirectory 
                  employerSlots={employerSlots} 
                  setEmployerSlots={setEmployerSlots}
                  navigateToPricing={() => navigateToPage('pricing')}
                  onboardingData={onboardingData as any}
                />
              </section>
            )}

            {/* View 3: Recruiter Workspace Dashboard */}
            {currentPage === 'employer' && (
              <section className="max-w-7xl mx-auto space-y-6">
                <EmployerWorkspace 
                  employerSlots={employerSlots}
                  setEmployerSlots={setEmployerSlots}
                  navigateToPage={navigateToPage}
                />
              </section>
            )}

            {/* View 4: Talent Vetting Hub Dashboard */}
            {currentPage === 'talent' && (
              <section className="max-w-7xl mx-auto space-y-6">
                <TalentDashboard 
                  isTalentPaid={isTalentPaid}
                  setIsTalentPaid={setIsTalentPaid}
                  navigateToPage={navigateToPage}
                  onboardingData={onboardingData as any}
                />
              </section>
            )}

            {/* View 5: Practice Assessment (Self evaluation sandbox) */}
            {currentPage === 'assessment' && (
              <section className="max-w-4xl mx-auto py-12 px-4">
                <PracticeAssessment navigateToPage={navigateToPage} />
              </section>
            )}

            {/* View 6: Pricing Plans & Slots Licensing */}
            {currentPage === 'pricing' && (
              <section className="max-w-7xl mx-auto py-16 px-4">
                <PricingPlans 
                  setEmployerSlots={setEmployerSlots}
                  navigateToPage={navigateToPage}
                />
              </section>
            )}

            {/* View 7: Staff/Admin Operations Command Center */}
            {currentPage === 'admin' && (
              <AdminOperations onBackToMain={() => navigateToPage('home')} />
            )}

          </motion.div>
        </AnimatePresence>
      </main>

      {/* FOOTER MODAL - HIRE GENERAL FORM */}
      {isHireModalOpen && (
        <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-neutral-950 max-w-md w-full p-6 sm:p-8 space-y-6 text-left relative shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <button 
              onClick={() => { setIsHireModalOpen(false); setHireSubmitted(false); }}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-950 font-mono font-black"
            >
              ✕
            </button>
            <div className="border-b border-neutral-100 pb-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-805 bg-emerald-50 px-2 py-0.5">PLATFORM MATCHMAKING</span>
              <h3 className="font-display font-black text-xl text-neutral-950 uppercase tracking-tight mt-1">Acquire Managed Growth Talent</h3>
            </div>
            {hireSubmitted ? (
              <div className="text-center py-6 space-y-4">
                <CheckCircle2 className="w-12 h-12 text-[#00A86B] mx-auto" />
                <h4 className="font-display font-black text-sm uppercase tracking-wider text-neutral-900">ACQUISITION BRIEF FILED</h4>
                <p className="text-xs text-neutral-500 uppercase font-semibold">Your corporate preferences have been recorded. Our partner matchmaking coordinators will review and route a matched talent pipeline within 2 hours.</p>
              </div>
            ) : (
              <form 
                onSubmit={(e) => { e.preventDefault(); setHireSubmitted(true); }}
                className="space-y-4 text-xs font-sans"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-neutral-400 font-bold uppercase block">Your Name</label>
                    <input 
                      type="text" 
                      required 
                      value={hireForm.name} 
                      onChange={(e) => setHireForm({ ...hireForm, name: e.target.value })}
                      placeholder="e.g. Sterling" 
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
                      placeholder="e.g. Acme Corp" 
                      className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-neutral-50/50 focus:bg-white text-xs text-neutral-800"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-neutral-400 font-bold uppercase block">Specialization Required</label>
                  <select 
                    value={hireForm.roleNeeded}
                    onChange={(e) => setHireForm({ ...hireForm, roleNeeded: e.target.value })}
                    className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-neutral-50/50 text-xs text-neutral-800"
                  >
                    <option value="AI Automation">AI Automation operations</option>
                    <option value="SEO">SEO (Organic/Programmatic)</option>
                    <option value="Growth Marketing">Paid Media & CRO Growth Marketing</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-neutral-400 font-bold uppercase block">Brief Campaign Details / Requirements</label>
                  <textarea 
                    rows={3} 
                    required 
                    value={hireForm.message} 
                    onChange={(e) => setHireForm({ ...hireForm, message: e.target.value })}
                    placeholder="Describe the campaign parameters, budget constraints, or toolsets integrations required..." 
                    className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-neutral-50/50 focus:bg-white text-xs text-neutral-800"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-[#0a1b10] hover:bg-neutral-900 text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase cursor-pointer"
                >
                  File Campaign Brief
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* FOOTER MODAL - REGISTER GENERAL FORM */}
      {isTalentModalOpen && (
        <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-neutral-950 max-w-md w-full p-6 sm:p-8 space-y-6 text-left relative shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <button 
              onClick={() => { setIsTalentModalOpen(false); setTalentSubmitted(false); }}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-950 font-mono font-black"
            >
              ✕
            </button>
            <div className="border-b border-neutral-100 pb-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-805 bg-emerald-50 px-2 py-0.5">ACCREDITATION MATCHMAKING</span>
              <h3 className="font-display font-black text-xl text-neutral-950 uppercase tracking-tight mt-1">Initiate Vetting Protocol</h3>
            </div>
            {talentSubmitted ? (
              <div className="text-center py-6 space-y-4">
                <CheckCircle2 className="w-12 h-12 text-[#00A86B] mx-auto" />
                <h4 className="font-display font-black text-sm uppercase tracking-wider text-neutral-900">PROTOCOLS INITIATED</h4>
                <p className="text-xs text-neutral-500 uppercase font-semibold">Your verification record has been staged. A vetting link has been dispatched to your email coordinates to activate Phase 1 diagnostic.</p>
              </div>
            ) : (
              <form 
                onSubmit={(e) => { e.preventDefault(); setTalentSubmitted(true); }}
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
          <div className="bg-white border-4 border-neutral-950 max-w-md w-full p-6 sm:p-8 space-y-6 text-left relative shadow-[8px_8px_0px_0px_rgba(0,168,107,1)]">
            
            <div className="flex items-start justify-between border-b-2 border-dashed border-neutral-200 pb-4">
              <div>
                <span className="text-[9px] uppercase font-mono font-black text-emerald-700 bg-emerald-50 border border-emerald-150 px-2 py-0.5">
                  SECURE ENTRY GATEWAY
                </span>
                <h3 className="font-display font-black text-xl text-neutral-950 uppercase tracking-tight mt-2 leading-none">
                  Sign In to Workspace
                </h3>
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mt-1.5">
                  Enter your verified credentials to access your dashboard.
                </p>
              </div>
              <button 
                onClick={() => { 
                  setIsSignInModalOpen(false); 
                  setSignInEmail(''); 
                  setSignInPassword(''); 
                  setSignInError(''); 
                  setSecureLoginError(null); 
                }}
                disabled={isSecureLoggingIn}
                className="text-neutral-400 hover:text-neutral-950 p-1.5 transition cursor-pointer font-black text-lg border-2 border-transparent hover:border-neutral-950 disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            {/* Explicit Role Selector Toggle */}
            <div className="space-y-2">
              <span className="text-[9px] font-mono text-neutral-400 font-extrabold uppercase block tracking-wider">GATEWAY SECTOR CONTROLLER</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isSecureLoggingIn}
                  onClick={() => {
                    setSignInRole('talent');
                    setSignInEmail('talent@dsp.com');
                    setSignInPassword('');
                    setSecureLoginError(null);
                    setSignInError('');
                  }}
                  className={`py-3 px-4 font-black text-[11px] uppercase tracking-wider transition cursor-pointer border-2 border-neutral-950 text-center ${
                    signInRole === 'talent'
                      ? 'bg-[#00A86B] text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                  } disabled:opacity-50`}
                >
                  Log in as a Talent
                </button>
                <button
                  type="button"
                  disabled={isSecureLoggingIn}
                  onClick={() => {
                    setSignInRole('recruiter');
                    setSignInEmail('recruiter@dsp.com');
                    setSignInPassword('');
                    setSecureLoginError(null);
                    setSignInError('');
                  }}
                  className={`py-3 px-4 font-black text-[11px] uppercase tracking-wider transition cursor-pointer border-2 border-neutral-950 text-center ${
                    signInRole === 'recruiter'
                      ? 'bg-[#00A86B] text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                  } disabled:opacity-50`}
                >
                  Log in as a Recruiter
                </button>
              </div>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-neutral-200"></div>
              <span className="flex-shrink mx-3 text-[9px] font-mono text-neutral-400 font-extrabold uppercase">GATEWAY AUTHS</span>
              <div className="flex-grow border-t border-neutral-200"></div>
            </div>

            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-neutral-400 font-extrabold uppercase block tracking-wider">EMAIL ADDRESS</label>
                <input 
                  type="email" 
                  required 
                  disabled={isSecureLoggingIn}
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  placeholder="you@domain.com" 
                  className="w-full border-2 border-neutral-300 rounded-none px-4 py-3 focus:outline-none focus:border-emerald-600 bg-neutral-50 focus:bg-white text-xs font-bold text-neutral-900 tracking-wide disabled:opacity-50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono text-neutral-400 font-extrabold uppercase block tracking-wider">PASSWORD</label>
                <input 
                  type="password" 
                  required 
                  disabled={isSecureLoggingIn}
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full border-2 border-neutral-300 rounded-none px-4 py-3 focus:outline-none focus:border-emerald-600 bg-neutral-50 focus:bg-white text-xs font-bold text-neutral-900 tracking-wide disabled:opacity-50"
                />
              </div>

              {/* Dynamic Slate/Red Error Panel */}
              {(secureLoginError || signInError) && (
                <div className="p-3.5 bg-neutral-900 border-l-4 border-rose-500 text-neutral-100 text-xs font-semibold rounded-none space-y-1 animate-shake">
                  <div className="text-rose-400 font-mono text-[9px] uppercase tracking-wider font-extrabold flex items-center gap-1">
                    ⚠️ ACCESS DENIED / GATEWAY EXCLUSION
                  </div>
                  <div className="leading-relaxed font-sans text-[11px]">
                    {secureLoginError || signInError}
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isSecureLoggingIn}
                className={`w-full bg-neutral-950 hover:bg-neutral-900 text-white font-black py-3 px-4 rounded-none text-xs uppercase tracking-widest transition cursor-pointer flex items-center justify-center gap-1.5 border-2 border-neutral-950 shadow-[4px_4px_0px_0px_rgba(0,168,107,1)] hover:shadow-none ${
                  isSecureLoggingIn ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSecureLoggingIn ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>VERIFYING PROFILE SECTOR...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-[#00A86B]" />
                    <span>SECURE ACCESS LOG IN</span>
                  </>
                )}
              </button>
            </form>

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
                disabled={isSecureLoggingIn}
                className="text-[10px] uppercase font-black text-[#00A86B] hover:text-emerald-800 hover:underline tracking-wider cursor-pointer disabled:opacity-50"
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
