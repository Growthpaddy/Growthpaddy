import React, { useState } from 'react';
import { ShieldCheck, Menu, X, ArrowUpRight, Github, Mail, Globe, Sparkles, ArrowRight, Shield, Activity, Lock, Terminal } from 'lucide-react';
import { motion } from 'motion/react';

interface HeaderProps {
  currentPage?: 'home' | 'problem' | 'how-it-works' | 'tracks' | 'directory' | 'portfolio' | 'badges';
  setCurrentPage?: (page: 'home' | 'problem' | 'how-it-works' | 'tracks' | 'directory' | 'portfolio' | 'badges') => void;
  openHireModal?: () => void;
  openTalentModal?: () => void;
}

export function Header({ currentPage = 'home', setCurrentPage, openHireModal, openTalentModal }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'problem', label: 'The Problem' },
    { id: 'how-it-works', label: 'How it Works' },
    { id: 'tracks', label: 'Tracks' },
    { id: 'directory', label: 'Talent Directory' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'badges', label: 'Badges Standard' },
  ] as const;

  const handleNavClick = (id: 'home' | 'problem' | 'how-it-works' | 'tracks' | 'directory' | 'portfolio' | 'badges') => {
    if (setCurrentPage) {
      setCurrentPage(id);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/75 backdrop-blur-xl border-b border-neutral-200/50 shadow-xs transition-all duration-300">
      {/* Top micro progress line to make menu area uniquely different */}
      <div className="h-[2px] w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />
      
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5">
        
        {/* Brand Logo & Name */}
        <button 
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 group cursor-pointer border-0 bg-transparent p-0 text-left focus:outline-none"
        >
          <div className="w-9 h-9 bg-neutral-950 group-hover:bg-emerald-500 rounded-xl flex items-center justify-center transition-colors duration-300 shadow-xs">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-display font-bold text-lg uppercase tracking-wider text-neutral-950 group-hover:text-emerald-500 transition-colors duration-300">
              DSP TALENT HUB
            </span>
            <span className="text-[9px] font-mono leading-none tracking-tight text-neutral-400 uppercase">
              Verified Talent Hub
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 bg-neutral-100/60 rounded-full border border-neutral-200/30">
          <button
            onClick={() => handleNavClick('home')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer ${
              currentPage === 'home'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/50'
            }`}
          >
            Overview
          </button>
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/50'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* CTA Actions */}
        <div className="hidden md:flex items-center gap-3">
          <button 
            onClick={() => {
              if (openHireModal) openHireModal();
              else handleNavClick('directory');
            }} 
            className="text-xs font-semibold text-neutral-700 hover:text-neutral-950 py-2 px-3.5 transition-colors cursor-pointer"
          >
            Find Talent
          </button>
          
          <button 
            onClick={() => {
              if (openTalentModal) openTalentModal();
              else handleNavClick('tracks');
            }} 
            className="text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-neutral-950 py-2.5 px-4.5 rounded-xl flex items-center gap-1.5 transition duration-200 shadow-xs hover:shadow-md cursor-pointer"
          >
            <span>Apply as Candidate</span>
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5px]" />
          </button>
        </div>

        {/* Mobile menu Toggle */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-neutral-700 hover:text-neutral-950 focus:outline-none p-1.5 rounded-lg hover:bg-neutral-100 transition"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-neutral-200 shadow-lg px-5 py-5 space-y-3.5 flex flex-col text-left">
          <button 
            onClick={() => handleNavClick('home')}
            className={`text-sm font-semibold py-2 px-3 rounded-lg text-left ${
              currentPage === 'home' ? 'bg-neutral-100 text-neutral-950' : 'text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            Overview Hub
          </button>
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button 
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-sm font-semibold py-2 px-3 rounded-lg text-left ${
                  isActive ? 'bg-neutral-100 text-neutral-950' : 'text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                {item.label}
              </button>
            );
          })}

          <div className="pt-3 border-t border-neutral-100 flex flex-col sm:flex-row gap-2">
            <button 
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (openHireModal) openHireModal();
                else handleNavClick('directory');
              }}
              className="w-full text-center py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-800 hover:bg-neutral-50"
            >
              Get Hiring Shortlist
            </button>
            <button 
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (openTalentModal) openTalentModal();
                else handleNavClick('tracks');
              }}
              className="w-full text-center py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5"
            >
              <span>Apply as Candidate</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

interface FooterProps {
  setCurrentPage?: (page: 'home' | 'problem' | 'how-it-works' | 'tracks' | 'directory' | 'portfolio' | 'badges') => void;
}

export function Footer({ setCurrentPage }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const handleLink = (e: React.MouseEvent, page: 'home' | 'problem' | 'how-it-works' | 'tracks' | 'directory' | 'portfolio' | 'badges') => {
    if (setCurrentPage) {
      e.preventDefault();
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-neutral-950 text-neutral-400 py-16 md:py-24 border-t border-neutral-900 px-4 sm:px-6 lg:px-8 font-secondary relative overflow-hidden select-none">
      {/* Visual Ambient Shine */}
      <div className="absolute top-0 left-1/4 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-1/4 -translate-y-1/2 w-96 h-96 bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        
        {/* Modern Live Telemetry & Vetting Stat Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 md:p-6 rounded-2xl bg-neutral-900/40 border border-neutral-900/65 backdrop-blur-md">
          <div className="space-y-1 text-left p-2 border-r border-neutral-900 last:border-r-0">
            <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-500 flex items-center gap-1.5 font-bold">
              <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
              Evaluation System
            </span>
            <p className="font-bold text-white text-sm">The Gauntlet Active</p>
            <p className="text-[10px] text-neutral-500 font-mono font-medium">Continuous 48-Hour Scenarios</p>
          </div>
          <div className="space-y-1 text-left p-2 md:pl-6 border-r border-neutral-900 last:border-r-0">
            <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-500 flex items-center gap-1.5 font-bold">
              <Terminal className="w-3 h-3 text-red-500" />
              Sieve Standard
            </span>
            <p className="font-bold text-white text-sm">4.8% Survival Rate</p>
            <p className="text-[10px] text-neutral-500 font-mono font-medium">Most fail in the first 2h</p>
          </div>
          <div className="space-y-1 text-left p-2 md:pl-6 border-r border-neutral-900 last:border-r-0">
            <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-500 flex items-center gap-1.5 font-bold">
              <Shield className="w-3 h-3 text-teal-400" />
              Output Verification
            </span>
            <p className="font-bold text-white text-sm">100% Audited Roster</p>
            <p className="text-[10px] text-neutral-500 font-mono font-medium">Zero resume padding tolerated</p>
          </div>
          <div className="space-y-1 text-left p-2 md:pl-6 last:border-r-0">
            <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-500 flex items-center gap-1.5 font-bold">
              <Lock className="w-3 h-3 text-indigo-400" />
              Placement Security
            </span>
            <p className="font-bold text-white text-sm">Guaranteed Replacement</p>
            <p className="text-[10px] text-neutral-500 font-mono font-medium">12-Week supervised guardrails</p>
          </div>
        </div>

        {/* Core Multi-Column Directory */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 md:gap-14 items-start">
          
          {/* Brand Column (Spans 4) */}
          <div className="lg:col-span-4 space-y-5 text-left">
            <button 
              onClick={(e) => handleLink(e, 'home')}
              className="inline-flex items-center gap-3 cursor-pointer bg-transparent border-0 p-0 text-left group"
            >
              <div className="w-10 h-10 bg-white/5 group-hover:bg-emerald-500/10 border border-neutral-850 group-hover:border-emerald-500/30 rounded-xl flex items-center justify-center transition-all duration-300 shadow">
                <ShieldCheck className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black text-sm sm:text-base uppercase tracking-wider text-white group-hover:text-emerald-400 transition-colors duration-300">
                  DSP TALENT HUB
                </span>
                <span className="text-[9px] font-mono text-neutral-500 group-hover:text-neutral-400 tracking-widest transition-colors duration-300 font-bold">THE GAUNTLET STANDBY</span>
              </div>
            </button>
            <p className="text-xs text-neutral-500 max-w-sm leading-relaxed">
              Discover verified, tested digital professionals for deep integrations, internships, and immediate high-leverage hires. Our 48-hour continuous audits provide ultimate deployment confidence.
            </p>
            <div className="flex items-center gap-3.5 pt-2">
              <a href="mailto:support@dsptalenthub.com" className="w-8 h-8 rounded-lg bg-neutral-900 hover:bg-emerald-950 border border-neutral-800 hover:border-emerald-800 flex items-center justify-center text-neutral-400 hover:text-emerald-400 transition-all duration-300" title="Contact Email">
                <Mail className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-neutral-900 hover:bg-emerald-950 border border-neutral-800 hover:border-emerald-800 flex items-center justify-center text-neutral-400 hover:text-emerald-400 transition-all duration-300" title="GitHub System Codebase">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-neutral-900 hover:bg-emerald-950 border border-neutral-800 hover:border-emerald-800 flex items-center justify-center text-neutral-400 hover:text-emerald-400 transition-all duration-300" title="Global Infrastructure Network">
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Platform Column (Spans 2) */}
          <div className="lg:col-span-2 text-left space-y-4">
            <h5 className="font-mono text-[10px] text-white uppercase tracking-widest font-bold border-l-2 border-emerald-500 pl-2">Platform</h5>
            <ul className="space-y-3 text-xs">
              <li>
                <button onClick={(e) => handleLink(e, 'how-it-works')} className="group flex items-center gap-1 text-left text-neutral-400 hover:text-white transition duration-300 transform hover:translate-x-1 cursor-pointer">
                  <ArrowRight className="w-3 h-3 text-emerald-400 opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                  <span>The Gauntlet Vetting</span>
                </button>
              </li>
              <li>
                <button onClick={(e) => handleLink(e, 'directory')} className="group flex items-center gap-1 text-left text-neutral-400 hover:text-white transition duration-300 transform hover:translate-x-1 cursor-pointer">
                  <ArrowRight className="w-3 h-3 text-emerald-400 opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                  <span>Talent Directory</span>
                </button>
              </li>
              <li>
                <button onClick={(e) => handleLink(e, 'badges')} className="group flex items-center gap-1 text-left text-neutral-400 hover:text-white transition duration-300 transform hover:translate-x-1 cursor-pointer">
                  <ArrowRight className="w-3 h-3 text-emerald-400 opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                  <span>Vetting Standards</span>
                </button>
              </li>
              <li>
                <button onClick={(e) => handleLink(e, 'tracks')} className="group flex items-center gap-1 text-left text-neutral-400 hover:text-white transition duration-300 transform hover:translate-x-1 cursor-pointer">
                  <ArrowRight className="w-3 h-3 text-emerald-400 opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                  <span>Evaluation Tracks</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Candidates Column (Spans 2) */}
          <div className="lg:col-span-2 text-left space-y-4">
            <h5 className="font-mono text-[10px] text-white uppercase tracking-widest font-bold border-l-2 border-emerald-500 pl-2">Candidates</h5>
            <ul className="space-y-3 text-xs">
              <li>
                <button onClick={(e) => handleLink(e, 'tracks')} className="group flex items-center gap-1 text-left text-emerald-400 hover:text-emerald-300 font-medium transition duration-300 transform hover:translate-x-1 cursor-pointer">
                  <ArrowRight className="w-3 h-3 text-emerald-400 opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                  <span className="flex items-center gap-1">Apply for Placement <Sparkles className="w-2.5 h-2.5 animate-pulse" /></span>
                </button>
              </li>
              <li>
                <button onClick={(e) => handleLink(e, 'portfolio')} className="group flex items-center gap-1 text-left text-neutral-400 hover:text-white transition duration-300 transform hover:translate-x-1 cursor-pointer">
                  <ArrowRight className="w-3 h-3 text-emerald-400 opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                  <span>Living Portfolios</span>
                </button>
              </li>
              <li>
                <button onClick={(e) => handleLink(e, 'how-it-works')} className="group flex items-center gap-1 text-left text-neutral-400 hover:text-white transition duration-300 transform hover:translate-x-1 cursor-pointer">
                  <ArrowRight className="w-3 h-3 text-emerald-400 opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                  <span>Survival Guides</span>
                </button>
              </li>
              <li>
                <button onClick={(e) => handleLink(e, 'portfolio')} className="group flex items-center gap-1 text-left text-neutral-400 hover:text-white transition duration-300 transform hover:translate-x-1 cursor-pointer">
                  <ArrowRight className="w-3 h-3 text-emerald-400 opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                  <span>Alumni Ecosystem</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Hiring Teams (Spans 2) */}
          <div className="lg:col-span-2 text-left space-y-4">
            <h5 className="font-mono text-[10px] text-white uppercase tracking-widest font-bold border-l-2 border-emerald-500 pl-2">Hiring Teams</h5>
            <ul className="space-y-3 text-xs">
              <li>
                <button onClick={(e) => handleLink(e, 'tracks')} className="group flex items-center gap-1 text-left text-neutral-400 hover:text-white transition duration-300 transform hover:translate-x-1 cursor-pointer">
                  <ArrowRight className="w-3 h-3 text-emerald-400 opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                  <span>Enterprise Scenarios</span>
                </button>
              </li>
              <li>
                <button onClick={(e) => handleLink(e, 'tracks')} className="group flex items-center gap-1 text-left text-neutral-400 hover:text-white transition duration-300 transform hover:translate-x-1 cursor-pointer">
                  <ArrowRight className="w-3 h-3 text-emerald-400 opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                  <span>Matched Stipends</span>
                </button>
              </li>
              <li>
                <button onClick={(e) => handleLink(e, 'badges')} className="group flex items-center gap-1 text-left text-neutral-400 hover:text-white transition duration-300 transform hover:translate-x-1 cursor-pointer">
                  <ArrowRight className="w-3 h-3 text-emerald-400 opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                  <span>KYC Identity Auditing</span>
                </button>
              </li>
              <li>
                <button onClick={(e) => handleLink(e, 'tracks')} className="group flex items-center gap-1 text-left text-neutral-400 hover:text-white transition duration-300 transform hover:translate-x-1 cursor-pointer">
                  <ArrowRight className="w-3 h-3 text-emerald-400 opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                  <span>Success Rates</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Connect & Operations (Spans 2) */}
          <div className="lg:col-span-2 text-left space-y-4">
            <h5 className="font-mono text-[10px] text-white uppercase tracking-widest font-bold border-l-2 border-emerald-500 pl-2">Operations</h5>
            <ul className="space-y-3 text-xs">
              <li>
                <a href="#" className="group flex items-center gap-1 text-left text-neutral-400 hover:text-white transition duration-300 transform hover:translate-x-1">
                  <ArrowRight className="w-3 h-3 text-emerald-400 opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                  <span>Anti-Cheat Lab</span>
                </a>
              </li>
              <li>
                <a href="#" className="group flex items-center gap-1 text-left text-neutral-400 hover:text-white transition duration-300 transform hover:translate-x-1">
                  <ArrowRight className="w-3 h-3 text-emerald-400 opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                  <span>Trust Operations</span>
                </a>
              </li>
              <li>
                <a href="#" className="group flex items-center gap-1 text-left text-neutral-400 hover:text-white transition duration-300 transform hover:translate-x-1">
                  <ArrowRight className="w-3 h-3 text-emerald-400 opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                  <span>Privacy Framework</span>
                </a>
              </li>
              <li>
                <a href="#" className="group flex items-center gap-1 text-left text-neutral-400 hover:text-white transition duration-300 transform hover:translate-x-1">
                  <ArrowRight className="w-3 h-3 text-emerald-400 opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                  <span>Legal Provisions</span>
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Rights, and Credits */}
        <div className="border-t border-neutral-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-600">
          <p>© {currentYear} DSP Talent Hub Vetting Ecosystem. All rights reserved.</p>
          <div className="flex items-center gap-4 text-neutral-500 font-mono">
            <span>Server Clock: Authenticated</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>All credentials verified as of {new Date().toLocaleDateString(undefined, {year: 'numeric', month: 'long'})}</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
