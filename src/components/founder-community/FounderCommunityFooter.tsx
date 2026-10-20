import React, { useState } from 'react';
import { 
  Play, 
  Send, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';

interface FounderCommunityFooterProps {
  onNavigateHome?: () => void;
  onNavigateToDigitalJobs?: () => void;
}

export const FounderCommunityFooter: React.FC<FounderCommunityFooterProps> = ({
  onNavigateHome,
  onNavigateToDigitalJobs
}) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) return;

    setNewsletterStatus('loading');
    setTimeout(() => {
      setNewsletterStatus('success');
      setNewsletterEmail('');
      setTimeout(() => setNewsletterStatus('idle'), 4000);
    }, 600);
  };

  return (
    <footer className="bg-[#05080E] text-white pt-16 pb-10 border-t border-slate-900 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main 4-Column Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10">
          
          {/* Column 1: Brand & Tagline */}
          <div className="lg:col-span-4 space-y-4">
            <div 
              onClick={() => {
                if (onNavigateHome) onNavigateHome();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex flex-col cursor-pointer select-none group"
            >
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-2xl tracking-tight text-white group-hover:text-slate-200 transition">
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

            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed font-normal">
              A platform for young and emerging Nigerian founders to share their stories and access real opportunities.
            </p>

            {/* Social Icons matching YouTube, LinkedIn, X, Instagram from reference */}
            <div className="flex items-center gap-3 pt-2">
              {/* YouTube */}
              <a 
                href="https://www.youtube.com/@EzejiPatrick" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-[#16834A] text-slate-300 hover:text-white flex items-center justify-center transition border border-slate-800"
              >
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              </a>

              {/* LinkedIn */}
              <a 
                href="https://linkedin.com/company/digitalcampux" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-[#16834A] text-slate-300 hover:text-white flex items-center justify-center transition border border-slate-800 text-xs font-bold font-mono"
              >
                in
              </a>

              {/* X / Twitter */}
              <a 
                href="https://twitter.com/digitalcampux" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="X (formerly Twitter)"
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-[#16834A] text-slate-300 hover:text-white flex items-center justify-center transition border border-slate-800 text-xs font-bold"
              >
                𝕏
              </a>

              {/* Instagram */}
              <a 
                href="https://instagram.com/digitalcampux" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-[#16834A] text-slate-300 hover:text-white flex items-center justify-center transition border border-slate-800"
              >
                <svg className="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-sans font-bold text-sm text-white tracking-wide">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              <li>
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
                  className="hover:text-white transition cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('why-digital-campux')} 
                  className="hover:text-white transition cursor-pointer"
                >
                  About
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('founder-stories')} 
                  className="hover:text-white transition cursor-pointer"
                >
                  Founder Stories
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('our-mission')} 
                  className="hover:text-white transition cursor-pointer"
                >
                  Our Mission
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('faq')} 
                  className="hover:text-white transition cursor-pointer"
                >
                  FAQ
                </button>
              </li>
              {onNavigateToDigitalJobs && (
                <li>
                  <button 
                    onClick={onNavigateToDigitalJobs} 
                    className="hover:text-[#18B892] text-slate-400 font-semibold transition cursor-pointer pt-1"
                  >
                    Digital Jobs Portal →
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-sans font-bold text-sm text-white tracking-wide">
              Legal
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              <li>
                <a href="#privacy" className="hover:text-white transition">Privacy Policy</a>
              </li>
              <li>
                <a href="#terms" className="hover:text-white transition">Terms of Service</a>
              </li>
              <li>
                <a href="mailto:contact@digitalcampux.com.ng" className="hover:text-white transition">Contact</a>
              </li>
            </ul>
          </div>

          {/* Column 4: Stay Updated / Newsletter */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="font-sans font-bold text-sm text-white tracking-wide">
              Stay Updated
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              Get the latest updates about new stories, community events and opportunities.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="relative mt-2">
              <input 
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Your email address"
                className="w-full bg-[#0C121A] text-white placeholder-slate-500 text-xs px-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-[#16834A] focus:ring-1 focus:ring-[#16834A] transition pr-12"
              />
              <button
                type="submit"
                disabled={newsletterStatus === 'loading'}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-[#16834A] hover:bg-[#13723f] text-white flex items-center justify-center transition shadow-xs cursor-pointer disabled:opacity-60"
                aria-label="Subscribe to newsletter"
              >
                {newsletterStatus === 'loading' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : newsletterStatus === 'success' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                ) : (
                  <Send className="w-3.5 h-3.5 text-white ml-0.5" />
                )}
              </button>
            </form>
            {newsletterStatus === 'success' && (
              <p className="text-[11px] text-[#18B892] animate-fadeIn">
                ✓ You have been subscribed for founder updates.
              </p>
            )}
          </div>

        </div>

        {/* Bottom Line */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} Digital Campux. All rights reserved.
          </div>
          <div className="text-slate-400 font-medium">
            Built for Nigerian Founders. By Ezeji Patrick.
          </div>
        </div>

      </div>
    </footer>
  );
};
