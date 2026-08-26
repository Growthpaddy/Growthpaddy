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
  Camera
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
  phase_1_status?: Phase1Status;
  phase_2_status?: Phase2Status;
  phase_3_status?: Phase3Status;
  created_at?: string;
  updated_at?: string;
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

export interface TalentProfileProps {
  onSignOut?: () => void;
  navigateToPage?: (page: any) => void;
}

// 9 Standard Skill Categories
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

  // Edit Form Buffer
  const [formData, setFormData] = useState<{
    profile_picture_url: string;
    role_title: string;
    headline: string;
    bio: string;
    years_experience: number;
    location: string;
    remote_preference: string;
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
  // Helper: Aggregate Skill Matrix
  // ----------------------------------------------------------------------------
  const buildSkillMatrix = useCallback((attempts: any[]) => {
    const now = Date.now();
    return DEFAULT_SKILL_CATEGORIES.map((catName) => {
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
  // Fetch Candidate Profile & Verification Pipeline Data
  // ----------------------------------------------------------------------------
  const fetchTalentProfile = useCallback(async () => {
    setLoading(true);
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
              link: 'https://growthpaddy.com'
            }
          ],
          ai_tools: ['ChatGPT Plus', 'Midjourney', 'Claude 3.5 Sonnet', 'Perplexity', 'Make.com', 'Zapier AI'],
          certifications: ['Google Ads Search Certified', 'Meta Certified Media Buying Professional', 'HubSpot Inbound Marketing'],
          is_verified_badge: false,
          phase_1_quizzes_passed: 0,
          phase_1_completed: false,
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

      // Fetch Quiz Attempts
      const { data: attemptsData } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('talent_id', currentAuthUser.id)
        .order('created_at', { ascending: false });

      const matrix = buildSkillMatrix(attemptsData || []);
      setSkillMatrix(matrix);

      const passedCount = matrix.filter((m) => m.isPassed).length;
      const isPhase1Passed = passedCount >= 5 || profileData.phase_1_completed || profileData.phase_1_status === 'PASSED';

      // Automatically award skill tags based on passed quizzes (Read-Only)
      const passedSkillTitles = matrix.filter((m) => m.isPassed).map((m) => m.category);

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
        work_history: Array.isArray(profileData.work_history) ? profileData.work_history : [],
        education: Array.isArray(profileData.education) ? profileData.education : [],
        case_studies: Array.isArray(profileData.case_studies) ? profileData.case_studies : [],
        ai_tools: Array.isArray(profileData.ai_tools) ? profileData.ai_tools : ['ChatGPT', 'Midjourney', 'Zapier AI'],
        certifications: Array.isArray(profileData.certifications) ? profileData.certifications : ['Google Ads Search', 'Meta Media Buyer'],
        skills: passedSkillTitles.length > 0 ? passedSkillTitles : ['Paid Media Strategy', 'Full-Funnel Analytics', 'Conversion Rate Optimization'],
        phase_1_quizzes_passed: passedCount,
        phase_1_completed: isPhase1Passed,
        phase_1_status: isPhase1Passed ? 'PASSED' : (profileData.phase_1_status || 'IN_PROGRESS'),
        phase_2_status: isPhase1Passed && (!profileData.phase_2_status || profileData.phase_2_status === 'LOCKED')
          ? 'PENDING_SCHEDULE'
          : (profileData.phase_2_status || 'LOCKED'),
        phase_3_status: profileData.phase_3_status || (profileData.is_verified_badge ? 'VERIFIED' : 'LOCKED'),
        is_verified_badge: Boolean(profileData.is_verified_badge)
      };

      setProfile(normalizedProfile);

      // Populate Edit Form Buffer
      setFormData({
        profile_picture_url: normalizedProfile.profile_picture_url || '',
        role_title: normalizedProfile.role_title || '',
        headline: normalizedProfile.headline || '',
        bio: normalizedProfile.bio || '',
        years_experience: normalizedProfile.years_experience || 4,
        location: normalizedProfile.location || '',
        remote_preference: normalizedProfile.remote_preference || 'Remote',
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
      setImageError(false);
    } catch (err: any) {
      console.error('Error fetching talent profile:', err);
    } finally {
      setLoading(false);
    }
  }, [user, buildSkillMatrix]);

  useEffect(() => {
    fetchTalentProfile();
  }, [fetchTalentProfile]);

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

      // ONLY editable fields payload (Strictly exclude locked fields: is_verified_badge, vetting_phase, phase_*_status, phase_1_quizzes_passed, skills)
      const editablePayload = {
        profile_picture_url: formData.profile_picture_url.trim() || null,
        role_title: formData.role_title,
        headline: formData.headline,
        bio: formData.bio,
        years_experience: Number(formData.years_experience),
        location: formData.location,
        remote_preference: formData.remote_preference,
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

  // ----------------------------------------------------------------------------
  // EXACT PRELOADER SCREEN MANDATE
  // ----------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-700">Loading Candidate Profile...</p>
        </div>
      </div>
    );
  }

  const passedQuizzesCount = profile?.phase_1_quizzes_passed || skillMatrix.filter((s) => s.isPassed).length;
  const isPhase1Done = passedQuizzesCount >= 5 || profile?.phase_1_completed;
  const initials = getInitials(profile?.full_name);

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
                  GrowthPaddy
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
              onClick={() => setIsEditing(!isEditing)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Portfolio'}</span>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        {/* ========================================================================= */}
        {/* 1. TOP PROFILE HEADER & AVATAR ZONE */}
        {/* ========================================================================= */}
        <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
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
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-200 shadow-inner bg-slate-100"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800 font-bold text-xl sm:text-2xl shadow-inner tracking-wider">
                    {initials}
                  </div>
                )}

                {profile?.is_verified_badge && (
                  <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full ring-2 ring-white shadow-xs" title="Verified Badge Active">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                )}
              </div>

              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    {profile?.full_name}
                  </h1>

                  {/* Read-Only Verified Badge */}
                  {profile?.is_verified_badge ? (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verified Talent Badge</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Verification In Progress</span>
                    </span>
                  )}

                  {/* Read-Only Placement Status */}
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    profile?.placement_status === 'AVAILABLE'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${profile?.placement_status === 'AVAILABLE' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    <span>{profile?.placement_status === 'AVAILABLE' ? 'Available for Placement' : 'In Placement / Hired'}</span>
                  </span>
                </div>

                <p className="text-sm font-bold text-slate-800">{profile?.role_title || profile?.headline}</p>

                {profile?.bio && (
                  <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
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
              </div>
            </div>

            {/* Quick External Links Row */}
            <div className="flex flex-wrap items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
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
        {/* 2. 3-PHASE VERIFICATION PIPELINE (STRICTLY READ-ONLY) */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">3-Phase Candidate Verification Pipeline</h2>
                <span className="text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  Read-Only Authority
                </span>
              </div>
              <p className="text-xs text-slate-500">Pipeline advancement, quiz credits, and verification badges are awarded through specialist audits and assessment scores.</p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-700 shadow-2xs">
              {profile?.is_verified_badge ? 'Phase 3/3 (Verified)' : profile?.phase_2_status === 'COMPLETED' ? 'Phase 3/3 (Payment Ready)' : isPhase1Done ? 'Phase 2/3 (Interview)' : 'Phase 1/3 (Quizzes)'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* PHASE 1: Quizzes */}
            <div className={`bg-white rounded-3xl p-6 border transition shadow-xs flex flex-col justify-between ${
              isPhase1Done ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200'
            }`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                      isPhase1Done ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      1
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">Diagnostic Quizzes</h3>
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

                <p className="text-xs text-slate-600 leading-relaxed">
                  Pass 5 or more skill diagnostic categories with an 80%+ benchmark.
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

              <div className="pt-4 border-t border-slate-100 mt-4 text-[11px] font-medium text-slate-500 flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Awarded automatically via quiz completions</span>
              </div>
            </div>

            {/* PHASE 2: Specialist Interview */}
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
                      Pending Schedule
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
                  30-minute technical evaluation on execution velocity, campaign strategy, and growth architecture.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 text-[11px] font-medium text-slate-500 flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Evaluated by GrowthPaddy panel</span>
              </div>
            </div>

            {/* PHASE 3: Badge Issuance */}
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
                  Final authorization and inclusion in recruiter talent directory.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 text-[11px] font-medium text-slate-500 flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Authorized via fee settlement</span>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. EDITABLE PORTFOLIO & RESUME MANAGEMENT FORM */}
        {/* ========================================================================= */}
        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-8 animate-fadeIn">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Edit Portfolio Dossier & Resume</h2>
                <p className="text-xs text-slate-500">Update your avatar, public profile, external links, career history, and toolkits.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </div>

            {/* Profile Picture URL Field & Live Preview */}
            <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                <Camera className="w-4 h-4 text-emerald-600" />
                <span>Profile Picture URL Management</span>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-200 shrink-0 border border-slate-300 flex items-center justify-center">
                  {formData.profile_picture_url.trim() ? (
                    <img
                      src={formData.profile_picture_url.trim()}
                      alt="Avatar Preview"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold text-slate-500">
                      {initials}
                    </span>
                  )}
                </div>
                <div className="flex-1 w-full space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Avatar Image URL (Direct link to PNG, JPG, WebP)</label>
                  <input
                    type="url"
                    value={formData.profile_picture_url}
                    onChange={(e) => setFormData({ ...formData, profile_picture_url: e.target.value })}
                    placeholder="https://images.unsplash.com/... or hosted picture link"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  />
                  <p className="text-[11px] text-slate-500">If empty or unreachable, the header automatically displays your initials ({initials}).</p>
                </div>
              </div>
            </div>

            {/* Basic Info Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Role Title</label>
                <input
                  type="text"
                  required
                  value={formData.role_title}
                  onChange={(e) => setFormData({ ...formData, role_title: e.target.value })}
                  placeholder="e.g. Senior Growth Marketer"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Years of Experience</label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  required
                  value={formData.years_experience}
                  onChange={(e) => setFormData({ ...formData, years_experience: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Lagos, Nigeria / London, UK"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Remote Preference</label>
                <select
                  value={formData.remote_preference}
                  onChange={(e) => setFormData({ ...formData, remote_preference: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50/50"
                >
                  <option value="Remote">Remote Only</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>
            </div>

            {/* Headline & Bio */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Professional Headline</label>
                <input
                  type="text"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  placeholder="Short impact summary"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Executive Bio & Career Summary</label>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Describe your core domain specializations, past campaign sizes, and key achievements..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50/50"
                />
              </div>
            </div>

            {/* Contact & External Links */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">Contact & External Dossier Links</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">Contact Email</label>
                  <input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    placeholder="+1 555 123 4567"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">WhatsApp Number</label>
                  <input
                    type="text"
                    value={formData.whatsapp_number}
                    onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                    placeholder="+234 800 000 0000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">CV Document URL</label>
                  <input
                    type="url"
                    value={formData.cv_url}
                    onChange={(e) => setFormData({ ...formData, cv_url: e.target.value })}
                    placeholder="https://drive.google.com/... or Notion link"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">Portfolio Website URL</label>
                  <input
                    type="url"
                    value={formData.portfolio_url}
                    onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                    placeholder="https://yourportfolio.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    value={formData.linkedin_url}
                    onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50/50"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2 lg:col-span-3">
                  <label className="text-[11px] font-semibold text-slate-600">GitHub Profile URL</label>
                  <input
                    type="url"
                    value={formData.github_url}
                    onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                    placeholder="https://github.com/username"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50/50"
                  />
                </div>
              </div>
            </div>

            {/* Work History Builder */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">Work Experience History</h3>
                <button
                  type="button"
                  onClick={handleAddWorkHistory}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Experience</span>
                </button>
              </div>

              <div className="space-y-3">
                {formData.work_history.map((work, idx) => (
                  <div key={idx} className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-2.5 relative">
                    <button
                      type="button"
                      onClick={() => handleRemoveWorkHistory(idx)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      title="Remove experience"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pr-6">
                      <input
                        type="text"
                        placeholder="Company Name"
                        value={work.company}
                        onChange={(e) => handleUpdateWorkHistory(idx, 'company', e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                      />
                      <input
                        type="text"
                        placeholder="Role / Title"
                        value={work.role}
                        onChange={(e) => handleUpdateWorkHistory(idx, 'role', e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                      />
                      <input
                        type="text"
                        placeholder="Duration (e.g. 2022 - Present)"
                        value={work.duration}
                        onChange={(e) => handleUpdateWorkHistory(idx, 'duration', e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                      />
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Key accomplishments, budget managed, conversion metrics achieved..."
                      value={work.description}
                      onChange={(e) => handleUpdateWorkHistory(idx, 'description', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Education Builder */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">Education & Academic Degrees</h3>
                <button
                  type="button"
                  onClick={handleAddEducation}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Degree</span>
                </button>
              </div>

              <div className="space-y-3">
                {formData.education.map((edu, idx) => (
                  <div key={idx} className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-2 relative">
                    <input
                      type="text"
                      placeholder="University / School"
                      value={edu.school}
                      onChange={(e) => handleUpdateEducation(idx, 'school', e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                    />
                    <input
                      type="text"
                      placeholder="Degree / Major"
                      value={edu.degree}
                      onChange={(e) => handleUpdateEducation(idx, 'degree', e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Year (e.g. 2021)"
                        value={edu.year}
                        onChange={(e) => handleUpdateEducation(idx, 'year', e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveEducation(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 cursor-pointer"
                        title="Remove degree"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Case Studies Builder */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">Case Studies & Growth Highlights</h3>
                <button
                  type="button"
                  onClick={handleAddCaseStudy}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Case Study</span>
                </button>
              </div>

              <div className="space-y-3">
                {formData.case_studies.map((cs, idx) => (
                  <div key={idx} className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-2.5 relative">
                    <button
                      type="button"
                      onClick={() => handleRemoveCaseStudy(idx)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                      title="Remove case study"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pr-6">
                      <input
                        type="text"
                        placeholder="Case Study Title"
                        value={cs.title}
                        onChange={(e) => handleUpdateCaseStudy(idx, 'title', e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                      />
                      <input
                        type="text"
                        placeholder="Client / Brand"
                        value={cs.client_or_brand}
                        onChange={(e) => handleUpdateCaseStudy(idx, 'client_or_brand', e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                      />
                      <input
                        type="text"
                        placeholder="Metrics Achieved (e.g. +140% ROAS)"
                        value={cs.metrics_achieved}
                        onChange={(e) => handleUpdateCaseStudy(idx, 'metrics_achieved', e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                      />
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Execution strategy, funnel mechanics, optimization results..."
                      value={cs.description}
                      onChange={(e) => handleUpdateCaseStudy(idx, 'description', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                    />
                    <input
                      type="url"
                      placeholder="Case Study Link (optional)"
                      value={cs.link || ''}
                      onChange={(e) => handleUpdateCaseStudy(idx, 'link', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* AI Tools & Certifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">AI Growth Tools (Comma-separated)</label>
                <input
                  type="text"
                  value={formData.ai_tools_input}
                  onChange={(e) => setFormData({ ...formData, ai_tools_input: e.target.value })}
                  placeholder="ChatGPT Plus, Midjourney, Claude 3.5, Make.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Certifications (Comma-separated)</label>
                <input
                  type="text"
                  value={formData.certifications_input}
                  onChange={(e) => setFormData({ ...formData, certifications_input: e.target.value })}
                  placeholder="Google Ads Search Certified, Meta Certified Buyer"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Profile Dossier</span>
              </button>
            </div>

          </form>
        ) : (
          /* ========================================================================= */
          /* 4. READ-ONLY DISPLAY OF PORTFOLIO, CAREER & SKILLS */
          /* ========================================================================= */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Work History & Case Studies */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Work History */}
              <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm font-bold text-slate-900">Career & Work Experience</h3>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
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
                      <div key={idx} className="space-y-1.5 border-b border-slate-100 last:border-0 pb-3 last:pb-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900">{work.role}</h4>
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{work.duration}</span>
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

              {/* Case Studies */}
              {(profile?.case_studies || []).length > 0 && (
                <section className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-900">Featured Growth Case Studies</h3>
                  </div>

                  <div className="space-y-4">
                    {(profile?.case_studies || []).map((cs, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">{cs.title}</h4>
                            <p className="text-[11px] text-slate-500">{cs.client_or_brand}</p>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            {cs.metrics_achieved}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{cs.description}</p>
                        {cs.link && (
                          <a
                            href={cs.link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:underline pt-1"
                          >
                            <span>View Case Study</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

            </div>

            {/* Right Column: Skills, AI Tools, Education */}
            <div className="space-y-6">
              
              {/* Accredited Skills (Strictly Locked / Read-Only from Quizzes) */}
              <section className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-xs font-bold text-slate-900">Accredited Skills</h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 font-bold flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    Auto-Awarded
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(profile?.skills || []).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold text-[11px] flex items-center gap-1"
                    >
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>{skill}</span>
                    </span>
                  ))}
                </div>
              </section>

              {/* AI Growth Toolkit */}
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
        )}

      </main>
    </div>
  );
}
