-- ==============================================================================
-- Migration: 20261106120000_create_founder_profiles.sql
-- Description:
--   Baseline creation of public.founder_profiles for Digital Campux Founder Community:
--   1. Canonical 1:1 relationship with auth.users (founder_profiles.id = auth.users.id)
--   2. Default profile_status = 'pending'
--   3. Row Level Security (RLS) policies for private self-access and admin oversight
--   4. Hardened SECURITY DEFINER trigger (SET search_path = '') protecting:
--      - id, email, profile_status, and created_at against client tampering
--      - automatically maintaining updated_at timestamp
--   5. Restricted security barrier public directory view (founder_profiles_public)
--      exposing only approved profiles with non-sensitive fields (omits emails and metadata)
-- ==============================================================================

-- 1. Ensure required extensions exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create public.founder_profiles table
CREATE TABLE IF NOT EXISTS public.founder_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  business_name TEXT,
  website TEXT,
  profile_status TEXT NOT NULL DEFAULT 'pending' CHECK (profile_status IN ('pending', 'approved', 'rejected', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Lookup indexes
CREATE INDEX IF NOT EXISTS idx_founder_profiles_email ON public.founder_profiles(email);
CREATE INDEX IF NOT EXISTS idx_founder_profiles_status ON public.founder_profiles(profile_status);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.founder_profiles ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies to guarantee idempotent recreation
DROP POLICY IF EXISTS "founder_profiles_select_own_or_admin" ON public.founder_profiles;
DROP POLICY IF EXISTS "founder_profiles_insert_own" ON public.founder_profiles;
DROP POLICY IF EXISTS "founder_profiles_update_own" ON public.founder_profiles;
DROP POLICY IF EXISTS "founder_profiles_delete_admin_only" ON public.founder_profiles;
DROP POLICY IF EXISTS "founder_profiles_service_role_all" ON public.founder_profiles;

-- Legacy policy name cleanup
DROP POLICY IF EXISTS "founder_profiles_select_own" ON public.founder_profiles;
DROP POLICY IF EXISTS "founder_profiles_update_own" ON public.founder_profiles;
DROP POLICY IF EXISTS "founder_profiles_insert_own" ON public.founder_profiles;
DROP POLICY IF EXISTS "founder_profiles_admin_all" ON public.founder_profiles;

-- 6. RLS Policies on Base Table (Strict Privacy)

-- Policy A: SELECT - Founder reads their own profile; Active admins read all
CREATE POLICY "founder_profiles_select_own_or_admin"
  ON public.founder_profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
    OR public.is_active_admin()
  );

-- Policy B: INSERT - Authenticated users insert their own profile with 'pending' status only
CREATE POLICY "founder_profiles_insert_own"
  ON public.founder_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id
    AND profile_status = 'pending'
  );

-- Policy C: UPDATE - Founders update permitted fields on own record; Active admins update any record
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

-- Policy D: DELETE - Restricted to active administrators only (suspension is normal workflow)
CREATE POLICY "founder_profiles_delete_admin_only"
  ON public.founder_profiles
  FOR DELETE
  TO authenticated
  USING (
    public.is_active_admin()
  );

-- Policy E: ALL - Service role has full access (backend proxy operations)
CREATE POLICY "founder_profiles_service_role_all"
  ON public.founder_profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 7. Hardened Trigger Function: Anti-Tamper & Automatic updated_at
CREATE OR REPLACE FUNCTION public.handle_founder_profile_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Automatically update timestamp
  NEW.updated_at = pg_catalog.now();

  -- Allow backend service role complete administrative discretion
  IF COALESCE(pg_catalog.current_setting('request.jwt.claim.role', true), '') = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Allow active administrators complete administrative discretion
  IF public.is_active_admin() THEN
    RETURN NEW;
  END IF;

  -- Enforce field immutability for authenticated founders
  IF NEW.id <> OLD.id THEN
    RAISE EXCEPTION 'Changing profile ID is strictly prohibited'
      USING ERRCODE = '42501';
  END IF;

  IF NEW.email <> OLD.email THEN
    RAISE EXCEPTION 'Direct email modifications are not permitted'
      USING ERRCODE = '42501';
  END IF;

  IF NEW.profile_status <> OLD.profile_status THEN
    RAISE EXCEPTION 'Founders are not permitted to modify their own profile status'
      USING ERRCODE = '42501';
  END IF;

  IF NEW.created_at <> OLD.created_at THEN
    RAISE EXCEPTION 'Modifying created_at timestamp is strictly prohibited'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

-- Revoke direct execution privileges from untrusted roles
REVOKE ALL ON FUNCTION public.handle_founder_profile_update() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_founder_profile_update() FROM anon, authenticated;

-- 8. Bind Anti-Tamper Trigger
DROP TRIGGER IF EXISTS tr_founder_profiles_security ON public.founder_profiles;
CREATE TRIGGER tr_founder_profiles_security
  BEFORE UPDATE ON public.founder_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_founder_profile_update();

-- 9. Secure Public Directory View (Safe Public Access Mechanism)
-- Exposes ONLY approved founders and ONLY public-facing fields.
-- Completely omits email addresses, status, and administrative metadata.
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

COMMENT ON VIEW public.founder_profiles_public IS 'Restricted public directory of approved founders. Omits email addresses and internal administrative metadata.';

-- 10. Explicit Grants
-- Base table: authenticated users can select, insert, and update permitted fields on their own profile
GRANT SELECT, INSERT, UPDATE ON public.founder_profiles TO authenticated;
GRANT ALL ON public.founder_profiles TO service_role;

-- Public view: accessible to anonymous and authenticated users for directory browsing
GRANT SELECT ON public.founder_profiles_public TO anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.founder_profiles_public FROM PUBLIC, anon, authenticated;
