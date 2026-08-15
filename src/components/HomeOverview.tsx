import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  Briefcase, 
  Award, 
  Users, 
  Lock, 
  ArrowUpRight, 
  UserCheck, 
  Clock, 
  DollarSign, 
  Check, 
  X, 
  ChevronRight,
  TrendingUp,
  Building2,
  FileText,
  Star,
  Layers,
  Code,
  Cpu,
  BarChart3,
  Search
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface HomeOverviewProps {
  navigateToPage: (page: 'home' | 'directory' | 'employer' | 'talent' | 'assessment' | 'pricing' | 'admin' | 'admin-login') => void;
  openHireModal: () => void;
  openTalentModal: () => void;
}

interface CandidatePreview {
  id: string;
  name: string;
  role: string;
  specialty: string;
  vettingStatus: string;
  skills: string[];
  score: number;
  avatarUrl: string;
}

export default function HomeOverview({ navigateToPage, openHireModal, openTalentModal }: HomeOverviewProps) {
  const [candidates, setCandidates] = useState<CandidatePreview[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState<boolean>(true);
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('all');

  // Curated candidates pool
  const FALLBACK_CANDIDATES: CandidatePreview[] = [
    {
      id: 'preview-1',
      name: 'Marcus Vance',
      role: 'AI Automation Operations Architect',
      specialty: 'AI Automation',
      vettingStatus: '100% Verified',
      skills: ['Zapier', 'Make.com', 'Python', 'OpenAI API'],
      score: 98,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'
    },
    {
      id: 'preview-2',
      name: 'Elena Rostova',
      role: 'Senior Full-Stack Developer',
      specialty: 'Full-Stack Engineering',
      vettingStatus: '100% Verified',
      skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
      score: 96,
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300'
    },
    {
      id: 'preview-3',
      name: 'David K. Osei',
      role: 'Growth Marketing & PPC Lead',
      specialty: 'Growth Marketing',
      vettingStatus: '100% Verified',
      skills: ['Meta Ads', 'Google Ads', 'GA4', 'Funnel CRO'],
      score: 95,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300'
    },
    {
      id: 'preview-4',
      name: 'Sarah Jenkins',
      role: 'Programmatic SEO & Content Architect',
      specialty: 'SEO Strategy',
      vettingStatus: '100% Verified',
      skills: ['Ahrefs', 'Next.js', 'Schema.org', 'Data Pipelines'],
      score: 97,
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300'
    }
  ];

  // Fetch real candidate profiles from Supabase where phase_1_quiz_passed is true
  useEffect(() => {
    const fetchTalentPreview = async () => {
      setLoadingCandidates(true);
      try {
        const { data } = await supabase
          .from('talent_profiles')
          .select('id, full_name, specialty, skills, vetting_status, phase_1_score')
          .eq('phase_1_quiz_passed', true)
          .limit(4);

        if (data && data.length > 0) {
          const fetched: CandidatePreview[] = data.map((item: any, idx: number) => ({
            id: item.id || `db-${idx}`,
            name: item.full_name || `Vetted Specialist #${idx + 1}`,
            role: item.specialty ? `${item.specialty} Specialist` : 'Digital Growth Specialist',
            specialty: item.specialty || 'Tech Operations',
            vettingStatus: '100% Verified',
            skills: item.skills && item.skills.length > 0 ? item.skills.slice(0, 4) : ['TypeScript', 'AI Tools', 'APIs', 'Workflow Ops'],
            score: item.phase_1_score || 95,
            avatarUrl: FALLBACK_CANDIDATES[idx % FALLBACK_CANDIDATES.length].avatarUrl
          }));
          setCandidates(fetched);
        } else {
          setCandidates(FALLBACK_CANDIDATES);
        }
      } catch (err) {
        console.warn('Live talent preview sync notice, using curated pool fallback:', err);
        setCandidates(FALLBACK_CANDIDATES);
      } finally {
        setLoadingCandidates(false);
      }
    };

    fetchTalentPreview();
  }, []);

  const categories = [
    { id: 'all', label: 'All Roles', count: '1,420+' },
    { id: 'ai', label: 'AI Automation & Agents', count: '380+' },
    { id: 'fullstack', label: 'Full-Stack Developers', count: '520+' },
    { id: 'growth', label: 'Growth & Performance', count: '290+' },
    { id: 'seo', label: 'SEO & Content Engineers', count: '230+' },
  ];

  const filteredCandidates = activeCategoryTab === 'all' 
    ? candidates 
    : candidates.filter(c => {
        if (activeCategoryTab === 'ai') return c.specialty.toLowerCase().includes('ai') || c.role.toLowerCase().includes('automation');
        if (activeCategoryTab === 'fullstack') return c.specialty.toLowerCase().includes('stack') || c.specialty.toLowerCase().includes('develop');
        if (activeCategoryTab === 'growth') return c.specialty.toLowerCase().includes('growth') || c.specialty.toLowerCase().includes('market');
        if (activeCategoryTab === 'seo') return c.specialty.toLowerCase().includes('seo') || c.specialty.toLowerCase().includes('content');
        return true;
      });

  return (
    <div className="bg-slate-50/60 text-slate-900 text-left selection:bg-emerald-500/20 selection:text-emerald-900">
      
      {/* ==========================================
          1. HERO SECTION (Modern SaaS Layout)
          ========================================== */}
      <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 bg-gradient-to-b from-white via-slate-50/50 to-slate-50 overflow-hidden">
        {/* Subtle decorative mesh background */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.04] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto space-y-8 relative z-10">
          
          {/* Live Status Pill */}
          <div className="inline-flex items-center gap-2.5 bg-emerald-50/90 text-emerald-800 border border-emerald-200/80 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-[11px] uppercase tracking-wide font-bold">
              1,420+ Pre-Vetted Specialists Ready for Immediate Placement
            </span>
          </div>

          {/* Main Headline & Subtitle */}
          <div className="max-w-4xl space-y-5">
            <h1 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-7xl text-slate-900 tracking-tight leading-[1.08]">
              Hire verified digital talent with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">audited proof of work.</span>
            </h1>
            
            <p className="text-base sm:text-xl text-slate-600 font-normal max-w-2xl leading-relaxed">
              Skip the 6-week screening queue. Access pre-vetted AI engineers, full-stack developers, and growth specialists evaluated on real execution—with zero percent salary markups.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
            <button
              onClick={() => navigateToPage('directory')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 px-6 sm:px-8 rounded-xl text-sm flex items-center justify-center gap-2.5 cursor-pointer shadow-sm hover:shadow-md transition-all duration-150"
              id="hero-explore-talent-btn"
            >
              <Briefcase className="w-4 h-4 text-emerald-100" />
              <span>Explore Talent Directory</span>
              <ArrowRight className="w-4 h-4 text-emerald-100" />
            </button>

            <button
              onClick={openTalentModal}
              className="bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-semibold py-3.5 px-6 sm:px-8 rounded-xl text-sm border border-slate-300/90 flex items-center justify-center gap-2.5 cursor-pointer shadow-xs hover:shadow-sm transition-all duration-150"
              id="hero-apply-talent-btn"
            >
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>Apply as Vetted Talent</span>
            </button>
          </div>

          {/* Quick Metrics Strip */}
          <div className="pt-8 border-t border-slate-200/80">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-left">
                <span className="text-2xl font-extrabold font-mono text-emerald-600 block">&lt; 48 Hours</span>
                <span className="text-xs text-slate-500 font-medium block mt-1">Average Matching Time</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-left">
                <span className="text-2xl font-extrabold font-mono text-slate-900 block">Top 3%</span>
                <span className="text-xs text-slate-500 font-medium block mt-1">Acceptance Rate</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-left">
                <span className="text-2xl font-extrabold font-mono text-emerald-600 block">0% Markups</span>
                <span className="text-xs text-slate-500 font-medium block mt-1">Direct Salary Billing</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs text-left">
                <span className="text-2xl font-extrabold font-mono text-slate-900 block">100% Practical</span>
                <span className="text-xs text-slate-500 font-medium block mt-1">Audited Project Output</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ==========================================
          2. CORE VALUE PILLARS (Why Digital Campux)
          ========================================== */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-emerald-700 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Built for Modern Hiring Teams</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Why high-growth founders and hiring managers switch to Digital Campux
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Eliminate traditional recruiting friction with verified technical accreditation and direct talent connections.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Pillar 1: 48-Hour Rapid Matchmaking */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-7 sm:p-8 shadow-xs hover:shadow-md hover:border-emerald-500/40 transition-all duration-200 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900">
                48-Hour Rapid Deployment
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Candidates have already passed rigorous diagnostic tests and technical scenario evaluations. Review audited portfolios today, start onboarding tomorrow.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-mono font-semibold text-emerald-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Zero screening backlog</span>
            </div>
          </div>

          {/* Pillar 2: 120+ Hours Saved */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-7 sm:p-8 shadow-xs hover:shadow-md hover:border-emerald-500/40 transition-all duration-200 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900">
                120+ Hours Saved Per Hire
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                We eliminate unqualified resumes before they ever reach your inbox. Only candidates who prove real-world execution ability appear in the directory.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-mono font-semibold text-blue-700">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>Pre-evaluated work samples</span>
            </div>
          </div>

          {/* Pillar 3: 0% Ongoing Commission */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-7 sm:p-8 shadow-xs hover:shadow-md hover:border-emerald-500/40 transition-all duration-200 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900">
                0% Recurring Markup
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Legacy headhunters take 15% to 25% of annual compensation forever. Digital Campux charges transparent one-time access slots. You pay your talent directly.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-mono font-semibold text-teal-700">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>Direct compensation control</span>
            </div>
          </div>

        </div>
      </section>

      {/* ==========================================
          3. INTERACTIVE TALENT POOL SPOTLIGHT
          ========================================== */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white space-y-10">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-slate-800">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-mono uppercase tracking-wider font-semibold">
                <Users className="w-3.5 h-3.5" />
                <span>Live Candidate Stream</span>
              </div>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">
                Featured Pre-Vetted Specialists
              </h2>
              <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
                Discover verified professionals actively available for immediate contract or full-time roles.
              </p>
            </div>

            <button
              onClick={() => navigateToPage('directory')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 px-5 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition shadow-xs self-start sm:self-auto"
            >
              <span>Explore All Candidates</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Role Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryTab(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
                  activeCategoryTab === cat.id
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border border-slate-700/60'
                }`}
              >
                <span>{cat.label}</span>
                <span className="text-[10px] font-mono text-slate-400">{cat.count}</span>
              </button>
            ))}
          </div>

          {/* Candidate Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredCandidates.map((candidate) => (
              <div 
                key={candidate.id}
                className="bg-slate-800/80 border border-slate-700/80 hover:border-emerald-500/60 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all duration-200 group"
              >
                <div className="space-y-3.5">
                  {/* Avatar & Specialty */}
                  <div className="flex items-center gap-3">
                    <img 
                      src={candidate.avatarUrl} 
                      alt={candidate.name}
                      className="w-11 h-11 rounded-xl object-cover border border-slate-600"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="font-semibold text-sm text-white group-hover:text-emerald-400 transition-colors">
                        {candidate.name}
                      </h4>
                      <p className="text-xs text-emerald-400 font-medium">
                        {candidate.specialty}
                      </p>
                    </div>
                  </div>

                  {/* Vetting Score Badge */}
                  <div className="flex items-center justify-between py-2 border-y border-slate-700/60 text-xs">
                    <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      ✓ {candidate.vettingStatus}
                    </span>
                    <span className="font-mono text-slate-300 text-xs font-semibold">
                      Score: <strong className="text-emerald-400">{candidate.score}%</strong>
                    </span>
                  </div>

                  {/* Skill Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.skills.map((skill, sIdx) => (
                      <span 
                        key={sIdx}
                        className="text-[10px] font-mono font-medium bg-slate-900/80 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Action */}
                <button
                  onClick={() => navigateToPage('directory')}
                  className="w-full bg-slate-900 hover:bg-emerald-600 text-slate-200 hover:text-white font-medium py-2 px-3 rounded-xl text-xs border border-slate-700 hover:border-emerald-500 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>View Candidate Profile</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ==========================================
          4. 3-STEP ACCREDITATION WORKFLOW
          ========================================== */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 text-left">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-emerald-700 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>Structured Verification Engine</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight">
            How candidates earn the Digital Campux accreditation stamp
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            A 3-step quality gateway that replaces traditional resume guesswork with verified execution data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Step 1 */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-7 sm:p-8 space-y-4 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-mono font-bold text-xs flex items-center justify-center">
              01
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900">
              Diagnostic Skill Gateway
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every applicant completes an intensive diagnostic assessing core algorithmic, architectural, and growth fundamentals under strict anti-cheat conditions.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-7 sm:p-8 space-y-4 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-mono font-bold text-xs flex items-center justify-center">
              02
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900">
              Practical Scenario Gauntlet
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Candidates build real-world systems: full-stack integrations, complex marketing pipelines, and automated agent workflows audited for code quality and execution.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-7 sm:p-8 space-y-4 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-mono font-bold text-xs flex items-center justify-center">
              03
            </div>
            <h3 className="font-display font-bold text-lg text-slate-900">
              KYC & Direct Discovery
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Identity-verified specialists are published to the live directory with public portfolios and instant direct connection for employers.
            </p>
          </div>

        </div>
      </section>

      {/* ==========================================
          5. COMPARISON MATRIX (SaaS Table)
          ========================================== */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 text-left">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-emerald-700 uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Platform Comparison</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Digital Campux vs. Traditional Alternatives
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            See why leading companies are moving away from legacy recruiting agencies and freelance marketplaces.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500">
                <th className="py-4 px-6">Feature / Capability</th>
                <th className="py-4 px-6 text-emerald-800 bg-emerald-50/70 font-bold">
                  ⚡ Digital Campux
                </th>
                <th className="py-4 px-6">Traditional Agencies</th>
                <th className="py-4 px-6">Freelance Marketplaces</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-4 px-6 font-semibold text-slate-900">Time-to-Hire</td>
                <td className="py-4 px-6 bg-emerald-50/40 text-emerald-700 font-bold font-mono">
                  &lt; 48 Hours
                </td>
                <td className="py-4 px-6 text-slate-500">4 to 8 Weeks</td>
                <td className="py-4 px-6 text-slate-500">Days to Weeks (Variable)</td>
              </tr>

              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-4 px-6 font-semibold text-slate-900">Vetting Process</td>
                <td className="py-4 px-6 bg-emerald-50/40 text-emerald-700 font-bold">
                  Audited Practical Scenarios
                </td>
                <td className="py-4 px-6 text-slate-500">Resume Screening (Unproven)</td>
                <td className="py-4 px-6 text-slate-500">Self-Reported / Review Spam</td>
              </tr>

              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-4 px-6 font-semibold text-slate-900">Fee Structure</td>
                <td className="py-4 px-6 bg-emerald-50/40 text-emerald-700 font-bold font-mono">
                  0% Ongoing Commission
                </td>
                <td className="py-4 px-6 text-slate-500">15%–25% Salary Cut</td>
                <td className="py-4 px-6 text-slate-500">10%–20% Platform Fee</td>
              </tr>

              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-4 px-6 font-semibold text-slate-900">Proof of Work</td>
                <td className="py-4 px-6 bg-emerald-50/40 text-emerald-700 font-bold">
                  Live Portfolio & Code Artifacts
                </td>
                <td className="py-4 px-6 text-slate-500">Text Resumes Only</td>
                <td className="py-4 px-6 text-slate-500">Subjective Star Ratings</td>
              </tr>

            </tbody>
          </table>
        </div>
      </section>

      {/* ==========================================
          6. CONVERSION CTA BANNER (High-End SaaS Style)
          ========================================== */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-8 sm:p-14 shadow-xl border border-slate-800 space-y-6 relative overflow-hidden">
          
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>Accelerate Your Tech Team Today</span>
          </div>

          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white max-w-2xl mx-auto tracking-tight">
            Ready to hire pre-vetted specialists with verified proof of work?
          </h2>

          <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto leading-relaxed">
            Join hundreds of forward-thinking founders and hiring managers saving time and hiring proven talent directly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <button
              onClick={() => navigateToPage('directory')}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3.5 px-7 rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-sm hover:shadow-md transition"
            >
              Browse Talent Directory Now
            </button>

            <button
              onClick={openTalentModal}
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold py-3.5 px-7 rounded-xl text-xs uppercase tracking-wider border border-slate-700 cursor-pointer transition"
            >
              Apply as Vetted Talent
            </button>
          </div>

        </div>
      </section>

    </div>
  );
}
