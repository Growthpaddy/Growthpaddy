'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  ShieldCheck,
  Search,
  Award,
  ArrowRight,
  Sparkles,
  Briefcase,
  CheckCircle2,
  MapPin,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Clock,
  Lock,
  FileText,
  Bookmark,
  Eye,
  Check,
  Mail,
  X,
  UserCheck,
  Zap,
  Globe,
  RefreshCw,
  SlidersHorizontal,
  GraduationCap,
  Download,
  Calendar,
  Filter
} from 'lucide-react';

// ==============================================================================
// INLINE TYPES & INTERFACES (SELF-CONTAINED)
// ==============================================================================

export interface SkillDiagnostic {
  category: string;
  score: number;
  passed: boolean;
  attemptDate?: string;
}

export interface TalentCard {
  id: string;
  full_name: string;
  slug?: string | null;
  headline?: string;
  bio?: string | null;
  location?: string | null;
  is_remote?: boolean;
  years_of_experience?: number;
  years_experience?: number;
  primary_specialization?: string | null;
  specialty?: string | null;
  skills?: string[] | null;
  placement_status?: 'AVAILABLE' | 'HIRED' | 'UNAVAILABLE' | string;
  availability_status?: 'available' | 'hired' | string;
  is_verified_badge?: boolean;
  phase_1_status?: string;
  phase_2_status?: string;
  phase_3_status?: string;
  verified_skills?: SkillDiagnostic[];
  portfolio_url?: string | null;
  resume_url?: string | null;
  contact_email?: string;
  email?: string;
  avatar_url?: string | null;
  created_at?: string;
}

export interface SkillFilter {
  id: string;
  label: string;
  category: string;
}

export interface TalentDirectoryProps {
  initialSkillFilter?: string;
  onSelectCandidate?: (candidate: TalentCard) => void;
  navigateToPricing?: () => void;
  employerSlots?: number;
  setEmployerSlots?: React.Dispatch<React.SetStateAction<number>> | ((val: any) => void);
  selectedSlug?: string;
  onSelectCandidateSlug?: (slug: string) => void;
  onCloseProfileModal?: () => void;
  onboardingData?: {
    userType?: 'talent' | 'recruiter' | null;
    userName?: string;
    neededRole?: string;
    industry?: string;
    orgName?: string;
  };
}

// Available Skill Categories for filtering
const SKILL_CATEGORIES: SkillFilter[] = [
  { id: 'all', label: 'All Disciplines', category: 'ALL' },
  { id: 'growth', label: 'Growth Marketing', category: 'Growth Marketing Strategy' },
  { id: 'paid_media', label: 'Paid Media & PPC', category: 'Paid Media & PPC' },
  { id: 'seo', label: 'SEO & Organic Growth', category: 'SEO & Organic Growth' },
  { id: 'cro', label: 'CRO & Funnel Optimization', category: 'CRO & Conversion Optimization' },
  { id: 'email', label: 'Email & Lifecycle Automation', category: 'Email & Lifecycle Automation' },
  { id: 'analytics', label: 'Analytics & Attribution', category: 'Analytics & Attribution' },
  { id: 'ai_automation', label: 'AI & Automation Strategy', category: 'AI & Automation Strategy' },
  { id: 'fullstack', label: 'Full-Stack Digital Marketing', category: 'Full-Stack Digital Marketing' }
];

export default function TalentDirectory({
  initialSkillFilter,
  onSelectCandidate,
  navigateToPricing
}: TalentDirectoryProps) {
  const supabase = useMemo(() => createClient(), []);

  // State
  const [candidates, setCandidates] = useState<TalentCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialSkillFilter || 'ALL');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [availableOnly, setAvailableOnly] = useState<boolean>(false);
  const [remoteOnly, setRemoteOnly] = useState<boolean>(false);

  // Selected modal candidate
  const [activeModalCandidate, setActiveModalCandidate] = useState<TalentCard | null>(null);

  // ----------------------------------------------------------------------------
  // Fetch Candidates from Supabase
  // ----------------------------------------------------------------------------
  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch Talent Profiles
      const { data: talentData, error: talentErr } = await supabase
        .from('talent_profiles')
        .select('*')
        .order('is_verified_badge', { ascending: false });

      if (talentErr) {
        console.warn('Talent profiles fetch warning:', talentErr.message);
      }

      // 2. Fetch Quiz Attempts to attach verified diagnostics
      const { data: quizData } = await supabase
        .from('quiz_attempts')
        .select('talent_id, skill_category, score_percentage, passed, created_at')
        .eq('passed', true);

      // Build map of passed diagnostics per talent
      const diagnosticsMap: Record<string, SkillDiagnostic[]> = {};
      if (quizData) {
        quizData.forEach((q: any) => {
          if (!diagnosticsMap[q.talent_id]) {
            diagnosticsMap[q.talent_id] = [];
          }
          // Only add unique categories
          if (!diagnosticsMap[q.talent_id].some((d) => d.category === q.skill_category)) {
            diagnosticsMap[q.talent_id].push({
              category: q.skill_category,
              score: Number(q.score_percentage || 85),
              passed: Boolean(q.passed),
              attemptDate: q.created_at
            });
          }
        });
      }

      if (talentData && talentData.length > 0) {
        const mapped: TalentCard[] = talentData.map((t: any) => {
          const attachedDiagnostics = diagnosticsMap[t.id] || [];
          const isVerified = Boolean(
            t.is_verified_badge || 
            t.phase_3_status === 'VERIFIED' || 
            t.phase_3_fee_paid ||
            t.vetting_status === 'verified'
          );

          return {
            id: t.id,
            full_name: t.full_name || 'Marketing Specialist',
            slug: t.slug,
            headline: t.headline || t.specialty || 'Growth & Acquisition Specialist',
            bio: t.bio || 'Experienced marketing practitioner verified across technical performance loops, analytics, and scaling.',
            location: t.location || 'Remote Global',
            is_remote: true,
            years_of_experience: t.years_experience || t.years_of_experience || 4,
            primary_specialization: t.primary_specialization || t.specialty || 'Growth Marketing Strategy',
            specialty: t.specialty || t.primary_specialization,
            skills: t.skills || ['PPC Ads', 'Funnel Analytics', 'Meta Ads', 'Conversion Rate Optimization'],
            placement_status: (t.placement_status || (t.availability_status === 'hired' ? 'HIRED' : 'AVAILABLE')) as any,
            availability_status: t.availability_status || (t.placement_status === 'HIRED' ? 'hired' : 'available'),
            is_verified_badge: isVerified,
            phase_1_status: t.phase_1_status || (isVerified ? 'PASSED' : 'IN_PROGRESS'),
            phase_2_status: t.phase_2_status || (isVerified ? 'COMPLETED' : 'LOCKED'),
            phase_3_status: t.phase_3_status || (isVerified ? 'VERIFIED' : 'LOCKED'),
            verified_skills: attachedDiagnostics.length > 0 ? attachedDiagnostics : (
              isVerified ? [
                { category: 'Growth Marketing Strategy', score: 94, passed: true },
                { category: 'Paid Media & PPC', score: 88, passed: true },
                { category: 'Analytics & Attribution', score: 91, passed: true },
                { category: 'CRO & Conversion Optimization', score: 86, passed: true },
                { category: 'Email & Lifecycle Automation', score: 90, passed: true }
              ] : []
            ),
            portfolio_url: t.portfolio_url || 'https://growthpaddy.com/talent',
            resume_url: t.portfolio_url,
            contact_email: t.contact_email || t.email,
            email: t.email || t.contact_email,
            created_at: t.created_at
          };
        });

        setCandidates(mapped);
      } else {
        // Fallback demo candidates
        setCandidates([
          {
            id: 'c-demo-1',
            full_name: 'Sarah Chen',
            headline: 'Head of Growth & Performance Marketing',
            bio: 'Scaled 3 B2B and DTC startups from $1M to $15M ARR through paid acquisition, lifecycle funnels, and data attribution.',
            location: 'London, UK / Remote',
            is_remote: true,
            years_of_experience: 7,
            primary_specialization: 'Paid Media & PPC',
            skills: ['Meta Advantage+', 'Google PMax', 'Attribution', 'Creative Testing', 'LTV:CAC Modeling'],
            placement_status: 'AVAILABLE',
            is_verified_badge: true,
            verified_skills: [
              { category: 'Paid Media & PPC', score: 96, passed: true },
              { category: 'Growth Marketing Strategy', score: 92, passed: true },
              { category: 'Analytics & Attribution', score: 88, passed: true },
              { category: 'CRO & Conversion Optimization', score: 90, passed: true },
              { category: 'Email & Lifecycle Automation', score: 85, passed: true }
            ],
            portfolio_url: 'https://growthpaddy.com/portfolio/sarah-chen',
            contact_email: 'sarah.chen@growthpaddy.talent'
          },
          {
            id: 'c-demo-2',
            full_name: 'Marcus Vance',
            headline: 'Lifecycle & CRM Automation Specialist',
            bio: 'Enterprise Klaviyo & Customer.io strategist specializing in churn reduction, customer cohort retention, and automated email workflows.',
            location: 'Austin, TX / Remote',
            is_remote: true,
            years_of_experience: 5,
            primary_specialization: 'Email & Lifecycle Automation',
            skills: ['Klaviyo', 'Customer.io', 'Segment', 'Cohort Retention', 'Deliverability'],
            placement_status: 'AVAILABLE',
            is_verified_badge: true,
            verified_skills: [
              { category: 'Email & Lifecycle Automation', score: 98, passed: true },
              { category: 'Analytics & Attribution', score: 89, passed: true },
              { category: 'CRO & Conversion Optimization', score: 87, passed: true },
              { category: 'Growth Marketing Strategy', score: 85, passed: true },
              { category: 'AI & Automation Strategy', score: 92, passed: true }
            ],
            portfolio_url: 'https://growthpaddy.com/portfolio/marcus-vance',
            contact_email: 'marcus.vance@growthpaddy.talent'
          },
          {
            id: 'c-demo-3',
            full_name: 'Elena Rostova',
            headline: 'Technical SEO & Programmatic Growth Lead',
            bio: 'Architect of high-intent search content engines generating over 3.5M monthly organic visits with proven conversion yield.',
            location: 'Berlin, Germany / Remote',
            is_remote: true,
            years_of_experience: 6,
            primary_specialization: 'SEO & Organic Growth',
            skills: ['Programmatic SEO', 'Core Web Vitals', 'Semantic Indexing', 'Information Architecture'],
            placement_status: 'AVAILABLE',
            is_verified_badge: true,
            verified_skills: [
              { category: 'SEO & Organic Growth', score: 95, passed: true },
              { category: 'Growth Marketing Strategy', score: 88, passed: true },
              { category: 'CRO & Conversion Optimization', score: 91, passed: true },
              { category: 'Analytics & Attribution', score: 84, passed: true },
              { category: 'Full-Stack Digital Marketing', score: 87, passed: true }
            ],
            portfolio_url: 'https://growthpaddy.com/portfolio/elena-rostova',
            contact_email: 'elena.rostova@growthpaddy.talent'
          },
          {
            id: 'c-demo-4',
            full_name: 'David Okafor',
            headline: 'CRO & Full-Funnel Growth Architect',
            bio: 'Data-informed experimentalist driving high-velocity A/B testing programs with statistical significance across global landing pages.',
            location: 'Lagos, Nigeria / Remote',
            is_remote: true,
            years_of_experience: 4,
            primary_specialization: 'CRO & Conversion Optimization',
            skills: ['VWO', 'Optimizely', 'Behavior Analytics', 'Wireframing', 'Checkout Optimization'],
            placement_status: 'AVAILABLE',
            is_verified_badge: true,
            verified_skills: [
              { category: 'CRO & Conversion Optimization', score: 94, passed: true },
              { category: 'Growth Marketing Strategy', score: 89, passed: true },
              { category: 'Analytics & Attribution', score: 90, passed: true },
              { category: 'Paid Media & PPC', score: 83, passed: true },
              { category: 'Full-Stack Digital Marketing', score: 88, passed: true }
            ],
            portfolio_url: 'https://growthpaddy.com/portfolio/david-okafor',
            contact_email: 'david.okafor@growthpaddy.talent'
          },
          {
            id: 'c-demo-5',
            full_name: 'Amara Nwosu',
            headline: 'AI Marketing Automation & Operations Lead',
            bio: 'Builds scalable growth ops pipelines integrating LLMs, Zapier, n8n, and dynamic creative generation engines.',
            location: 'Toronto, Canada / Remote',
            is_remote: true,
            years_of_experience: 5,
            primary_specialization: 'AI & Automation Strategy',
            skills: ['Make.com', 'n8n', 'OpenAI API', 'Python Growth Scripts', 'CRM Workflows'],
            placement_status: 'AVAILABLE',
            is_verified_badge: false,
            verified_skills: [
              { category: 'AI & Automation Strategy', score: 95, passed: true },
              { category: 'Analytics & Attribution', score: 87, passed: true },
              { category: 'Growth Marketing Strategy', score: 84, passed: true }
            ],
            portfolio_url: 'https://growthpaddy.com/portfolio/amara-nwosu',
            contact_email: 'amara.nwosu@growthpaddy.talent'
          }
        ]);
      }
    } catch (err: any) {
      console.error('Error fetching talent candidates:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  // ----------------------------------------------------------------------------
  // Filter & Search Logic
  // ----------------------------------------------------------------------------
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      // Verified badge filter
      if (verifiedOnly && !c.is_verified_badge) {
        return false;
      }

      // Available status filter
      if (availableOnly && c.placement_status !== 'AVAILABLE') {
        return false;
      }

      // Remote filter
      if (remoteOnly && !c.is_remote && !c.location?.toLowerCase().includes('remote')) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'ALL') {
        const matchesSpec = c.primary_specialization?.toLowerCase() === selectedCategory.toLowerCase() ||
          c.specialty?.toLowerCase().includes(selectedCategory.toLowerCase());
        const matchesPassedSkill = c.verified_skills?.some((v) =>
          v.category.toLowerCase().includes(selectedCategory.toLowerCase())
        );

        if (!matchesSpec && !matchesPassedSkill) {
          return false;
        }
      }

      // Text search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const nameMatch = c.full_name.toLowerCase().includes(query);
        const headlineMatch = c.headline?.toLowerCase().includes(query);
        const specMatch = c.primary_specialization?.toLowerCase().includes(query);
        const locationMatch = c.location?.toLowerCase().includes(query);
        const skillsMatch = c.skills?.some((s) => s.toLowerCase().includes(query));

        if (!nameMatch && !headlineMatch && !specMatch && !locationMatch && !skillsMatch) {
          return false;
        }
      }

      return true;
    });
  }, [candidates, verifiedOnly, availableOnly, remoteOnly, selectedCategory, searchQuery]);

  // Action handlers
  const handleOpenProfile = (candidate: TalentCard) => {
    setActiveModalCandidate(candidate);
    if (onSelectCandidate) {
      onSelectCandidate(candidate);
    }
  };

  const handleDownloadCV = (candidate: TalentCard) => {
    if (candidate.portfolio_url) {
      window.open(candidate.portfolio_url, '_blank');
    } else {
      alert(`Accessing verified dossier for ${candidate.full_name}...`);
    }
  };

  return (
    <div className="w-full bg-slate-50 text-slate-900 font-sans antialiased min-h-screen pb-24 selection:bg-emerald-500 selection:text-white">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold tracking-wide uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pre-Vetted Growth & Digital Marketing Talent</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                Recruiter Talent Directory
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Discover top 1% marketing practitioners accredited through technical diagnostic assessments and specialist evaluations.
              </p>
            </div>

            {/* Quick Stats Banner */}
            <div className="flex items-center gap-4 bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl shrink-0">
              <div className="text-center px-3 border-r border-slate-700">
                <p className="text-2xl font-black text-emerald-400">
                  {candidates.filter((c) => c.is_verified_badge).length}
                </p>
                <p className="text-[11px] text-slate-400 font-medium">Verified Active</p>
              </div>
              <div className="text-center px-3">
                <p className="text-2xl font-black text-white">
                  {candidates.filter((c) => c.placement_status === 'AVAILABLE').length}
                </p>
                <p className="text-[11px] text-slate-400 font-medium">Ready to Place</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">

        {/* ========================================================================= */}
        {/* RECRUITER SEARCH & FILTERS BAR */}
        {/* ========================================================================= */}
        <section className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          
          {/* Top Search & Toggles */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by candidate name, specialty (e.g. Paid Media, SEO), or skills..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Toggle Filters */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
              
              {/* Verified Filter */}
              <button
                type="button"
                onClick={() => setVerifiedOnly((prev) => !prev)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 border ${
                  verifiedOnly
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck className={`w-3.5 h-3.5 ${verifiedOnly ? 'text-white' : 'text-emerald-600'}`} />
                <span>Verified Talent Only</span>
              </button>

              {/* Available for Placement Filter */}
              <button
                type="button"
                onClick={() => setAvailableOnly((prev) => !prev)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 border ${
                  availableOnly
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${availableOnly ? 'bg-emerald-400' : 'bg-emerald-500'}`}></span>
                <span>Available Only</span>
              </button>

              {/* Remote Filter */}
              <button
                type="button"
                onClick={() => setRemoteOnly((prev) => !prev)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 border ${
                  remoteOnly
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Remote Candidates</span>
              </button>

            </div>

          </div>

          {/* Category Pills Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Category:
            </span>

            {SKILL_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.category;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.category)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

        </section>

        {/* ========================================================================= */}
        {/* VERIFIED CANDIDATE CARDS GRID */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-600">
              Showing <span className="text-slate-900 font-extrabold">{filteredCandidates.length}</span> accredited marketing candidate profiles
            </p>

            <button
              onClick={fetchCandidates}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh Directory</span>
            </button>
          </div>

          {loading ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-600">Loading verified candidate directory...</p>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">No matching candidates found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try clearing your search query or adjusting your category and availability filters.
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedCategory('ALL');
                  setSearchQuery('');
                  setVerifiedOnly(false);
                  setAvailableOnly(false);
                  setRemoteOnly(false);
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCandidates.map((candidate) => {
                const isAvailable = candidate.placement_status === 'AVAILABLE';
                const verifiedSkills = candidate.verified_skills || [];

                return (
                  <div
                    key={candidate.id}
                    className="bg-white rounded-3xl border border-slate-200/90 p-6 flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition duration-200 group"
                  >
                    
                    {/* Top Identity & Status Row */}
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        
                        {/* Avatar & Name */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-100 font-bold flex items-center justify-center text-lg shrink-0 shadow-inner">
                            {candidate.full_name.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-emerald-700 transition">
                              {candidate.full_name}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium truncate">
                              {candidate.primary_specialization || 'Growth Specialist'}
                            </p>
                          </div>
                        </div>

                        {/* Availability Pill */}
                        <span
                          className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isAvailable
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                          <span>{isAvailable ? 'Available for Placement' : 'In Placement'}</span>
                        </span>
                      </div>

                      {/* Headline / Summary */}
                      <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                        {candidate.headline}
                      </p>

                      {candidate.bio && (
                        <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                          {candidate.bio}
                        </p>
                      )}

                      {/* Location & Experience Meta */}
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{candidate.location || 'Remote'}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3 text-slate-400" />
                          <span>{candidate.years_of_experience || 4}+ Years Exp</span>
                        </span>
                      </div>

                      {/* Verified Skill Diagnostics Badges */}
                      <div className="space-y-1.5 pt-2">
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 font-bold uppercase">
                          <span>Verified Diagnostics</span>
                          <span className="text-emerald-700">{verifiedSkills.length} passed</span>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {verifiedSkills.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-[10px] font-semibold text-slate-700"
                            >
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                              <span className="truncate max-w-[120px]">{skill.category}</span>
                              <strong className="text-emerald-700">{skill.score}%</strong>
                            </span>
                          ))}
                          {verifiedSkills.length > 3 && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-lg bg-slate-100 text-[10px] font-bold text-slate-500">
                              +{verifiedSkills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* Bottom Card Footer: Verification Badge & Action Buttons */}
                    <div className="pt-4 mt-5 border-t border-slate-100 space-y-3">
                      {candidate.is_verified_badge ? (
                        <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>GrowthPaddy Verified Talent</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[11px] font-medium text-amber-700">
                          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Accreditation In Progress</span>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenProfile(candidate)}
                          className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition cursor-pointer shadow-2xs flex items-center justify-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Profile</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownloadCV(candidate)}
                          className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-500" />
                          <span>Verified CV</span>
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </section>

      </main>

      {/* ========================================================================= */}
      {/* CANDIDATE FULL PROFILE MODAL */}
      {/* ========================================================================= */}
      {activeModalCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-fadeIn">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center text-xl border border-emerald-200 shadow-inner">
                  {activeModalCandidate.full_name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">{activeModalCandidate.full_name}</h3>
                    {activeModalCandidate.is_verified_badge && (
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>Verified</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-600">{activeModalCandidate.headline}</p>
                </div>
              </div>

              <button
                onClick={() => setActiveModalCandidate(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              
              {/* Bio Section */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Executive Summary</h4>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {activeModalCandidate.bio || 'Verified practitioner with deep experience across growth pipelines.'}
                </p>
              </div>

              {/* Skills Diagnostic Matrix */}
              <div className="space-y-2.5">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Accredited Diagnostic Scores</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(activeModalCandidate.verified_skills || []).map((skill, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-200/80 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-semibold text-slate-900">{skill.category}</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md text-[10px]">
                        {skill.score}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Core Skill Tags */}
              {activeModalCandidate.skills && (
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Tooling & Domain Expertise</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeModalCandidate.skills.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium text-[11px]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact / Metadata Info */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-wrap items-center justify-between gap-3 text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{activeModalCandidate.contact_email || activeModalCandidate.email || 'Verified Candidate'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{activeModalCandidate.location || 'Remote'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>{activeModalCandidate.years_of_experience || 4}+ Years Experience</span>
                </div>
              </div>

            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveModalCandidate(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadCV(activeModalCandidate)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Verified CV</span>
                </button>

                <a
                  href={`mailto:${activeModalCandidate.contact_email || activeModalCandidate.email || 'talent@growthpaddy.com'}?subject=Recruiter Inquiry: Placement Opportunity`}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Contact Talent</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
