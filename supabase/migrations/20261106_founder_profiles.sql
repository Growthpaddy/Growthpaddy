-- ==============================================================================
-- Migration: 20261106_founder_profiles.sql
-- Description:
-- 1. Creates public.founder_profiles table for Digital Campux Founder Community
-- 2. Sets default profile_status to 'pending'
-- 3. Enables Row Level Security (RLS) policies for authenticated founders
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.founder_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  business_name TEXT,
  website TEXT,
  profile_status TEXT NOT NULL DEFAULT 'pending' CHECK (profile_status IN ('pending', 'approved', 'rejected', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index lookup columns
CREATE INDEX IF NOT EXISTS idx_founder_profiles_email ON public.founder_profiles(email);
CREATE INDEX IF NOT EXISTS idx_founder_profiles_status ON public.founder_profiles(profile_status);
CREATE INDEX IF NOT EXISTS idx_founder_profiles_user_id ON public.founder_profiles(user_id);

-- Enable Row Level Security
ALTER TABLE public.founder_profiles ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies if re-running
DROP POLICY IF EXISTS "founder_profiles_select_own" ON public.founder_profiles;
DROP POLICY IF EXISTS "founder_profiles_update_own" ON public.founder_profiles;
DROP POLICY IF EXISTS "founder_profiles_insert_own" ON public.founder_profiles;
DROP POLICY IF EXISTS "founder_profiles_admin_all" ON public.founder_profiles;

-- Allow authenticated founders to view their own profile
CREATE POLICY "founder_profiles_select_own"
  ON public.founder_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR auth.uid() = user_id);

-- Allow authenticated founders to update their own profile
CREATE POLICY "founder_profiles_update_own"
  ON public.founder_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR auth.uid() = user_id)
  WITH CHECK (auth.uid() = id OR auth.uid() = user_id);

-- Allow authenticated founders to insert their own profile
CREATE POLICY "founder_profiles_insert_own"
  ON public.founder_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id OR auth.uid() = user_id);

-- Allow service_role and admins full access
CREATE POLICY "founder_profiles_admin_all"
  ON public.founder_profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
