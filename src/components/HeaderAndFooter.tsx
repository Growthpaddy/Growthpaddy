import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  ShieldCheck, 
  Menu, 
  X, 
  ArrowUpRight, 
  ArrowRight, 
  Mail, 
  Globe, 
  Sparkles, 
  Briefcase, 
  Zap, 
  Shield, 
  Lock, 
  MessageSquare,
  ChevronDown,
  LayoutDashboard,
  FolderKanban,
  LogOut,
  User,
  ExternalLink,
  CheckCircle2,
  Layers,
  Award,
  Users,
  DollarSign,
  FileText
} from 'lucide-react';
import { PageType } from '../types';

interface HeaderProps {
  currentPage?: PageType;
  setCurrentPage?: (page: PageType) => void;
  openHireModal?: () => void;
  openTalentModal?: () => void;
  employerSlots?: number;
  onSignInClick?: () => void;
  onSignOutClick?: () => void;
  onVisitDashboard?: () => void;
  onVisitPortfolio?: () => void;
  isLoggedIn?: boolean;
  userName?: string;
  userEmail?: string;
  userType?: 'talent' | 'recruiter' | 'admin' | null;
}

export function Header({ 
  currentPage = 'home', 
  setCurrentPage, 
  openHireModal, 
  openTalentModal, 
  employerSlots = 1,
  onSignInClick,
  onSignOutClick,
  onVisitDashboard,
  onVisitPortfolio,
  isLoggedIn = false,
  userName = '',
  userEmail = '',
  userType = null
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'employers' | 'talent' | 'resources' | null>(null);
  
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  
  const navRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  // Listen to onAuthStateChange in the Global Navbar
  useEffect(() => {
    const fetchProfile = async (userId: string) => {
      try {
        const { data: recProfile } = await supabase
          .from('recruiter_profiles')
          .select('*')
          .or(`user_id.eq.${userId},id.eq.${userId}`)
          .maybeSingle();
        if (recProfile) setProfile(recProfile);
      } catch (_) {}
    };

    // Initial fetch of session and profile
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setProfile(null);
      } else if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const pageToRoutePath = (id: PageType): string => {
    switch (id) {
      case 'home': return '/';
      case 'directory': return '/directory';
      case 'employer': return '/employer';
      case 'recruiter-signup': return '/recruiter/signup';
      case 'recruiter-login': return '/recruiter/login';
      case 'recruiter-dashboard': return '/recruiter/dashboard';
      case 'talent': return '/talent-profile';
      case 'assessment': return '/assessment';
      case 'pricing': return '/pricing';
      case 'admin': return '/admin';
      case 'admin-dashboard': return '/admin/dashboard';
      case 'admin-login': return '/admin/login';
      case 'admin-register': return '/admin/register';
      case 'admin-approvals': return '/admin/approvals';
      default: return `/${id}`;
    }
  };

  const handleNavClick = (id: PageType) => {
    setIsMenuOpen(false);
    setIsAvatarOpen(false);
    setActiveDropdown(null);
    if (setCurrentPage) {
      setCurrentPage(id);
    }
    const targetPath = pageToRoutePath(id);
    window.history.pushState({}, '', targetPath);
    window.dispatchEvent(new Event('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToVerification = () => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
    if (currentPage !== 'home' && setCurrentPage) {
      setCurrentPage('home');
      setTimeout(() => {
        const el = document.getElementById('verification-engine');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById('verification-engine');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (avatarRef.current && !avatarRef.current.contains(event.target as Node)) {
        setIsAvatarOpen(false);
      }
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDashboardClick = () => {
    setIsMenuOpen(false);
    setIsAvatarOpen(false);
    if (onVisitDashboard) {
      onVisitDashboard();
    } else if (setCurrentPage) {
      setCurrentPage(userType === 'recruiter' ? 'employer' : userType === 'admin' ? 'admin' : 'talent');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePortfolioClick = () => {
    setIsMenuOpen(false);
    setIsAvatarOpen(false);
    if (onVisitPortfolio) {
      onVisitPortfolio();
    } else if (setCurrentPage) {
      setCurrentPage('talent');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSignOut = async () => {
    try {
      setIsMenuOpen(false);
      setIsAvatarOpen(false);
      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
      setUser(null);
      setProfile(null);
      if (onSignOutClick) {
        try {
          onSignOutClick();
        } catch (_) {}
      }
      window.location.href = '/recruiter-login';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/recruiter-login';
    }
  };

  const handleGetStartedClick = () => {
    setIsMenuOpen(false);
    if (openHireModal) {
      openHireModal();
    } else {
      handleNavClick('directory');
    }
  };

  const handleSignInClick = () => {
    setIsMenuOpen(false);
    setIsAvatarOpen(false);
    if (onSignInClick) {
      onSignInClick();
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const effectiveUserType = profile ? 'recruiter' : user?.user_metadata?.role === 'recruiter' ? 'recruiter' : userType;
  const isUserLoggedIn = Boolean(user || (isLoggedIn && user !== null));

  const getRoleInfo = () => {
    if (effectiveUserType === 'recruiter') {
      return {
        label: 'Recruiter Dashboard',
        badge: 'Recruiter',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200'
      };
    }
    if (effectiveUserType === 'admin') {
      return {
        label: 'Admin Command Center',
        badge: 'Admin',
        badgeClass: 'bg-purple-100 text-purple-800 border-purple-200'
      };
    }
    return {
      label: 'Talent Dashboard',
      badge: 'Vetted Talent',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-200'
    };
  };

  const roleInfo = getRoleInfo();
  const displayName = 
    profile?.company_name || 
    profile?.organization_name || 
    user?.user_metadata?.company_name || 
    user?.user_metadata?.full_name || 
    userName || 
    (effectiveUserType === 'recruiter' ? 'Recruiter' : effectiveUserType === 'admin' ? 'Admin Staff' : 'Talent Specialist');

  const displayEmail = user?.email || profile?.business_email || userEmail || '';

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-18">
        
        {/* ========================================================================= */}
        {/* ZONE 1 (LEFT): BRAND LOGO & MARK */}
        {/* ========================================================================= */}
        <button 
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 group cursor-pointer border-0 bg-transparent p-0 text-left focus:outline-none shrink-0"
          id="nav-logo-btn"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-150">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-display font-extrabold text-lg sm:text-xl tracking-tight text-slate-950 leading-none">
              Digital<span className="text-emerald-600">Campux</span>
            </span>
            <span className="text-[9px] font-mono tracking-wider text-slate-400 font-bold mt-0.5">
              VETTED TALENT NETWORK
            </span>
          </div>
        </button>

        {/* ========================================================================= */}
        {/* ZONE 2 (CENTER): DESKTOP NAVIGATION LINKS WITH CLEAN DROPDOWNS */}
        {/* ========================================================================= */}
        <nav ref={navRef} className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-700">
          
          {/* 1. For Employers (with Dropdown) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'employers' ? null : 'employers')}
              className={`flex items-center gap-1.5 py-2 hover:text-slate-950 cursor-pointer transition-colors ${
                activeDropdown === 'employers' ? 'text-emerald-700 font-bold' : ''
              }`}
            >
              <span>For Employers</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${activeDropdown === 'employers' ? 'rotate-180 text-emerald-600' : ''}`} />
            </button>

            {activeDropdown === 'employers' && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200/90 rounded-2xl shadow-xl py-2 z-50 animate-fadeIn text-left">
                <button
                  type="button"
                  onClick={() => handleNavClick('directory')}
                  className="w-full px-4 py-2.5 text-xs text-left font-semibold text-slate-800 hover:bg-slate-50 hover:text-emerald-700 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <span className="block text-slate-900">Browse Talent Directory</span>
                    <span className="block text-[11px] text-slate-400 font-normal">Pre-screened digital specialists</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('pricing')}
                  className="w-full px-4 py-2.5 text-xs text-left font-semibold text-slate-800 hover:bg-slate-50 hover:text-emerald-700 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <span className="block text-slate-900">Employer Pricing</span>
                    <span className="block text-[11px] text-slate-400 font-normal">Transparent tiers & zero markups</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={scrollToVerification}
                  className="w-full px-4 py-2.5 text-xs text-left font-semibold text-slate-800 hover:bg-slate-50 hover:text-emerald-700 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <span className="block text-slate-900">How It Works</span>
                    <span className="block text-[11px] text-slate-400 font-normal">Our 3-step verification gauntlet</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <div className="border-t border-slate-100 my-1 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDropdown(null);
                      if (openHireModal) openHireModal();
                    }}
                    className="w-full px-4 py-2 text-xs text-left font-bold text-emerald-700 hover:bg-emerald-50 flex items-center justify-between"
                  >
                    <span>Request Verified Match →</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. For Talent (with Dropdown) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'talent' ? null : 'talent')}
              className={`flex items-center gap-1.5 py-2 hover:text-slate-950 cursor-pointer transition-colors ${
                activeDropdown === 'talent' ? 'text-emerald-700 font-bold' : ''
              }`}
            >
              <span>For Talent</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${activeDropdown === 'talent' ? 'rotate-180 text-emerald-600' : ''}`} />
            </button>

            {activeDropdown === 'talent' && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200/90 rounded-2xl shadow-xl py-2 z-50 animate-fadeIn text-left">
                <button
                  type="button"
                  onClick={() => handleNavClick('talent')}
                  className="w-full px-4 py-2.5 text-xs text-left font-semibold text-slate-800 hover:bg-slate-50 hover:text-emerald-700 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <span className="block text-slate-900">Talent Dashboard</span>
                    <span className="block text-[11px] text-slate-400 font-normal">Manage profile & verified badges</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('assessment')}
                  className="w-full px-4 py-2.5 text-xs text-left font-semibold text-slate-800 hover:bg-slate-50 hover:text-emerald-700 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <span className="block text-slate-900">Skill Assessment</span>
                    <span className="block text-[11px] text-slate-400 font-normal">Diagnostic test and pass scoring</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={scrollToVerification}
                  className="w-full px-4 py-2.5 text-xs text-left font-semibold text-slate-800 hover:bg-slate-50 hover:text-emerald-700 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <span className="block text-slate-900">Accreditation Process</span>
                    <span className="block text-[11px] text-slate-400 font-normal">Earn the verified quality badge</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <div className="border-t border-slate-100 my-1 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDropdown(null);
                      if (openTalentModal) openTalentModal();
                    }}
                    className="w-full px-4 py-2 text-xs text-left font-bold text-emerald-700 hover:bg-emerald-50 flex items-center justify-between"
                  >
                    <span>Apply as Specialist →</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3. How It Works (Direct Link) */}
          <button
            type="button"
            onClick={scrollToVerification}
            className="py-2 hover:text-slate-950 cursor-pointer transition-colors"
          >
            <span>How It Works</span>
          </button>

          {/* 4. Resources (with Dropdown) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'resources' ? null : 'resources')}
              className={`flex items-center gap-1.5 py-2 hover:text-slate-950 cursor-pointer transition-colors ${
                activeDropdown === 'resources' ? 'text-emerald-700 font-bold' : ''
              }`}
            >
              <span>Resources</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${activeDropdown === 'resources' ? 'rotate-180 text-emerald-600' : ''}`} />
            </button>

            {activeDropdown === 'resources' && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200/90 rounded-2xl shadow-xl py-2 z-50 animate-fadeIn text-left">
                <button
                  type="button"
                  onClick={() => handleNavClick('pricing')}
                  className="w-full px-4 py-2.5 text-xs text-left font-semibold text-slate-800 hover:bg-slate-50 hover:text-emerald-700 flex items-center justify-between"
                >
                  <span>Pricing &amp; Packages</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('directory')}
                  className="w-full px-4 py-2.5 text-xs text-left font-semibold text-slate-800 hover:bg-slate-50 hover:text-emerald-700 flex items-center justify-between"
                >
                  <span>Talent Directory</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('assessment')}
                  className="w-full px-4 py-2.5 text-xs text-left font-semibold text-slate-800 hover:bg-slate-50 hover:text-emerald-700 flex items-center justify-between"
                >
                  <span>Practice Diagnostic Sandbox</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <div className="border-t border-slate-100 my-1 pt-1">
                  <button
                    type="button"
                    onClick={() => handleNavClick('admin-login')}
                    className="w-full px-4 py-2 text-xs text-left font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50 flex items-center justify-between"
                  >
                    <span>Staff Portal</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </div>
            )}
          </div>

        </nav>

        {/* ========================================================================= */}
        {/* ZONE 3 (RIGHT): SIGN IN + GET STARTED (OR USER AVATAR WHEN LOGGED IN) */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-3">
          
          {/* When Logged In: Avatar Dropdown */}
          {isUserLoggedIn ? (
            <div className="relative" ref={avatarRef}>
              <button
                type="button"
                onClick={() => {
                  setIsAvatarOpen(!isAvatarOpen);
                  setIsMenuOpen(false);
                }}
                className={`flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border transition-all duration-150 cursor-pointer shadow-2xs ${
                  isAvatarOpen 
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 shadow-xs' 
                    : 'border-slate-200/90 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-800'
                }`}
                id="header-user-avatar-btn"
                aria-expanded={isAvatarOpen}
                aria-label="User profile menu"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                  {getInitials(displayName)}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-900 tracking-tight leading-tight truncate max-w-[110px]">
                    {displayName}
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-emerald-700 leading-none capitalize">
                    {roleInfo.badge}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isAvatarOpen ? 'rotate-180 text-emerald-600' : ''}`} />
              </button>

              {/* Avatar Dropdown Menu */}
              {isAvatarOpen && (
                <div className="absolute right-0 mt-2.5 w-[250px] sm:w-[270px] bg-white border border-slate-200/90 rounded-2xl shadow-2xl z-50 py-2 animate-fadeIn text-left overflow-hidden divide-y divide-slate-100">
                  <div className="px-4 py-3 bg-slate-50/80">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                        {getInitials(displayName)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {displayName}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${roleInfo.badgeClass}`}>
                            {roleInfo.badge}
                          </span>
                          {displayEmail && (
                            <span className="text-[10px] text-slate-400 truncate max-w-[100px]">
                              {displayEmail}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-1.5 space-y-1">
                    <button
                      type="button"
                      onClick={handleDashboardClick}
                      className="w-full text-left px-3 py-2.5 text-xs font-bold text-slate-900 hover:bg-emerald-50 hover:text-emerald-950 rounded-xl flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <LayoutDashboard className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Dashboard</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {userType === 'talent' && onVisitPortfolio && (
                      <button
                        type="button"
                        onClick={handlePortfolioClick}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <FolderKanban className="w-3.5 h-3.5 text-slate-500" />
                        <span>My Audited Portfolio</span>
                      </button>
                    )}
                  </div>

                  <div className="p-1.5">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full text-left px-3 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-600" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* When Not Logged In: Sign In + Get Started Buttons matching reference */
            <div className="hidden sm:flex items-center gap-3">
              <button
                type="button"
                onClick={handleSignInClick}
                className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-950 px-3 py-2 cursor-pointer transition-colors"
                id="nav-signin-btn"
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={handleGetStartedClick}
                className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold py-2.5 px-5 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer shadow-2xs hover:shadow transition-all duration-150"
                id="nav-get-started-btn"
              >
                <span>Get Started →</span>
              </button>
            </div>
          )}

          {/* Hamburger Mobile Menu Toggle Button */}
          <div className="lg:hidden" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl border border-slate-200 text-slate-800 hover:bg-slate-50 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Mobile Navigation Drawer */}
            {isMenuOpen && (
              <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-xl p-5 space-y-4 text-left z-50 animate-fadeIn">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                    For Employers
                  </span>
                  <button
                    type="button"
                    onClick={() => handleNavClick('directory')}
                    className="w-full text-left py-2 text-sm font-semibold text-slate-800 hover:text-emerald-700"
                  >
                    Browse Talent Directory
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavClick('pricing')}
                    className="w-full text-left py-2 text-sm font-semibold text-slate-800 hover:text-emerald-700"
                  >
                    Employer Pricing
                  </button>
                </div>

                <div className="space-y-1 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                    For Talent
                  </span>
                  <button
                    type="button"
                    onClick={() => handleNavClick('talent')}
                    className="w-full text-left py-2 text-sm font-semibold text-slate-800 hover:text-emerald-700"
                  >
                    Talent Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavClick('assessment')}
                    className="w-full text-left py-2 text-sm font-semibold text-slate-800 hover:text-emerald-700"
                  >
                    Skill Assessment
                  </button>
                </div>

                <div className="space-y-1 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={scrollToVerification}
                    className="w-full text-left py-2 text-sm font-semibold text-slate-800 hover:text-emerald-700"
                  >
                    How It Works
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavClick('pricing')}
                    className="w-full text-left py-2 text-sm font-semibold text-slate-800 hover:text-emerald-700"
                  >
                    Resources &amp; Pricing
                  </button>
                </div>

                {!isUserLoggedIn && (
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <button
                      type="button"
                      onClick={handleSignInClick}
                      className="w-full text-center py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={handleGetStartedClick}
                      className="w-full text-center py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
                    >
                      Get Started →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}

interface FooterProps {
  setCurrentPage?: (page: PageType) => void;
}

export function Footer({ setCurrentPage }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const handleLink = (e: React.MouseEvent, page: PageType) => {
    if (setCurrentPage) {
      e.preventDefault();
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else if (setCurrentPage) {
      setCurrentPage('home');
      setTimeout(() => {
        const target = document.getElementById(id);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <footer className="bg-[#070d16] text-slate-300 pt-16 pb-12 border-t border-slate-800/80 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10">
          
          {/* Brand Column (Left) */}
          <div className="lg:col-span-4 space-y-4 text-left">
            <button 
              onClick={(e) => handleLink(e, 'home')}
              className="inline-flex items-center gap-2.5 cursor-pointer bg-transparent border-0 p-0 text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-display font-extrabold text-xl text-white">
                  Digital<span className="text-emerald-400">Campux</span>
                </span>
                <span className="text-[9px] font-mono tracking-wider text-slate-400 font-bold mt-0.5">
                  VETTED TALENT NETWORK
                </span>
              </div>
            </button>
            
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              The high-performance talent platform connecting global businesses with pre-vetted digital operators and growth specialists.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 flex items-center justify-center transition border border-slate-700/80"
              >
                <span className="text-xs font-bold font-mono">in</span>
              </a>

              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Twitter / X"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 flex items-center justify-center transition border border-slate-700/80"
              >
                <span className="text-xs font-bold font-mono">𝕏</span>
              </a>

              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 flex items-center justify-center transition border border-slate-700/80"
              >
                <span className="text-xs font-bold font-mono">▶</span>
              </a>

              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 flex items-center justify-center transition border border-slate-700/80"
              >
                <span className="text-xs font-bold font-mono">ig</span>
              </a>
            </div>
          </div>

          {/* 1. FOR EMPLOYERS */}
          <div className="lg:col-span-2 text-left space-y-3">
            <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              For Employers
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={(e) => handleLink(e, 'directory')} className="hover:text-emerald-400 transition cursor-pointer text-left">
                  Browse Talent Directory
                </button>
              </li>
              <li>
                <button onClick={(e) => handleLink(e, 'pricing')} className="hover:text-emerald-400 transition cursor-pointer text-left">
                  Employer Pricing
                </button>
              </li>
              <li>
                <button onClick={(e) => scrollToSection(e, 'verification-engine')} className="hover:text-emerald-400 transition cursor-pointer text-left">
                  How It Works
                </button>
              </li>
              <li>
                <button onClick={(e) => handleLink(e, 'directory')} className="hover:text-emerald-400 transition cursor-pointer text-left">
                  Customer Stories
                </button>
              </li>
            </ul>
          </div>

          {/* 2. FOR TALENT */}
          <div className="lg:col-span-2 text-left space-y-3">
            <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              For Talent
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={(e) => handleLink(e, 'talent')} className="hover:text-emerald-400 transition cursor-pointer text-left">
                  Talent Dashboard
                </button>
              </li>
              <li>
                <button onClick={(e) => handleLink(e, 'assessment')} className="hover:text-emerald-400 transition cursor-pointer text-left">
                  Skill Assessment
                </button>
              </li>
              <li>
                <button onClick={(e) => scrollToSection(e, 'verification-engine')} className="hover:text-emerald-400 transition cursor-pointer text-left">
                  Accreditation Process
                </button>
              </li>
              <li>
                <button onClick={(e) => handleLink(e, 'directory')} className="hover:text-emerald-400 transition cursor-pointer text-left">
                  Success Stories
                </button>
              </li>
            </ul>
          </div>

          {/* 3. RESOURCES */}
          <div className="lg:col-span-2 text-left space-y-3">
            <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              Resources
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={(e) => handleLink(e, 'directory')} className="hover:text-emerald-400 transition cursor-pointer text-left">
                  Blog
                </button>
              </li>
              <li>
                <button onClick={(e) => handleLink(e, 'assessment')} className="hover:text-emerald-400 transition cursor-pointer text-left">
                  Guides &amp; Templates
                </button>
              </li>
              <li>
                <button onClick={(e) => handleLink(e, 'pricing')} className="hover:text-emerald-400 transition cursor-pointer text-left">
                  Salary Insights
                </button>
              </li>
              <li>
                <a href="mailto:support@digitalcampux.com" className="hover:text-emerald-400 transition text-left block">
                  Help Center
                </a>
              </li>
            </ul>
          </div>

          {/* 4. COMPANY */}
          <div className="lg:col-span-2 text-left space-y-3">
            <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={(e) => handleLink(e, 'home')} className="hover:text-emerald-400 transition cursor-pointer text-left">
                  About DigitalCampux
                </button>
              </li>
              <li>
                <a href="mailto:support@digitalcampux.com" className="hover:text-emerald-400 transition text-left block">
                  Contact Us
                </a>
              </li>
              <li>
                <button onClick={(e) => handleLink(e, 'pricing')} className="hover:text-emerald-400 transition cursor-pointer text-left">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={(e) => handleLink(e, 'pricing')} className="hover:text-emerald-400 transition cursor-pointer text-left">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={(e) => handleLink(e, 'admin-login')}
                  className="hover:text-slate-200 transition cursor-pointer text-left font-mono text-[11px] text-slate-500 pt-1 block"
                >
                  Admin Portal
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright & Systems Operational Status Indicator */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 border-t border-slate-800">
          <p>© {currentYear} DigitalCampux. All rights reserved.</p>
          <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>All systems operational</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
