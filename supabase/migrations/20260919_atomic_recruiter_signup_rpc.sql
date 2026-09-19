-- ==============================================================================
-- Migration: 20260919_atomic_recruiter_signup_rpc.sql
-- Description: Transactional RPC Function for Recruiter Registration.
-- Ensures atomicity: creates the user in auth.users and the profile in
-- public.recruiters simultaneously within a single database transaction.
-- If any part fails, the entire transaction is rolled back.
-- ==============================================================================

-- 1. Enable required crypto and uuid extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Verify or create public.recruiters table
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

-- Ensure unique constraint on user_id and business_email
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_recruiters_user_id'
  ) THEN
    ALTER TABLE public.recruiters ADD CONSTRAINT unique_recruiters_user_id UNIQUE (user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_recruiters_business_email'
  ) THEN
    ALTER TABLE public.recruiters ADD CONSTRAINT unique_recruiters_business_email UNIQUE (business_email);
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_recruiters_user_id ON public.recruiters(user_id);
CREATE INDEX IF NOT EXISTS idx_recruiters_business_email ON public.recruiters(business_email);

-- 3. Enable RLS on public.recruiters
ALTER TABLE public.recruiters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "recruiters_select_policy" ON public.recruiters;
DROP POLICY IF EXISTS "recruiters_insert_policy" ON public.recruiters;
DROP POLICY IF EXISTS "recruiters_update_policy" ON public.recruiters;

CREATE POLICY "recruiters_select_policy"
ON public.recruiters
FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "recruiters_insert_policy"
ON public.recruiters
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

CREATE POLICY "recruiters_update_policy"
ON public.recruiters
FOR UPDATE
TO authenticated, anon
USING (
  auth.uid() = user_id 
  OR EXISTS (SELECT 1 FROM public.admin_profiles WHERE user_id = auth.uid() AND is_active = TRUE)
)
WITH CHECK (
  auth.uid() = user_id 
  OR EXISTS (SELECT 1 FROM public.admin_profiles WHERE user_id = auth.uid() AND is_active = TRUE)
);

-- 4. Transactional RPC Function: register_recruiter
-- Atomically creates the auth record, auth identity, and recruiter profile
CREATE OR REPLACE FUNCTION public.register_recruiter(
  p_email TEXT,
  p_password TEXT,
  p_company_name TEXT,
  p_contact_person TEXT DEFAULT 'Recruiter',
  p_phone_number TEXT DEFAULT 'N/A',
  p_selected_package TEXT DEFAULT 'Starter'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_user_id UUID;
  v_clean_email TEXT;
  v_clean_company TEXT;
  v_clean_contact TEXT;
  v_clean_phone TEXT;
  v_package TEXT;
  v_max_contacts INT;
  v_encrypted_pw TEXT;
  v_recruiter_row public.recruiters%ROWTYPE;
  v_existing_user_id UUID;
BEGIN
  -- A. Sanitize and Validate Inputs
  v_clean_email := LOWER(TRIM(p_email));
  v_clean_company := COALESCE(NULLIF(TRIM(p_company_name), ''), 'Company Name');
  v_clean_contact := COALESCE(NULLIF(TRIM(p_contact_person), ''), 'Recruiter');
  v_clean_phone := COALESCE(NULLIF(TRIM(p_phone_number), ''), 'N/A');
  v_package := CASE 
    WHEN TRIM(p_selected_package) IN ('Starter', 'Growth', 'Enterprise') THEN TRIM(p_selected_package)
    ELSE 'Starter'
  END;

  IF v_clean_email IS NULL OR v_clean_email = '' THEN
    RAISE EXCEPTION 'A valid business email address is required.';
  END IF;

  IF p_password IS NULL OR length(p_password) < 6 THEN
    RAISE EXCEPTION 'Password must be at least 6 characters long.';
  END IF;

  -- B. Calculate contact tier limits
  IF v_package = 'Enterprise' THEN
    v_max_contacts := 99999;
  ELSIF v_package = 'Growth' THEN
    v_max_contacts := 25;
  ELSE
    v_max_contacts := 5;
  END IF;

  -- C. Check if user already exists in auth.users
  SELECT id INTO v_existing_user_id
  FROM auth.users
  WHERE email = v_clean_email;

  IF v_existing_user_id IS NOT NULL THEN
    -- Check if recruiter profile already exists
    SELECT * INTO v_recruiter_row
    FROM public.recruiters
    WHERE user_id = v_existing_user_id OR business_email = v_clean_email;

    IF v_recruiter_row.id IS NOT NULL THEN
      -- Profile already exists: update non-destructive fields
      UPDATE public.recruiters
      SET 
        company_name = v_clean_company,
        contact_person = v_clean_contact,
        phone_number = v_clean_phone,
        selected_package = v_package,
        max_contacts = v_max_contacts,
        updated_at = NOW()
      WHERE id = v_recruiter_row.id
      RETURNING * INTO v_recruiter_row;

      RETURN jsonb_build_object(
        'success', true,
        'is_new_user', false,
        'user_id', v_existing_user_id,
        'message', 'Account already exists. Profile synchronized.',
        'recruiter', row_to_json(v_recruiter_row)
      );
    ELSE
      -- Auth user exists but profile missing: create profile in same transaction
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
        v_existing_user_id,
        v_clean_company,
        v_clean_contact,
        v_clean_email,
        v_clean_phone,
        v_package,
        'pending_verification',
        0,
        v_max_contacts,
        NOW(),
        NOW()
      )
      RETURNING * INTO v_recruiter_row;

      RETURN jsonb_build_object(
        'success', true,
        'is_new_user', false,
        'user_id', v_existing_user_id,
        'message', 'Profile created for existing authentication record.',
        'recruiter', row_to_json(v_recruiter_row)
      );
    END IF;
  END IF;

  -- D. Generate new User ID and encrypt password with bcrypt
  v_user_id := gen_random_uuid();
  v_encrypted_pw := extensions.crypt(p_password, extensions.gen_salt('bf'));

  -- Step 1: Insert into auth.users (Transactional)
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_user_id,
    'authenticated',
    'authenticated',
    v_clean_email,
    v_encrypted_pw,
    NOW(), -- Pre-confirm email so recruiter can sign in immediately
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object(
      'role', 'recruiter',
      'company_name', v_clean_company,
      'contact_person', v_clean_contact,
      'phone_number', v_clean_phone,
      'subscribed_package', v_package
    ),
    NOW(),
    NOW(),
    encode(gen_random_bytes(32), 'hex'),
    encode(gen_random_bytes(32), 'hex')
  );

  -- Step 2: Insert into auth.identities (Required by GoTrue for email/password auth)
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  )
  VALUES (
    v_user_id,
    v_user_id,
    jsonb_build_object('sub', v_user_id::text, 'email', v_clean_email),
    'email',
    v_user_id::text,
    NOW(),
    NOW(),
    NOW()
  )
  ON CONFLICT (provider, provider_id) DO NOTHING;

  -- Step 3: Insert into public.recruiters (Simultaneous within the exact same transaction)
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
    v_user_id,
    v_clean_company,
    v_clean_contact,
    v_clean_email,
    v_clean_phone,
    v_package,
    'pending_verification',
    0,
    v_max_contacts,
    NOW(),
    NOW()
  )
  RETURNING * INTO v_recruiter_row;

  -- Return the complete atomic result
  RETURN jsonb_build_object(
    'success', true,
    'is_new_user', true,
    'user_id', v_user_id,
    'email', v_clean_email,
    'recruiter', row_to_json(v_recruiter_row)
  );

EXCEPTION WHEN OTHERS THEN
  -- Automatic transaction rollback on any exception guarantees 0 orphaned records
  RAISE;
END;
$$;

-- 5. Grant execute privileges
GRANT EXECUTE ON FUNCTION public.register_recruiter(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated, service_role;
