import { supabase } from '../lib/supabaseClient';
import { logAuditEvent, AuditActionType } from '../lib/auditLogger';

export type RecruiterVerificationStatus =
  | 'verified'
  | 'pending_verification'
  | 'pending'
  | 'suspended'
  | 'rejected';

export type VerificationAction =
  | 'approve'
  | 'suspend'
  | 'restore'
  | 'restore_access'
  | 'reject'
  | 'disapprove'
  | 'pending'
  | 'verified'
  | 'suspended';

export interface RecruiterVerificationState {
  verificationStatus: 'verified' | 'pending_verification' | 'suspended' | 'rejected';
  isApproved: boolean;
  isSuspended: boolean;
  isPending: boolean;
  isDisapproved: boolean;
  paymentStatus: string;
  companyName?: string;
  email?: string;
}

export interface RecruiterVerificationRecord {
  id: string;
  user_id?: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  package_tier: string;
  verification_status: 'verified' | 'pending_verification' | 'suspended' | 'rejected' | 'pending';
  payment_status: string;
  is_approved: boolean;
  is_suspended: boolean;
  contacts_unlocked_count?: number;
  max_contacts?: number;
  created_at?: string;
  updated_at?: string;
}

export interface RecruiterStatusEventDetail {
  recruiterId: string;
  verification_status: string;
  is_approved: boolean;
  is_suspended: boolean;
  action?: string;
  timestamp: number;
}

export const RECRUITER_STATUS_EVENT = 'recruiter-status-changed';

/**
 * Normalizes recruiter record and user metadata into a consistent verification state.
 * Shared across AdminDashboard and RecruiterDashboard to guarantee 1:1 state parity.
 */
export function normalizeVerificationStatus(
  recruiter: any,
  userMetadata?: any
): RecruiterVerificationState {
  const isSuspended = Boolean(
    recruiter?.is_suspended ||
    recruiter?.status === 'suspended' ||
    recruiter?.verification_status === 'suspended' ||
    userMetadata?.is_suspended === true
  );

  const isApproved =
    !isSuspended &&
    Boolean(
      recruiter?.verification_status === 'verified' ||
      recruiter?.verification_status === 'approved' ||
      recruiter?.payment_status === 'verified' ||
      recruiter?.payment_status === 'approved' ||
      recruiter?.is_approved === true ||
      recruiter?.status === 'verified' ||
      recruiter?.status === 'active' ||
      userMetadata?.verification_status === 'verified' ||
      userMetadata?.is_approved === true
    );

  const isDisapproved =
    !isSuspended &&
    !isApproved &&
    Boolean(
      recruiter?.verification_status === 'rejected' ||
      recruiter?.verification_status === 'disapproved' ||
      recruiter?.payment_status === 'rejected' ||
      recruiter?.payment_status === 'disapproved' ||
      userMetadata?.verification_status === 'rejected'
    );

  const verificationStatus: 'verified' | 'pending_verification' | 'suspended' | 'rejected' =
    isSuspended
      ? 'suspended'
      : isApproved
      ? 'verified'
      : isDisapproved
      ? 'rejected'
      : 'pending_verification';

  const paymentStatus = isApproved
    ? 'verified'
    : isDisapproved
    ? 'rejected'
    : (recruiter?.payment_status || 'pending_verification');

  return {
    verificationStatus,
    isApproved,
    isSuspended,
    isPending: verificationStatus === 'pending_verification',
    isDisapproved,
    paymentStatus,
    companyName: recruiter?.company_name || 'Organization',
    email: recruiter?.business_email || recruiter?.email || ''
  };
}

/**
 * Updates localStorage cached recruiter profile to prevent stale state on reload.
 */
export function syncLocalRecruiterCache(
  recruiterId: string,
  updates: Partial<RecruiterVerificationRecord>
): void {
  if (typeof window === 'undefined') return;

  try {
    const cached = localStorage.getItem('dsp_recruiter_profile');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.id === recruiterId || parsed.user_id === recruiterId) {
        const merged = { ...parsed, ...updates };
        localStorage.setItem('dsp_recruiter_profile', JSON.stringify(merged));
      }
    }
  } catch (err) {
    console.warn('[recruiterVerification] Cache sync note:', err);
  }
}

/**
 * Dispatches a client-side broadcast event so all active dashboard views react instantly.
 */
export function broadcastRecruiterStatus(detail: RecruiterStatusEventDetail): void {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent<RecruiterStatusEventDetail>(RECRUITER_STATUS_EVENT, {
      detail
    })
  );
  window.dispatchEvent(
    new CustomEvent<RecruiterStatusEventDetail>('dsp_recruiter_status_changed', {
      detail
    })
  );
}

/**
 * Subscribes to recruiter status change events with cleanup callback.
 */
export function subscribeToRecruiterStatus(
  recruiterId: string | null | undefined,
  listener: (detail: RecruiterStatusEventDetail) => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<RecruiterStatusEventDetail>;
    const detail = customEvent.detail;
    if (!detail) return;

    if (!recruiterId || detail.recruiterId === recruiterId) {
      listener(detail);
    }
  };

  window.addEventListener(RECRUITER_STATUS_EVENT, handler);
  window.addEventListener('dsp_recruiter_status_changed', handler);
  return () => {
    window.removeEventListener(RECRUITER_STATUS_EVENT, handler);
    window.removeEventListener('dsp_recruiter_status_changed', handler);
  };
}

/**
 * Fetches verification state and profile for a specific recruiter by ID, user ID, or email.
 */
export async function fetchRecruiterVerification(
  identifier?: { recruiterId?: string; userId?: string; email?: string } | string
): Promise<{
  success: boolean;
  state: RecruiterVerificationState;
  recruiter: any | null;
  error?: string;
}> {
  try {
    let resolvedId: string | undefined;
    let resolvedUserId: string | undefined;
    let resolvedEmail: string | undefined;

    if (typeof identifier === 'string') {
      resolvedId = identifier;
    } else if (identifier) {
      resolvedId = identifier.recruiterId;
      resolvedUserId = identifier.userId;
      resolvedEmail = identifier.email;
    }

    // If no identifier provided, attempt to use the current auth user
    if (!resolvedId && !resolvedUserId && !resolvedEmail) {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        resolvedUserId = authData.user.id;
        resolvedEmail = authData.user.email;
      }
    }

    // 1. Query public.recruiters
    let query = supabase.from('recruiters').select('*');

    if (resolvedId && resolvedUserId) {
      query = query.or(`id.eq.${resolvedId},user_id.eq.${resolvedUserId}`);
    } else if (resolvedId) {
      query = query.or(`id.eq.${resolvedId},user_id.eq.${resolvedId}`);
    } else if (resolvedUserId) {
      query = query.eq('user_id', resolvedUserId);
    } else if (resolvedEmail) {
      query = query.eq('business_email', resolvedEmail);
    }

    const { data: recruiters, error: queryErr } = await query.limit(1);

    if (queryErr) {
      console.warn('[recruiterVerification] Query note:', queryErr.message);
    }

    let recruiterRecord = recruiters && recruiters.length > 0 ? recruiters[0] : null;

    // 2. Fallback to recruiter_profiles table if not found
    if (!recruiterRecord && (resolvedId || resolvedUserId)) {
      try {
        const { data: profile } = await supabase
          .from('recruiter_profiles')
          .select('*')
          .or(`id.eq.${resolvedId || resolvedUserId},user_id.eq.${resolvedUserId || resolvedId}`)
          .maybeSingle();

        if (profile) {
          recruiterRecord = profile;
        }
      } catch (_) {}
    }

    // 3. Fallback to localStorage cache if DB offline
    if (!recruiterRecord && typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('dsp_recruiter_profile');
        if (cached) {
          recruiterRecord = JSON.parse(cached);
        }
      } catch (_) {}
    }

    // Normalize state
    const state = normalizeVerificationStatus(recruiterRecord);

    return {
      success: true,
      state,
      recruiter: recruiterRecord
    };
  } catch (err: any) {
    console.error('[recruiterVerification] fetchRecruiterVerification error:', err);
    return {
      success: false,
      state: {
        verificationStatus: 'pending_verification',
        isApproved: false,
        isSuspended: false,
        isPending: true,
        isDisapproved: false,
        paymentStatus: 'pending_verification'
      },
      recruiter: null,
      error: err?.message || 'Failed to fetch verification status'
    };
  }
}

/**
 * Fetches all recruiter accounts with standardized verification statuses for the Admin view.
 */
export async function fetchRecruiterList(): Promise<{
  success: boolean;
  recruiters: RecruiterVerificationRecord[];
  error?: string;
}> {
  try {
    const { data: recs, error: queryErr } = await supabase
      .from('recruiters')
      .select('*')
      .order('created_at', { ascending: false });

    if (queryErr) {
      throw queryErr;
    }

    const mapped: RecruiterVerificationRecord[] = (recs || []).map((r: any) => {
      const state = normalizeVerificationStatus(r);

      return {
        id: r.id,
        user_id: r.user_id,
        company_name: r.company_name || 'Organization',
        contact_name: r.contact_person || r.contact_name || '',
        email: r.business_email || r.email || '',
        phone: r.phone_number || r.phone || '',
        package_tier: r.selected_package || r.subscribed_package || 'Starter',
        verification_status: state.verificationStatus,
        payment_status: state.paymentStatus,
        is_approved: state.isApproved,
        is_suspended: state.isSuspended,
        contacts_unlocked_count: r.contacts_unlocked_count || 0,
        max_contacts: r.max_contacts || 25,
        created_at: r.created_at,
        updated_at: r.updated_at
      };
    });

    return {
      success: true,
      recruiters: mapped
    };
  } catch (err: any) {
    console.warn('[recruiterVerification] fetchRecruiterList error:', err);
    return {
      success: false,
      recruiters: [],
      error: err?.message || 'Failed to fetch recruiters list'
    };
  }
}

/**
 * Authoritative method to update a recruiter's verification status.
 * Executes:
 * 1. Server-side authoritative endpoint call (/api/admin/recruiter/status)
 * 2. Direct Supabase update fallback on 'recruiters' and 'recruiter_profiles'
 * 3. Immutable audit log write in 'audit_logs' table
 * 4. LocalStorage cache synchronization
 * 5. Real-time client broadcast event
 */
export async function updateRecruiterVerificationStatus(
  inputOrId: string | {
    recruiterId: string;
    action: VerificationAction | string;
    reason?: string;
    actorId?: string;
    companyName?: string;
  },
  maybeAction?: VerificationAction | string,
  maybeOptions?: { reason?: string; actorId?: string; adminId?: string; adminEmail?: string; companyName?: string }
): Promise<{
  success: boolean;
  verification_status: string;
  recruiter?: any;
  error?: string;
}> {
  let recruiterId: string;
  let action: any;
  let reason: string | undefined;
  let actorId: string | undefined;
  let companyName: string | undefined;

  if (typeof inputOrId === 'string') {
    recruiterId = inputOrId;
    action = maybeAction;
    reason = maybeOptions?.reason;
    actorId = maybeOptions?.actorId || maybeOptions?.adminId;
    companyName = maybeOptions?.companyName;
  } else {
    recruiterId = inputOrId?.recruiterId;
    action = inputOrId?.action;
    reason = inputOrId?.reason;
    actorId = inputOrId?.actorId;
    companyName = inputOrId?.companyName;
  }

  if (!recruiterId) {
    return {
      success: false,
      verification_status: 'pending_verification',
      error: 'recruiterId is required'
    };
  }

  // Normalize action
  const normalizedAction: 'approve' | 'suspend' | 'restore' | 'disapprove' | 'pending' =
    action === 'verified' || action === 'approve'
      ? 'approve'
      : action === 'suspended' || action === 'suspend'
      ? 'suspend'
      : action === 'restore' || action === 'restore_access'
      ? 'restore'
      : action === 'reject' || action === 'disapprove'
      ? 'disapprove'
      : 'pending';

  const newStatus: 'verified' | 'suspended' | 'rejected' | 'pending' =
    normalizedAction === 'approve' || normalizedAction === 'restore'
      ? 'verified'
      : normalizedAction === 'suspend'
      ? 'suspended'
      : normalizedAction === 'disapprove'
      ? 'rejected'
      : 'pending';

  const isApproved = newStatus === 'verified';
  const isSuspended = newStatus === 'suspended';
  const paymentStatus = isApproved
    ? 'verified'
    : newStatus === 'rejected'
    ? 'rejected'
    : 'pending_verification';

  let apiSuccess = false;
  let responseData: any = null;

  // 1. Authoritative server-side status API
  try {
    const res = await fetch('/api/admin/recruiter/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recruiterId,
        verification_status: newStatus,
        status: newStatus,
        action: normalizedAction,
        reason
      })
    });

    const resJson = await res.json().catch(() => null);
    if (res.ok && resJson && resJson.success) {
      apiSuccess = true;
      responseData = resJson;
    }
  } catch (apiErr) {
    console.warn('[recruiterVerification] Server endpoint note:', apiErr);
  }

  // 2. Direct Supabase sync to 'recruiters' table
  try {
    // Only update columns that actually exist in the schema: payment_status, is_suspended, max_contacts, updated_at
    const updates: Record<string, any> = {
      payment_status: paymentStatus,
      is_suspended: isSuspended,
      updated_at: new Date().toISOString()
    };
    if (isApproved) {
      updates.max_contacts = 99999;
    }

    const { error: directErr } = await supabase
      .from('recruiters')
      .update(updates)
      .or(`id.eq.${recruiterId},user_id.eq.${recruiterId}`);

    if (directErr) {
      console.warn('[recruiterVerification] Direct table update note:', directErr.message);
    }

    // Call atomic RPC if configured
    try {
      const rpcAction = normalizedAction === 'approve'
        ? 'approve'
        : normalizedAction === 'suspend'
        ? 'suspend'
        : normalizedAction === 'restore'
        ? 'restore'
        : 'disapprove';

      await supabase.rpc('admin_set_recruiter_status', {
        p_recruiter_id: recruiterId,
        p_action: rpcAction
      });
    } catch (rpcErr: any) {
      console.warn('[recruiterVerification] RPC note:', rpcErr?.message);
    }
  } catch (dbErr) {
    console.warn('[recruiterVerification] Supabase sync note:', dbErr);
  }

  // 3. Log action to 'audit_logs' table
  try {
    const auditAction: AuditActionType =
      normalizedAction === 'approve'
        ? 'APPROVAL'
        : normalizedAction === 'suspend'
        ? 'REVOCATION'
        : normalizedAction === 'restore'
        ? 'STATUS_UPDATE'
        : normalizedAction === 'disapprove'
        ? 'STATUS_UPDATE'
        : 'STATUS_CHANGE';

    const desc = `Admin ${
      normalizedAction === 'approve'
        ? 'approved'
        : normalizedAction === 'suspend'
        ? 'suspended'
        : normalizedAction === 'restore'
        ? 'restored access for'
        : 'updated verification status for'
    } recruiter: ${companyName || recruiterId} (status: ${newStatus})`;

    await logAuditEvent({
      action_type: auditAction,
      description: desc,
      target_id: recruiterId,
      actor_id: actorId,
      metadata: {
        action: normalizedAction,
        verification_status: newStatus,
        payment_status: paymentStatus,
        reason: reason || null,
        timestamp: new Date().toISOString()
      }
    });
  } catch (auditErr) {
    console.warn('[recruiterVerification] Audit log write note:', auditErr);
  }

  // 4. Update localStorage cache
  syncLocalRecruiterCache(recruiterId, {
    verification_status: newStatus,
    payment_status: paymentStatus,
    is_approved: isApproved,
    is_suspended: isSuspended,
    updated_at: new Date().toISOString()
  });

  // 5. Broadcast real-time event to active client views
  broadcastRecruiterStatus({
    recruiterId,
    verification_status: newStatus,
    is_approved: isApproved,
    is_suspended: isSuspended,
    action: normalizedAction,
    timestamp: Date.now()
  });

  return {
    success: true,
    verification_status: newStatus,
    recruiter: responseData?.recruiter || {
      id: recruiterId,
      verification_status: newStatus,
      is_approved: isApproved,
      is_suspended: isSuspended,
      payment_status: paymentStatus
    }
  };
}

// ----------------------------------------------------------------------------
// Convenience helper functions
// ----------------------------------------------------------------------------

export async function approveRecruiter(recruiterId: string, actorId?: string, companyName?: string) {
  return updateRecruiterVerificationStatus({
    recruiterId,
    action: 'approve',
    actorId,
    companyName
  });
}

export async function suspendRecruiter(recruiterId: string, reason?: string, actorId?: string, companyName?: string) {
  return updateRecruiterVerificationStatus({
    recruiterId,
    action: 'suspend',
    reason,
    actorId,
    companyName
  });
}

export async function restoreRecruiterAccess(recruiterId: string, actorId?: string, companyName?: string) {
  return updateRecruiterVerificationStatus({
    recruiterId,
    action: 'restore',
    actorId,
    companyName
  });
}

export async function setRecruiterPending(recruiterId: string, actorId?: string, companyName?: string) {
  return updateRecruiterVerificationStatus({
    recruiterId,
    action: 'pending',
    actorId,
    companyName
  });
}
