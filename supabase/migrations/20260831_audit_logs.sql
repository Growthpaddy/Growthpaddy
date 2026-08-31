-- ==============================================================================
-- Migration: 20260831_audit_logs.sql
-- Description: Creates the audit_logs table, indexes, and RLS policies for tracking administrative governance actions
-- ==============================================================================

-- 1. Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,
  target_id TEXT,
  action_type TEXT NOT NULL CHECK (action_type IN ('APPROVAL', 'REVOCATION', 'ROLE_CHANGE', 'DELETION', 'STATUS_UPDATE', 'SETTINGS_CHANGE')),
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Indexes for fast retrieval and query filtering
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_id ON public.audit_logs(target_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON public.audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- 3. Enable Row Level Security
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for audit_logs
-- Policy: Allow authenticated admins or system operators to read audit logs
DROP POLICY IF EXISTS "Allow authenticated admins to view audit logs" ON public.audit_logs;
CREATE POLICY "Allow authenticated admins to view audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (true);

-- Policy: Allow authenticated users to insert audit logs
DROP POLICY IF EXISTS "Allow authenticated users to insert audit logs" ON public.audit_logs;
CREATE POLICY "Allow authenticated users to insert audit logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Allow anon key fallback to insert/select if running in public client mode
DROP POLICY IF EXISTS "Allow anon inserts to audit logs" ON public.audit_logs;
CREATE POLICY "Allow anon inserts to audit logs"
ON public.audit_logs
FOR INSERT
TO anon
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon select to audit logs" ON public.audit_logs;
CREATE POLICY "Allow anon select to audit logs"
ON public.audit_logs
FOR SELECT
TO anon
USING (true);
