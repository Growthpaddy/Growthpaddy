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
  FileText
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

  // Curated fallback candidates if Supabase returns 0 or connects offline
  const FALLBACK_CANDIDATES: CandidatePreview[] = [
    {
      id: 'preview-1',
      name: 'Marcus Vance',
      role: 'AI Automation Operations Architect',
      specialty: 'AI Automation',
      vettingStatus: '100% Vetted',
      skills: ['Zapier', 'Make.com', 'Python', 'OpenAI API'],
      score: 98,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'
    },
    {
      id: 'preview-2',
      name: 'Elena Rostova',
      role: 'Senior Full-Stack Developer',
      specialty: 'Full-Stack Engineering',
      vettingStatus: '100% Vetted',
      skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
      score: 96,
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300'
    },
    {
      id: 'preview-3',
      name: 'David K. Osei',
      role: 'Growth Marketing & PPC Lead',
      specialty: 'Growth Marketing',
      vettingStatus: '100% Vetted',
      skills: ['Meta Ads', 'Google Ads', 'GA4', 'Funnel CRO'],
      score: 95,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300'
    },
    {
      id: 'preview-4',
      name: 'Sarah Jenkins',
      role: 'Programmatic SEO & Content Architect',
      specialty: 'SEO Strategy',
      vettingStatus: '100% Vetted',
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
        const { data, error } = await supabase
          .from('talent_profiles')
          .select('id, full_name, specialty, skills, vetting_status, phase_1_score')
          .eq('phase_1_quiz_passed', true)
          .limit(4);

        if (data && data.length > 0) {
          const fetched: CandidatePreview[] = data.map((item: any, idx: number) => ({
            id: item.id || `db-${idx}`,
            name: item.full_name || `Vetted Specialist #${idx + 1}`,
            role: item.specialty ? `${item.specialty} Operator` : 'Digital Operations Lead',
            specialty: item.specialty || 'Tech Operations',
            vettingStatus: '100% Vetted',
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

  return (
    <div className="bg-[#fafbfc] text-neutral-900 pb-16 text-left selection:bg-emerald-500/30">
      
      {/* ==========================================
          1. HERO SECTION (High Impact & Conversion)
          ========================================== */}
      <section className="relative pt-12 md:pt-20 pb-16 px-4 sm:px-6 lg:px-8 bg-white border-b-4 border-neutral-950 overflow-hidden text-left">
        <div className="absolute inset-0 bg-[radial-gradient(#00A86B_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-8 relative z-10">
          
          {/* Urgent Badge */}
          <div className="inline-flex items-center gap-2 bg-neutral-950 text-white px-3.5 py-1.5 rounded-none border-l-4 border-[#00A86B] shadow-[2px_2px_0px_0px_rgba(0,168,107,1)]">
            <span className="w-2 h-2 rounded-full bg-[#00A86B] animate-ping" />
            <span className="text-[11px] font-mono font-black uppercase tracking-wider">
              ⚡ Pre-Vetted Talent Deployed in Under 48 Hours
            </span>
          </div>

          {/* Main Headline & Subheadline */}
          <div className="max-w-4xl space-y-4">
            <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl text-neutral-950 uppercase tracking-tight leading-[1.02]">
              Hire Top 3% Vetted Talent. <br className="hidden sm:inline" />
              <span className="text-[#00A86B]">Cut Hiring Time by 80%</span> & Eliminate Agency Fees.
            </h1>
            
            <p className="text-base sm:text-lg text-neutral-700 font-bold max-w-2xl uppercase tracking-wide leading-relaxed border-l-4 border-neutral-950 pl-4">
              Skip the endless screening rounds. Access battle-tested AI Automation Engineers, Full-Stack Developers, Digital & Growth Marketers, and Tech Talent ready to produce results from Day 1.
            </p>
          </div>

          {/* Primary Dual CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            {/* CTA 1 (Primary - Recruiter/Business Owner) */}
            <button
              onClick={() => navigateToPage('directory')}
              className="bg-[#00A86B] hover:bg-emerald-600 text-white font-black py-4 px-8 rounded-none text-sm uppercase tracking-wider border-2 border-neutral-950 flex items-center justify-center gap-3 cursor-pointer shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              <Briefcase className="w-5 h-5 text-white" />
              <span>Browse Talent Pool (Instant Access)</span>
              <ArrowRight className="w-5 h-5 text-white" />
            </button>

            {/* CTA 2 (Secondary - Talent) */}
            <button
              onClick={openTalentModal}
              className="bg-white hover:bg-neutral-100 text-neutral-950 font-black py-4 px-8 rounded-none text-sm uppercase tracking-wider border-2 border-neutral-950 flex items-center justify-center gap-3 cursor-pointer shadow-[5px_5px_0px_0px_rgba(0,168,107,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              <Zap className="w-5 h-5 text-[#00A86B]" />
              <span>Apply as Vetted Talent</span>
            </button>
          </div>

          {/* Trust Badges Bar */}
          <div className="pt-8 border-t-2 border-dashed border-neutral-200 space-y-4">
            <p className="text-xs font-mono font-black uppercase text-neutral-500 tracking-wider">
              🛡️ Vetted for technical competency, communication, and immediate project deployment.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-neutral-50 border-2 border-neutral-950 p-3.5 text-left">
                <span className="text-base font-black font-mono text-[#00A86B] block">&lt; 48 HOURS</span>
                <span className="text-[10px] font-bold uppercase text-neutral-600 block mt-0.5">Average Time-To-Deploy</span>
              </div>

              <div className="bg-neutral-50 border-2 border-neutral-950 p-3.5 text-left">
                <span className="text-base font-black font-mono text-neutral-950 block">TOP 3% ACCEPTANCE</span>
                <span className="text-[10px] font-bold uppercase text-neutral-600 block mt-0.5">Rigorous AI + Panel Vetting</span>
              </div>

              <div className="bg-neutral-50 border-2 border-neutral-950 p-3.5 text-left">
                <span className="text-base font-black font-mono text-[#00A86B] block">0% AGENCY FEES</span>
                <span className="text-[10px] font-bold uppercase text-neutral-600 block mt-0.5">Zero Salary Commissions</span>
              </div>

              <div className="bg-neutral-50 border-2 border-neutral-950 p-3.5 text-left">
                <span className="text-base font-black font-mono text-neutral-950 block">100% PRE-SCREENED</span>
                <span className="text-[10px] font-bold uppercase text-neutral-600 block mt-0.5">Audited Project Evidence</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ==========================================
          2. THE BUSINESS VALUE TRIPLE-THREAT (3 Core Value Pillars)
          ========================================== */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
        <div className="text-left space-y-2 border-l-4 border-[#00A86B] pl-4">
          <span className="text-xs font-mono font-black uppercase text-[#00A86B] tracking-widest block">
            THE BUSINESS VALUE TRIPLE-THREAT
          </span>
          <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-neutral-950">
            WHY FOUNDERS & HIRING MANAGERS SWITCH TO GROWTHPADDY
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 font-bold uppercase tracking-wide max-w-2xl">
            Designed from the ground up for speed, efficiency, and zero agency overhead.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Pillar 1: 48-Hour Deployment */}
          <div className="bg-white border-4 border-neutral-950 p-6 sm:p-8 rounded-none shadow-[6px_6px_0px_0px_rgba(0,168,107,1)] flex flex-col justify-between space-y-4 text-left">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-emerald-50 border-2 border-neutral-950 flex items-center justify-center">
                <Clock className="w-6 h-6 text-[#00A86B]" />
              </div>
              <h3 className="font-display font-black text-xl uppercase text-neutral-950">
                🚀 48-Hour Deployment
              </h3>
              <p className="text-xs text-neutral-600 font-medium uppercase leading-relaxed tracking-wide">
                Don't let open roles stall your pipeline. Our candidates have already passed rigorous AI scenario assessments and live panel interviews. Interview today, onboard tomorrow.
              </p>
            </div>
            <div className="pt-3 border-t border-dashed border-neutral-200">
              <span className="text-[10px] font-mono font-black text-[#00A86B] uppercase">SPEED & ACCELERATION</span>
            </div>
          </div>

          {/* Pillar 2: 120+ Hours Saved */}
          <div className="bg-white border-4 border-neutral-950 p-6 sm:p-8 rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between space-y-4 text-left">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-neutral-100 border-2 border-neutral-950 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-neutral-950" />
              </div>
              <h3 className="font-display font-black text-xl uppercase text-neutral-950">
                ⏳ 120+ Hours Saved Per Hire
              </h3>
              <p className="text-xs text-neutral-600 font-medium uppercase leading-relaxed tracking-wide">
                Stop reading hundreds of unqualified resumes. We reject 97% of applicants before they ever reach your screen, delivering only shortlist-ready operators.
              </p>
            </div>
            <div className="pt-3 border-t border-dashed border-neutral-200">
              <span className="text-[10px] font-mono font-black text-neutral-950 uppercase">TIME-SAVING EFFICIENCY</span>
            </div>
          </div>

          {/* Pillar 3: 0% Ongoing Commission */}
          <div className="bg-white border-4 border-neutral-950 p-6 sm:p-8 rounded-none shadow-[6px_6px_0px_0px_rgba(0,168,107,1)] flex flex-col justify-between space-y-4 text-left">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-emerald-50 border-2 border-neutral-950 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-[#00A86B]" />
              </div>
              <h3 className="font-display font-black text-xl uppercase text-neutral-950">
                💰 0% Ongoing Commission Fees
              </h3>
              <p className="text-xs text-neutral-600 font-medium uppercase leading-relaxed tracking-wide">
                Traditional recruiting agencies charge 15%–25% cut on every salary forever. GrowthPaddy operates on a transparent model with ZERO recurring markups. Pay your talent directly.
              </p>
            </div>
            <div className="pt-3 border-t border-dashed border-neutral-200">
              <span className="text-[10px] font-mono font-black text-[#00A86B] uppercase">COST-CUTTING TRANSPARENCY</span>
            </div>
          </div>

        </div>
      </section>

      {/* ==========================================
          3. INTERACTIVE TALENT POOL PREVIEW (Conversion Magnet)
          ========================================== */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-neutral-950 text-white border-y-4 border-neutral-950 space-y-10 text-left">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-2 border-neutral-800 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#00A86B] text-white px-2.5 py-1 text-[10px] font-mono font-black uppercase mb-2">
                <Users className="w-3.5 h-3.5" />
                <span>LIVE CANDIDATE STREAM</span>
              </div>
              <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-white">
                EXPLORE FEATURED PRE-VETTED OPERATORS
              </h2>
              <p className="text-xs text-neutral-400 font-mono uppercase tracking-wider mt-1">
                Real candidates actively open for immediate placement. Audited skills, verified project portfolios.
              </p>
            </div>

            <button
              onClick={() => navigateToPage('directory')}
              className="bg-white hover:bg-neutral-100 text-neutral-950 font-black py-3 px-6 rounded-none text-xs uppercase tracking-wider border-2 border-white flex items-center gap-2 cursor-pointer transition-all self-start sm:self-auto"
            >
              <span>View All Available Candidates</span>
              <ChevronRight className="w-4 h-4 text-emerald-600" />
            </button>
          </div>

          {/* Candidate Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {candidates.map((candidate) => (
              <div 
                key={candidate.id}
                className="bg-neutral-900 border-2 border-neutral-700 p-5 rounded-none flex flex-col justify-between space-y-4 hover:border-[#00A86B] transition-all group"
              >
                <div className="space-y-3">
                  {/* Header info */}
                  <div className="flex items-center gap-3">
                    <img 
                      src={candidate.avatarUrl} 
                      alt={candidate.name}
                      className="w-12 h-12 rounded-none object-cover border border-neutral-600 grayscale group-hover:grayscale-0 transition-all"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="font-display font-black text-sm uppercase text-white group-hover:text-[#00A86B] transition-colors">
                        {candidate.name}
                      </h4>
                      <p className="text-[10px] font-mono font-bold text-[#00A86B] uppercase">
                        {candidate.specialty}
                      </p>
                    </div>
                  </div>

                  {/* Badge & Score */}
                  <div className="flex items-center justify-between border-y border-neutral-800 py-2">
                    <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono text-[9px] font-black uppercase px-2 py-0.5">
                      ✓ {candidate.vettingStatus}
                    </span>
                    <span className="text-[10px] font-mono font-extrabold text-neutral-300">
                      Score: <strong className="text-[#00A86B]">{candidate.score}%</strong>
                    </span>
                  </div>

                  {/* Skill tags */}
                  <div className="flex flex-wrap gap-1">
                    {candidate.skills.map((skill, sIdx) => (
                      <span 
                        key={sIdx}
                        className="text-[9px] font-mono font-bold bg-neutral-800 text-neutral-300 px-2 py-0.5 border border-neutral-700 uppercase"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Hire Request Button */}
                <button
                  onClick={() => navigateToPage('directory')}
                  className="w-full bg-neutral-950 hover:bg-[#00A86B] text-white font-black py-2.5 px-3 rounded-none text-[11px] uppercase tracking-wider border border-neutral-700 hover:border-[#00A86B] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>View Profile & Request Hire</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 group-hover:text-white" />
                </button>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="text-center pt-4">
            <button
              onClick={() => navigateToPage('directory')}
              className="bg-[#00A86B] hover:bg-emerald-600 text-white font-black py-4 px-8 rounded-none text-xs uppercase tracking-wider border-2 border-white cursor-pointer shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-none transition-all inline-flex items-center gap-2"
            >
              <span>View All Available Candidates in Talent Pool →</span>
            </button>
          </div>

        </div>
      </section>

      {/* ==========================================
          4. HOW IT WORKS (3-Step Fast Track for Employers)
          ========================================== */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 text-left">
        <div className="space-y-2 border-l-4 border-neutral-950 pl-4">
          <span className="text-xs font-mono font-black uppercase text-neutral-500 tracking-widest block">
            STREAMLINED HIRING WORKFLOW
          </span>
          <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-neutral-950">
            HOW IT WORKS: 3-STEP FAST TRACK
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 font-bold uppercase tracking-wide max-w-2xl">
            From talent browsing to active onboarding in under 48 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Step 1 */}
          <div className="bg-white border-4 border-neutral-950 p-6 sm:p-8 space-y-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative">
            <div className="inline-block bg-neutral-950 text-white font-mono font-black text-xs px-3 py-1 uppercase">
              STEP 01
            </div>
            <h3 className="font-display font-black text-xl uppercase text-neutral-950">
              Filter & Select
            </h3>
            <p className="text-xs text-neutral-600 font-medium uppercase leading-relaxed tracking-wide">
              Browse pre-vetted candidate cards filtered by skill, specialty, and experience.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white border-4 border-neutral-950 p-6 sm:p-8 space-y-4 shadow-[6px_6px_0px_0px_rgba(0,168,107,1)] relative">
            <div className="inline-block bg-[#00A86B] text-white font-mono font-black text-xs px-3 py-1 uppercase">
              STEP 02
            </div>
            <h3 className="font-display font-black text-xl uppercase text-neutral-950">
              Review Vetting Scorecard
            </h3>
            <p className="text-xs text-neutral-600 font-medium uppercase leading-relaxed tracking-wide">
              See their exact AI diagnostic quiz scores, panel interview approvals, and verified portfolio links.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white border-4 border-neutral-950 p-6 sm:p-8 space-y-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative">
            <div className="inline-block bg-neutral-950 text-white font-mono font-black text-xs px-3 py-1 uppercase">
              STEP 03
            </div>
            <h3 className="font-display font-black text-xl uppercase text-neutral-950">
              Direct Hire
            </h3>
            <p className="text-xs text-neutral-600 font-medium uppercase leading-relaxed tracking-wide">
              Connect immediately with the candidate and start working with zero platform markup.
            </p>
          </div>

        </div>
      </section>

      {/* ==========================================
          5. COMPARISON TABLE: GrowthPaddy vs Others
          ========================================== */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 text-left">
        <div className="space-y-2 border-l-4 border-[#00A86B] pl-4">
          <span className="text-xs font-mono font-black uppercase text-[#00A86B] tracking-widest block">
            CLEAR ADVANTAGE
          </span>
          <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-neutral-950">
            GROWTHPADDY VS. TRADITIONAL ALTERNATIVES
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 font-bold uppercase tracking-wide max-w-2xl">
            See why high-growth companies are abandoning legacy recruiters and freelance platforms.
          </p>
        </div>

        <div className="overflow-x-auto border-4 border-neutral-950 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="bg-neutral-950 text-white font-mono text-xs uppercase">
                <th className="p-4 border-b-2 border-r-2 border-neutral-950 font-black">METRIC / FEATURE</th>
                <th className="p-4 border-b-2 border-r-2 border-neutral-950 font-black bg-[#00A86B] text-white">
                  ⚡ GROWTHPADDY
                </th>
                <th className="p-4 border-b-2 border-r-2 border-neutral-950 font-black">TRADITIONAL AGENCIES</th>
                <th className="p-4 border-b-2 font-black">FREELANCE MARKETPLACES</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-neutral-200 text-xs uppercase font-bold text-neutral-800">
              
              {/* Row 1 */}
              <tr className="hover:bg-neutral-50">
                <td className="p-4 font-black border-r-2 border-neutral-950 bg-neutral-50">Time-to-Hire</td>
                <td className="p-4 border-r-2 border-neutral-950 bg-emerald-50 text-[#00A86B] font-black font-mono">
                  &lt; 48 Hours
                </td>
                <td className="p-4 border-r-2 border-neutral-950 text-neutral-600">4 to 8 Weeks</td>
                <td className="p-4 text-neutral-600">Days to Weeks</td>
              </tr>

              {/* Row 2 */}
              <tr className="hover:bg-neutral-50">
                <td className="p-4 font-black border-r-2 border-neutral-950 bg-neutral-50">Vetting Process</td>
                <td className="p-4 border-r-2 border-neutral-950 bg-emerald-50 text-emerald-900 font-black">
                  Multi-Stage AI + Panel Vetted
                </td>
                <td className="p-4 border-r-2 border-neutral-950 text-neutral-600">Manual / Hit-or-Miss</td>
                <td className="p-4 text-neutral-600">Unvetted / Self-Reported</td>
              </tr>

              {/* Row 3 */}
              <tr className="hover:bg-neutral-50">
                <td className="p-4 font-black border-r-2 border-neutral-950 bg-neutral-50">Pricing Model</td>
                <td className="p-4 border-r-2 border-neutral-950 bg-emerald-50 text-[#00A86B] font-black font-mono">
                  0% Salary Commission
                </td>
                <td className="p-4 border-r-2 border-neutral-950 text-neutral-600">15%–25% Salary Cut</td>
                <td className="p-4 text-neutral-600">Ongoing Platform Fees</td>
              </tr>

              {/* Row 4 */}
              <tr className="hover:bg-neutral-50">
                <td className="p-4 font-black border-r-2 border-neutral-950 bg-neutral-50">Quality Guarantee</td>
                <td className="p-4 border-r-2 border-neutral-950 bg-emerald-50 text-emerald-900 font-black">
                  Pre-Screened Top 3%
                </td>
                <td className="p-4 border-r-2 border-neutral-950 text-neutral-600">Variable</td>
                <td className="p-4 text-neutral-600">Risky / Low Retention</td>
              </tr>

            </tbody>
          </table>
        </div>
      </section>

      {/* ==========================================
          6. FINAL HIGH-INTENT CALL TO ACTION (CTA Banner)
          ========================================== */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="bg-white border-4 border-neutral-950 p-8 sm:p-14 rounded-none shadow-[10px_10px_0px_0px_rgba(0,168,107,1)] space-y-6 text-center relative overflow-hidden">
          
          <div className="inline-flex items-center gap-2 bg-neutral-950 text-white px-3 py-1 font-mono text-xs uppercase font-black">
            <Zap className="w-4 h-4 text-[#00A86B]" />
            <span>ACCELERATE YOUR HIRING TODAY</span>
          </div>

          <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-neutral-950 max-w-3xl mx-auto">
            Ready to scale your business with pre-vetted operators?
          </h2>

          <p className="text-xs sm:text-sm text-neutral-600 font-bold uppercase tracking-wider max-w-xl mx-auto leading-relaxed">
            Join forward-thinking business owners saving time and cutting hiring overhead today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigateToPage('directory')}
              className="w-full sm:w-auto bg-[#00A86B] hover:bg-emerald-600 text-white font-black py-4 px-8 rounded-none text-xs uppercase tracking-wider border-2 border-neutral-950 cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
            >
              Browse Talent Pool Now
            </button>

            <button
              onClick={openTalentModal}
              className="w-full sm:w-auto bg-white hover:bg-neutral-100 text-neutral-950 font-black py-4 px-8 rounded-none text-xs uppercase tracking-wider border-2 border-neutral-950 cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,168,107,1)] hover:shadow-none transition-all"
            >
              Apply as Talent
            </button>
          </div>

        </div>
      </section>

      {/* ==========================================
          7. FOOTER SECTION
          ========================================== */}
      <footer className="bg-neutral-950 text-neutral-400 py-12 px-4 sm:px-6 lg:px-8 border-t-4 border-neutral-950 text-left font-mono text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="space-y-1 text-center md:text-left">
            <span className="font-display font-black text-white text-lg tracking-tight uppercase block">
              GROWTHPADDY
            </span>
            <p className="text-[10px] uppercase font-bold text-neutral-500">
              © {new Date().getFullYear()} GrowthPaddy Inc. Pre-Vetted Talent Operations Network.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-[10px] uppercase font-bold">
            <button 
              onClick={() => navigateToPage('directory')}
              className="hover:text-white transition cursor-pointer"
            >
              Talent Pool Directory
            </button>
            <button 
              onClick={() => navigateToPage('pricing')}
              className="hover:text-white transition cursor-pointer"
            >
              Pricing Plans
            </button>
            <button 
              onClick={() => navigateToPage('assessment')}
              className="hover:text-white transition cursor-pointer"
            >
              Self Diagnostic
            </button>
            
            {/* Subtle Admin Link at bottom right */}
            <button
              onClick={() => navigateToPage('admin-login')}
              className="text-neutral-600 hover:text-neutral-300 transition cursor-pointer text-[9px] border border-neutral-800 px-2 py-1"
            >
              Admin Sign In
            </button>
          </div>

        </div>
      </footer>

    </div>
  );
}
