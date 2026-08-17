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
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';

import { Header, Footer } from './components/HeaderAndFooter';
import TalentDirectory from './components/TalentDirectory';
import FAQSection from './components/FAQSection';
import HomeOverview from './components/HomeOverview';
import EmployerWorkspace from './components/EmployerWorkspace';
import TalentDashboard from './components/TalentDashboard';
import TalentSignup from './components/TalentSignup';
import PracticeAssessment from './components/PracticeAssessment';
import PricingPlans from './components/PricingPlans';
import ConversationalOnboarding from './components/ConversationalOnboarding';
import ConfettiSuccess from './components/ConfettiSuccess';
import { useSupabase } from './context/SupabaseContext';
import { supabase } from './lib/supabaseClient';
import AdminOperations from './components/AdminOperations';
import { useSecureLogin } from './hooks/useSecureLogin';
import ProtectedRoute from './components/ProtectedRoute';
import TalentProfile from './components/TalentProfile';
import TalentPortfolioModal from './components/TalentPortfolioModal';
import PublicPortfolio from './components/PublicPortfolio';
import RecruiterSignup from './components/RecruiterSignup';
import RecruiterLogin from './components/RecruiterLogin';
import RecruiterDashboard from './components/RecruiterDashboard';
import { Preloader } from './components/Preloader';
import { PageType } from './types';

export default function App() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const { 
    user, 
    signIn, 
    handleTalentRegistration, 
    handleRecruiterRegistration,
    handleOnboardingSubmit
  } = useSupabase();

  const {
    loading: isSecureLoggingIn,
    error: secureLoginError,
    setError: setSecureLoginError,
    handleSecureLogin
  } = useSecureLogin();

  // Role toggle for sign-in gateway
  const [signInRole, setSignInRole] = useState<'talent' | 'recruiter' | 'admin'>('talent');

  // Navigation State
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [signupPackage, setSignupPackage] = useState<'starter_tier' | 'annual_unlimited'>('starter_tier');

  // Dedicated Portfolio Modal State
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [selectedPublicSlug, setSelectedPublicSlug] = useState<string | undefined>(undefined);

  // Helper to map currentPage to pathname
  const pageToPath = (page: PageType) => {
    switch (page) {
      case 'home': return '/';
      case 'directory': return '/directory';
      case 'employer': return '/employer';
      case 'recruiter-signup': return '/recruiter/signup';
      case 'recruiter-login': return '/recruiter/login';
      case 'recruiter-dashboard': return '/recruiter/dashboard';
      case 'talent': return '/talent-profile';
      case 'assessment': return '/assessment';
      case 'pricing': return '/pricing';
      case 'admin': return '/admin-profile';
      case 'admin-login': return '/admin-login';
      default: return '/';
    }
  };

  // Helper to map pathname or hash to currentPage and optional candidate slug
  const getRouteFromLocation = (): { 
    page: PageType; 
    slug?: string; 
    packageType?: 'starter_tier' | 'annual_unlimited' 
  } => {
    let rawPath = window.location.pathname;

    // Check if user entered via a hash URL (e.g., /#/directory, /#/marcus-vance, /#/p/marcus-vance, /#/recruiter/signup, or #directory)
    let rawHash = window.location.hash || '';
    if (rawHash) {
      const hashContent = rawHash.replace(/^#\/?/, '/');
      if (hashContent) {
        rawPath = hashContent.startsWith('/') ? hashContent : '/' + hashContent;
      }
    }

    // Also parse search params from both pathname and hash
    let searchStr = window.location.search;
    if (rawHash.includes('?')) {
      searchStr = rawHash.substring(rawHash.indexOf('?'));
    }
    const urlParams = new URLSearchParams(searchStr);
    const pkgParam = urlParams.get('package');
    const packageType: 'starter_tier' | 'annual_unlimited' = 
      (pkgParam === 'annual_unlimited' || pkgParam === 'annual') 
        ? 'annual_unlimited' 
        : 'starter_tier';

    // Strip query string and trailing slashes for clean route path matching
    let pathWithoutQuery = rawPath.split('?')[0];
    let cleaned = decodeURIComponent(pathWithoutQuery.replace(/\/$/, '')).trim();

    // Direct candidate profile link: /p/some-slug
    if (cleaned.startsWith('/p/')) {
      const slug = cleaned.replace('/p/', '').trim();
      return { page: 'directory', slug };
    }

    const lower = cleaned.toLowerCase();
    if (lower === '' || lower === '/') return { page: 'home' };
    if (lower === '/directory') return { page: 'directory' };
    if (lower === '/recruiter/signup' || lower === '/recruiter-signup' || lower === '/employer/signup' || lower === '/signup/recruiter') {
      return { page: 'recruiter-signup', packageType };
    }
    if (lower === '/recruiter/login' || lower === '/recruiter-login' || lower === '/employer/login' || lower === '/login/recruiter') {
      return { page: 'recruiter-login' };
    }
    if (lower === '/recruiter/dashboard' || lower === '/recruiter-dashboard') {
      return { page: 'recruiter-dashboard' };
    }
    if (lower === '/recruiter-profile' || lower === '/employer') return { page: 'employer' };
    if (lower === '/talent-profile' || lower === '/talent') return { page: 'talent' };
    if (lower === '/assessment') return { page: 'assessment' };
    if (lower === '/pricing') return { page: 'pricing' };
    if (lower === '/admin-profile' || lower === '/admin') return { page: 'admin' };
    if (lower === '/admin-login') return { page: 'admin-login' };

    // Direct candidate slug / name route: /[talent-name] or /[talent-slug]
    const candidateIdentifier = cleaned.replace(/^\//, '').trim();
    if (candidateIdentifier && candidateIdentifier !== '' && !candidateIdentifier.includes('/')) {
      return { page: 'directory', slug: candidateIdentifier };
    }

    return { page: 'home' };
  };

  // 1. Initial Load and popstate/hashchange listener
  useEffect(() => {
    const syncRouteFromURL = () => {
      const route = getRouteFromLocation();

      if (route.slug) {
        // Ensure hash URL is kept as /#/p/slug so edge proxies always hit index.html (no 404 on direct hit/refresh)
        window.history.replaceState(null, '', `/#/p/${route.slug}`);
        setSelectedPublicSlug(route.slug);
        setIsPortfolioModalOpen(true);
      } else {
        // Ensure modal is closed when visiting any non-profile route
        setSelectedPublicSlug(undefined);
        setIsPortfolioModalOpen(false);

        if (route.packageType) {
          setSignupPackage(route.packageType);
        }

        if (window.location.hash && !window.location.hash.includes('/p/')) {
          const targetPath = pageToPath(route.page);
          const currentFull = route.packageType ? `${targetPath}?package=${route.packageType}` : targetPath;
          window.history.replaceState(null, '', currentFull);
        }
      }

      setCurrentPage(route.page);
    };

    syncRouteFromURL();

    window.addEventListener('popstate', syncRouteFromURL);
    window.addEventListener('hashchange', syncRouteFromURL);
    return () => {
      window.removeEventListener('popstate', syncRouteFromURL);
      window.removeEventListener('hashchange', syncRouteFromURL);
    };
  }, []);

  // 2. Synchronize URL pathname on state change
  useEffect(() => {
    const currentPath = window.location.pathname;
    const targetPath = pageToPath(currentPage);
    if (currentPath !== targetPath && !currentPath.startsWith('/p/')) {
      const fullTarget = (currentPage === 'recruiter-signup' && signupPackage) 
        ? `${targetPath}?package=${signupPackage}` 
        : targetPath;
      window.history.pushState(null, '', fullTarget);
    }
  }, [currentPage, signupPackage]);

  // Confetti Success States
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiMessage, setConfettiMessage] = useState('SUCCESSFULLY REGISTERED!');

  // Check if current view is a dedicated authenticated/operations dashboard
  const isDashboardPage = ['talent', 'employer', 'recruiter-dashboard', 'admin'].includes(currentPage);

  // Shared Global States
  const [employerSlots, setEmployerSlots] = useState<number>(1);
  const [isTalentPaid, setIsTalentPaid] = useState<boolean>(false);
  
  // Sign In State
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInError, setSignInError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Modals Core Settings
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);
  const [hireForm, setHireForm] = useState({ name: '', company: '', roleNeeded: 'AI Automation', message: '' });
  const [hireSubmitted, setHireSubmitted] = useState(false);

  const [isTalentModalOpen, setIsTalentModalOpen] = useState(false);
  const [talentForm, setTalentForm] = useState({ name: '', email: '', track: 'Internship Track', skills: '' });
  const [talentSubmitted, setTalentSubmitted] = useState(false);

  // Active Onboarded User State
  const [onboardingData, setOnboardingData] = useState<{
    userType: 'talent' | 'recruiter' | 'admin' | null;
    userName: string;
    careerGoal?: string;
    specialty?: string;
    experienceLevel?: string;
    email?: string;
    portfolioUrl?: string;
    profilePictureUrl?: string;
    slug?: string;
    orgName?: string;
    orgSize?: string;
    industry?: string;
    neededRole?: string;
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
      
      let userType = user.user_metadata?.role || user.user_metadata?.user_type || 'talent';
      
      try {
        // 1. Fetch user role from user_roles table
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role_type')
          .eq('user_id', user.id)
          .maybeSingle();

        if (roleData?.role_type) {
          userType = roleData.role_type;
        }
      } catch (roleErr) {
        console.warn('Could not load role from user_roles table, utilizing metadata fallback:', roleErr);
      }

      if (userType === 'admin') {
        setOnboardingData({
          userType: 'admin',
          userName: user.user_metadata?.full_name || 'System Staff',
          email: user.email
        });
        return;
      }

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
              experienceLevel: data.experience_level === 'fresher' || data.experience_level === 'Fresher/Newbie' ? 'Fresher/Newbie' : 'Seasoned Professional',
              email: user.email,
              portfolioUrl: data.portfolio_url || user.user_metadata?.portfolio_url || '',
              profilePictureUrl: data.profile_picture_url,
              slug: data.slug || (data.full_name ? data.full_name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '')
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
    setSecureLoginError(null);

    const email = signInEmail.trim();
    const password = signInPassword.trim();

    if (!email || !password) {
      setSignInError('Please provide both email and password.');
      return;
    }

    try {
      const result = await handleSecureLogin(email, password, signInRole);
      if (result.success) {
        setOnboardingData(result.onboarding);
        setIsSignInModalOpen(false);
        setSignInEmail('');
        setSignInPassword('');
        if (signInRole === 'admin') {
          setCurrentPage('admin');
        } else if (signInRole === 'recruiter') {
          setCurrentPage('employer');
        } else {
          setCurrentPage('talent');
        }
      }
    } catch (err: any) {
      console.error('Sign-in submission error:', err);
      setSignInError(err?.message || 'An unexpected error occurred during role-verification.');
    }
  };

  const navigateToPage = (
    pageName: PageType, 
    extraParams?: { package?: 'starter_tier' | 'annual_unlimited'; slug?: string }
  ) => {
    setIsPortfolioModalOpen(false);
    setSelectedPublicSlug(undefined);
    if (extraParams?.package) {
      setSignupPackage(extraParams.package);
    }
    setCurrentPage(pageName);
    const basePath = pageToPath(pageName);
    const fullPath = extraParams?.package ? `${basePath}?package=${extraParams.package}` : basePath;
    window.history.pushState(null, '', fullPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isInitialLoading) {
    return <Preloader onComplete={() => setIsInitialLoading(false)} />;
  }

  return (
    <div className="min-h-screen bg-white text-neutral-850 font-sans antialiased selection:bg-emerald-500/30 selection:text-neutral-900">
      
      {/* GLOBAL HEADER (Hidden on isolated dashboards: Talent, Recruiter, Employer, and Admin) */}
      {!isDashboardPage && (
        <Header 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage} 
          openHireModal={() => setIsHireModalOpen(true)}
          openTalentModal={() => setIsTalentModalOpen(true)}
          employerSlots={employerSlots}
          isLoggedIn={Boolean(onboardingData !== null || user !== null)}
          userName={onboardingData?.userName || (user?.user_metadata?.name as string) || (user?.email ? user.email.split('@')[0] : '')}
          userEmail={onboardingData?.email || user?.email || ''}
          userType={onboardingData?.userType || (user?.user_metadata?.role as any) || (user?.user_metadata?.userType as any) || 'talent'}
          onSignInClick={() => {
            setSignInError('');
            setIsSignInModalOpen(true);
          }}
          onSignOutClick={async () => {
            try {
              await supabase.auth.signOut();
            } catch (e) {
              // Ignore
            }
            setOnboardingData(null);
            navigateToPage('home');
          }}
          onVisitDashboard={() => {
            if (onboardingData?.userType === 'recruiter') {
              navigateToPage('recruiter-dashboard');
            } else if (onboardingData?.userType === 'admin') {
              navigateToPage('admin');
            } else {
              navigateToPage('talent');
            }
          }}
          onVisitPortfolio={() => {
            setIsPortfolioModalOpen(true);
          }}
        />
      )}

      {/* PRIMARY VIEWS CONTAINER */}
      <main className="min-h-[70vh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            
            {/* View 1: Home/Overview Landing Page */}
            {currentPage === 'home' && (
              <div>
                {onboardingData && (
                  <div className="bg-emerald-50/90 text-emerald-900 px-4 sm:px-8 py-2.5 text-xs font-semibold flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-emerald-200/80">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Active Workspace: <strong>{onboardingData.userName}</strong> ({onboardingData.userType === 'talent' ? 'Vetted Talent' : onboardingData.userType === 'recruiter' ? 'Recruiter' : 'Guest Explorer'})</span>
                    </div>
                    <button 
                      onClick={() => {
                        setOnboardingData(null);
                        setCurrentPage('home');
                      }}
                      className="bg-white hover:bg-slate-100 text-slate-700 font-semibold py-1 px-3 border border-slate-200 rounded-lg text-xs cursor-pointer transition shadow-2xs"
                    >
                      Reset Session
                    </button>
                  </div>
                )}
                <HomeOverview 
                  navigateToPage={navigateToPage} 
                  openHireModal={() => setIsHireModalOpen(true)} 
                  openTalentModal={() => setIsTalentModalOpen(true)} 
                />
              </div>
            )}

            {/* View 2: Find Talent (Directory Page) */}
            {currentPage === 'directory' && (
              <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
                <div className="text-left border-b border-slate-200/80 pb-6 space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      VERIFIED DIRECTORY
                    </span>
                    <span className="text-[11px] font-mono font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                      1,400+ CANDIDATES
                    </span>
                  </div>
                  <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight">
                    Browse Digital Talent & Growth Specialists
                  </h2>
                  <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
                    Every candidate has passed diagnostic testing, practical scenario evaluations, and verified work portfolio reviews. Unlock full candidate files below.
                  </p>
                </div>
                
                <TalentDirectory 
                  employerSlots={employerSlots} 
                  setEmployerSlots={setEmployerSlots}
                  navigateToPricing={() => navigateToPage('pricing')}
                  selectedSlug={selectedPublicSlug}
                  onSelectCandidateSlug={(slug) => setSelectedPublicSlug(slug)}
                  onCloseProfileModal={() => setSelectedPublicSlug(undefined)}
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
                  onSignOut={() => {
                    setOnboardingData(null);
                    navigateToPage('home');
                  }}
                  onNavigateToDirectory={() => navigateToPage('directory')}
                />
              </section>
            )}

            {/* View 4: Talent Vetting Hub Dashboard (/talent-profile) */}
            {currentPage === 'talent' && (
              <ProtectedRoute requiredRole="talent" fallbackPage="/">
                <TalentProfile 
                  onSignOut={() => {
                    setOnboardingData(null);
                    setCurrentPage('home');
                  }}
                  navigateToPage={navigateToPage}
                />
              </ProtectedRoute>
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

            {/* View 7: Staff/Admin Operations Command Center Dashboard (/admin-profile) */}
            {currentPage === 'admin' && (
              <AdminOperations 
                mode="dashboard" 
                onBackToMain={() => navigateToPage('home')} 
                onRedirectToLogin={() => navigateToPage('admin-login')} 
              />
            )}

            {/* View 8: Staff/Admin Login Portal (/admin-login) */}
            {currentPage === 'admin-login' && (
              <AdminOperations 
                mode="login" 
                onBackToMain={() => navigateToPage('home')} 
                onLoginSuccess={() => navigateToPage('admin')} 
              />
            )}

            {/* View 9: Recruiter Registration & Sourcing Package Purchase (/recruiter/signup) */}
            {currentPage === 'recruiter-signup' && (
              <RecruiterSignup 
                initialPackage={signupPackage}
                onNavigateToLogin={() => navigateToPage('recruiter-login')}
                onNavigateToHome={() => navigateToPage('home')}
              />
            )}

            {/* View 10: Recruiter Portal Login (/recruiter/login) */}
            {currentPage === 'recruiter-login' && (
              <RecruiterLogin 
                onNavigateToDashboard={() => navigateToPage('recruiter-dashboard')}
                onNavigateToSignup={() => navigateToPage('recruiter-signup')}
                onNavigateToHome={() => navigateToPage('home')}
              />
            )}

            {/* View 11: Recruiter Direct Sourcing Dashboard (/recruiter/dashboard) */}
            {currentPage === 'recruiter-dashboard' && (
              <RecruiterDashboard 
                onSignOut={() => {
                  setOnboardingData(null);
                  navigateToPage('home');
                }}
                onNavigateToDirectory={() => navigateToPage('directory')}
                onNavigateToPricing={() => navigateToPage('pricing')}
              />
            )}

          </motion.div>
        </AnimatePresence>
      </main>

      {/* FOOTER MODAL - HIRE GENERAL FORM */}
      {isHireModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 text-left relative shadow-2xl">
            <button 
              onClick={() => { setIsHireModalOpen(false); setHireSubmitted(false); }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
            >
              ✕
            </button>
            <div className="border-b border-slate-100 pb-4 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                Talent Matchmaking
              </span>
              <h3 className="font-display font-bold text-xl text-slate-900">
                Request Verified Talent Match
              </h3>
              <p className="text-xs text-slate-500">
                Tell us your role requirements and we will route matching profiles within 24 hours.
              </p>
            </div>
            {hireSubmitted ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-display font-bold text-base text-slate-900">Request Received</h4>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                  Your requirements have been recorded. Our talent matching coordinators will connect with you shortly.
                </p>
                <button
                  onClick={() => { setIsHireModalOpen(false); setHireSubmitted(false); }}
                  className="mt-2 bg-emerald-600 text-white text-xs font-semibold py-2 px-4 rounded-xl cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form 
                onSubmit={(e) => { e.preventDefault(); setHireSubmitted(true); }}
                className="space-y-4 text-xs"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 block">Your Name</label>
                    <input 
                      type="text" 
                      required 
                      value={hireForm.name} 
                      onChange={(e) => setHireForm({ ...hireForm, name: e.target.value })}
                      placeholder="e.g. Alex Smith" 
                      className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50/50 focus:bg-white text-xs text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 block">Company Name</label>
                    <input 
                      type="text" 
                      required 
                      value={hireForm.company} 
                      onChange={(e) => setHireForm({ ...hireForm, company: e.target.value })}
                      placeholder="e.g. Acme Corp" 
                      className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50/50 focus:bg-white text-xs text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 block">Specialization Needed</label>
                  <select 
                    value={hireForm.roleNeeded}
                    onChange={(e) => setHireForm({ ...hireForm, roleNeeded: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50/50 text-xs text-slate-800 cursor-pointer"
                  >
                    <option value="AI Automation">AI Automation Operations</option>
                    <option value="Full-Stack Developer">Full-Stack Developer</option>
                    <option value="SEO">SEO & Content Architecture</option>
                    <option value="Growth Marketing">Paid Media & CRO Growth Marketing</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 block">Brief Campaign Details / Requirements</label>
                  <textarea 
                    rows={3} 
                    required 
                    value={hireForm.message} 
                    onChange={(e) => setHireForm({ ...hireForm, message: e.target.value })}
                    placeholder="Describe specific tech stack, timezone, or project scope requirements..." 
                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50/50 focus:bg-white text-xs text-slate-800"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl text-xs cursor-pointer shadow-xs hover:shadow-sm transition"
                >
                  Submit Hiring Brief
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* TALENT SIGNUP MODAL */}
      {isTalentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-md my-auto">
            <button 
              onClick={() => setIsTalentModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 z-20 bg-white/90 border border-slate-200 w-8 h-8 flex items-center justify-center rounded-full cursor-pointer shadow-2xs"
              aria-label="Close modal"
            >
              ✕
            </button>
            <TalentSignup 
              onSuccess={() => {
                setIsTalentModalOpen(false);
                setCurrentPage('talent');
                setConfettiMessage('TALENT ACCOUNT CREATED! WELCOME TO THE PIPELINE.');
                setShowConfetti(true);
              }}
              onSwitchToLogin={() => {
                setIsTalentModalOpen(false);
                setIsSignInModalOpen(true);
              }}
            />
          </div>
        </div>
      )}

      {/* SIGN IN MODAL */}
      <AnimatePresence>
        {isSignInModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 text-left relative shadow-2xl"
            >
              
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full">
                    Authentication
                  </span>
                  <h3 className="font-display font-bold text-xl text-slate-900 leading-tight">
                    Sign In to Account
                  </h3>
                  <p className="text-xs text-slate-500">
                    Select your portal and enter your credentials.
                  </p>
                </div>
                <button 
                  onClick={() => { 
                    setIsSignInModalOpen(false); 
                    setSignInEmail(''); 
                    setSignInPassword(''); 
                    setSignInError(''); 
                    setSecureLoginError(null); 
                    setShowPassword(false);
                  }}
                  disabled={isSecureLoggingIn}
                  className="text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Multi-Track Tabs: Talent, Recruiter & Admin */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Account Type</span>
                <div className="grid grid-cols-3 bg-slate-100 p-1 rounded-xl">
                  {(['talent', 'recruiter', 'admin'] as const).map((role) => (
                    <button
                      key={role}
                      type="button"
                      disabled={isSecureLoggingIn}
                      onClick={() => {
                        setSignInRole(role);
                        setSignInEmail('');
                        setSignInPassword('');
                        setSecureLoginError(null);
                        setSignInError('');
                      }}
                      className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center disabled:opacity-50 ${
                        signInRole === role
                          ? 'bg-white text-slate-900 shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {role === 'talent' && 'Talent'}
                      {role === 'recruiter' && 'Recruiter'}
                      {role === 'admin' && 'Admin'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Animated Form Content for Selected Role */}
              <AnimatePresence mode="wait">
                <motion.form 
                  key={signInRole}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                  onSubmit={handleSignInSubmit} 
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 block">Email Address</label>
                    <input 
                      type="email" 
                      required 
                      disabled={isSecureLoggingIn}
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      placeholder={
                        signInRole === 'talent' ? 'talent@digitalcampux.com' :
                        signInRole === 'recruiter' ? 'recruiter@digitalcampux.com' :
                        'admin@digitalcampux.com'
                      } 
                      className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50/50 focus:bg-white text-xs font-medium text-slate-900 disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-700 block">Password</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        required 
                        disabled={isSecureLoggingIn}
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        placeholder="••••••••" 
                        className="w-full border border-slate-300 rounded-xl pl-3.5 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50/50 focus:bg-white text-xs font-medium text-slate-900 disabled:opacity-50"
                      />
                      <button
                        id="toggle-password-visibility-btn"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isSecureLoggingIn}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Error Notification */}
                  {(secureLoginError || signInError) && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl space-y-0.5">
                      <div className="font-semibold text-rose-900">
                        Authentication Failed
                      </div>
                      <div className="text-rose-700 text-[11px]">
                        {secureLoginError || signInError}
                      </div>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={isSecureLoggingIn}
                    className={`w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-xs ${
                      isSecureLoggingIn ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSecureLoggingIn ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 text-emerald-100" />
                        <span>Sign In as {signInRole.charAt(0).toUpperCase() + signInRole.slice(1)}</span>
                      </>
                    )}
                  </button>
                </motion.form>
              </AnimatePresence>

              <div className="text-center pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-500">
                  Need a candidate account?{' '}
                </span>
                <button
                  onClick={() => {
                    setIsSignInModalOpen(false);
                    setIsTalentModalOpen(true);
                  }}
                  disabled={isSecureLoggingIn}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                >
                  Apply as Vetted Talent
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GLOBAL FOOTER (Hidden on isolated dashboard views) */}
      {!isDashboardPage && (
        <Footer setCurrentPage={setCurrentPage} />
      )}

      {/* CONFETTI SUCCESS TRIGGER */}
      <ConfettiSuccess 
        isActive={showConfetti} 
        onComplete={() => setShowConfetti(false)} 
        message={confettiMessage} 
      />

      {/* DEDICATED TALENT PORTFOLIO SHOWCASE MODAL */}
      <TalentPortfolioModal
        isOpen={isPortfolioModalOpen}
        publicSlug={selectedPublicSlug}
        onClose={() => {
          setIsPortfolioModalOpen(false);
          setSelectedPublicSlug(undefined);
          if (window.location.hash.includes('/p/') || window.location.pathname.startsWith('/p/')) {
            window.history.pushState(null, '', pageToPath(currentPage));
          }
        }}
        onNavigateToDashboard={() => {
          setIsPortfolioModalOpen(false);
          setSelectedPublicSlug(undefined);
          if (onboardingData?.userType === 'recruiter') {
            setCurrentPage('employer');
          } else if (onboardingData?.userType === 'admin') {
            setCurrentPage('admin');
          } else {
            setCurrentPage('talent');
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onboardingData={onboardingData}
      />

    </div>
  );
}
