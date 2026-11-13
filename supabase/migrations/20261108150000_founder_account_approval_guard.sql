-- Digital Campux / Growthpaddy
-- Ensure founder account status can only be changed by an active administrator.
-- Founder owners may continue updating their own profile details, but cannot
-- approve, reject, or suspend their own account.

BEGIN;

CREATE OR REPLACE FUNCTION public.prevent_founder_self_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $function$
BEGIN
  IF auth.uid() IS NOT NULL
     AND auth.uid() = OLD.id
     AND NOT public.is_active_admin()
     AND NEW.profile_status IS DISTINCT FROM OLD.profile_status THEN
    RAISE EXCEPTION
      'Only an active platform administrator can change founder account status.'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_prevent_founder_self_status_change
ON public.founder_profiles;

CREATE TRIGGER trg_prevent_founder_self_status_change
BEFORE UPDATE OF profile_status
ON public.founder_profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_founder_self_status_change();

COMMIT;
