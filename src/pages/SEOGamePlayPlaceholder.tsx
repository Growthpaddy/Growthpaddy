import React, { useState, useEffect } from 'react';
import { 
  Gamepad2, 
  Search, 
  ArrowLeft, 
  Zap, 
  Cpu, 
  Database, 
  Globe, 
  CheckCircle2, 
  Layers, 
  Building2, 
  Sparkles,
  Play,
  RotateCcw
} from 'lucide-react';
import { PageType } from '../types';

interface SEOGamePlayPlaceholderProps {
  userName?: string;
  userEmail?: string;
  isLoggedIn: boolean;
  navigateToPage: (page: PageType) => void;
  onOpenSignIn: () => void;
}

export default function SEOGamePlayPlaceholder({
  userName,
  userEmail,
  isLoggedIn,
  navigateToPage,
  onOpenSignIn
}: SEOGamePlayPlaceholderProps) {
  const [selectedIndustry, setSelectedIndustry] = useState<string>('real-estate');
  const [launchProgress, setLaunchProgress] = useState(100);
  const [isInitializing, setIsInitializing] = useState(false);
  const [launchMessage, setLaunchMessage] = useState<string | null>(null);

  const handleLaunch = () => {
    setIsInitializing(true);
    setLaunchMessage('Initializing isolated sandbox container and deploying initial SERP rankings...');
    setTimeout(() => {
      setIsInitializing(false);
      setLaunchMessage('Sandbox ready! Mission #1 "Rank Your First Keyword" active. Simulator environment connected.');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#06090F] text-slate-100 font-sans selection:bg-[#18B892]/30 selection:text-white pb-20">
      
      {/* Top Game Bar */}
      <div className="w-full bg-[#080E1C] border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <button
          onClick={() => navigateToPage('the-seo-game')}
          className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400 hover:text-[#18B892] transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to /The-SEO-Game Landing</span>
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-[#18B892] animate-pulse" />
          <span className="text-xs font-mono text-slate-300">
            Player: <strong className="text-white">{userName || 'Authenticated Strategist'}</strong>
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-12 sm:pt-16 text-left space-y-8">
        
        {/* Header Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0B1528] to-[#080E1A] border-2 border-slate-800 text-left relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#18B892]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18B892]/10 border border-[#18B892]/30 text-[#18B892] text-xs font-mono font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>GAMEPLAY STAGING CHAMBER</span>
          </div>

          <h1 className="font-display font-black text-2xl sm:text-4xl text-white mb-2">
            The SEO Game Simulator Hub
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            Welcome to your interactive SEO strategy command room. Choose your target business sector below to provision your simulated website and real-time competitor sandbox.
          </p>
        </div>

        {/* System Checklist / Preparation Status */}
        <div className="bg-[#091020] border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#18B892]" />
            Simulation Environment Status
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">SERP Crawler Engine:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready
              </span>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Algorithm Volatility:</span>
              <span className="text-cyan-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Calibrated
              </span>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">AI Overview Grounding:</span>
              <span className="text-purple-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Online
              </span>
            </div>
          </div>
        </div>

        {/* Choose Industry Niche */}
        <div className="bg-[#091020] border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            Choose Your Business Sector
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {[
              { id: 'real-estate', title: 'Real Estate & Rentals', desc: 'Apex Realty — High competition, localized search intent, competitive luxury rentals.' },
              { id: 'b2b-saas', title: 'B2B Enterprise SaaS', desc: 'CloudMetrics — Technical search terms, bottom-of-funnel comparison keywords, high LTV.' },
              { id: 'ecommerce', title: 'DTC E-Commerce', desc: 'Aura Lifestyle — Faceted navigation, product structured data, high volume head terms.' },
              { id: 'local-clinic', title: 'Local Healthcare & Services', desc: 'Metro Clinic — Google Map pack dominance, service landing pages, localized reviews.' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setSelectedIndustry(item.id)}
                className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                  selectedIndustry === item.id
                    ? 'bg-[#0E1C2E] border-[#18B892] shadow-lg shadow-[#18B892]/15'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-white text-sm">{item.title}</h4>
                  {selectedIndustry === item.id && (
                    <span className="text-[10px] font-mono text-[#18B892] bg-[#18B892]/20 px-2 py-0.5 rounded">
                      Selected
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Launch Action */}
        <div className="text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <div>
            <div className="text-xs text-slate-400 font-mono">
              Ready to execute your initial keyword audit and content plan.
            </div>
            {launchMessage && (
              <div className="text-xs text-[#18B892] font-semibold mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{launchMessage}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateToPage('the-seo-game')}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              Back to Overview
            </button>

            <button
              onClick={handleLaunch}
              disabled={isInitializing}
              className="px-6 py-3 rounded-xl bg-[#18B892] hover:bg-[#149f7e] text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-[#18B892]/25 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isInitializing ? 'Provisioning...' : 'Launch Sandbox Session'}</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
