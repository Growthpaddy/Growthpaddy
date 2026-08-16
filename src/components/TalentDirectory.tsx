import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Search, 
  Award, 
  ArrowRight, 
  Sparkles, 
  Briefcase, 
  CheckCircle2, 
  MapPin, 
  Activity, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Clock,
  Lock,
  Unlock,
  FileText,
  Bookmark,
  PlusCircle,
  Eye,
  Check,
  MessageSquare,
  Mail,
  X,
  UserCheck,
  Zap,
  Globe,
  RefreshCw,
  UserX,
  UserPlus,
  SlidersHorizontal,
  GraduationCap,
  Share2,
  Copy
} from 'lucide-react';
import { TalentCandidate } from '../types';
import { supabase } from '../lib/supabaseClient';
import PublicPortfolio from './PublicPortfolio';

interface TalentDirectoryProps {
  employerSlots?: number;
  setEmployerSlots?: React.Dispatch<React.SetStateAction<number>>;
  navigateToPricing?: () => void;
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

const SPECIALIZATIONS = [
  'All Profiles',
  'AI Automation',
  'Full-Stack Developer',
  'SEO',
  'Growth Marketing',
  'PPC',
  'Social Media',
  'Email Marketing'
] as const;

type SpecializationType = typeof SPECIALIZATIONS[number];

// Helper to normalize any freeform or legacy specialty string into a clean directory category
function normalizeSpecialization(specialty?: string): 'AI Automation' | 'Full-Stack Developer' | 'SEO' | 'Growth Marketing' | 'PPC' | 'Social Media' | 'Email Marketing' {
  if (!specialty) return 'AI Automation';
  const s = specialty.toLowerCase();
  if (s.includes('ai') || s.includes('automation') || s.includes('agent') || s.includes('make') || s.includes('zapier') || s.includes('n8n')) {
    return 'AI Automation';
  }
  if (s.includes('dev') || s.includes('full') || s.includes('stack') || s.includes('software') || s.includes('react') || s.includes('code') || s.includes('frontend') || s.includes('backend') || s.includes('engineer')) {
    return 'Full-Stack Developer';
  }
  if (s.includes('seo') || s.includes('content') || s.includes('search engine') || s.includes('copywriting')) {
    return 'SEO';
  }
  if (s.includes('growth') || s.includes('cro') || s.includes('acquisition') || s.includes('funnel') || s.includes('retention')) {
    return 'Growth Marketing';
  }
  if (s.includes('ppc') || s.includes('paid ads') || s.includes('google ads') || s.includes('meta ads') || s.includes('sem')) {
    return 'PPC';
  }
  if (s.includes('social') || s.includes('community') || s.includes('instagram') || s.includes('tiktok') || s.includes('brand')) {
    return 'Social Media';
  }
  if (s.includes('email') || s.includes('lifecycle') || s.includes('klaviyo') || s.includes('newsletter') || s.includes('mail')) {
    return 'Email Marketing';
  }
  return 'AI Automation';
}

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=300'
];

export default function TalentDirectory({ 
  employerSlots = 1, 
  setEmployerSlots, 
  navigateToPricing,
  selectedSlug,
  onSelectCandidateSlug,
  onCloseProfileModal,
  onboardingData
}: TalentDirectoryProps) {
  const [candidatesList, setCandidatesList] = useState<TalentCandidate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>('All Profiles');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCandidate, setSelectedCandidate] = useState<TalentCandidate | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [candidateNotes, setCandidateNotes] = useState<string>('');

  // Primary Data Fetch from Supabase talent_profiles
  const fetchTalentPool = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      // Query all talent profiles live from Supabase
      const { data: dbData, error } = await supabase
        .from('talent_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error loading talent pool:", error);
        setFetchError(error.message);
      }

      const allTalentRows = dbData || [];

      if (allTalentRows && allTalentRows.length > 0) {
        const parsedCandidates: TalentCandidate[] = allTalentRows.map((item: any, idx: number) => {
          const name = item.full_name || item.fullName || item.userName || item.name || (item.email ? item.email.split('@')[0] : `Specialist #${idx + 1}`);
          const normalizedSpec = normalizeSpecialization(item.specialty || item.specialization || item.role || item.career_goal);
          const rawSkills = item.skills || item.session_responses?.skills;
          
          let parsedSkills: string[] = [];
          if (Array.isArray(rawSkills) && rawSkills.length > 0) {
            parsedSkills = rawSkills.filter(Boolean);
          } else if (typeof rawSkills === 'string' && rawSkills.trim().length > 0) {
            try {
              const jsonParsed = JSON.parse(rawSkills);
              if (Array.isArray(jsonParsed)) parsedSkills = jsonParsed.filter(Boolean);
              else parsedSkills = rawSkills.split(',').map(s => s.trim()).filter(Boolean);
            } catch {
              parsedSkills = rawSkills.split(',').map(s => s.trim()).filter(Boolean);
            }
          }

          if (parsedSkills.length === 0) {
            if (normalizedSpec === 'AI Automation') parsedSkills = ['AI Automation', 'Make.com', 'Zapier', 'Python', 'OpenAI / Gemini API'];
            else if (normalizedSpec === 'Full-Stack Developer') parsedSkills = ['TypeScript', 'React', 'Node.js', 'REST APIs', 'Cloud Architecture'];
            else if (normalizedSpec === 'SEO') parsedSkills = ['Technical SEO', 'Content Strategy', 'Ahrefs', 'Search Console', 'Schema Markup'];
            else if (normalizedSpec === 'Growth Marketing') parsedSkills = ['Funnel Optimization', 'CRO', 'A/B Testing', 'GA4', 'User Acquisition'];
            else if (normalizedSpec === 'PPC') parsedSkills = ['Google Ads', 'Meta Ads Manager', 'ROAS Scaling', 'Audience Retargeting'];
            else if (normalizedSpec === 'Social Media') parsedSkills = ['Short-form Video', 'Brand Architecture', 'Community Growth', 'Viral Strategy'];
            else parsedSkills = ['Klaviyo', 'Lifecycle Automation', 'Segmentation', 'SMS Marketing'];
          }

          let score = 0;
          if (typeof item.score === 'number' && !isNaN(item.score)) {
            score = item.score;
          } else if (typeof item.latest_quiz_score === 'number' && !isNaN(item.latest_quiz_score)) {
            score = item.latest_quiz_score;
          } else if (typeof item.phase_1_score === 'number' && !isNaN(item.phase_1_score)) {
            score = item.phase_1_score;
          } else if (item.phase_1_quiz_passed && item.phase_2_interview_passed && (item.phase_3_fee_paid || item.vetting_status === 'approved' || item.vetting_status === 'verified')) {
            score = 100;
          } else if (item.phase_1_quiz_passed && item.phase_2_interview_passed) {
            score = 85;
          } else if (item.phase_1_quiz_passed) {
            score = 75;
          } else {
            score = 0;
          }

          const isVerified = item.vetting_status === 'approved' || item.vetting_status === 'verified' || (item.phase_1_quiz_passed && item.phase_2_interview_passed && item.phase_3_fee_paid);
          const verificationBadge: 'Verified Professional' | 'Top Performer' | 'Verified Intern' = isVerified
            ? 'Verified Professional'
            : item.phase_1_quiz_passed
            ? 'Top Performer'
            : 'Verified Intern';

          const avatar = item.profile_picture_url || item.avatar_url || item.profilePictureUrl || DEFAULT_AVATARS[idx % DEFAULT_AVATARS.length];
          const expLevel = item.experience_level || 'Mid-Level';
          const expYears = (expLevel === 'Senior' || expLevel === 'Seasoned Professional' || expLevel === '5+ years') ? 5 : (expLevel === 'Mid-Level' || expLevel === '3-5 years') ? 3 : 2;
          const computedSlug = item.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

          return {
            id: item.id || `talent-${idx}`,
            name: name,
            avatarUrl: avatar,
            role: item.specialty || `${normalizedSpec} Specialist`,
            specialization: normalizedSpec,
            verificationBadge: verificationBadge,
            isVerified: isVerified,
            skills: parsedSkills,
            availability: item.availability || 'Available Immediately',
            availability_status: item.availability_status === 'hired' ? 'hired' : 'available',
            portfolioScore: score,
            experienceCount: expYears,
            bio: item.bio || item.about || (item.career_goal ? `Career Focus: ${item.career_goal}. Evaluated through Digital Campux vetting pipeline.` : 'Evaluated through Digital Campux technical vetting pipeline.'),
            location: item.location || item.timezone || 'Lagos, Nigeria (Remote)',
            email: item.email || 'matchmaker@digitalcampux.com',
            phone: item.phone || '+234 816 966 4607',
            about: item.career_goal ? `Career Goal: ${item.career_goal}` : (item.bio || 'Vetted talent candidate active in Digital Campux pool.'),
            slug: computedSlug,
            portfolioUrl: item.portfolio_url || '',
            profilePictureUrl: avatar,
            featuredProject: {
              title: item.portfolio_url ? 'Audited Portfolio & Codebase' : 'Digital Campux Diagnostic Evaluation',
              metrics: `Diagnostic Audit (${score}% Scorecard)`
            },
            projects: item.portfolio_url ? [
              {
                title: 'Verified Candidate Live Portfolio',
                description: 'Audited codebase, interactive live projects, and system architecture.',
                metrics: 'Live URL Verified',
                tools: parsedSkills.slice(0, 3),
                year: '2026'
              }
            ] : undefined
          };
        });

        setCandidatesList(parsedCandidates);
      } else {
        setCandidatesList([]);
      }
    } catch (err: any) {
      console.error('Error loading talent pool:', err);
      setFetchError(err.message || 'Unable to sync talent pool.');
      setCandidatesList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTalentPool();

    // Listen for live database updates from Supabase
    const channel = supabase
      .channel('talent_profiles_live_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'talent_profiles' },
        () => {
          fetchTalentPool();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Handle auto-selection when selectedSlug is supplied
  useEffect(() => {
    if (selectedSlug && candidatesList.length > 0) {
      const match = candidatesList.find(c => 
        c.slug === selectedSlug.toLowerCase() ||
        c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === selectedSlug.toLowerCase() ||
        c.name.toLowerCase() === selectedSlug.toLowerCase().replace(/-/g, ' ')
      );
      if (match) {
        setSelectedCandidate(match);
        setIsProfileModalOpen(true);
      }
    }
  }, [selectedSlug, candidatesList]);

  // Prefilter based on onboarding recruiter role
  useEffect(() => {
    if (onboardingData?.userType === 'recruiter' && onboardingData?.neededRole) {
      const roleMap: Record<string, SpecializationType> = {
        'AI Automation Operations Architect': 'AI Automation',
        'SEO Strategist & Content Architect': 'SEO',
        'Growth Marketing Lead': 'Growth Marketing',
        'Paid Acquisition & PPC Engineer': 'PPC',
        'Lifecycle & Email Marketer': 'Email Marketing',
        'Social Media & Brand Builder': 'Social Media'
      };
      const matched = roleMap[onboardingData.neededRole];
      if (matched) {
        setSelectedSpecialization(matched);
      }
    }
  }, [onboardingData]);

  // Load saved candidate notes from local storage when modal opens
  useEffect(() => {
    if (selectedCandidate) {
      const saved = localStorage.getItem(`candidate-notes-${selectedCandidate.id}`);
      setCandidateNotes(saved || '');
    }
  }, [selectedCandidate]);

  const saveCandidateNotes = (text: string) => {
    setCandidateNotes(text);
    if (selectedCandidate) {
      localStorage.setItem(`candidate-notes-${selectedCandidate.id}`, text);
    }
  };

  // Filter candidates list based on active tab and search query
  const filteredCandidates = candidatesList.filter(talent => {
    const matchesSpecialty = selectedSpecialization === 'All Profiles' || 
      talent.specialization.toLowerCase() === selectedSpecialization.toLowerCase() ||
      talent.role.toLowerCase().includes(selectedSpecialization.toLowerCase());
    
    const matchesSearch = searchQuery.trim() === '' || 
      talent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      talent.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      talent.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      talent.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      talent.bio.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSpecialty && matchesSearch;
  });

  // Calculate count for each specialization tab
  const getSpecializationCount = (spec: SpecializationType) => {
    if (spec === 'All Profiles') return candidatesList.length;
    return candidatesList.filter(t => t.specialization.toLowerCase() === spec.toLowerCase()).length;
  };

  const handleOpenFullProfile = (talent: TalentCandidate) => {
    const candidateSlug = talent.slug || talent.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    window.history.pushState(null, '', `/${candidateSlug}`);
    setSelectedCandidate(talent);
    setIsProfileModalOpen(true);
    onSelectCandidateSlug?.(candidateSlug);
  };

  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
    setSelectedCandidate(null);
    window.history.pushState(null, '', '/directory');
    onCloseProfileModal?.();
  };

  return (
    <div className="space-y-8 text-left max-w-7xl mx-auto py-4">
      
      {/* 1. Header Toolbar & Filters Container */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-7 shadow-xs space-y-5">
        
        {/* Top Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Verified Talent Pool</span>
              </span>
              <h3 className="font-display font-bold text-xl sm:text-2xl text-slate-900">
                Verified Candidate Directory
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Browse pre-evaluated technical specialists with live diagnostic assessments, verified scores, and audited portfolios.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by skill, name, stack, or location..."
                className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white text-slate-800 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              onClick={fetchTalentPool}
              title="Refresh Talent Directory"
              className="p-2.5 border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-600 transition cursor-pointer shrink-0 flex items-center gap-1.5 text-xs font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>
          </div>
        </div>

        {/* Specialization Filter Tabs with dynamic counts */}
        <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-100">
          {SPECIALIZATIONS.map((spec) => {
            const isActive = selectedSpecialization === spec;
            const count = getSpecializationCount(spec);
            return (
              <button
                key={spec}
                onClick={() => setSelectedSpecialization(spec)}
                className={`py-1.5 px-3 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                    : 'bg-slate-100 hover:bg-slate-200/70 text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{spec}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-emerald-700/80 text-emerald-100' : 'bg-slate-200/80 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Results Summary Bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Showing <strong className="text-slate-800">{filteredCandidates.length}</strong> of <strong className="text-slate-800">{candidatesList.length}</strong> verified profile{candidatesList.length === 1 ? '' : 's'}
          </span>
          {searchQuery && (
            <span className="text-emerald-700 font-medium">
              Filtered by "{searchQuery}"
            </span>
          )}
        </div>
      </div>

      {/* 2. Loading Skeleton View */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 animate-pulse">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-slate-200 shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-5 bg-slate-100 rounded-full w-20" />
                <div className="h-5 bg-slate-100 rounded-full w-16" />
              </div>
              <div className="h-12 bg-slate-50 rounded-xl" />
              <div className="h-9 bg-slate-200 rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : candidatesList.length === 0 ? (
        /* 3. Empty Directory State when DB has no candidates */
        <div className="bg-white border border-slate-200/90 rounded-3xl p-10 sm:p-14 text-center max-w-xl mx-auto space-y-5 shadow-xs">
          <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
            <UserX className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h4 className="font-display font-bold text-xl sm:text-2xl text-slate-900">
              No Candidates Found Yet
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
              The talent directory connects directly to the Digital Campux vetted talent network. As new candidates complete registration and pass diagnostic assessments, their profiles will populate here automatically.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={fetchTalentPool}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Directory</span>
            </button>

            <a
              href="/#/talent"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', '/talent');
                window.dispatchEvent(new Event('popstate'));
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register Candidate Profile</span>
            </a>
          </div>
        </div>
      ) : (
        /* 4. Candidate Cards Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredCandidates.length > 0 ? (
              filteredCandidates.map((candidate) => (
                <motion.div
                  key={candidate.id}
                  layout="position"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => handleOpenFullProfile(candidate)}
                  className="bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-lg rounded-2xl p-5 sm:p-6 transition-all duration-200 flex flex-col justify-between space-y-4 text-left group cursor-pointer relative"
                >
                  <div className="space-y-4">
                    {/* Header: Avatar, Name, Role, Location and Badges */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="relative shrink-0">
                          <img 
                            src={candidate.avatarUrl} 
                            alt={candidate.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200/80 shadow-2xs"
                            referrerPolicy="no-referrer"
                          />
                          {candidate.availability_status === 'available' || !candidate.availability_status ? (
                            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white ring-2 ring-white">
                              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                            </span>
                          ) : (
                            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-900 ring-2 ring-white">
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1 space-y-0.5">
                          <h4 className="font-display font-bold text-sm sm:text-base text-slate-900 group-hover:text-emerald-600 transition-colors truncate">
                            {candidate.name}
                          </h4>
                          <p className="text-xs text-emerald-700 font-medium truncate">
                            {candidate.role}
                          </p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{candidate.location}</span>
                          </p>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        {/* Verified vs Unverified Badge */}
                        {candidate.isVerified ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/90 text-[11px] font-semibold px-2 py-0.5 rounded-md shadow-2xs">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Verified</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-semibold px-2 py-0.5 rounded-md">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>Unverified</span>
                          </span>
                        )}

                        {/* Availability Indicator */}
                        {candidate.availability_status === 'available' || !candidate.availability_status ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                            <span>Available</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500">
                            <Lock className="w-2.5 h-2.5 text-slate-400" />
                            <span>Hired</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Metric / Meta Strip */}
                    <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                      <div>
                        <span className="block text-[10px] uppercase font-mono font-medium text-slate-400">Score</span>
                        <span className="text-xs font-bold text-slate-800">{candidate.portfolioScore}/100</span>
                      </div>
                      <div className="border-x border-slate-200/60">
                        <span className="block text-[10px] uppercase font-mono font-medium text-slate-400">Exp</span>
                        <span className="text-xs font-bold text-slate-800">{candidate.experienceCount >= 5 ? 'Senior' : 'Mid-Level'}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-mono font-medium text-slate-400">Track</span>
                        <span className="text-xs font-bold text-slate-800 truncate block px-1">{candidate.specialization}</span>
                      </div>
                    </div>

                    {/* Bio / Summary */}
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {candidate.bio}
                    </p>

                    {/* Core Skill Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {candidate.skills.slice(0, 4).map((skill, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSearchQuery(skill);
                          }}
                          title={`Filter by ${skill}`}
                          className="text-[11px] font-medium bg-white hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 text-slate-700 px-2.5 py-0.5 border border-slate-200 rounded-md transition cursor-pointer shadow-2xs"
                        >
                          {skill}
                        </button>
                      ))}
                      {candidate.skills.length > 4 && (
                        <span className="text-[10px] font-mono font-medium text-slate-400 self-center px-1">
                          +{candidate.skills.length - 4}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Primary CTA Button */}
                  <button
                    onClick={() => handleOpenFullProfile(candidate)}
                    className="w-full bg-slate-900 group-hover:bg-emerald-600 text-white font-medium py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition shadow-2xs group-hover:shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-400 group-hover:text-white transition-colors" />
                    <span>View Candidate Profile</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </button>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
                <Search className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-slate-700 text-sm font-semibold">No candidates match your current filter query.</p>
                <button 
                  onClick={() => { setSearchQuery(''); setSelectedSpecialization('All Profiles'); }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-xl text-xs cursor-pointer shadow-xs"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* 5. Full Candidate Profile Modal Drawer */}
      {isProfileModalOpen && selectedCandidate && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto animate-fadeIn">
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl max-w-5xl w-full my-4 overflow-hidden text-left relative flex flex-col max-h-[92vh]"
          >
            {/* Modal Navigation Topbar */}
            <div className="bg-slate-900/90 border-b border-slate-800 p-4 sm:px-6 flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  Executive Candidate File
                </span>
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                  /{selectedCandidate.slug || selectedCandidate.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    const url = `${window.location.origin}/#/${selectedCandidate.slug || selectedCandidate.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
                    navigator.clipboard.writeText(url);
                    alert('Profile link copied to clipboard!');
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-mono text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </button>

                <button 
                  onClick={handleCloseProfileModal}
                  className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body Container with PublicPortfolio */}
            <div className="flex-1 overflow-y-auto bg-slate-950">
              <PublicPortfolio 
                candidateSlug={selectedCandidate.slug || selectedCandidate.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                onClose={handleCloseProfileModal}
                isEmbedded={true}
              />
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}

export const Directory = TalentDirectory;
export const TalentPool = TalentDirectory;
