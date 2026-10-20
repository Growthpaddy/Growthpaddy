-- Migration: Create founder_applications table for Digital Campux Founder Community
-- Created: 2026-10-19

CREATE TABLE IF NOT EXISTS public.founder_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  location TEXT NOT NULL,
  business_name TEXT NOT NULL,
  founder_stage TEXT NOT NULL,
  industry TEXT,
  website_or_social_url TEXT,
  business_description TEXT,
  founder_story TEXT,
  biggest_challenge TEXT,
  visibility_goal TEXT,
  interview_interest BOOLEAN DEFAULT true,
  whatsapp_opt_in BOOLEAN DEFAULT true,
  publication_consent BOOLEAN DEFAULT false,
  application_status TEXT DEFAULT 'pending_review' CHECK (application_status IN ('pending_review', 'under_review', 'shortlisted', 'invited_to_interview', 'archived')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for efficient lookup
CREATE INDEX IF NOT EXISTS idx_founder_applications_email ON public.founder_applications(email);
CREATE INDEX IF NOT EXISTS idx_founder_applications_status ON public.founder_applications(application_status);
CREATE INDEX IF NOT EXISTS idx_founder_applications_created ON public.founder_applications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.founder_applications ENABLE ROW LEVEL SECURITY;

-- Allow anonymous visitors to submit founder applications
CREATE POLICY "Allow public insert to founder_applications"
  ON public.founder_applications
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow authenticated admins to view and manage all applications
CREATE POLICY "Allow admin full access to founder_applications"
  ON public.founder_applications
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
