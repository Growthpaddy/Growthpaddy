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

        {/* MOBILE MENU TOGGLE */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={onJoinClick}
            className="bg-[#16834A] text-white text-xs font-bold px-3 py-2 rounded-full cursor-pointer"
          >
            Join
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-neutral-700 hover:text-neutral-900 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU ACCORDION */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-b border-slate-100 px-4 pt-3 pb-6 space-y-3 animate-fadeIn">
          <button 
            onClick={() => scrollToSection('hero')}
            className="block w-full text-left py-2 text-sm font-semibold text-[#16834A]"
          >
            Home
          </button>
          <button 
            onClick={() => scrollToSection('why-digital-campux')}
            className="block w-full text-left py-2 text-sm font-medium text-neutral-700"
          >
            About
          </button>
          <button 
            onClick={() => scrollToSection('founder-stories')}
            className="block w-full text-left py-2 text-sm font-medium text-neutral-700"
          >
            Founder Stories
          </button>
          <button 
            onClick={() => scrollToSection('our-mission')}
            className="block w-full text-left py-2 text-sm font-medium text-neutral-700"
          >
            Our Mission
          </button>
          <button 
            onClick={() => scrollToSection('faq')}
            className="block w-full text-left py-2 text-sm font-medium text-neutral-700"
          >
            FAQ
          </button>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {onNavigateToDigitalJobs && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateToDigitalJobs();
                }}
                className="w-full text-center py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-neutral-700 flex items-center justify-center gap-2"
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
              className="w-full bg-[#16834A] text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow"
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
