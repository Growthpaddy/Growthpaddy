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
  ExternalLink,
  CheckCircle2,
  Layers,
  Award
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
    const targetPath = id === 'home' ? '/' : `/${id}`;
    window.history.pushState({}, '', targetPath);
    window.dispatchEvent(new Event('popstate'));
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

  const handleHireTalentClick = () => {
    handleNavClick('directory');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        
        {/* Brand Logo & Name */}
        <button 
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 group cursor-pointer border-0 bg-transparent p-0 text-left focus:outline-none"
          id="nav-logo-btn"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xs shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-display font-bold text-base sm:text-lg tracking-tight text-slate-900 leading-none">
              Digital<span className="text-emerald-600 font-extrabold">Campux</span>
            </span>
            <span className="text-[10px] font-mono tracking-wider text-slate-400 font-semibold mt-0.5 hidden sm:block">
              VETTED TALENT NETWORK
            </span>
          </div>
        </button>

        {/* Right Action Buttons: Sign In and Hire Talent */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {isLoggedIn ? (
            <div className="flex items-center gap-2.5 sm:gap-3" ref={dropdownRef}>
              
              {/* Hire Talent button */}
              <button
                onClick={handleHireTalentClick}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2 px-3 sm:px-4 rounded-xl flex items-center gap-1.5 transition-all duration-150 cursor-pointer shadow-xs hover:shadow-sm"
                id="header-hire-btn"
              >
                <span>Hire Talent</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* User Dropdown Button */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/70 text-slate-800 border border-slate-200/90 py-1.5 px-3 rounded-xl text-xs font-semibold cursor-pointer transition-all shadow-xs"
                  id="header-user-dropdown-btn"
                  aria-expanded={isDropdownOpen}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="max-w-[100px] sm:max-w-[160px] truncate">
                    {userName || (userType === 'recruiter' ? 'Recruiter' : userType === 'talent' ? 'Talent' : 'Account')}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-1.5 animate-fadeIn text-left overflow-hidden">
                    
                    {/* Header Info */}
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70">
                      <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase block tracking-wider">
                        Signed In User
                      </span>
                      <span className="text-xs font-bold text-slate-900 truncate block mt-0.5">
                        {userName || 'Active Candidate'}
                      </span>
                    </div>

                    {/* Options */}
                    <div className="p-1 space-y-0.5">
                      <button
                        onClick={handleDashboardClick}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/70 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                        <span>Open Workspace Dashboard</span>
                      </button>

                      <button
                        onClick={handlePortfolioClick}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/70 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <FolderKanban className="w-4 h-4 text-emerald-600" />
                        <span>View Portfolio Showcase</span>
                      </button>
                    </div>

                    <div className="border-t border-slate-100 p-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <button 
                onClick={onSignInClick}
                className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-xl transition cursor-pointer hover:bg-slate-100/80"
                id="header-signin-btn"
              >
                Sign In
              </button>

              <button
                onClick={handleHireTalentClick}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2 px-3.5 sm:px-4 rounded-xl flex items-center gap-1.5 transition-all duration-150 cursor-pointer shadow-xs hover:shadow-sm"
                id="header-hire-btn"
              >
                <span>Hire Talent</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
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
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Core Value Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-slate-800/60 border border-slate-700/70 p-5 rounded-2xl space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-white text-sm">Hands-On Practical Audits</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Candidates pass real-world scenario tests. We evaluate actual code, data funnels, and live automation workflows.
            </p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/70 p-5 rounded-2xl space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-white text-sm">48-Hour Talent Deployment</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Connect directly with pre-screened professionals without months of resume screening or agency delays.
            </p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/70 p-5 rounded-2xl space-y-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-white text-sm">Accreditation Stamp & KYC</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every profile features audited assessment scores, verified portfolio project files, and KYC validation.
            </p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/70 p-5 rounded-2xl space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-white text-sm">0% Ongoing Markup</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Transparent direct hiring model. Pay your talent directly with no perpetual salary commissions.
            </p>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 pt-8 border-t border-slate-800">
          
          {/* Brand Column */}
          <div className="lg:col-span-5 space-y-4 text-left">
            <button 
              onClick={(e) => handleLink(e, 'home')}
              className="inline-flex items-center gap-2.5 cursor-pointer bg-transparent border-0 p-0 text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-lg text-white">
                Digital<span className="text-emerald-400">Campux</span>
              </span>
            </button>
            
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              The high-confidence talent platform connecting global businesses with pre-vetted digital, engineering, and growth specialists.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a 
                href="https://wa.me/2348169664607" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp Support</span>
              </a>

              <a 
                href="mailto:support@digitalcampux.com" 
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
              >
                <Mail className="w-3.5 h-3.5 text-slate-300" />
                <span>Email Team</span>
              </a>
            </div>
          </div>

          {/* Employers Column */}
          <div className="lg:col-span-3 text-left space-y-3">
            <h5 className="text-xs font-mono font-semibold text-slate-200 uppercase tracking-wider">
              For Employers
            </h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={(e) => handleLink(e, 'directory')} className="hover:text-emerald-400 transition cursor-pointer text-left">
                  Browse Talent Directory
                </button>
              </li>
              <li>
                <button onClick={(e) => handleLink(e, 'employer')} className="hover:text-emerald-400 transition cursor-pointer text-left">
                  Employer Hiring Portal
                </button>
              </li>
              <li>
                <button onClick={(e) => handleLink(e, 'pricing')} className="hover:text-emerald-400 transition cursor-pointer text-left">
                  Pricing & Membership Plans
                </button>
              </li>
            </ul>
          </div>

          {/* For Talent Column */}
          <div className="lg:col-span-2 text-left space-y-3">
            <h5 className="text-xs font-mono font-semibold text-slate-200 uppercase tracking-wider">
              For Talent
            </h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={(e) => handleLink(e, 'talent')} className="hover:text-emerald-400 transition cursor-pointer text-left">
                  Talent Dashboard
                </button>
              </li>
              <li>
                <button onClick={(e) => handleLink(e, 'assessment')} className="hover:text-emerald-400 transition cursor-pointer text-left">
                  Skill Diagnostic Test
                </button>
              </li>
              <li>
                <button onClick={(e) => handleLink(e, 'pricing')} className="hover:text-emerald-400 transition cursor-pointer text-left">
                  Accreditation Pass
                </button>
              </li>
            </ul>
          </div>

          {/* Company / Portal Column */}
          <div className="lg:col-span-2 text-left space-y-3">
            <h5 className="text-xs font-mono font-semibold text-slate-200 uppercase tracking-wider">
              Platform
            </h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={(e) => handleLink(e, 'home')} className="hover:text-emerald-400 transition cursor-pointer text-left">
                  About Digital Campux
                </button>
              </li>
              <li>
                <button 
                  onClick={(e) => handleLink(e, 'admin-login')}
                  className="hover:text-slate-200 transition cursor-pointer text-left font-mono"
                  id="footer-staff-link"
                >
                  Admin Portal
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright & Status */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 border-t border-slate-800">
          <p>© {currentYear} Digital Campux Inc. All rights reserved. Pre-vetted digital talent operations network.</p>
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-400">Systems Operational</span>
          </div>
        </div>

      </div>
    </footer>
  );
}


