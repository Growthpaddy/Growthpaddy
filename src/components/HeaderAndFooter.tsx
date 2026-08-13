import React, { useState, useEffect, useRef } from 'react';
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
  ExternalLink
} from 'lucide-react';

interface HeaderProps {
  currentPage?: 'home' | 'directory' | 'employer' | 'talent' | 'assessment' | 'pricing' | 'admin' | 'admin-login';
  setCurrentPage?: (page: 'home' | 'directory' | 'employer' | 'talent' | 'assessment' | 'pricing' | 'admin' | 'admin-login') => void;
  openHireModal?: () => void;
  openTalentModal?: () => void;
  employerSlots?: number;
  onSignInClick?: () => void;
  onSignOutClick?: () => void;
  onVisitDashboard?: () => void;
  onVisitPortfolio?: () => void;
  isLoggedIn?: boolean;
  userName?: string;
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
  userType = null
}: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleNavClick = (id: 'home' | 'directory' | 'employer' | 'talent' | 'assessment' | 'pricing' | 'admin' | 'admin-login') => {
    if (setCurrentPage) {
      setCurrentPage(id);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDashboardClick = () => {
    setIsDropdownOpen(false);
    if (onVisitDashboard) {
      onVisitDashboard();
    } else if (setCurrentPage) {
      setCurrentPage(userType === 'recruiter' ? 'employer' : userType === 'admin' ? 'admin' : 'talent');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePortfolioClick = () => {
    setIsDropdownOpen(false);
    if (onVisitPortfolio) {
      onVisitPortfolio();
    } else if (setCurrentPage) {
      setCurrentPage('talent');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSignOut = () => {
    setIsDropdownOpen(false);
    if (onSignOutClick) {
      onSignOutClick();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b-4 border-neutral-950 transition-all duration-300 animate-fadeIn">
      {/* Visual Top Highlight Line */}
      <div className="h-[6px] w-full bg-[#047857]" />
      
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5">
        
        {/* Brand Logo & Name */}
        <button 
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 group cursor-pointer border-0 bg-transparent p-0 text-left focus:outline-none"
          id="nav-logo-btn"
        >
          <div className="w-10 h-10 bg-neutral-950 rounded-none flex items-center justify-center transition-all duration-300 border-2 border-neutral-950 group-hover:border-emerald-500">
            <ShieldCheck className="w-5.5 h-5.5 text-[#10b981]" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-display font-black text-base leading-none uppercase tracking-tighter text-neutral-950">
              DSP TALENT <span className="text-emerald-700">HUB</span>
            </span>
            <span className="text-[9px] font-mono leading-none tracking-wider text-neutral-500 uppercase font-black mt-1">
              VERIFIED HIRING NETWORK
            </span>
          </div>
        </button>

        {/* Header Actions / Sign In & Dropdown Container */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <div className="flex items-center gap-2 sm:gap-3" ref={dropdownRef}>
              
              {/* User Name Dropdown Trigger Button */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 bg-neutral-100 hover:bg-emerald-50 border-2 border-neutral-950 py-1.5 px-3 rounded-none text-[10px] font-black uppercase font-mono text-neutral-900 cursor-pointer transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
                  id="header-user-dropdown-btn"
                  aria-expanded={isDropdownOpen}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>
                    {userType === 'recruiter' ? 'RECRUITER:' : userType === 'talent' ? 'TALENT:' : 'EXPLORER:'} {userName.toUpperCase() || 'MY ACCOUNT'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-neutral-700 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white border-4 border-neutral-950 shadow-[6px_6px_0px_0px_rgba(0,168,107,1)] z-50 py-1 animate-fadeIn text-left">
                    
                    {/* Header Info */}
                    <div className="px-3.5 py-2.5 border-b-2 border-neutral-200 bg-neutral-50">
                      <span className="text-[9px] font-mono font-bold text-neutral-500 uppercase block tracking-wider">
                        ACTIVE SESSION
                      </span>
                      <span className="text-xs font-black text-neutral-950 truncate block mt-0.5">
                        {userName || 'Logged In Candidate'}
                      </span>
                    </div>

                    {/* Option 1: Visit Dashboard */}
                    <button
                      onClick={handleDashboardClick}
                      className="w-full text-left px-3.5 py-2.5 text-xs font-black uppercase tracking-wider text-neutral-900 hover:bg-emerald-50 hover:text-emerald-900 flex items-center gap-2.5 transition-colors cursor-pointer border-b border-neutral-100 font-mono"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#00A86B]" />
                      <span>VISIT DASHBOARD</span>
                    </button>

                    {/* Option 2: Visit Portfolio */}
                    <button
                      onClick={handlePortfolioClick}
                      className="w-full text-left px-3.5 py-2.5 text-xs font-black uppercase tracking-wider text-neutral-900 hover:bg-emerald-50 hover:text-emerald-900 flex items-center gap-2.5 transition-colors cursor-pointer border-b border-neutral-100 font-mono"
                    >
                      <FolderKanban className="w-4 h-4 text-[#00A86B]" />
                      <span>VISIT PORTFOLIO</span>
                    </button>

                    {/* Option 3: Sign Out */}
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-3.5 py-2.5 text-xs font-black uppercase tracking-wider text-rose-700 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer font-mono"
                    >
                      <LogOut className="w-4 h-4 text-rose-600" />
                      <span>SIGN OUT</span>
                    </button>

                  </div>
                )}
              </div>

              {/* Direct Sign Out Button */}
              <button 
                onClick={onSignOutClick}
                className="hidden md:inline-flex text-[10px] font-black uppercase tracking-wider text-neutral-700 hover:text-rose-600 border-2 border-neutral-300 hover:border-rose-600 py-1.5 px-3 transition-colors cursor-pointer rounded-none bg-white font-mono"
                id="header-signout-btn"
              >
                SIGN OUT
              </button>

            </div>
          ) : (
            <button 
              onClick={onSignInClick}
              className="text-xs font-black bg-neutral-950 hover:bg-neutral-900 border-2 border-neutral-950 text-white py-2 px-4 rounded-none flex items-center gap-1.5 transition duration-150 cursor-pointer uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(16,185,129,1)] hover:shadow-none"
              id="header-signin-btn"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-400 stroke-[3px]" />
              <span>SIGN IN</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

interface FooterProps {
  setCurrentPage?: (page: 'home' | 'directory' | 'employer' | 'talent' | 'assessment' | 'pricing' | 'admin' | 'admin-login') => void;
}

export function Footer({ setCurrentPage }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const handleLink = (e: React.MouseEvent, page: 'home' | 'directory' | 'employer' | 'talent' | 'assessment' | 'pricing' | 'admin' | 'admin-login') => {
    if (setCurrentPage) {
      e.preventDefault();
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-neutral-50 text-neutral-900 py-14 border-t-4 border-neutral-950 px-4 sm:px-6 lg:px-8 relative">
      
      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        
        {/* Core Benefits Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 border-2 border-neutral-950 shadow-[4px_4px_0px_0px_rgba(0,168,107,1)] space-y-2 text-left">
            <span className="text-xs font-mono font-black uppercase text-[#00A86B] flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#00A86B]" />
              PRACTICAL TESTS
            </span>
            <p className="font-extrabold text-neutral-950 text-sm uppercase tracking-tight">Real Skill Proof</p>
            <p className="text-xs text-neutral-600 font-medium leading-relaxed">
              Every professional takes real-world practical tests so you can hire based on true capability.
            </p>
          </div>

          <div className="bg-white p-5 border-2 border-neutral-950 shadow-[4px_4px_0px_0px_rgba(59,130,246,1)] space-y-2 text-left">
            <span className="text-xs font-mono font-black uppercase text-blue-700 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-700" />
              FAST HIRING
            </span>
            <p className="font-extrabold text-neutral-950 text-sm uppercase tracking-tight">Direct Connections</p>
            <p className="text-xs text-neutral-600 font-medium leading-relaxed">
              Browse candidate profiles and connect directly without delays or agency middleman fees.
            </p>
          </div>

          <div className="bg-white p-5 border-2 border-neutral-950 shadow-[4px_4px_0px_0px_rgba(147,51,234,1)] space-y-2 text-left">
            <span className="text-xs font-mono font-black uppercase text-purple-700 flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-700" />
              VERIFIED BADGES
            </span>
            <p className="font-extrabold text-neutral-950 text-sm uppercase tracking-tight">100% Verified Work</p>
            <p className="text-xs text-neutral-600 font-medium leading-relaxed">
              View real project work, test scores, and verified accreditation badges on candidate profiles.
            </p>
          </div>

          <div className="bg-white p-5 border-2 border-neutral-950 shadow-[4px_4px_0px_0px_rgba(217,119,6,1)] space-y-2 text-left">
            <span className="text-xs font-mono font-black uppercase text-amber-700 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-700" />
              PRIVACY FIRST
            </span>
            <p className="font-extrabold text-neutral-950 text-sm uppercase tracking-tight">Protected Data</p>
            <p className="text-xs text-neutral-600 font-medium leading-relaxed">
              All candidate details and hiring preferences are kept secure with direct privacy protection.
            </p>
          </div>
        </div>

        {/* Navigation & Brand Links Grid */}
        <div className="bg-white border-2 border-neutral-950 p-6 sm:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 items-start">
          
          {/* Brand & Mission */}
          <div className="lg:col-span-5 space-y-3.5 text-left">
            <button 
              onClick={(e) => handleLink(e, 'home')}
              className="inline-flex items-center gap-3 cursor-pointer bg-transparent border-0 p-0 text-left group"
            >
              <div className="w-10 h-10 bg-[#00A86B] text-white border-2 border-neutral-950 flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black text-lg uppercase tracking-wider text-neutral-950">
                  DSP TALENT HUB
                </span>
                <span className="text-[10px] font-mono font-bold text-neutral-600 uppercase tracking-widest">AFRICA'S VERIFIED TALENT NETWORK</span>
              </div>
            </button>
            
            <p className="text-xs font-medium text-neutral-700 max-w-md leading-relaxed">
              We connect global businesses with top pre-vetted digital talent across Africa. We evaluate candidates through hands-on practical assessments, so companies hire proven professionals.
            </p>

            <div className="flex items-center gap-3 pt-1">
              <a 
                href="https://wa.me/2348169664607" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-2 border-neutral-950 px-3 py-1.5 text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp Support</span>
              </a>

              <a 
                href="mailto:stanleypatrick3800@gmail.com" 
                className="bg-neutral-100 hover:bg-neutral-200 text-neutral-900 border-2 border-neutral-950 px-3 py-1.5 text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition"
              >
                <Mail className="w-3.5 h-3.5 text-neutral-700" />
                <span>Email Us</span>
              </a>
            </div>
          </div>

          {/* Employers Column */}
          <div className="lg:col-span-3 text-left space-y-3">
            <h5 className="font-mono text-xs text-neutral-950 uppercase tracking-wider font-black border-l-4 border-[#00A86B] pl-2">
              FOR EMPLOYERS
            </h5>
            <ul className="space-y-2 text-xs font-bold uppercase tracking-wider text-left">
              <li>
                <button onClick={(e) => handleLink(e, 'directory')} className="text-neutral-700 hover:text-[#00A86B] transition cursor-pointer text-left flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-[#00A86B]" />
                  <span>Browse Talent Directory</span>
                </button>
              </li>
              <li>
                <button onClick={(e) => handleLink(e, 'employer')} className="text-neutral-700 hover:text-[#00A86B] transition cursor-pointer text-left flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-[#00A86B]" />
                  <span>Employer Hiring Portal</span>
                </button>
              </li>
              <li>
                <button onClick={(e) => handleLink(e, 'pricing')} className="text-neutral-700 hover:text-[#00A86B] transition cursor-pointer text-left flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-[#00A86B]" />
                  <span>Pricing & Membership</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Talent Candidates Column */}
          <div className="lg:col-span-2 text-left space-y-3">
            <h5 className="font-mono text-xs text-neutral-950 uppercase tracking-wider font-black border-l-4 border-[#00A86B] pl-2">
              FOR TALENT
            </h5>
            <ul className="space-y-2 text-xs font-bold uppercase tracking-wider text-left">
              <li>
                <button onClick={(e) => handleLink(e, 'talent')} className="text-neutral-700 hover:text-[#00A86B] transition cursor-pointer text-left flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-[#00A86B]" />
                  <span>Talent Dashboard</span>
                </button>
              </li>
              <li>
                <button onClick={(e) => handleLink(e, 'assessment')} className="text-emerald-800 hover:text-[#00A86B] transition cursor-pointer text-left flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-[#00A86B]" />
                  <span>Skill Assessment</span>
                </button>
              </li>
              <li>
                <button onClick={(e) => handleLink(e, 'pricing')} className="text-neutral-700 hover:text-[#00A86B] transition cursor-pointer text-left flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-[#00A86B]" />
                  <span>Accreditation Pass</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Info Column */}
          <div className="lg:col-span-2 text-left space-y-3">
            <h5 className="font-mono text-xs text-neutral-950 uppercase tracking-wider font-black border-l-4 border-[#00A86B] pl-2">
              HELP & ACCESS
            </h5>
            <ul className="space-y-2 text-xs font-bold uppercase tracking-wider text-left">
              <li>
                <button 
                  onClick={(e) => {
                    if (setCurrentPage) {
                      e.preventDefault();
                      setCurrentPage('admin-login');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className="text-neutral-900 hover:text-emerald-700 transition cursor-pointer text-left font-mono font-black"
                  id="footer-staff-link"
                >
                  <span>Staff Admin Login</span>
                </button>
              </li>
              <li>
                <a href="https://wa.me/2348169664607" target="_blank" rel="noopener noreferrer" className="text-neutral-700 hover:text-[#00A86B] transition">
                  <span>Help Center</span>
                </a>
              </li>
              <li>
                <button onClick={(e) => handleLink(e, 'home')} className="text-neutral-700 hover:text-[#00A86B] transition text-left">
                  <span>About DSP</span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-neutral-600 border-t-2 border-neutral-300">
          <p>© {currentYear} DSP Talent Hub. All rights reserved. Connecting verified African professionals with global opportunities.</p>
          <div className="flex items-center gap-4">
            <button 
              onClick={(e) => {
                if (setCurrentPage) {
                  e.preventDefault();
                  setCurrentPage('admin-login');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="text-[11px] font-mono text-neutral-400 hover:text-neutral-700 transition cursor-pointer underline underline-offset-2"
              id="staff-access-trigger-btn"
            >
              Admin Access
            </button>
            <span className="w-2 h-2 rounded-full bg-[#00A86B]" />
            <span className="font-mono text-[11px] font-bold uppercase text-neutral-600">Verified Platform</span>
          </div>
        </div>

      </div>
    </footer>
  );
}

