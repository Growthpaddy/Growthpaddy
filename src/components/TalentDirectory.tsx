'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '../lib/supabase/client';
import { recordProfileView, recordProfileClick } from '../lib/profileAnalytics';
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
  Filter,
  Phone,
  MessageSquare,
  Github,
  Linkedin,
  Cpu,
  Layers,
  Star,
  CheckSquare,
  AlertCircle,
  Users
} from 'lucide-react';

// ==============================================================================
// INLINE TYPES & INTERFACES (MATCHING SUPABASE talent_profiles SCHEMA)
// ==============================================================================

export type PlacementStatus = 'AVAILABLE' | 'HIRED' | 'UNAVAILABLE' | string;
export type Phase1Status = 'PENDING' | 'IN_PROGRESS' | 'PASSED' | 'FAILED' | string;
export type Phase2Status = 'LOCKED' | 'PENDING_SCHEDULE' | 'COMPLETED' | 'FAILED' | string;
export type Phase3Status = 'LOCKED' | 'PAYMENT_PENDING' | 'VERIFIED' | string;

export interface WorkHistoryItem {
  id?: string;
  company: string;
  role: string;
  duration: string;
  description: string;
}

export interface EducationItem {
  id?: string;
  school: string;
  degree: string;
  year: string;
}

export interface CaseStudyItem {
  id?: string;
  title: string;
  client_or_brand: string;
  metrics_achieved: string;
  description: string;
  link?: string;
}

export interface SkillDiagnostic {
  category: string;
  score: number;
  passed: boolean;
  attemptDate?: string;
}

export interface TalentProfile {
  id: string;
  user_id?: string;
  full_name: string;
  slug?: string | null;
  role_title?: string | null;
  headline?: string | null;
  bio?: string | null;
  years_experience?: number;
  years_of_experience?: number;
  location?: string | null;
  remote_preference?: 'Remote' | 'Hybrid' | 'On-site' | string | null;
  is_remote?: boolean;
  placement_status?: PlacementStatus;
  availability_status?: 'available' | 'hired' | string;
  contact_email?: string | null;
  email?: string | null;
  phone_number?: string | null;
  whatsapp_number?: string | null;
  cv_url?: string | null;
  resume_url?: string | null;
  portfolio_url?: string | null;
  github_url?: string | null;
  linkedin_url?: string | null;
  profile_picture_url?: string | null;
  avatar_url?: string | null;
  primary_specialization?: string | null;
  specialty?: string | null;
  work_history?: WorkHistoryItem[] | null;
  education?: EducationItem[] | null;
  case_studies?: CaseStudyItem[] | null;
  ai_tools?: string[] | null;
  certifications?: string[] | null;
  skills?: string[] | null;
  work_availability_type?: string[] | null;
  is_verified_badge?: boolean;
  phase_1_quizzes_passed?: number;
  phase_1_status?: Phase1Status;
  phase_2_status?: Phase2Status;
  phase_3_status?: Phase3Status;
  verified_skills?: SkillDiagnostic[] | null;
  profile_views_count?: number;
  view_count?: number;
  click_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface SkillFilter {
  id: string;
  label: string;
  category: string;
}

export interface TalentDirectoryProps {
  initialSkillFilter?: string;
  onSelectCandidate?: (candidate: TalentProfile) => void;
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

// ==============================================================================
// SKILL CATEGORIES FOR FILTERING
// ==============================================================================

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

// ==============================================================================
// MAIN TALENT DIRECTORY COMPONENT
// ==============================================================================

export default function TalentDirectory({
  initialSkillFilter,
  onSelectCandidate,
  navigateToPricing,
  selectedSlug,
  onSelectCandidateSlug,
  onCloseProfileModal
}: TalentDirectoryProps) {
  const supabase = useMemo(() => {
    try {
      return createClient();
    } catch (e) {
      console.warn('[TalentDirectory] Supabase client init warning:', e);
      return null;
    }
  }, []);

  // Safe Navigation Handler for Next.js and SPA routing
  const navigateToRecruiterPackages = useCallback((talentId?: string) => {
    const targetUrl = talentId 
      ? `/packages?intent=view_contact&talent_id=${encodeURIComponent(talentId)}`
      : `/packages?intent=view_contact`;
    if (navigateToPricing) {
      try {
        window.history.pushState({}, '', targetUrl);
        window.dispatchEvent(new Event('popstate'));
      } catch (_) {}
      navigateToPricing();
      return;
    }
    try {
      window.history.pushState({}, '', targetUrl);
      window.dispatchEvent(new Event('popstate'));
      window.location.href = targetUrl;
    } catch {
      window.location.href = targetUrl;
    }
  }, [navigateToPricing]);

  // Directory State
  const [candidates, setCandidates] = useState<TalentProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialSkillFilter || 'ALL');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [availableOnly, setAvailableOnly] = useState<boolean>(false);
  const [remoteOnly, setRemoteOnly] = useState<boolean>(false);

  // Recruiter Portfolio View Modal State
  const [activePortfolioCandidate, setActivePortfolioCandidate] = useState<TalentProfile | null>(null);

  // Paywall Modal State
  const [showPaywallModal, setShowPaywallModal] = useState<boolean>(false);
  const [paywallFieldLabel, setPaywallFieldLabel] = useState<string>('Direct Contact & CV');

  // Trigger Paywall Modal Helper
  const triggerPaywall = (fieldLabel: string) => {
    setPaywallFieldLabel(fieldLabel);
    setShowPaywallModal(true);
  };

  // Action Handler when visitor clicks View Contact on a talent card:
  // When an unauthenticated visitor clicks View Contact on a talent card, redirect them directly to /packages?intent=view_contact&talent_id=${talent.id}
  const handleViewContact = useCallback(async (candidate: TalentProfile) => {
    try {
      let activeSession = null;
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        activeSession = data?.session;
      }

      // Check if unauthenticated visitor
      if (!activeSession?.user) {
        const targetUrl = `/packages?intent=view_contact&talent_id=${encodeURIComponent(candidate.id)}`;
        if (typeof window !== 'undefined') {
          window.history.pushState({}, '', targetUrl);
          window.dispatchEvent(new Event('popstate'));
          window.location.href = targetUrl;
        }
        return;
      }

      // If authenticated, check employer quota or open contact details
      triggerPaywall('Direct Candidate Contact');
    } catch (err) {
      const targetUrl = `/packages?intent=view_contact&talent_id=${encodeURIComponent(candidate.id)}`;
      window.location.href = targetUrl;
    }
  }, [triggerPaywall]);

  // ----------------------------------------------------------------------------
  // Fetch Real Candidates from Supabase & Saved Admin/Local State (No Demo Profiles)
  // ----------------------------------------------------------------------------
  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      let loadedCandidates: TalentProfile[] = [];

      // 1. Fetch from Supabase talent_profiles table without strict gating filters
      if (supabase) {
        try {
          // Primary query: fetch all profiles (no restrictive vetting_status or phase filters)
          let { data: talentData, error: talentErr } = await supabase
            .from('talent_profiles')
            .select('*')
            .order('created_at', { ascending: false });

          // Fallback if ordering by created_at errors due to column variations
          if (talentErr && talentErr.code !== 'PGRST116') {
            console.warn('[TalentDirectory] Retrying fetch without order:', talentErr.message);
            const fallbackRes = await supabase.from('talent_profiles').select('*');
            if (!fallbackRes.error && fallbackRes.data) {
              talentData = fallbackRes.data;
              talentErr = null;
            }
          }

          if (talentErr) {
            console.error("Error fetching directory:", talentErr);
            setFetchError(talentErr.message || 'Unable to retrieve talent records from Supabase');
          } else if (Array.isArray(talentData) && talentData.length > 0) {
            // Fetch Quiz Attempts to attach verified diagnostics (graceful fallback if table is empty/unconfigured)
            let diagnosticsMap: Record<string, SkillDiagnostic[]> = {};
            try {
              const { data: quizData, error: quizErr } = await supabase
                .from('quiz_attempts')
                .select('talent_id, skill_category, score_percentage, passed, created_at')
                .eq('passed', true);

              if (quizErr) {
                console.warn('[TalentDirectory] Note fetching quiz attempts:', quizErr.message);
              } else if (quizData && Array.isArray(quizData)) {
                quizData.forEach((q: any) => {
                  if (!q || !q.talent_id) return;
                  const key = String(q.talent_id);
                  if (!diagnosticsMap[key]) {
                    diagnosticsMap[key] = [];
                  }
                  if (!diagnosticsMap[key].some((d) => d.category === q.skill_category)) {
                    diagnosticsMap[key].push({
                      category: q.skill_category,
                      score: Number(q.score_percentage || 85),
                      passed: Boolean(q.passed),
                      attemptDate: q.created_at || undefined
                    });
                  }
                });
              }
            } catch (quizCatchErr) {
              console.warn('[TalentDirectory] Quiz diagnostics exception:', quizCatchErr);
            }

            // Map all standard and alias database columns
            const mapped: TalentProfile[] = talentData.map((t: any) => {
              const profileId = String(t.id || '');
              const userId = t.user_id ? String(t.user_id) : '';
              const attachedDiagnostics = diagnosticsMap[profileId] || (userId ? diagnosticsMap[userId] : []) || [];
              
              const isVerified = Boolean(
                t.is_verified_badge || 
                t.phase_3_status === 'VERIFIED' || 
                t.phase_3_fee_paid ||
                t.vetting_status === 'verified'
              );

              // Parse skills properly (array or comma-delimited string)
              let parsedSkills: string[] = [];
              if (Array.isArray(t.skills)) {
                parsedSkills = t.skills.filter(Boolean);
              } else if (typeof t.skills === 'string' && t.skills.trim()) {
                parsedSkills = t.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
              }

              // Parse work availability types
              let parsedWorkTypes: string[] = ['Full-Time', 'Freelance'];
              if (Array.isArray(t.work_availability_type) && t.work_availability_type.length > 0) {
                parsedWorkTypes = t.work_availability_type;
              } else if (typeof t.work_availability_type === 'string' && t.work_availability_type.trim()) {
                parsedWorkTypes = [t.work_availability_type.trim()];
              } else if (Array.isArray(t.work_types) && t.work_types.length > 0) {
                parsedWorkTypes = t.work_types;
              }

              const resolvedSpecialty = t.specialty || t.primary_specialization || t.specialization || 'Growth Marketing Strategy';
              const resolvedRole = t.role_title || t.primary_role || t.role || t.headline || resolvedSpecialty;
              const resolvedLocation = t.location || t.city || t.country || 'Remote';
              const resolvedAvailability = t.availability_status || (t.placement_status === 'HIRED' ? 'hired' : 'available');

              return {
                id: profileId || `profile-${Math.random().toString(36).substring(2, 9)}`,
                user_id: t.user_id,
                full_name: t.full_name || t.name || 'Registered Specialist',
                slug: t.slug || profileId || (t.full_name ? t.full_name.toLowerCase().replace(/\s+/g, '-') : 'specialist'),
                headline: t.headline || resolvedRole,
                role_title: resolvedRole,
                specialty: resolvedSpecialty,
                primary_specialization: resolvedSpecialty,
                location: resolvedLocation,
                remote_preference: t.remote_preference || (t.is_remote !== false ? 'Remote' : 'Hybrid'),
                is_remote: t.remote_preference !== 'On-site' && t.is_remote !== false,
                skills: parsedSkills,
                availability_status: resolvedAvailability,
                placement_status: (t.placement_status || (resolvedAvailability === 'hired' ? 'HIRED' : 'AVAILABLE')) as any,
                work_availability_type: parsedWorkTypes,
                years_experience: Number(t.years_experience || t.years_of_experience || t.experience_years || 0),
                years_of_experience: Number(t.years_of_experience || t.years_experience || t.experience_years || 0),
                bio: t.bio || t.summary || t.about || '',
                profile_picture_url: t.profile_picture_url || t.avatar_url || t.photo_url || null,
                avatar_url: t.avatar_url || t.profile_picture_url || t.photo_url || null,
                contact_email: t.contact_email || t.email || null,
                email: t.email || t.contact_email || null,
                phone_number: t.phone_number || t.phone || null,
                whatsapp_number: t.whatsapp_number || t.whatsapp || null,
                cv_url: t.cv_url || t.resume_url || null,
                resume_url: t.resume_url || t.cv_url || null,
                portfolio_url: t.portfolio_url || t.website_url || null,
                github_url: t.github_url || null,
                linkedin_url: t.linkedin_url || null,
                work_history: Array.isArray(t.work_history) ? t.work_history : null,
                education: Array.isArray(t.education) ? t.education : null,
                case_studies: Array.isArray(t.case_studies) ? t.case_studies : null,
                ai_tools: Array.isArray(t.ai_tools) ? t.ai_tools : null,
                certifications: Array.isArray(t.certifications) ? t.certifications : null,
                is_verified_badge: isVerified,
                phase_1_status: t.phase_1_status || (t.phase_1_completed || isVerified ? 'PASSED' : 'PENDING'),
                phase_2_status: t.phase_2_status || (isVerified ? 'COMPLETED' : 'LOCKED'),
                phase_3_status: t.phase_3_status || (isVerified ? 'VERIFIED' : 'LOCKED'),
                verified_skills: attachedDiagnostics,
                profile_views_count: Number(t.profile_views_count ?? t.view_count ?? 0),
                view_count: Number(t.profile_views_count ?? t.view_count ?? 0),
                click_count: Number(t.click_count || 0),
                created_at: t.created_at || new Date().toISOString()
              };
            });

            loadedCandidates = mapped;
          }
        } catch (dbErr) {
          console.error("Error fetching directory:", dbErr);
          setFetchError(dbErr instanceof Error ? dbErr.message : 'Database request failure');
        }
      }

      // 2. Check local storage for real candidate profiles created during local sessions / admin updates
      if (typeof window !== 'undefined') {
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('mock_talent_profiles_')) {
              const raw = localStorage.getItem(key);
              if (raw) {
                const parsed = JSON.parse(raw);
                if (
                  parsed &&
                  parsed.id &&
                  !parsed.id.startsWith('demo-') &&
                  !loadedCandidates.some((c) => c.id === parsed.id || (parsed.user_id && c.user_id === parsed.user_id))
                ) {
                  const spec = parsed.primary_specialization || parsed.specialty || 'Growth Marketing Strategy';
                  const role = parsed.role_title || parsed.headline || spec;
                  loadedCandidates.push({
                    id: parsed.id,
                    user_id: parsed.user_id,
                    full_name: parsed.full_name || parsed.name || 'Marketing Specialist',
                    slug: parsed.slug || parsed.id,
                    headline: parsed.headline || role,
                    role_title: role,
                    specialty: spec,
                    primary_specialization: spec,
                    bio: parsed.bio || '',
                    location: parsed.location || 'Remote',
                    remote_preference: parsed.remote_preference || 'Remote',
                    is_remote: parsed.remote_preference !== 'On-site',
                    years_experience: Number(parsed.years_experience || parsed.years_of_experience || 0),
                    years_of_experience: Number(parsed.years_of_experience || parsed.years_experience || 0),
                    profile_picture_url: parsed.profile_picture_url || parsed.avatar_url || null,
                    avatar_url: parsed.avatar_url || parsed.profile_picture_url || null,
                    contact_email: parsed.contact_email || parsed.email || null,
                    email: parsed.email || parsed.contact_email || null,
                    phone_number: parsed.phone_number || null,
                    whatsapp_number: parsed.whatsapp_number || null,
                    cv_url: parsed.cv_url || parsed.resume_url || null,
                    resume_url: parsed.resume_url || parsed.cv_url || null,
                    portfolio_url: parsed.portfolio_url || null,
                    github_url: parsed.github_url || null,
                    linkedin_url: parsed.linkedin_url || null,
                    skills: Array.isArray(parsed.skills) ? parsed.skills : [],
                    work_availability_type: Array.isArray(parsed.work_availability_type)
                      ? parsed.work_availability_type
                      : ['Full-Time', 'Freelance'],
                    work_history: Array.isArray(parsed.work_history) ? parsed.work_history : null,
                    education: Array.isArray(parsed.education) ? parsed.education : null,
                    case_studies: Array.isArray(parsed.case_studies) ? parsed.case_studies : null,
                    ai_tools: Array.isArray(parsed.ai_tools) ? parsed.ai_tools : null,
                    certifications: Array.isArray(parsed.certifications) ? parsed.certifications : null,
                    placement_status: parsed.placement_status || 'AVAILABLE',
                    availability_status: parsed.availability_status || 'available',
                    is_verified_badge: Boolean(parsed.is_verified_badge || parsed.phase_3_status === 'VERIFIED'),
                    phase_1_status: parsed.phase_1_status || 'PENDING',
                    phase_2_status: parsed.phase_2_status || 'LOCKED',
                    phase_3_status: parsed.phase_3_status || 'LOCKED',
                    verified_skills: Array.isArray(parsed.verified_skills) ? parsed.verified_skills : [],
                    profile_views_count: Number(parsed.profile_views_count ?? parsed.view_count ?? 0),
                    view_count: Number(parsed.profile_views_count ?? parsed.view_count ?? 0),
                    click_count: Number(parsed.click_count || 0),
                    created_at: parsed.created_at || new Date().toISOString()
                  });
                }
              }
            }
          }
        } catch (lsErr) {
          console.warn('[TalentDirectory] localStorage check note:', lsErr);
        }
      }

      setCandidates(loadedCandidates);
    } catch (err) {
      console.error("Error fetching directory:", err);
      setFetchError(err instanceof Error ? err.message : 'Unexpected directory query error');
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchCandidates();

    // Supabase Realtime subscription on talent_profiles table for live view updates
    if (supabase) {
      const channel = supabase
        .channel('talent_directory_realtime_channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'talent_profiles'
          },
          (payload) => {
            if (payload.eventType === 'UPDATE' && payload.new) {
              const updated = payload.new;
              setCandidates((prev) =>
                prev.map((c) => {
                  if (c.id === updated.id) {
                    return {
                      ...c,
                      profile_views_count: Number(updated.profile_views_count ?? updated.view_count ?? c.profile_views_count ?? 0),
                      view_count: Number(updated.profile_views_count ?? updated.view_count ?? c.view_count ?? 0),
                      click_count: Number(updated.click_count ?? c.click_count ?? 0),
                      availability_status: updated.availability_status ?? c.availability_status,
                      placement_status: updated.placement_status ?? c.placement_status
                    };
                  }
                  return c;
                })
              );
            } else if (payload.eventType === 'INSERT') {
              fetchCandidates(true);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [fetchCandidates, supabase]);

  // If slug is passed in props or URL, automatically open that candidate's portfolio
  useEffect(() => {
    if (selectedSlug && candidates.length > 0) {
      const match = candidates.find(
        (c) => c.slug === selectedSlug || c.id === selectedSlug || c.full_name.toLowerCase().replace(/\s+/g, '-') === selectedSlug
      );
      if (match) {
        setActivePortfolioCandidate(match);
      }
    }
  }, [selectedSlug, candidates]);

  // ----------------------------------------------------------------------------
  // Filter & Search Candidates
  // ----------------------------------------------------------------------------
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      // 1. Specialization Category Filter
      if (selectedCategory !== 'ALL') {
        const spec = (c.primary_specialization || c.specialty || '').toLowerCase();
        const role = (c.role_title || c.headline || '').toLowerCase();
        const skillsList = (c.skills || []).map((s) => s.toLowerCase()).join(' ');
        const target = selectedCategory.toLowerCase();

        const matchesCategory = spec.includes(target) || role.includes(target) || skillsList.includes(target);
        if (!matchesCategory) return false;
      }

      // 2. Verified Only Filter
      if (verifiedOnly && !c.is_verified_badge) {
        return false;
      }

      // 3. Available Only Filter
      if (availableOnly && c.placement_status === 'HIRED') {
        return false;
      }

      // 4. Remote Only Filter
      if (remoteOnly && c.remote_preference === 'On-site') {
        return false;
      }

      // 5. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = (c.full_name || '').toLowerCase().includes(query);
        const roleMatch = (c.role_title || c.headline || '').toLowerCase().includes(query);
        const bioMatch = (c.bio || '').toLowerCase().includes(query);
        const locMatch = (c.location || '').toLowerCase().includes(query);
        const skillMatch = (c.skills || []).some((s) => s.toLowerCase().includes(query));

        if (!nameMatch && !roleMatch && !bioMatch && !locMatch && !skillMatch) {
          return false;
        }
      }

      return true;
    });
  }, [candidates, selectedCategory, verifiedOnly, availableOnly, remoteOnly, searchQuery]);

  // Record View Function with Geolocation
  const recordView = async (talentId: string) => {
    try {
      const res = await fetch('https://ipapi.co/json/');
      const geo = await res.json();

      await supabase.rpc('record_talent_view', {
        p_talent_id: talentId,
        p_event_type: 'profile_view',
        p_country: geo.country_name || 'Unknown',
        p_country_code: geo.country_code || 'XX',
        p_city: geo.city || 'Unknown'
      });
    } catch (err) {
      // Fallback if IP API is blocked
      try {
        await supabase.rpc('record_talent_view', { p_talent_id: talentId });
      } catch (e) {
        try {
          await supabase.from('analytics_events').insert({
            talent_id: talentId,
            event_type: 'profile_view',
            country: 'Unknown',
            country_code: 'XX',
            city: 'Unknown',
            created_at: new Date().toISOString()
          });
        } catch {}
      }
    }
  };

  // Handle Opening Candidate Portfolio
  const handleOpenPortfolio = (candidate: TalentProfile) => {
    setActivePortfolioCandidate(candidate);
    
    // Capture Live Location on Visitor/Employer Views
    if (candidate.id) {
      recordView(candidate.id).then(() => {
        setCandidates((prev) =>
          prev.map((c) => {
            if (c.id === candidate.id) {
              const nextViews = (c.profile_views_count ?? c.view_count ?? 0) + 1;
              return {
                ...c,
                profile_views_count: nextViews,
                view_count: nextViews
              };
            }
            return c;
          })
        );
      }).catch((err) => {
        console.info('[TalentDirectory] Profile view tracking:', err);
      });
    }

    if (onSelectCandidate) {
      onSelectCandidate(candidate);
    }
    if (onSelectCandidateSlug && candidate.slug) {
      onSelectCandidateSlug(candidate.slug);
    }
  };

  const handleClosePortfolio = () => {
    setActivePortfolioCandidate(null);
    if (onCloseProfileModal) {
      onCloseProfileModal();
    }
  };

  // Helper: Get Initials for Avatar
  const getInitials = (name: string) => {
    if (!name) return 'GP';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div id="talent-directory-root" className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-28">
      
      {/* ========================================================================= */}
      {/* 1. HERO & SEARCH HEADER */}
      {/* ========================================================================= */}
      <section id="directory-hero-section" className="w-full bg-slate-900 text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 xl:px-12 border-b border-slate-800 relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1600px] h-full pointer-events-none opacity-20">
          <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] rounded-full bg-emerald-500 blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[20%] w-[500px] h-[500px] rounded-full bg-indigo-500 blur-[120px]" />
        </div>

        <div className="w-full max-w-[1600px] mx-auto relative z-10 space-y-6 text-center sm:text-left">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>3-Phase Vetted Marketing Specialists</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Talent Discovery Directory
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl">
                Explore pre-vetted growth practitioners, paid media buyers, technical SEO architects, and lifecycle specialists accredited through diagnostic skill examinations.
              </p>
            </div>

            {/* Recruiter Package Upgrade CTA */}
            <div className="shrink-0 flex flex-col sm:items-end gap-2">
              <button
                type="button"
                id="recruiter-upgrade-banner-btn"
                onClick={navigateToRecruiterPackages}
                className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-2 group"
              >
                <Sparkles className="w-4 h-4 text-slate-950 group-hover:rotate-12 transition-transform" />
                <span>Unlock Direct Recruiter Access</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] text-slate-400 text-center sm:text-right font-medium">
                Direct phone, email & unblurred CV downloads
              </span>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="pt-2">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-2 rounded-2xl flex flex-col md:flex-row items-center gap-2 shadow-2xl">
              
              {/* Main Search Input */}
              <div className="relative flex-1 w-full">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  id="directory-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by candidate name, discipline, specific tool, or location..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-white placeholder:text-slate-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Verified Toggle */}
              <button
                type="button"
                id="toggle-verified-only-btn"
                onClick={() => setVerifiedOnly(!verifiedOnly)}
                className={`w-full md:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-2 border shrink-0 ${
                  verifiedOnly
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <ShieldCheck className={`w-3.5 h-3.5 ${verifiedOnly ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>Verified Badge Only</span>
              </button>

              {/* Available Toggle */}
              <button
                type="button"
                id="toggle-available-only-btn"
                onClick={() => setAvailableOnly(!availableOnly)}
                className={`w-full md:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-2 border shrink-0 ${
                  availableOnly
                    ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <CheckCircle2 className={`w-3.5 h-3.5 ${availableOnly ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>Available for Placement</span>
              </button>

            </div>
          </div>

          {/* Discipline Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 no-scrollbar">
            {SKILL_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.category;
              return (
                <button
                  key={cat.id}
                  type="button"
                  id={`filter-cat-${cat.id}`}
                  onClick={() => setSelectedCategory(cat.category)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer shrink-0 border ${
                    isSelected
                      ? 'bg-emerald-400 text-slate-950 border-emerald-400 font-bold shadow-md shadow-emerald-400/20'
                      : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700/60'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. CANDIDATE CARDS GRID */}
      {/* ========================================================================= */}
      <main className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-10">
        
        {/* Results Header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              Verified Candidate Profiles ({filteredCandidates.length})
            </h2>
            {selectedCategory !== 'ALL' && (
              <span className="text-xs bg-slate-200 text-slate-700 font-medium px-2 py-0.5 rounded-md">
                {selectedCategory}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={fetchCandidates}
            title="Refresh Talent Pool"
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition cursor-pointer text-xs flex items-center gap-1.5 shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Fetch Error Warning Banner if Supabase returned an error */}
        {fetchError && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start justify-between gap-3 shadow-2xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Database Notice: {fetchError}</p>
                <p className="text-amber-700 mt-0.5">
                  Showing any locally cached or test profiles. Check your Supabase console to confirm table permissions (RLS) if you are missing newly registered talent.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={fetchCandidates}
              className="px-2.5 py-1 bg-amber-200/80 hover:bg-amber-200 text-amber-900 font-semibold rounded-lg shrink-0 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 animate-pulse">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
            <p className="text-sm font-bold text-slate-800">Loading candidate directory roster...</p>
            <p className="text-xs text-slate-500">Querying verified credentials and diagnostic scores from the network.</p>
          </div>
        ) : candidates.length === 0 ? (
          /* Empty Database State */
          <div className="py-20 bg-white rounded-3xl border border-slate-200/80 p-8 text-center space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
              <Users className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">No Candidate Profiles in Directory</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                No active talent profiles found in the database. Real candidate profiles created in the Talent Portal or saved via the Admin Dashboard will automatically populate here.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchCandidates}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition cursor-pointer inline-flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Directory</span>
            </button>
          </div>
        ) : filteredCandidates.length === 0 ? (
          /* Empty Filter State */
          <div className="py-20 bg-white rounded-3xl border border-slate-200/80 p-8 text-center space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">No matching candidates found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No specialists matched your current combination of search terms and discipline filters. Try expanding your search criteria.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
                setVerifiedOnly(false);
                setAvailableOnly(false);
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          /* Candidate Cards Grid - Full Width Responsive */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCandidates.map((candidate) => {
              const displayName = candidate.full_name || 'Marketing Specialist';
              const roleTitle = candidate.role_title || candidate.headline || 'Growth Specialist';
              const isVerified = Boolean(candidate.is_verified_badge);
              const isAvailable = candidate.placement_status !== 'HIRED';
              const avatarUrl = candidate.profile_picture_url || candidate.avatar_url;
              const yearsExp = candidate.years_experience || candidate.years_of_experience || 4;

              return (
                <div
                  key={candidate.id}
                  id={`talent-card-${candidate.id}`}
                  className="bg-white rounded-3xl border border-slate-200/90 hover:border-slate-300 p-6 flex flex-col justify-between gap-5 transition hover:shadow-md group"
                >
                  
                  {/* Top: Avatar, Name, Verified Badge & Status */}
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      
                      {/* Avatar with Initials Fallback */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={displayName}
                            referrerPolicy="no-referrer"
                            className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0 bg-slate-100 shadow-2xs"
                            onError={(e) => {
                              // If broken image URL, fallback to initials
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 text-white font-bold flex items-center justify-center text-lg shrink-0 shadow-xs border border-slate-700">
                            {getInitials(displayName)}
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-bold text-slate-900 tracking-tight truncate group-hover:text-emerald-700 transition">
                              {displayName}
                            </h3>
                            {isVerified && (
                              <span title="Digital Campux Verified Badge (Phase 1-3 Accredited)" className="shrink-0 text-emerald-600">
                                <ShieldCheck className="w-4 h-4 fill-emerald-100" />
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-medium text-slate-600 line-clamp-1">{roleTitle}</p>
                          
                          {/* Location, Experience & View Counter Pill */}
                          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
                            <span className="flex items-center gap-0.5 truncate">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              {candidate.location || 'Global Remote'}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span>{yearsExp}+ yrs exp</span>
                            <span className="text-[11px] text-slate-600 bg-slate-100 border border-slate-200/60 px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1 shrink-0 ml-auto sm:ml-0" title="Live Profile Impressions">
                              👁️ {candidate.profile_views_count ?? candidate.view_count ?? 0} Views
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Availability Tag */}
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0 ${
                          isAvailable
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {isAvailable ? 'Available' : 'Placed'}
                      </span>
                    </div>

                    {/* Bio Summary */}
                    {candidate.bio && (
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {candidate.bio}
                      </p>
                    )}

                    {/* Verified Diagnostic Highlights */}
                    {Array.isArray(candidate.verified_skills) && candidate.verified_skills.length > 0 && (
                      <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          <span className="flex items-center gap-1">
                            <Award className="w-3 h-3 text-emerald-600" />
                            Top Exam Diagnostics
                          </span>
                          <span className="font-mono text-emerald-700">{candidate.verified_skills.length} Passed</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {candidate.verified_skills.slice(0, 3).map((diag, dIdx) => (
                            <span
                              key={dIdx}
                              className="inline-flex items-center gap-1 text-[10px] font-semibold bg-white border border-slate-200/80 text-slate-800 px-2 py-0.5 rounded-lg shadow-2xs"
                            >
                              <Check className="w-2.5 h-2.5 text-emerald-600 font-bold" />
                              <span>{diag.category}</span>
                              <span className="font-mono text-emerald-700 font-bold">{diag.score}%</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Work Preference Badges */}
                    {Array.isArray(candidate.work_availability_type) && candidate.work_availability_type.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {candidate.work_availability_type.map((type, wIdx) => (
                          <span
                            key={wIdx}
                            className="bg-slate-100 text-slate-700 font-medium rounded-full px-2.5 py-0.5 text-[10px] flex items-center gap-1 border border-slate-200/60"
                          >
                            <span className="w-1 h-1 rounded-full bg-emerald-500" />
                            <span>{type}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Skills Pills */}
                    {Array.isArray(candidate.skills) && candidate.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {candidate.skills.slice(0, 4).map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                          >
                            {skill}
                          </span>
                        ))}
                        {candidate.skills.length > 4 && (
                          <span className="text-[10px] font-medium text-slate-400 px-1 py-0.5">
                            +{candidate.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bottom: Action Buttons */}
                  <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                    <button
                      type="button"
                      id={`view-portfolio-btn-${candidate.id}`}
                      onClick={() => handleOpenPortfolio(candidate)}
                      className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition cursor-pointer shadow-2xs flex items-center justify-center gap-1.5 group-hover:bg-emerald-600"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Portfolio</span>
                    </button>

                    <button
                      type="button"
                      id={`direct-contact-btn-${candidate.id}`}
                      onClick={() => handleViewContact(candidate)}
                      className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-emerald-700 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                      title="View Contact (Recruiter Access Required)"
                    >
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>View Contact</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* 3. RECRUITER PORTFOLIO VIEW MODAL WITH BLURRED CONTACT & PAYWALL */}
      {/* ========================================================================= */}
      {activePortfolioCandidate && (
        <div
          id="recruiter-portfolio-modal"
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        >
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 relative text-left my-auto">
            
            {/* Modal Header */}
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Digital Campux Candidate Dossier
                </span>
                {activePortfolioCandidate.is_verified_badge && (
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md hidden sm:inline">
                    3-Phase Accredited
                  </span>
                )}
              </div>

              <button
                type="button"
                id="close-portfolio-modal-btn"
                onClick={handleClosePortfolio}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-8">
              
              {/* Candidate Overview Card */}
              <div className="flex flex-col sm:flex-row items-start justify-between gap-6 pb-6 border-b border-slate-200">
                <div className="flex items-start gap-4">
                  {activePortfolioCandidate.profile_picture_url || activePortfolioCandidate.avatar_url ? (
                    <img
                      src={activePortfolioCandidate.profile_picture_url || activePortfolioCandidate.avatar_url || ''}
                      alt={activePortfolioCandidate.full_name}
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 rounded-3xl object-cover border border-slate-200 shrink-0 bg-slate-100 shadow-xs"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-3xl bg-slate-900 text-white font-bold flex items-center justify-center text-2xl shrink-0 shadow-md">
                      {getInitials(activePortfolioCandidate.full_name)}
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                        {activePortfolioCandidate.full_name}
                      </h2>
                      {activePortfolioCandidate.is_verified_badge && (
                        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                      <span className="text-[11px] text-slate-600 bg-slate-100 border border-slate-200/80 px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1 ml-1" title="Live Profile Impressions">
                        👁️ {activePortfolioCandidate.profile_views_count ?? activePortfolioCandidate.view_count ?? 0} Views
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-700">
                      {activePortfolioCandidate.role_title || activePortfolioCandidate.headline}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {activePortfolioCandidate.location || 'Remote Global'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                        {(activePortfolioCandidate.years_experience || activePortfolioCandidate.years_of_experience || 4)}+ Years Experience
                      </span>
                      <span className="flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                        {activePortfolioCandidate.remote_preference || 'Remote Preference'}
                      </span>
                    </div>

                    {/* Work Type Availability Badges */}
                    {Array.isArray(activePortfolioCandidate.work_availability_type) && activePortfolioCandidate.work_availability_type.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-2">
                        <span className="text-[11px] font-semibold text-slate-600">Open To:</span>
                        {activePortfolioCandidate.work_availability_type.map((type, wIdx) => (
                          <span
                            key={wIdx}
                            className="bg-slate-100 text-slate-700 font-medium rounded-full px-3 py-0.5 text-xs flex items-center gap-1.5 border border-slate-200"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>{type}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Direct Action CTA */}
                <div className="shrink-0 w-full sm:w-auto">
                  <button
                    type="button"
                    id="contact-talent-modal-cta"
                    onClick={() => activePortfolioCandidate ? handleViewContact(activePortfolioCandidate) : triggerPaywall('Direct Talent Contact')}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>View Contact</span>
                  </button>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* PAYWALLED & BLURRED CONTACT & CHANNELS CARD */}
              {/* ========================================================================= */}
              <div id="blurred-contact-channels-container" className="bg-slate-900 text-white rounded-3xl p-6 relative overflow-hidden shadow-lg">
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      Candidate Direct Channels & Downloads
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                    Recruiter Gated
                  </span>
                </div>

                {/* Blurred Content Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 select-none blur-xs filter backdrop-blur-xs pointer-events-none opacity-60">
                  
                  {/* Blurred Email */}
                  <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 flex items-center gap-3">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <div className="truncate">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Direct Email</p>
                      <p className="text-xs font-mono text-slate-200">
                        {activePortfolioCandidate.contact_email || 'candidate@domain.com'}
                      </p>
                    </div>
                  </div>

                  {/* Blurred Phone */}
                  <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 flex items-center gap-3">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <div className="truncate">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Phone / WhatsApp</p>
                      <p className="text-xs font-mono text-slate-200">
                        {activePortfolioCandidate.phone_number || activePortfolioCandidate.whatsapp_number || '+44 7911 000000'}
                      </p>
                    </div>
                  </div>

                  {/* Blurred CV Download */}
                  <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 flex items-center gap-3">
                    <Download className="w-4 h-4 text-slate-400" />
                    <div className="truncate">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Official CV / Resume</p>
                      <p className="text-xs font-semibold text-indigo-300">resume-verified.pdf</p>
                    </div>
                  </div>

                  {/* Blurred External Portfolio */}
                  <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 flex items-center gap-3">
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                    <div className="truncate">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">External Portfolio Link</p>
                      <p className="text-xs text-emerald-400 truncate">https://candidate.portfolio.live</p>
                    </div>
                  </div>

                  {/* Blurred LinkedIn */}
                  <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 flex items-center gap-3">
                    <Linkedin className="w-4 h-4 text-slate-400" />
                    <div className="truncate">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">LinkedIn Profile</p>
                      <p className="text-xs text-blue-400 truncate">linkedin.com/in/verified-specialist</p>
                    </div>
                  </div>

                  {/* Blurred GitHub */}
                  <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 flex items-center gap-3">
                    <Github className="w-4 h-4 text-slate-400" />
                    <div className="truncate">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">GitHub & Codebase</p>
                      <p className="text-xs text-slate-300 truncate">github.com/growth-scripts</p>
                    </div>
                  </div>

                </div>

                {/* Floating Paywall Lock Overlay */}
                <div
                  id="lock-overlay-banner"
                  onClick={() => triggerPaywall('Direct Contact Channels')}
                  className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:bg-slate-950/75 transition"
                >
                  <div className="bg-slate-900 border border-emerald-500/40 p-4 rounded-2xl shadow-xl max-w-md space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 text-[11px] font-bold border border-emerald-500/30">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Recruiter Access Required</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-200">
                      Direct contact phone numbers, emails, LinkedIn, external portfolio links, and CV downloads are protected.
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerPaywall('Direct Contact & CV Download');
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow-xs cursor-pointer inline-flex items-center gap-1"
                    >
                      <span>Unlock Candidate Direct Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

              </div>

              {/* Bio & Professional Summary */}
              {activePortfolioCandidate.bio && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Professional Summary & Background
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/70">
                    {activePortfolioCandidate.bio}
                  </p>
                </div>
              )}

              {/* Verified Diagnostic Skill Scores */}
              {Array.isArray(activePortfolioCandidate.verified_skills) && activePortfolioCandidate.verified_skills.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-emerald-600" />
                      Diagnostic Exam Accreditations
                    </h3>
                    <span className="text-xs font-mono font-bold text-emerald-700">Passing Benchmark: 80%+</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activePortfolioCandidate.verified_skills.map((diag, index) => (
                      <div
                        key={index}
                        className="bg-white border border-slate-200 p-3.5 rounded-2xl flex items-center justify-between shadow-2xs"
                      >
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-900">{diag.category}</p>
                          <p className="text-[10px] text-slate-500">Verified by Digital Campux Algorithm Engine</p>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-sm font-extrabold text-emerald-700">
                            {diag.score}%
                          </span>
                          <span className="block text-[9px] font-bold text-emerald-600 uppercase">Passed</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Work History */}
              {Array.isArray(activePortfolioCandidate.work_history) && activePortfolioCandidate.work_history.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-indigo-600" />
                    Verified Work Experience
                  </h3>
                  <div className="space-y-3">
                    {activePortfolioCandidate.work_history.map((work, wIdx) => (
                      <div
                        key={wIdx}
                        className="bg-slate-50/60 border border-slate-200/80 p-4 rounded-2xl space-y-1.5 text-left"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-slate-900">{work.role}</h4>
                          <span className="text-[11px] font-medium text-slate-500 font-mono">{work.duration}</span>
                        </div>
                        <p className="text-xs font-semibold text-indigo-700">{work.company}</p>
                        <p className="text-xs text-slate-600 leading-relaxed pt-1">{work.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Case Studies & Notable Wins */}
              {Array.isArray(activePortfolioCandidate.case_studies) && activePortfolioCandidate.case_studies.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    Verified Case Studies & Scaled Growth Wins
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {activePortfolioCandidate.case_studies.map((cs, cIdx) => (
                      <div
                        key={cIdx}
                        className="bg-emerald-50/40 border border-emerald-200/70 p-4 rounded-2xl space-y-1.5"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-slate-900">{cs.title}</h4>
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                            {cs.client_or_brand}
                          </span>
                        </div>
                        <p className="text-xs font-mono font-bold text-emerald-800">
                          Metrics: {cs.metrics_achieved}
                        </p>
                        <p className="text-xs text-slate-600 leading-relaxed">{cs.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Tools & Certifications Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                
                {/* AI Tools */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-purple-600" />
                    AI Marketing Tools & Workflows
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.isArray(activePortfolioCandidate.ai_tools) && activePortfolioCandidate.ai_tools.length > 0 ? (
                      activePortfolioCandidate.ai_tools.map((tool, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200/60 px-2.5 py-1 rounded-xl"
                        >
                          {tool}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">Standard AI tooling stack (ChatGPT, Midjourney)</span>
                    )}
                  </div>
                </div>

                {/* Certifications & Education */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                    Certifications & Academics
                  </h3>
                  <div className="space-y-1.5">
                    {Array.isArray(activePortfolioCandidate.certifications) && activePortfolioCandidate.certifications.length > 0 ? (
                      activePortfolioCandidate.certifications.map((cert, certIdx) => (
                        <div key={certIdx} className="text-xs text-slate-700 flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{cert}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">Industry certifications verified during Phase 2</span>
                    )}
                  </div>
                </div>

              </div>

            </div>

            {/* Modal Bottom Sticky Bar */}
            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500 text-center sm:text-left">
                Want direct candidate interview placement or unmasked contact details?
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleClosePortfolio}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer flex-1 sm:flex-none"
                >
                  Close Dossier
                </button>
                <button
                  type="button"
                  onClick={() => triggerPaywall('Direct Talent Outreach')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer shadow-xs flex-1 sm:flex-none flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Unlock Recruiter Access</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. RECRUITER PAYWALL & PACKAGE UPGRADE MODAL */}
      {/* ========================================================================= */}
      {showPaywallModal && (
        <div
          id="recruiter-paywall-modal"
          className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-center space-y-6 relative my-auto">
            
            {/* Close Button */}
            <button
              type="button"
              id="close-paywall-modal-btn"
              onClick={() => setShowPaywallModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Paywall Icon & Badge */}
            <div className="space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <Lock className="w-8 h-8" />
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-emerald-400 text-xs font-mono font-bold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Recruiter Direct Tier
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Unlock Candidate Direct Contact & CV
              </h2>
            </div>

            {/* Informational Copy */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Upgrade to a Recruiter Package to access direct phone numbers, email, official CV downloads, LinkedIn profiles, and external portfolio links for pre-vetted marketing specialists.
            </p>

            {/* Benefits Checklist */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5 text-left text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 font-bold shrink-0" />
                <span>Instant unmasking of direct contact email & WhatsApp numbers</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 font-bold shrink-0" />
                <span>Direct 1-click PDF resume & detailed case study downloads</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 font-bold shrink-0" />
                <span>Direct messaging and automated interview scheduling credits</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 font-bold shrink-0" />
                <span>Zero commission fee guarantee on candidate hires</span>
              </div>
            </div>

            {/* Upgrade CTA Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                id="view-recruiter-packages-cta"
                onClick={() => navigateToRecruiterPackages(activePortfolioCandidate?.id)}
                className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm transition shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-2 group"
              >
                <span>View Recruiter Packages & Pricing</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => setShowPaywallModal(false)}
                className="text-xs text-slate-500 hover:text-slate-700 font-semibold cursor-pointer"
              >
                Continue browsing public portfolios
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
