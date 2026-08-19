import React, { useState, useEffect, useMemo } from 'react';
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
  DollarSign,
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
  Key
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { TalentCandidate } from '../../types';
import { QuizControlPanel } from '../../components/admin/QuizControlPanel';
import { UnlockedContactsTable } from '../../components/admin/UnlockedContactsTable';

interface TalentRecord {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  role: string;
  specialization?: string;
  is_verified: boolean;
  hourly_rate?: string | number;
  availability?: string;
  skills?: string[];
  created_at?: string;
  slug?: string;
}

interface RecruiterRecord {
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

interface PendingAdminRecord {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: 'super_admin' | 'admin';
  is_active: boolean;
  created_at?: string;
}

interface DashboardProps {
  onSignOutRedirect?: () => void;
  onNavigateHome?: () => void;
  onPreviewTalentSlug?: (slug: string) => void;
}

export const AdminDashboard: React.FC<DashboardProps> = ({
  onSignOutRedirect,
  onNavigateHome,
  onPreviewTalentSlug
}) => {
  const { user, profile, signOut, refreshProfile } = useAdminAuth();
  
  // Navigation & Tab State
  const [activeTab, setActiveTab] = useState<'talents' | 'recruiters' | 'admins' | 'quizzes' | 'unlocked_contacts'>('talents');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'pending'>('all');

  // Data Collections
  const [talents, setTalents] = useState<TalentRecord[]>([]);
  const [recruiters, setRecruiters] = useState<RecruiterRecord[]>([]);
  const [adminRequests, setAdminRequests] = useState<PendingAdminRecord[]>([]);
  
  // UI & Loading States
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Auto-dismiss notification after 4s
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Load all dashboard records from Supabase
  const fetchAllData = async () => {
    setLoadingData(true);
    try {
      // 1. Fetch Talents
      const { data: talentData, error: talentError } = await supabase
        .from('talent_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!talentError && talentData) {
        setTalents(
          talentData.map((t: any) => ({
            id: t.id,
            user_id: t.user_id,
            name: t.name || t.full_name || 'Anonymous Specialist',
            email: t.email || 'No email provided',
            role: t.role || t.specialization || 'Digital Talent',
            specialization: t.specialization || t.role,
            is_verified: Boolean(t.is_verified || t.isVerified),
            hourly_rate: t.hourly_rate || t.hourlyRate || 'N/A',
            availability: t.availability || 'Available',
            skills: Array.isArray(t.skills) ? t.skills : [],
            created_at: t.created_at,
            slug: t.slug || t.id,
          }))
        );
      }

      // 2. Fetch Recruiters
      const { data: recruiterData, error: recruiterError } = await supabase
        .from('recruiters')
        .select('*')
        .order('created_at', { ascending: false });

      if (!recruiterError && recruiterData) {
        setRecruiters(
          recruiterData.map((r: any) => ({
            id: r.id,
            user_id: r.user_id,
            company_name: r.company_name || r.name || 'Organization',
            contact_name: r.contact_name || r.name || '',
            email: r.email || '',
            phone: r.phone || '',
            is_approved: Boolean(r.is_approved ?? r.isApproved ?? true),
            package_tier: r.package_tier || r.packageType || 'Standard Employer',
            created_at: r.created_at,
          }))
        );
      } else {
        // Try fallback to recruiter_profiles if recruiters table not present
        const { data: fallbackRecruiters } = await supabase
          .from('recruiter_profiles')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (fallbackRecruiters) {
          setRecruiters(
            fallbackRecruiters.map((r: any) => ({
              id: r.id,
              user_id: r.user_id,
              company_name: r.company_name || r.name || 'Organization',
              contact_name: r.contact_name || r.name || '',
              email: r.email || '',
              phone: r.phone || '',
              is_approved: Boolean(r.is_approved ?? true),
              package_tier: r.package_tier || 'Standard Employer',
              created_at: r.created_at,
            }))
          );
        }
      }

      // 3. Fetch Admin Profiles (if current user is super_admin or admin)
      const { data: adminsData, error: adminsError } = await supabase
        .from('admin_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!adminsError && adminsData) {
        setAdminRequests(adminsData as PendingAdminRecord[]);
      }
    } catch (err) {
      console.warn('[AdminDashboard] Error loading platform records:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Action: Toggle Talent Verification Status
  const handleToggleTalentVerification = async (talentId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    setActionLoadingId(talentId);

    // Optimistic UI Update
    setTalents(prev =>
      prev.map(t => (t.id === talentId ? { ...t, is_verified: nextStatus } : t))
    );

    try {
      const { error } = await supabase
        .from('talent_profiles')
        .update({ 
          is_verified: nextStatus,
          verification_badge: nextStatus ? 'Verified Professional' : null 
        })
        .eq('id', talentId);

      if (error) throw error;

      setNotification({
        type: 'success',
        message: `Talent ${nextStatus ? 'verified and accredited' : 'moved to pending status'}.`,
      });
    } catch (err: any) {
      console.error('[AdminDashboard] Failed to toggle talent verification:', err);
      // Revert optimistic update
      setTalents(prev =>
        prev.map(t => (t.id === talentId ? { ...t, is_verified: currentStatus } : t))
      );
      setNotification({
        type: 'error',
        message: err.message || 'Failed to update talent verification status.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Action: Toggle Recruiter Approval Status
  const handleToggleRecruiterApproval = async (recruiterId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    setActionLoadingId(recruiterId);

    // Optimistic UI Update
    setRecruiters(prev =>
      prev.map(r => (r.id === recruiterId ? { ...r, is_approved: nextStatus } : r))
    );

    try {
      const { error } = await supabase
        .from('recruiters')
        .update({ is_approved: nextStatus })
        .eq('id', recruiterId);

      if (error) {
        // Fallback update on recruiter_profiles
        await supabase
          .from('recruiter_profiles')
          .update({ is_approved: nextStatus })
          .eq('id', recruiterId);
      }

      setNotification({
        type: 'success',
        message: `Recruiter account ${nextStatus ? 'approved and activated' : 'suspended'}.`,
      });
    } catch (err: any) {
      console.error('[AdminDashboard] Failed to toggle recruiter approval:', err);
      setRecruiters(prev =>
        prev.map(r => (r.id === recruiterId ? { ...r, is_approved: currentStatus } : r))
      );
      setNotification({
        type: 'error',
        message: err.message || 'Failed to update recruiter status.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Action: Toggle Admin Approval (Super Admin Only)
  const handleToggleAdminStatus = async (adminId: string, nextStatus: boolean) => {
    setActionLoadingId(adminId);
    try {
      const { error } = await supabase
        .from('admin_profiles')
        .update({ is_active: nextStatus })
        .eq('id', adminId);

      if (error) throw error;

      setAdminRequests(prev =>
        prev.map(a => (a.id === adminId ? { ...a, is_active: nextStatus } : a))
      );

      setNotification({
        type: 'success',
        message: `Admin profile ${nextStatus ? 'approved & granted portal access' : 'deactivated'}.`,
      });
    } catch (err: any) {
      console.error('[AdminDashboard] Failed to update admin profile:', err);
      setNotification({
        type: 'error',
        message: err.message || 'Failed to update admin account status. Super Admin permissions required.',
      });
    } finally {
      setActionLoadingId(null);
    }
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

  // Top Metrics Calculation
  const totalTalentsCount = talents.length;
  const verifiedTalentsCount = talents.filter(t => t.is_verified).length;
  const totalRecruitersCount = recruiters.length;
  const approvedRecruitersCount = recruiters.filter(r => r.is_approved).length;
  const pendingAdminApprovals = adminRequests.filter(a => !a.is_active).length;

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

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-850 font-sans antialiased">
      
      {/* ========================================================================= */}
      {/* 1. LEFT FIXED/COLLAPSIBLE DARK SIDEBAR (bg-slate-900) */}
      {/* ========================================================================= */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-800">
        
        {/* Sidebar Header & Brand */}
        <div>
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight leading-none">
                  Digital Campux
                </h2>
                <span className="text-[10px] text-slate-400 font-medium">
                  Central Admin Operations
                </span>
              </div>
            </div>
          </div>

          {/* Sidebar Navigation Items */}
          <nav className="p-3 space-y-1.5">
            {/* Tab 1: Talents Management */}
            <button
              onClick={() => setActiveTab('talents')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'talents'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Talents Management</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                {talents.length}
              </span>
            </button>

            {/* Tab 2: Recruiters Management */}
            <button
              onClick={() => setActiveTab('recruiters')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'recruiters'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-sky-400" />
                <span>Recruiters Management</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                {recruiters.length}
              </span>
            </button>

            {/* Tab 3: Admin Approvals (Available to All Admins & Super Admins) */}
            <button
              onClick={() => setActiveTab('admins')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'admins'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Admin Approvals</span>
              </div>
              {pendingAdminApprovals > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  {pendingAdminApprovals}
                </span>
              )}
            </button>

            {/* Tab 4: Quiz & Accreditation Control Panel */}
            <button
              onClick={() => setActiveTab('quizzes')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'quizzes'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-4 h-4 text-purple-400" />
                <span>Quiz & Accreditation</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                Phase 1/2
              </span>
            </button>

            {/* Tab 5: Unlocked Contacts Audit Ledger */}
            <button
              onClick={() => setActiveTab('unlocked_contacts')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'unlocked_contacts'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Key className="w-4 h-4 text-emerald-400" />
                <span>Unlocked Contacts</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                Audit
              </span>
            </button>

            {/* Public Platform Link */}
            <div className="pt-4 border-t border-slate-800/80 mt-4">
              <button
                onClick={() => {
                  if (onNavigateHome) onNavigateHome();
                  else window.location.href = '/';
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View Public Site</span>
                </div>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </nav>
        </div>

        {/* Sidebar Footer: Admin Profile Card & Sign Out */}
        <div className="p-3 border-t border-slate-800">
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 mb-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-white truncate max-w-[130px]">
                {profile?.full_name || (user?.email ? user.email.split('@')[0] : 'Administrator')}
              </span>
              <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded tracking-wide ${
                profile?.role === 'super_admin' 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {profile?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {profile?.email || user?.email}
            </p>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-rose-300 bg-rose-950/30 hover:bg-rose-900/50 border border-rose-800/40 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MAIN CONTENT VIEWPORT */}
      {/* ========================================================================= */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        
        {/* Global Toast Notification */}
        {notification && (
          <div className={`mb-6 p-4 rounded-xl border flex items-center justify-between text-xs font-semibold shadow-sm transition-all animate-in fade-in slide-in-from-top-2 ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-red-50 text-red-900 border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button 
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-slate-700 ml-4 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* View Header with Live Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {activeTab === 'talents' && 'Talents Directory & Accreditation'}
              {activeTab === 'recruiters' && 'Recruiters & Partner Management'}
              {activeTab === 'admins' && 'Administrator Access Controls'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Live synchronized database with instantaneous Supabase accreditation updates.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAllData}
              disabled={loadingData}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm transition-all disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin text-emerald-600' : ''}`} />
              <span>Refresh Database</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TOP ANALYTICAL STAT CARDS */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          
          {/* Metric 1: Total Talents */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Total Registered Talents</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{totalTalentsCount}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Users className="w-5 h-5" />
            </div>
          </div>

          {/* Metric 2: Verified Candidates */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Verified Candidates</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-2xl font-bold text-emerald-700">{verifiedTalentsCount}</p>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100/70 text-emerald-800">
                  {totalTalentsCount > 0 ? `${Math.round((verifiedTalentsCount / totalTalentsCount) * 100)}%` : '0%'}
                </span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
              <Award className="w-5 h-5" />
            </div>
          </div>

          {/* Metric 3: Total Recruiters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Recruiter Partners</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{totalRecruitersCount}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
              <Building2 className="w-5 h-5" />
            </div>
          </div>

          {/* Metric 4: Approved Recruiters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Active Employers</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{approvedRecruitersCount}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* SEARCH & STATUS FILTER TOOLBAR */}
        {/* ========================================================================= */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Live Search Input */}
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder={activeTab === 'talents' ? 'Search by name, role, email...' : 'Search company, contact, email...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Status Selector */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-600">Status:</span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  statusFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('verified')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  statusFilter === 'verified'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Verified / Approved
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  statusFilter === 'pending'
                    ? 'bg-white text-amber-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pending
              </button>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* TAB 1: TALENTS MANAGEMENT TABLE */}
        {/* ========================================================================= */}
        {activeTab === 'talents' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Accredited Candidates List ({filteredTalents.length})
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                Click verification button to update badge status in real time
              </span>
            </div>

            {loadingData ? (
              <div className="py-16 text-center">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-500">Loading talent database...</p>
              </div>
            ) : filteredTalents.length === 0 ? (
              <div className="py-16 text-center text-slate-500">
                <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-700">No matching talent profiles found</p>
                <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or filter status.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      <th className="py-3 px-6">Candidate Name & Email</th>
                      <th className="py-3 px-4">Specialization / Role</th>
                      <th className="py-3 px-4">Rate & Availability</th>
                      <th className="py-3 px-4">Accreditation Status</th>
                      <th className="py-3 px-6 text-right">Verification Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {filteredTalents.map((talent) => (
                      <tr key={talent.id} className="hover:bg-slate-50/70 transition-colors">
                        
                        {/* Candidate Identity */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                              {talent.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                {talent.name}
                                {talent.is_verified && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline shrink-0" />
                                )}
                              </div>
                              <span className="text-[11px] text-slate-500 block truncate max-w-[200px]">
                                {talent.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Specialization */}
                        <td className="py-4 px-4">
                          <span className="font-semibold text-slate-800 block">
                            {talent.role}
                          </span>
                          {talent.skills && talent.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {talent.skills.slice(0, 2).map((skill, idx) => (
                                <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-600 font-medium">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* Rate & Availability */}
                        <td className="py-4 px-4">
                          <span className="font-semibold text-slate-900 block">
                            {typeof talent.hourly_rate === 'number' ? `$${talent.hourly_rate}/hr` : talent.hourly_rate}
                          </span>
                          <span className="text-[11px] text-emerald-700 font-medium block">
                            {talent.availability}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 px-4">
                          {talent.is_verified ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Verified Talent
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Pending Review
                            </span>
                          )}
                        </td>

                        {/* Action Buttons */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {talent.slug && onPreviewTalentSlug && (
                              <button
                                onClick={() => onPreviewTalentSlug(talent.slug!)}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                                title="Preview Portfolio"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => handleToggleTalentVerification(talent.id, talent.is_verified)}
                              disabled={actionLoadingId === talent.id}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 ${
                                talent.is_verified
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
                              }`}
                            >
                              {actionLoadingId === talent.id ? (
                                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : talent.is_verified ? (
                                <>
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Revoke Badge</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Verify Talent</span>
                                </>
                              )}
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: RECRUITERS MANAGEMENT TABLE */}
        {/* ========================================================================= */}
        {activeTab === 'recruiters' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Recruiter & Employer Accounts ({filteredRecruiters.length})
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                Grant or revoke employer direct hiring workspace access
              </span>
            </div>

            {loadingData ? (
              <div className="py-16 text-center">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-500">Loading recruiter database...</p>
              </div>
            ) : filteredRecruiters.length === 0 ? (
              <div className="py-16 text-center text-slate-500">
                <Building2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-700">No matching recruiter accounts found</p>
                <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or filter status.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      <th className="py-3 px-6">Company & Contact</th>
                      <th className="py-3 px-4">Email & Phone</th>
                      <th className="py-3 px-4">Membership Package</th>
                      <th className="py-3 px-4">Access Status</th>
                      <th className="py-3 px-6 text-right">Approval Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {filteredRecruiters.map((recruiter) => (
                      <tr key={recruiter.id} className="hover:bg-slate-50/70 transition-colors">
                        
                        {/* Company & Contact */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 text-sky-700 font-bold flex items-center justify-center text-xs shrink-0">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">
                                {recruiter.company_name}
                              </div>
                              {recruiter.contact_name && (
                                <span className="text-[11px] text-slate-500 block">
                                  Contact: {recruiter.contact_name}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Contact details */}
                        <td className="py-4 px-4">
                          <span className="font-medium text-slate-900 block flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {recruiter.email}
                          </span>
                          {recruiter.phone && (
                            <span className="text-[11px] text-slate-500 block flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {recruiter.phone}
                            </span>
                          )}
                        </td>

                        {/* Tier */}
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-semibold text-slate-700 border border-slate-200">
                            {recruiter.package_tier}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          {recruiter.is_approved ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Approved Employer
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Pending Approval
                            </span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleToggleRecruiterApproval(recruiter.id, recruiter.is_approved)}
                            disabled={actionLoadingId === recruiter.id}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-all inline-flex items-center gap-1.5 ${
                              recruiter.is_approved
                                ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                                : 'bg-slate-900 text-white hover:bg-slate-800'
                            }`}
                          >
                            {actionLoadingId === recruiter.id ? (
                              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : recruiter.is_approved ? (
                              <>
                                <UserX className="w-3.5 h-3.5" />
                                <span>Suspend Account</span>
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Approve Employer</span>
                              </>
                            )}
                          </button>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: ADMIN ACCESS APPROVALS */}
        {/* ========================================================================= */}
        {activeTab === 'admins' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Administrator Profiles & Sign-Up Requests ({adminRequests.length})
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                Authorized Super Admins can activate or deactivate admin credentials
              </span>
            </div>

            {loadingData ? (
              <div className="py-16 text-center">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-slate-500">Loading admin roster...</p>
              </div>
            ) : adminRequests.length === 0 ? (
              <div className="py-16 text-center text-slate-500">
                <ShieldCheck className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-700">No administrator profile records found</p>
                <p className="text-xs text-slate-400 mt-1">New requests registered via /admin/register will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      <th className="py-3 px-6">Admin Name & Email</th>
                      <th className="py-3 px-4">Assigned Role</th>
                      <th className="py-3 px-4">Portal Status</th>
                      <th className="py-3 px-6 text-right">Approval Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {adminRequests.map((adminItem) => (
                      <tr key={adminItem.id} className="hover:bg-slate-50/70 transition-colors">
                        
                        {/* Admin Info */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0">
                              {adminItem.full_name ? adminItem.full_name.substring(0, 2).toUpperCase() : 'AD'}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-2">
                                {adminItem.full_name || 'Admin Member'}
                                {adminItem.user_id === user?.id && (
                                  <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-semibold">
                                    You
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-500 block">
                                {adminItem.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                            adminItem.role === 'super_admin'
                              ? 'bg-amber-100 text-amber-800 border-amber-200'
                              : 'bg-slate-100 text-slate-800 border-slate-200'
                          }`}>
                            {adminItem.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          {adminItem.is_active ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Active Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Pending Approval
                            </span>
                          )}
                        </td>

                        {/* Controls */}
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleToggleAdminStatus(adminItem.id, !adminItem.is_active)}
                            disabled={actionLoadingId === adminItem.id || adminItem.user_id === user?.id}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-all inline-flex items-center gap-1.5 ${
                              adminItem.is_active
                                ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {actionLoadingId === adminItem.id ? (
                              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : adminItem.is_active ? (
                              <>
                                <UserX className="w-3.5 h-3.5" />
                                <span>Deactivate</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Activate Access</span>
                              </>
                            )}
                          </button>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: QUIZ & ACCREDITATION ENGINE CONTROL PANEL */}
        {/* ========================================================================= */}
        {activeTab === 'quizzes' && (
          <QuizControlPanel />
        )}

        {/* ========================================================================= */}
        {/* TAB 5: UNLOCKED CONTACTS AUDIT LEDGER */}
        {/* ========================================================================= */}
        {activeTab === 'unlocked_contacts' && (
          <UnlockedContactsTable />
        )}

      </main>

    </div>
  );
};

export default AdminDashboard;
