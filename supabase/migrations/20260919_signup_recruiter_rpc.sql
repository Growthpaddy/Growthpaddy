-- ==============================================================================
-- Migration: 20260919_signup_recruiter_rpc.sql
-- Description: Creates the public.recruiters table if not exists with primary key
-- and foreign key constraints to auth.users, configures strict Row Level Security
-- (RLS) policies allowing authenticated recruiters to view and update only their
-- own profile data, and defines the atomic signup_recruiter PostgreSQL function
-- that creates the user in auth.users and uses auth.uid() to capture the generated ID.
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create public.recruiters Table (if not exists)
CREATE TABLE IF NOT EXISTS public.recruiters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL DEFAULT 'Company Name',
  contact_person TEXT DEFAULT 'Recruiter',
  business_email TEXT NOT NULL,
  phone_number TEXT DEFAULT 'N/A',
  selected_package TEXT NOT NULL DEFAULT 'Starter',
  payment_status TEXT NOT NULL DEFAULT 'pending_verification',
  contacts_unlocked_count INT NOT NULL DEFAULT 0,
  max_contacts INT NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_recruiters_user_id UNIQUE (user_id),
  CONSTRAINT unique_recruiters_business_email UNIQUE (business_email)
);

-- Ensure Constraints Exist If Table Was Created Previously
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

-- 3. Row Level Security (RLS) Policies
-- Allow authenticated recruiters to view and update only their own profile data.
ALTER TABLE public.recruiters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "recruiters_select_policy" ON public.recruiters;
DROP POLICY IF EXISTS "recruiters_insert_policy" ON public.recruiters;
DROP POLICY IF EXISTS "recruiters_update_policy" ON public.recruiters;
DROP POLICY IF EXISTS "recruiters_select_own_profile" ON public.recruiters;
DROP POLICY IF EXISTS "recruiters_update_own_profile" ON public.recruiters;
DROP POLICY IF EXISTS "recruiters_insert_own_profile" ON public.recruiters;

-- RLS Policy 1: Authenticated recruiters can view only their own profile data
CREATE POLICY "recruiters_select_own_profile"
ON public.recruiters
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policy 2: Authenticated recruiters can update only their own profile data
CREATE POLICY "recruiters_update_own_profile"
ON public.recruiters
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policy 3: Allow authenticated recruiters to insert their own profile
CREATE POLICY "recruiters_insert_own_profile"
ON public.recruiters
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 4. Atomic PostgreSQL RPC Function: signup_recruiter
-- Accepts registration parameters, creates the user in auth.users,
-- and performs an atomic insertion into public.recruiters using auth.uid() to capture the generated ID.
CREATE OR REPLACE FUNCTION public.signup_recruiter(
  email TEXT DEFAULT NULL,
  password TEXT DEFAULT NULL,
  company_name TEXT DEFAULT NULL,
  contact_person TEXT DEFAULT NULL,
  phone_number TEXT DEFAULT NULL,
  selected_package TEXT DEFAULT 'Starter',
  "businessEmail" TEXT DEFAULT NULL,
  "companyName" TEXT DEFAULT NULL,
  "contactPerson" TEXT DEFAULT NULL,
  "phoneNumber" TEXT DEFAULT NULL,
  "selectedPackage" TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_user_id UUID;
  v_captured_uid UUID;
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
  -- A. Normalize inputs (accepts both snake_case and camelCase parameters)
  v_clean_email := LOWER(TRIM(COALESCE(NULLIF(email, ''), NULLIF("businessEmail", ''))));
  v_clean_company := COALESCE(NULLIF(TRIM(company_name), ''), NULLIF(TRIM("companyName"), ''), 'Company Name');
  v_clean_contact := COALESCE(NULLIF(TRIM(contact_person), ''), NULLIF(TRIM("contactPerson"), ''), 'Recruiter');
  v_clean_phone := COALESCE(NULLIF(TRIM(phone_number), ''), NULLIF(TRIM("phoneNumber"), ''), 'N/A');
  v_package := COALESCE(NULLIF(TRIM(selected_package), ''), NULLIF(TRIM("selectedPackage"), ''), 'Starter');

  IF v_package NOT IN ('Starter', 'Growth', 'Enterprise') THEN
    v_package := 'Starter';
  END IF;

  -- B. Validation with granular error codes
  IF v_clean_email IS NULL OR v_clean_email = '' OR position('@' in v_clean_email) = 0 THEN
    RAISE EXCEPTION 'invalid_email: A valid business email address is required.' USING ERRCODE = '22023';
  END IF;

  IF password IS NULL OR length(password) < 6 THEN
    RAISE EXCEPTION 'weak_password: Password must be at least 6 characters long.' USING ERRCODE = '22023';
  END IF;

  -- C. Determine contact limits
  IF v_package = 'Enterprise' THEN
    v_max_contacts := 99999;
  ELSIF v_package = 'Growth' THEN
    v_max_contacts := 25;
  ELSE
    v_max_contacts := 5;
  END IF;

  -- D. Check for existing user in auth.users
  SELECT id INTO v_existing_user_id
  FROM auth.users
  WHERE auth.users.email = v_clean_email;

  IF v_existing_user_id IS NOT NULL THEN
    -- Check if recruiter profile already exists
    SELECT * INTO v_recruiter_row
    FROM public.recruiters
    WHERE user_id = v_existing_user_id OR business_email = v_clean_email;

    IF v_recruiter_row.id IS NOT NULL THEN
      RAISE EXCEPTION 'email_exists: An account with this email address already exists.' USING ERRCODE = '23505';
    ELSE
      v_user_id := v_existing_user_id;
    END IF;
  ELSE
    -- Step 1: Generate UUID and bcrypt hash for new user
    v_user_id := gen_random_uuid();
    v_encrypted_pw := extensions.crypt(password, extensions.gen_salt('bf'));

    -- Step 2: Insert into auth.users (Atomic Transaction Step 1)
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
      NOW(),
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

    -- Step 3: Insert into auth.identities (Enables GoTrue password login)
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
  END IF;

  -- Set session setting so auth.uid() reflects the generated user ID in this transaction
  PERFORM set_config('request.jwt.claim.sub', v_user_id::text, true);

  -- Capture generated ID via auth.uid()
  v_captured_uid := COALESCE(auth.uid(), v_user_id);

  -- Step 4: Atomic insertion into public.recruiters using the captured auth.uid()
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
    v_captured_uid, -- Captured via auth.uid()
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
  ON CONFLICT (user_id) DO UPDATE SET
    company_name = EXCLUDED.company_name,
    contact_person = EXCLUDED.contact_person,
    phone_number = EXCLUDED.phone_number,
    selected_package = EXCLUDED.selected_package,
    max_contacts = EXCLUDED.max_contacts,
    updated_at = NOW()
  RETURNING * INTO v_recruiter_row;

  -- Return atomic result
  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_captured_uid,
    'email', v_clean_email,
    'recruiter', row_to_json(v_recruiter_row)
  );

EXCEPTION WHEN OTHERS THEN
  -- Automatically rolls back all operations
  RAISE;
END;
$$;

-- 5. Grant execute permissions
GRANT EXECUTE ON FUNCTION public.signup_recruiter(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated, service_role;
