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
  Award,
  Users,
  DollarSign
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleNavClick = (id: PageType) => {
    setIsMenuOpen(false);
    if (setCurrentPage) {
      setCurrentPage(id);
    }
    const targetPath = id === 'home' ? '/' : `/${id}`;
    window.history.pushState({}, '', targetPath);
    window.dispatchEvent(new Event('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleDashboardClick = () => {
    setIsMenuOpen(false);
    if (onVisitDashboard) {
      onVisitDashboard();
    } else if (setCurrentPage) {
      setCurrentPage(userType === 'recruiter' ? 'employer' : userType === 'admin' ? 'admin' : 'talent');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePortfolioClick = () => {
    setIsMenuOpen(false);
    if (onVisitPortfolio) {
      onVisitPortfolio();
    } else if (setCurrentPage) {
      setCurrentPage('talent');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSignOut = () => {
    setIsMenuOpen(false);
    if (onSignOutClick) {
      onSignOutClick();
    }
  };

  const handleHireTalentClick = () => {
    setIsMenuOpen(false);
    handleNavClick('directory');
  };

  const handleSignInClick = () => {
    setIsMenuOpen(false);
    if (onSignInClick) {
      onSignInClick();
    }
  };

  const handleApplyTalentClick = () => {
    setIsMenuOpen(false);
    if (openTalentModal) {
      openTalentModal();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all shadow-xs">
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

        {/* Right Section: Hamburger Icon Button for Desktop & Mobile */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`flex items-center gap-2 py-2 px-3 sm:px-3.5 rounded-xl border transition-all duration-150 cursor-pointer shadow-2xs ${
              isMenuOpen 
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                : 'bg-slate-50 hover:bg-slate-100/90 text-slate-800 border-slate-200/90 hover:border-slate-300'
            }`}
            id="global-hamburger-btn"
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
            <span className="text-xs font-semibold tracking-tight hidden sm:inline">
              {isMenuOpen ? 'Close' : 'Menu'}
            </span>
            {isLoggedIn && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            )}
          </button>

          {/* Neat Dropdown / Flyout Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-2.5 w-[290px] sm:w-[320px] bg-white border border-slate-200/90 rounded-2xl shadow-2xl z-50 py-2 animate-fadeIn text-left overflow-hidden divide-y divide-slate-100">
              
              {/* User Identity / Welcome Header */}
              {isLoggedIn ? (
                <div className="px-4 py-3 bg-slate-50/80">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      Active Account
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {userType === 'recruiter' ? 'Recruiter' : userType === 'admin' ? 'Admin' : 'Vetted Talent'}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 truncate mt-1">
                    {userName || 'Active Specialist'}
                  </p>
                </div>
              ) : (
                <div className="px-4 py-3 bg-gradient-to-r from-emerald-50/70 via-slate-50/60 to-slate-50/40">
                  <div className="flex items-center gap-1.5 text-emerald-700 text-[11px] font-mono font-bold">
                    <Zap className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Speed-First Recruitment</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Pre-vetted digital talent in 48 hours.
                  </p>
                </div>
              )}

              {/* Core Highlight Actions (Hire Talent & Sign In) */}
              <div className="p-2 space-y-2">
                {/* 1. Hire Talent Primary CTA */}
                <button
                  onClick={handleHireTalentClick}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 px-3.5 rounded-xl text-xs flex items-center justify-between transition-all duration-150 cursor-pointer shadow-xs group"
                  id="menu-hire-talent-btn"
                >
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-emerald-100" />
                    <span>Hire Talent in 48 hrs</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-200 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* 2. Sign In or Workspace Dashboard CTA */}
                {!isLoggedIn ? (
                  <button
                    onClick={handleSignInClick}
                    className="w-full bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-semibold py-2.5 px-3.5 rounded-xl text-xs flex items-center justify-between border border-slate-200/80 transition-colors cursor-pointer"
                    id="menu-signin-btn"
                  >
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-slate-600" />
                      <span>Sign In to Account</span>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ) : (
                  <div className="space-y-1.5 pt-1">
                    <button
                      onClick={handleDashboardClick}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-3.5 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                        <span>Workspace Dashboard</span>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-slate-400" />
                    </button>

                    <button
                      onClick={handlePortfolioClick}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <FolderKanban className="w-4 h-4 text-emerald-600" />
                      <span>Audited Portfolio Showcase</span>
                    </button>

                    <div className="pt-1 border-t border-slate-100">
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
          )}
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


