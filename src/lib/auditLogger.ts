import { supabase } from './supabaseClient';

export type AuditActionType =
  | 'APPROVAL'
  | 'REVOCATION'
  | 'ROLE_CHANGE'
  | 'DELETION'
  | 'STATUS_UPDATE'
  | 'STATUS_CHANGE'
  | 'SETTINGS_CHANGE';

export interface AuditLogPayload {
  action_type: AuditActionType;
  description: string;
  target_id?: string | null;
  actor_id?: string | null;
  metadata?: Record<string, any>;
}

export interface AuditLogRecord extends AuditLogPayload {
  id: string;
  created_at: string;
}

/**
 * Service-level audit logger to record administrative decisions in Supabase `audit_logs`.
 * Non-blocking with safe fallback to console & localStorage cache on network or permissions note.
 */
export async function logAuditEvent(payload: AuditLogPayload): Promise<{ success: boolean; data?: any; error?: any }> {
  try {
    // Resolve actor_id if not provided
    let actorId = payload.actor_id;
    if (!actorId) {
      try {
        const { data: authData } = await supabase.auth.getUser();
        actorId = authData?.user?.id || null;
      } catch {
        // Continue with null actorId if unauthenticated
      }
    }

    const logEntry = {
      action_type: payload.action_type,
      description: payload.description,
      target_id: payload.target_id || null,
      actor_id: actorId,
      metadata: payload.metadata || {},
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('audit_logs')
      .insert([logEntry])
      .select();

    if (error) {
      console.warn('[AuditLogger] Supabase audit write notice:', error.message, error.details || error);
    } else {
      console.log('[AuditLogger] Successfully wrote audit log:', data);
    }

    // Cache locally as resilient backup
    try {
      const cached = JSON.parse(localStorage.getItem('dsp_audit_logs_cache') || '[]');
      cached.unshift({
        id: (data && data[0]?.id) || 'audit-' + Date.now(),
        ...logEntry
      });
      localStorage.setItem('dsp_audit_logs_cache', JSON.stringify(cached.slice(0, 100)));
    } catch {
      // Ignore localStorage error
    }

    return { success: !error, data, error };
  } catch (err: any) {
    console.warn('[AuditLogger] Unexpected error during audit log record:', err);
    return { success: false, error: err };
  }
}
