-- ==============================================================================
-- Migration: 20260919_fix_auth_users_and_gotrue_schema.sql
-- Description:
-- Fixes "500: Database error querying schema" in Supabase GoTrue Auth service:
-- 1. Updates all NULL token/string columns in auth.users to '' (empty string),
--    which GoTrue requires when scanning user records.
-- 2. Creates a BEFORE INSERT OR UPDATE trigger on auth.users ensuring tokens are never NULL.
-- 3. Updates signup_recruiter to provide complete non-null columns for auth.users.
-- 4. Exposes an RPC public.repair_auth_users_schema() to safely maintain auth integrity.
-- ==============================================================================

-- 1. Ensure extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Immediate repair of all existing rows in auth.users
-- GoTrue's internal database scanner in Go throws "Database error querying schema"
-- whenever any of these string columns contain NULL instead of ''
DO $$
BEGIN
  UPDATE auth.users
  SET
    confirmation_token = COALESCE(confirmation_token, ''),
    recovery_token = COALESCE(recovery_token, ''),
    email_change_token_new = COALESCE(email_change_token_new, ''),
    email_change = COALESCE(email_change, ''),
    email_change_token_current = COALESCE(email_change_token_current, ''),
    phone_change = COALESCE(phone_change, ''),
    phone_change_token = COALESCE(phone_change_token, ''),
    reauthentication_token = COALESCE(reauthentication_token, ''),
    aud = COALESCE(NULLIF(aud, ''), 'authenticated'),
    role = COALESCE(NULLIF(role, ''), 'authenticated'),
    is_super_admin = COALESCE(is_super_admin, FALSE);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'auth.users repair notice: %', SQLERRM;
END $$;

-- 3. Trigger Function: Prevent NULL values in GoTrue token fields on any future insert/update
CREATE OR REPLACE FUNCTION public.sanitize_auth_user_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.confirmation_token := COALESCE(NEW.confirmation_token, '');
  NEW.recovery_token := COALESCE(NEW.recovery_token, '');
  NEW.email_change_token_new := COALESCE(NEW.email_change_token_new, '');
  NEW.email_change := COALESCE(NEW.email_change, '');
  NEW.email_change_token_current := COALESCE(NEW.email_change_token_current, '');
  NEW.phone_change := COALESCE(NEW.phone_change, '');
  NEW.phone_change_token := COALESCE(NEW.phone_change_token, '');
  NEW.reauthentication_token := COALESCE(NEW.reauthentication_token, '');
  NEW.aud := COALESCE(NULLIF(NEW.aud, ''), 'authenticated');
  NEW.role := COALESCE(NULLIF(NEW.role, ''), 'authenticated');
  NEW.is_super_admin := COALESCE(NEW.is_super_admin, FALSE);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_sanitize_auth_user_columns ON auth.users;
CREATE TRIGGER tr_sanitize_auth_user_columns
BEFORE INSERT OR UPDATE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.sanitize_auth_user_columns();

-- 4. Expose RPC to repair auth schema safely on demand
CREATE OR REPLACE FUNCTION public.repair_auth_users_schema()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_updated_count INT := 0;
BEGIN
  UPDATE auth.users
  SET
    confirmation_token = COALESCE(confirmation_token, ''),
    recovery_token = COALESCE(recovery_token, ''),
    email_change_token_new = COALESCE(email_change_token_new, ''),
    email_change = COALESCE(email_change, ''),
    email_change_token_current = COALESCE(email_change_token_current, ''),
    phone_change = COALESCE(phone_change, ''),
    phone_change_token = COALESCE(phone_change_token, ''),
    reauthentication_token = COALESCE(reauthentication_token, ''),
    aud = COALESCE(NULLIF(aud, ''), 'authenticated'),
    role = COALESCE(NULLIF(role, ''), 'authenticated'),
    is_super_admin = COALESCE(is_super_admin, FALSE);

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'auth.users schema tokens normalized successfully.',
    'rows_affected', v_updated_count
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.repair_auth_users_schema() TO anon, authenticated, service_role;

-- 5. Updated signup_recruiter function providing 100% compliant GoTrue columns
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
  -- Normalize parameters
  v_clean_email := LOWER(TRIM(COALESCE(NULLIF(email, ''), NULLIF("businessEmail", ''))));
  v_clean_company := COALESCE(NULLIF(TRIM(company_name), ''), NULLIF(TRIM("companyName"), ''), 'Company Name');
  v_clean_contact := COALESCE(NULLIF(TRIM(contact_person), ''), NULLIF(TRIM("contactPerson"), ''), 'Recruiter');
  v_clean_phone := COALESCE(NULLIF(TRIM(phone_number), ''), NULLIF(TRIM("phoneNumber"), ''), 'N/A');
  v_package := COALESCE(NULLIF(TRIM(selected_package), ''), NULLIF(TRIM("selectedPackage"), ''), 'Starter');

  IF v_package NOT IN ('Starter', 'Growth', 'Enterprise') THEN
    v_package := 'Starter';
  END IF;

  IF v_clean_email IS NULL OR v_clean_email = '' OR position('@' in v_clean_email) = 0 THEN
    RAISE EXCEPTION 'invalid_email: A valid business email address is required.' USING ERRCODE = '22023';
  END IF;

  IF password IS NULL OR length(password) < 6 THEN
    RAISE EXCEPTION 'weak_password: Password must be at least 6 characters long.' USING ERRCODE = '22023';
  END IF;

  IF v_package = 'Enterprise' THEN
    v_max_contacts := 99999;
  ELSIF v_package = 'Growth' THEN
    v_max_contacts := 25;
  ELSE
    v_max_contacts := 5;
  END IF;

  -- Check existing user
  SELECT id INTO v_existing_user_id
  FROM auth.users
  WHERE auth.users.email = v_clean_email;

  IF v_existing_user_id IS NOT NULL THEN
    v_user_id := v_existing_user_id;
    -- Update password if needed
    v_encrypted_pw := extensions.crypt(password, extensions.gen_salt('bf'));
    UPDATE auth.users
    SET
      encrypted_password = v_encrypted_pw,
      updated_at = NOW(),
      confirmation_token = COALESCE(confirmation_token, ''),
      recovery_token = COALESCE(recovery_token, ''),
      email_change_token_new = COALESCE(email_change_token_new, ''),
      email_change = COALESCE(email_change, ''),
      email_change_token_current = COALESCE(email_change_token_current, ''),
      phone_change = COALESCE(phone_change, ''),
      phone_change_token = COALESCE(phone_change_token, ''),
      reauthentication_token = COALESCE(reauthentication_token, '')
    WHERE id = v_user_id;
  ELSE
    v_user_id := gen_random_uuid();
    v_encrypted_pw := extensions.crypt(password, extensions.gen_salt('bf'));

    -- Complete GoTrue compliant insert
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
      recovery_token,
      email_change_token_new,
      email_change,
      email_change_token_current,
      phone_change,
      phone_change_token,
      reauthentication_token,
      is_super_admin
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
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      FALSE
    );

    -- Insert identity for password authentication
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

  -- Ensure public.recruiters row exists with primary key user_id
  PERFORM set_config('request.jwt.claim.sub', v_user_id::text, true);

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
  ON CONFLICT (user_id) DO UPDATE SET
    company_name = EXCLUDED.company_name,
    contact_person = EXCLUDED.contact_person,
    phone_number = EXCLUDED.phone_number,
    selected_package = EXCLUDED.selected_package,
    max_contacts = EXCLUDED.max_contacts,
    updated_at = NOW()
  RETURNING * INTO v_recruiter_row;

  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'email', v_clean_email,
    'recruiter', row_to_json(v_recruiter_row)
  );

EXCEPTION WHEN OTHERS THEN
  RAISE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.signup_recruiter(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated, service_role;
