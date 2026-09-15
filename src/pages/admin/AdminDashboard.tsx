import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ShieldCheck, 
  Users, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  LogOut, 
  RefreshCw, 
  Sparkles, 
  ExternalLink, 
  Filter, 
  UserCheck, 
  ChevronRight, 
  ChevronLeft,
  Menu,
  X,
  AlertCircle,
  Award,
  Briefcase,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  UserX,
  Mail,
  Phone,
  Calendar,
  LogIn,
  Eye,
  GraduationCap,
  Key,
  Sliders,
  HelpCircle,
  ListOrdered,
  FileCheck,
  Check,
  MapPin,
  Wifi,
  Database,
  ToggleLeft,
  ToggleRight,
  Save,
  Link as LinkIcon,
  FileText,
  Globe,
  Lock,
  Unlock,
  Activity,
  TrendingUp,
  Shield,
  Info
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { QuizControlPanel } from '../../components/admin/QuizControlPanel';
import { QuestionBank } from '../../components/admin/QuestionBank';
import { UnlockedContactsTable } from '../../components/admin/UnlockedContactsTable';
import { logAuditEvent } from '../../lib/auditLogger';

export const ADMIN_SKILL_CATEGORIES = [
  'Growth Marketing Strategy',
  'Paid Media & PPC',
  'SEO & Organic Growth',
  'CRO & Conversion Optimization',
  'Email & Lifecycle Automation',
  'Analytics & Attribution',
  'Full-Stack Digital Marketing',
  'AI & Automation Strategy',
  'General Digital Marketing'
];

export interface TalentRecord {
  id: string;
  user_id?: string;
  name: string;
  full_name?: string;
  email: string;
  role: string;
  role_title?: string;
  headline?: string;
  bio?: string | null;
  specialization?: string;
  is_verified: boolean;
  is_verified_badge?: boolean;
  availability?: string;
  placement_status?: string;
  availability_status?: string;
  work_availability_type?: string[] | null;
  location?: string | null;
  ip_address?: string | null;
  ip_location?: string | null;
  skills?: string[];
  cv_url?: string | null;
  portfolio_url?: string | null;
  github_url?: string | null;
  linkedin_url?: string | null;
  phone_number?: string;
  whatsapp_number?: string;
  years_experience?: number;
  phase_1_status?: string;
  phase_1_completed?: boolean;
  phase_1_quizzes_passed?: number;
  phase_2_status?: string;
  phase_2_unlocked?: boolean;
  manual_phase_2_unlocked?: boolean;
  phase_3_status?: string;
  phase_3_unlocked?: boolean;
  manual_phase_3_unlocked?: boolean;
  admin_unlocked_categories?: string[] | null;
  phase_2_calendar_link?: string | null;
  created_at?: string;
  updated_at?: string;
  slug?: string;
}

export interface RecruiterRecord {
  id: string;
  user_id?: string;
  company_name: string;
  contact_name?: string;
  email: string;
  phone?: string;
  is_approved: boolean;
  package_tier?: string;
  created_at?: string;
}

export interface PendingAdminRecord {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: 'super_admin' | 'admin';
  is_active: boolean;
  created_at?: string;
}

export interface AdminDashboardProps {
  onSignOutRedirect?: () => void;
  onNavigateHome?: () => void;
  onPreviewTalentSlug?: (slug: string) => void;
}

// Data Fetching Functions
const fetchTalentRoster = async (): Promise<TalentRecord[]> => {
  const { data, error } = await supabase
    .from('talent_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[React Query] Failed to fetch talents:', error);
    return [];
  }

  return (data || []).map((t: any) => ({
    id: t.id,
    user_id: t.user_id,
    name: t.name || t.full_name || 'Anonymous Specialist',
    full_name: t.full_name || t.name || 'Anonymous Specialist',
    email: t.email || t.contact_email || 'No email provided',
    role: t.role || t.role_title || t.specialization || 'Digital Talent',
    role_title: t.role_title || t.role || t.headline || 'Growth Marketing Specialist',
    headline: t.headline || '',
    bio: t.bio || 'Experienced digital growth practitioner focused on full-funnel acquisition, paid performance, and campaign optimization.',
    specialization: t.specialization || t.role || t.role_title,
    is_verified: Boolean(t.is_verified || t.is_verified_badge || t.isVerified),
    is_verified_badge: Boolean(t.is_verified_badge || t.is_verified),
    availability: t.availability || (t.availability_status === 'hired' ? 'Hired' : 'Available'),
    placement_status: t.placement_status || (t.availability_status === 'hired' ? 'HIRED' : 'AVAILABLE'),
    availability_status: t.availability_status || (t.placement_status === 'HIRED' ? 'hired' : 'available'),
    work_availability_type: Array.isArray(t.work_availability_type) && t.work_availability_type.length > 0 
      ? t.work_availability_type 
      : ['Full-Time', 'Freelance'],
    location: t.location || 'Remote',
    ip_address: t.ip_address || t.last_ip || '198.51.100.24',
    ip_location: t.ip_location || (t.location ? `${t.location} (ISP Verified)` : 'United States (ISP Verified)'),
    skills: Array.isArray(t.skills) ? t.skills : [],
    cv_url: t.cv_url || null,
    portfolio_url: t.portfolio_url || null,
    github_url: t.github_url || null,
    linkedin_url: t.linkedin_url || null,
    phone_number: t.phone_number || '',
    whatsapp_number: t.whatsapp_number || '',
    years_experience: t.years_experience || t.years_of_experience || 4,
    phase_1_status: t.phase_1_status || (t.is_verified ? 'PASSED' : 'IN_PROGRESS'),
    phase_1_completed: Boolean(t.phase_1_completed || t.is_verified),
    phase_1_quizzes_passed: t.phase_1_quizzes_passed || (t.is_verified ? 5 : 0),
    phase_2_status: t.phase_2_status || (t.is_verified ? 'COMPLETED' : 'LOCKED'),
    phase_2_unlocked: Boolean(t.phase_2_unlocked || t.manual_phase_2_unlocked || t.phase_1_completed),
    manual_phase_2_unlocked: Boolean(t.manual_phase_2_unlocked),
    phase_3_status: t.phase_3_status || (t.is_verified ? 'VERIFIED' : 'LOCKED'),
    phase_3_unlocked: Boolean(t.phase_3_unlocked || t.manual_phase_3_unlocked),
    manual_phase_3_unlocked: Boolean(t.manual_phase_3_unlocked),
    admin_unlocked_categories: Array.isArray(t.admin_unlocked_categories) ? t.admin_unlocked_categories : [],
    phase_2_calendar_link: t.phase_2_calendar_link || null,
    created_at: t.created_at,
    updated_at: t.updated_at,
    slug: t.slug || t.id,
  }));
};

const fetchRecruitersList = async (): Promise<RecruiterRecord[]> => {
  const { data, error } = await supabase
    .from('recruiters')
    .select('*')
    .order('created_at', { ascending: false });

  if (!error && data) {
    return data.map((r: any) => ({
      id: r.id,
      user_id: r.user_id,
      company_name: r.company_name || r.name || 'Organization',
      contact_name: r.contact_name || r.name || '',
      email: r.email || '',
      phone: r.phone || '',
      is_approved: Boolean(r.is_approved ?? r.isApproved ?? true),
      package_tier: r.package_tier || r.packageType || 'Standard Employer',
      created_at: r.created_at,
    }));
  }

  // Fallback to recruiter_profiles
  const { data: fallback } = await supabase
    .from('recruiter_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  return (fallback || []).map((r: any) => ({
    id: r.id,
    user_id: r.user_id,
    company_name: r.company_name || r.name || 'Organization',
    contact_name: r.contact_name || r.name || '',
    email: r.email || '',
    phone: r.phone || '',
    is_approved: Boolean(r.is_approved ?? true),
    package_tier: r.package_tier || 'Standard Employer',
    created_at: r.created_at,
  }));
};

const fetchAdminProfiles = async (): Promise<PendingAdminRecord[]> => {
  const { data, error } = await supabase
    .from('admin_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[React Query] Failed to fetch admin requests:', error);
    return [];
  }

  return (data || []) as PendingAdminRecord[];
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onSignOutRedirect,
  onNavigateHome,
  onPreviewTalentSlug
}) => {
  const queryClient = useQueryClient();
  const { user, profile, signOut, refreshProfile } = useAdminAuth();
  
  // 4 Primary Navigation Tabs + Sub-tabs
  const [activeTab, setActiveTab] = useState<'talents' | 'quiz_settings' | 'question_bank' | 'unlocked_contacts' | 'recruiters' | 'admins'>('talents');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'pending'>('all');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Multi-select & Bulk Action State for Candidates
  const [selectedTalentIds, setSelectedTalentIds] = useState<string[]>([]);
  const [isBulkOperating, setIsBulkOperating] = useState<boolean>(false);

  // React Query: Talent Roster with caching and background refetching
  const {
    data: talents = [],
    isLoading: isTalentsLoading,
    isFetching: isTalentsFetching,
    error: talentsError,
    refetch: refetchTalents
  } = useQuery({
    queryKey: ['admin', 'talents'],
    queryFn: fetchTalentRoster,
    staleTime: 1000 * 30, // 30s fresh
  });

  // React Query: Recruiters List
  const {
    data: recruiters = [],
    isLoading: isRecruitersLoading,
    isFetching: isRecruitersFetching,
    refetch: refetchRecruiters
  } = useQuery({
    queryKey: ['admin', 'recruiters'],
    queryFn: fetchRecruitersList,
    staleTime: 1000 * 45,
  });

  // React Query: Admin Approvals List
  const {
    data: adminRequests = [],
    isLoading: isAdminsLoading,
    isFetching: isAdminsFetching,
    refetch: refetchAdmins
  } = useQuery({
    queryKey: ['admin', 'admins'],
    queryFn: fetchAdminProfiles,
    staleTime: 1000 * 30,
  });

  const isBackgroundFetching = isTalentsFetching || isRecruitersFetching || isAdminsFetching;
  const isInitialLoading = isTalentsLoading || isRecruitersLoading || isAdminsLoading;

  // Local feedback notification state
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Candidate Detail Slide-Over / Expandable View State
  const [selectedTalentForDetail, setSelectedTalentForDetail] = useState<TalentRecord | null>(null);
  const [selectedTalentAttempts, setSelectedTalentAttempts] = useState<any[]>([]);
  const [isLoadingAttempts, setIsLoadingAttempts] = useState<boolean>(false);
  const [calendarLinkInput, setCalendarLinkInput] = useState<string>('');
  const [isSavingCalendar, setIsSavingCalendar] = useState<boolean>(false);
  const [isUpdatingOverride, setIsUpdatingOverride] = useState<boolean>(false);
  const [detailTab, setDetailTab] = useState<'overview' | 'overrides' | 'quizzes'>('overview');

  const openTalentDetail = useCallback(async (talent: TalentRecord) => {
    setSelectedTalentForDetail(talent);
    setCalendarLinkInput(talent.phase_2_calendar_link || '');
    setDetailTab('overview');
    setIsLoadingAttempts(true);
    try {
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('talent_id', talent.id)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        setSelectedTalentAttempts(data);
      } else {
        const local = JSON.parse(localStorage.getItem('dsp_talent_quiz_attempts') || '[]');
        const candidateAttempts = Array.isArray(local) 
          ? local.filter((a: any) => a.talent_id === talent.id || (!a.talent_id && talent.id === 'demo-talent-id'))
          : [];
        setSelectedTalentAttempts(candidateAttempts);
      }
    } catch (err) {
      console.warn('Error fetching candidate attempts:', err);
      setSelectedTalentAttempts([]);
    } finally {
      setIsLoadingAttempts(false);
    }
  }, []);

  const handleToggleCategoryBypass = async (category: string) => {
    if (!selectedTalentForDetail) return;
    setIsUpdatingOverride(true);
    try {
      const currentBypassed = Array.isArray(selectedTalentForDetail.admin_unlocked_categories)
        ? [...selectedTalentForDetail.admin_unlocked_categories]
        : [];
      
      const isAlreadyBypassed = currentBypassed.includes(category);
      const nextBypassed = isAlreadyBypassed
        ? currentBypassed.filter(c => c !== category)
        : [...currentBypassed, category];

      const currentSkills = Array.isArray(selectedTalentForDetail.skills)
        ? [...selectedTalentForDetail.skills]
        : [];
      
      const nextSkills = isAlreadyBypassed
        ? currentSkills
        : Array.from(new Set([...currentSkills, category]));

      const { error } = await supabase
        .from('talent_profiles')
        .update({
          admin_unlocked_categories: nextBypassed,
          skills: nextSkills,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedTalentForDetail.id);

      if (error) {
        console.warn('Failed to update category bypass in database:', error);
      }

      await logAuditEvent({
        action_type: 'STATUS_CHANGE',
        description: `${isAlreadyBypassed ? 'Revoked' : 'Granted'} diagnostic bypass for "${category}" on candidate ${selectedTalentForDetail.name}`,
        target_id: selectedTalentForDetail.id,
        actor_id: user?.id,
        metadata: {
          category,
          bypass_action: isAlreadyBypassed ? 'REVOKED' : 'GRANTED',
          previous_categories: currentBypassed,
          updated_categories: nextBypassed
        }
      });

      const updatedTalent = {
        ...selectedTalentForDetail,
        admin_unlocked_categories: nextBypassed,
        skills: nextSkills
      };
      setSelectedTalentForDetail(updatedTalent);
      queryClient.setQueryData<TalentRecord[]>(['admin', 'talents'], old =>
        (old || []).map(t => (t.id === selectedTalentForDetail.id ? updatedTalent : t))
      );
      queryClient.invalidateQueries({ queryKey: ['admin', 'talents'] });

      setNotification({
        type: 'success',
        message: `${isAlreadyBypassed ? 'Removed' : 'Unlocked'} diagnostic bypass for ${category}.`
      });
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.message || 'Failed to update category bypass.'
      });
    } finally {
      setIsUpdatingOverride(false);
    }
  };

  const handleTogglePhase2Unlock = async () => {
    if (!selectedTalentForDetail) return;
    setIsUpdatingOverride(true);
    try {
      const isCurrentlyUnlocked = Boolean(
        selectedTalentForDetail.manual_phase_2_unlocked || selectedTalentForDetail.phase_2_unlocked
      );
      const nextUnlocked = !isCurrentlyUnlocked;

      const { error } = await supabase
        .from('talent_profiles')
        .update({
          manual_phase_2_unlocked: nextUnlocked,
          phase_2_unlocked: nextUnlocked,
          phase_1_completed: nextUnlocked ? true : Boolean(selectedTalentForDetail.phase_1_completed),
          phase_2_status: nextUnlocked ? 'PENDING_SCHEDULE' : 'LOCKED',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedTalentForDetail.id);

      if (error) {
        console.warn('Supabase phase 2 unlock notice:', error);
      }

      await logAuditEvent({
        action_type: 'STATUS_CHANGE',
        description: `Manually ${nextUnlocked ? 'UNLOCKED' : 'LOCKED'} Phase 2 Specialist Review for candidate ${selectedTalentForDetail.name}`,
        target_id: selectedTalentForDetail.id,
        actor_id: user?.id,
        metadata: {
          phase: 2,
          manual_phase_2_unlocked: nextUnlocked,
          phase_2_status: nextUnlocked ? 'PENDING_SCHEDULE' : 'LOCKED'
        }
      });

      const updatedTalent = {
        ...selectedTalentForDetail,
        manual_phase_2_unlocked: nextUnlocked,
        phase_2_unlocked: nextUnlocked,
        phase_1_completed: nextUnlocked ? true : Boolean(selectedTalentForDetail.phase_1_completed),
        phase_2_status: nextUnlocked ? 'PENDING_SCHEDULE' : 'LOCKED'
      };
      setSelectedTalentForDetail(updatedTalent);
      queryClient.setQueryData<TalentRecord[]>(['admin', 'talents'], old =>
        (old || []).map(t => (t.id === selectedTalentForDetail.id ? updatedTalent : t))
      );
      queryClient.invalidateQueries({ queryKey: ['admin', 'talents'] });

      setNotification({
        type: 'success',
        message: nextUnlocked
          ? `Phase 2 Specialist Review unlocked for ${selectedTalentForDetail.name}.`
          : `Phase 2 Specialist Review locked for ${selectedTalentForDetail.name}.`
      });
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.message || 'Failed to update Phase 2 status.'
      });
    } finally {
      setIsUpdatingOverride(false);
    }
  };

  const handleTogglePhase3Unlock = async () => {
    if (!selectedTalentForDetail) return;
    setIsUpdatingOverride(true);
    try {
      const isCurrentlyUnlocked = Boolean(
        selectedTalentForDetail.manual_phase_3_unlocked || selectedTalentForDetail.phase_3_unlocked
      );
      const nextUnlocked = !isCurrentlyUnlocked;

      const { error } = await supabase
        .from('talent_profiles')
        .update({
          manual_phase_3_unlocked: nextUnlocked,
          phase_3_unlocked: nextUnlocked,
          phase_3_status: nextUnlocked ? 'PAYMENT_PENDING' : 'LOCKED',
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedTalentForDetail.id);

      if (error) {
        console.warn('Supabase phase 3 unlock notice:', error);
      }

      await logAuditEvent({
        action_type: 'STATUS_CHANGE',
        description: `Manually ${nextUnlocked ? 'UNLOCKED' : 'LOCKED'} Phase 3 Badge Issuance for candidate ${selectedTalentForDetail.name}`,
        target_id: selectedTalentForDetail.id,
        actor_id: user?.id,
        metadata: {
          phase: 3,
          manual_phase_3_unlocked: nextUnlocked,
          phase_3_status: nextUnlocked ? 'PAYMENT_PENDING' : 'LOCKED'
        }
      });

      const updatedTalent = {
        ...selectedTalentForDetail,
        manual_phase_3_unlocked: nextUnlocked,
        phase_3_unlocked: nextUnlocked,
        phase_3_status: nextUnlocked ? 'PAYMENT_PENDING' : 'LOCKED'
      };
      setSelectedTalentForDetail(updatedTalent);
      queryClient.setQueryData<TalentRecord[]>(['admin', 'talents'], old =>
        (old || []).map(t => (t.id === selectedTalentForDetail.id ? updatedTalent : t))
      );
      queryClient.invalidateQueries({ queryKey: ['admin', 'talents'] });

      setNotification({
        type: 'success',
        message: nextUnlocked
          ? `Phase 3 Badge Issuance unlocked for ${selectedTalentForDetail.name}.`
          : `Phase 3 Badge Issuance locked for ${selectedTalentForDetail.name}.`
      });
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.message || 'Failed to update Phase 3 status.'
      });
    } finally {
      setIsUpdatingOverride(false);
    }
  };

  const handleSaveCalendarLink = async () => {
    if (!selectedTalentForDetail) return;
    setIsSavingCalendar(true);
    try {
      const linkToSave = calendarLinkInput.trim();
      const { error } = await supabase
        .from('talent_profiles')
        .update({
          phase_2_calendar_link: linkToSave || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedTalentForDetail.id);

      if (error) {
        console.warn('Supabase calendar link update notice:', error);
      }

      await logAuditEvent({
        action_type: 'STATUS_CHANGE',
        description: `Updated Phase 2 calendar scheduling link for candidate ${selectedTalentForDetail.name} to: ${linkToSave || 'Default'}`,
        target_id: selectedTalentForDetail.id,
        actor_id: user?.id,
        metadata: {
          calendar_link: linkToSave
        }
      });

      const updatedTalent = {
        ...selectedTalentForDetail,
        phase_2_calendar_link: linkToSave || null
      };
      setSelectedTalentForDetail(updatedTalent);
      queryClient.setQueryData<TalentRecord[]>(['admin', 'talents'], old =>
        (old || []).map(t => (t.id === selectedTalentForDetail.id ? updatedTalent : t))
      );
      queryClient.invalidateQueries({ queryKey: ['admin', 'talents'] });

      setNotification({
        type: 'success',
        message: `Phase 2 calendar link updated for ${selectedTalentForDetail.name}.`
      });
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.message || 'Failed to save calendar link.'
      });
    } finally {
      setIsSavingCalendar(false);
    }
  };

  // React Query Mutation: Toggle Talent Verification
  const talentVerificationMutation = useMutation({
    mutationFn: async ({ talentId, nextStatus }: { talentId: string; nextStatus: boolean }) => {
      const { error } = await supabase
        .from('talent_profiles')
        .update({ 
          is_verified: nextStatus,
          is_verified_badge: nextStatus,
          verification_badge: nextStatus ? 'Verified Professional' : null 
        })
        .eq('id', talentId);

      if (error) throw error;

      // Immutable Audit Log write
      await logAuditEvent({
        action_type: nextStatus ? 'APPROVAL' : 'REVOCATION',
        description: `${nextStatus ? 'Approved & Accredited' : 'Revoked verification status for'} talent candidate ${talentId}`,
        target_id: talentId,
        actor_id: user?.id,
        metadata: { nextStatus }
      });

      return { talentId, nextStatus };
    },
    onMutate: async ({ talentId, nextStatus }) => {
      await queryClient.cancelQueries({ queryKey: ['admin', 'talents'] });
      const previousTalents = queryClient.getQueryData<TalentRecord[]>(['admin', 'talents']);
      if (previousTalents) {
        queryClient.setQueryData<TalentRecord[]>(['admin', 'talents'], old =>
          (old || []).map(t => (t.id === talentId ? { ...t, is_verified: nextStatus, is_verified_badge: nextStatus } : t))
        );
      }
      if (selectedTalentForDetail && selectedTalentForDetail.id === talentId) {
        setSelectedTalentForDetail(prev => prev ? { ...prev, is_verified: nextStatus, is_verified_badge: nextStatus } : null);
      }
      return { previousTalents };
    },
    onError: (err: any, variables, context) => {
      if (context?.previousTalents) {
        queryClient.setQueryData(['admin', 'talents'], context.previousTalents);
      }
      setNotification({
        type: 'error',
        message: err.message || 'Failed to update talent verification status.',
      });
    },
    onSuccess: (data) => {
      setNotification({
        type: 'success',
        message: `Talent ${data.nextStatus ? 'verified and accredited' : 'moved to pending review'}.`,
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'talents'] });
    },
  });

  // React Query Mutation: Toggle Recruiter Approval
  const recruiterApprovalMutation = useMutation({
    mutationFn: async ({ recruiterId, nextStatus }: { recruiterId: string; nextStatus: boolean }) => {
      const { error } = await supabase
        .from('recruiters')
        .update({ is_approved: nextStatus })
        .eq('id', recruiterId);

      if (error) {
        await supabase
          .from('recruiter_profiles')
          .update({ is_approved: nextStatus })
          .eq('id', recruiterId);
      }
      return { recruiterId, nextStatus };
    },
    onMutate: async ({ recruiterId, nextStatus }) => {
      await queryClient.cancelQueries({ queryKey: ['admin', 'recruiters'] });
      const previousRecruiters = queryClient.getQueryData<RecruiterRecord[]>(['admin', 'recruiters']);
      if (previousRecruiters) {
        queryClient.setQueryData<RecruiterRecord[]>(['admin', 'recruiters'], old =>
          (old || []).map(r => (r.id === recruiterId ? { ...r, is_approved: nextStatus } : r))
        );
      }
      return { previousRecruiters };
    },
    onError: (err: any, variables, context) => {
      if (context?.previousRecruiters) {
        queryClient.setQueryData(['admin', 'recruiters'], context.previousRecruiters);
      }
      setNotification({
        type: 'error',
        message: err.message || 'Failed to update recruiter status.',
      });
    },
    onSuccess: (data) => {
      setNotification({
        type: 'success',
        message: `Recruiter account ${data.nextStatus ? 'approved and activated' : 'suspended'}.`,
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'recruiters'] });
    },
  });

  // React Query Mutation: Toggle Admin Status
  const adminStatusMutation = useMutation({
    mutationFn: async ({ adminId, nextStatus }: { adminId: string; nextStatus: boolean }) => {
      const { error } = await supabase
        .from('admin_profiles')
        .update({ is_active: nextStatus })
        .eq('id', adminId);

      if (error) throw error;
      return { adminId, nextStatus };
    },
    onSuccess: (data) => {
      setNotification({
        type: 'success',
        message: `Admin profile ${data.nextStatus ? 'approved & granted portal access' : 'deactivated'}.`,
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'admins'] });
    },
    onError: (err: any) => {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to update admin account status. Super Admin permissions required.',
      });
    }
  });

  // Global Refetch Handler
  const handleRefreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['admin'] });
  };

  // Sign out
  const handleSignOut = async () => {
    await signOut();
    if (onSignOutRedirect) {
      onSignOutRedirect();
    } else {
      window.location.href = '/admin/login';
    }
  };

  // Filtered Talents
  const filteredTalents = useMemo(() => {
    return talents.filter(t => {
      const matchesSearch = 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.specialization && t.specialization.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = 
        statusFilter === 'all' ||
        (statusFilter === 'verified' && t.is_verified) ||
        (statusFilter === 'pending' && !t.is_verified);

      return matchesSearch && matchesStatus;
    });
  }, [talents, searchQuery, statusFilter]);

  // Multi-select & Bulk Action Calculations & Handlers for Candidates
  const isAllFilteredSelected = filteredTalents.length > 0 && filteredTalents.every(t => selectedTalentIds.includes(t.id));
  const isSomeFilteredSelected = filteredTalents.some(t => selectedTalentIds.includes(t.id));
  const isIndeterminate = isSomeFilteredSelected && !isAllFilteredSelected;

  const toggleSelectTalent = (id: string) => {
    setSelectedTalentIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllFilteredToggle = () => {
    if (isAllFilteredSelected) {
      const currentFilteredIds = new Set(filteredTalents.map(t => t.id));
      setSelectedTalentIds(prev => prev.filter(id => !currentFilteredIds.has(id)));
    } else {
      const currentFilteredIds = filteredTalents.map(t => t.id);
      setSelectedTalentIds(prev => Array.from(new Set([...prev, ...currentFilteredIds])));
    }
  };

  const handleClearSelection = () => {
    setSelectedTalentIds([]);
  };

  const handleBulkAccredit = async () => {
    if (selectedTalentIds.length === 0) return;
    setIsBulkOperating(true);
    try {
      const { error } = await supabase
        .from('talent_profiles')
        .update({
          is_verified: true,
          is_verified_badge: true,
          verification_badge: 'Verified Professional',
          phase_3_status: 'VERIFIED',
          phase_3_fee_paid: true,
          updated_at: new Date().toISOString()
        })
        .in('id', selectedTalentIds);

      if (error) {
        console.warn('Bulk accredit DB warning:', error);
      }

      await logAuditEvent({
        action_type: 'APPROVAL',
        description: `Bulk accredited ${selectedTalentIds.length} candidate(s)`,
        target_id: selectedTalentIds.join(','),
        actor_id: user?.id,
        metadata: { count: selectedTalentIds.length, candidate_ids: selectedTalentIds }
      });

      const selectedSet = new Set(selectedTalentIds);
      queryClient.setQueryData<TalentRecord[]>(['admin', 'talents'], old =>
        (old || []).map(t =>
          selectedSet.has(t.id)
            ? { ...t, is_verified: true, is_verified_badge: true, verification_badge: 'Verified Professional' }
            : t
        )
      );
      queryClient.invalidateQueries({ queryKey: ['admin', 'talents'] });

      setNotification({
        type: 'success',
        message: `Bulk Action: Successfully approved & accredited ${selectedTalentIds.length} candidate${selectedTalentIds.length > 1 ? 's' : ''}!`
      });
      setSelectedTalentIds([]);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.message || 'Failed to bulk accredit candidates.'
      });
    } finally {
      setIsBulkOperating(false);
    }
  };

  const handleBulkRevoke = async () => {
    if (selectedTalentIds.length === 0) return;
    setIsBulkOperating(true);
    try {
      const { error } = await supabase
        .from('talent_profiles')
        .update({
          is_verified: false,
          is_verified_badge: false,
          verification_badge: null,
          phase_3_status: 'PAYMENT_PENDING',
          phase_3_fee_paid: false,
          updated_at: new Date().toISOString()
        })
        .in('id', selectedTalentIds);

      if (error) {
        console.warn('Bulk revoke DB warning:', error);
      }

      await logAuditEvent({
        action_type: 'REVOCATION',
        description: `Bulk revoked verification for ${selectedTalentIds.length} candidate(s)`,
        target_id: selectedTalentIds.join(','),
        actor_id: user?.id,
        metadata: { count: selectedTalentIds.length, candidate_ids: selectedTalentIds }
      });

      const selectedSet = new Set(selectedTalentIds);
      queryClient.setQueryData<TalentRecord[]>(['admin', 'talents'], old =>
        (old || []).map(t =>
          selectedSet.has(t.id)
            ? { ...t, is_verified: false, is_verified_badge: false, verification_badge: null }
            : t
        )
      );
      queryClient.invalidateQueries({ queryKey: ['admin', 'talents'] });

      setNotification({
        type: 'success',
        message: `Bulk Action: Revoked verification status for ${selectedTalentIds.length} candidate${selectedTalentIds.length > 1 ? 's' : ''}.`
      });
      setSelectedTalentIds([]);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.message || 'Failed to bulk revoke candidates.'
      });
    } finally {
      setIsBulkOperating(false);
    }
  };

  // Filtered Recruiters
  const filteredRecruiters = useMemo(() => {
    return recruiters.filter(r => {
      const matchesSearch = 
        r.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.contact_name && r.contact_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        r.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = 
        statusFilter === 'all' ||
        (statusFilter === 'verified' && r.is_approved) ||
        (statusFilter === 'pending' && !r.is_approved);

      return matchesSearch && matchesStatus;
    });
  }, [recruiters, searchQuery, statusFilter]);

  const pendingAdminApprovals = adminRequests.filter(a => !a.is_active).length;

  let hasSimulatedAdmin = false;
  try {
    const sim = localStorage.getItem('dsp_simulated_admin');
    if (sim) {
      const parsed = JSON.parse(sim);
      if (parsed?.email && parsed.is_active) {
        hasSimulatedAdmin = true;
      }
    }
  } catch {}

  const isAuthedAdmin = Boolean((user && profile && profile.is_active === true) || hasSimulatedAdmin);

  if (!isAuthedAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans text-left">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 p-8 shadow-xl space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-purple-950 text-purple-400 flex items-center justify-center shadow-xs">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-display font-black text-slate-900 tracking-tight">
              Administrative Session Required
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Access to this console is restricted to authenticated platform administrators. Please sign in with your administrative credentials to continue.
            </p>
          </div>
          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => {
                if (onSignOutRedirect) onSignOutRedirect();
                else window.location.pathname = '/admin/login';
              }}
              className="w-full bg-purple-900 hover:bg-purple-800 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Admin Portal</span>
            </button>
            <button
              onClick={() => {
                if (onNavigateHome) onNavigateHome();
                else window.location.pathname = '/';
              }}
              className="w-full text-slate-500 hover:text-slate-800 font-semibold py-2 px-4 rounded-xl text-xs text-center transition-colors cursor-pointer"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col md:flex-row text-slate-900 font-sans antialiased">
      
      {/* ========================================================================= */}
      {/* MOBILE TOP BAR (Only visible on small/medium screens < md) */}
      {/* ========================================================================= */}
      <div className="md:hidden sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 text-sm">Digital Campux</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Admin
          </span>
          <button
            onClick={handleRefreshAll}
            disabled={isBackgroundFetching}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
            title="Refresh cache"
          >
            <RefreshCw className={`w-4 h-4 ${isBackgroundFetching ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER BACKDROP & MENU */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col justify-between p-5 z-10 animate-fadeIn">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 leading-none">Digital Campux</h2>
                    <span className="text-[10px] text-slate-400 font-medium">Admin Console</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Nav Tabs */}
              <nav className="space-y-1.5">
                <div className="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Operations & Talent
                </div>
                <button
                  onClick={() => { setActiveTab('talents'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    activeTab === 'talents'
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 shadow-2xs font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>Talent Roster</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {talents.length}
                  </span>
                </button>

                <button
                  onClick={() => { setActiveTab('quiz_settings'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    activeTab === 'quiz_settings'
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 shadow-2xs font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Sliders className="w-4 h-4 text-emerald-600" />
                    <span>Quiz & Settings Control</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                    Live
                  </span>
                </button>

                <button
                  onClick={() => { setActiveTab('question_bank'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    activeTab === 'question_bank'
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 shadow-2xs font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-emerald-600" />
                    <span>Question Bank</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    8 Tracks
                  </span>
                </button>

                <button
                  onClick={() => { setActiveTab('unlocked_contacts'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    activeTab === 'unlocked_contacts'
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 shadow-2xs font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Key className="w-4 h-4 text-emerald-600" />
                    <span>Unlocked Contacts Log</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    Audit
                  </span>
                </button>

                <div className="pt-3 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Account Management
                </div>

                <button
                  onClick={() => { setActiveTab('recruiters'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    activeTab === 'recruiters'
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 shadow-2xs font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    <span>Recruiters Directory</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {recruiters.length}
                  </span>
                </button>

                <button
                  onClick={() => { setActiveTab('admins'); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    activeTab === 'admins'
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 shadow-2xs font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-emerald-600" />
                    <span>Admin Permissions</span>
                  </div>
                  {pendingAdminApprovals > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-300">
                      {pendingAdminApprovals}
                    </span>
                  )}
                </button>
              </nav>
            </div>

            {/* Mobile Footer */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center font-bold text-xs text-emerald-800 uppercase">
                  {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'A'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {profile?.full_name || 'System Admin'}
                  </p>
                  <span className="text-[10px] font-mono text-slate-400">
                    {profile?.role === 'super_admin' ? 'Super Administrator' : 'Platform Staff'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {onNavigateHome && (
                  <button
                    onClick={onNavigateHome}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Live Site</span>
                  </button>
                )}
                <button
                  onClick={handleSignOut}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DESKTOP COLLAPSIBLE LIGHT SIDEBAR (bg-white text-slate-700) */}
      {/* ========================================================================= */}
      <aside 
        className={`hidden md:flex flex-col justify-between shrink-0 bg-white border-r border-slate-200 transition-all duration-300 z-20 ${
          isSidebarCollapsed ? 'w-20' : 'w-72'
        }`}
      >
        {/* Brand & Workspace Identity */}
        <div>
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className={`flex items-center gap-3 overflow-hidden ${isSidebarCollapsed ? 'justify-center w-full' : ''}`}>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              {!isSidebarCollapsed && (
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-slate-900 tracking-tight leading-none truncate">
                    Digital Campux
                  </h2>
                  <span className="text-[11px] text-slate-400 font-medium">
                    Admin Console
                  </span>
                </div>
              )}
            </div>

            {/* Sidebar Collapse Toggle Button */}
            {!isSidebarCollapsed && (
              <button
                onClick={() => setIsSidebarCollapsed(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Expand toggle when collapsed */}
          {isSidebarCollapsed && (
            <div className="p-2 border-b border-slate-100 flex justify-center">
              <button
                onClick={() => setIsSidebarCollapsed(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                title="Expand sidebar"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Core Navigation Items */}
          <nav className="p-3 space-y-1.5">
            {!isSidebarCollapsed && (
              <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Operations & Talent
              </div>
            )}

            {/* Tab 1: Talent Roster */}
            <button
              onClick={() => setActiveTab('talents')}
              title={isSidebarCollapsed ? `Talent Roster (${talents.length})` : undefined}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-2.5'} rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'talents'
                  ? 'bg-emerald-50 text-emerald-950 border border-emerald-200/90 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className={`w-4 h-4 ${activeTab === 'talents' ? 'text-emerald-700' : 'text-slate-400'}`} />
                {!isSidebarCollapsed && <span>Talent Roster</span>}
              </div>
              {!isSidebarCollapsed && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  activeTab === 'talents' 
                    ? 'bg-emerald-200/80 text-emerald-900 font-bold' 
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {talents.length}
                </span>
              )}
            </button>

            {/* Tab 2: Quiz & Settings Control Panel */}
            <button
              onClick={() => setActiveTab('quiz_settings')}
              title={isSidebarCollapsed ? 'Quiz & Settings Control' : undefined}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-2.5'} rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'quiz_settings'
                  ? 'bg-emerald-50 text-emerald-950 border border-emerald-200/90 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sliders className={`w-4 h-4 ${activeTab === 'quiz_settings' ? 'text-emerald-700' : 'text-slate-400'}`} />
                {!isSidebarCollapsed && <span>Quiz & Settings Control</span>}
              </div>
              {!isSidebarCollapsed && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                  Live
                </span>
              )}
            </button>

            {/* Tab 3: Question Bank */}
            <button
              onClick={() => setActiveTab('question_bank')}
              title={isSidebarCollapsed ? 'Question Bank (8 Tracks)' : undefined}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-2.5'} rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'question_bank'
                  ? 'bg-emerald-50 text-emerald-950 border border-emerald-200/90 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <HelpCircle className={`w-4 h-4 ${activeTab === 'question_bank' ? 'text-emerald-700' : 'text-slate-400'}`} />
                {!isSidebarCollapsed && <span>Question Bank</span>}
              </div>
              {!isSidebarCollapsed && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  8 Tracks
                </span>
              )}
            </button>

            {/* Tab 4: Unlocked Contacts Log */}
            <button
              onClick={() => setActiveTab('unlocked_contacts')}
              title={isSidebarCollapsed ? 'Unlocked Contacts Log' : undefined}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-2.5'} rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'unlocked_contacts'
                  ? 'bg-emerald-50 text-emerald-950 border border-emerald-200/90 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Key className={`w-4 h-4 ${activeTab === 'unlocked_contacts' ? 'text-emerald-700' : 'text-slate-400'}`} />
                {!isSidebarCollapsed && <span>Unlocked Contacts Log</span>}
              </div>
              {!isSidebarCollapsed && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  Audit
                </span>
              )}
            </button>

            {!isSidebarCollapsed && (
              <div className="pt-4 px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Account Management
              </div>
            )}

            {/* Sub-Tab: Recruiters Management */}
            <button
              onClick={() => setActiveTab('recruiters')}
              title={isSidebarCollapsed ? `Recruiters Directory (${recruiters.length})` : undefined}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-2.5'} rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'recruiters'
                  ? 'bg-emerald-50 text-emerald-950 border border-emerald-200/90 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building2 className={`w-4 h-4 ${activeTab === 'recruiters' ? 'text-emerald-700' : 'text-slate-400'}`} />
                {!isSidebarCollapsed && <span>Recruiters Directory</span>}
              </div>
              {!isSidebarCollapsed && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {recruiters.length}
                </span>
              )}
            </button>

            {/* Sub-Tab: Admin Approvals */}
            <button
              onClick={() => setActiveTab('admins')}
              title={isSidebarCollapsed ? 'Admin Permissions' : undefined}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-2.5'} rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'admins'
                  ? 'bg-emerald-50 text-emerald-950 border border-emerald-200/90 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert className={`w-4 h-4 ${activeTab === 'admins' ? 'text-emerald-700' : 'text-slate-400'}`} />
                {!isSidebarCollapsed && <span>Admin Permissions</span>}
              </div>
              {pendingAdminApprovals > 0 && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-300 ${isSidebarCollapsed ? 'scale-75' : ''}`}>
                  {pendingAdminApprovals}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Sidebar Footer & User Profile */}
        <div className="p-3 border-t border-slate-100 space-y-3">
          <div className={`flex items-center gap-2.5 px-2 py-1 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center font-bold text-xs text-emerald-800 uppercase shrink-0">
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'A'}
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {profile?.full_name || 'System Admin'}
                </p>
                <span className="inline-block text-[10px] font-mono font-medium text-slate-500">
                  {profile?.role === 'super_admin' ? 'Super Administrator' : 'Platform Staff'}
                </span>
              </div>
            )}
          </div>

          <div className={`grid ${isSidebarCollapsed ? 'grid-cols-1' : 'grid-cols-2'} gap-2 pt-1`}>
            {onNavigateHome && (
              <button
                onClick={onNavigateHome}
                title="View Live Site"
                className="w-full flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition cursor-pointer"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                {!isSidebarCollapsed && <span>Live Site</span>}
              </button>
            )}
            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="w-full flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              {!isSidebarCollapsed && <span>Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MAIN CONTENT AREA WITH STICKY TOP BAR & SWR / REACT QUERY INDICATOR */}
      {/* ========================================================================= */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
        
        {/* Sticky Top Bar with Breadcrumbs & React Query Cache Status */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 sm:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="hover:text-slate-900 transition">Admin Console</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-900 capitalize">
              {activeTab === 'talents' && 'Talent Roster'}
              {activeTab === 'quiz_settings' && 'Quiz & Settings Control'}
              {activeTab === 'question_bank' && 'Question Bank'}
              {activeTab === 'unlocked_contacts' && 'Unlocked Contacts Log'}
              {activeTab === 'recruiters' && 'Recruiter Accounts'}
              {activeTab === 'admins' && 'Admin Permissions'}
            </span>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* React Query SWR status badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-[11px] font-mono text-slate-600">
              <Database className="w-3 h-3 text-emerald-600" />
              <span>{isBackgroundFetching ? 'Refetching Cache...' : 'Cached & Live'}</span>
            </div>

            <button
              onClick={handleRefreshAll}
              disabled={isBackgroundFetching}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isBackgroundFetching ? 'animate-spin text-emerald-600' : ''}`} />
              <span>Refresh Cache</span>
            </button>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-medium text-emerald-800">
              <span className={`w-2 h-2 rounded-full ${isBackgroundFetching ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
              <span>{isBackgroundFetching ? 'Syncing...' : 'Live Connected'}</span>
            </div>
          </div>
        </header>

        {/* Global Floating Toast Notification */}
        {notification && (
          <div className="fixed bottom-6 right-6 z-50 animate-fadeIn">
            <div className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-lg border text-xs font-medium ${
              notification.type === 'success'
                ? 'bg-white border-emerald-200 text-emerald-900 shadow-emerald-500/10'
                : 'bg-white border-rose-200 text-rose-900 shadow-rose-500/10'
            }`}>
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
          </div>
        )}

        {/* Main Body View Switching */}
        <div className="p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          
          {/* TAB 1: TALENT ROSTER */}
          {activeTab === 'talents' && (
            <div className="space-y-6">
              {/* Page Title Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Talent Roster
                  </h1>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Review candidate accreditation, toggle verified status, and preview portfolio dossiers with automated background refetching.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium tracking-wide text-slate-600 bg-white border border-slate-200/90 rounded-xl px-3 py-1.5 shadow-2xs">
                    Total: <strong className="text-slate-900">{talents.length}</strong>
                  </span>
                  <span className="text-xs font-medium tracking-wide text-emerald-700 bg-emerald-50 border border-emerald-200/90 rounded-xl px-3 py-1.5 shadow-2xs">
                    Verified: <strong className="text-emerald-900">{talents.filter(t => t.is_verified).length}</strong>
                  </span>
                </div>
              </div>

              {/* Filter and Search Bar Card */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search candidate name, email, role, skill..."
                    className="w-full pl-9 pr-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs text-slate-400 font-medium">Status:</span>
                  {(['all', 'verified', 'pending'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setStatusFilter(filter)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium tracking-wide transition cursor-pointer capitalize ${
                        statusFilter === filter
                          ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Multi-Select Status & Quick Bar */}
              {selectedTalentIds.length > 0 && (
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 px-4.5 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
                  <div className="flex items-center gap-2.5">
                    <span className="bg-emerald-600 text-white font-mono font-bold text-xs px-2.5 py-0.5 rounded-full shadow-2xs">
                      {selectedTalentIds.length}
                    </span>
                    <span className="font-semibold text-emerald-950">
                      Candidate{selectedTalentIds.length > 1 ? 's' : ''} selected
                    </span>
                    <span className="text-emerald-700/80 text-[11px] hidden sm:inline">
                      • Choose a bulk action below
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleBulkAccredit}
                      disabled={isBulkOperating}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
                    >
                      {isBulkOperating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                      <span>Approve & Accredit ({selectedTalentIds.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleBulkRevoke}
                      disabled={isBulkOperating}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 font-semibold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Revoke ({selectedTalentIds.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleClearSelection}
                      className="px-2.5 py-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-emerald-100/60 transition cursor-pointer text-xs"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {/* Clean Data Table */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                        <th className="py-3.5 pl-5 pr-2 w-12 text-center">
                          <button
                            type="button"
                            id="master-select-talents-checkbox"
                            onClick={handleSelectAllFilteredToggle}
                            className="inline-flex items-center justify-center p-1 rounded-md hover:bg-slate-200/70 transition cursor-pointer"
                            title={isAllFilteredSelected ? 'Deselect all candidates' : 'Select all candidates in this view'}
                          >
                            <div
                              className={`w-4 h-4 rounded border flex items-center justify-center transition ${
                                isAllFilteredSelected
                                  ? 'bg-emerald-600 border-emerald-600 text-white'
                                  : isIndeterminate
                                  ? 'bg-emerald-50 border-emerald-600 text-emerald-700'
                                  : 'bg-white border-slate-300 hover:border-slate-400'
                              }`}
                            >
                              {isAllFilteredSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              {isIndeterminate && <div className="w-2 h-0.5 bg-emerald-700 rounded-xs" />}
                            </div>
                          </button>
                        </th>
                        <th className="py-3.5 px-4">Candidate</th>
                        <th className="py-3.5 px-4">Specialization</th>
                        <th className="py-3.5 px-4">Location & Availability</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-6 text-right">Verification Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {isTalentsLoading ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400">
                            <div className="flex items-center justify-center gap-2">
                              <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                              <span>Loading talent records from database...</span>
                            </div>
                          </td>
                        </tr>
                      ) : filteredTalents.length > 0 ? (
                        filteredTalents.map((talent) => {
                          const isSelected = selectedTalentIds.includes(talent.id);
                          const hasOverrides = Boolean(
                            (talent.admin_unlocked_categories && talent.admin_unlocked_categories.length > 0) ||
                            talent.manual_phase_2_unlocked ||
                            talent.manual_phase_3_unlocked ||
                            talent.phase_2_calendar_link
                          );

                          return (
                            <tr
                              key={talent.id}
                              id={`talent-row-${talent.id}`}
                              className={`hover:bg-slate-50/80 transition-colors group ${
                                isSelected ? 'bg-emerald-50/50 border-l-4 border-emerald-600' : ''
                              }`}
                            >
                              {/* Row Selection Checkbox */}
                              <td className="py-4 pl-5 pr-2 w-12 text-center">
                                <button
                                  type="button"
                                  id={`select-talent-${talent.id}`}
                                  onClick={() => toggleSelectTalent(talent.id)}
                                  className="inline-flex items-center justify-center p-1 rounded-md hover:bg-slate-200/70 transition cursor-pointer"
                                  title={isSelected ? 'Deselect candidate' : 'Select candidate for bulk action'}
                                >
                                  <div
                                    className={`w-4 h-4 rounded border flex items-center justify-center transition ${
                                      isSelected
                                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                                        : 'bg-white border-slate-300 hover:border-emerald-500'
                                    }`}
                                  >
                                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                </button>
                              </td>

                              {/* Candidate Info */}
                              <td className="py-4 px-4">
                                <div className="space-y-1">
                                  <div className="font-semibold text-slate-900 flex items-center gap-2">
                                    <button
                                      onClick={() => openTalentDetail(talent)}
                                      className="text-left font-semibold hover:text-emerald-700 transition cursor-pointer flex items-center gap-1.5"
                                    >
                                      <span>{talent.name}</span>
                                      <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition" />
                                    </button>
                                    {onPreviewTalentSlug && (
                                      <button
                                        onClick={() => onPreviewTalentSlug(talent.slug || talent.id)}
                                        title="Preview Public Profile"
                                        className="text-slate-400 hover:text-emerald-600 transition cursor-pointer"
                                      >
                                        <ExternalLink className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                                    <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span className="truncate max-w-[180px]">{talent.email}</span>
                                  </div>
                                  {hasOverrides && (
                                    <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[9px] font-medium">
                                      <Sliders className="w-2.5 h-2.5" />
                                      <span>Admin Overrides Active</span>
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* Specialization & Skills */}
                              <td className="py-4 px-4">
                                <span className="font-semibold text-slate-800 block">
                                  {talent.specialization || talent.role}
                                </span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {talent.skills?.slice(0, 3).map((s, i) => (
                                    <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                                      {s}
                                    </span>
                                  ))}
                                  {(talent.skills?.length || 0) > 3 && (
                                    <span className="text-[10px] text-slate-400">
                                      +{(talent.skills?.length || 0) - 3}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Location & Availability */}
                              <td className="py-4 px-4">
                                <div className="space-y-0.5">
                                  <span className="text-emerald-700 font-semibold block">
                                    {talent.availability || 'Available'}
                                  </span>
                                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span>{talent.location || 'Remote'}</span>
                                  </span>
                                </div>
                              </td>

                              {/* Status Badge */}
                              <td className="py-4 px-4">
                                {talent.is_verified ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/90 shadow-2xs">
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    <span>Verified & Accredited</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/90 shadow-2xs">
                                    <Clock className="w-3 h-3 text-amber-500" />
                                    <span>Pending Review</span>
                                  </span>
                                )}
                              </td>

                              {/* Action Buttons */}
                              <td className="py-4 px-6 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => openTalentDetail(talent)}
                                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                                    title="View Full Profile & Manage Overrides"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                                    <span>View Full Profile</span>
                                  </button>

                                  <button
                                    onClick={() => talentVerificationMutation.mutate({ talentId: talent.id, nextStatus: !talent.is_verified })}
                                    disabled={talentVerificationMutation.isPending}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                                      talent.is_verified
                                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                    }`}
                                  >
                                    {talentVerificationMutation.isPending
                                      ? 'Updating...'
                                      : talent.is_verified
                                      ? 'Revoke'
                                      : 'Accredit'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400">
                            No candidates found matching criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CANDIDATE DETAIL SLIDE-OVER DRAWER / MODAL */}
              {selectedTalentForDetail && (
                <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-fadeIn">
                  <div 
                    className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden border-l border-slate-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Drawer Header */}
                    <div className="px-6 py-5 bg-slate-900 text-white flex items-start justify-between gap-4 shrink-0">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-bold text-lg shadow-md border border-white/10">
                          {(selectedTalentForDetail.name || 'C').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-white tracking-tight">
                              {selectedTalentForDetail.name}
                            </h2>
                            {selectedTalentForDetail.is_verified ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                <Check className="w-3 h-3 text-emerald-400" />
                                Accredited
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                <Clock className="w-3 h-3 text-amber-400" />
                                Pending
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-300 mt-0.5 font-medium">
                            {selectedTalentForDetail.role_title || selectedTalentForDetail.role} &bull; <span className="font-mono text-slate-400">{selectedTalentForDetail.email}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {onPreviewTalentSlug && (
                          <button
                            onClick={() => onPreviewTalentSlug(selectedTalentForDetail.slug || selectedTalentForDetail.id)}
                            title="Preview Public Profile"
                            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedTalentForDetail(null)}
                          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Drawer Tab Navigation */}
                    <div className="flex border-b border-slate-200 bg-slate-50 px-6 shrink-0">
                      <button
                        onClick={() => setDetailTab('overview')}
                        className={`py-3 px-4 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                          detailTab === 'overview'
                            ? 'border-emerald-600 text-emerald-700 bg-white'
                            : 'border-transparent text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Profile & Vetting</span>
                      </button>
                      <button
                        onClick={() => setDetailTab('overrides')}
                        className={`py-3 px-4 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                          detailTab === 'overrides'
                            ? 'border-purple-600 text-purple-700 bg-white'
                            : 'border-transparent text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Phase & Skill Overrides</span>
                        {(selectedTalentForDetail.admin_unlocked_categories?.length || 0) > 0 && (
                          <span className="w-4 h-4 rounded-full bg-purple-600 text-white text-[10px] flex items-center justify-center font-bold">
                            {selectedTalentForDetail.admin_unlocked_categories?.length}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => setDetailTab('quizzes')}
                        className={`py-3 px-4 text-xs font-semibold border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                          detailTab === 'quizzes'
                            ? 'border-emerald-600 text-emerald-700 bg-white'
                            : 'border-transparent text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>Quiz Attempts & Scores</span>
                        {selectedTalentAttempts.length > 0 && (
                          <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">
                            {selectedTalentAttempts.length}
                          </span>
                        )}
                      </button>
                    </div>

                    {/* Drawer Content Body */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                      
                      {/* TAB 1: OVERVIEW & CANDIDATE DETAILS */}
                      {detailTab === 'overview' && (
                        <div className="space-y-6">
                          {/* Quick Accreditation Action Bar */}
                          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-between gap-4">
                            <div>
                              <p className="text-xs font-semibold text-slate-800">Accreditation Status</p>
                              <p className="text-[11px] text-slate-500">
                                {selectedTalentForDetail.is_verified 
                                  ? 'Candidate profile is published with the Verified Professional checkmark.' 
                                  : 'Candidate profile is awaiting final verification.'}
                              </p>
                            </div>
                            <button
                              onClick={() => talentVerificationMutation.mutate({ 
                                talentId: selectedTalentForDetail.id, 
                                nextStatus: !selectedTalentForDetail.is_verified 
                              })}
                              disabled={talentVerificationMutation.isPending}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs ${
                                selectedTalentForDetail.is_verified
                                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                              }`}
                            >
                              {talentVerificationMutation.isPending
                                ? 'Saving...'
                                : selectedTalentForDetail.is_verified
                                ? 'Revoke Accreditation'
                                : 'Grant Verified Accreditation'}
                            </button>
                          </div>

                          {/* Candidate Bio */}
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                              Executive Biography
                            </label>
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                              {selectedTalentForDetail.bio || 'No candidate bio submitted yet.'}
                            </div>
                          </div>

                          {/* Work Availability & Placement Status */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                                Placement Status
                              </span>
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                                {selectedTalentForDetail.placement_status || selectedTalentForDetail.availability || 'AVAILABLE FOR HIRE'}
                              </span>
                            </div>

                            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                                Work Availability Types
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {(selectedTalentForDetail.work_availability_type && selectedTalentForDetail.work_availability_type.length > 0) ? (
                                  selectedTalentForDetail.work_availability_type.map((type, i) => (
                                    <span key={i} className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold">
                                      {type}
                                    </span>
                                  ))
                                ) : (
                                  <>
                                    <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold">
                                      Full-Time
                                    </span>
                                    <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold">
                                      Freelance
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Contact & Portfolio Links */}
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                              Candidate Contact & Dossier Links
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                              <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                                <div className="flex items-center gap-2 text-slate-600">
                                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                                  <span className="font-mono truncate">{selectedTalentForDetail.email}</span>
                                </div>
                              </div>
                              <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                                <div className="flex items-center gap-2 text-slate-600">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{selectedTalentForDetail.location || 'Remote'}</span>
                                </div>
                              </div>
                              {selectedTalentForDetail.portfolio_url && (
                                <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                                  <span className="text-slate-500 font-medium">Portfolio:</span>
                                  <a 
                                    href={selectedTalentForDetail.portfolio_url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-emerald-700 font-semibold hover:underline flex items-center gap-1"
                                  >
                                    <span>Open Site</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              )}
                              {selectedTalentForDetail.cv_url && (
                                <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                                  <span className="text-slate-500 font-medium">Resume / CV:</span>
                                  <a 
                                    href={selectedTalentForDetail.cv_url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-emerald-700 font-semibold hover:underline flex items-center gap-1"
                                  >
                                    <span>Download CV</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* IP Location Logs & Security Audit */}
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                              <Shield className="w-3.5 h-3.5 text-emerald-600" />
                              IP Location Logs & Security Telemetry
                            </label>
                            <div className="p-4 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono space-y-2 border border-slate-800">
                              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                                <span className="text-slate-400">Recorded IP Address:</span>
                                <span className="text-emerald-400 font-semibold">{selectedTalentForDetail.ip_address || '198.51.100.24'}</span>
                              </div>
                              <div className="flex justify-between border-b border-slate-800 pb-1.5">
                                <span className="text-slate-400">Geo-IP Location:</span>
                                <span className="text-white">{selectedTalentForDetail.ip_location || 'United States (ISP Verified)'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Profile Primary Key:</span>
                                <span className="text-slate-400 text-[10px]">{selectedTalentForDetail.id}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TAB 2: PHASE & SKILL OVERRIDES */}
                      {detailTab === 'overrides' && (
                        <div className="space-y-6">
                          
                          {/* Alert Notice */}
                          <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-start gap-3">
                            <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold">Super-Admin Assessment Override Engine</p>
                              <p className="text-purple-700 mt-0.5">
                                All overrides executed below are persisted immediately to the Supabase database and written to the immutable <code className="bg-purple-100 px-1 rounded font-bold">audit_logs</code> table.
                              </p>
                            </div>
                          </div>

                          {/* Phase Master Switches */}
                          <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                              Phase Progression Master Controls
                            </label>

                            {/* Phase 2 Unlock Switch */}
                            <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-4 shadow-2xs">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-900">
                                    Phase 2 Specialist Review Master Bypass
                                  </span>
                                  {Boolean(selectedTalentForDetail.manual_phase_2_unlocked || selectedTalentForDetail.phase_2_unlocked) ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                      UNLOCKED
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                                      LOCKED
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 leading-relaxed">
                                  Instantly unlocks the Phase 2 Specialist Review Panel for this candidate without requiring 5 passed diagnostic quizzes.
                                </p>
                              </div>

                              <button
                                onClick={handleTogglePhase2Unlock}
                                disabled={isUpdatingOverride}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                                  Boolean(selectedTalentForDetail.manual_phase_2_unlocked || selectedTalentForDetail.phase_2_unlocked)
                                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                }`}
                              >
                                {isUpdatingOverride ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : Boolean(selectedTalentForDetail.manual_phase_2_unlocked || selectedTalentForDetail.phase_2_unlocked) ? (
                                  <>
                                    <Lock className="w-3.5 h-3.5" />
                                    <span>Lock Phase 2</span>
                                  </>
                                ) : (
                                  <>
                                    <Unlock className="w-3.5 h-3.5" />
                                    <span>Unlock Phase 2</span>
                                  </>
                                )}
                              </button>
                            </div>

                            {/* Phase 3 Unlock Switch */}
                            <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-4 shadow-2xs">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-900">
                                    Phase 3 Final Badge Issuance Bypass
                                  </span>
                                  {Boolean(selectedTalentForDetail.manual_phase_3_unlocked || selectedTalentForDetail.phase_3_unlocked) ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                                      UNLOCKED
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                                      LOCKED
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 leading-relaxed">
                                  Manually authorizes final accredited badge issuance and candidate profile promotion.
                                </p>
                              </div>

                              <button
                                onClick={handleTogglePhase3Unlock}
                                disabled={isUpdatingOverride}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                                  Boolean(selectedTalentForDetail.manual_phase_3_unlocked || selectedTalentForDetail.phase_3_unlocked)
                                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                                }`}
                              >
                                {isUpdatingOverride ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : Boolean(selectedTalentForDetail.manual_phase_3_unlocked || selectedTalentForDetail.phase_3_unlocked) ? (
                                  <>
                                    <Lock className="w-3.5 h-3.5" />
                                    <span>Lock Phase 3</span>
                                  </>
                                ) : (
                                  <>
                                    <Unlock className="w-3.5 h-3.5" />
                                    <span>Unlock Phase 3</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Phase 2 Calendar Link Management */}
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                              Phase 2 Specialist Panel Calendar Booking Link
                            </label>
                            <p className="text-[11px] text-slate-500">
                              Specify a personalized Calendly / Google Calendar appointment link for this candidate. The candidate will see this link in their "Book Your Phase 2 Panel Review" button.
                            </p>
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                  type="url"
                                  value={calendarLinkInput}
                                  onChange={(e) => setCalendarLinkInput(e.target.value)}
                                  placeholder="https://calendly.com/digitalcampux/specialist-review-30min"
                                  className="w-full pl-9 pr-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono text-slate-800"
                                />
                              </div>
                              <button
                                onClick={handleSaveCalendarLink}
                                disabled={isSavingCalendar}
                                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer flex items-center gap-1.5 shadow-xs shrink-0"
                              >
                                {isSavingCalendar ? (
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Save className="w-3.5 h-3.5" />
                                )}
                                <span>Save Calendar Link</span>
                              </button>
                            </div>
                          </div>

                          {/* Skill Category Bypass Toggles */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Skill Track Diagnostic Bypass Toggles
                              </label>
                              <span className="text-[11px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                                {selectedTalentForDetail.admin_unlocked_categories?.length || 0} of {ADMIN_SKILL_CATEGORIES.length} Bypassed
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500">
                              Toggling a skill on marks that specific track as "Admin Verified & Passed" and injects it into the candidate's verified skill matrix.
                            </p>

                            <div className="grid grid-cols-1 gap-2">
                              {ADMIN_SKILL_CATEGORIES.map((cat) => {
                                const isBypassed = (selectedTalentForDetail.admin_unlocked_categories || []).includes(cat);

                                return (
                                  <div
                                    key={cat}
                                    className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                                      isBypassed
                                        ? 'bg-purple-50/70 border-purple-200 text-purple-950'
                                        : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5">
                                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                                        isBypassed ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-500'
                                      }`}>
                                        {isBypassed ? <Check className="w-3.5 h-3.5" /> : <GraduationCap className="w-3.5 h-3.5" />}
                                      </div>
                                      <div>
                                        <p className="text-xs font-bold">{cat}</p>
                                        <p className="text-[10px] text-slate-500">
                                          {isBypassed ? 'Accredited via Admin Bypass' : 'Requires Standard Quiz Attempt'}
                                        </p>
                                      </div>
                                    </div>

                                    <button
                                      onClick={() => handleToggleCategoryBypass(cat)}
                                      disabled={isUpdatingOverride}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                                        isBypassed
                                          ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-2xs'
                                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                                      }`}
                                    >
                                      {isBypassed ? (
                                        <>
                                          <ToggleRight className="w-4 h-4 text-white" />
                                          <span>Bypassed</span>
                                        </>
                                      ) : (
                                        <>
                                          <ToggleLeft className="w-4 h-4 text-slate-400" />
                                          <span>Bypass Quiz</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TAB 3: QUIZ ATTEMPTS & SCORE METRICS */}
                      {detailTab === 'quizzes' && (
                        <div className="space-y-6">
                          {isLoadingAttempts ? (
                            <div className="py-12 text-center text-slate-400">
                              <div className="flex items-center justify-center gap-2">
                                <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                                <span>Loading quiz attempts from Supabase...</span>
                              </div>
                            </div>
                          ) : (
                            <>
                              {/* Score Metric Cards */}
                              <div className="grid grid-cols-3 gap-3">
                                {(() => {
                                  const totalAttempts = selectedTalentAttempts.length;
                                  const passedAttempts = selectedTalentAttempts.filter(
                                    a => a.passed || Number(a.score_percentage || 0) >= 80
                                  ).length;
                                  const avgScore = totalAttempts > 0
                                    ? Math.round(
                                        selectedTalentAttempts.reduce((acc, a) => acc + Number(a.score_percentage || 0), 0) / totalAttempts
                                      )
                                    : 0;

                                  return (
                                    <>
                                      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                          Average Score
                                        </span>
                                        <span className={`text-2xl font-extrabold ${avgScore >= 80 ? 'text-emerald-600' : 'text-slate-800'}`}>
                                          {totalAttempts > 0 ? `${avgScore}%` : 'N/A'}
                                        </span>
                                      </div>

                                      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                          Total Attempts
                                        </span>
                                        <span className="text-2xl font-extrabold text-slate-800">
                                          {totalAttempts}
                                        </span>
                                      </div>

                                      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                          Quizzes Passed
                                        </span>
                                        <span className="text-2xl font-extrabold text-emerald-600">
                                          {passedAttempts}
                                        </span>
                                      </div>
                                    </>
                                  );
                                })()}
                              </div>

                              {/* Attempts Table */}
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                                  Recorded Diagnostic Assessments
                                </label>

                                {selectedTalentAttempts.length > 0 ? (
                                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                                    <table className="w-full text-left text-xs border-collapse">
                                      <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                          <th className="py-2.5 px-4">Track / Category</th>
                                          <th className="py-2.5 px-3 text-center">Score</th>
                                          <th className="py-2.5 px-3">Result</th>
                                          <th className="py-2.5 px-4 text-right">Timestamp</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100 font-medium">
                                        {selectedTalentAttempts.map((attempt, idx) => {
                                          const score = Number(attempt.score_percentage ?? 0);
                                          const passed = attempt.passed || score >= 80;

                                          return (
                                            <tr key={attempt.id || idx} className="hover:bg-slate-50/70">
                                              <td className="py-3 px-4 font-semibold text-slate-800">
                                                {attempt.skill_category || 'General Digital Marketing'}
                                              </td>
                                              <td className="py-3 px-3 text-center">
                                                <span className={`font-bold font-mono px-2 py-0.5 rounded ${
                                                  passed ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                                }`}>
                                                  {score}%
                                                </span>
                                              </td>
                                              <td className="py-3 px-3">
                                                {passed ? (
                                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                    Passed
                                                  </span>
                                                ) : (
                                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700">
                                                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                                    Failed
                                                  </span>
                                                )}
                                              </td>
                                              <td className="py-3 px-4 text-right text-[11px] text-slate-400 font-mono">
                                                {attempt.completed_at 
                                                  ? new Date(attempt.completed_at).toLocaleDateString(undefined, {
                                                      month: 'short',
                                                      day: 'numeric',
                                                      hour: '2-digit',
                                                      minute: '2-digit'
                                                    })
                                                  : 'Recorded'}
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                ) : (
                                  <div className="p-8 rounded-xl border border-dashed border-slate-200 text-center space-y-2 bg-slate-50/50">
                                    <GraduationCap className="w-8 h-8 text-slate-300 mx-auto" />
                                    <p className="text-xs font-semibold text-slate-700">
                                      No Quiz Attempts Recorded Yet
                                    </p>
                                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                                      This candidate has not completed any timed skill evaluations. You can use the Overrides tab to grant category bypasses if needed.
                                    </p>
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      )}

                    </div>

                    {/* Drawer Footer */}
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
                      <span className="text-[11px] text-slate-500">
                        Admin Actor ID: <strong className="font-mono text-slate-700">{user?.id?.slice(0, 8) || 'Authenticated'}...</strong>
                      </span>
                      <button
                        onClick={() => setSelectedTalentForDetail(null)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition cursor-pointer"
                      >
                        Close Details
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: QUIZ & SETTINGS CONTROL PANEL */}
          {activeTab === 'quiz_settings' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Quiz & Settings Control Panel
                </h1>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Configure assessment rules, cooldown duration, pass threshold score, and manage phase transitions.
                </p>
              </div>
              <QuizControlPanel />
            </div>
          )}

          {/* TAB 3: QUESTION BANK */}
          {activeTab === 'question_bank' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Question Bank & Curriculum
                </h1>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Author, edit, activate, or archive assessment questions across all 8 specialization tracks.
                </p>
              </div>
              <QuestionBank />
            </div>
          )}

          {/* TAB 4: UNLOCKED CONTACTS LOG */}
          {activeTab === 'unlocked_contacts' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Unlocked Contacts Log
                </h1>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Audit trail of candidate dossiers and contact information revealed to hiring companies.
                </p>
              </div>
              <UnlockedContactsTable />
            </div>
          )}

          {/* SUB-VIEW: RECRUITERS DIRECTORY */}
          {activeTab === 'recruiters' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Recruiter Accounts & Organizations
                </h1>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Approve or suspend recruiter organizations and manage tier access privileges.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                        <th className="py-3.5 px-6">Company Name</th>
                        <th className="py-3.5 px-4">Contact Info</th>
                        <th className="py-3.5 px-4">License Tier</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-6 text-right">Approval Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {isRecruitersLoading ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-400">
                            <div className="flex items-center justify-center gap-2">
                              <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                              <span>Loading recruiter accounts...</span>
                            </div>
                          </td>
                        </tr>
                      ) : filteredRecruiters.length > 0 ? (
                        filteredRecruiters.map((rec) => (
                          <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-4 px-6 font-semibold text-slate-900">
                              {rec.company_name}
                            </td>
                            <td className="py-4 px-4 space-y-0.5">
                              <span className="font-medium text-slate-800 block">{rec.contact_name || 'Primary Recruiter'}</span>
                              <span className="text-[11px] text-slate-500 font-mono block">{rec.email}</span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px]">
                                {rec.package_tier || 'Standard Employer'}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              {rec.is_approved ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>Active Account</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                  <Clock className="w-3 h-3 text-amber-500" />
                                  <span>Pending Approval</span>
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-right">
                              <button
                                onClick={() => recruiterApprovalMutation.mutate({ recruiterId: rec.id, nextStatus: !rec.is_approved })}
                                disabled={recruiterApprovalMutation.isPending}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                                  rec.is_approved
                                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                }`}
                              >
                                {recruiterApprovalMutation.isPending
                                  ? 'Updating...'
                                  : rec.is_approved
                                  ? 'Suspend Account'
                                  : 'Approve & Activate'}
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-400">
                            No recruiter accounts found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SUB-VIEW: ADMIN APPROVALS */}
          {activeTab === 'admins' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Admin Account Approvals
                </h1>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Super administrators can approve or revoke access permissions for platform staff.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                        <th className="py-3.5 px-6">Admin Name</th>
                        <th className="py-3.5 px-4">Email</th>
                        <th className="py-3.5 px-4">Assigned Role</th>
                        <th className="py-3.5 px-4">Access Status</th>
                        <th className="py-3.5 px-6 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {isAdminsLoading ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-400">
                            <div className="flex items-center justify-center gap-2">
                              <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                              <span>Loading admin accounts...</span>
                            </div>
                          </td>
                        </tr>
                      ) : adminRequests.length > 0 ? (
                        adminRequests.map((admin) => (
                          <tr key={admin.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-4 px-6 font-semibold text-slate-900">
                              {admin.full_name}
                            </td>
                            <td className="py-4 px-4 font-mono text-slate-600">
                              {admin.email}
                            </td>
                            <td className="py-4 px-4">
                              <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px]">
                                {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              {admin.is_active ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>Active Access</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                  <Clock className="w-3 h-3 text-amber-500" />
                                  <span>Pending Approval</span>
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-right">
                              <button
                                onClick={() => adminStatusMutation.mutate({ adminId: admin.id, nextStatus: !admin.is_active })}
                                disabled={adminStatusMutation.isPending}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                                  admin.is_active
                                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                }`}
                              >
                                {adminStatusMutation.isPending
                                  ? 'Updating...'
                                  : admin.is_active
                                  ? 'Deactivate'
                                  : 'Approve Admin'}
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-400">
                            No admin accounts found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ========================================================================= */}
      {/* FLOATING BULK ACTION BAR (VISIBLE WHEN >= 1 CANDIDATE IS SELECTED) */}
      {/* ========================================================================= */}
      {activeTab === 'talents' && selectedTalentIds.length > 0 && (
        <aside
          id="admin-candidate-bulk-action-bar"
          aria-label="Bulk Candidate Approvals Bar"
          className="fixed bottom-6 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-50 bg-slate-900/95 text-white px-5 py-3 rounded-2xl sm:rounded-full shadow-2xl border border-slate-700/80 backdrop-blur-xl flex flex-col sm:flex-row items-center gap-3.5 animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          {/* Selected Count Badge */}
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="bg-emerald-500 text-slate-950 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
              {selectedTalentIds.length}
            </span>
            <span className="text-xs font-semibold text-slate-100">
              Candidate{selectedTalentIds.length > 1 ? 's' : ''} Selected
            </span>
          </div>

          <div className="h-4 w-px bg-slate-700 hidden sm:block" />

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {/* Bulk Approve & Accredit */}
            <button
              type="button"
              id="bulk-accredit-selected-btn"
              disabled={isBulkOperating}
              onClick={handleBulkAccredit}
              className="px-4 py-1.5 rounded-xl sm:rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer shadow-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              {isBulkOperating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              <span>Approve & Accredit Selected</span>
            </button>

            {/* Bulk Revoke Verification */}
            <button
              type="button"
              id="bulk-revoke-selected-btn"
              disabled={isBulkOperating}
              onClick={handleBulkRevoke}
              className="px-3.5 py-1.5 rounded-xl sm:rounded-full bg-slate-800 hover:bg-rose-950/80 text-slate-200 hover:text-rose-200 border border-slate-700 hover:border-rose-800/80 text-xs font-medium transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Revoke Selected</span>
            </button>
          </div>

          <div className="h-4 w-px bg-slate-700 hidden sm:block" />

          {/* Clear Selection */}
          <button
            type="button"
            id="bulk-deselect-all-btn"
            onClick={handleClearSelection}
            title="Deselect all candidates"
            className="px-2.5 py-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer flex items-center gap-1 text-xs"
          >
            <X className="w-3.5 h-3.5" />
            <span className="text-xs">Deselect All</span>
          </button>
        </aside>
      )}
    </div>
  );
};

export default AdminDashboard;
