'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { supabase, addSkillToTalent } from '../lib/supabaseClient';
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
  UserCheck,
  Edit3,
  Save,
  Plus,
  Trash2,
  Globe,
  Github,
  Linkedin,
  Phone,
  MessageSquare,
  Cpu,
  Layers,
  Check,
  TrendingUp,
  Image as ImageIcon,
  User,
  Camera,
  Play,
  RotateCcw,
  CheckCircle,
  XCircle,
  Info,
  Sliders,
  ToggleLeft,
  ToggleRight,
  CheckSquare,
  Trophy,
  Download,
  Share2
} from 'lucide-react';
import ConfettiSuccess from './ConfettiSuccess';
import EmployerVisibilityCard from './talent/EmployerVisibilityCard';
import TalentProfileEditForm from './TalentProfileEditForm';
import { SKILL_QUIZ_DEFINITIONS, SkillCategoryDefinition, QuizQuestion } from '../data/quizQuestions';

// ==============================================================================
// WORK TYPE AVAILABILITY OPTIONS (INTERNSHIP, VOLUNTEER, FREELANCE, FULL-TIME)
// ==============================================================================
export const WORK_TYPE_OPTIONS = ['Full-Time', 'Freelance', 'Internship', 'Volunteer'] as const;
export type WorkTypeOption = typeof WORK_TYPE_OPTIONS[number];

export interface ProfileFormData {
  profile_picture_url: string;
  role_title: string;
  headline: string;
  bio: string;
  years_experience: number;
  location: string;
  remote_preference: string;
  availability_status: string;
  work_availability_type: string[];
  contact_email: string;
  phone_number: string;
  whatsapp_number: string;
  cv_url: string;
  portfolio_url: string;
  github_url: string;
  linkedin_url: string;
  work_history: WorkHistoryItem[];
  education: EducationItem[];
  case_studies: CaseStudyItem[];
  ai_tools_input: string;
  certifications_input: string;
}

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

export interface TalentProfile {
  id: string;
  user_id?: string;
  full_name: string;
  role_title?: string;
  headline?: string;
  bio?: string | null;
  years_experience?: number;
  location?: string | null;
  remote_preference?: 'Remote' | 'Hybrid' | 'On-site' | string;
  placement_status?: PlacementStatus;
  availability_status?: 'available' | 'hired' | string;
  work_availability_type?: string[] | null;
  contact_email?: string;
  phone_number?: string;
  whatsapp_number?: string;
  cv_url?: string | null;
  portfolio_url?: string | null;
  github_url?: string | null;
  linkedin_url?: string | null;
  profile_picture_url?: string | null;
  work_history?: WorkHistoryItem[] | null;
  education?: EducationItem[] | null;
  case_studies?: CaseStudyItem[] | null;
  ai_tools?: string[] | null;
  certifications?: string[] | null;
  skills?: string[] | null;
  is_verified_badge?: boolean;
  phase_1_quizzes_passed?: number;
  phase_1_completed?: boolean;
  phase_2_unlocked?: boolean;
  manual_phase_2_unlocked?: boolean;
  phase_3_unlocked?: boolean;
  manual_phase_3_unlocked?: boolean;
  admin_unlocked_categories?: string[] | null;
  phase_2_calendar_link?: string | null;
  phase_1_status?: Phase1Status;
  phase_2_status?: Phase2Status;
  phase_3_status?: Phase3Status;
  view_count?: number;
  click_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface SkillCategoryItem {
  category: string;
  totalQuestions: number;
  isPassed: boolean;
  isAdminBypassed?: boolean;
  bestScore?: number;
  failCount: number;
  attemptsCount: number;
  isLocked: boolean;
  cooldownDaysRemaining: number;
  lastAttemptDate?: string;
}

export interface TalentProfileProps {
  onSignOut?: () => void;
  navigateToPage?: (page: any) => void;
}

// 9 Standard Skill Categories
const DEFAULT_SKILL_CATEGORIES = [
  'Paid Media & PPC',
  'SEO & Organic Growth',
  'CRO & Conversion Optimization',
  'Analytics & Attribution',
  'AI & Automation Strategy',
  'Email & Lifecycle Automation',
  'Growth Marketing Strategy',
  'Full-Stack Digital Marketing',
  'General Digital Marketing'
];

/**
 * Generates uppercase candidate initials from full name or fallback.
 */
function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return 'TP';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function TalentProfileComponent({ onSignOut, navigateToPage }: TalentProfileProps) {
  const { user } = useSupabase();

  // Profile & Matrix Data
  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [skillMatrix, setSkillMatrix] = useState<SkillCategoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [imageError, setImageError] = useState<boolean>(false);

  // Quiz Modal State Engine
  const [activeQuizCategory, setActiveQuizCategory] = useState<string | null>(null);
  const [quizModalStep, setQuizModalStep] = useState<'INSTRUCTIONS' | 'LIVE' | 'RESULTS' | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(600); // 10 minutes
  const [quizStartTime, setQuizStartTime] = useState<number>(Date.now());
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState<boolean>(false);
  const [activeQuizQuestions, setActiveQuizQuestions] = useState<QuizQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState<boolean>(false);
  const [categoryQuestionCounts, setCategoryQuestionCounts] = useState<Record<string, number>>({});
  const [showPhase1Congratulations, setShowPhase1Congratulations] = useState<boolean>(false);
  const initialLoadedRef = useRef<boolean>(false);
  const isFetchingRef = useRef<boolean>(false);
  const [quizScoreResult, setQuizScoreResult] = useState<{
    scorePercentage: number;
    passed: boolean;
    correctCount: number;
    totalCount: number;
    attemptsUsed: number;
    isNowLocked: boolean;
    cooldownDays: number;
  } | null>(null);

  // Edit Form Buffer
  const [formData, setFormData] = useState<{
    profile_picture_url: string;
    role_title: string;
    headline: string;
    bio: string;
    years_experience: number;
    location: string;
    remote_preference: string;
    availability_status: string;
    work_availability_type: string[];
    contact_email: string;
    phone_number: string;
    whatsapp_number: string;
    cv_url: string;
    portfolio_url: string;
    github_url: string;
    linkedin_url: string;
    work_history: WorkHistoryItem[];
    education: EducationItem[];
    case_studies: CaseStudyItem[];
    ai_tools_input: string;
    certifications_input: string;
  }>({
    profile_picture_url: '',
    role_title: '',
    headline: '',
    bio: '',
    years_experience: 3,
    location: '',
    remote_preference: 'Remote',
    availability_status: 'available',
    work_availability_type: ['Full-Time', 'Freelance'],
    contact_email: '',
    phone_number: '',
    whatsapp_number: '',
    cv_url: '',
    portfolio_url: '',
    github_url: '',
    linkedin_url: '',
    work_history: [],
    education: [],
    case_studies: [],
    ai_tools_input: '',
    certifications_input: ''
  });

  // ----------------------------------------------------------------------------
  // Toggle Work Availability Type ('Full-Time' | 'Freelance' | 'Internship' | 'Volunteer')
  // ----------------------------------------------------------------------------
  const handleToggleWorkType = async (type: string) => {
    if (!profile) return;
    const currentList = Array.isArray(profile.work_availability_type)
      ? [...profile.work_availability_type]
      : ['Full-Time', 'Freelance'];

    const exists = currentList.includes(type);
    const updatedList = exists
      ? currentList.filter((item) => item !== type)
      : [...currentList, type];

    // Immediate optimistic local update
    setProfile((prev) => (prev ? { ...prev, work_availability_type: updatedList } : null));
    setFormData((prev) => ({ ...prev, work_availability_type: updatedList }));

    setToastMessage(`Work Preference updated: ${updatedList.length > 0 ? updatedList.join(', ') : 'None selected'}`);
    setTimeout(() => setToastMessage(null), 3000);

    try {
      const { error } = await supabase
        .from('talent_profiles')
        .update({
          work_availability_type: updatedList,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) {
        console.error('Error updating work_availability_type:', error);
      }
    } catch (err: any) {
      console.error('Error in handleToggleWorkType:', err);
    }
  };

  // ----------------------------------------------------------------------------
  // Toggle Availability Status ('available' vs 'hired')
  // ----------------------------------------------------------------------------
  const handleToggleAvailability = async (targetStatus?: 'available' | 'hired') => {
    if (!profile) return;
    const currentStatus = profile.availability_status === 'hired' || profile.placement_status === 'HIRED' ? 'hired' : 'available';
    const nextStatus = targetStatus || (currentStatus === 'available' ? 'hired' : 'available');
    const nextPlacementStatus = nextStatus === 'available' ? 'AVAILABLE' : 'HIRED';

    // Optimistic UI update
    setProfile((prev) => prev ? {
      ...prev,
      availability_status: nextStatus,
      placement_status: nextPlacementStatus
    } : null);

    setFormData((prev) => ({
      ...prev,
      availability_status: nextStatus
    }));

    const statusLabel = nextStatus === 'available' ? 'Available for Placement' : 'Hired';
    setToastMessage(`Status updated to ${statusLabel}`);
    setTimeout(() => setToastMessage(null), 3000);

    try {
      const { error } = await supabase
        .from('talent_profiles')
        .update({
          availability_status: nextStatus,
          placement_status: nextPlacementStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) {
        console.error('Error updating availability_status:', error);
      }
    } catch (err: any) {
      console.error('Error in handleToggleAvailability:', err);
    }
  };

  // ----------------------------------------------------------------------------
  // Question Options Shuffler (Scatters correct answers dynamically across A, B, C, D)
  // ----------------------------------------------------------------------------
  const shuffleQuestionOptions = (questions: any[]): (QuizQuestion & {
    shuffledOptions: string[];
    correctAnswerLetter: string;
    correctAnswerIndex: number;
    correct_answer_text?: string;
    correct_answer?: string;
    correct_answer_index?: number;
  })[] => {
    if (!Array.isArray(questions)) return [];
    return questions.map((q: any) => {
      // Determine the raw options array
      const rawOptions: string[] = Array.isArray(q.options) && q.options.length > 0
        ? q.options.map((opt: any) => (typeof opt === 'string' ? opt : (opt?.text || opt?.label || String(opt))))
        : (Array.isArray(q.shuffledOptions) && q.shuffledOptions.length > 0
          ? q.shuffledOptions
          : ['Option A', 'Option B', 'Option C', 'Option D']);

      // Determine the original correct index or answer text from various schemas
      let origCorrectIdx = 0;
      if (typeof q.correctAnswerIndex === 'number' && q.correctAnswerIndex >= 0 && q.correctAnswerIndex < rawOptions.length) {
        origCorrectIdx = q.correctAnswerIndex;
      } else if (typeof q.correct_answer_index === 'number' && q.correct_answer_index >= 0 && q.correct_answer_index < rawOptions.length) {
        origCorrectIdx = q.correct_answer_index;
      } else if (typeof q.correctIdx === 'number' && q.correctIdx >= 0 && q.correctIdx < rawOptions.length) {
        origCorrectIdx = q.correctIdx;
      } else if (q.correct_option_id !== undefined && q.correct_option_id !== null) {
        const rawId = String(q.correct_option_id).trim();
        if (['A', 'B', 'C', 'D'].includes(rawId.toUpperCase())) {
          origCorrectIdx = rawId.toUpperCase().charCodeAt(0) - 65;
        } else if (!isNaN(Number(rawId)) && Number(rawId) >= 0 && Number(rawId) < rawOptions.length) {
          origCorrectIdx = Number(rawId);
        }
      }

      const correctText = q.correct_answer || q.correct_answer_text || rawOptions[origCorrectIdx] || rawOptions[0];

      // Combine options with their original index or correct flag
      const optionsWithMetadata = rawOptions.map((optionText: string, idx: number) => ({
        text: optionText,
        isCorrect: idx === origCorrectIdx || (correctText && optionText.trim().toLowerCase() === String(correctText).trim().toLowerCase()),
      }));

      // Fisher-Yates Shuffle algorithm for options
      for (let i = optionsWithMetadata.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [optionsWithMetadata[i], optionsWithMetadata[j]] = [optionsWithMetadata[j], optionsWithMetadata[i]];
      }

      // Find the new index of the correct answer post-shuffle
      let newCorrectIndex = optionsWithMetadata.findIndex((opt: any) => opt.isCorrect);
      if (newCorrectIndex === -1) newCorrectIndex = 0;
      const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
      const shuffledOptions = optionsWithMetadata.map((opt: any) => opt.text);

      return {
        ...q,
        options: shuffledOptions,
        shuffledOptions,
        correctAnswerLetter: optionLetters[newCorrectIndex] || 'A',
        correctAnswerIndex: newCorrectIndex,
        correctIdx: newCorrectIndex,
        correct_answer_index: newCorrectIndex,
        correct_answer: correctText,
        correct_answer_text: correctText,
      };
    });
  };

  // ----------------------------------------------------------------------------
  // Helper: Aggregate Skill Matrix from Quiz Attempts
  // ----------------------------------------------------------------------------
  const buildSkillMatrix = useCallback((attempts: any[], customCounts?: Record<string, number>, currentSkills?: string[], adminBypassed?: string[]) => {
    const now = Date.now();
    return DEFAULT_SKILL_CATEGORIES.map((catName) => {
      const catAttempts = (attempts || [])
        .filter((a: any) => (a.skill_category || a.category || a.specialty) === catName)
        .sort((a, b) => {
          const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
          const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
          return timeB - timeA;
        });

      const isAdminBypassed = Array.isArray(adminBypassed) && adminBypassed.includes(catName);
      const hasPassed = isAdminBypassed || catAttempts.some((a: any) => a.passed === true || Number(a.score_percentage ?? a.score ?? 0) >= 80) ||
        (Array.isArray(currentSkills) && currentSkills.includes(catName));

      const bestScore = catAttempts.length > 0 
        ? Math.max(...catAttempts.map((a: any) => Number(a.score_percentage ?? a.score ?? 0))) 
        : hasPassed ? 100 : undefined;

      const failAttempts = catAttempts.filter((a: any) => !a.passed && Number(a.score_percentage ?? a.score ?? 0) < 80);
      const failCount = failAttempts.length;
      const attemptsCount = catAttempts.length;

      let isLocked = false;
      let cooldownDaysRemaining = 0;

      // Lock category for 90 days after 2+ failed attempts ONLY if not passed
      if (!hasPassed && failCount >= 2 && failAttempts[0]) {
        const latestFailTime = failAttempts[0].created_at ? new Date(failAttempts[0].created_at).getTime() : now;
        const cooldownEnd = latestFailTime + 90 * 24 * 60 * 60 * 1000;
        if (now < cooldownEnd) {
          isLocked = true;
          cooldownDaysRemaining = Math.max(1, Math.ceil((cooldownEnd - now) / (1000 * 60 * 60 * 24)));
        }
      }

      const dbCount = customCounts ? customCounts[catName] : undefined;
      const totalQCount = typeof dbCount === 'number' && dbCount > 0
        ? dbCount
        : (SKILL_QUIZ_DEFINITIONS[catName]?.questions?.length || 5);

      return {
        category: catName,
        totalQuestions: totalQCount,
        isPassed: hasPassed,
        isAdminBypassed,
        bestScore,
        failCount,
        attemptsCount,
        isLocked,
        cooldownDaysRemaining,
        lastAttemptDate: catAttempts[0]?.created_at
      };
    });
  }, []);

  // ----------------------------------------------------------------------------
  // Fetch Candidate Profile & Verification Pipeline Data
  // ----------------------------------------------------------------------------
  const fetchTalentProfile = useCallback(async (isSilent = false, force = false) => {
    if (isFetchingRef.current && !force) return;
    isFetchingRef.current = true;

    if (!isSilent && !initialLoadedRef.current) {
      setLoading(true);
    }
    try {
      const { data: authData } = await supabase.auth.getUser();
      const currentAuthUser = authData?.user || user;

      if (!currentAuthUser) {
        setLoading(false);
        return;
      }

      // Fetch Profile Record
      let { data: profileData } = await supabase
        .from('talent_profiles')
        .select('*')
        .eq('id', currentAuthUser.id)
        .maybeSingle();

      // Self-heal initial profile if none exists
      if (!profileData) {
        const fullName = currentAuthUser.user_metadata?.full_name || currentAuthUser.email?.split('@')[0] || 'Candidate Specialist';
        const defaultProfile: TalentProfile = {
          id: currentAuthUser.id,
          user_id: currentAuthUser.id,
          full_name: fullName,
          profile_picture_url: currentAuthUser.user_metadata?.avatar_url || null,
          role_title: 'Growth & Performance Marketing Specialist',
          headline: 'Full-Funnel Acquisition, Paid Search & Lifecycle Automation Lead',
          bio: 'Data-driven marketing practitioner with proven experience managing full-funnel acquisition, paid performance, and customer retention loops.',
          years_experience: 4,
          location: 'Remote Global',
          remote_preference: 'Remote',
          placement_status: 'AVAILABLE',
          availability_status: 'available',
          contact_email: currentAuthUser.email || '',
          phone_number: '',
          whatsapp_number: '',
          cv_url: '',
          portfolio_url: '',
          github_url: '',
          linkedin_url: '',
          work_history: [
            {
              company: 'ScaleX Digital',
              role: 'Senior Growth Strategist',
              duration: '2022 - Present',
              description: 'Scaled paid media budgets across Meta and Google PMax, improving customer acquisition efficiency by 34%.'
            }
          ],
          education: [
            {
              school: 'University of Lagos',
              degree: 'B.Sc. Mass Communication & Marketing',
              year: '2020'
            }
          ],
          case_studies: [
            {
              title: 'Scaling DTC E-Commerce Paid ROAS from 2.1x to 4.5x',
              client_or_brand: 'Nordic Cleanse',
              metrics_achieved: '+185% Revenue Lift, $2.4M ARR Added',
              description: 'Restructured conversion APIs, built high-converting interactive advertorial landing pages, and implemented cohort-based creative testing.',
              link: 'https://digitalcampux.com'
            }
          ],
          ai_tools: ['ChatGPT Plus', 'Midjourney', 'Claude 3.5 Sonnet', 'Perplexity', 'Make.com', 'Zapier AI'],
          certifications: ['Google Ads Search Certified', 'Meta Certified Media Buying Professional', 'HubSpot Inbound Marketing'],
          is_verified_badge: false,
          phase_1_quizzes_passed: 0,
          phase_1_completed: false,
          phase_2_unlocked: false,
          phase_1_status: 'IN_PROGRESS',
          phase_2_status: 'LOCKED',
          phase_3_status: 'LOCKED'
        };

        const { data: created } = await supabase
          .from('talent_profiles')
          .insert([defaultProfile])
          .select()
          .single();

        profileData = created || defaultProfile;
      }

      // Fetch exact question counts per skill_category from live quiz_questions table
      let liveQuestionCounts: Record<string, number> = {};
      try {
        const { data: qCountData, error: qCountError } = await supabase
          .from('quiz_questions')
          .select('skill_category');

        if (!qCountError && qCountData && qCountData.length > 0) {
          qCountData.forEach((q: any) => {
            const cat = q.skill_category;
            if (cat) {
              liveQuestionCounts[cat] = (liveQuestionCounts[cat] || 0) + 1;
            }
          });
        }
      } catch (countErr) {
        console.warn('Could not query quiz_questions count:', countErr);
      }
      setCategoryQuestionCounts(liveQuestionCounts);

      // Fetch Quiz Attempts from all sources: quiz_attempts, talent_quiz_attempts, localStorage
      const targetTalentId = profileData.id || currentAuthUser.id;
      let allMergedAttempts: any[] = [];

      try {
        const { data: qData } = await supabase
          .from('quiz_attempts')
          .select('*')
          .or(`talent_id.eq.${targetTalentId},talent_id.eq.${currentAuthUser.id}`);
        if (qData && Array.isArray(qData)) {
          allMergedAttempts.push(...qData);
        }
      } catch (err) {
        console.warn('quiz_attempts select error:', err);
      }

      try {
        const { data: tData } = await supabase
          .from('talent_quiz_attempts')
          .select('*')
          .or(`talent_id.eq.${targetTalentId},talent_id.eq.${currentAuthUser.id}`);
        if (tData && Array.isArray(tData)) {
          allMergedAttempts.push(...tData);
        }
      } catch (err) {
        console.warn('talent_quiz_attempts select error:', err);
      }

      // Read local storage attempts cache
      try {
        const localAttempts = JSON.parse(localStorage.getItem('dsp_talent_quiz_attempts') || '[]');
        if (Array.isArray(localAttempts)) {
          const userLocal = localAttempts.filter((a: any) => !a.talent_id || a.talent_id === targetTalentId || a.talent_id === currentAuthUser.id);
          allMergedAttempts.push(...userLocal);
        }
      } catch (err) {
        console.warn('localStorage quiz attempts parse error:', err);
      }

      // Calculate all passed skill categories from attempts
      const passedAttempts = allMergedAttempts.filter(
        (a: any) => a.passed === true || Number(a.score_percentage ?? a.score ?? 0) >= 80
      );
      const passedFromAttempts = passedAttempts
        .map((a: any) => a.skill_category || a.category || a.specialty)
        .filter(Boolean);

      // Extract admin bypassed categories
      const adminBypassedCats: string[] = Array.isArray(profileData.admin_unlocked_categories)
        ? profileData.admin_unlocked_categories
        : [];

      // Merge with any skills already saved on the profile record and admin bypassed categories
      const existingProfileSkills = Array.isArray(profileData.skills) ? profileData.skills : [];
      const distinctPassedCategories = Array.from(
        new Set([...passedFromAttempts, ...existingProfileSkills, ...adminBypassedCats])
      );

      const passedCount = Math.max(
        distinctPassedCategories.length,
        Number(profileData.phase_1_quizzes_passed || 0)
      );

      const isManualPhase2 = Boolean(profileData.manual_phase_2_unlocked);
      const isManualPhase3 = Boolean(profileData.manual_phase_3_unlocked);

      const isPhase1Passed = passedCount >= 5 || 
        Boolean(profileData.phase_1_completed) || 
        isManualPhase2 || 
        String(profileData.phase_1_status || '').toLowerCase() === 'passed';

      const isPhase2Unlocked = isPhase1Passed || 
        Boolean(profileData.phase_2_unlocked) || 
        isManualPhase2;

      const isPhase3Unlocked = Boolean(profileData.phase_3_unlocked) || isManualPhase3;

      // Accredited skills from passed quizzes and admin overrides (Max 5)
      const dynamicAccreditedSkills = distinctPassedCategories.slice(0, 5);

      // Automatically sync completed flags to Supabase if 5 quizzes passed or manual override
      if (isPhase1Passed && (!profileData.phase_1_completed || !profileData.phase_2_unlocked || profileData.phase_1_status !== 'PASSED' || (profileData.phase_1_quizzes_passed || 0) < passedCount)) {
        try {
          await supabase
            .from('talent_profiles')
            .update({
              phase_1_quizzes_passed: passedCount,
              phase_1_completed: true,
              phase_2_unlocked: true,
              phase_1_status: 'PASSED',
              phase_2_status: profileData.phase_2_status === 'LOCKED' || !profileData.phase_2_status ? 'PENDING_SCHEDULE' : profileData.phase_2_status,
              skills: dynamicAccreditedSkills,
              updated_at: new Date().toISOString()
            })
            .eq('id', targetTalentId);
        } catch (autoUpdateErr) {
          console.warn('Auto sync phase 1 complete error:', autoUpdateErr);
        }
      }

      const matrix = buildSkillMatrix(allMergedAttempts, liveQuestionCounts, dynamicAccreditedSkills, adminBypassedCats);
      setSkillMatrix(matrix);

      const normalizedProfile: TalentProfile = {
        ...profileData,
        profile_picture_url: profileData.profile_picture_url || null,
        role_title: profileData.role_title || profileData.headline || 'Growth Marketing Specialist',
        years_experience: profileData.years_experience || profileData.years_of_experience || 4,
        contact_email: profileData.contact_email || profileData.email || currentAuthUser.email || '',
        phone_number: profileData.phone_number || '',
        whatsapp_number: profileData.whatsapp_number || '',
        cv_url: profileData.cv_url || '',
        portfolio_url: profileData.portfolio_url || '',
        github_url: profileData.github_url || '',
        linkedin_url: profileData.linkedin_url || '',
        remote_preference: profileData.remote_preference || 'Remote',
        placement_status: profileData.placement_status || 'AVAILABLE',
        availability_status: profileData.availability_status === 'hired' || profileData.placement_status === 'HIRED' ? 'hired' : 'available',
        work_availability_type: Array.isArray(profileData.work_availability_type) && profileData.work_availability_type.length > 0
          ? profileData.work_availability_type
          : ['Full-Time', 'Freelance'],
        work_history: Array.isArray(profileData.work_history) ? profileData.work_history : [],
        education: Array.isArray(profileData.education) ? profileData.education : [],
        case_studies: Array.isArray(profileData.case_studies) ? profileData.case_studies : [],
        ai_tools: Array.isArray(profileData.ai_tools) ? profileData.ai_tools : ['ChatGPT', 'Midjourney', 'Zapier AI'],
        certifications: Array.isArray(profileData.certifications) ? profileData.certifications : ['Google Ads Search', 'Meta Media Buyer'],
        skills: dynamicAccreditedSkills,
        admin_unlocked_categories: adminBypassedCats,
        manual_phase_2_unlocked: isManualPhase2,
        manual_phase_3_unlocked: isManualPhase3,
        phase_3_unlocked: isPhase3Unlocked,
        phase_2_calendar_link: profileData.phase_2_calendar_link || null,
        phase_1_quizzes_passed: passedCount,
        phase_1_completed: isPhase1Passed,
        phase_2_unlocked: isPhase2Unlocked,
        phase_1_status: isPhase1Passed ? 'PASSED' : (profileData.phase_1_status || 'IN_PROGRESS'),
        phase_2_status: isPhase2Unlocked && (!profileData.phase_2_status || profileData.phase_2_status === 'LOCKED')
          ? 'PENDING_SCHEDULE'
          : (profileData.phase_2_status || (isPhase2Unlocked ? 'PENDING_SCHEDULE' : 'LOCKED')),
        phase_3_status: profileData.phase_3_status || (profileData.is_verified_badge ? 'VERIFIED' : 'LOCKED'),
        is_verified_badge: Boolean(profileData.is_verified_badge),
        view_count: Number(profileData.view_count || 142),
        click_count: Number(profileData.click_count || 34)
      };

      setProfile(normalizedProfile);

      // Populate Edit Form Buffer only on initial load or if user is not editing
      if (!initialLoadedRef.current) {
        setFormData({
          profile_picture_url: normalizedProfile.profile_picture_url || '',
          role_title: normalizedProfile.role_title || '',
          headline: normalizedProfile.headline || '',
          bio: normalizedProfile.bio || '',
          years_experience: normalizedProfile.years_experience || 4,
          location: normalizedProfile.location || '',
          remote_preference: normalizedProfile.remote_preference || 'Remote',
          availability_status: normalizedProfile.availability_status || 'available',
          work_availability_type: Array.isArray(normalizedProfile.work_availability_type) && normalizedProfile.work_availability_type.length > 0
            ? normalizedProfile.work_availability_type
            : ['Full-Time', 'Freelance'],
          contact_email: normalizedProfile.contact_email || '',
          phone_number: normalizedProfile.phone_number || '',
          whatsapp_number: normalizedProfile.whatsapp_number || '',
          cv_url: normalizedProfile.cv_url || '',
          portfolio_url: normalizedProfile.portfolio_url || '',
          github_url: normalizedProfile.github_url || '',
          linkedin_url: normalizedProfile.linkedin_url || '',
          work_history: normalizedProfile.work_history || [],
          education: normalizedProfile.education || [],
          case_studies: normalizedProfile.case_studies || [],
          ai_tools_input: (normalizedProfile.ai_tools || []).join(', '),
          certifications_input: (normalizedProfile.certifications || []).join(', ')
        });
      }
      setImageError(false);
      initialLoadedRef.current = true;
    } catch (err: any) {
      console.error('Error fetching talent profile:', err);
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  }, [user?.id, buildSkillMatrix]);

  useEffect(() => {
    fetchTalentProfile();
  }, [fetchTalentProfile]);

  // ----------------------------------------------------------------------------
  // Live Countdown Timer for Running Quiz
  // ----------------------------------------------------------------------------
  useEffect(() => {
    let interval: any = null;
    if (quizModalStep === 'LIVE') {
      interval = setInterval(() => {
        setTimeRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [quizModalStep]);

  // Trigger auto submit when time hits 0 in LIVE mode
  useEffect(() => {
    if (quizModalStep === 'LIVE' && timeRemainingSeconds === 0) {
      handleAutoSubmitQuiz();
    }
  }, [quizModalStep, timeRemainingSeconds]);

  // ----------------------------------------------------------------------------
  // Smooth Scroll Helper to Quiz Section
  // ----------------------------------------------------------------------------
  const scrollToQuizSection = () => {
    const el = document.getElementById('quiz-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // ----------------------------------------------------------------------------
  // Quiz Flow Controllers
  // ----------------------------------------------------------------------------
  const handleOpenQuizInstructions = async (categoryName: string) => {
    const matrixItem = skillMatrix.find((s) => s.category === categoryName);
    if (matrixItem?.isLocked) {
      return; // Locked category cannot be opened
    }
    setActiveQuizCategory(categoryName);
    setQuizModalStep('INSTRUCTIONS');
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setTimeRemainingSeconds(600); // 10 minutes
    setQuizScoreResult(null);
    setLoadingQuestions(true);

    try {
      // 1. Fetch ALL diagnostic questions from Supabase by skill_category without any .limit(5) or .slice(0, 5)
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('skill_category', categoryName);

      console.log(`[TalentProfile] Fetched questions from quiz_questions for "${categoryName}":`, {
        totalCount: data?.length || 0,
        data,
        error
      });

      if (!error && data && data.length > 0) {
        const loadedQuestions: QuizQuestion[] = data.map((q: any, idx: number) => {
          let opts: string[] = [];
          if (Array.isArray(q.options)) {
            opts = q.options.map((opt: any) =>
              typeof opt === 'string' ? opt : (opt?.text || opt?.label || String(opt))
            );
          } else if (typeof q.options === 'string') {
            try {
              const parsed = JSON.parse(q.options);
              if (Array.isArray(parsed)) {
                opts = parsed.map((opt: any) =>
                  typeof opt === 'string' ? opt : (opt?.text || opt?.label || String(opt))
                );
              }
            } catch {
              opts = [q.options];
            }
          }

          let correctIdx = 0;
          if (typeof q.correctIdx === 'number') {
            correctIdx = q.correctIdx;
          } else if (q.correct_option_id !== undefined && q.correct_option_id !== null) {
            const rawId = String(q.correct_option_id).trim();
            if (Array.isArray(q.options) && q.options.some((o: any) => typeof o === 'object' && o.id)) {
              const foundIdx = q.options.findIndex((o: any) => String(o.id) === rawId);
              if (foundIdx >= 0) correctIdx = foundIdx;
            } else if (!isNaN(Number(rawId)) && Number(rawId) >= 0 && Number(rawId) < opts.length) {
              correctIdx = Number(rawId);
            } else if (['A', 'B', 'C', 'D', 'E'].includes(rawId.toUpperCase())) {
              correctIdx = rawId.toUpperCase().charCodeAt(0) - 65;
            } else {
              const foundIdx = opts.findIndex((o) => o === rawId);
              if (foundIdx >= 0) correctIdx = foundIdx;
            }
          }

          return {
            id: q.id ? String(q.id) : `db-q-${idx}`,
            question: q.question_text || q.question || 'Question',
            options: opts.length > 0 ? opts : ['Option A', 'Option B', 'Option C', 'Option D'],
            correctIdx,
            explanation: q.explanation || 'Refer to verified industry best practices.'
          };
        });

        // Shuffle question options so correct answers are randomly scattered across A, B, C, D
        const shuffledQuestions = shuffleQuestionOptions(loadedQuestions);

        // Ensure ALL questions are loaded into state without truncation
        setActiveQuizQuestions(shuffledQuestions);
        setCategoryQuestionCounts((prev) => ({ ...prev, [categoryName]: shuffledQuestions.length }));
        setSkillMatrix((prev) =>
          prev.map((item) =>
            item.category === categoryName
              ? { ...item, totalQuestions: shuffledQuestions.length }
              : item
          )
        );
      } else {
        // Fallback to static quiz questions definition with randomized option shuffling
        const fallback = shuffleQuestionOptions(SKILL_QUIZ_DEFINITIONS[categoryName]?.questions || []);
        setActiveQuizQuestions(fallback);
        setCategoryQuestionCounts((prev) => ({ ...prev, [categoryName]: fallback.length }));
        setSkillMatrix((prev) =>
          prev.map((item) =>
            item.category === categoryName
              ? { ...item, totalQuestions: fallback.length }
              : item
          )
        );
      }
    } catch (err) {
      console.warn('Error fetching questions from Supabase, falling back to static questions:', err);
      const fallback = shuffleQuestionOptions(SKILL_QUIZ_DEFINITIONS[categoryName]?.questions || []);
      setActiveQuizQuestions(fallback);
      setCategoryQuestionCounts((prev) => ({ ...prev, [categoryName]: fallback.length }));
      setSkillMatrix((prev) =>
        prev.map((item) =>
          item.category === categoryName
            ? { ...item, totalQuestions: fallback.length }
            : item
        )
      );
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleStartLiveQuiz = () => {
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setTimeRemainingSeconds(600);
    setQuizStartTime(Date.now());
    // Reshuffle question options on every attempt to ensure random distribution across A, B, C, D
    setActiveQuizQuestions((prevQuestions) => {
      const source = prevQuestions.length > 0
        ? prevQuestions
        : (activeQuizCategory && SKILL_QUIZ_DEFINITIONS[activeQuizCategory]?.questions) || [];
      return shuffleQuestionOptions(source);
    });
    setQuizModalStep('LIVE');
  };

  const handleSelectAnswer = (questionIdx: number, optionIdx: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionIdx]: optionIdx
    }));
  };

  // Auto submit when timer runs out
  const handleAutoSubmitQuiz = () => {
    handleSubmitQuiz();
  };

  // Submit Quiz Logic & Grading
  const handleSubmitQuiz = async () => {
    if (!activeQuizCategory) {
      console.warn('handleSubmitQuiz called without activeQuizCategory');
      return;
    }

    // 1. Verify Primary Key Binding: Ensure profile and profile.id (UUID primary key from talent_profiles, NOT user.id) are loaded and valid
    if (!profile || !profile.id) {
      console.error("CRITICAL ERROR: profile or profile.id is not loaded or missing before quiz submission!");
      alert("Error: Talent profile is not loaded. Please wait a moment or reload the page.");
      return;
    }

    const quizDef = SKILL_QUIZ_DEFINITIONS[activeQuizCategory];
    const questions = activeQuizQuestions.length > 0 ? activeQuizQuestions : (quizDef?.questions || []);
    if (questions.length === 0) return;

    setIsSubmittingQuiz(true);
    try {
      let correctCount = 0;

      // Resilient answer validation comparing option index, correctAnswerLetter, and exact answer text
      questions.forEach((q: any, idx) => {
        const userChoice = userAnswers[idx];
        if (userChoice !== undefined && userChoice !== null) {
          const optionList = q.shuffledOptions || q.options || [];
          const chosenText = optionList[userChoice];
          const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
          const userChosenLetter = optionLetters[userChoice];

          const targetCorrectIndex = typeof q.correctAnswerIndex === 'number'
            ? q.correctAnswerIndex
            : typeof q.correctIdx === 'number'
            ? q.correctIdx
            : q.correct_answer_index;

          const targetCorrectLetter = q.correctAnswerLetter || (typeof targetCorrectIndex === 'number' ? optionLetters[targetCorrectIndex] : 'A');
          const expectedText = q.correct_answer_text || q.correct_answer || optionList[targetCorrectIndex];

          const isIndexMatch = userChoice === targetCorrectIndex;
          const isLetterMatch = userChosenLetter && targetCorrectLetter && userChosenLetter === targetCorrectLetter;
          const isTextMatch = Boolean(
            chosenText &&
            expectedText &&
            chosenText.trim().toLowerCase() === String(expectedText).trim().toLowerCase()
          );

          if (isIndexMatch || isLetterMatch || isTextMatch) {
            correctCount += 1;
          }
        }
      });

      const totalCount = questions.length;
      const scorePercentage = Math.round((correctCount / totalCount) * 100);
      // Passing condition: candidate passes only if score is >= 80%
      const passed = scorePercentage >= 80;

      // Fetch past attempts to determine fail count
      const { data: existingAttempts, error: fetchExistingError } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('talent_id', profile.id)
        .eq('skill_category', activeQuizCategory);

      if (fetchExistingError) {
        console.warn('Could not query previous quiz attempts:', fetchExistingError);
      }

      const pastFails = (existingAttempts || []).filter(
        (a: any) => !a.passed && Number(a.score_percentage ?? a.score ?? 0) < 80
      ).length;
      const currentFailCount = passed ? 0 : pastFails + 1;
      const isNowLocked = !passed && currentFailCount >= 2;
      const cooldownDays = isNowLocked ? 90 : 0;

      // 2. Explicit Column Payload & Logging: Match exact schema for quiz_attempts
      const currentCategory = activeQuizCategory;

      const { data, error } = await supabase
        .from('quiz_attempts')
        .insert([
          {
            talent_id: profile.id,
            skill_category: currentCategory,
            score_percentage: Math.round(scorePercentage),
            passed: scorePercentage >= 80,
            started_at: new Date(quizStartTime).toISOString(),
            completed_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) {
        console.error("CRITICAL QUIZ INSERT ERROR:", error.message, error.details);
        alert("Failed to save attempt: " + error.message);
      } else {
        console.log("Successfully inserted quiz attempt into quiz_attempts:", data);
      }

      // Supplementary write to talent_quiz_attempts for dual-schema compatibility
      try {
        await supabase.from('talent_quiz_attempts').insert([{
          talent_id: profile.id,
          talent_name: profile.full_name,
          specialty: activeQuizCategory,
          score: scorePercentage,
          passed,
          created_at: new Date().toISOString()
        }]);
      } catch (insertErr2) {
        console.warn('talent_quiz_attempts insert note:', insertErr2);
      }

      // Update localStorage cache
      const attemptPayload = {
        talent_id: profile.id,
        skill_category: activeQuizCategory,
        score_percentage: scorePercentage,
        score: scorePercentage,
        passed,
        started_at: new Date(quizStartTime).toISOString(),
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
      try {
        const cached = JSON.parse(localStorage.getItem('dsp_talent_quiz_attempts') || '[]');
        cached.push({
          id: 'att-' + Math.random().toString(36).substr(2, 9),
          ...attemptPayload
        });
        localStorage.setItem('dsp_talent_quiz_attempts', JSON.stringify(cached));
      } catch (e) {
        console.warn('localStorage cache error:', e);
      }

      // Trigger addSkillToTalent helper if quiz passed
      let dynamicUpdatedSkills: string[] = Array.isArray(profile.skills) ? [...profile.skills] : [];
      if (passed && activeQuizCategory) {
        try {
          const updatedTalentRecord = await addSkillToTalent(profile.id, activeQuizCategory);
          if (updatedTalentRecord && Array.isArray(updatedTalentRecord.skills)) {
            dynamicUpdatedSkills = updatedTalentRecord.skills;
          } else if (!dynamicUpdatedSkills.includes(activeQuizCategory)) {
            dynamicUpdatedSkills.push(activeQuizCategory);
          }
        } catch (addSkillErr) {
          console.warn('Error running addSkillToTalent:', addSkillErr);
          if (!dynamicUpdatedSkills.includes(activeQuizCategory)) {
            dynamicUpdatedSkills.push(activeQuizCategory);
          }
        }
      }

      // Calculate distinct passed categories immediately
      const priorPassedMatrix = skillMatrix.filter((m) => m.isPassed).map((m) => m.category);
      const allPassedCategories = Array.from(new Set([...dynamicUpdatedSkills, ...priorPassedMatrix]));
      const distinctPassedCount = allPassedCategories.length;
      const isPhase1Completed = distinctPassedCount >= 5;
      const isPhase2Unlocked = isPhase1Completed;
      const newDynamicSkills = allPassedCategories.slice(0, 5);

      // Update skill matrix so the quiz card immediately turns green and button greys out
      const mergedAttempts = [...(existingAttempts || []), attemptPayload];
      const updatedMatrix = buildSkillMatrix(mergedAttempts, categoryQuestionCounts, newDynamicSkills);
      setSkillMatrix(updatedMatrix);

      // Update talent_profiles columns: phase_1_quizzes_passed, phase_1_completed, phase_2_unlocked, phase_1_status
      const profileUpdates: Record<string, any> = {
        phase_1_quizzes_passed: distinctPassedCount,
        phase_1_completed: isPhase1Completed,
        phase_2_unlocked: isPhase2Unlocked,
        phase_1_status: isPhase1Completed ? 'PASSED' : (profile.phase_1_status || 'IN_PROGRESS'),
        skills: newDynamicSkills,
        updated_at: new Date().toISOString()
      };

      if (isPhase1Completed) {
        profileUpdates.phase_2_status = 'PENDING_SCHEDULE';
      }

      try {
        await supabase
          .from('talent_profiles')
          .update(profileUpdates)
          .eq('id', profile.id);
      } catch (profileUpdateError) {
        console.error('Error updating talent_profiles after quiz pass:', profileUpdateError);
      }

      // 3. Force Refresh: Immediately call supabase.from('talent_profiles').select('*').eq('id', profile.id).single() to refresh the dashboard React state
      try {
        const { data: freshProfile, error: refreshError } = await supabase
          .from('talent_profiles')
          .select('*')
          .eq('id', profile.id)
          .single();

        if (!refreshError && freshProfile) {
          setProfile((prev) => {
            if (!prev) return freshProfile;
            return {
              ...prev,
              ...freshProfile,
              phase_1_quizzes_passed: freshProfile.phase_1_quizzes_passed ?? distinctPassedCount,
              phase_1_completed: freshProfile.phase_1_completed ?? isPhase1Completed,
              phase_2_unlocked: freshProfile.phase_2_unlocked ?? isPhase2Unlocked,
              phase_1_status: freshProfile.phase_1_status ?? (isPhase1Completed ? 'PASSED' : (prev.phase_1_status || 'IN_PROGRESS')),
              phase_2_status: isPhase1Completed && (!freshProfile.phase_2_status || freshProfile.phase_2_status === 'LOCKED')
                ? 'PENDING_SCHEDULE'
                : (freshProfile.phase_2_status || prev.phase_2_status),
              skills: freshProfile.skills ?? newDynamicSkills
            };
          });
        } else {
          // Fallback to local profile state update if fetch failed
          setProfile((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              phase_1_quizzes_passed: distinctPassedCount,
              phase_1_completed: isPhase1Completed,
              phase_2_unlocked: isPhase2Unlocked,
              phase_1_status: isPhase1Completed ? 'PASSED' : (prev.phase_1_status || 'IN_PROGRESS'),
              phase_2_status: isPhase1Completed && (!prev.phase_2_status || prev.phase_2_status === 'LOCKED')
                ? 'PENDING_SCHEDULE'
                : prev.phase_2_status,
              skills: newDynamicSkills
            };
          });
        }
      } catch (refreshEx) {
        console.warn('Error refreshing talent profile after quiz update:', refreshEx);
        // Fallback local update
        setProfile((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            phase_1_quizzes_passed: distinctPassedCount,
            phase_1_completed: isPhase1Completed,
            phase_2_unlocked: isPhase2Unlocked,
            phase_1_status: isPhase1Completed ? 'PASSED' : (prev.phase_1_status || 'IN_PROGRESS'),
            phase_2_status: isPhase1Completed && (!prev.phase_2_status || prev.phase_2_status === 'LOCKED')
              ? 'PENDING_SCHEDULE'
              : prev.phase_2_status,
            skills: newDynamicSkills
          };
        });
      }

      // Show immediate congratulatory modal if talent reached 5 passed quizzes
      if (passed && isPhase1Completed) {
        setShowPhase1Congratulations(true);
      }

      setQuizScoreResult({
        scorePercentage,
        passed,
        correctCount,
        totalCount,
        attemptsUsed: (existingAttempts?.length || 0) + 1,
        isNowLocked,
        cooldownDays
      });

      // Transition modal to Results View (do NOT close modal immediately)
      setQuizModalStep('RESULTS');

      // Trigger immediate background state re-fetch from database to guarantee synchronization
      fetchTalentProfile(true, true);
    } catch (err: any) {
      console.error('Quiz submission error:', err);
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  // Alias for compatibility
  const handleQuizSubmit = handleSubmitQuiz;

  const handleCloseQuizModal = () => {
    setActiveQuizCategory(null);
    setQuizModalStep(null);
    setQuizScoreResult(null);
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setActiveQuizQuestions([]);
  };

  // ----------------------------------------------------------------------------
  // Save Editable Fields (Enforcing Locked vs Editable boundaries)
  // ----------------------------------------------------------------------------
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsSaving(true);
    try {
      const parsedAiTools = formData.ai_tools_input
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const parsedCertifications = formData.certifications_input
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const editablePayload = {
        profile_picture_url: formData.profile_picture_url.trim() || null,
        role_title: formData.role_title,
        headline: formData.headline,
        bio: formData.bio,
        years_experience: Number(formData.years_experience),
        location: formData.location,
        remote_preference: formData.remote_preference,
        availability_status: formData.availability_status || 'available',
        work_availability_type: formData.work_availability_type || ['Full-Time', 'Freelance'],
        placement_status: (formData.availability_status === 'available' ? 'AVAILABLE' : 'HIRED') as PlacementStatus,
        contact_email: formData.contact_email,
        phone_number: formData.phone_number,
        whatsapp_number: formData.whatsapp_number,
        cv_url: formData.cv_url,
        portfolio_url: formData.portfolio_url,
        github_url: formData.github_url,
        linkedin_url: formData.linkedin_url,
        work_history: formData.work_history,
        education: formData.education,
        case_studies: formData.case_studies,
        ai_tools: parsedAiTools,
        certifications: parsedCertifications,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('talent_profiles')
        .update(editablePayload)
        .eq('id', profile.id);

      if (error) throw error;

      setProfile((prev) => (prev ? { ...prev, ...editablePayload } : null));
      setIsEditing(false);
      setImageError(false);
      setToastMessage('Profile and portfolio details saved successfully! ✨');
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // ----------------------------------------------------------------------------
  // Work Experience, Education, and Case Study Array Helpers
  // ----------------------------------------------------------------------------
  const handleAddWorkHistory = () => {
    setFormData((prev) => ({
      ...prev,
      work_history: [
        ...prev.work_history,
        { company: '', role: '', duration: '', description: '' }
      ]
    }));
  };

  const handleUpdateWorkHistory = (index: number, field: keyof WorkHistoryItem, val: string) => {
    setFormData((prev) => {
      const updated = [...prev.work_history];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, work_history: updated };
    });
  };

  const handleRemoveWorkHistory = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      work_history: prev.work_history.filter((_, i) => i !== index)
    }));
  };

  const handleAddEducation = () => {
    setFormData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { school: '', degree: '', year: '' }
      ]
    }));
  };

  const handleUpdateEducation = (index: number, field: keyof EducationItem, val: string) => {
    setFormData((prev) => {
      const updated = [...prev.education];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, education: updated };
    });
  };

  const handleRemoveEducation = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const handleAddCaseStudy = () => {
    setFormData((prev) => ({
      ...prev,
      case_studies: [
        ...prev.case_studies,
        { title: '', client_or_brand: '', metrics_achieved: '', description: '', link: '' }
      ]
    }));
  };

  const handleUpdateCaseStudy = (index: number, field: keyof CaseStudyItem, val: string) => {
    setFormData((prev) => {
      const updated = [...prev.case_studies];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, case_studies: updated };
    });
  };

  const handleRemoveCaseStudy = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      case_studies: prev.case_studies.filter((_, i) => i !== index)
    }));
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Sign out:', e);
    }
    if (onSignOut) {
      onSignOut();
    } else {
      window.location.href = '/';
    }
  };

  // Trigger Clean 10-Field PDF Resume Download in New Tab
  const handleDownloadResume = (talentId?: string) => {
    const targetId = talentId || profile?.id || user?.id || '';
    if (!targetId) {
      console.warn('No talent ID available for resume download');
      return;
    }
    window.open(`/api/resume/download?talent_id=${targetId}`, '_blank');
  };

  // Toggle or activate portfolio edit form and smooth scroll into view
  const handleToggleEdit = (targetState?: boolean) => {
    const next = targetState !== undefined ? targetState : !isEditing;
    setIsEditing(next);
    if (next) {
      setTimeout(() => {
        const el = document.getElementById('edit-portfolio-dossier-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  // Share Profile to Clipboard with Toast Notification
  const handleShareProfile = () => {
    const slug = profile?.slug || profile?.id;
    const shareUrl = `${window.location.origin}/p/${slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setToastMessage('Public Profile Link Copied to Clipboard!');
        setTimeout(() => setToastMessage(null), 3000);
      }).catch(() => {
        setToastMessage(`Profile URL: ${shareUrl}`);
        setTimeout(() => setToastMessage(null), 4000);
      });
    } else {
      setToastMessage(`Profile URL: ${shareUrl}`);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  // ----------------------------------------------------------------------------
  // EXACT PRELOADER SCREEN MANDATE
  // ----------------------------------------------------------------------------
  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-700">Loading Candidate Profile...</p>
        </div>
      </div>
    );
  }

  const passedQuizzesCount = Math.max(
    Number(profile?.phase_1_quizzes_passed || 0),
    skillMatrix.filter((s) => s.isPassed).length,
    Array.isArray(profile?.skills) ? profile.skills.length : 0
  );
  const isPhase1Done = passedQuizzesCount >= 5 || Boolean(profile?.phase_1_completed);
  const initials = getInitials(profile?.full_name);

  // Dynamically derived accredited skills list (always in sync with passed quizzes)
  const displayAccreditedSkills = Array.from(
    new Set([...(profile?.skills || []), ...skillMatrix.filter((s) => s.isPassed).map((s) => s.category)])
  ).slice(0, 5);

  const activeDef = activeQuizCategory ? SKILL_QUIZ_DEFINITIONS[activeQuizCategory] : null;
  const activeMatrix = activeQuizCategory ? skillMatrix.find((s) => s.category === activeQuizCategory) : null;
  const activeQuestions = activeQuizQuestions.length > 0 ? activeQuizQuestions : (activeDef?.questions || []);

  // Format MM:SS for countdown timer
  const minutes = Math.floor(timeRemainingSeconds / 60);
  const seconds = timeRemainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-24 selection:bg-emerald-500 selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-white text-slate-900 border-2 border-emerald-500 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-mono text-[10px] font-bold uppercase text-emerald-700">Profile Updated</p>
            <p className="text-xs font-bold text-slate-900">{toastMessage}</p>
          </div>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-slate-700 font-mono text-xs cursor-pointer">✕</button>
        </div>
      )}

      {/* Top Verified Alert Banner */}
      {profile?.is_verified_badge && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 shadow-xs">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Accredited Talent: Your profile is fully verified and featured in recruiter search results.</span>
        </div>
      )}

      {/* Modern Navigation Header */}
      <header className="sticky top-0 z-40 border-b bg-white/95 border-slate-200/80 backdrop-blur-md px-4 sm:px-8 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
          
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 text-white p-2 rounded-xl flex items-center justify-center shadow-xs font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-sm tracking-tight text-slate-900">
                  Digital Campux
                </span>
                <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Talent Dossier
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {profile?.full_name || 'Candidate Portfolio Manager'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
            {/* Dynamic Placement Availability Toggle Switch */}
            <div className="flex items-center gap-2 bg-slate-100/90 border border-slate-200/90 py-1.5 px-3 rounded-full shadow-2xs">
              <span className={`w-2 h-2 rounded-full transition-colors ${
                profile?.availability_status === 'available'
                  ? 'bg-emerald-500 ring-4 ring-emerald-100 animate-pulse'
                  : 'bg-slate-400'
              }`} />
              <span className="text-[11px] font-medium text-slate-700">
                {profile?.availability_status === 'available'
                  ? 'Available for Placement'
                  : 'Hired'}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={profile?.availability_status === 'available'}
                onClick={() => handleToggleAvailability()}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
                  profile?.availability_status === 'available'
                    ? 'bg-emerald-600'
                    : 'bg-slate-300'
                }`}
                title="Toggle placement availability status"
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    profile?.availability_status === 'available'
                      ? 'translate-x-4'
                      : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {profile?.is_verified_badge ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold uppercase rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 transition-all duration-200 transform hover:scale-105 hover:shadow-xs cursor-default">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Skills</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold uppercase rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Accreditation In Progress</span>
              </span>
            )}

            <button
              id="talent-profile-download-resume-header-btn"
              type="button"
              onClick={() => handleDownloadResume(profile?.id || user?.id)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 transition cursor-pointer border border-slate-200 shadow-2xs flex items-center gap-1.5 no-print"
              title="Download Resume / Export CV as PDF"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Download Resume</span>
            </button>

            <button
              id="talent-profile-header-edit-btn"
              type="button"
              onClick={handleToggleEdit}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition cursor-pointer shadow-xs flex items-center gap-1.5 no-print"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Close Edit Form' : 'Edit Portfolio'}</span>
            </button>

            <button
              onClick={handleSignOut}
              className="bg-white hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-semibold py-1.5 px-3.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer border border-slate-200 transition shadow-2xs no-print"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400" />
              <span>Sign Out</span>
            </button>
          </div>

        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        {/* ========================================================================= */}
        {/* 1. TOP PROFILE HEADER & AVATAR ZONE */}
        {/* ========================================================================= */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            
            <div className="flex items-start gap-4 sm:gap-5 flex-1 min-w-0">
              
              {/* Avatar Zone: Picture with Initials Fallback */}
              <div className="relative shrink-0">
                {profile?.profile_picture_url && !imageError ? (
                  <img
                    src={profile.profile_picture_url}
                    alt={profile?.full_name || 'Candidate Avatar'}
                    referrerPolicy="no-referrer"
                    onError={() => setImageError(true)}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-slate-200 shadow-inner bg-slate-100"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800 font-bold text-xl sm:text-2xl shadow-inner tracking-wider">
                    {initials}
                  </div>
                )}

                {profile?.is_verified_badge && (
                  <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full ring-2 ring-white shadow-xs" title="Verified Skills Active">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                )}
              </div>

              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    {profile?.full_name}
                  </h1>

                  {/* Verified Skills Badge */}
                  {profile?.is_verified_badge ? (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all duration-200 transform hover:scale-105 hover:shadow-xs cursor-default">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verified Skills</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Verification In Progress</span>
                    </span>
                  )}

                  {/* Work Status with Quick Toggle */}
                  <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full text-xs">
                    <span className="text-slate-500 font-medium">Work Status:</span>
                    <span className={`inline-flex items-center gap-1 font-semibold ${
                      profile?.availability_status === 'available'
                        ? 'text-emerald-800'
                        : 'text-slate-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        profile?.availability_status === 'available'
                          ? 'bg-emerald-500 animate-pulse'
                          : 'bg-slate-400'
                      }`} />
                      <span>{profile?.availability_status === 'available' ? 'Available for Placement' : 'Hired'}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleAvailability()}
                      className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        profile?.availability_status === 'available'
                          ? 'bg-emerald-600'
                          : 'bg-slate-300'
                      }`}
                      title="Toggle Work Status"
                    >
                      <span
                        className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                          profile?.availability_status === 'available'
                            ? 'translate-x-3'
                            : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <p className="text-sm sm:text-base font-semibold text-slate-800">{profile?.role_title || profile?.headline}</p>

                {profile?.bio && (
                  <p className="text-xs sm:text-sm font-normal text-slate-600 leading-relaxed max-w-3xl">
                    {profile.bio}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {profile?.contact_email || 'Contact Email Not Set'}
                  </span>
                  {profile?.phone_number && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {profile.phone_number}
                    </span>
                  )}
                  {profile?.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {profile.location} ({profile.remote_preference || 'Remote'})
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    {profile?.years_experience || 4}+ Years Exp
                  </span>
                  {profile?.whatsapp_number && (
                    <span className="flex items-center gap-1 text-emerald-700 font-medium">
                      <MessageSquare className="w-3.5 h-3.5" />
                      WhatsApp: {profile.whatsapp_number}
                    </span>
                  )}
                </div>

                {/* Work Type Availability Selection (Open To / Work Preference) */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-700">Open To:</span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {WORK_TYPE_OPTIONS.map((type) => {
                      const isSelected = Array.isArray(profile?.work_availability_type)
                        ? profile.work_availability_type.includes(type)
                        : ['Full-Time', 'Freelance'].includes(type);

                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleToggleWorkType(type)}
                          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors cursor-pointer border flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                          }`}
                          title={`Toggle ${type} availability`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                          <span>{type}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick External Links Row */}
            <div className="flex flex-wrap items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
              <button
                id="talent-profile-download-resume-card-btn"
                type="button"
                onClick={() => handleDownloadResume(profile?.id || user?.id)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition shadow-2xs flex items-center gap-1.5 cursor-pointer no-print"
                title="Download Resume / Export CV as PDF"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Download Resume</span>
              </button>

              {profile?.cv_url && (
                <a
                  href={profile.cv_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition shadow-2xs flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>CV Document</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}
              {profile?.portfolio_url && (
                <a
                  href={profile.portfolio_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition shadow-2xs flex items-center gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5 text-slate-500" />
                  <span>Portfolio</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}
              {profile?.linkedin_url && (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition shadow-2xs"
                  title="LinkedIn Profile"
                >
                  <Linkedin className="w-4 h-4 text-blue-600" />
                </a>
              )}
              {profile?.github_url && (
                <a
                  href={profile.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition shadow-2xs"
                  title="GitHub Profile"
                >
                  <Github className="w-4 h-4 text-slate-800" />
                </a>
              )}
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 1. EDIT PORTFOLIO DOSSIER & RESUME (COMES FIRST AS REQUESTED) */}
        {/* ========================================================================= */}
        <section id="portfolio-dossier-resume-section" className="space-y-4">
          {isEditing ? (
            <TalentProfileEditForm
              formData={formData}
              setFormData={setFormData}
              isSaving={isSaving}
              initials={initials}
              onCancel={() => setIsEditing(false)}
              onSave={handleSaveProfile}
              onAddWorkHistory={handleAddWorkHistory}
              onUpdateWorkHistory={handleUpdateWorkHistory}
              onRemoveWorkHistory={handleRemoveWorkHistory}
              onAddEducation={handleAddEducation}
              onUpdateEducation={handleUpdateEducation}
              onRemoveEducation={handleRemoveEducation}
              onAddCaseStudy={handleAddCaseStudy}
              onUpdateCaseStudy={handleUpdateCaseStudy}
              onRemoveCaseStudy={handleRemoveCaseStudy}
            />
          ) : (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900">1. Edit Portfolio Dossier & Resume</h2>
                    <span className="text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                      Editable Section
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-normal leading-relaxed max-w-2xl">
                    Manage your public avatar, professional headline, CV documents, live case study portfolios, external URLs, and work experience entries.
                  </p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  {profile?.cv_url && (
                    <a
                      href={profile.cv_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      title="Open CV Document in new tab"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      <span>View CV</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                  )}
                  <button
                    id="talent-profile-open-edit-dossier-btn"
                    type="button"
                    onClick={handleToggleEdit}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Portfolio & Resume</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* 2. EMPLOYER VISIBILITY & IMPRESSIONS (LIVE ANALYTICS & IP TRACKING) */}
        {/* ========================================================================= */}
        {profile && (
          <EmployerVisibilityCard 
            profile={profile} 
            onShareProfile={handleShareProfile} 
          />
        )}

        {/* ========================================================================= */}
        {/* 3. 3-STEP CANDIDATE VERIFICATION PIPELINE */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">3-Step Candidate Verification Pipeline</h2>
                <span className="text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  Read-Only Authority
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal leading-relaxed">Pipeline advancement, quiz credits, and verified skills are awarded through specialist audits and assessment scores.</p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-700 shadow-2xs self-start sm:self-auto">
              {profile?.is_verified_badge ? 'Step 3/3 (Verified)' : profile?.phase_2_status === 'COMPLETED' ? 'Step 3/3 (Payment Ready)' : isPhase1Done ? 'Step 2/3 (Interview)' : 'Step 1/3 (Skill Checks)'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* STEP 1: Skill Checks */}
            <div className={`bg-white rounded-xl p-6 border transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between ${
              isPhase1Done ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200 hover:border-slate-300'
            }`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                      isPhase1Done ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      1
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">Step 1: Skill Checks</h3>
                  </div>

                  {isPhase1Done ? (
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

                <p className="text-xs font-normal text-slate-600 leading-relaxed">
                  Pass 5 or more skill checks with an 80%+ benchmark to qualify for Step 2.
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

                {/* Quick Link to Skill Checks */}
                <button
                  type="button"
                  onClick={scrollToQuizSection}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <span>Start Skill Checks</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 text-[11px] font-normal text-slate-500 flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Awarded automatically via quiz completions</span>
              </div>
            </div>

            {/* STEP 2: Specialist Interview */}
            <div 
              id="step-2-verification-card"
              className={`bg-white rounded-xl p-6 border transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between ${
              profile?.phase_2_status === 'COMPLETED'
                ? 'border-emerald-300 bg-emerald-50/20'
                : profile?.phase_2_status === 'PENDING_SCHEDULE' || profile?.phase_2_unlocked || isPhase1Done
                ? 'border-indigo-300 ring-2 ring-indigo-500/10'
                : profile?.phase_2_status === 'FAILED'
                ? 'border-rose-200 bg-rose-50/20'
                : 'border-slate-200 hover:border-slate-300 opacity-90'
            }`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                      profile?.phase_2_status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : profile?.phase_2_status === 'PENDING_SCHEDULE' || profile?.phase_2_unlocked || isPhase1Done
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      2
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">Step 2: Specialist Review</h3>
                  </div>

                  {profile?.phase_2_status === 'COMPLETED' ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Passed
                    </span>
                  ) : profile?.phase_2_status === 'PENDING_SCHEDULE' || profile?.phase_2_unlocked || isPhase1Done ? (
                    <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 animate-pulse">
                      Ready to Schedule
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

                <p className="text-xs font-normal text-slate-600 leading-relaxed">
                  30-minute technical evaluation on execution velocity, campaign strategy, and growth architecture.
                </p>

                {/* Interactive Book Review Button when Phase 2 is Unlocked */}
                {(profile?.phase_2_unlocked || profile?.phase_2_status === 'PENDING_SCHEDULE' || isPhase1Done) && profile?.phase_2_status !== 'COMPLETED' && (
                  <div className="pt-2">
                    <a
                      href={profile?.phase_2_calendar_link || 'https://calendly.com/talent-specialist/30min'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-indigo-600/20"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Book Your Phase 2 Panel Review</span>
                      <ExternalLink className="w-3 h-3 opacity-80" />
                    </a>
                    {profile?.phase_2_calendar_link && (
                      <p className="text-[10px] text-slate-400 text-center mt-1 font-mono truncate">
                        Linked to panel calendar
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 text-[11px] font-normal text-slate-500 flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Evaluated by Digital Campux panel</span>
              </div>
            </div>

            {/* STEP 3: Badge Issuance */}
            <div className={`bg-white rounded-xl p-6 border transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between ${
              profile?.is_verified_badge
                ? 'border-emerald-300 bg-emerald-50/20'
                : profile?.phase_3_status === 'PAYMENT_PENDING'
                ? 'border-amber-300 ring-2 ring-amber-500/10'
                : 'border-slate-200 hover:border-slate-300 opacity-90'
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
                    <h3 className="text-sm font-bold text-slate-900">Step 3: Verified Badge Issuance</h3>
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

                <p className="text-xs font-normal text-slate-600 leading-relaxed">
                  Final accreditation and verified placement status in recruiter search directory.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 text-[11px] font-normal text-slate-500 flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Authorized via fee settlement</span>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. SKILL CATEGORIES & SKILL CHECKS GRID (#quiz-section) */}
        {/* ========================================================================= */}
        <section id="quiz-section" className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">Step 1: Skill Checks</h2>
              </div>
              <p className="text-xs text-slate-500 font-normal leading-relaxed">
                Complete 5 skill checks with an 80%+ score to unlock Step 2 Specialist Review. Each quiz has a 10-minute timer and 2 attempts before a 90-day cooldown.
              </p>
            </div>
            <div className="text-xs font-mono font-bold bg-white border border-slate-200 px-3 py-1 rounded-full text-slate-700 shadow-2xs self-start sm:self-auto">
              Passed: <span className="text-emerald-600">{passedQuizzesCount}</span> / 5 Target
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {skillMatrix.map((item) => {
              const def = SKILL_QUIZ_DEFINITIONS[item.category];
              return (
                <div
                  key={item.category}
                  className={`bg-white border rounded-xl p-5 shadow-sm flex flex-col justify-between transition-all duration-200 hover:shadow-md ${
                    item.isPassed
                      ? 'border-emerald-300 bg-emerald-50/15 ring-1 ring-emerald-400/20'
                      : item.isLocked
                      ? 'border-rose-200 bg-rose-50/15'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-xl flex items-center justify-center ${
                          item.isPassed
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.isLocked
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 leading-tight">
                          {item.category}
                        </h3>
                      </div>

                      {item.isAdminBypassed ? (
                        <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Admin Verified
                        </span>
                      ) : item.isPassed ? (
                        <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          Passed
                        </span>
                      ) : item.isLocked ? (
                        <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                          <Lock className="w-3 h-3" />
                          Locked
                        </span>
                      ) : item.attemptsCount > 0 ? (
                        <span className="shrink-0 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          Attempt 2/2
                        </span>
                      ) : (
                        <span className="shrink-0 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          Available
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-normal text-slate-600 leading-relaxed">
                      {def?.shortDesc || 'Comprehensive evaluation on core industry workflows and execution standards.'}
                    </p>

                    {/* Stats details */}
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-100">
                      <span className="flex items-center gap-1.5 font-medium text-slate-700">
                        <span>{item.totalQuestions} {item.totalQuestions === 1 ? 'Question' : 'Questions'}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500 font-normal">Pass: 80%</span>
                      </span>
                      {item.bestScore !== undefined ? (
                        <span>Best: <strong className={item.isPassed ? 'text-emerald-700' : 'text-slate-700'}>{item.bestScore}%</strong></span>
                      ) : (
                        <span className="text-slate-400">Unattempted</span>
                      )}
                    </div>

                    {/* Locked 90-Day Countdown State */}
                    {item.isLocked && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>Cooldown Period Active</span>
                        </div>
                        <p className="text-[11px] font-normal text-rose-700 leading-relaxed">
                          2 attempts failed. Re-attempt unlocks in <strong>{item.cooldownDaysRemaining} days</strong>.
                        </p>
                        <a
                          href="https://learnwithdsp.com/Grow-a-digital-and-growth-marketing-career-fast"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-900 hover:text-rose-950 bg-rose-100 hover:bg-rose-200 px-3 py-1.5 rounded-xl transition w-full justify-center"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Refresher Marketing Course</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-2">
                    {item.isPassed ? (
                      <button
                        type="button"
                        disabled
                        className="w-full py-2.5 px-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-not-allowed select-none opacity-80"
                        title="You have passed this skill check"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Take Skill Check (Passed)</span>
                      </button>
                    ) : item.isLocked ? (
                      <button
                        type="button"
                        disabled
                        className="w-full py-2.5 px-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 text-xs font-medium flex items-center justify-center gap-1.5 cursor-not-allowed select-none"
                        title={`Locked. Cooldown active for ${item.cooldownDaysRemaining} days.`}
                      >
                        <Lock className="w-3.5 h-3.5 text-rose-500" />
                        <span>Locked ({item.cooldownDaysRemaining}d remaining)</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenQuizInstructions(item.category)}
                        className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{item.attemptsCount === 1 ? 'Retake Quiz (Final Attempt)' : 'Take Skill Check'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. FEATURED GROWTH CASE STUDIES & PORTFOLIO DOSSIER */}
        {/* ========================================================================= */}
        <section id="featured-case-studies-portfolio-showcase" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">4. Featured Growth Case Studies & Portfolio Dossier</h2>
                <span className="text-[10px] font-mono font-bold uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                  Career Showcase
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal leading-relaxed">
                Audited case study breakthroughs, verifiable campaign metrics, career timeline, and verified skill specializations.
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleEdit}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Update Dossier Entries</span>
            </button>
          </div>

          {/* Featured Growth Case Studies Top Showcase */}
          <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Featured Growth Case Studies</h3>
              </div>
              <button
                type="button"
                onClick={handleToggleEdit}
                className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
              >
                + Add / Manage Case Studies
              </button>
            </div>

            {(profile?.case_studies || []).length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200 text-center space-y-2">
                <p className="text-xs text-slate-600 font-medium">No featured case studies added to your portfolio dossier yet.</p>
                <button
                  type="button"
                  onClick={handleToggleEdit}
                  className="text-xs font-bold text-emerald-700 hover:underline inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add your first case study</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(profile?.case_studies || []).map((cs, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3 flex flex-col justify-between hover:border-slate-300 transition shadow-2xs">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{cs.title}</h4>
                          <p className="text-[11px] text-slate-500 font-medium">{cs.client_or_brand}</p>
                        </div>
                        {cs.metrics_achieved && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] shrink-0">
                            {cs.metrics_achieved}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{cs.description}</p>
                    </div>
                    {cs.link && (
                      <div className="pt-2 border-t border-slate-200/60">
                        <a
                          href={cs.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:underline"
                        >
                          <span>View Live Project</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Dossier Detail Two-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Work Experience */}
            <div className="lg:col-span-2 space-y-6">
              <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm font-bold text-slate-900">Career & Work Experience</h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleEdit}
                    className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>

                <div className="space-y-4">
                  {(profile?.work_history || []).length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No work history entries added yet.</p>
                  ) : (
                    (profile?.work_history || []).map((work, idx) => (
                      <div key={idx} className="space-y-1.5 border-b border-slate-100 last:border-0 pb-3.5 last:pb-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900">{work.role}</h4>
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">{work.duration}</span>
                        </div>
                        <p className="text-xs font-semibold text-emerald-700">{work.company}</p>
                        {work.description && (
                          <p className="text-xs text-slate-600 leading-relaxed">{work.description}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>

            {/* Right Column: Skills, AI Tools, Certifications, Education */}
            <div className="space-y-6">
              {/* Accredited Skills (Diagnostic Verified) */}
              <section className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-xs font-bold text-slate-900">Accredited Skills</h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 font-bold flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    Diagnostic Verified
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Earned dynamically by achieving 80%+ on Phase 1 diagnostic quizzes (Max 5 accredited specialties).
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {displayAccreditedSkills.length === 0 ? (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center w-full space-y-1">
                      <p className="text-xs text-slate-500 font-medium">No accredited skills unlocked yet.</p>
                      <button
                        type="button"
                        onClick={scrollToQuizSection}
                        className="text-xs font-bold text-emerald-700 hover:underline inline-flex items-center gap-1"
                      >
                        <span>Pass your first quiz</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    displayAccreditedSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold text-[11px] flex items-center gap-1 shadow-2xs transition-all duration-200 transform hover:scale-105 hover:shadow-md hover:bg-emerald-100/90 cursor-default select-none group"
                      >
                        <Check className="w-3 h-3 text-emerald-600 transition-transform duration-200 group-hover:scale-110" />
                        <span>{skill}</span>
                      </span>
                    ))
                  )}
                </div>
              </section>

              {/* AI Growth Tooling */}
              <section className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-xs font-bold text-slate-900">AI Growth Tooling</h3>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(profile?.ai_tools || []).map((tool, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-medium text-[11px]"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </section>

              {/* Certifications */}
              <section className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-amber-600" />
                    <h3 className="text-xs font-bold text-slate-900">Certifications</h3>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {(profile?.certifications || []).map((cert, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{cert}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Education */}
              <section className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h3 className="text-xs font-bold text-slate-900">Education</h3>
                </div>

                <div className="space-y-2">
                  {(profile?.education || []).map((edu, idx) => (
                    <div key={idx} className="text-xs space-y-0.5">
                      <p className="font-bold text-slate-900">{edu.degree}</p>
                      <p className="text-slate-500">{edu.school} • {edu.year}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </section>

      </main>

      {/* ========================================================================= */}
      {/* 6. INTERACTIVE QUIZ MODAL (INSTRUCTIONS / LIVE / RESULTS) */}
      {/* ========================================================================= */}
      {quizModalStep && activeDef && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 relative">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full uppercase">
                    Phase 1 Diagnostic Assessment
                  </span>
                  {activeMatrix?.attemptsCount ? (
                    <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                      Attempt {activeMatrix.attemptsCount + 1} of 2
                    </span>
                  ) : null}
                </div>
                <h2 className="text-xl font-bold text-slate-900">{activeDef.category}</h2>
              </div>

              {quizModalStep !== 'LIVE' && (
                <button
                  type="button"
                  onClick={handleCloseQuizModal}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* STEP A: PRE-QUIZ INSTRUCTION MODAL */}
            {quizModalStep === 'INSTRUCTIONS' && (
              <div className="space-y-6">
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {activeDef.fullDesc}
                </p>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3.5">
                  <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-emerald-600" />
                    <span>Examination & Certification Rules</span>
                  </h4>

                  <ul className="space-y-2.5 text-xs text-slate-700">
                    <li className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                      <span><strong>10-Minute Timed Session:</strong> You have 10 minutes to answer all {activeQuestions.length} questions. Answers auto-submit when the timer expires.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Award className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>80% Passing Benchmark:</strong> You must answer at least {Math.ceil(activeQuestions.length * 0.8)} out of {activeQuestions.length} questions correctly ({activeDef.passingScorePercent || 80}%+) to achieve accreditation in this skill.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <RotateCcw className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span><strong>2 Attempts Permitted:</strong> If you fail on your 1st attempt, you may retry immediately.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Lock className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span><strong>90-Day Lockout:</strong> Failing 2 consecutive attempts locks this diagnostic for 90 days. You will be provided a refresher study course.</span>
                    </li>
                  </ul>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseQuizModal}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleStartLiveQuiz}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>I Understand — Begin Assessment</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP B: LIVE QUIZ EXECUTION */}
            {quizModalStep === 'LIVE' && (
              <div className="space-y-6">
                
                {/* Live Timer Bar & Progress */}
                <div className="flex items-center justify-between bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xs">
                  <div className="flex items-center gap-2">
                    <Timer className={`w-4 h-4 ${timeRemainingSeconds < 120 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`} />
                    <span className="font-mono text-xs font-bold">
                      Time Remaining: <span className={timeRemainingSeconds < 120 ? 'text-rose-400' : 'text-white'}>{formattedTime}</span>
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    Question {currentQuestionIndex + 1} of {activeQuestions.length}
                  </span>
                </div>

                {/* Progress Indicators */}
                <div className="flex gap-1.5">
                  {activeQuestions.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 flex-1 rounded-full transition ${
                        userAnswers[idx] !== undefined
                          ? 'bg-emerald-500'
                          : idx === currentQuestionIndex
                          ? 'bg-slate-900'
                          : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>

                {/* Current Question */}
                {activeQuestions[currentQuestionIndex] && (
                  <div className="space-y-4">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {activeQuestions[currentQuestionIndex].question}
                    </h3>

                    <div className="space-y-2.5">
                      {(activeQuestions[currentQuestionIndex].shuffledOptions || activeQuestions[currentQuestionIndex].options || []).map((opt, optIdx) => {
                        const isSelected = userAnswers[currentQuestionIndex] === optIdx;
                        const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
                        const optionLetter = optionLetters[optIdx] || String.fromCharCode(65 + optIdx);
                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => handleSelectAnswer(currentQuestionIndex, optIdx)}
                            className={`w-full text-left p-3.5 rounded-2xl border text-xs leading-relaxed transition flex items-start gap-3 cursor-pointer ${
                              isSelected
                                ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 text-emerald-950 font-semibold'
                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 text-slate-700'
                            }`}
                          >
                            <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                              isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {optionLetter}
                            </span>
                            <span className="flex-1">{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Step Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-200"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-2">
                    {currentQuestionIndex < activeQuestions.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                        className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <span>Next Question</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isSubmittingQuiz || Object.keys(userAnswers).length < activeQuestions.length}
                        onClick={handleSubmitQuiz}
                        className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
                      >
                        {isSubmittingQuiz ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        <span>Finish Quiz</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* STEP C: COMPREHENSIVE QUIZ RESULTS */}
            {quizModalStep === 'RESULTS' && quizScoreResult && (
              <div className="space-y-6">
                
                {/* Result Hero Banner */}
                <div className={`p-6 rounded-3xl border text-center space-y-4 ${
                  quizScoreResult.passed
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : quizScoreResult.isNowLocked
                    ? 'bg-rose-50 border-rose-300 text-rose-950'
                    : 'bg-amber-50 border-amber-300 text-amber-950'
                }`}>
                  <div className="inline-flex p-3.5 rounded-2xl bg-white shadow-xs">
                    {quizScoreResult.passed ? (
                      <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    ) : quizScoreResult.isNowLocked ? (
                      <Lock className="w-8 h-8 text-rose-600" />
                    ) : (
                      <AlertTriangle className="w-8 h-8 text-amber-600" />
                    )}
                  </div>

                  <div className="space-y-2">
                    {/* Status Banner */}
                    <div className="flex justify-center">
                      <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold font-mono tracking-wide ${
                        quizScoreResult.passed
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : quizScoreResult.isNowLocked
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-amber-600 text-white shadow-xs'
                      }`}>
                        {quizScoreResult.passed
                          ? 'Congratulations! You Passed'
                          : 'Skill Check Not Passed'}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold">
                      {quizScoreResult.passed
                        ? `${activeDef.category} Verified!`
                        : quizScoreResult.isNowLocked
                        ? 'Assessment Failed — 90-Day Cooldown'
                        : '80% Benchmark Not Met'}
                    </h3>

                    {/* Next Steps Messaging */}
                    <p className="text-xs font-medium opacity-90 max-w-md mx-auto leading-relaxed">
                      {quizScoreResult.passed
                        ? 'This topic is now marked as verified. Complete 5 distinct skill checks to unlock Phase 2.'
                        : 'You need 80% or higher to verify this skill. Review the topic material and try again.'}
                    </p>
                  </div>

                  {/* Final Score: Percentage & Score Fraction */}
                  <div className="flex items-center justify-center gap-6 pt-2 font-mono">
                    <div className="text-center">
                      <p className="text-[10px] uppercase font-bold text-slate-500">Final Score</p>
                      <p className="text-2xl font-black">{quizScoreResult.scorePercentage}%</p>
                    </div>
                    <div className="h-8 w-px bg-slate-200" />
                    <div className="text-center">
                      <p className="text-[10px] uppercase font-bold text-slate-500">Score Fraction</p>
                      <p className="text-2xl font-black">{quizScoreResult.correctCount} / {quizScoreResult.totalCount}</p>
                    </div>
                    <div className="h-8 w-px bg-slate-200" />
                    <div className="text-center">
                      <p className="text-[10px] uppercase font-bold text-slate-500">Passing Benchmark</p>
                      <p className="text-2xl font-black">80%</p>
                    </div>
                  </div>
                </div>

                {/* Question Breakdown with Detailed Explanations */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                    Question Answer Explanations
                  </h4>

                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {activeQuestions.map((q: any, idx) => {
                      const userChoice = userAnswers[idx];
                      const optionList = q.shuffledOptions || q.options || [];
                      const targetCorrectIndex = typeof q.correctAnswerIndex === 'number'
                        ? q.correctAnswerIndex
                        : typeof q.correctIdx === 'number'
                        ? q.correctIdx
                        : 0;
                      const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
                      const isCorrect = userChoice === targetCorrectIndex;
                      const userLetter = userChoice !== undefined ? optionLetters[userChoice] : null;
                      const correctLetter = q.correctAnswerLetter || optionLetters[targetCorrectIndex] || 'A';

                      return (
                        <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-bold text-slate-900">
                              {idx + 1}. {q.question}
                            </p>
                            {isCorrect ? (
                              <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                <Check className="w-3 h-3" /> Correct ({correctLetter})
                              </span>
                            ) : (
                              <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                                <X className="w-3 h-3" /> Incorrect
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] space-y-1 text-slate-600">
                            <p><strong>Your Answer:</strong> {userChoice !== undefined ? `[${userLetter}] ${optionList[userChoice]}` : 'Not answered'}</p>
                            {!isCorrect && (
                              <p className="text-emerald-700 font-semibold">
                                <strong>Correct Answer:</strong> [{correctLetter}] {optionList[targetCorrectIndex] || q.correct_answer_text || q.correct_answer}
                              </p>
                            )}
                            <p className="text-slate-500 italic bg-white p-2 rounded-xl border border-slate-200 mt-1">
                              💡 <strong>Key Rationale:</strong> {q.explanation}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 90-Day Lockout Course Link */}
                {quizScoreResult.isNowLocked && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2">
                    <p className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-rose-600" />
                      <span>Recommended Up-Skilling Course</span>
                    </p>
                    <p className="text-xs text-rose-800 leading-relaxed">
                      Reinforce your foundational knowledge with our curated masterclass before your 90-day cooldown expires:
                    </p>
                    <a
                      href="https://learnwithdsp.com/Grow-a-digital-and-growth-marketing-career-fast"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 px-4 py-2 rounded-xl transition shadow-xs"
                    >
                      <span>Access Refresher Digital & Growth Marketing Course (AI Integrated)</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                {/* Modal Footer Controls */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  {!quizScoreResult.passed && !quizScoreResult.isNowLocked && (
                    <button
                      type="button"
                      onClick={handleStartLiveQuiz}
                      className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retake Quiz Now (Attempt 2)</span>
                    </button>
                  )}

                  {quizScoreResult.passed && (passedQuizzesCount >= 5 || isPhase1Done) && (
                    <button
                      type="button"
                      onClick={() => {
                        handleCloseQuizModal();
                        setShowPhase1Congratulations(true);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition"
                    >
                      <Trophy className="w-4 h-4" />
                      <span>View Phase 1 Accreditation & Next Steps</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleCloseQuizModal}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer shadow-xs transition"
                  >
                    Back to Dashboard
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHASE 1 CONGRATULATORY ACCREDITATION MODAL (TRIGGERS ON 5/5 PASSED) */}
      {/* ========================================================================= */}
      <ConfettiSuccess
        isActive={showPhase1Congratulations}
        onComplete={() => {}}
        message="Phase 1 Accreditation Complete! (5/5 Skill Checks Passed)"
      />

      {showPhase1Congratulations && (
        <div
          id="phase-1-congratulations-modal"
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
        >
          <div className="bg-white rounded-3xl border-2 border-emerald-500 max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden text-center my-8">
            {/* Decorative Ambient Accents */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-100 rounded-full blur-2xl pointer-events-none opacity-60" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-teal-100 rounded-full blur-2xl pointer-events-none opacity-60" />

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowPhase1Congratulations(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Trophy Icon with celebratory ring */}
            <div className="relative inline-flex items-center justify-center">
              <div className="w-20 h-20 rounded-3xl bg-linear-to-tr from-emerald-500 via-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 ring-8 ring-emerald-50">
                <Trophy className="w-10 h-10 text-white animate-bounce" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-amber-400 border-2 border-white rounded-full p-1 shadow-xs">
                <Sparkles className="w-4 h-4 text-amber-900" />
              </div>
            </div>

            {/* Header Text */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold font-mono uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Accreditation Milestone Achieved</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                🎉 Congratulations! Phase 1 Complete
              </h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                You have successfully passed <strong>5 of 5 Core Marketing Diagnostic Skill Checks</strong> with an 80%+ benchmark. Your accredited skills are now verified and active on your talent profile!
              </p>
            </div>

            {/* Accredited Skills Showcase */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-left space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase font-mono tracking-wider">
                  5 Accredited Core Skills Verified
                </span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 5/5 Completed
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {displayAccreditedSkills.map((skill, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-slate-800 text-xs font-bold shadow-2xs transition-all duration-200 transform hover:scale-105 hover:shadow-md cursor-default select-none"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{skill}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Phase 2 Unlocked Card */}
            <div className="bg-linear-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 text-left flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                    Phase 2 Unlocked: Specialist Review
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900">
                    Ready to Schedule
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  You are now eligible to book your 30-minute technical evaluation with our specialist vetting panel.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowPhase1Congratulations(false);
                  const step2El = document.getElementById('step-2-verification-card');
                  if (step2El) {
                    step2El.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <span>Proceed to Step 2: Schedule Review</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowPhase1Congratulations(false)}
                className="w-full sm:w-auto py-3 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
              >
                View Updated Dossier
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
