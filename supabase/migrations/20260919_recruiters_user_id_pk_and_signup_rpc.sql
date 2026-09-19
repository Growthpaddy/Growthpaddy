-- ==============================================================================
-- Migration: 20260919_recruiters_user_id_pk_and_signup_rpc.sql
-- Description:
-- 1. Creates the recruiters table with primary key `user_id` referencing auth.users(id).
-- 2. Configures RLS policies allowing authenticated recruiters to select & update their own records.
-- 3. Adds the signup_recruiter PostgreSQL function for atomic user creation and profile insertion.
-- ==============================================================================

-- 1. Ensure required cryptographic and UUID extensions are enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create public.recruiters table with primary key user_id referencing auth.users(id)
CREATE TABLE IF NOT EXISTS public.recruiters (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL DEFAULT 'Company Name',
  contact_person TEXT DEFAULT 'Recruiter',
  business_email TEXT NOT NULL UNIQUE,
  phone_number TEXT DEFAULT 'N/A',
  selected_package TEXT NOT NULL DEFAULT 'Starter',
  payment_status TEXT NOT NULL DEFAULT 'pending_verification',
  contacts_unlocked_count INT NOT NULL DEFAULT 0,
  max_contacts INT NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index lookup column
CREATE INDEX IF NOT EXISTS idx_recruiters_business_email ON public.recruiters(business_email);

-- 3. Row Level Security (RLS) Policies
ALTER TABLE public.recruiters ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies if re-running migration
DROP POLICY IF EXISTS "recruiters_select_own" ON public.recruiters;
DROP POLICY IF EXISTS "recruiters_update_own" ON public.recruiters;
DROP POLICY IF EXISTS "recruiters_insert_own" ON public.recruiters;

-- Allow authenticated recruiters to view only their own record
CREATE POLICY "recruiters_select_own"
ON public.recruiters
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow authenticated recruiters to update only their own record
CREATE POLICY "recruiters_update_own"
ON public.recruiters
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated recruiters to insert their own record
CREATE POLICY "recruiters_insert_own"
ON public.recruiters
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 4. PostgreSQL Function: signup_recruiter
-- Atomically creates the auth.users record, auth.identities record,
-- and inserts the profile into public.recruiters using user_id as primary key.
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
  -- Normalize parameters (supports both snake_case and camelCase keys)
  v_clean_email := LOWER(TRIM(COALESCE(NULLIF(email, ''), NULLIF("businessEmail", ''))));
  v_clean_company := COALESCE(NULLIF(TRIM(company_name), ''), NULLIF(TRIM("companyName"), ''), 'Company Name');
  v_clean_contact := COALESCE(NULLIF(TRIM(contact_person), ''), NULLIF(TRIM("contactPerson"), ''), 'Recruiter');
  v_clean_phone := COALESCE(NULLIF(TRIM(phone_number), ''), NULLIF(TRIM("phoneNumber"), ''), 'N/A');
  v_package := COALESCE(NULLIF(TRIM(selected_package), ''), NULLIF(TRIM("selectedPackage"), ''), 'Starter');

  IF v_package NOT IN ('Starter', 'Growth', 'Enterprise') THEN
    v_package := 'Starter';
  END IF;

  -- Granular input validation
  IF v_clean_email IS NULL OR v_clean_email = '' OR position('@' in v_clean_email) = 0 THEN
    RAISE EXCEPTION 'invalid_email: A valid business email address is required.' USING ERRCODE = '22023';
  END IF;

  IF password IS NULL OR length(password) < 6 THEN
    RAISE EXCEPTION 'weak_password: Password must be at least 6 characters long.' USING ERRCODE = '22023';
  END IF;

  -- Set contact quota based on selected tier
  IF v_package = 'Enterprise' THEN
    v_max_contacts := 99999;
  ELSIF v_package = 'Growth' THEN
    v_max_contacts := 25;
  ELSE
    v_max_contacts := 5;
  END IF;

  -- Check if user already exists in auth.users
  SELECT id INTO v_existing_user_id
  FROM auth.users
  WHERE auth.users.email = v_clean_email;

  IF v_existing_user_id IS NOT NULL THEN
    -- Check if recruiter profile already exists
    SELECT * INTO v_recruiter_row
    FROM public.recruiters
    WHERE user_id = v_existing_user_id OR business_email = v_clean_email;

    IF v_recruiter_row.user_id IS NOT NULL THEN
      RAISE EXCEPTION 'email_exists: An account with this email address already exists.' USING ERRCODE = '23505';
    ELSE
      v_user_id := v_existing_user_id;
    END IF;
  ELSE
    -- Step 1: Generate UUID and bcrypt hash for auth.users
    v_user_id := gen_random_uuid();
    v_encrypted_pw := extensions.crypt(password, extensions.gen_salt('bf'));

    -- Step 2: Atomic insert into auth.users
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

    -- Step 3: Atomic insert into auth.identities to support password login
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

  -- Set transaction auth context so auth.uid() reflects the generated user_id
  PERFORM set_config('request.jwt.claim.sub', v_user_id::text, true);

  -- Step 4: Atomic insertion into public.recruiters with user_id as PRIMARY KEY
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
    COALESCE(auth.uid(), v_user_id),
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

  -- Step 5: Return result object
  RETURN jsonb_build_object(
    'success', true,
    'user_id', COALESCE(auth.uid(), v_user_id),
    'email', v_clean_email,
    'recruiter', row_to_json(v_recruiter_row)
  );

EXCEPTION WHEN OTHERS THEN
  -- Automatically aborts and rolls back entire transaction
  RAISE;
END;
$$;

-- 5. Grant execute permissions to public/authenticated/service roles
GRANT EXECUTE ON FUNCTION public.signup_recruiter(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated, service_role;
