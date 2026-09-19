-- ==============================================================================
-- Migration: 20260919_recruiter_status_and_suspension.sql
-- Description: Adds is_suspended column to recruiters table, updates status check
-- constraints, and creates helper RPC for recruiter administration.
-- ==============================================================================

-- 1. Ensure is_suspended column exists on public.recruiters
ALTER TABLE public.recruiters 
  ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Expand or drop restrictive check constraint on payment_status
ALTER TABLE public.recruiters 
  DROP CONSTRAINT IF EXISTS recruiters_payment_status_check;

ALTER TABLE public.recruiters 
  ADD CONSTRAINT recruiters_payment_status_check 
  CHECK (payment_status IN ('pending_verification', 'verified', 'rejected', 'disapproved', 'approved'));

-- 3. Create index on is_suspended
CREATE INDEX IF NOT EXISTS idx_recruiters_is_suspended ON public.recruiters(is_suspended);
CREATE INDEX IF NOT EXISTS idx_recruiters_payment_status ON public.recruiters(payment_status);

-- 4. Helper function to update recruiter admin status with full privileges
CREATE OR REPLACE FUNCTION public.admin_set_recruiter_status(
  p_recruiter_id UUID,
  p_action TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_recruiter RECORD;
  v_new_payment_status TEXT;
  v_is_suspended BOOLEAN;
  v_max_contacts INT;
BEGIN
  SELECT * INTO v_recruiter FROM public.recruiters WHERE id = p_recruiter_id OR user_id = p_recruiter_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Recruiter not found');
  END IF;

  IF p_action = 'approve' THEN
    v_new_payment_status := 'verified';
    v_is_suspended := FALSE;
    v_max_contacts := CASE 
      WHEN v_recruiter.selected_package IN ('Enterprise', 'annual_unlimited') THEN 99999
      WHEN v_recruiter.selected_package = 'Growth' THEN 25
      ELSE 5
    END;

    UPDATE public.recruiters
    SET payment_status = v_new_payment_status,
        is_suspended = v_is_suspended,
        max_contacts = v_max_contacts,
        updated_at = NOW()
    WHERE id = v_recruiter.id;

  ELSIF p_action = 'disapprove' THEN
    v_new_payment_status := 'rejected';
    
    UPDATE public.recruiters
    SET payment_status = v_new_payment_status,
        updated_at = NOW()
    WHERE id = v_recruiter.id;

  ELSIF p_action = 'suspend' THEN
    UPDATE public.recruiters
    SET is_suspended = TRUE,
        updated_at = NOW()
    WHERE id = v_recruiter.id;

  ELSIF p_action = 'restore' THEN
    UPDATE public.recruiters
    SET is_suspended = FALSE,
        updated_at = NOW()
    WHERE id = v_recruiter.id;

  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Invalid action');
  END IF;

  RETURN jsonb_build_object('success', true, 'action', p_action, 'recruiter_id', v_recruiter.id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_set_recruiter_status(UUID, TEXT) TO authenticated, service_role, anon;
