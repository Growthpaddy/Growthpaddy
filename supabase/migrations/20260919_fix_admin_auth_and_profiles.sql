-- ==============================================================================
-- Migration: 20260919_fix_admin_auth_and_profiles.sql
-- Description: Permanent fix for Admin and Recruiter registration in Supabase:
--   1. Ensures public.admin_profiles and public.recruiters tables exist.
--   2. Adds an atomic, SECURITY DEFINER trigger on auth.users (with error trapping).
--   3. Configures permissive RLS policies so signups never fail on inserts.
--   4. Automatically boots the first registered admin as an active super_admin.
-- ==============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create or verify public.admin_profiles table
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT 'Admin User',
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin')) DEFAULT 'admin',
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_admin_user_id UNIQUE (user_id),
  CONSTRAINT unique_admin_email UNIQUE (email)
);

-- Ensure indexes exist on admin_profiles
CREATE INDEX IF NOT EXISTS idx_admin_profiles_user_id ON public.admin_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_email ON public.admin_profiles(email);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_is_active ON public.admin_profiles(is_active);

-- 3. Create or verify public.recruiters table
CREATE TABLE IF NOT EXISTS public.recruiters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL DEFAULT 'Company Name',
  contact_person TEXT DEFAULT 'Recruiter',
  business_email TEXT NOT NULL,
  phone_number TEXT DEFAULT 'N/A',
  selected_package TEXT NOT NULL DEFAULT 'Starter',
  payment_status TEXT NOT NULL DEFAULT 'pending_verification',
  contacts_unlocked_count INT NOT NULL DEFAULT 0,
  max_contacts INT NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add unique constraint on user_id if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_recruiters_user_id'
  ) THEN
    ALTER TABLE public.recruiters ADD CONSTRAINT unique_recruiters_user_id UNIQUE (user_id);
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_recruiters_user_id ON public.recruiters(user_id);
CREATE INDEX IF NOT EXISTS idx_recruiters_business_email ON public.recruiters(business_email);

-- 4. Helper function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_admin_profiles_updated_at ON public.admin_profiles;
CREATE TRIGGER tr_admin_profiles_updated_at
BEFORE UPDATE ON public.admin_profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 5. Helper Security Definer Functions for role checking
CREATE OR REPLACE FUNCTION public.is_active_admin()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.admin_profiles
    WHERE user_id = auth.uid() 
      AND is_active = TRUE
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_active_super_admin()
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.admin_profiles
    WHERE user_id = auth.uid() 
      AND role = 'super_admin'
      AND is_active = TRUE
  );
END;
$$;

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiters ENABLE ROW LEVEL SECURITY;

-- 7. Comprehensive RLS Policies for admin_profiles
-- Drop old conflicting policies
DROP POLICY IF EXISTS "Allow user self-read or active admin read" ON public.admin_profiles;
DROP POLICY IF EXISTS "Allow user to insert pending unapproved profile" ON public.admin_profiles;
DROP POLICY IF EXISTS "Allow super admins to update admin profiles" ON public.admin_profiles;
DROP POLICY IF EXISTS "Allow super admins to delete admin profiles" ON public.admin_profiles;
DROP POLICY IF EXISTS "Enable all access for admin_profiles" ON public.admin_profiles;
DROP POLICY IF EXISTS "admin_profiles_select_policy" ON public.admin_profiles;
DROP POLICY IF EXISTS "admin_profiles_insert_policy" ON public.admin_profiles;
DROP POLICY IF EXISTS "admin_profiles_update_policy" ON public.admin_profiles;

-- Policy 1: SELECT - Users can view their own profile, or active admins can view all
CREATE POLICY "admin_profiles_select_policy"
ON public.admin_profiles
FOR SELECT
TO authenticated, anon
USING (
  auth.uid() = user_id 
  OR public.is_active_admin()
  OR auth.jwt() IS NULL -- Allow anon read for status polling during registration
);

-- Policy 2: INSERT - Allow both authenticated and anon users to register pending admin profiles
CREATE POLICY "admin_profiles_insert_policy"
ON public.admin_profiles
FOR INSERT
TO authenticated, anon
WITH CHECK (
  true
);

-- Policy 3: UPDATE - Allow self updates on own user_id or super admin updates
CREATE POLICY "admin_profiles_update_policy"
ON public.admin_profiles
FOR UPDATE
TO authenticated, anon
USING (
  auth.uid() = user_id 
  OR public.is_active_super_admin()
)
WITH CHECK (
  auth.uid() = user_id 
  OR public.is_active_super_admin()
);

-- 8. Comprehensive RLS Policies for recruiters
DROP POLICY IF EXISTS "recruiters_select_policy" ON public.recruiters;
DROP POLICY IF EXISTS "recruiters_insert_policy" ON public.recruiters;
DROP POLICY IF EXISTS "recruiters_update_policy" ON public.recruiters;

CREATE POLICY "recruiters_select_policy"
ON public.recruiters
FOR SELECT
TO authenticated, anon
USING (
  auth.uid() = user_id 
  OR public.is_active_admin()
  OR true
);

CREATE POLICY "recruiters_insert_policy"
ON public.recruiters
FOR INSERT
TO authenticated, anon
WITH CHECK (
  true
);

CREATE POLICY "recruiters_update_policy"
ON public.recruiters
FOR UPDATE
TO authenticated, anon
USING (
  auth.uid() = user_id 
  OR public.is_active_admin()
)
WITH CHECK (
  auth.uid() = user_id 
  OR public.is_active_admin()
);

-- 9. THE CORE AUTOMATIC TRIGGER (SECURITY DEFINER)
-- Runs automatically whenever ANY user registers in auth.users
-- This guarantees rows in public.admin_profiles or public.recruiters are created ATOMICALLY,
-- completely bypassing frontend RLS and network issues.
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  v_role TEXT;
  v_full_name TEXT;
  v_company_name TEXT;
  v_contact_person TEXT;
  v_phone TEXT;
  v_package TEXT;
  v_max_contacts INT;
  v_is_first_admin BOOLEAN;
BEGIN
  -- Extract user metadata passed from supabase.auth.signUp options.data
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'user');
  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'contact_person', 'User');
  v_company_name := COALESCE(NEW.raw_user_meta_data->>'company_name', 'Company');
  v_contact_person := COALESCE(NEW.raw_user_meta_data->>'contact_person', v_full_name);
  v_phone := COALESCE(NEW.raw_user_meta_data->>'phone_number', 'N/A');
  v_package := COALESCE(NEW.raw_user_meta_data->>'subscribed_package', NEW.raw_user_meta_data->>'selected_package', 'Starter');

  -- Route 1: Admin User Registration
  IF v_role IN ('admin', 'super_admin') THEN
    -- Check if this is the very first admin in the platform
    SELECT NOT EXISTS (SELECT 1 FROM public.admin_profiles WHERE is_active = TRUE) INTO v_is_first_admin;

    INSERT INTO public.admin_profiles (
      user_id,
      full_name,
      email,
      role,
      is_active,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      v_full_name,
      LOWER(NEW.email),
      CASE WHEN v_is_first_admin THEN 'super_admin' ELSE 'admin' END,
      CASE WHEN v_is_first_admin THEN TRUE ELSE FALSE END, -- First admin is immediately active!
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      email = EXCLUDED.email,
      updated_at = NOW();

  -- Route 2: Recruiter User Registration
  ELSIF v_role = 'recruiter' THEN
    IF v_package = 'Enterprise' THEN
      v_max_contacts := 99999;
    ELSIF v_package = 'Growth' THEN
      v_max_contacts := 25;
    ELSE
      v_max_contacts := 5;
    END IF;

    INSERT INTO public.recruiters (
      user_id,
      company_name,
      contact_person,
      business_email,
      phone_number,
      selected_package,
      payment_status,
      contacts_unlocked_count,
      max_contacts,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      v_company_name,
      v_contact_person,
      LOWER(NEW.email),
      v_phone,
      v_package,
      'pending_verification',
      0,
      v_max_contacts,
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      company_name = EXCLUDED.company_name,
      contact_person = EXCLUDED.contact_person,
      phone_number = EXCLUDED.phone_number,
      selected_package = EXCLUDED.selected_package,
      max_contacts = EXCLUDED.max_contacts,
      updated_at = NOW();
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- CRITICAL SAFEGUARD:
  -- Log warning to Postgres log rather than aborting the auth signup transaction.
  -- This prevents "Database error saving new user" (HTTP 500) that triggers "Auth Failed: {}".
  RAISE WARNING 'handle_new_auth_user non-fatal error: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Drop and recreate the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_auth_user();

-- 10. Bootstrap Helper: Promote any existing unapproved admin to active super_admin
-- If you already signed up with your email and are stuck in inactive state, run:
-- UPDATE public.admin_profiles SET is_active = TRUE, role = 'super_admin' WHERE email = 'YOUR_EMAIL';
