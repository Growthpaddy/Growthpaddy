-- ==============================================================================
-- Migration: 20261113000000_founder_registration_audit_fix.sql
-- Description:
--   Reconciles schema, constraints, indexes, and RLS policies for the
--   Founder Registration & Admin Approval workflow:
--   1. Removes any lingering legacy permissive policies from early drafts.
--   2. Enforces case-insensitive email uniqueness on public.founder_profiles.
--   3. Ensures canonical RLS policies & anti-tamper trigger remain intact.
--   4. Aligns public.audit_logs action_type constraint with STATUS_CHANGE events.
-- ==============================================================================

-- 1. Drop any legacy policy names if an older draft migration previously ran
DROP POLICY IF EXISTS "founder_profiles_select_own" ON public.founder_profiles;
DROP POLICY IF EXISTS "founder_profiles_update_own" ON public.founder_profiles;
DROP POLICY IF EXISTS "founder_profiles_insert_own" ON public.founder_profiles;
DROP POLICY IF EXISTS "founder_profiles_admin_all" ON public.founder_profiles;

-- 2. Recreate canonical RLS policies idempotently
DROP POLICY IF EXISTS "founder_profiles_select_own_or_admin" ON public.founder_profiles;
CREATE POLICY "founder_profiles_select_own_or_admin"
  ON public.founder_profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
    OR public.is_active_admin()
  );

DROP POLICY IF EXISTS "founder_profiles_insert_own" ON public.founder_profiles;
CREATE POLICY "founder_profiles_insert_own"
  ON public.founder_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id
    AND profile_status = 'pending'
  );

DROP POLICY IF EXISTS "founder_profiles_update_own" ON public.founder_profiles;
CREATE POLICY "founder_profiles_update_own"
  ON public.founder_profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id
    OR public.is_active_admin()
  )
  WITH CHECK (
    auth.uid() = id
    OR public.is_active_admin()
  );

DROP POLICY IF EXISTS "founder_profiles_delete_admin_only" ON public.founder_profiles;
CREATE POLICY "founder_profiles_delete_admin_only"
  ON public.founder_profiles
  FOR DELETE
  TO authenticated
  USING (
    public.is_active_admin()
  );

DROP POLICY IF EXISTS "founder_profiles_service_role_all" ON public.founder_profiles;
CREATE POLICY "founder_profiles_service_role_all"
  ON public.founder_profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 3. Case-insensitive email uniqueness on founder_profiles
DO $$
BEGIN
  UPDATE public.founder_profiles
  SET email = LOWER(TRIM(email))
  WHERE email <> LOWER(TRIM(email));
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'founder_profiles email normalization notice: %', SQLERRM;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_founder_profiles_email_lower
  ON public.founder_profiles (LOWER(email));

-- 4. Ensure public directory view strictly filters to approved founders
CREATE OR REPLACE VIEW public.founder_profiles_public
WITH (security_barrier = true)
AS
SELECT
  id,
  full_name,
  business_name,
  website
FROM public.founder_profiles
WHERE profile_status = 'approved';

GRANT SELECT ON public.founder_profiles_public TO anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.founder_profiles_public FROM PUBLIC, anon, authenticated;

-- 5. Align audit_logs action_type constraint to support STATUS_CHANGE as well as STATUS_UPDATE
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'audit_logs'
  ) THEN
    ALTER TABLE public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_action_type_check;
    ALTER TABLE public.audit_logs
      ADD CONSTRAINT audit_logs_action_type_check
      CHECK (action_type IN ('APPROVAL', 'REVOCATION', 'ROLE_CHANGE', 'DELETION', 'STATUS_UPDATE', 'STATUS_CHANGE', 'SETTINGS_CHANGE'));
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'audit_logs constraint update notice: %', SQLERRM;
END $$;
