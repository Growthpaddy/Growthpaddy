import { useState } from 'react';
import { ShieldCheck, Menu, X, ArrowUpRight, Github, Mail, Globe, Sparkles } from 'lucide-react';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#fafbfa]/85 backdrop-blur-md border-b border-neutral-100 px-4 sm:px-6 lg:px-8 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <a href="#" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-neutral-900 group-hover:bg-brand-primary rounded-xl flex items-center justify-center transition-colors duration-200 shadow-sm">
            <ShieldCheck className="w-5 h-5 text-[#fafbfa]" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-display font-bold text-xl uppercase tracking-wider text-neutral-900 group-hover:text-brand-primary transition">
              VERIFOLIO
            </span>
            <span className="text-[9px] font-mono leading-none tracking-tight text-neutral-400">
              verified talent meets opportunity
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-600">
          <a href="#the-problem" className="hover:text-neutral-900 transition-colors">The Problem</a>
          <a href="#how-it-works" className="hover:text-neutral-900 transition-colors">How it Works</a>
          <a href="#choose-your-path" className="hover:text-neutral-900 transition-colors">Tracks</a>
          <a href="#live-talent-directory" className="hover:text-neutral-900 transition-colors">Talent Directory</a>
          <a href="#portfolio-ecosystem" className="hover:text-neutral-900 transition-colors">Portfolio</a>
          <a href="#trust-badges" className="hover:text-neutral-900 transition-colors">Badges Standard</a>
        </nav>

        {/* CTA Actions */}
        <div className="hidden md:flex items-center gap-3">
          <a 
            href="#live-talent-directory" 
            className="text-xs font-mono font-bold text-neutral-800 hover:text-black py-2 px-4 transition-colors"
          >
            Find Talent
          </a>
          <a 
            href="#join-network-talent" 
            className="text-xs font-mono font-bold bg-[#111311] hover:bg-neutral-800 text-white py-2.5 px-4.5 rounded-xl flex items-center gap-1.5 transition shadow-xs hover:shadow"
          >
            <span>Join As Talent</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-brand-primary" />
          </a>
        </div>

        {/* Mobile menu Toggle */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-neutral-700 hover:text-black focus:outline-none p-1.5"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-neutral-200/90 shadow-lg px-6 py-6 space-y-4 flex flex-col text-left">
          <a 
            href="#the-problem" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-base font-semibold text-neutral-700 hover:text-black"
          >
            The Problem
          </a>
          <a 
            href="#how-it-works" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-base font-semibold text-neutral-700 hover:text-black"
          >
            How it Works
          </a>
          <a 
            href="#choose-your-path" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-base font-semibold text-neutral-700 hover:text-black"
          >
            Tracks & Options
          </a>
          <a 
            href="#live-talent-directory" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-base font-semibold text-neutral-700 hover:text-black"
          >
            Talent Directory
          </a>
          <a 
            href="#portfolio-ecosystem" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-base font-semibold text-neutral-700 hover:text-black"
          >
            Portfolio System
          </a>
          <a 
            href="#trust-badges" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-base font-semibold text-neutral-700 hover:text-black"
          >
            Vetting Quality Badges
          </a>

          <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row gap-3">
            <a 
              href="#live-talent-directory"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl border border-neutral-300 text-sm font-semibold text-neutral-800"
            >
              Find Talent
            </a>
            <a 
              href="#join-network-talent"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl bg-neutral-900 text-white font-semibold text-sm flex items-center justify-center gap-2"
            >
              <span>Join As Talent</span>
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-950 text-neutral-400 py-16 md:py-20 border-t border-neutral-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Core Multi-Column Directory */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8 items-start">
          
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2 space-y-4 text-left">
            <a href="#" className="inline-flex items-center gap-2">
              <div className="w-8 h-8 bg-[#fafbfa] rounded-lg flex items-center justify-center shadow">
                <ShieldCheck className="w-4 h-4 text-neutral-950" />
              </div>
              <span className="font-display font-bold text-lg uppercase tracking-wider text-white">
                VERIFOLIO
              </span>
            </a>
            <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
              Discover verified, tested digital professionals for internships and immediate hires. Built around trust, audited skills, and living metric portfolios.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="w-7 h-7 rounded-full bg-neutral-900 hover:bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition">
                <Mail className="w-3.5 h-3.5" />
              </a>
              <a href="#" className="w-7 h-7 rounded-full bg-neutral-900 hover:bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition">
                <Github className="w-3.5 h-3.5" />
              </a>
              <a href="#" className="w-7 h-7 rounded-full bg-neutral-900 hover:bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white transition">
                <Globe className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Company Column */}
          <div className="text-left space-y-3">
            <h5 className="font-mono text-[10px] text-white uppercase tracking-widest font-bold">Company</h5>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-white transition-colors">Our Story</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Press Kit</a></li>
              <li><a href="#" className="hover:text-white transition-colors font-semibold text-emerald-400 flex items-center gap-1"><span>Hiring Labs</span> <Sparkles className="w-2.5 h-2.5" /></a></li>
            </ul>
          </div>

          {/* Employers Column */}
          <div className="text-left space-y-3">
            <h5 className="font-mono text-[10px] text-white uppercase tracking-widest font-bold">Employers</h5>
            <ul className="space-y-2 text-xs">
              <li><a href="#live-talent-directory" className="hover:text-white transition-colors">Talent Directory</a></li>
              <li><a href="#vetting-standards" className="hover:text-white transition-colors">Vetting Standards</a></li>
              <li><a href="#employer-features" className="hover:text-white transition-colors">Hire Interns</a></li>
              <li><a href="#employer-features" className="hover:text-white transition-colors">Enterprise Vetting</a></li>
            </ul>
          </div>

          {/* Talent Column */}
          <div className="text-left space-y-3">
            <h5 className="font-mono text-[10px] text-white uppercase tracking-widest font-bold">Talent</h5>
            <ul className="space-y-2 text-xs">
              <li><a href="#join-network-talent" className="hover:text-white transition-colors">Join Fellowship</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">Vetting Sandbox</a></li>
              <li><a href="#choose-your-path" className="hover:text-white transition-colors">Certificates</a></li>
              <li><a href="#portfolio-ecosystem" className="hover:text-white transition-colors">Alumni Network</a></li>
            </ul>
          </div>

          {/* Internships Column */}
          <div className="text-left space-y-3">
            <h5 className="font-mono text-[10px] text-white uppercase tracking-widest font-bold">Internships</h5>
            <ul className="space-y-2 text-xs">
              <li><a href="#choose-your-path" className="hover:text-white transition-colors">Matched Term</a></li>
              <li><a href="#choose-your-path" className="hover:text-white transition-colors">Sponsorships</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Stipend Laws</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Success Rates</a></li>
            </ul>
          </div>

          {/* Verification Column */}
          <div className="text-left space-y-3">
            <h5 className="font-mono text-[10px] text-white uppercase tracking-widest font-bold">Verification</h5>
            <ul className="space-y-2 text-xs">
              <li><a href="#trust-badges" className="hover:text-white transition-colors">KYC Auditing</a></li>
              <li><a href="#trust-badges" className="hover:text-white transition-colors">Anti-Cheat SDK</a></li>
              <li><a href="#trust-badges" className="hover:text-white transition-colors">Credential Ledger</a></li>
              <li><a href="#trust-badges" className="hover:text-white transition-colors">Verify Seal ID</a></li>
            </ul>
          </div>

          {/* Portfolio Column */}
          <div className="text-left space-y-3">
            <h5 className="font-mono text-[10px] text-white uppercase tracking-widest font-bold">Portfolio</h5>
            <ul className="space-y-2 text-xs">
              <li><a href="#portfolio-ecosystem" className="hover:text-white transition-colors">Living Outputs</a></li>
              <li><a href="#portfolio-ecosystem" className="hover:text-white transition-colors">Deliverables Hub</a></li>
              <li><a href="#portfolio-ecosystem" className="hover:text-white transition-colors">Client Testimonials</a></li>
              <li><a href="#portfolio-ecosystem" className="hover:text-white transition-colors">API Integration</a></li>
            </ul>
          </div>

          {/* Resources Column */}
          <div className="text-left space-y-3">
            <h5 className="font-mono text-[10px] text-white uppercase tracking-widest font-bold">Resources</h5>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-white transition-colors">State of Talent</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Vetting Guides</a></li>
              <li><a href="#" className="hover:text-white transition-colors">SaaS Integrations</a></li>
              <li><a href="#" className="hover:text-white transition-colors font-medium">Compliance API</a></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="text-left space-y-3">
            <h5 className="font-mono text-[10px] text-white uppercase tracking-widest font-bold">Contact</h5>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-white transition-colors">Support Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Schedule Demo</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Trust Operations</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Legal & Privacy</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Rights, and Credits */}
        <div className="border-t border-neutral-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-600">
          <p>© {currentYear} Verifolio Vetting Ecosystem. All rights reserved.</p>
          <div className="flex items-center gap-4 text-neutral-500 font-mono">
            <span>Server: SECURE-LEDGER</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>All credentials verified as of {new Date().toLocaleDateString(undefined, {year: 'numeric', month: 'long'})}</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
