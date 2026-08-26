import React, { useState, useEffect, useMemo } from 'react';
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
  Database
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { QuizControlPanel } from '../../components/admin/QuizControlPanel';
import { QuestionBank } from '../../components/admin/QuestionBank';
import { UnlockedContactsTable } from '../../components/admin/UnlockedContactsTable';

export interface TalentRecord {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  role: string;
  specialization?: string;
  is_verified: boolean;
  availability?: string;
  location?: string;
  skills?: string[];
  created_at?: string;
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
    email: t.email || 'No email provided',
    role: t.role || t.specialization || 'Digital Talent',
    specialization: t.specialization || t.role,
    is_verified: Boolean(t.is_verified || t.isVerified),
    availability: t.availability || 'Available',
    location: t.location || 'Remote',
    skills: Array.isArray(t.skills) ? t.skills : [],
    created_at: t.created_at,
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

  // React Query Mutation: Toggle Talent Verification
  const talentVerificationMutation = useMutation({
    mutationFn: async ({ talentId, nextStatus }: { talentId: string; nextStatus: boolean }) => {
      const { error } = await supabase
        .from('talent_profiles')
        .update({ 
          is_verified: nextStatus,
          verification_badge: nextStatus ? 'Verified Professional' : null 
        })
        .eq('id', talentId);

      if (error) throw error;
      return { talentId, nextStatus };
    },
    onMutate: async ({ talentId, nextStatus }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['admin', 'talents'] });
      // Snapshot previous data
      const previousTalents = queryClient.getQueryData<TalentRecord[]>(['admin', 'talents']);
      // Optimistically update cache
      if (previousTalents) {
        queryClient.setQueryData<TalentRecord[]>(['admin', 'talents'], old =>
          (old || []).map(t => (t.id === talentId ? { ...t, is_verified: nextStatus } : t))
        );
      }
      return { previousTalents };
    },
    onError: (err: any, variables, context) => {
      // Rollback on failure
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
      // Invalidate to guarantee source of truth
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

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col md:flex-row text-slate-900 font-sans antialiased">
      
      {/* ========================================================================= */}
      {/* 1. LEFT MODERN DARK SIDEBAR (bg-slate-900 text-white) */}
      {/* ========================================================================= */}
      <aside className="w-full md:w-72 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-800">
        
        {/* Brand & Workspace Identity */}
        <div>
          <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-2xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight leading-none">
                  Digital Campux
                </h2>
                <span className="text-[11px] text-slate-400 font-medium">
                  Admin Command Console
                </span>
              </div>
            </div>
          </div>

          {/* Core Navigation Items */}
          <nav className="p-4 space-y-1.5">
            <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Operations & Talent
            </div>

            {/* Tab 1: Talent Roster */}
            <button
              onClick={() => setActiveTab('talents')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'talents'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4" />
                <span>Talent Roster</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                activeTab === 'talents' ? 'bg-emerald-700/80 text-emerald-100' : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                {talents.length}
              </span>
            </button>

            {/* Tab 2: Quiz & Settings Control Panel */}
            <button
              onClick={() => setActiveTab('quiz_settings')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'quiz_settings'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sliders className="w-4 h-4" />
                <span>Quiz & Settings Control</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800/80 text-emerald-400 border border-emerald-500/20 font-mono">
                Live
              </span>
            </button>

            {/* Tab 3: Question Bank */}
            <button
              onClick={() => setActiveTab('question_bank')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'question_bank'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <HelpCircle className="w-4 h-4" />
                <span>Question Bank</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                8 Tracks
              </span>
            </button>

            {/* Tab 4: Unlocked Contacts Log */}
            <button
              onClick={() => setActiveTab('unlocked_contacts')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'unlocked_contacts'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Key className="w-4 h-4" />
                <span>Unlocked Contacts Log</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                Audit
              </span>
            </button>

            <div className="pt-4 px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Account Management
            </div>

            {/* Sub-Tab: Recruiters Management */}
            <button
              onClick={() => setActiveTab('recruiters')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'recruiters'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4" />
                <span>Recruiters Directory</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                {recruiters.length}
              </span>
            </button>

            {/* Sub-Tab: Admin Approvals */}
            <button
              onClick={() => setActiveTab('admins')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'admins'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4" />
                <span>Admin Permissions</span>
              </div>
              {pendingAdminApprovals > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 animate-pulse">
                  {pendingAdminApprovals} Pending
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Sidebar Footer & User Profile */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-xs text-emerald-400 uppercase shrink-0">
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">
                {profile?.full_name || 'System Admin'}
              </p>
              <span className="inline-block text-[10px] font-mono font-medium text-emerald-400">
                {profile?.role === 'super_admin' ? 'Super Administrator' : 'Platform Staff'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {onNavigateHome && (
              <button
                onClick={onNavigateHome}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition cursor-pointer"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Live Site</span>
              </button>
            )}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold text-rose-300 hover:text-rose-200 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-900/50 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
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
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isBackgroundFetching ? 'animate-spin' : ''}`} />
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
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clean Data Table */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                        <th className="py-3.5 px-6">Candidate</th>
                        <th className="py-3.5 px-4">Specialization</th>
                        <th className="py-3.5 px-4">Location & Availability</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-6 text-right">Verification Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {isTalentsLoading ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-400">
                            <div className="flex items-center justify-center gap-2">
                              <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                              <span>Loading talent records from database...</span>
                            </div>
                          </td>
                        </tr>
                      ) : filteredTalents.length > 0 ? (
                        filteredTalents.map((talent) => (
                          <tr key={talent.id} className="hover:bg-slate-50/80 transition-colors">
                            {/* Candidate Info */}
                            <td className="py-4 px-6">
                              <div className="space-y-0.5">
                                <div className="font-semibold text-slate-900 flex items-center gap-2">
                                  <span>{talent.name}</span>
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
                                  <Mail className="w-3 h-3 text-slate-400" />
                                  <span>{talent.email}</span>
                                </div>
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
                              <span className="text-emerald-700 font-semibold block">
                                {talent.availability || 'Available'}
                              </span>
                              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span>{talent.location || 'Remote'}</span>
                              </span>
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

                            {/* Action Button */}
                            <td className="py-4 px-6 text-right">
                              <button
                                onClick={() => talentVerificationMutation.mutate({ talentId: talent.id, nextStatus: !talent.is_verified })}
                                disabled={talentVerificationMutation.isPending}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
                                  talent.is_verified
                                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                }`}
                              >
                                {talentVerificationMutation.isPending
                                  ? 'Updating...'
                                  : talent.is_verified
                                  ? 'Revoke Badge'
                                  : 'Accredit & Verify'}
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-400">
                            No candidates found matching criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
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
    </div>
  );
};

export default AdminDashboard;
