import React, { useState } from 'react';
import { Menu, X, ArrowRight, Briefcase } from 'lucide-react';

interface FounderCommunityHeaderProps {
  onJoinClick: () => void;
  onNavigateToDigitalJobs?: () => void;
}

export const FounderCommunityHeader: React.FC<FounderCommunityHeaderProps> = ({
  onJoinClick,
  onNavigateToDigitalJobs
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* LOGO */}
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex flex-col cursor-pointer select-none group"
        >
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-2xl tracking-tight text-neutral-900 group-hover:text-neutral-800 transition">
              Digital
            </span>
            <span className="font-extrabold text-2xl tracking-tight text-[#16834A]">
              Campux
            </span>
          </div>
          <span className="text-[9px] font-bold tracking-[0.22em] text-neutral-400 uppercase -mt-0.5">
            FOUNDERS • VISIBILITY • OPPORTUNITIES
          </span>
        </div>

        {/* DESKTOP NAVIGATION */}
        <nav className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-sm font-semibold text-[#16834A] hover:text-[#13723f] transition cursor-pointer"
          >
            Home
          </button>
          <button 
            onClick={() => scrollToSection('why-digital-campux')}
            className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition cursor-pointer"
          >
            About
          </button>
          <button 
            onClick={() => scrollToSection('founder-stories')}
            className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition cursor-pointer"
          >
            Founder Stories
          </button>
          <button 
            onClick={() => scrollToSection('our-mission')}
            className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition cursor-pointer"
          >
            Our Mission
          </button>
          <button 
            onClick={() => scrollToSection('faq')}
            className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition cursor-pointer"
          >
            FAQ
          </button>
        </nav>

        {/* RIGHT CTAs */}
        <div className="hidden sm:flex items-center gap-3">
          {onNavigateToDigitalJobs && (
            <button
              onClick={onNavigateToDigitalJobs}
              className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 px-3 py-2 rounded-lg border border-slate-200 hover:border-slate-300 transition flex items-center gap-1.5 cursor-pointer"
              title="Visit Digital Jobs & Talent Portal"
            >
              <Briefcase className="w-3.5 h-3.5 text-[#16834A]" />
              <span>Digital Jobs</span>
            </button>
          )}

          <button
            onClick={onJoinClick}
            className="bg-[#16834A] hover:bg-[#13723f] text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-full transition shadow-sm hover:shadow flex items-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <span>Join as a Founder</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* MOBILE MENU TOGGLE & QUICK CTA */}
        <div className="flex md:hidden items-center gap-2.5">
          <button
            onClick={onJoinClick}
            className="bg-[#16834A] hover:bg-[#13723f] text-white text-xs font-bold px-3.5 py-2 rounded-full cursor-pointer shadow-xs active:scale-95 transition"
          >
            Join
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 -mr-1 rounded-xl text-neutral-800 hover:text-neutral-950 hover:bg-neutral-100 transition active:scale-95 focus:outline-none"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU ACCORDION / DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/98 backdrop-blur-xl border-b border-slate-200/80 px-5 pt-3 pb-6 space-y-1 animate-fadeIn shadow-xl">
          <div className="py-2 text-[10px] font-mono font-bold tracking-wider text-neutral-400 uppercase">
            Menu Navigation
          </div>

          <button 
            onClick={() => scrollToSection('hero')}
            className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-semibold text-[#16834A] hover:bg-emerald-50/70 transition flex items-center justify-between"
          >
            <span>Home</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#16834A]" />
          </button>
          
          <button 
            onClick={() => scrollToSection('why-digital-campux')}
            className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium text-neutral-700 hover:text-neutral-900 hover:bg-slate-50 transition"
          >
            About
          </button>
          
          <button 
            onClick={() => scrollToSection('founder-stories')}
            className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium text-neutral-700 hover:text-neutral-900 hover:bg-slate-50 transition"
          >
            Founder Stories
          </button>
          
          <button 
            onClick={() => scrollToSection('our-mission')}
            className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium text-neutral-700 hover:text-neutral-900 hover:bg-slate-50 transition"
          >
            Our Mission
          </button>
          
          <button 
            onClick={() => scrollToSection('faq')}
            className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium text-neutral-700 hover:text-neutral-900 hover:bg-slate-50 transition"
          >
            FAQ
          </button>

          <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col gap-2.5">
            {onNavigateToDigitalJobs && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateToDigitalJobs();
                }}
                className="w-full text-center py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-neutral-700 hover:bg-slate-50 flex items-center justify-center gap-2 transition"
              >
                <Briefcase className="w-4 h-4 text-[#16834A]" />
                <span>Switch to Digital Jobs Portal</span>
              </button>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onJoinClick();
              }}
              className="w-full bg-[#16834A] hover:bg-[#13723f] text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#16834A]/20 active:scale-[0.99] transition cursor-pointer"
            >
              <span>Join as a Founder</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
