-- Enforce founder article approval in the database, not only in the UI.
-- Stop new profiles/media records from inheriting invented location, channel, duration or recording-date values.
ALTER TABLE public.founder_profiles ALTER COLUMN location DROP DEFAULT;
ALTER TABLE public.founder_articles ALTER COLUMN reading_time_minutes DROP DEFAULT;
ALTER TABLE public.founder_podcasts ALTER COLUMN channel_name DROP DEFAULT;
ALTER TABLE public.founder_podcasts ALTER COLUMN duration_display DROP DEFAULT;
ALTER TABLE public.founder_podcasts ALTER COLUMN duration_display DROP NOT NULL;
ALTER TABLE public.founder_podcasts ALTER COLUMN recorded_at DROP DEFAULT;
ALTER TABLE public.founder_podcasts ALTER COLUMN recorded_at DROP NOT NULL;

-- Founders can save drafts and submit pending_review records. Only active admins
-- and trusted service-role operations may publish articles.

CREATE OR REPLACE FUNCTION public.enforce_founder_article_review_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  privileged_actor BOOLEAN := (
    COALESCE(auth.role(), '') = 'service_role'
    OR COALESCE(public.is_active_admin(), FALSE)
  );
  published_content_changed BOOLEAN := FALSE;
BEGIN
  IF privileged_actor THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'published' THEN
      RAISE EXCEPTION 'Founder articles must be submitted for review before publication.'
        USING ERRCODE = '42501';
    END IF;
    RETURN NEW;
  END IF;

  published_content_changed :=
    NEW.title IS DISTINCT FROM OLD.title
    OR NEW.slug IS DISTINCT FROM OLD.slug
    OR NEW.excerpt IS DISTINCT FROM OLD.excerpt
    OR NEW.content IS DISTINCT FROM OLD.content
    OR NEW.cover_image_url IS DISTINCT FROM OLD.cover_image_url
    OR NEW.reading_time_minutes IS DISTINCT FROM OLD.reading_time_minutes;

  IF OLD.status = 'published' AND published_content_changed AND NEW.status = 'published' THEN
    NEW.status := 'pending_review';
    NEW.published_at := NULL;
  ELSIF NEW.status = 'published' AND OLD.status IS DISTINCT FROM 'published' THEN
    RAISE EXCEPTION 'Founder articles must be submitted for review before publication.'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_founder_article_review_status ON public.founder_articles;
CREATE TRIGGER trg_enforce_founder_article_review_status
BEFORE INSERT OR UPDATE ON public.founder_articles
FOR EACH ROW
EXECUTE FUNCTION public.enforce_founder_article_review_status();
