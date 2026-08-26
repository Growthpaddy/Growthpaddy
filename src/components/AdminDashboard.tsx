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
  Sliders,
  Award,
  XCircle,
  Save,
  Link as LinkIcon,
  Check,
  UserCheck,
  ChevronRight,
  TrendingUp,
  Settings
} from 'lucide-react';

// ==============================================================================
// INLINE TYPES & INTERFACES (SELF-CONTAINED)
// ==============================================================================

export type VerificationStage = 'ALL' | 'PHASE_1_PASSED' | 'PHASE_2_PENDING' | 'PHASE_3_READY' | 'VERIFIED' | 'FAILED';

export interface CandidateProfile {
  id: string;
  user_id?: string;
  full_name: string;
  email?: string;
  contact_email?: string;
  headline?: string;
  bio?: string | null;
  location?: string | null;
  portfolio_url?: string | null;
  years_of_experience?: number;
  years_experience?: number;
  primary_specialization?: string | null;
  specialty?: string | null;
  skills?: string[] | null;
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
  id?: number;
  specialist_booking_link: string;
  passing_score_percentage: number;
  time_limit_minutes: number;
  phase_3_fee_usd: number;
  auto_invite_interviews?: boolean;
  updated_at?: string;
}

// ==============================================================================
// MAIN ADMIN DASHBOARD COMPONENT
// ==============================================================================

export default function AdminDashboard() {
  const supabase = useMemo(() => createClient(), []);

  // Candidate Data & Pipeline States
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState<boolean>(true);
  const [activeStageFilter, setActiveStageFilter] = useState<VerificationStage>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile | null>(null);

  // Specialist Interview & Admin Settings
  const [settings, setSettings] = useState<AdminSettings>({
    specialist_booking_link: 'https://calendly.com/talent-specialist/30min',
    passing_score_percentage: 80,
    time_limit_minutes: 30,
    phase_3_fee_usd: 250
  });
  const [bookingLinkInput, setBookingLinkInput] = useState<string>('');
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);
  const [settingsSuccessMessage, setSettingsSuccessMessage] = useState<string | null>(null);

  // Action / Feedback Modals
  const [actionProcessingId, setActionProcessingId] = useState<string | null>(null);
  const [feedbackNotes, setFeedbackNotes] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ----------------------------------------------------------------------------
  // Fetch Candidates and Settings
  // ----------------------------------------------------------------------------
  const fetchAdminData = useCallback(async () => {
    setIsLoadingCandidates(true);
    try {
      // 1. Fetch Candidate Profiles
      const { data: talentData, error: talentErr } = await supabase
        .from('talent_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (talentErr) {
        console.warn('Talent fetch note:', talentErr.message);
      }

      if (talentData && talentData.length > 0) {
        setCandidates(talentData as CandidateProfile[]);
      } else {
        // Mock fallback candidates for immediate inspection if database is empty
        setCandidates([
          {
            id: 'c101-demo-uuid',
            full_name: 'Sarah Chen',
            contact_email: 'sarah.chen@example.com',
            headline: 'Senior Paid Acquisition & Growth Specialist',
            bio: 'Expert in Meta Advantage+ and Google PMax campaigns with $10M+ managed budget.',
            location: 'San Francisco, CA',
            portfolio_url: 'https://sarahchen.growth',
            years_of_experience: 6,
            primary_specialization: 'Paid Media & PPC',
            placement_status: 'AVAILABLE',
            phase_1_status: 'PASSED',
            phase_2_status: 'PENDING_SCHEDULE',
            phase_3_status: 'LOCKED',
            is_verified_badge: false,
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'c102-demo-uuid',
            full_name: 'Marcus Vance',
            contact_email: 'marcus.v@example.com',
            headline: 'Lifecycle & Retention Marketing Director',
            bio: 'Specialist in Klaviyo enterprise automation, churn reduction modeling, and SMS flows.',
            location: 'Austin, TX',
            portfolio_url: 'https://marcusvance.io',
            years_of_experience: 8,
            primary_specialization: 'Email & Lifecycle Automation',
            placement_status: 'AVAILABLE',
            phase_1_status: 'PASSED',
            phase_2_status: 'COMPLETED',
            phase_3_status: 'PAYMENT_PENDING',
            is_verified_badge: false,
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'c103-demo-uuid',
            full_name: 'Elena Rostova',
            contact_email: 'elena.rostova@example.com',
            headline: 'Technical SEO & Organic Inbound Architect',
            bio: 'Specializing in programmatic SEO, semantic content indexing, and international migrations.',
            location: 'London, UK',
            portfolio_url: 'https://elena-seo.tech',
            years_of_experience: 5,
            primary_specialization: 'SEO & Organic Growth',
            placement_status: 'AVAILABLE',
            phase_1_status: 'PASSED',
            phase_2_status: 'COMPLETED',
            phase_3_status: 'VERIFIED',
            is_verified_badge: true,
            created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]);
      }

      // 2. Fetch Admin Verification Settings
      const { data: settingsData } = await supabase
        .from('admin_verification_settings')
        .select('*')
        .order('id', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (settingsData) {
        const loadedSettings: AdminSettings = {
          id: settingsData.id,
          specialist_booking_link: settingsData.specialist_booking_link || 'https://calendly.com/talent-specialist/30min',
          passing_score_percentage: settingsData.passing_score_percentage || 80,
          time_limit_minutes: settingsData.time_limit_minutes || 30,
          phase_3_fee_usd: settingsData.phase_3_fee_usd || 250
        };
        setSettings(loadedSettings);
        setBookingLinkInput(loadedSettings.specialist_booking_link);
      } else {
        setBookingLinkInput('https://calendly.com/talent-specialist/30min');
      }
    } catch (err: any) {
      console.error('Error fetching admin dashboard data:', err);
    } finally {
      setIsLoadingCandidates(false);
    }
  }, [supabase]);

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
          .single();
        if (inserted) {
          setSettings((prev) => ({ ...prev, id: inserted.id }));
        }
      }

      setSettings((prev) => ({ ...prev, specialist_booking_link: bookingLinkInput.trim() }));
      setSettingsSuccessMessage('Specialist booking URL successfully updated.');
      setTimeout(() => setSettingsSuccessMessage(null), 3500);
    } catch (err: any) {
      alert(`Could not save settings: ${err.message}`);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // ----------------------------------------------------------------------------
  // Candidate Pipeline Action Handlers (Approve / Reject Phase 2 & Phase 3)
  // ----------------------------------------------------------------------------
  const handleApprovePhase2 = async (candidateId: string) => {
    setActionProcessingId(candidateId);
    try {
      const updates = {
        phase_2_status: 'COMPLETED',
        phase_2_interview_passed: true,
        phase_3_status: 'PAYMENT_PENDING',
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('talent_profiles')
        .update(updates)
        .eq('id', candidateId);

      if (error) throw error;

      setCandidates((prev) =>
        prev.map((c) =>
          c.id === candidateId
            ? { ...c, phase_2_status: 'COMPLETED', phase_3_status: 'PAYMENT_PENDING', phase_2_interview_passed: true }
            : c
        )
      );

      setToastMessage('Phase 2 Approved: Candidate unlocked for Phase 3 payment.');
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    } finally {
      setActionProcessingId(null);
    }
  };

  const handleRejectPhase2 = async (candidateId: string) => {
    setActionProcessingId(candidateId);
    try {
      const updates = {
        phase_2_status: 'FAILED',
        phase_2_interview_passed: false,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('talent_profiles')
        .update(updates)
        .eq('id', candidateId);

      if (error) throw error;

      setCandidates((prev) =>
        prev.map((c) =>
          c.id === candidateId
            ? { ...c, phase_2_status: 'FAILED', phase_2_interview_passed: false }
            : c
        )
      );

      setToastMessage('Phase 2 Marked as Failed: Candidate prompted for review.');
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: any) {
      alert(`Rejection error: ${err.message}`);
    } finally {
      setActionProcessingId(null);
    }
  };

  const handleApprovePhase3 = async (candidateId: string) => {
    setActionProcessingId(candidateId);
    try {
      const updates = {
        phase_3_status: 'VERIFIED',
        phase_3_fee_paid: true,
        is_verified_badge: true,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('talent_profiles')
        .update(updates)
        .eq('id', candidateId);

      if (error) throw error;

      setCandidates((prev) =>
        prev.map((c) =>
          c.id === candidateId
            ? { ...c, phase_3_status: 'VERIFIED', phase_3_fee_paid: true, is_verified_badge: true }
            : c
        )
      );

      setToastMessage('Phase 3 Complete: Verified Talent Badge granted!');
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: any) {
      alert(`Badge grant error: ${err.message}`);
    } finally {
      setActionProcessingId(null);
    }
  };

  // ----------------------------------------------------------------------------
  // Filtering & Search
  // ----------------------------------------------------------------------------
  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
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

      // 2. Search Query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const nameMatch = candidate.full_name?.toLowerCase().includes(query);
        const roleMatch = candidate.headline?.toLowerCase().includes(query);
        const specMatch = candidate.primary_specialization?.toLowerCase().includes(query) || candidate.specialty?.toLowerCase().includes(query);
        const emailMatch = (candidate.contact_email || candidate.email)?.toLowerCase().includes(query);

        if (!nameMatch && !roleMatch && !specMatch && !emailMatch) {
          return false;
        }
      }

      return true;
    });
  }, [candidates, activeStageFilter, searchQuery]);

  // Stage Summary Counts
  const counts = useMemo(() => {
    return {
      all: candidates.length,
      phase1Passed: candidates.filter((c) => (c.phase_1_status === 'PASSED' || c.phase_1_quiz_passed) && c.phase_2_status === 'PENDING_SCHEDULE').length,
      phase2Pending: candidates.filter((c) => c.phase_2_status === 'PENDING_SCHEDULE').length,
      phase3Ready: candidates.filter((c) => c.phase_3_status === 'PAYMENT_PENDING').length,
      verified: candidates.filter((c) => c.is_verified_badge || c.phase_3_status === 'VERIFIED').length,
      failed: candidates.filter((c) => c.phase_2_status === 'FAILED').length
    };
  }, [candidates]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-20 selection:bg-emerald-500 selection:text-white">
      
      {/* Live Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-white text-slate-900 border-2 border-emerald-500 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-mono text-[10px] font-bold uppercase text-emerald-700">Pipeline Status</p>
            <p className="text-xs font-bold text-slate-900">{toastMessage}</p>
          </div>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-slate-700 font-mono text-xs cursor-pointer">✕</button>
        </div>
      )}

      {/* Top Admin Navigation Header */}
      <header className="sticky top-0 z-40 border-b bg-white/95 border-slate-200/80 backdrop-blur-md px-4 sm:px-8 py-3.5 shadow-2xs">
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
            <button
              onClick={fetchAdminData}
              title="Sync Pipeline"
              className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer transition shadow-2xs flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Pipeline</span>
            </button>
          </div>

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        {/* ========================================================================= */}
        {/* 1. SPECIALIST INTERVIEW SETTINGS CARD */}
        {/* ========================================================================= */}
        <section className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                <Settings className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Specialist Interview Booking Configuration</h2>
                <p className="text-xs text-slate-500">Configure the calendar scheduling link provided to candidates who pass Phase 1 quizzes.</p>
              </div>
            </div>
            {settingsSuccessMessage && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1">
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
                type="url"
                required
                value={bookingLinkInput}
                onChange={(e) => setBookingLinkInput(e.target.value)}
                placeholder="https://calendly.com/your-org/specialist-interview"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
              />
            </div>

            <button
              type="submit"
              disabled={isSavingSettings}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition cursor-pointer shadow-xs flex items-center justify-center gap-1.5 shrink-0"
            >
              {isSavingSettings ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Booking Link</span>
            </button>
          </form>
        </section>

        {/* ========================================================================= */}
        {/* 2. SEARCH & FILTER CONTROLS */}
        {/* ========================================================================= */}
        <section className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidates by name, specialization, or email..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
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

            {/* Stage Filter Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
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
                onClick={() => setActiveStageFilter('PHASE_2_PENDING')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  activeStageFilter === 'PHASE_2_PENDING'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Phase 2 Evaluation Pending ({counts.phase2Pending})</span>
              </button>

              <button
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
                onClick={() => setActiveStageFilter('VERIFIED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  activeStageFilter === 'VERIFIED'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified ({counts.verified})</span>
              </button>

              <button
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
        {/* 3. CANDIDATE VERIFICATION PIPELINE TABLE & CARDS */}
        {/* ========================================================================= */}
        <section className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Candidate Pipeline ({filteredCandidates.length})</h2>
              <p className="text-xs text-slate-500">Review assessment progress, interview evaluations, and badge authorization.</p>
            </div>
          </div>

          {isLoadingCandidates ? (
            <div className="p-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-600">Loading Candidate Records...</p>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No candidates match your current filter.</p>
              <button
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
                const isP1Passed = candidate.phase_1_status === 'PASSED' || candidate.phase_1_quiz_passed;
                const isP2Pending = candidate.phase_2_status === 'PENDING_SCHEDULE';
                const isP2Passed = candidate.phase_2_status === 'COMPLETED' || candidate.phase_2_interview_passed;
                const isP2Failed = candidate.phase_2_status === 'FAILED';
                const isP3Ready = candidate.phase_3_status === 'PAYMENT_PENDING';
                const isVerified = candidate.is_verified_badge || candidate.phase_3_status === 'VERIFIED';
                const isBusy = actionProcessingId === candidate.id;

                return (
                  <div key={candidate.id} className="p-6 hover:bg-slate-50/60 transition flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    
                    {/* Candidate Identity */}
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-800 font-bold flex items-center justify-center text-lg shrink-0 border border-slate-200">
                        {candidate.full_name?.charAt(0) || 'C'}
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                            {candidate.full_name}
                          </h3>

                          {isVerified ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>Verified Badge Active</span>
                            </span>
                          ) : isP3Ready ? (
                            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                              <Clock className="w-3 h-3" />
                              <span>Phase 3: Fee Payment Pending</span>
                            </span>
                          ) : isP2Pending ? (
                            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full text-[10px] font-semibold animate-pulse">
                              <Calendar className="w-3 h-3" />
                              <span>Phase 2: Specialist Interview Pending</span>
                            </span>
                          ) : isP2Failed ? (
                            <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                              <XCircle className="w-3 h-3" />
                              <span>Phase 2: Evaluation Benchmark Not Met</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-medium">
                              <span>Phase 1: Diagnostic Quizzes</span>
                            </span>
                          )}
                        </div>

                        <p className="text-xs font-semibold text-slate-700">{candidate.headline}</p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 pt-1">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {candidate.contact_email || candidate.email}
                          </span>
                          {candidate.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {candidate.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3 text-slate-400" />
                            {candidate.years_of_experience || candidate.years_experience || 4}+ Years Exp
                          </span>
                          {candidate.portfolio_url && (
                            <a
                              href={candidate.portfolio_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-700 hover:underline flex items-center gap-0.5 font-semibold"
                            >
                              <span>Dossier</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Operational Phase Actions */}
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
                      
                      {/* Phase 2 Specialist Approval Controls */}
                      {isP2Pending && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleApprovePhase2(candidate.id)}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition cursor-pointer shadow-2xs flex items-center gap-1.5"
                          >
                            {isBusy ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                            <span>Approve Interview (Pass)</span>
                          </button>

                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleRejectPhase2(candidate.id)}
                            className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Fail</span>
                          </button>
                        </div>
                      )}

                      {/* Phase 3 Manual Payment / Badge Grant */}
                      {isP3Ready && !isVerified && (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleApprovePhase3(candidate.id)}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition cursor-pointer shadow-2xs flex items-center gap-1.5"
                        >
                          {isBusy ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Award className="w-3.5 h-3.5" />}
                          <span>Confirm Payment & Grant Badge</span>
                        </button>
                      )}

                      {/* Verified Badge Confirmed */}
                      {isVerified && (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Fully Accredited</span>
                        </span>
                      )}

                      {/* Failed Review State */}
                      {isP2Failed && (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleApprovePhase2(candidate.id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Re-Evaluate</span>
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
    </div>
  );
}
