'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useSupabase } from '../context/SupabaseContext';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Clock,
  ExternalLink,
  CreditCard,
  Calendar,
  AlertCircle,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  BookOpen,
  Award,
  RefreshCw,
  Mail,
  MapPin,
  Briefcase,
  ChevronRight,
  FileText,
  X,
  GraduationCap,
  Timer,
  LogOut,
  UserCheck
} from 'lucide-react';

// ==============================================================================
// SELF-CONTAINED TYPES & INTERFACES
// ==============================================================================

export type PlacementStatus = 'AVAILABLE' | 'HIRED' | 'UNAVAILABLE';
export type Phase1Status = 'PENDING' | 'IN_PROGRESS' | 'PASSED' | 'FAILED';
export type Phase2Status = 'LOCKED' | 'PENDING_SCHEDULE' | 'COMPLETED' | 'FAILED';
export type Phase3Status = 'LOCKED' | 'PAYMENT_PENDING' | 'VERIFIED';

export interface TalentProfile {
  id: string;
  user_id?: string;
  full_name: string;
  email?: string;
  contact_email?: string;
  headline?: string;
  bio?: string | null;
  location?: string | null;
  portfolio_url?: string | null;
  slug?: string | null;
  years_experience?: number;
  years_of_experience?: number;
  specialty?: string | null;
  primary_specialization?: string | null;
  placement_status?: PlacementStatus;
  availability_status?: 'available' | 'hired';
  phase_1_status?: Phase1Status;
  phase_2_status?: Phase2Status;
  phase_3_status?: Phase3Status;
  vetting_status?: string;
  is_verified_badge?: boolean;
  phase_1_quiz_passed?: boolean;
  phase_2_interview_passed?: boolean;
  phase_3_fee_paid?: boolean;
  verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: number | string;
  skill_category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  question_text: string;
  options: QuizOption[];
  correct_option_id: string;
  is_active: boolean;
}

export interface SkillCategoryItem {
  category: string;
  totalQuestions: number;
  isPassed: boolean;
  bestScore?: number;
  failCount: number;
  isLocked: boolean;
  cooldownDaysRemaining: number;
  lastAttemptDate?: string;
}

export interface QuizAttemptState {
  id?: string;
  talent_id: string;
  skill_category: string;
  score_percentage: number;
  passed: boolean;
  created_at: string;
}

interface TalentProfileProps {
  onSignOut?: () => void;
  navigateToPage?: (page: any) => void;
}

// Default 9 Core Skill Categories
const DEFAULT_SKILL_CATEGORIES = [
  'Full-Stack Digital Marketing',
  'Growth Marketing Strategy',
  'Paid Media & PPC',
  'SEO & Organic Growth',
  'CRO & Conversion Optimization',
  'Email & Lifecycle Automation',
  'Analytics & Attribution',
  'General Digital Marketing',
  'AI & Automation Strategy'
];

export default function TalentProfileComponent({ onSignOut, navigateToPage }: TalentProfileProps) {
  const { user } = useSupabase();

  // Profile & Matrix Data
  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [skillMatrix, setSkillMatrix] = useState<SkillCategoryItem[]>([]);
  const [passingScore] = useState<number>(80);
  const [timeLimitMinutes] = useState<number>(30);
  const [verificationFeeUsd] = useState<number>(250);

  // UI & Loading States
  const [loading, setLoading] = useState<boolean>(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusToast, setStatusToast] = useState<string | null>(null);

  // Diagnostic Quiz Modal State
  const [activeModalCategory, setActiveModalCategory] = useState<SkillCategoryItem | null>(null);
  const [modalQuestions, setModalQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string | number, string>>({});
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState<boolean>(false);
  const [quizResult, setQuizResult] = useState<{
    score: number;
    passed: boolean;
    correctCount: number;
    totalCount: number;
    newFailCount: number;
  } | null>(null);

  // ----------------------------------------------------------------------------
  // Helper: Aggregate Skill Matrix with Fail Tracking & 90-Day Lock
  // ----------------------------------------------------------------------------
  const buildSkillMatrix = useCallback((attempts: any[], activeCategories: string[]) => {
    const now = Date.now();
    const categories = activeCategories.length > 0 ? activeCategories : DEFAULT_SKILL_CATEGORIES;

    return categories.map((catName) => {
      const catAttempts = (attempts || [])
        .filter((a: any) => a.skill_category === catName)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      const hasPassed = catAttempts.some((a: any) => a.passed === true);
      const bestScore = catAttempts.length > 0 
        ? Math.max(...catAttempts.map((a: any) => Number(a.score_percentage || 0))) 
        : undefined;

      const failAttempts = catAttempts.filter((a: any) => !a.passed);
      const failCount = failAttempts.length;

      let isLocked = false;
      let cooldownDaysRemaining = 0;

      // Lock category for 90 days after 2+ failed attempts
      if (!hasPassed && failCount >= 2 && failAttempts[0]) {
        const latestFailTime = new Date(failAttempts[0].created_at).getTime();
        const cooldownEnd = latestFailTime + 90 * 24 * 60 * 60 * 1000;
        if (now < cooldownEnd) {
          isLocked = true;
          cooldownDaysRemaining = Math.max(1, Math.ceil((cooldownEnd - now) / (1000 * 60 * 60 * 24)));
        }
      }

      return {
        category: catName,
        totalQuestions: 20,
        isPassed: hasPassed,
        bestScore,
        failCount,
        isLocked,
        cooldownDaysRemaining,
        lastAttemptDate: catAttempts[0]?.created_at
      };
    });
  }, []);

  // ----------------------------------------------------------------------------
  // Fetch or Self-Heal Candidate Profile
  // ----------------------------------------------------------------------------
  const fetchTalentData = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const { data: authData } = await supabase.auth.getUser();
      const currentAuthUser = authData?.user || user;

      if (!currentAuthUser) {
        setLoading(false);
        return;
      }

      // 1. Fetch profile record
      let { data: profileData, error: profileErr } = await supabase
        .from('talent_profiles')
        .select('*')
        .eq('id', currentAuthUser.id)
        .maybeSingle();

      // Self-healing: if no record exists, create default
      if (!profileData) {
        const candidateName = currentAuthUser.user_metadata?.full_name || currentAuthUser.email?.split('@')[0] || 'Talent Candidate';
        const defaultSlug = candidateName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

        const newProfileRecord = {
          id: currentAuthUser.id,
          email: currentAuthUser.email,
          contact_email: currentAuthUser.email,
          full_name: candidateName,
          headline: 'Growth & Digital Marketing Specialist',
          bio: 'Data-driven marketing practitioner specializing in paid acquisition, organic conversion loops, and full-funnel analytics.',
          years_experience: 4,
          location: 'Remote Global',
          placement_status: 'AVAILABLE',
          availability_status: 'available',
          phase_1_status: 'IN_PROGRESS',
          phase_2_status: 'LOCKED',
          phase_3_status: 'LOCKED',
          is_verified_badge: false,
          slug: defaultSlug,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data: created, error: insertErr } = await supabase
          .from('talent_profiles')
          .insert([newProfileRecord])
          .select()
          .single();

        if (!insertErr && created) {
          profileData = created;
        } else {
          profileData = newProfileRecord;
        }
      }

      // 2. Fetch active quiz questions to derive category list
      const { data: questionsData } = await supabase
        .from('quiz_questions')
        .select('skill_category')
        .eq('is_active', true);

      const uniqueCategories = Array.from(
        new Set((questionsData || []).map((q: any) => q.skill_category).filter(Boolean))
      );

      // 3. Fetch user's quiz attempts
      const { data: attemptsData } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('talent_id', currentAuthUser.id)
        .order('created_at', { ascending: false });

      const matrix = buildSkillMatrix(
        attemptsData || [],
        uniqueCategories.length > 0 ? (uniqueCategories as string[]) : DEFAULT_SKILL_CATEGORIES
      );

      setSkillMatrix(matrix);

      // Harmonize pipeline statuses
      const passedCount = matrix.filter((m) => m.isPassed).length;
      const isPhase1Done = passedCount >= 5 || profileData.phase_1_quiz_passed || profileData.phase_1_status === 'PASSED';
      
      const normalizedProfile: TalentProfile = {
        ...profileData,
        years_of_experience: profileData.years_experience || profileData.years_of_experience || 3,
        contact_email: profileData.contact_email || profileData.email || currentAuthUser.email,
        placement_status: (profileData.placement_status || (profileData.availability_status === 'hired' ? 'HIRED' : 'AVAILABLE')) as PlacementStatus,
        phase_1_status: isPhase1Done ? 'PASSED' : (profileData.phase_1_status || 'IN_PROGRESS'),
        phase_2_status: isPhase1Done && (!profileData.phase_2_status || profileData.phase_2_status === 'LOCKED')
          ? 'PENDING_SCHEDULE'
          : (profileData.phase_2_status || 'LOCKED'),
        phase_3_status: profileData.phase_3_status || (profileData.phase_3_fee_paid ? 'VERIFIED' : 'LOCKED'),
        is_verified_badge: Boolean(profileData.is_verified_badge || profileData.phase_3_fee_paid || profileData.vetting_status === 'verified')
      };

      setProfile(normalizedProfile);
    } catch (err: any) {
      console.error('Error fetching talent profile:', err);
      setErrorMessage('Unable to load talent profile data. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, [user, buildSkillMatrix]);

  useEffect(() => {
    fetchTalentData();
  }, [fetchTalentData]);

  // ----------------------------------------------------------------------------
  // Placement Status Switcher (Available vs Hired)
  // ----------------------------------------------------------------------------
  const handleTogglePlacement = async (newStatus: PlacementStatus) => {
    if (!profile) return;
    setIsUpdatingStatus(true);
    try {
      const availabilityMapped = newStatus === 'HIRED' ? 'hired' : 'available';

      const { error } = await supabase
        .from('talent_profiles')
        .update({
          placement_status: newStatus,
          availability_status: availabilityMapped,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) throw error;

      setProfile((prev) => (prev ? { ...prev, placement_status: newStatus, availability_status: availabilityMapped } : null));
      setStatusToast(newStatus === 'AVAILABLE' ? 'Status: Available for Placement 🟢' : 'Status: Marked as In Placement / Hired 🔒');
      setTimeout(() => setStatusToast(null), 3000);
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // ----------------------------------------------------------------------------
  // Launch Quiz Modal
  // ----------------------------------------------------------------------------
  const handleOpenQuizModal = async (categoryItem: SkillCategoryItem) => {
    if (categoryItem.isPassed || categoryItem.isLocked) return;

    setActiveModalCategory(categoryItem);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setQuizResult(null);

    // Fetch real questions for category
    const { data: qData } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('skill_category', categoryItem.category)
      .eq('is_active', true)
      .limit(20);

    if (qData && qData.length > 0) {
      setModalQuestions(qData as QuizQuestion[]);
    } else {
      // Fallback interactive questions if table is being seeded
      setModalQuestions([
        {
          id: 1,
          skill_category: categoryItem.category,
          difficulty: 'intermediate',
          question_text: `In ${categoryItem.category}, what is the primary operational lever to maximize ROAS and CAC efficiency?`,
          options: [
            { id: 'a', text: 'Increase broad campaign budgets unconditionally without audience segmentation' },
            { id: 'b', text: 'Run controlled incrementality lift tests, optimize creative cadence, and streamline landing page conversion velocity' },
            { id: 'c', text: 'Turn off all tracking pixels and conversion APIs' },
            { id: 'd', text: 'Rely solely on last-click organic search attribution' }
          ],
          correct_option_id: 'b',
          is_active: true
        },
        {
          id: 2,
          skill_category: categoryItem.category,
          difficulty: 'advanced',
          question_text: 'Which quantitative metric best measures sustainable subscription growth and customer expansion?',
          options: [
            { id: 'a', text: 'Net Revenue Retention (NRR) > 120% and payback period < 12 months' },
            { id: 'b', text: 'Gross impression count on social channels' },
            { id: 'c', text: 'Website single-page bounce rate' },
            { id: 'd', text: 'Total email unsubscribe count' }
          ],
          correct_option_id: 'a',
          is_active: true
        }
      ]);
    }
  };

  const handleCloseQuizModal = () => {
    setActiveModalCategory(null);
    setModalQuestions([]);
    setQuizResult(null);
    fetchTalentData();
  };

  // ----------------------------------------------------------------------------
  // Submit Real Assessment
  // ----------------------------------------------------------------------------
  const handleSubmitQuiz = async () => {
    if (!profile || !activeModalCategory || modalQuestions.length === 0) return;

    setIsSubmittingQuiz(true);
    try {
      let correct = 0;
      modalQuestions.forEach((q) => {
        if (userAnswers[q.id] === q.correct_option_id) {
          correct += 1;
        }
      });

      const total = modalQuestions.length;
      const scorePct = Math.round((correct / total) * 100);
      const passed = scorePct >= passingScore;
      const newFailCount = passed ? 0 : activeModalCategory.failCount + 1;

      // Save attempt to Supabase
      await supabase.from('quiz_attempts').insert({
        talent_id: profile.id,
        skill_category: activeModalCategory.category,
        total_questions: total,
        correct_answers: correct,
        score_percentage: scorePct,
        passed,
        answers_payload: userAnswers,
        created_at: new Date().toISOString()
      });

      // Update Phase 1 status if threshold reached
      const currentPassedCount = skillMatrix.filter((s) => s.isPassed).length;
      const totalPassedAfter = passed && !activeModalCategory.isPassed ? currentPassedCount + 1 : currentPassedCount;

      if (totalPassedAfter >= 5) {
        await supabase
          .from('talent_profiles')
          .update({
            phase_1_status: 'PASSED',
            phase_1_quiz_passed: true,
            phase_2_status: profile.phase_2_status === 'LOCKED' ? 'PENDING_SCHEDULE' : profile.phase_2_status
          })
          .eq('id', profile.id);
      }

      setQuizResult({
        score: scorePct,
        passed,
        correctCount: correct,
        totalCount: total,
        newFailCount
      });
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  // ----------------------------------------------------------------------------
  // Quick Demo Pass / Fail Simulation Buttons (Inside Modal)
  // ----------------------------------------------------------------------------
  const handleSimulateQuizResult = async (simulatedPass: boolean) => {
    if (!profile || !activeModalCategory) return;
    setIsSubmittingQuiz(true);

    try {
      const scorePct = simulatedPass ? 95 : 60;
      const passed = simulatedPass;
      const newFailCount = passed ? 0 : activeModalCategory.failCount + 1;

      await supabase.from('quiz_attempts').insert({
        talent_id: profile.id,
        skill_category: activeModalCategory.category,
        total_questions: 20,
        correct_answers: simulatedPass ? 19 : 12,
        score_percentage: scorePct,
        passed,
        created_at: new Date().toISOString()
      });

      const currentPassedCount = skillMatrix.filter((s) => s.isPassed).length;
      const totalPassedAfter = passed && !activeModalCategory.isPassed ? currentPassedCount + 1 : currentPassedCount;

      if (totalPassedAfter >= 5) {
        await supabase
          .from('talent_profiles')
          .update({
            phase_1_status: 'PASSED',
            phase_1_quiz_passed: true,
            phase_2_status: profile.phase_2_status === 'LOCKED' ? 'PENDING_SCHEDULE' : profile.phase_2_status
          })
          .eq('id', profile.id);
      }

      setQuizResult({
        score: scorePct,
        passed,
        correctCount: simulatedPass ? 19 : 12,
        totalCount: 20,
        newFailCount
      });
    } catch (err: any) {
      console.warn('Simulation notice:', err.message);
      // Local state fallback
      setQuizResult({
        score: simulatedPass ? 95 : 60,
        passed: simulatedPass,
        correctCount: simulatedPass ? 19 : 12,
        totalCount: 20,
        newFailCount: simulatedPass ? 0 : activeModalCategory.failCount + 1
      });
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  // Sign out handler
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out:', err);
    }
    if (onSignOut) {
      onSignOut();
    } else {
      window.location.href = '/';
    }
  };

  // Metrics
  const passedQuizzesCount = skillMatrix.filter((s) => s.isPassed).length;
  const isPhase1Fulfilled = passedQuizzesCount >= 5 || profile?.phase_1_status === 'PASSED';

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-700">Loading Candidate Dossier & Verification Pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-20 selection:bg-emerald-500 selection:text-white">
      
      {/* Toast Notification */}
      {statusToast && (
        <div className="fixed top-6 right-6 z-50 bg-white text-slate-900 border-2 border-emerald-500 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-mono text-[10px] font-bold uppercase text-emerald-700">Live Status Update</p>
            <p className="text-xs font-bold text-slate-900">{statusToast}</p>
          </div>
          <button onClick={() => setStatusToast(null)} className="ml-2 text-slate-400 hover:text-slate-700 font-mono text-xs cursor-pointer">✕</button>
        </div>
      )}

      {/* Top Banner for Verified State */}
      {profile?.is_verified_badge && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 shadow-xs">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Accredited Talent: Your profile is fully verified and featured in recruiter search results.</span>
        </div>
      )}

      {/* Modern Portal Header */}
      <header className="sticky top-0 z-40 border-b bg-white/95 border-slate-200/80 backdrop-blur-md px-4 sm:px-8 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
          
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 text-white p-2 rounded-xl flex items-center justify-center shadow-xs font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-sm tracking-tight text-slate-900">
                  GrowthPaddy
                </span>
                <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Candidate Portal
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {profile?.full_name || 'Candidate Dashboard'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
            {profile?.is_verified_badge ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold uppercase rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Talent</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold uppercase rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Accreditation In Progress</span>
              </span>
            )}

            <button
              onClick={fetchTalentData}
              title="Sync Live Data"
              className="p-2 border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 rounded-xl cursor-pointer transition shadow-2xs"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={handleSignOut}
              className="bg-white hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-semibold py-1.5 px-3.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer border border-slate-200 transition shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400" />
              <span>Sign Out</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Workspace Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        {/* ========================================================================= */}
        {/* 1. EXECUTIVE BIO & PLACEMENT STATUS HEADER */}
        {/* ========================================================================= */}
        <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            
            {/* Left: Avatar, Name, Bio */}
            <div className="flex items-start gap-4 sm:gap-5 flex-1 min-w-0">
              <div className="relative shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-xl sm:text-2xl shadow-inner">
                  {profile?.full_name?.charAt(0) || 'T'}
                </div>
                {profile?.is_verified_badge && (
                  <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full ring-2 ring-white shadow-xs" title="Verified Badge Active">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                )}
              </div>

              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    {profile?.full_name || 'Talent Candidate'}
                  </h1>

                  {profile?.is_verified_badge ? (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verified Talent Badge</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Verification In Progress</span>
                    </span>
                  )}
                </div>

                <p className="text-sm font-semibold text-slate-700">{profile?.headline || 'Growth Marketing Specialist'}</p>

                {profile?.bio && (
                  <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                    {profile.bio}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {profile?.contact_email || profile?.email || 'email@example.com'}
                  </span>
                  {profile?.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {profile.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    {profile?.years_of_experience || 4}+ Years Exp
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Placement Status Switcher & External CV */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
              
              {/* Status Switcher Buttons */}
              <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1">
                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => handleTogglePlacement('AVAILABLE')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    profile?.placement_status === 'AVAILABLE'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${profile?.placement_status === 'AVAILABLE' ? 'bg-white' : 'bg-emerald-500'}`}></span>
                  <span>Available for Placement</span>
                </button>

                <button
                  type="button"
                  disabled={isUpdatingStatus}
                  onClick={() => handleTogglePlacement('HIRED')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    profile?.placement_status === 'HIRED'
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Lock className="w-3 h-3" />
                  <span>In Placement / Hired</span>
                </button>
              </div>

              {/* Dossier / CV Link */}
              {profile?.portfolio_url && (
                <a
                  href={profile.portfolio_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition shadow-2xs"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>View CV</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}

            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. 3-PHASE VERIFICATION PIPELINE */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">3-Phase Candidate Verification Pipeline</h2>
              <p className="text-xs text-slate-500">Complete all three phases to earn the Verified Talent badge and unlock direct recruiter contact requests.</p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-700 shadow-2xs">
              {profile?.is_verified_badge ? 'Phase 3/3 (Verified)' : profile?.phase_2_status === 'COMPLETED' ? 'Phase 3/3 (Payment Ready)' : isPhase1Fulfilled ? 'Phase 2/3 (Interview)' : 'Phase 1/3 (Quizzes)'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* PHASE 1: Quizzes */}
            <div className={`bg-white rounded-3xl p-6 border transition shadow-xs flex flex-col justify-between ${
              isPhase1Fulfilled ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200'
            }`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                      isPhase1Fulfilled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      1
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">Skill Diagnostic Quizzes</h3>
                  </div>

                  {isPhase1Fulfilled ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Passed ({passedQuizzesCount}/5)
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      In Progress ({passedQuizzesCount}/5)
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Pass at least 5 skill categories with an 80%+ benchmark to demonstrate comprehensive marketing mastery.
                </p>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-500 rounded-full"
                      style={{ width: `${Math.min((passedQuizzesCount / 5) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>{passedQuizzesCount} passed</span>
                    <span>5 required</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4">
                <a
                  href="#skills-matrix-section"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition"
                >
                  <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                  <span>View Diagnostic Matrix</span>
                </a>
              </div>
            </div>

            {/* PHASE 2: 1-on-1 Specialist Interview */}
            <div className={`bg-white rounded-3xl p-6 border transition shadow-xs flex flex-col justify-between ${
              profile?.phase_2_status === 'COMPLETED'
                ? 'border-emerald-200 bg-emerald-50/20'
                : profile?.phase_2_status === 'PENDING_SCHEDULE'
                ? 'border-indigo-300 ring-2 ring-indigo-500/10'
                : profile?.phase_2_status === 'FAILED'
                ? 'border-rose-200 bg-rose-50/20'
                : 'border-slate-200 opacity-80'
            }`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                      profile?.phase_2_status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : profile?.phase_2_status === 'PENDING_SCHEDULE'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      2
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">Specialist 1-on-1 Review</h3>
                  </div>

                  {profile?.phase_2_status === 'COMPLETED' ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Passed
                    </span>
                  ) : profile?.phase_2_status === 'PENDING_SCHEDULE' ? (
                    <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 animate-pulse">
                      Unlocked: Schedule Now
                    </span>
                  ) : profile?.phase_2_status === 'FAILED' ? (
                    <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      Re-Evaluation Required
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                      <Lock className="w-3 h-3" />
                      Locked
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  A 30-minute technical evaluation covering case studies, growth modeling, and operational execution.
                </p>

                {profile?.phase_2_status === 'FAILED' && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                    Your previous review did not meet the benchmark. Please review feedback before re-scheduling.
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4">
                {profile?.phase_2_status === 'PENDING_SCHEDULE' || profile?.phase_2_status === 'FAILED' ? (
                  <a
                    href="https://calendly.com/talent-specialist/30min"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-xs"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book 1-on-1 Interview</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : profile?.phase_2_status === 'COMPLETED' ? (
                  <div className="text-center text-xs font-semibold text-emerald-700 py-1.5 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Interview Endorsed</span>
                  </div>
                ) : (
                  <button
                    disabled
                    className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-slate-100 text-slate-400 cursor-not-allowed flex items-center justify-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Complete Phase 1 First</span>
                  </button>
                )}
              </div>
            </div>

            {/* PHASE 3: Verified Badge Payment */}
            <div className={`bg-white rounded-3xl p-6 border transition shadow-xs flex flex-col justify-between ${
              profile?.is_verified_badge
                ? 'border-emerald-300 bg-emerald-50/20'
                : profile?.phase_3_status === 'PAYMENT_PENDING'
                ? 'border-amber-300 ring-2 ring-amber-500/10'
                : 'border-slate-200 opacity-80'
            }`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                      profile?.is_verified_badge
                        ? 'bg-emerald-100 text-emerald-800'
                        : profile?.phase_3_status === 'PAYMENT_PENDING'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      3
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">Verified Badge Issuance</h3>
                  </div>

                  {profile?.is_verified_badge ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Active
                    </span>
                  ) : profile?.phase_3_status === 'PAYMENT_PENDING' ? (
                    <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Payment Ready
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                      <Lock className="w-3 h-3" />
                      Locked
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Lock in your official accreditation badge and gain top-tier placement in recruiter search queries.
                </p>

                <div className="text-xs text-slate-500 font-mono">
                  Issuance Fee: <strong className="text-slate-800">${verificationFeeUsd} USD</strong> (One-time)
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4">
                {profile?.phase_3_status === 'PAYMENT_PENDING' && !profile?.is_verified_badge ? (
                  <button
                    onClick={() => {
                      if (navigateToPage) navigateToPage('checkout');
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Pay & Activate Badge</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : profile?.is_verified_badge ? (
                  <div className="text-center text-xs font-semibold text-emerald-700 py-1.5 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Accreditation Active & Live</span>
                  </div>
                ) : (
                  <button
                    disabled
                    className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-slate-100 text-slate-400 cursor-not-allowed flex items-center justify-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Complete Phase 2 First</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. SKILLS ACCREDITATION MATRIX */}
        {/* ========================================================================= */}
        <section id="skills-matrix-section" className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Skills Accreditation Matrix</h2>
              <p className="text-xs text-slate-500">
                Pass at least 5 skill categories (80%+ score) to complete Phase 1. Two consecutive failures lock a category for 90 days.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>{passedQuizzesCount} of {skillMatrix.length} Categories Accredited</span>
            </div>
          </div>

          {/* Matrix Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {skillMatrix.map((item) => (
              <div
                key={item.category}
                className={`p-5 rounded-2xl border transition flex flex-col justify-between ${
                  item.isPassed
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : item.isLocked
                    ? 'border-rose-200 bg-rose-50/10'
                    : item.failCount === 1
                    ? 'border-amber-200 bg-amber-50/10'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {item.category}
                    </h3>
                    {item.isPassed ? (
                      <span className="shrink-0 inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        {item.bestScore}%
                      </span>
                    ) : item.isLocked ? (
                      <span className="shrink-0 inline-flex items-center gap-1 bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        <Lock className="w-3 h-3" />
                        Locked
                      </span>
                    ) : item.failCount === 1 ? (
                      <span className="shrink-0 inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        1 Try Left
                      </span>
                    ) : (
                      <span className="shrink-0 inline-flex items-center text-slate-400 text-[10px] font-medium bg-slate-100 px-2 py-0.5 rounded-full">
                        Unverified
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500">
                    20 Questions • Passing Benchmark: {passingScore}%
                  </p>

                  {/* 1st Failure Warning Note & Course Link */}
                  {!item.isPassed && item.failCount === 1 && !item.isLocked && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-800">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>⚠️ 1 Attempt Remaining</span>
                      </div>
                      <a
                        href="https://dspacademy.online/courses"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 hover:text-emerald-900 transition"
                      >
                        <GraduationCap className="w-3 h-3" />
                        <span>Take Refresher Digital & Growth Marketing Course →</span>
                      </a>
                    </div>
                  )}

                  {/* 2nd Failure 90-Day Lockout Banner */}
                  {item.isLocked && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-800">
                        <Timer className="w-3.5 h-3.5 shrink-0" />
                        <span>Retry unlocked in {item.cooldownDaysRemaining} Days</span>
                      </div>
                      <p className="text-[10px] text-rose-600 leading-tight">
                        Attempt other skill categories to complete your 5 required passing scores.
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom Action Button */}
                <div className="pt-4 mt-4 border-t border-slate-100">
                  {item.isPassed ? (
                    <div className="text-xs font-semibold text-emerald-700 flex items-center justify-center gap-1 py-1.5">
                      <Award className="w-3.5 h-3.5" />
                      <span>Passed & Accredited</span>
                    </div>
                  ) : item.isLocked ? (
                    <button
                      disabled
                      className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-slate-100 text-slate-400 cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Cooldown Active (90 Days)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenQuizModal(item)}
                      className={`w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition cursor-pointer shadow-2xs ${
                        item.failCount === 1
                          ? 'bg-amber-600 hover:bg-amber-700 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      }`}
                    >
                      <span>{item.failCount === 1 ? 'Retake Final Attempt' : 'Take Diagnostic Quiz'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        </section>

      </main>

      {/* ========================================================================= */}
      {/* 4. INTERACTIVE QUIZ ASSESSMENT MODAL */}
      {/* ========================================================================= */}
      {activeModalCategory && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-fadeIn">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900">{activeModalCategory.category}</h3>
                <span className="text-[11px] text-slate-500 font-mono">
                  Benchmark: {passingScore}% • Time Limit: {timeLimitMinutes}m
                </span>
              </div>
              <button
                onClick={handleCloseQuizModal}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* State 1: Test Results Screen */}
              {quizResult ? (
                <div className="text-center py-6 space-y-5">
                  <div className={`w-16 h-16 rounded-3xl mx-auto flex items-center justify-center shadow-inner ${
                    quizResult.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {quizResult.passed ? <Award className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-xl font-bold text-slate-900">
                      {quizResult.passed ? 'Diagnostic Assessment Passed!' : 'Assessment Benchmark Not Met'}
                    </h4>
                    <p className="text-sm font-semibold text-slate-600">
                      Score: <span className={quizResult.passed ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>{quizResult.score}%</span> ({quizResult.correctCount} of {quizResult.totalCount} correct)
                    </p>
                  </div>

                  {!quizResult.passed && (
                    <div className="max-w-md mx-auto p-4 rounded-2xl border text-xs text-left space-y-2 bg-slate-50 border-slate-200">
                      {quizResult.newFailCount >= 2 ? (
                        <p className="text-rose-700 font-semibold">
                          You have reached 2 consecutive unsuccessful attempts. This skill category is now locked for 90 days. You can continue attempting other categories to fulfill your 5-skill Phase 1 goal.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-amber-800 font-medium">
                            ⚠️ 1 attempt remaining for this skill. We recommend reviewing course materials before retaking.
                          </p>
                          <a
                            href="https://dspacademy.online/courses"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-900 font-semibold"
                          >
                            <GraduationCap className="w-4 h-4" />
                            <span>Take Refresher Digital & Growth Marketing Course →</span>
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-4">
                    <button
                      onClick={handleCloseQuizModal}
                      className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition cursor-pointer shadow-xs"
                    >
                      Return to Skills Matrix
                    </button>
                  </div>
                </div>
              ) : modalQuestions.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mx-auto" />
                  <p className="text-xs text-slate-500">Loading diagnostic question bank...</p>
                </div>
              ) : (
                /* State 2: Active Question View */
                <div className="space-y-6">
                  
                  {/* Quick Demo Simulator Buttons */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                    <span className="font-semibold text-slate-600">Testing Simulation:</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSimulateQuizResult(true)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] transition cursor-pointer shadow-2xs"
                      >
                        Pass Quiz (Demo)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSimulateQuizResult(false)}
                        className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[11px] transition cursor-pointer shadow-2xs"
                      >
                        Fail Quiz (Demo)
                      </button>
                    </div>
                  </div>

                  {/* Progress Header */}
                  <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                    <span>Question {currentQuestionIndex + 1} of {modalQuestions.length}</span>
                    <span className="font-mono text-slate-400 capitalize">{modalQuestions[currentQuestionIndex].difficulty}</span>
                  </div>

                  {/* Question Text */}
                  <h4 className="text-base font-bold text-slate-900 leading-snug">
                    {modalQuestions[currentQuestionIndex].question_text}
                  </h4>

                  {/* Options List */}
                  <div className="space-y-2.5">
                    {modalQuestions[currentQuestionIndex].options.map((opt) => {
                      const currentQId = modalQuestions[currentQuestionIndex].id;
                      const isSelected = userAnswers[currentQId] === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setUserAnswers((prev) => ({ ...prev, [currentQId]: opt.id }));
                          }}
                          className={`w-full text-left p-3.5 rounded-2xl border text-xs font-medium transition flex items-start gap-3 cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50/80 border-emerald-600 text-emerald-950 font-semibold ring-1 ring-emerald-600 shadow-2xs'
                              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-lg border flex items-center justify-center text-[10px] font-bold uppercase shrink-0 ${
                            isSelected ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-500 border-slate-200'
                          }`}>
                            {opt.id}
                          </span>
                          <span className="flex-1 leading-relaxed">{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer Controls */}
            {!quizResult && modalQuestions.length > 0 && (
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <button
                  type="button"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 disabled:opacity-40 transition cursor-pointer"
                >
                  Previous
                </button>

                {currentQuestionIndex < modalQuestions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer shadow-xs"
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmittingQuiz}
                    onClick={handleSubmitQuiz}
                    className="px-6 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    {isSubmittingQuiz ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>Submit Assessment</span>
                  </button>
                )}
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
