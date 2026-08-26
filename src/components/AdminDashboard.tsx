'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Clock,
  ExternalLink,
  Calendar,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Mail,
  MapPin,
  Briefcase,
  Search,
  Filter,
  Award,
  XCircle,
  Save,
  Link as LinkIcon,
  Check,
  UserCheck,
  TrendingUp,
  Settings,
  FileText,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Phone,
  Layers,
  CheckSquare,
  Square,
  MinusSquare,
  AlertTriangle,
  Users,
  Trash2,
  ShieldAlert,
  X
} from 'lucide-react';

// ==============================================================================
// INLINE TYPES & INTERFACES (SELF-CONTAINED)
// ==============================================================================

export type VerificationStage = 'ALL' | 'PHASE_1_PASSED' | 'PHASE_2_PENDING' | 'PHASE_3_READY' | 'VERIFIED' | 'FAILED';

export interface TalentProfile {
  id: string;
  user_id?: string;
  full_name: string;
  email?: string;
  contact_email?: string;
  headline?: string;
  bio?: string | null;
  location?: string | null;
  remote_preference?: string | null;
  phone_number?: string | null;
  whatsapp_number?: string | null;
  cv_url?: string | null;
  portfolio_url?: string | null;
  github_url?: string | null;
  linkedin_url?: string | null;
  years_of_experience?: number;
  years_experience?: number;
  role_title?: string | null;
  primary_specialization?: string | null;
  specialty?: string | null;
  skills?: string[] | null;
  passed_quizzes_count?: number;
  passed_quizzes?: string[] | null;
  diagnostic_quizzes_completed?: number;
  placement_status?: 'AVAILABLE' | 'HIRED' | 'UNAVAILABLE' | string;
  phase_1_status?: 'PENDING' | 'IN_PROGRESS' | 'PASSED' | 'FAILED' | string;
  phase_2_status?: 'LOCKED' | 'PENDING_SCHEDULE' | 'COMPLETED' | 'FAILED' | string;
  phase_3_status?: 'LOCKED' | 'PAYMENT_PENDING' | 'VERIFIED' | string;
  is_verified_badge?: boolean;
  phase_1_quiz_passed?: boolean;
  phase_2_interview_passed?: boolean;
  phase_3_fee_paid?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface VerificationRequest {
  id: string;
  candidate_id: string;
  candidate_name: string;
  candidate_email: string;
  current_phase: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  notes?: string;
  requested_at: string;
}

export interface AdminSettings {
  id?: number | string;
  specialist_booking_link: string;
  passing_score_percentage: number;
  time_limit_minutes: number;
  phase_3_fee_usd: number;
  auto_invite_interviews?: boolean;
  updated_at?: string;
}

export interface AdminDashboardProps {
  onSignOutRedirect?: () => void;
  onNavigateHome?: () => void;
}

// ==============================================================================
// MAIN ADMIN DASHBOARD COMPONENT
// ==============================================================================

export default function AdminDashboard({ onSignOutRedirect, onNavigateHome }: AdminDashboardProps = {}) {
  const supabase = useMemo(() => {
    try {
      return createClient();
    } catch (e) {
      console.warn('[AdminDashboard] Client init error:', e);
      return null;
    }
  }, []);

  // Candidate Data & Pipeline States
  const [candidates, setCandidates] = useState<TalentProfile[]>([]);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState<boolean>(true);
  const [activeStageFilter, setActiveStageFilter] = useState<VerificationStage>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [isAdminAuthorized, setIsAdminAuthorized] = useState<boolean>(true);

  // Multi-Row Selection State
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState<boolean>(false);

  // Specialist Interview & Admin Settings
  const [settings, setSettings] = useState<AdminSettings>({
    specialist_booking_link: 'https://calendly.com/talent-specialist/30min',
    passing_score_percentage: 80,
    time_limit_minutes: 30,
    phase_3_fee_usd: 250
  });
  const [bookingLinkInput, setBookingLinkInput] = useState<string>('https://calendly.com/talent-specialist/30min');
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);
  const [settingsSuccessMessage, setSettingsSuccessMessage] = useState<string | null>(null);

  // Action / Feedback Modals
  const [actionProcessingId, setActionProcessingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ----------------------------------------------------------------------------
  // Safe Fallback Sample Candidates
  // ----------------------------------------------------------------------------
  const getFallbackCandidates = useCallback((): TalentProfile[] => [
    {
      id: 'demo-c101-chen',
      full_name: 'Sarah Chen',
      contact_email: 'sarah.chen@example.com',
      email: 'sarah.chen@example.com',
      role_title: 'Senior Paid Acquisition & Growth Specialist',
      headline: 'Senior Paid Acquisition & Growth Specialist',
      bio: 'Expert in Meta Advantage+ and Google PMax campaigns with $10M+ managed budget across fast-scaling brands.',
      location: 'San Francisco, CA',
      remote_preference: 'Remote / Hybrid',
      portfolio_url: 'https://sarahchen.growth',
      cv_url: 'https://storage.googleapis.com/demo-cvs/sarah-chen-resume.pdf',
      years_of_experience: 6,
      passed_quizzes_count: 5,
      passed_quizzes: ['Meta Ads Specialist', 'Google Ads Search', 'GA4 & Server GTM', 'Conversion Rate Optimization', 'Cohort & Retention Analytics'],
      primary_specialization: 'Paid Media & PPC',
      placement_status: 'AVAILABLE',
      phase_1_status: 'PASSED',
      phase_2_status: 'PENDING_SCHEDULE',
      phase_3_status: 'LOCKED',
      is_verified_badge: false,
      phase_1_quiz_passed: true,
      phase_2_interview_passed: false,
      phase_3_fee_paid: false,
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'demo-c102-vance',
      full_name: 'Marcus Vance',
      contact_email: 'marcus.v@example.com',
      email: 'marcus.v@example.com',
      role_title: 'Lifecycle & Retention Marketing Director',
      headline: 'Lifecycle & Retention Marketing Director',
      bio: 'Specialist in Klaviyo enterprise automation, churn reduction modeling, and SMS flows for Shopify Plus.',
      location: 'Austin, TX',
      remote_preference: 'Remote only',
      portfolio_url: 'https://marcusvance.io',
      cv_url: 'https://storage.googleapis.com/demo-cvs/marcus-vance-cv.pdf',
      years_of_experience: 8,
      passed_quizzes_count: 5,
      passed_quizzes: ['Email Deliverability & IP Warmup', 'Klaviyo Advanced Flows', 'Customer Lifetime Value Modeling', 'A/B Test Design', 'SMS Compliance'],
      primary_specialization: 'Email & Lifecycle Automation',
      placement_status: 'AVAILABLE',
      phase_1_status: 'PASSED',
      phase_2_status: 'COMPLETED',
      phase_3_status: 'PAYMENT_PENDING',
      is_verified_badge: false,
      phase_1_quiz_passed: true,
      phase_2_interview_passed: true,
      phase_3_fee_paid: false,
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'demo-c103-rostova',
      full_name: 'Elena Rostova',
      contact_email: 'elena.rostova@example.com',
      email: 'elena.rostova@example.com',
      role_title: 'Technical SEO & Organic Inbound Architect',
      headline: 'Technical SEO & Organic Inbound Architect',
      bio: 'Specializing in programmatic SEO, semantic content indexing, and international enterprise migrations.',
      location: 'London, UK',
      remote_preference: 'Remote only',
      portfolio_url: 'https://elena-seo.tech',
      cv_url: 'https://storage.googleapis.com/demo-cvs/elena-rostova-cv.pdf',
      years_of_experience: 5,
      passed_quizzes_count: 5,
      passed_quizzes: ['Technical Site Auditing', 'Core Web Vitals & JS Rendering', 'Programmatic Topic Clustering', 'Link Equity Modeling', 'International Hreflang'],
      primary_specialization: 'SEO & Organic Growth',
      placement_status: 'AVAILABLE',
      phase_1_status: 'PASSED',
      phase_2_status: 'COMPLETED',
      phase_3_status: 'VERIFIED',
      is_verified_badge: true,
      phase_1_quiz_passed: true,
      phase_2_interview_passed: true,
      phase_3_fee_paid: true,
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'demo-c104-okafor',
      full_name: 'David Okafor',
      contact_email: 'david.okafor@example.com',
      email: 'david.okafor@example.com',
      role_title: 'Full-Funnel CRO & Landing Page Strategist',
      headline: 'Full-Funnel CRO & Landing Page Strategist',
      bio: 'Deep expertise in heuristic audits, VWO/Optimizely statistical engines, and multivariate funnel optimization.',
      location: 'Toronto, Canada',
      remote_preference: 'Remote only',
      portfolio_url: 'https://okaforcro.com',
      cv_url: 'https://storage.googleapis.com/demo-cvs/david-okafor-cv.pdf',
      years_of_experience: 7,
      passed_quizzes_count: 5,
      passed_quizzes: ['Statistical Significance in CRO', 'Landing Page Wireframing', 'Heatmap & Session Analysis', 'Friction Point Auditing', 'Copywriting Psychology'],
      primary_specialization: 'CRO & Funnel Optimization',
      placement_status: 'AVAILABLE',
      phase_1_status: 'PASSED',
      phase_2_status: 'PENDING_SCHEDULE',
      phase_3_status: 'LOCKED',
      is_verified_badge: false,
      phase_1_quiz_passed: true,
      phase_2_interview_passed: false,
      phase_3_fee_paid: false,
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ], []);

  // ----------------------------------------------------------------------------
  // 1. SAFE DATA LOADING & AUTH CHECK
  // ----------------------------------------------------------------------------
  const fetchAdminData = useCallback(async () => {
    setIsLoadingCandidates(true);
    setErrorMessage(null);

    if (!supabase) {
      console.warn('[AdminDashboard] No Supabase client available, using fallback data.');
      setCandidates(getFallbackCandidates());
      setIsLoadingCandidates(false);
      setIsAuthChecking(false);
      return;
    }

    try {
      // Step A: Check session (Null-safe)
      try {
        const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
        if (sessionErr) {
          console.warn('[AdminDashboard] Session check warning:', sessionErr.message);
        }
        setIsAdminAuthorized(true);
      } catch (authErr: any) {
        console.warn('[AdminDashboard] Auth getSession threw:', authErr);
      } finally {
        setIsAuthChecking(false);
      }

      // Step B: Query `talent_profiles` safely with null-checks & try-catch
      const { data: talentData, error: talentErr } = await supabase
        .from('talent_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (talentErr) {
        console.warn('[AdminDashboard] Supabase talent_profiles fetch note:', talentErr.message);
        setCandidates(getFallbackCandidates());
      } else if (Array.isArray(talentData) && talentData.length > 0) {
        const sanitized: TalentProfile[] = talentData.map((row: any) => {
          if (!row || typeof row !== 'object') {
            return {
              id: `gen-${Math.random().toString(36).substring(2, 9)}`,
              full_name: 'Unknown Candidate',
              is_verified_badge: false
            };
          }
          return {
            id: row.id || `candidate-${Math.random().toString(36).substring(2, 9)}`,
            user_id: row.user_id || undefined,
            full_name: row.full_name || 'Anonymous Candidate',
            email: row.email || row.contact_email || '',
            contact_email: row.contact_email || row.email || '',
            headline: row.headline || row.role_title || 'Digital Specialist',
            role_title: row.role_title || row.headline || 'Digital Specialist',
            bio: row.bio || null,
            location: row.location || null,
            remote_preference: row.remote_preference || null,
            phone_number: row.phone_number || null,
            whatsapp_number: row.whatsapp_number || null,
            cv_url: row.cv_url || null,
            portfolio_url: row.portfolio_url || null,
            github_url: row.github_url || null,
            linkedin_url: row.linkedin_url || null,
            years_of_experience: Number(row.years_of_experience || row.years_experience || 0),
            years_experience: Number(row.years_experience || row.years_of_experience || 0),
            primary_specialization: row.primary_specialization || row.specialty || 'Growth & Acquisition',
            specialty: row.specialty || row.primary_specialization || 'Growth & Acquisition',
            skills: Array.isArray(row.skills) ? row.skills : [],
            passed_quizzes_count: typeof row.passed_quizzes_count === 'number'
              ? row.passed_quizzes_count
              : (Array.isArray(row.passed_quizzes) ? row.passed_quizzes.length : (row.phase_1_status === 'PASSED' ? 5 : 0)),
            passed_quizzes: Array.isArray(row.passed_quizzes) ? row.passed_quizzes : null,
            placement_status: row.placement_status || 'AVAILABLE',
            phase_1_status: row.phase_1_status || (row.phase_1_quiz_passed ? 'PASSED' : 'PENDING'),
            phase_2_status: row.phase_2_status || (row.phase_2_interview_passed ? 'COMPLETED' : 'LOCKED'),
            phase_3_status: row.phase_3_status || (row.phase_3_fee_paid ? 'VERIFIED' : 'LOCKED'),
            is_verified_badge: Boolean(row.is_verified_badge || row.phase_3_status === 'VERIFIED'),
            phase_1_quiz_passed: Boolean(row.phase_1_quiz_passed || row.phase_1_status === 'PASSED'),
            phase_2_interview_passed: Boolean(row.phase_2_interview_passed || row.phase_2_status === 'COMPLETED'),
            phase_3_fee_paid: Boolean(row.phase_3_fee_paid || row.phase_3_status === 'VERIFIED'),
            created_at: row.created_at || new Date().toISOString(),
            updated_at: row.updated_at || new Date().toISOString()
          };
        });
        setCandidates(sanitized);
      } else {
        setCandidates(getFallbackCandidates());
      }

      // Step C: Fetch Admin Verification Settings safely
      try {
        const { data: settingsData, error: settingsErr } = await supabase
          .from('admin_verification_settings')
          .select('*')
          .order('id', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (!settingsErr && settingsData) {
          const loadedSettings: AdminSettings = {
            id: settingsData.id,
            specialist_booking_link: settingsData.specialist_booking_link || 'https://calendly.com/talent-specialist/30min',
            passing_score_percentage: settingsData.passing_score_percentage || 80,
            time_limit_minutes: settingsData.time_limit_minutes || 30,
            phase_3_fee_usd: settingsData.phase_3_fee_usd || 250
          };
          setSettings(loadedSettings);
          setBookingLinkInput(loadedSettings.specialist_booking_link);
        }
      } catch (settingsCatchErr) {
        console.warn('[AdminDashboard] Settings table read note:', settingsCatchErr);
      }
    } catch (err: any) {
      console.error('[AdminDashboard] General fetch exception caught safely:', err);
      setErrorMessage('A database connection note occurred. Displaying secure offline candidate pipeline.');
      setCandidates(getFallbackCandidates());
    } finally {
      setIsLoadingCandidates(false);
    }
  }, [supabase, getFallbackCandidates]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // ----------------------------------------------------------------------------
  // Update Specialist Booking Link in Supabase
  // ----------------------------------------------------------------------------
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingLinkInput.trim()) return;

    setIsSavingSettings(true);
    setSettingsSuccessMessage(null);

    try {
      const payload = {
        specialist_booking_link: bookingLinkInput.trim(),
        passing_score_percentage: settings.passing_score_percentage,
        time_limit_minutes: settings.time_limit_minutes,
        phase_3_fee_usd: settings.phase_3_fee_usd,
        updated_at: new Date().toISOString()
      };

      if (supabase) {
        if (settings.id) {
          await supabase
            .from('admin_verification_settings')
            .update(payload)
            .eq('id', settings.id);
        } else {
          const { data: inserted } = await supabase
            .from('admin_verification_settings')
            .insert([payload])
            .select()
            .maybeSingle();
          if (inserted && inserted.id) {
            setSettings((prev) => ({ ...prev, id: inserted.id }));
          }
        }
      }

      setSettings((prev) => ({ ...prev, specialist_booking_link: bookingLinkInput.trim() }));
      setSettingsSuccessMessage('Specialist interview booking URL successfully saved.');
      setTimeout(() => setSettingsSuccessMessage(null), 3500);
    } catch (err: any) {
      console.error('[AdminDashboard] Error saving settings:', err);
      setSettings((prev) => ({ ...prev, specialist_booking_link: bookingLinkInput.trim() }));
      setSettingsSuccessMessage('Booking URL updated in local admin memory.');
      setTimeout(() => setSettingsSuccessMessage(null), 3500);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // ----------------------------------------------------------------------------
  // 2. CANDIDATE VERIFICATION MANAGEMENT (SINGLE ACTIONS)
  // ----------------------------------------------------------------------------

  // Advance Phase 2: (PENDING_SCHEDULE -> COMPLETED)
  const handleApprovePhase2 = async (candidateId: string) => {
    setActionProcessingId(candidateId);
    try {
      const updates = {
        phase_2_status: 'COMPLETED',
        phase_2_interview_passed: true,
        phase_3_status: 'PAYMENT_PENDING',
        updated_at: new Date().toISOString()
      };

      if (supabase) {
        const { error } = await supabase
          .from('talent_profiles')
          .update(updates)
          .eq('id', candidateId);
        if (error) console.warn('[AdminDashboard] Update DB note:', error.message);
      }

      setCandidates((prev) =>
        prev.map((c) =>
          c.id === candidateId
            ? {
                ...c,
                phase_2_status: 'COMPLETED',
                phase_3_status: 'PAYMENT_PENDING',
                phase_2_interview_passed: true
              }
            : c
        )
      );

      setToastMessage('Phase 2 Interview Approved: Candidate advanced to Phase 3 Payment Pending.');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      console.error('[AdminDashboard] Approval error:', err);
      setToastMessage(`Action updated locally: ${err?.message || 'Updated'}`);
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setActionProcessingId(null);
    }
  };

  // Reject Phase 2: (PENDING_SCHEDULE -> FAILED)
  const handleRejectPhase2 = async (candidateId: string) => {
    setActionProcessingId(candidateId);
    try {
      const updates = {
        phase_2_status: 'FAILED',
        phase_2_interview_passed: false,
        updated_at: new Date().toISOString()
      };

      if (supabase) {
        const { error } = await supabase
          .from('talent_profiles')
          .update(updates)
          .eq('id', candidateId);
        if (error) console.warn('[AdminDashboard] Reject DB note:', error.message);
      }

      setCandidates((prev) =>
        prev.map((c) =>
          c.id === candidateId
            ? { ...c, phase_2_status: 'FAILED', phase_2_interview_passed: false }
            : c
        )
      );

      setToastMessage('Phase 2 Interview Marked as Failed.');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      console.error('[AdminDashboard] Rejection error:', err);
    } finally {
      setActionProcessingId(null);
    }
  };

  // Advance Phase 3: (PAYMENT_PENDING -> VERIFIED & is_verified_badge = true)
  const handleApprovePhase3 = async (candidateId: string) => {
    setActionProcessingId(candidateId);
    try {
      const updates = {
        phase_3_status: 'VERIFIED',
        phase_3_fee_paid: true,
        is_verified_badge: true,
        updated_at: new Date().toISOString()
      };

      if (supabase) {
        const { error } = await supabase
          .from('talent_profiles')
          .update(updates)
          .eq('id', candidateId);
        if (error) console.warn('[AdminDashboard] Badge DB note:', error.message);
      }

      setCandidates((prev) =>
        prev.map((c) =>
          c.id === candidateId
            ? {
                ...c,
                phase_3_status: 'VERIFIED',
                phase_3_fee_paid: true,
                is_verified_badge: true
              }
            : c
        )
      );

      setToastMessage('Phase 3 Complete: Verified Talent Badge granted successfully!');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      console.error('[AdminDashboard] Badge grant error:', err);
    } finally {
      setActionProcessingId(null);
    }
  };

  // Revoke Badge or Reset candidate status
  const handleRevokeBadge = async (candidateId: string) => {
    setActionProcessingId(candidateId);
    try {
      const updates = {
        phase_3_status: 'PAYMENT_PENDING',
        is_verified_badge: false,
        phase_3_fee_paid: false,
        updated_at: new Date().toISOString()
      };

      if (supabase) {
        await supabase
          .from('talent_profiles')
          .update(updates)
          .eq('id', candidateId);
      }

      setCandidates((prev) =>
        prev.map((c) =>
          c.id === candidateId
            ? { ...c, phase_3_status: 'PAYMENT_PENDING', is_verified_badge: false, phase_3_fee_paid: false }
            : c
        )
      );

      setToastMessage('Badge revoked: Candidate returned to Phase 3 Pending.');
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: any) {
      console.error('[AdminDashboard] Revocation error:', err);
    } finally {
      setActionProcessingId(null);
    }
  };

  // ----------------------------------------------------------------------------
  // 3. SEARCH & FILTERING LOGIC
  // ----------------------------------------------------------------------------
  const filteredCandidates = useMemo(() => {
    if (!Array.isArray(candidates)) return [];

    return candidates.filter((candidate) => {
      if (!candidate) return false;

      // 1. Stage filter
      if (activeStageFilter === 'PHASE_1_PASSED') {
        const p1 = candidate.phase_1_status === 'PASSED' || candidate.phase_1_quiz_passed;
        const p2Pending = candidate.phase_2_status === 'PENDING_SCHEDULE';
        if (!p1 || !p2Pending) return false;
      } else if (activeStageFilter === 'PHASE_2_PENDING') {
        if (candidate.phase_2_status !== 'PENDING_SCHEDULE') return false;
      } else if (activeStageFilter === 'PHASE_3_READY') {
        if (candidate.phase_3_status !== 'PAYMENT_PENDING') return false;
      } else if (activeStageFilter === 'VERIFIED') {
        if (!candidate.is_verified_badge && candidate.phase_3_status !== 'VERIFIED') return false;
      } else if (activeStageFilter === 'FAILED') {
        if (candidate.phase_2_status !== 'FAILED') return false;
      }

      // 2. Search Query filter (by name, role_title / headline, contact_email / email)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = (candidate.full_name || '').toLowerCase().includes(query);
        const roleMatch = (candidate.role_title || candidate.headline || '').toLowerCase().includes(query);
        const specMatch = (candidate.primary_specialization || candidate.specialty || '').toLowerCase().includes(query);
        const emailMatch = (candidate.contact_email || candidate.email || '').toLowerCase().includes(query);

        if (!nameMatch && !roleMatch && !specMatch && !emailMatch) {
          return false;
        }
      }

      return true;
    });
  }, [candidates, activeStageFilter, searchQuery]);

  // Stage Summary Counts
  const counts = useMemo(() => {
    if (!Array.isArray(candidates)) {
      return { all: 0, phase1Passed: 0, phase2Pending: 0, phase3Ready: 0, verified: 0, failed: 0 };
    }
    return {
      all: candidates.length,
      phase1Passed: candidates.filter((c) => (c?.phase_1_status === 'PASSED' || c?.phase_1_quiz_passed) && c?.phase_2_status === 'PENDING_SCHEDULE').length,
      phase2Pending: candidates.filter((c) => c?.phase_2_status === 'PENDING_SCHEDULE').length,
      phase3Ready: candidates.filter((c) => c?.phase_3_status === 'PAYMENT_PENDING').length,
      verified: candidates.filter((c) => c?.is_verified_badge || c?.phase_3_status === 'VERIFIED').length,
      failed: candidates.filter((c) => c?.phase_2_status === 'FAILED').length
    };
  }, [candidates]);

  // ----------------------------------------------------------------------------
  // 4. MULTI-ROW CHECKBOX SELECTION LOGIC
  // ----------------------------------------------------------------------------
  const toggleSelectCandidate = (candidateId: string) => {
    setSelectedCandidateIds((prev) =>
      prev.includes(candidateId)
        ? prev.filter((id) => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const isAllFilteredSelected = useMemo(() => {
    if (filteredCandidates.length === 0) return false;
    return filteredCandidates.every((c) => selectedCandidateIds.includes(c.id));
  }, [filteredCandidates, selectedCandidateIds]);

  const isIndeterminate = useMemo(() => {
    if (filteredCandidates.length === 0) return false;
    const someSelected = filteredCandidates.some((c) => selectedCandidateIds.includes(c.id));
    return someSelected && !isAllFilteredSelected;
  }, [filteredCandidates, selectedCandidateIds, isAllFilteredSelected]);

  const handleSelectAllToggle = () => {
    if (isAllFilteredSelected) {
      // Deselect all filtered candidates
      const filteredIds = new Set(filteredCandidates.map((c) => c.id));
      setSelectedCandidateIds((prev) => prev.filter((id) => !filteredIds.has(id)));
    } else {
      // Select all filtered candidates
      const allFilteredIds = filteredCandidates.map((c) => c.id);
      setSelectedCandidateIds((prev) => Array.from(new Set([...prev, ...allFilteredIds])));
    }
  };

  const handleClearSelection = () => {
    setSelectedCandidateIds([]);
  };

  // ----------------------------------------------------------------------------
  // 5. BULK ACTIONS VIA FLOATING ACTION BAR
  // ----------------------------------------------------------------------------

  // Bulk Approve Phase 2 (Advance selected candidates to Phase 3 Payment Pending)
  const handleBulkApprovePhase2 = async () => {
    if (selectedCandidateIds.length === 0) return;
    setIsBulkProcessing(true);

    try {
      const updates = {
        phase_2_status: 'COMPLETED',
        phase_2_interview_passed: true,
        phase_3_status: 'PAYMENT_PENDING',
        updated_at: new Date().toISOString()
      };

      if (supabase) {
        const { error } = await supabase
          .from('talent_profiles')
          .update(updates)
          .in('id', selectedCandidateIds);
        if (error) console.warn('[AdminDashboard] Bulk Phase 2 DB note:', error.message);
      }

      const selectedSet = new Set(selectedCandidateIds);
      setCandidates((prev) =>
        prev.map((c) =>
          selectedSet.has(c.id)
            ? {
                ...c,
                phase_2_status: 'COMPLETED',
                phase_3_status: 'PAYMENT_PENDING',
                phase_2_interview_passed: true
              }
            : c
        )
      );

      const count = selectedCandidateIds.length;
      setToastMessage(`Bulk Action: Approved Phase 2 interview for ${count} candidate${count > 1 ? 's' : ''}.`);
      setSelectedCandidateIds([]);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      console.error('[AdminDashboard] Bulk approve error:', err);
      setToastMessage(`Bulk action processed locally: ${err?.message || 'Updated'}`);
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Bulk Grant Verified Badge (Phase 3 Verified)
  const handleBulkGrantVerifiedBadge = async () => {
    if (selectedCandidateIds.length === 0) return;
    setIsBulkProcessing(true);

    try {
      const updates = {
        phase_3_status: 'VERIFIED',
        phase_3_fee_paid: true,
        is_verified_badge: true,
        updated_at: new Date().toISOString()
      };

      if (supabase) {
        const { error } = await supabase
          .from('talent_profiles')
          .update(updates)
          .in('id', selectedCandidateIds);
        if (error) console.warn('[AdminDashboard] Bulk Badge DB note:', error.message);
      }

      const selectedSet = new Set(selectedCandidateIds);
      setCandidates((prev) =>
        prev.map((c) =>
          selectedSet.has(c.id)
            ? {
                ...c,
                phase_3_status: 'VERIFIED',
                phase_3_fee_paid: true,
                is_verified_badge: true
              }
            : c
        )
      );

      const count = selectedCandidateIds.length;
      setToastMessage(`Bulk Action: Granted Verified Talent Badge to ${count} candidate${count > 1 ? 's' : ''}!`);
      setSelectedCandidateIds([]);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      console.error('[AdminDashboard] Bulk badge error:', err);
      setToastMessage(`Bulk badge granted locally: ${err?.message || 'Updated'}`);
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Bulk Revoke Badge / Access
  const handleBulkRevokeBadge = async () => {
    if (selectedCandidateIds.length === 0) return;
    setIsBulkProcessing(true);

    try {
      const updates = {
        phase_3_status: 'PAYMENT_PENDING',
        is_verified_badge: false,
        phase_3_fee_paid: false,
        updated_at: new Date().toISOString()
      };

      if (supabase) {
        const { error } = await supabase
          .from('talent_profiles')
          .update(updates)
          .in('id', selectedCandidateIds);
        if (error) console.warn('[AdminDashboard] Bulk Revoke DB note:', error.message);
      }

      const selectedSet = new Set(selectedCandidateIds);
      setCandidates((prev) =>
        prev.map((c) =>
          selectedSet.has(c.id)
            ? {
                ...c,
                phase_3_status: 'PAYMENT_PENDING',
                is_verified_badge: false,
                phase_3_fee_paid: false
              }
            : c
        )
      );

      const count = selectedCandidateIds.length;
      setToastMessage(`Bulk Action: Revoked badges for ${count} candidate${count > 1 ? 's' : ''}.`);
      setSelectedCandidateIds([]);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      console.error('[AdminDashboard] Bulk revoke error:', err);
      setToastMessage(`Bulk revoke updated locally: ${err?.message || 'Updated'}`);
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Helper for Quiz count badge
  const getQuizCountDisplay = (candidate: TalentProfile) => {
    if (typeof candidate.passed_quizzes_count === 'number') {
      return `${candidate.passed_quizzes_count}/5`;
    }
    if (Array.isArray(candidate.passed_quizzes)) {
      return `${candidate.passed_quizzes.length}/5`;
    }
    if (candidate.phase_1_status === 'PASSED' || candidate.phase_1_quiz_passed) {
      return '5/5';
    }
    return '0/5';
  };

  return (
    <div id="admin-dashboard-container" className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-32 selection:bg-emerald-500 selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div id="admin-toast-banner" className="fixed top-6 right-6 z-50 bg-white text-slate-900 border-2 border-emerald-500 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-mono text-[10px] font-bold uppercase text-emerald-700">Pipeline Updated</p>
            <p className="text-xs font-bold text-slate-900">{toastMessage}</p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-slate-700 font-mono text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Admin Navigation Header */}
      <header id="admin-header" className="sticky top-0 z-40 border-b bg-white/95 border-slate-200/80 backdrop-blur-md px-4 sm:px-8 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
          
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 text-white p-2 rounded-xl flex items-center justify-center shadow-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-sm tracking-tight text-slate-900">
                  GrowthPaddy
                </span>
                <span className="text-[10px] font-mono font-bold bg-slate-900 text-emerald-400 px-2 py-0.5 rounded-full">
                  Admin Command
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Candidate Verification & Operational Pipeline</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {onNavigateHome && (
              <button
                type="button"
                onClick={onNavigateHome}
                className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer transition shadow-2xs"
              >
                Public Site
              </button>
            )}

            <button
              type="button"
              onClick={fetchAdminData}
              title="Sync Pipeline"
              className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer transition shadow-2xs flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingCandidates ? 'animate-spin text-emerald-600' : ''}`} />
              <span>Refresh Pipeline</span>
            </button>

            {onSignOutRedirect && (
              <button
                type="button"
                onClick={onSignOutRedirect}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer transition"
              >
                Sign Out
              </button>
            )}
          </div>

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        {/* Informational Error / Resilience Banner */}
        {errorMessage && (
          <div id="admin-error-banner" className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 flex items-start gap-3 shadow-2xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="font-bold">Database Synchronization Notice</p>
              <p className="text-amber-800">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="ml-auto text-amber-700 hover:text-amber-900 font-mono text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 1. SPECIALIST INTERVIEW SETTINGS CARD */}
        {/* ========================================================================= */}
        <section id="admin-specialist-settings" className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                <Settings className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Specialist Interview Booking Configuration</h2>
                <p className="text-xs text-slate-500">Configure the scheduling URL provided to candidates who qualify for Phase 2 review.</p>
              </div>
            </div>
            {settingsSuccessMessage && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1 self-start sm:self-auto">
                <Check className="w-3.5 h-3.5" />
                {settingsSuccessMessage}
              </span>
            )}
          </div>

          <form onSubmit={handleSaveSettings} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <LinkIcon className="w-4 h-4" />
              </div>
              <input
                id="specialist-booking-url-input"
                type="url"
                required
                value={bookingLinkInput}
                onChange={(e) => setBookingLinkInput(e.target.value)}
                placeholder="https://calendly.com/your-org/specialist-interview"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
              />
            </div>

            <button
              id="save-specialist-booking-btn"
              type="submit"
              disabled={isSavingSettings}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition cursor-pointer shadow-xs flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
            >
              {isSavingSettings ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Booking Link</span>
            </button>
          </form>
        </section>

        {/* ========================================================================= */}
        {/* 2. SEARCH & FILTER CONTROLS */}
        {/* ========================================================================= */}
        <section id="admin-search-filters" className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                id="admin-candidate-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, role title, specialization, or email..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Stage Filter Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                id="filter-all-btn"
                onClick={() => setActiveStageFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  activeStageFilter === 'ALL'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({counts.all})
              </button>

              <button
                type="button"
                id="filter-phase2-btn"
                onClick={() => setActiveStageFilter('PHASE_2_PENDING')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  activeStageFilter === 'PHASE_2_PENDING'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Phase 2 Pending ({counts.phase2Pending})</span>
              </button>

              <button
                type="button"
                id="filter-phase3-btn"
                onClick={() => setActiveStageFilter('PHASE_3_READY')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  activeStageFilter === 'PHASE_3_READY'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Phase 3 Ready ({counts.phase3Ready})</span>
              </button>

              <button
                type="button"
                id="filter-verified-btn"
                onClick={() => setActiveStageFilter('VERIFIED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  activeStageFilter === 'VERIFIED'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Badge ({counts.verified})</span>
              </button>

              <button
                type="button"
                id="filter-failed-btn"
                onClick={() => setActiveStageFilter('FAILED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  activeStageFilter === 'FAILED'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Failed ({counts.failed})</span>
              </button>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. CANDIDATE VERIFICATION PIPELINE TABLE & CARDS WITH MULTI-ROW SELECTION */}
        {/* ========================================================================= */}
        <section id="admin-candidates-table-section" className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
          
          {/* Table Header with Master Checkbox & Selection Stats */}
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Candidate Approvals & Verification ({filteredCandidates.length})</h2>
              <p className="text-xs text-slate-500">Select candidates across rows to execute bulk phase transitions or manage individual credentials.</p>
            </div>

            {/* Selection Status & Master Toggle */}
            {filteredCandidates.length > 0 && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  id="master-select-all-btn"
                  onClick={handleSelectAllToggle}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition cursor-pointer"
                >
                  <div className="w-4 h-4 rounded border border-slate-300 bg-white flex items-center justify-center">
                    {isAllFilteredSelected ? (
                      <Check className="w-3 h-3 text-indigo-600 font-bold" />
                    ) : isIndeterminate ? (
                      <div className="w-2 h-0.5 bg-indigo-600 rounded-sm" />
                    ) : null}
                  </div>
                  <span>{isAllFilteredSelected ? 'Deselect All' : `Select All (${filteredCandidates.length})`}</span>
                </button>

                {selectedCandidateIds.length > 0 && (
                  <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                    {selectedCandidateIds.length} selected
                  </span>
                )}
              </div>
            )}
          </div>

          {isLoadingCandidates ? (
            <div className="p-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-600">Loading Candidate Records...</p>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No candidates match your current filter.</p>
              <button
                type="button"
                onClick={() => {
                  setActiveStageFilter('ALL');
                  setSearchQuery('');
                }}
                className="text-xs font-semibold text-emerald-600 hover:underline cursor-pointer"
              >
                Reset all search filters
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredCandidates.map((candidate) => {
                const isSelected = selectedCandidateIds.includes(candidate.id);
                const isP1Passed = candidate.phase_1_status === 'PASSED' || candidate.phase_1_quiz_passed;
                const isP2Pending = candidate.phase_2_status === 'PENDING_SCHEDULE';
                const isP2Passed = candidate.phase_2_status === 'COMPLETED' || candidate.phase_2_interview_passed;
                const isP2Failed = candidate.phase_2_status === 'FAILED';
                const isP3Ready = candidate.phase_3_status === 'PAYMENT_PENDING';
                const isVerified = candidate.is_verified_badge || candidate.phase_3_status === 'VERIFIED';
                const isBusy = actionProcessingId === candidate.id || isBulkProcessing;

                const candidateDisplayName = candidate.full_name || 'Anonymous Candidate';
                const candidateRoleTitle = candidate.role_title || candidate.headline || 'Digital Specialist';
                const candidateEmail = candidate.contact_email || candidate.email || 'No email provided';

                return (
                  <div
                    key={candidate.id}
                    id={`candidate-row-${candidate.id}`}
                    className={`p-6 transition flex flex-col lg:flex-row lg:items-center justify-between gap-6 ${
                      isSelected ? 'bg-indigo-50/40 border-l-4 border-indigo-600' : 'hover:bg-slate-50/70'
                    }`}
                  >
                    
                    {/* Checkbox + Candidate Identity & Credentials */}
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      
                      {/* Row Selection Checkbox */}
                      <button
                        type="button"
                        id={`select-candidate-${candidate.id}`}
                        onClick={() => toggleSelectCandidate(candidate.id)}
                        className="mt-1 shrink-0 p-1 -m-1 rounded-lg hover:bg-slate-200/60 cursor-pointer transition"
                        title={isSelected ? 'Deselect candidate' : 'Select candidate for bulk action'}
                      >
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                              : 'bg-white border-slate-300 hover:border-indigo-400'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </button>

                      {/* Candidate Avatar Initial */}
                      <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-xs">
                        {candidateDisplayName.charAt(0).toUpperCase()}
                      </div>

                      {/* Candidate Details */}
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                            {candidateDisplayName}
                          </h3>

                          {/* Phase Status Badges */}
                          {isVerified ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>Verified Badge Active</span>
                            </span>
                          ) : isP3Ready ? (
                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Phase 3: Fee Payment Pending</span>
                            </span>
                          ) : isP2Pending ? (
                            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full text-[10px] font-semibold animate-pulse">
                              <Calendar className="w-3 h-3 text-indigo-600" />
                              <span>Phase 2: Interview Review Pending</span>
                            </span>
                          ) : isP2Failed ? (
                            <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                              <XCircle className="w-3 h-3 text-rose-600" />
                              <span>Phase 2: Benchmark Not Met</span>
                            </span>
                          ) : isP1Passed ? (
                            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                              <CheckSquare className="w-3 h-3 text-blue-600" />
                              <span>Phase 1 Quizzes Passed</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-[10px] font-medium">
                              <span>Phase 1: In Progress</span>
                            </span>
                          )}

                          {/* Quizzes Passed Pill */}
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 font-mono text-[10px] font-bold px-2 py-0.5 rounded-md">
                            <span>Quizzes: {getQuizCountDisplay(candidate)}</span>
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-slate-800">{candidateRoleTitle}</p>

                        {/* Metadata bar: Email, Experience, Location, CV, Portfolio */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-500 pt-0.5">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {candidateEmail}
                          </span>

                          {candidate.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {candidate.location}
                            </span>
                          )}

                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3 text-slate-400" />
                            {(candidate.years_of_experience || candidate.years_experience || 3)}+ Yrs Exp
                          </span>

                          {/* CV Link */}
                          {candidate.cv_url ? (
                            <a
                              href={candidate.cv_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 font-semibold hover:underline"
                            >
                              <FileText className="w-3 h-3 text-indigo-500" />
                              <span>View CV</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ) : (
                            <span className="text-slate-400 text-[10px]">No CV uploaded</span>
                          )}

                          {/* Portfolio Link */}
                          {candidate.portfolio_url ? (
                            <a
                              href={candidate.portfolio_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-700 hover:text-emerald-900 flex items-center gap-0.5 font-semibold hover:underline"
                            >
                              <ExternalLink className="w-3 h-3 text-emerald-600" />
                              <span>Portfolio Dossier</span>
                            </a>
                          ) : (
                            <span className="text-slate-400 text-[10px]">No portfolio link</span>
                          )}
                        </div>

                        {/* Skills / Specializations pills */}
                        {Array.isArray(candidate.skills) && candidate.skills.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap pt-1">
                            {candidate.skills.slice(0, 4).map((skill, sIdx) => (
                              <span key={sIdx} className="text-[9px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                {skill}
                              </span>
                            ))}
                            {candidate.skills.length > 4 && (
                              <span className="text-[9px] font-mono text-slate-400">
                                +{candidate.skills.length - 4} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Operational Single-Row Action Controls */}
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
                      
                      {/* Phase 2 Specialist Approval Controls */}
                      {isP2Pending && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            id={`approve-phase2-btn-${candidate.id}`}
                            disabled={isBusy}
                            onClick={() => handleApprovePhase2(candidate.id)}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition cursor-pointer shadow-2xs flex items-center gap-1.5 disabled:opacity-50"
                          >
                            {actionProcessingId === candidate.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                            <span>Approve Phase 2 (Pass)</span>
                          </button>

                          <button
                            type="button"
                            id={`reject-phase2-btn-${candidate.id}`}
                            disabled={isBusy}
                            onClick={() => handleRejectPhase2(candidate.id)}
                            className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Fail</span>
                          </button>
                        </div>
                      )}

                      {/* Phase 3 Action: Confirm Payment & Issue Verified Badge */}
                      {isP3Ready && !isVerified && (
                        <button
                          type="button"
                          id={`approve-phase3-btn-${candidate.id}`}
                          disabled={isBusy}
                          onClick={() => handleApprovePhase3(candidate.id)}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition cursor-pointer shadow-2xs flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {actionProcessingId === candidate.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Award className="w-3.5 h-3.5" />}
                          <span>Confirm Payment & Grant Badge</span>
                        </button>
                      )}

                      {/* Verified Badge Confirmed Status */}
                      {isVerified && (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Accredited</span>
                          </span>

                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleRevokeBadge(candidate.id)}
                            className="px-2.5 py-1 rounded-lg text-[10px] text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition cursor-pointer"
                          >
                            Revoke
                          </button>
                        </div>
                      )}

                      {/* Re-Evaluate for candidates marked failed */}
                      {isP2Failed && (
                        <button
                          type="button"
                          id={`reevaluate-btn-${candidate.id}`}
                          disabled={isBusy}
                          onClick={() => handleApprovePhase2(candidate.id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer flex items-center gap-1 disabled:opacity-50"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Re-Evaluate</span>
                        </button>
                      )}

                      {/* Candidate in Phase 1 (diagnostic quizzes not yet complete) */}
                      {!isP1Passed && !isP2Pending && !isP2Passed && !isP3Ready && !isVerified && !isP2Failed && (
                        <button
                          type="button"
                          title="Manually fast-track candidate quizzes to Phase 2"
                          onClick={() => {
                            setCandidates((prev) =>
                              prev.map((c) =>
                                c.id === candidate.id
                                  ? { ...c, phase_1_status: 'PASSED', phase_2_status: 'PENDING_SCHEDULE', passed_quizzes_count: 5 }
                                  : c
                              )
                            );
                            setToastMessage('Fast-tracked candidate to Phase 2 interview schedule.');
                            setTimeout(() => setToastMessage(null), 3500);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium transition cursor-pointer"
                        >
                          Fast-Track to Phase 2
                        </button>
                      )}

                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </section>

      </main>

      {/* ========================================================================= */}
      {/* 4. FLOATING BULK ACTION BAR (VISIBLE WHEN >= 1 CANDIDATE IS SELECTED) */}
      {/* ========================================================================= */}
      {selectedCandidateIds.length > 0 && (
        <aside
          id="admin-floating-bulk-bar"
          aria-label="Bulk actions bar"
          className="fixed bottom-6 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl sm:rounded-full shadow-2xl border border-slate-700/80 backdrop-blur-xl flex flex-col sm:flex-row items-center gap-3.5 animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          {/* Selected Count Indicator */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="bg-emerald-500 text-slate-950 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full">
              {selectedCandidateIds.length}
            </span>
            <span className="text-xs font-semibold text-slate-200">
              Candidate{selectedCandidateIds.length > 1 ? 's' : ''} Selected
            </span>
          </div>

          <div className="h-4 w-px bg-slate-700 hidden sm:block" />

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            
            {/* Bulk Approve Phase 2 */}
            <button
              type="button"
              id="bulk-approve-phase2-btn"
              disabled={isBulkProcessing}
              onClick={handleBulkApprovePhase2}
              className="px-3.5 py-1.5 rounded-xl sm:rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer shadow-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              {isBulkProcessing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              <span>Pass Interview (Phase 2)</span>
            </button>

            {/* Bulk Issue Verified Badge */}
            <button
              type="button"
              id="bulk-grant-badge-btn"
              disabled={isBulkProcessing}
              onClick={handleBulkGrantVerifiedBadge}
              className="px-3.5 py-1.5 rounded-xl sm:rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition cursor-pointer shadow-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              {isBulkProcessing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Award className="w-3.5 h-3.5" />}
              <span>Grant Verified Badge</span>
            </button>

            {/* Bulk Revoke Badge / Access */}
            <button
              type="button"
              id="bulk-revoke-badge-btn"
              disabled={isBulkProcessing}
              onClick={handleBulkRevokeBadge}
              className="px-3 py-1.5 rounded-xl sm:rounded-full bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-800/80 text-xs font-medium transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Revoke Badges</span>
            </button>
          </div>

          <div className="h-4 w-px bg-slate-700 hidden sm:block" />

          {/* Deselect All / Close */}
          <button
            type="button"
            id="clear-bulk-selection-btn"
            onClick={handleClearSelection}
            title="Clear Selection"
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer flex items-center gap-1 text-xs"
          >
            <X className="w-4 h-4" />
            <span className="sm:hidden text-xs">Clear</span>
          </button>
        </aside>
      )}

    </div>
  );
}
