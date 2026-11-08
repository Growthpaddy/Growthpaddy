-- Public approved-founder directory and administrator-managed weekly highlights.
-- Public output intentionally excludes founder email, approval status and private metadata.

-- Extend the existing public view by appending public profile fields.
-- Existing columns remain in their original order for CREATE OR REPLACE compatibility.
CREATE OR REPLACE VIEW public.founder_profiles_public
WITH (security_barrier = true)
AS
SELECT
  id,
  full_name,
  business_name,
  website,
  headline,
  bio,
  avatar_url,
  slug,
  location
FROM public.founder_profiles
WHERE profile_status = 'approved';

GRANT SELECT ON public.founder_profiles_public TO anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.founder_profiles_public FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS public.founder_weekly_features (
  week_start DATE NOT NULL,
  slot SMALLINT NOT NULL CHECK (slot IN (1, 2)),
  founder_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT pg_catalog.now(),
  PRIMARY KEY (week_start, slot),
  UNIQUE (week_start, founder_id)
);

CREATE INDEX IF NOT EXISTS idx_founder_weekly_features_founder
  ON public.founder_weekly_features(founder_id);

ALTER TABLE public.founder_weekly_features ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS founder_weekly_features_read_current_week ON public.founder_weekly_features;
CREATE POLICY founder_weekly_features_read_current_week
  ON public.founder_weekly_features
  FOR SELECT
  TO anon, authenticated
  USING (
    week_start = pg_catalog.date_trunc(
      'week',
      pg_catalog.timezone('Africa/Lagos', pg_catalog.now())
    )::date
  );

REVOKE ALL ON public.founder_weekly_features FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.founder_weekly_features TO anon, authenticated;
GRANT ALL ON public.founder_weekly_features TO service_role;

CREATE OR REPLACE VIEW public.founder_weekly_features_public
WITH (security_barrier = true)
AS
SELECT
  feature.week_start,
  feature.slot,
  profile.id,
  profile.full_name,
  profile.business_name,
  profile.website,
  profile.headline,
  profile.bio,
  profile.avatar_url,
  profile.slug,
  profile.location
FROM public.founder_weekly_features AS feature
JOIN public.founder_profiles_public AS profile
  ON profile.id = feature.founder_id
WHERE feature.week_start = pg_catalog.date_trunc(
  'week',
  pg_catalog.timezone('Africa/Lagos', pg_catalog.now())
)::date;

GRANT SELECT ON public.founder_weekly_features_public TO anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.founder_weekly_features_public FROM PUBLIC, anon, authenticated;

-- A single controlled operation replaces both weekly slots atomically.
CREATE OR REPLACE FUNCTION public.set_founder_weekly_features(
  p_first_founder_id UUID,
  p_second_founder_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_week_start DATE := pg_catalog.date_trunc(
    'week',
    pg_catalog.timezone('Africa/Lagos', pg_catalog.now())
  )::date;
  v_approved_count INTEGER;
BEGIN
  IF NOT public.is_active_admin() THEN
    RAISE EXCEPTION 'Only active administrators can manage weekly founder highlights'
      USING ERRCODE = '42501';
  END IF;

  IF p_first_founder_id IS NULL
     OR p_second_founder_id IS NULL
     OR p_first_founder_id = p_second_founder_id THEN
    RAISE EXCEPTION 'Select two different founders'
      USING ERRCODE = '22023';
  END IF;

  SELECT count(*)::integer
    INTO v_approved_count
  FROM public.founder_profiles
  WHERE id IN (p_first_founder_id, p_second_founder_id)
    AND profile_status = 'approved';

  IF v_approved_count <> 2 THEN
    RAISE EXCEPTION 'Both selected accounts must be approved founders'
      USING ERRCODE = '22023';
  END IF;

  DELETE FROM public.founder_weekly_features
  WHERE week_start = v_week_start;

  INSERT INTO public.founder_weekly_features (week_start, slot, founder_id, created_by)
  VALUES
    (v_week_start, 1, p_first_founder_id, auth.uid()),
    (v_week_start, 2, p_second_founder_id, auth.uid());
END;
$$;

REVOKE ALL ON FUNCTION public.set_founder_weekly_features(UUID, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_founder_weekly_features(UUID, UUID) TO authenticated;

NOTIFY pgrst, 'reload schema';
