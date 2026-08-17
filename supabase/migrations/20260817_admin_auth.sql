-- ==============================================================================
-- Migration: 20260817_admin_auth.sql
-- Description: Schema, triggers, and Row Level Security (RLS) policies for admin_profiles
-- ==============================================================================

-- 1. Enable UUID Extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create admin_profiles table
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin')) DEFAULT 'admin',
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_admin_user_id UNIQUE (user_id),
  CONSTRAINT unique_admin_email UNIQUE (email)
);

-- 3. Indexes for fast authentication and status lookup
CREATE INDEX IF NOT EXISTS idx_admin_profiles_user_id ON public.admin_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_email ON public.admin_profiles(email);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_is_active ON public.admin_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_role ON public.admin_profiles(role);

-- 4. Automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_admin_profile_updated_at()
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
EXECUTE FUNCTION public.handle_admin_profile_updated_at();

-- 5. Helper Security Definer Functions
-- Function to check if the current user is an active admin
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

-- Function to check if the current user is an active super admin
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

-- 7. RLS Policies

-- Policy A: Self-read or Active Admin Directory Read
-- Users can read their own profile (to check status upon sign in) or active admins can view all admin records.
DROP POLICY IF EXISTS "Allow user self-read or active admin read" ON public.admin_profiles;
CREATE POLICY "Allow user self-read or active admin read"
ON public.admin_profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  OR public.is_active_admin()
);

-- Policy B: Unapproved Self-Registration (Sign-Up / Request Access)
-- Authenticated users can insert their own record strictly with is_active = FALSE and role = 'admin'.
DROP POLICY IF EXISTS "Allow user to insert pending unapproved profile" ON public.admin_profiles;
CREATE POLICY "Allow user to insert pending unapproved profile"
ON public.admin_profiles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  AND is_active = FALSE 
  AND role = 'admin'
);

-- Policy C: Super Admin Updates
-- Only active super admins are allowed to update admin profiles (approve, deactivate, change role).
DROP POLICY IF EXISTS "Allow super admins to update admin profiles" ON public.admin_profiles;
CREATE POLICY "Allow super admins to update admin profiles"
ON public.admin_profiles
FOR UPDATE
TO authenticated
USING (
  public.is_active_super_admin()
)
WITH CHECK (
  public.is_active_super_admin()
);

-- Policy D: Super Admin Deletions
-- Only active super admins can delete/reject pending admin applications or remove profiles.
DROP POLICY IF EXISTS "Allow super admins to delete admin profiles" ON public.admin_profiles;
CREATE POLICY "Allow super admins to delete admin profiles"
ON public.admin_profiles
FOR DELETE
TO authenticated
USING (
  public.is_active_super_admin()
);

-- 8. Seed Initial Super Admin (Optional Demonstration Helper)
-- To bootstrap the first Super Admin safely:
-- INSERT INTO public.admin_profiles (user_id, full_name, email, role, is_active)
-- VALUES ('<YOUR_AUTH_USER_UUID>', 'System Administrator', 'admin@organization.com', 'super_admin', TRUE)
-- ON CONFLICT (user_id) DO UPDATE SET is_active = TRUE, role = 'super_admin';
