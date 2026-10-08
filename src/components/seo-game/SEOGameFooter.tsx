import React from 'react';
import { Gamepad2, Search } from 'lucide-react';

interface SEOGameFooterProps {
  onSignInClick: () => void;
  onCreateAccountClick: () => void;
}

export function SEOGameFooter({ onSignInClick, onCreateAccountClick }: SEOGameFooterProps) {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="w-full bg-[#050810] border-t border-slate-800/80 py-12 sm:py-16 text-left text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-10 border-b border-slate-800/60">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#18B892] via-[#0E7A60] to-[#0A4D3C] p-0.5">
              <div className="w-full h-full bg-[#080E1A] rounded-[10px] flex items-center justify-center">
                <Gamepad2 className="w-4 h-4 text-[#18B892]" />
              </div>
            </div>
            <div>
              <div className="font-extrabold text-sm sm:text-base text-white tracking-wider flex items-center gap-1.5 leading-none">
                SEO GAME
                <span className="w-1.5 h-1.5 rounded-full bg-[#18B892]" />
              </div>
              <span className="text-[10px] font-medium tracking-widest uppercase text-slate-400">
                by DSP Academy
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap items-center gap-5 sm:gap-7 font-semibold text-xs text-slate-300">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
              className="hover:text-[#18B892] transition-colors cursor-pointer"
            >
              Home
            </button>
            <button 
              onClick={() => scrollTo('how-it-works')} 
              className="hover:text-[#18B892] transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button 
              onClick={() => scrollTo('features')} 
              className="hover:text-[#18B892] transition-colors cursor-pointer"
            >
              Game Features
            </button>
            <button 
              onClick={() => scrollTo('missions')} 
              className="hover:text-[#18B892] transition-colors cursor-pointer"
            >
              Missions
            </button>
            <button 
              onClick={() => scrollTo('faq')} 
              className="hover:text-[#18B892] transition-colors cursor-pointer"
            >
              FAQ
            </button>
            <button 
              onClick={onSignInClick} 
              className="hover:text-[#18B892] transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button 
              onClick={onCreateAccountClick} 
              className="text-[#18B892] hover:text-[#38ef7d] font-bold transition-colors cursor-pointer"
            >
              Create Account
            </button>
          </div>

        </div>

        {/* Legal & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-mono">
          <div>
            © {new Date().getFullYear()} DSP Academy. All rights reserved. The SEO Game is a registered interactive simulator.
          </div>

          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 transition cursor-pointer">Privacy Policy</span>
            <span>·</span>
            <span className="hover:text-slate-400 transition cursor-pointer">Terms of Service</span>
            <span>·</span>
            <span className="hover:text-slate-400 transition cursor-pointer">Cookie Preferences</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
