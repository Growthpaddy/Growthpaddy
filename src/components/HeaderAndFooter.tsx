import React, { useState } from 'react';
import { ShieldCheck, Menu, X, ArrowUpRight, Mail, Globe, Sparkles, Briefcase, Zap, Shield, Lock } from 'lucide-react';

interface HeaderProps {
  currentPage?: 'home' | 'directory' | 'employer' | 'talent' | 'assessment' | 'pricing';
  setCurrentPage?: (page: 'home' | 'directory' | 'employer' | 'talent' | 'assessment' | 'pricing') => void;
  openHireModal?: () => void;
  openTalentModal?: () => void;
  employerSlots?: number;
}

export function Header({ currentPage = 'home', setCurrentPage, openHireModal, openTalentModal, employerSlots = 1 }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'directory', label: 'FIND TALENT' },
    { id: 'employer', label: 'EMPLOYER WORKSPACE' },
    { id: 'talent', label: 'TALENT SPACE' },
    { id: 'assessment', label: 'PRACTICE ASSESSMENT' },
    { id: 'pricing', label: 'PRICING' },
  ] as const;

  const handleNavClick = (id: 'home' | 'directory' | 'employer' | 'talent' | 'assessment' | 'pricing') => {
    if (setCurrentPage) {
      setCurrentPage(id);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMobileMenuOpen(false);
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
          <div className="w-10 h-10 bg-neutral-950 rounded-none flex items-center justify-center transition-all duration-300 border-2 border-neutral-950">
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

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5 p-1 bg-neutral-105 border-2 border-neutral-950 rounded-none">
          <button
            onClick={() => handleNavClick('home')}
            className={`px-3 py-1.5 text-[10px] tracking-wider uppercase font-black rounded-none transition-all duration-150 cursor-pointer ${
              currentPage === 'home'
                ? 'bg-neutral-950 text-white'
                : 'text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200'
            }`}
            id="nav-home-btn"
          >
            OVERVIEW
          </button>
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-3 py-1.5 text-[10px] tracking-wider uppercase font-black rounded-none transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-neutral-950 text-white'
                    : 'text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200'
                }`}
                id={`nav-${item.id}-btn`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* CTA Actions */}
        <div className="hidden lg:flex items-center gap-3">
          {currentPage === 'directory' || currentPage === 'employer' ? (
            <div className="bg-emerald-50 border-2 border-neutral-950 text-neutral-950 text-[10px] font-black font-mono py-1.5 px-3 rounded-none inline-block uppercase">
              SLOTS: {employerSlots}
            </div>
          ) : null}

          <button 
            onClick={() => handleNavClick('directory')} 
            className="text-[10px] font-black uppercase tracking-wider text-neutral-800 hover:text-emerald-800 py-2 px-3 transition-colors cursor-pointer"
            id="nav-cta-find"
          >
            SNOOP TALENT
          </button>
          
          <button 
            onClick={() => {
              if (openTalentModal) openTalentModal();
              else handleNavClick('talent');
            }} 
            className="text-xs font-black bg-neutral-950 hover:bg-neutral-900 border-2 border-neutral-950 text-white py-2.5 px-4 rounded-none flex items-center gap-1.5 transition duration-150 cursor-pointer uppercase tracking-widest shadow-[3px_3px_0px_0px_rgba(16,185,129,1)]"
            id="nav-cta-apply"
          >
            <span>JOIN SYSTEM</span>
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[3px]" />
          </button>
        </div>

        {/* Mobile menu Toggle */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden text-neutral-950 hover:text-neutral-850 p-1.5 border-2 border-neutral-950"
          id="nav-mobile-hamburger"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b-4 border-neutral-950 p-5 space-y-3 flex flex-col text-left">
          <button 
            onClick={() => handleNavClick('home')}
            className={`text-xs font-black uppercase py-2 px-3 rounded-none text-left tracking-widest ${
              currentPage === 'home' ? 'bg-neutral-950 text-white' : 'text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            OVERVIEW
          </button>
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button 
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-xs font-black uppercase py-2 px-3 rounded-none text-left tracking-widest ${
                  isActive ? 'bg-neutral-950 text-white' : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                {item.label}
              </button>
            );
          })}

          <div className="pt-3 border-t-2 border-neutral-950 flex flex-col gap-2">
            <button 
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleNavClick('directory');
              }}
              className="w-full text-center py-2.5 rounded-none border-2 border-neutral-950 text-xs font-black uppercase tracking-widest text-neutral-950 hover:bg-neutral-100"
            >
              BROWSE DIGITAL OPERATORS
            </button>
            <button 
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (openTalentModal) openTalentModal();
                else handleNavClick('talent');
              }}
              className="w-full text-center py-2.5 rounded-none bg-neutral-950 text-white font-black text-xs flex items-center justify-center gap-1.5 uppercase tracking-widest"
            >
              <span>GET VERIFIED</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

interface FooterProps {
  setCurrentPage?: (page: 'home' | 'directory' | 'employer' | 'talent' | 'assessment' | 'pricing') => void;
}

export function Footer({ setCurrentPage }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const handleLink = (e: React.MouseEvent, page: 'home' | 'directory' | 'employer' | 'talent' | 'assessment' | 'pricing') => {
    if (setCurrentPage) {
      e.preventDefault();
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-neutral-950 text-neutral-400 py-16 border-t-4 border-neutral-950 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        
        {/* Core Sourcing Stat Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 rounded-none bg-neutral-905 border-2 border-neutral-800">
          <div className="space-y-1 text-left p-2 border-r border-neutral-805 last:border-r-0">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#10b981] flex items-center gap-1.5 font-black">
              <Zap className="w-3.5 h-3.5" />
              SKILL VERIFICATION
            </span>
            <p className="font-extrabold uppercase text-white tracking-tight text-xs">Vetted Matrices</p>
            <p className="text-[10px] uppercase font-bold text-neutral-500">Adaptive assessments, no fluff</p>
          </div>
          <div className="space-y-1 text-left p-2 md:pl-6 border-r border-neutral-805 last:border-r-0">
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-450 flex items-center gap-1.5 font-black">
              <Briefcase className="w-3.5 h-3.5" />
              SOURCING LATENCY
            </span>
            <p className="font-extrabold uppercase text-white tracking-tight text-xs">Zero Bottleneck</p>
            <p className="text-[10px] uppercase font-bold text-neutral-500">Direct query profile unlocking</p>
          </div>
          <div className="space-y-1 text-left p-2 md:pl-6 border-r border-neutral-805 last:border-r-0">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#10b981] flex items-center gap-1.5 font-black">
              <Shield className="w-3.5 h-3.5" />
              CONFIDENCE MATRIX
            </span>
            <p className="font-extrabold uppercase text-white tracking-tight text-xs">Proof-Driven dossiers</p>
            <p className="text-[10px] uppercase font-bold text-neutral-500">SaaS audit metric transparency</p>
          </div>
          <div className="space-y-1 text-left p-2 md:pl-6 last:border-r-0">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#10b981] flex items-center gap-1.5 font-black">
              <Lock className="w-3.5 h-3.5" />
              COMPLIANCE SAFE
            </span>
            <p className="font-extrabold uppercase text-white tracking-tight text-xs">Anti-Crawl Guard</p>
            <p className="text-[10px] uppercase font-bold text-neutral-500">Protected contact directories</p>
          </div>
        </div>

        {/* Multi-Column Directory */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 items-start pt-4">
          
          {/* Brand Column (Spans 4) */}
          <div className="lg:col-span-4 space-y-4 text-left">
            <button 
              onClick={(e) => handleLink(e, 'home')}
              className="inline-flex items-center gap-2.5 cursor-pointer bg-transparent border-0 p-0 text-left group"
            >
              <div className="w-9 h-9 bg-neutral-900 border border-neutral-800 rounded-none flex items-center justify-center">
                <ShieldCheck className="w-5.5 h-5.5 text-emerald-450" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black text-sm uppercase tracking-wider text-white">
                  DSP TALENT HUB
                </span>
                <span className="text-[9px] font-mono font-black text-neutral-500 tracking-wider">AFRICA'S VETTED MATRIX</span>
              </div>
            </button>
            <p className="text-[11px] uppercase tracking-wider font-bold text-neutral-500 max-w-sm leading-relaxed">
              AFRICA'S PREMIER PLATFORM FOR DIGITAL OPERATORS. WE EXCLUDE TRADITIONAL RESUME METRICS. SOURCING RUNS PURELY ON ADAPTIVE ASSESSMENTS AND PROVEN SINE-WAVE VERIFICATION.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a href="mailto:hiring@dsptalenthub.com" className="w-8 h-8 rounded-none bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-emerald-400 transition" title="Contact Us">
                <Mail className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-none bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-[#10b981] transition" title="Global Network">
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Platform Column (Spans 2) */}
          <div className="lg:col-span-2 text-left space-y-4">
            <h5 className="font-mono text-[10px] text-white uppercase tracking-wider font-extrabold border-l-2 border-emerald-500 pl-2">SYSTEM</h5>
            <ul className="space-y-3 text-[11px] font-bold uppercase tracking-wider text-left">
              <li>
                <button onClick={(e) => handleLink(e, 'directory')} className="text-neutral-500 hover:text-white transition cursor-pointer text-left">
                  Find Talent
                </button>
              </li>
              <li>
                <button onClick={(e) => handleLink(e, 'employer')} className="text-neutral-500 hover:text-white transition cursor-pointer text-left">
                  Employers
                </button>
              </li>
              <li>
                <button onClick={(e) => handleLink(e, 'pricing')} className="text-neutral-500 hover:text-white transition cursor-pointer text-left">
                  Rates Matrix
                </button>
              </li>
            </ul>
          </div>

          {/* Candidates Column (Spans 2) */}
          <div className="lg:col-span-2 text-left space-y-4">
            <h5 className="font-mono text-[10px] text-white uppercase tracking-wider font-extrabold border-l-2 border-emerald-500 pl-2">TALENT</h5>
            <ul className="space-y-2 text-[11px] font-bold uppercase tracking-wider text-left">
              <li>
                <button onClick={(e) => handleLink(e, 'talent')} className="text-neutral-500 hover:text-white transition cursor-pointer text-left">
                  Portfolio Builder
                </button>
              </li>
              <li>
                <button onClick={(e) => handleLink(e, 'assessment')} className="text-emerald-400 hover:text-[#10b981] transition cursor-pointer text-left flex items-center gap-1">
                  Assessments <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                </button>
              </li>
              <li>
                <button onClick={(e) => handleLink(e, 'pricing')} className="text-neutral-500 hover:text-white transition cursor-pointer text-left">
                  Verification
                </button>
              </li>
            </ul>
          </div>

          {/* Legal Column (Spans 2) */}
          <div className="lg:col-span-2 text-left space-y-4">
            <h5 className="font-mono text-[10px] text-white uppercase tracking-wider font-extrabold border-l-2 border-emerald-500 pl-2">INFO</h5>
            <ul className="space-y-2 text-[11px] font-bold uppercase tracking-wider text-left text-left">
              <li><a href="#" className="text-neutral-500 hover:text-white transition">Terms</a></li>
              <li><a href="#" className="text-neutral-500 hover:text-white transition">Privacy</a></li>
              <li><a href="#" className="text-neutral-500 hover:text-white transition">Disclosures</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Panel */}
        <div className="border-t border-neutral-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] uppercase font-bold text-neutral-500">
          <p>© {currentYear} DSP Talent Hub Sourcing Systems. Vetted professional operators network.</p>
          <div className="flex items-center gap-4 text-neutral-600 font-mono">
            <span className="w-1.5 h-1.5 rounded-none bg-emerald-500" />
            <span>African Digital Operator Core</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
