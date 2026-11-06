import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Globe, 
  Mail, 
  User, 
  Clock, 
  CheckCircle2, 
  ExternalLink, 
  LogOut, 
  Sparkles, 
  MessageSquare, 
  Youtube, 
  Briefcase 
} from 'lucide-react';
import { getCachedFounderProfile, logoutFounder, FounderProfile } from '../../lib/founderAuth';

interface FounderDashboardProps {
  onSignOut: () => void;
  onNavigateHome: () => void;
  onNavigateToDigitalJobs?: () => void;
}

export const FounderDashboard: React.FC<FounderDashboardProps> = ({
  onSignOut,
  onNavigateHome,
  onNavigateToDigitalJobs
}) => {
  const [profile, setProfile] = useState<FounderProfile | null>(null);

  useEffect(() => {
    const cached = getCachedFounderProfile();
    if (cached) {
      setProfile(cached);
    }
  }, []);

  const handleSignOutClick = async () => {
    await logoutFounder();
    onSignOut();
  };

  const displayName = profile?.full_name || 'Founder';
  const displayEmail = profile?.email || 'founder@digitalcampux.com';
  const displayBusiness = profile?.business_name || 'Your Emerging Business';
  const displayWebsite = profile?.website || null;
  const status = profile?.profile_status || 'pending';

  return (
    <div className="min-h-screen bg-[#F3F5F3] flex flex-col justify-between selection:bg-[#16834A]/20 selection:text-[#111111]">
      {/* TOP BAR */}
      <header className="w-full bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-1.5 cursor-pointer select-none group text-left focus:outline-none"
              aria-label="Back to Digital Campux Home"
            >
              <span className="font-extrabold text-2xl tracking-tight text-[#111111] group-hover:text-neutral-800 transition">
                Digital
              </span>
              <span className="font-extrabold text-2xl tracking-tight text-[#16834A]">
                Campux
              </span>
            </button>
            <span className="text-neutral-300 hidden sm:inline">|</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 hidden sm:inline">
              Founders Workspace
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden md:flex items-center gap-2.5 text-right">
              <div className="w-8 h-8 rounded-full bg-[#16834A]/10 text-[#16834A] flex items-center justify-center font-bold text-xs">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="text-xs">
                <p className="font-bold text-[#111111] leading-none">{displayName}</p>
                <p className="text-neutral-500 text-[11px] mt-0.5">{displayEmail}</p>
              </div>
            </div>

            <button
              onClick={handleSignOutClick}
              className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 px-3.5 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-100 flex items-center gap-1.5 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* WORKSPACE BODY */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        
        {/* WELCOME BANNER */}
        <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="max-w-2xl space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#16834A] text-xs font-bold border border-emerald-100">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Founder Community Member</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">
              Welcome, {displayName}!
            </h1>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
              Your founder account is active. This workspace connects you to community updates, visibility opportunities, and peer collaborations.
            </p>
          </div>
        </div>

        {/* STATUS & PROFILE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          
          {/* PROFILE STATUS CARD (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-neutral-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-[#111111]">Application &amp; Profile Status</h2>
                <p className="text-xs text-neutral-500">Editorial review process for community visibility</p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                <span>{status === 'pending' ? 'Pending Review' : status}</span>
              </div>
            </div>

            {/* Explanatory Callout */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 text-amber-900 text-xs sm:text-sm space-y-1.5 leading-relaxed">
              <p className="font-bold flex items-center gap-1.5 text-amber-950">
                <span>Profile Under Editorial Review</span>
              </p>
              <p>
                Your founder profile has been submitted and is currently queued for editorial verification. Once approved, your business will receive official visibility across our community directory and be considered for upcoming Founder Stories spotlight interviews.
              </p>
            </div>

            {/* Profile Fields List */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Submitted Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100 space-y-1">
                  <div className="flex items-center gap-2 text-neutral-500 text-xs">
                    <User className="w-3.5 h-3.5 text-[#16834A]" />
                    <span>Full Name</span>
                  </div>
                  <p className="text-sm font-bold text-[#111111]">{displayName}</p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100 space-y-1">
                  <div className="flex items-center gap-2 text-neutral-500 text-xs">
                    <Mail className="w-3.5 h-3.5 text-[#16834A]" />
                    <span>Email Address</span>
                  </div>
                  <p className="text-sm font-bold text-[#111111] truncate">{displayEmail}</p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100 space-y-1">
                  <div className="flex items-center gap-2 text-neutral-500 text-xs">
                    <Building2 className="w-3.5 h-3.5 text-[#16834A]" />
                    <span>Business Name</span>
                  </div>
                  <p className="text-sm font-bold text-[#111111]">{displayBusiness}</p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-100 space-y-1">
                  <div className="flex items-center gap-2 text-neutral-500 text-xs">
                    <Globe className="w-3.5 h-3.5 text-[#16834A]" />
                    <span>Website</span>
                  </div>
                  {displayWebsite ? (
                    <a
                      href={displayWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-[#16834A] hover:underline flex items-center gap-1 truncate"
                    >
                      <span className="truncate">{displayWebsite}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </a>
                  ) : (
                    <p className="text-sm text-neutral-400 italic">Not specified</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: COMMUNITY NEXT STEPS (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* WhatsApp Community Card */}
            <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-7 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#16834A] flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-[#111111] text-base">
                  Founder WhatsApp Circle
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Join fellow founders in our temporary community channel to network, share milestones, and exchange insights.
                </p>
              </div>
              <a
                href="https://chat.whatsapp.com/HjVefSGI3nCFXCYTCjni0F?s=sw&p=a&mlu=4&ilr=4"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#16834A] hover:bg-[#13723f] text-white font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer"
              >
                <span>Open WhatsApp Community</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* YouTube Stories Card */}
            <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-7 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <Youtube className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-[#111111] text-base">
                  Watch Founder Stories
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Discover how Nigerian builders validate ideas, launch MVPs, and scale real revenues in challenging environments.
                </p>
              </div>
              <a
                href="https://www.youtube.com/watch?v=DrpZwdPNnIY&list=PLcnpxLL0jyxk"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 border border-neutral-300 hover:border-neutral-400 bg-white text-neutral-800 font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer"
              >
                <span>Watch on YouTube</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Digital Jobs Link Card */}
            {onNavigateToDigitalJobs && (
              <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-7 shadow-sm space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-[#111111] text-base">
                    Hire Vetted Digital Talent
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Need an SEO specialist, growth marketer, or developer for your business? Browse assessed and accredited candidates.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onNavigateToDigitalJobs}
                  className="w-full inline-flex items-center justify-center gap-2 border border-neutral-300 hover:border-neutral-400 bg-white text-neutral-800 font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer"
                >
                  <span>Explore Talent Directory</span>
                </button>
              </div>
            )}

          </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="w-full bg-white border-t border-neutral-200 py-4 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} Digital Campux Founders Community. All rights reserved.</span>
          <div className="flex items-center gap-4 text-neutral-500">
            <button onClick={onNavigateHome} className="hover:text-neutral-900 transition">Home</button>
            <span>·</span>
            <button onClick={handleSignOutClick} className="hover:text-neutral-900 transition">Sign Out</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
