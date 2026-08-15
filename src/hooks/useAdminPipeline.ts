import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface TalentProfile {
  id: string;
  full_name: string;
  email: string;
  specialty: string;
  career_goal: string;
  created_at: string;
  phase_1_quiz_passed: boolean;
  latest_quiz_score: number;
  phase_2_interview_scheduled: boolean;
  phase_2_interview_passed: boolean;
  phase_3_fee_paid: boolean;
  phase_4_portfolio_submitted: boolean;
  portfolio_url?: string;
  vetting_status: 'pending' | 'approved' | 'rejected' | 'revoked';
  avatar_url?: string;
  failedAttemptsCount?: number;
}

export interface RecruiterProfile {
  id: string;
  orgName: string;
  email: string;
  size: string;
  industry: string;
  neededRole: string;
  slotsBought: number;
  activeSearches: number;
  onboardedAt: string;
}

export function useAdminPipeline() {
  const [talents, setTalents] = useState<TalentProfile[]>([]);
  const [recruiters, setRecruiters] = useState<RecruiterProfile[]>([]);
  const [loadingTalents, setLoadingTalents] = useState<boolean>(true);
  const [loadingRecruiters, setLoadingRecruiters] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Fetch Talents from Supabase
  const fetchTalents = useCallback(async () => {
    setLoadingTalents(true);
    setError(null);
    try {
      const { data, error: queryErr } = await supabase
        .from('talent_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (queryErr) throw queryErr;

      if (data) {
        const mapped: TalentProfile[] = data.map((t: any, idx: number) => ({
          id: t.id,
          full_name: t.full_name || t.fullName || t.name || `Candidate #${idx + 1}`,
          email: t.email || `talent${idx + 1}@digitalcampux.com`,
          specialty: t.specialty || t.specialization || 'Growth Marketing & CRO',
          career_goal: t.career_goal || t.role || 'Full-Time Remote Job',
          created_at: t.created_at || new Date().toISOString(),
          phase_1_quiz_passed: !!t.phase_1_quiz_passed,
          latest_quiz_score: typeof t.latest_quiz_score === 'number' ? t.latest_quiz_score : 85,
          phase_2_interview_scheduled: !!t.phase_2_interview_scheduled,
          phase_2_interview_passed: !!t.phase_2_interview_passed,
          phase_3_fee_paid: !!t.phase_3_fee_paid,
          phase_4_portfolio_submitted: !!t.phase_4_portfolio_submitted,
          portfolio_url: t.portfolio_url || t.portfolioUrl,
          vetting_status: (t.vetting_status as any) || 'pending',
          avatar_url: t.avatar_url || t.avatarUrl || `https://images.unsplash.com/photo-${1534528741775 + (idx * 1000)}?w=150&auto=format&fit=crop&q=80`,
          failedAttemptsCount: t.failed_attempts_count || 0
        }));

        setTalents(mapped);
      }
    } catch (err: any) {
      console.warn('Error fetching talent profiles:', err);
      setError(err.message || 'Failed to load talent directory profiles');
    } finally {
      setLoadingTalents(false);
    }
  }, []);

  // Fetch Recruiters from Network
  const fetchRecruiters = useCallback(async () => {
    setLoadingRecruiters(true);
    try {
      const { data, error: queryErr } = await supabase
        .from('recruiter_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (queryErr) throw queryErr;

      if (data) {
        const mapped: RecruiterProfile[] = data.map((r: any, idx: number) => ({
          id: r.id || `R${idx + 1}`,
          orgName: r.company_name || r.organization_name || r.orgName || 'Enterprise Partner',
          email: r.email || r.company_email || 'recruiter@digitalcampux.com',
          size: r.company_size || r.organization_size || r.size || '11-50',
          industry: r.industry || r.industry_vertical || 'SaaS / B2B',
          neededRole: r.target_talent_type || r.needed_talent_role || r.neededRole || 'Full-Time Dedicated Talent',
          slotsBought: r.slots_bought || r.slotsBought || 1,
          activeSearches: r.active_searches || r.activeSearches || 1,
          onboardedAt: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        }));
        setRecruiters(mapped);
      }
    } catch (err: any) {
      console.warn('Error fetching recruiter profiles:', err);
    } finally {
      setLoadingRecruiters(false);
    }
  }, []);

  // Update Talent Profile with Optimistic State Update
  const handleUpdateTalent = useCallback(async (talentId: string, updates: Record<string, any>) => {
    // 1. Optimistic local state update
    setTalents((prev) =>
      prev.map((t) => (t.id === talentId ? { ...t, ...updates } : t))
    );

    // 2. Perform database update
    try {
      const { error: updateErr } = await supabase
        .from('talent_profiles')
        .update(updates)
        .eq('id', talentId);

      if (updateErr) {
        console.warn('DB update warning:', updateErr.message);
      } else {
        setToastMsg('Candidate vetting status updated successfully');
        setTimeout(() => setToastMsg(null), 3000);
        // Refresh to ensure full synchronization
        await fetchTalents();
      }
    } catch (err: any) {
      console.error('Error updating talent profile:', err);
    }
  }, [fetchTalents]);

  // Initial fetch on hook mount
  useEffect(() => {
    fetchTalents();
    fetchRecruiters();
  }, [fetchTalents, fetchRecruiters]);

  return {
    talents,
    recruiters,
    loadingTalents,
    loadingRecruiters,
    error,
    toastMsg,
    setToastMsg,
    fetchTalents,
    fetchRecruiters,
    handleUpdateTalent
  };
}
