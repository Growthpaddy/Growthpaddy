-- ==============================================================================
-- Migration: 20261106180000_founder_productivity_modules.sql
-- Description:
--   Comprehensive database foundation for the Digital Campux Founder Dashboard:
--   1. Extensions on public.founder_profiles (headline, bio, avatar_url, slug, location, linkedin_url, twitter_url)
--   2. Articles module: public.founder_articles with RLS and view counter
--   3. Podcasts module: public.founder_podcasts with embed support
--   4. Daily planner & OKRs: public.founder_daily_goals, public.founder_tasks, public.founder_objectives, public.founder_key_results
--   5. Distractions catalog and active daily selections: public.founder_distraction_catalog, public.founder_distraction_selections
--   6. Appointments: public.founder_appointments
-- ==============================================================================

-- 1. Ensure extensions exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Extend founder_profiles if additional columns are missing
ALTER TABLE public.founder_profiles
  ADD COLUMN IF NOT EXISTS headline TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'Lagos, Nigeria',
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS twitter_url TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_founder_profiles_slug ON public.founder_profiles(slug) WHERE slug IS NOT NULL;

-- 3. Articles Table
CREATE TABLE IF NOT EXISTS public.founder_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  reading_time_minutes INT NOT NULL DEFAULT 5,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'published', 'archived')),
  views_count INT NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_founder_articles_founder_id ON public.founder_articles(founder_id);
CREATE INDEX IF NOT EXISTS idx_founder_articles_status ON public.founder_articles(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_founder_articles_slug ON public.founder_articles(slug);

ALTER TABLE public.founder_articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "founder_articles_select_published_or_own" ON public.founder_articles;
CREATE POLICY "founder_articles_select_published_or_own"
  ON public.founder_articles
  FOR SELECT
  TO public
  USING (
    status = 'published'
    OR (auth.role() = 'authenticated' AND (auth.uid() = founder_id OR public.is_active_admin()))
  );

DROP POLICY IF EXISTS "founder_articles_insert_own" ON public.founder_articles;
CREATE POLICY "founder_articles_insert_own"
  ON public.founder_articles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = founder_id OR public.is_active_admin());

DROP POLICY IF EXISTS "founder_articles_update_own" ON public.founder_articles;
CREATE POLICY "founder_articles_update_own"
  ON public.founder_articles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = founder_id OR public.is_active_admin())
  WITH CHECK (auth.uid() = founder_id OR public.is_active_admin());

DROP POLICY IF EXISTS "founder_articles_delete_own" ON public.founder_articles;
CREATE POLICY "founder_articles_delete_own"
  ON public.founder_articles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = founder_id OR public.is_active_admin());

-- 4. Podcasts Table
CREATE TABLE IF NOT EXISTS public.founder_podcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  channel_name TEXT NOT NULL DEFAULT 'Digital Campux Stories',
  video_url TEXT NOT NULL,
  embed_url TEXT,
  duration_display TEXT NOT NULL DEFAULT '45:00',
  thumbnail_url TEXT,
  recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_founder_podcasts_founder_id ON public.founder_podcasts(founder_id);

ALTER TABLE public.founder_podcasts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "founder_podcasts_select" ON public.founder_podcasts;
CREATE POLICY "founder_podcasts_select"
  ON public.founder_podcasts
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "founder_podcasts_insert_own" ON public.founder_podcasts;
CREATE POLICY "founder_podcasts_insert_own"
  ON public.founder_podcasts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = founder_id OR public.is_active_admin());

DROP POLICY IF EXISTS "founder_podcasts_update_own" ON public.founder_podcasts;
CREATE POLICY "founder_podcasts_update_own"
  ON public.founder_podcasts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = founder_id OR public.is_active_admin());

DROP POLICY IF EXISTS "founder_podcasts_delete_own" ON public.founder_podcasts;
CREATE POLICY "founder_podcasts_delete_own"
  ON public.founder_podcasts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = founder_id OR public.is_active_admin());

-- 5. Planner: Daily Goals Table
CREATE TABLE IF NOT EXISTS public.founder_daily_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
  goal_date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT NOT NULL,
  benchmark_percent INT NOT NULL DEFAULT 80,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_founder_daily_goals_founder_date UNIQUE (founder_id, goal_date)
);

CREATE INDEX IF NOT EXISTS idx_founder_daily_goals_founder_date ON public.founder_daily_goals(founder_id, goal_date);

ALTER TABLE public.founder_daily_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "founder_daily_goals_owner" ON public.founder_daily_goals;
CREATE POLICY "founder_daily_goals_owner"
  ON public.founder_daily_goals
  FOR ALL
  TO authenticated
  USING (auth.uid() = founder_id OR public.is_active_admin())
  WITH CHECK (auth.uid() = founder_id OR public.is_active_admin());

-- 6. Planner: Daily Tasks Table
CREATE TABLE IF NOT EXISTS public.founder_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
  task_date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  estimated_minutes INT NOT NULL DEFAULT 30,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_founder_tasks_founder_date ON public.founder_tasks(founder_id, task_date);

ALTER TABLE public.founder_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "founder_tasks_owner" ON public.founder_tasks;
CREATE POLICY "founder_tasks_owner"
  ON public.founder_tasks
  FOR ALL
  TO authenticated
  USING (auth.uid() = founder_id OR public.is_active_admin())
  WITH CHECK (auth.uid() = founder_id OR public.is_active_admin());

-- 7. Distraction Catalog Table
CREATE TABLE IF NOT EXISTS public.founder_distraction_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'Digital',
  icon TEXT NOT NULL DEFAULT '📱',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.founder_distraction_catalog ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "founder_distraction_catalog_read" ON public.founder_distraction_catalog;
CREATE POLICY "founder_distraction_catalog_read"
  ON public.founder_distraction_catalog
  FOR SELECT
  TO public
  USING (true);

-- Seed Distraction Catalog with default items
INSERT INTO public.founder_distraction_catalog (name, category, icon, description)
VALUES
  ('Excessive phone use', 'Digital', '📱', 'Mindless phone checking and non-critical screen time'),
  ('Social media scrolling', 'Digital', '📸', 'Endless browsing on Twitter, Instagram, or TikTok during focus blocks'),
  ('Oversleeping', 'Habits', '😴', 'Sleeping past your intended morning start time and losing prime work hours'),
  ('Unnecessary conversations', 'Social', '💬', 'Distracting chats and calls that disrupt deep execution'),
  ('Context switching between apps', 'Productivity', '🔄', 'Jumping between slack, email, and tabs without finishing single tasks'),
  ('Premature optimization', 'Mindset', '⚙️', 'Over-engineering solutions before proving core customer demand'),
  ('Passive consumption of podcasts', 'Mindset', '🎧', 'Consuming content to feel productive instead of taking real action')
ON CONFLICT (name) DO NOTHING;

-- 8. Founder Distraction Selections Table
CREATE TABLE IF NOT EXISTS public.founder_distraction_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
  catalog_id UUID REFERENCES public.founder_distraction_catalog(id) ON DELETE SET NULL,
  custom_name TEXT,
  icon TEXT NOT NULL DEFAULT '🛡️',
  is_active_today BOOLEAN NOT NULL DEFAULT true,
  selection_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_founder_distractions_founder_date ON public.founder_distraction_selections(founder_id, selection_date);

ALTER TABLE public.founder_distraction_selections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "founder_distractions_owner" ON public.founder_distraction_selections;
CREATE POLICY "founder_distractions_owner"
  ON public.founder_distraction_selections
  FOR ALL
  TO authenticated
  USING (auth.uid() = founder_id OR public.is_active_admin())
  WITH CHECK (auth.uid() = founder_id OR public.is_active_admin());

-- 9. Appointments Table
CREATE TABLE IF NOT EXISTS public.founder_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  attendee_name TEXT NOT NULL,
  attendee_email TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  meeting_url TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_founder_appointments_founder ON public.founder_appointments(founder_id, start_time);

ALTER TABLE public.founder_appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "founder_appointments_owner" ON public.founder_appointments;
CREATE POLICY "founder_appointments_owner"
  ON public.founder_appointments
  FOR ALL
  TO authenticated
  USING (auth.uid() = founder_id OR public.is_active_admin())
  WITH CHECK (auth.uid() = founder_id OR public.is_active_admin());

-- 10. Planner: Monthly Objectives & Key Results (OKRs)
CREATE TABLE IF NOT EXISTS public.founder_objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  quarter_or_month TEXT NOT NULL,
  year INT NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  progress_percent INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.founder_key_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  objective_id UUID NOT NULL REFERENCES public.founder_objectives(id) ON DELETE CASCADE,
  founder_id UUID NOT NULL REFERENCES public.founder_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_value NUMERIC NOT NULL DEFAULT 100,
  current_value NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT '%',
  weight INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.founder_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founder_key_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "founder_objectives_owner" ON public.founder_objectives;
CREATE POLICY "founder_objectives_owner"
  ON public.founder_objectives
  FOR ALL
  TO authenticated
  USING (auth.uid() = founder_id OR public.is_active_admin())
  WITH CHECK (auth.uid() = founder_id OR public.is_active_admin());

DROP POLICY IF EXISTS "founder_key_results_owner" ON public.founder_key_results;
CREATE POLICY "founder_key_results_owner"
  ON public.founder_key_results
  FOR ALL
  TO authenticated
  USING (auth.uid() = founder_id OR public.is_active_admin())
  WITH CHECK (auth.uid() = founder_id OR public.is_active_admin());

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.founder_articles TO authenticated;
GRANT SELECT ON public.founder_articles TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.founder_podcasts TO authenticated;
GRANT SELECT ON public.founder_podcasts TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.founder_daily_goals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.founder_tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.founder_distraction_selections TO authenticated;
GRANT SELECT ON public.founder_distraction_catalog TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.founder_appointments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.founder_objectives TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.founder_key_results TO authenticated;
