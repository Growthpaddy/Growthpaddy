import React, { useState } from 'react';
import { Gamepad2, Search, Menu, X, ArrowRight, ShieldCheck, UserCheck, Sparkles } from 'lucide-react';

interface SEOGameHeaderProps {
  isLoggedIn: boolean;
  userName?: string;
  onSignInClick: () => void;
  onCreateAccountClick: () => void;
  onStartPlayingClick: () => void;
}

export function SEOGameHeader({
  isLoggedIn,
  userName,
  onSignInClick,
  onCreateAccountClick,
  onStartPlayingClick
}: SEOGameHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#070B14]/90 backdrop-blur-md border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <a 
            href="#hero" 
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 group cursor-pointer focus:outline-none"
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#18B892] via-[#0E7A60] to-[#0A4D3C] p-0.5 shadow-lg shadow-[#18B892]/20 group-hover:shadow-[#18B892]/40 transition duration-300">
              <div className="w-full h-full bg-[#080E1A] rounded-[10px] flex items-center justify-center relative overflow-hidden">
                <Gamepad2 className="w-5 h-5 text-[#18B892] transition-transform group-hover:scale-110" />
                <Search className="w-3 h-3 text-cyan-300 absolute -bottom-0.5 -right-0.5 opacity-80" />
                <div className="absolute inset-0 bg-[#18B892]/10 opacity-0 group-hover:opacity-100 transition" />
              </div>
            </div>
            
            <div className="flex flex-col text-left">
              <span className="font-extrabold text-base sm:text-lg tracking-wider text-white flex items-center gap-1.5 leading-none">
                SEO GAME
                <span className="w-1.5 h-1.5 rounded-full bg-[#18B892] animate-pulse" />
              </span>
              <span className="text-[10px] font-medium tracking-widest uppercase text-slate-400 mt-0.5">
                by DSP Academy
              </span>
            </div>
          </a>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold tracking-wide text-slate-300">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
            className="hover:text-[#18B892] transition-colors cursor-pointer"
          >
            Home
          </button>
          <button 
            onClick={() => scrollToSection('how-it-works')} 
            className="hover:text-[#18B892] transition-colors cursor-pointer"
          >
            How It Works
          </button>
          <button 
            onClick={() => scrollToSection('features')} 
            className="hover:text-[#18B892] transition-colors cursor-pointer"
          >
            Game Features
          </button>
          <button 
            onClick={() => scrollToSection('missions')} 
            className="hover:text-[#18B892] transition-colors cursor-pointer"
          >
            Missions
          </button>
          <button 
            onClick={() => scrollToSection('leaderboard')} 
            className="hover:text-[#18B892] transition-colors cursor-pointer"
          >
            Leaderboard
          </button>
          <button 
            onClick={() => scrollToSection('faq')} 
            className="hover:text-[#18B892] transition-colors cursor-pointer"
          >
            FAQ
          </button>
        </nav>

        {/* Auth CTA Controls */}
        <div className="hidden sm:flex items-center gap-3">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-300 flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
                <UserCheck className="w-3.5 h-3.5 text-[#18B892]" />
                <span className="max-w-[120px] truncate">{userName || 'Player 1'}</span>
              </span>
              <button
                onClick={onStartPlayingClick}
                className="bg-[#18B892] hover:bg-[#149f7e] text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition shadow-lg shadow-[#18B892]/20 flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span>Enter Game</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={onSignInClick}
                className="text-xs font-semibold text-slate-200 hover:text-white px-3.5 py-2 rounded-xl border border-slate-700/80 hover:border-slate-500 bg-slate-900/60 hover:bg-slate-800/60 transition cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={onCreateAccountClick}
                className="text-xs font-bold text-slate-950 bg-[#18B892] hover:bg-[#15a381] px-4 py-2 rounded-xl transition shadow-lg shadow-[#18B892]/25 hover:shadow-[#18B892]/40 cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <span>Create Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex lg:hidden items-center gap-2">
          {!isLoggedIn && (
            <button
              onClick={onCreateAccountClick}
              className="sm:hidden text-[11px] font-bold text-slate-950 bg-[#18B892] px-2.5 py-1.5 rounded-lg"
            >
              Play Free
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-900/80 border border-slate-700/70 text-slate-300 hover:text-white cursor-pointer focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-[#18B892]" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0A0F1D]/95 backdrop-blur-xl border-b border-slate-800 px-4 pt-3 pb-6 space-y-4 animate-fadeIn">
          <div className="flex flex-col space-y-2.5 text-sm font-medium text-slate-300">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-800/60 hover:text-[#18B892] transition"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-800/60 hover:text-[#18B892] transition"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-800/60 hover:text-[#18B892] transition"
            >
              Game Features
            </button>
            <button
              onClick={() => scrollToSection('missions')}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-800/60 hover:text-[#18B892] transition"
            >
              Missions
            </button>
            <button
              onClick={() => scrollToSection('leaderboard')}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-800/60 hover:text-[#18B892] transition"
            >
              Leaderboard
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="text-left py-2 px-3 rounded-lg hover:bg-slate-800/60 hover:text-[#18B892] transition"
            >
              FAQ
            </button>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2.5">
            {isLoggedIn ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onStartPlayingClick();
                }}
                className="w-full bg-[#18B892] text-slate-950 font-bold py-2.5 rounded-xl text-center text-xs shadow-lg shadow-[#18B892]/20"
              >
                Enter Game Dashboard →
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onCreateAccountClick();
                  }}
                  className="w-full bg-[#18B892] text-slate-950 font-bold py-2.5 rounded-xl text-center text-xs shadow-lg shadow-[#18B892]/20"
                >
                  Create Free Account
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onSignInClick();
                  }}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 font-semibold py-2.5 rounded-xl text-center text-xs hover:bg-slate-800"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
