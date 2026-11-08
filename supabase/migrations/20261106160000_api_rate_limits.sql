-- ==============================================================================
-- Migration: 20261106160000_api_rate_limits.sql
-- Description:
--   Production-Grade Distributed PostgreSQL Rate Limiting for Digital Campux Platform:
--   1. Shared counter table public.api_rate_limits with explicit window_start and window_end
--   2. Genuinely atomic check_rate_limit RPC using transaction-level advisory locking
--      (pg_advisory_xact_lock) to eliminate duplicate-key race conditions on new buckets
--   3. Precise 4-state transition logic:
--      - Expired window (resets)
--      - Active window, active cooldown (blocked by cooldown)
--      - Expired cooldown, still-active window (remains exhausted until window_end)
--      - Active window, under/at limit (increments or enters cooldown without GREATEST override)
--   4. Bounded cleanup routine (prune_expired_rate_limits) with FOR UPDATE SKIP LOCKED
--      Strict dual condition: window_end <= now() AND (blocked_until IS NULL OR blocked_until <= now())
--   5. Least-privilege grants (revoked from PUBLIC, anon, authenticated; service_role only)
-- ==============================================================================

-- 1. Create public.api_rate_limits table
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  bucket_key VARCHAR(128) PRIMARY KEY,
  hits INT NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  window_end TIMESTAMPTZ NOT NULL,
  blocked_until TIMESTAMPTZ
);

-- Indexes for performance and maintenance
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_window_end ON public.api_rate_limits(window_end);
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_blocked_until ON public.api_rate_limits(blocked_until) WHERE blocked_until IS NOT NULL;

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

-- Deny all direct client access (PostgREST anon/authenticated)
DROP POLICY IF EXISTS "Deny direct client access to api_rate_limits" ON public.api_rate_limits;
CREATE POLICY "Deny direct client access to api_rate_limits"
  ON public.api_rate_limits
  FOR ALL
  TO public
  USING (false)
  WITH CHECK (false);

-- Explicit service role policy
DROP POLICY IF EXISTS "Service role access to api_rate_limits" ON public.api_rate_limits;
CREATE POLICY "Service role access to api_rate_limits"
  ON public.api_rate_limits
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 3. Atomic Rate Limiter RPC
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_key TEXT,
  p_max_hits INT,
  p_window_seconds INT,
  p_block_duration_seconds INT DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_now TIMESTAMPTZ := pg_catalog.now();
  v_row public.api_rate_limits%ROWTYPE;
  v_hits INT;
  v_remaining INT;
  v_reset_in INT;
  v_retry_after INT;
  v_blocked_until TIMESTAMPTZ;
  v_window_end TIMESTAMPTZ;
BEGIN
  -- 3.1 Strict Parameter Validation
  IF p_key IS NULL OR pg_catalog.length(TRIM(p_key)) = 0 THEN
    RAISE EXCEPTION 'p_key cannot be null or empty' USING ERRCODE = '22023';
  END IF;

  IF pg_catalog.length(p_key) > 128 THEN
    RAISE EXCEPTION 'p_key exceeds maximum length of 128 characters' USING ERRCODE = '22023';
  END IF;

  IF p_max_hits IS NULL OR p_max_hits <= 0 OR p_max_hits > 100000 THEN
    RAISE EXCEPTION 'p_max_hits must be between 1 and 100,000' USING ERRCODE = '22023';
  END IF;

  IF p_window_seconds IS NULL OR p_window_seconds <= 0 OR p_window_seconds > 2592000 THEN
    RAISE EXCEPTION 'p_window_seconds must be between 1 and 2,592,000 seconds (30 days)' USING ERRCODE = '22023';
  END IF;

  IF p_block_duration_seconds IS NULL OR p_block_duration_seconds < 0 OR p_block_duration_seconds > 2592000 THEN
    RAISE EXCEPTION 'p_block_duration_seconds must be between 0 and 2,592,000 seconds (30 days)' USING ERRCODE = '22023';
  END IF;

  -- 3.2 Concurrency Mutual Exclusion via Advisory Lock
  -- Serializes initial requests on the same bucket key to prevent race conditions & duplicate key errors
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_key));

  -- 3.3 Check Existing Bucket Record with Row-Level Lock (FOR UPDATE)
  -- Ensures cleanup (prune_expired_rate_limits) cannot delete a bucket while a request is actively processing it
  SELECT * INTO v_row
  FROM public.api_rate_limits
  WHERE bucket_key = p_key
  FOR UPDATE;

  -- Case 1: First request for this bucket key
  IF NOT FOUND THEN
    v_window_end := v_now + (p_window_seconds || ' seconds')::INTERVAL;

    INSERT INTO public.api_rate_limits (bucket_key, hits, window_start, window_end, blocked_until)
    VALUES (p_key, 1, v_now, v_window_end, NULL);

    RETURN pg_catalog.jsonb_build_object(
      'allowed', true,
      'current_hits', 1,
      'remaining_hits', GREATEST(0, p_max_hits - 1),
      'retry_after_seconds', 0,
      'reset_in_seconds', p_window_seconds
    );
  END IF;

  -- =========================================================================
  -- PRECISE STATE MACHINE TRANSITIONS
  -- =========================================================================

  -- State 1: Expired Window (v_now >= window_end)
  -- The original window has finished. Start a fresh window.
  IF v_now >= v_row.window_end THEN
    v_window_end := v_now + (p_window_seconds || ' seconds')::INTERVAL;

    UPDATE public.api_rate_limits
    SET hits = 1,
        window_start = v_now,
        window_end = v_window_end,
        blocked_until = NULL
    WHERE bucket_key = p_key;

    RETURN pg_catalog.jsonb_build_object(
      'allowed', true,
      'current_hits', 1,
      'remaining_hits', GREATEST(0, p_max_hits - 1),
      'retry_after_seconds', 0,
      'reset_in_seconds', p_window_seconds
    );
  END IF;

  -- State 2: Active Window, Active Cooldown (v_now < window_end AND v_now < blocked_until)
  -- Request rejected. Client must wait for cooldown to expire.
  IF v_row.blocked_until IS NOT NULL AND v_now < v_row.blocked_until THEN
    v_retry_after := pg_catalog.ceil(EXTRACT(EPOCH FROM (v_row.blocked_until - v_now)))::INT;
    v_reset_in := pg_catalog.ceil(EXTRACT(EPOCH FROM (v_row.window_end - v_now)))::INT;

    RETURN pg_catalog.jsonb_build_object(
      'allowed', false,
      'current_hits', v_row.hits,
      'remaining_hits', 0,
      'retry_after_seconds', v_retry_after,
      'reset_in_seconds', v_reset_in
    );
  END IF;

  -- State 3: Expired Cooldown, Still-Active Window (v_now < window_end AND v_now >= blocked_until)
  -- Cooldown has elapsed, but the original rate-limit window is still active.
  -- The counter remains exhausted (hits >= max_hits). No fresh attempts are granted until window_end.
  IF v_row.blocked_until IS NOT NULL AND v_now >= v_row.blocked_until THEN
    v_retry_after := pg_catalog.ceil(EXTRACT(EPOCH FROM (v_row.window_end - v_now)))::INT;
    v_reset_in := v_retry_after;

    RETURN pg_catalog.jsonb_build_object(
      'allowed', false,
      'current_hits', v_row.hits,
      'remaining_hits', 0,
      'retry_after_seconds', v_retry_after,
      'reset_in_seconds', v_reset_in
    );
  END IF;

  -- State 4: Active Window, No Cooldown (v_now < window_end AND blocked_until IS NULL)
  -- 4A: Under Hit Limit -> Increment counter
  IF v_row.hits < p_max_hits THEN
    v_hits := v_row.hits + 1;
    v_remaining := GREATEST(0, p_max_hits - v_hits);
    v_reset_in := pg_catalog.ceil(EXTRACT(EPOCH FROM (v_row.window_end - v_now)))::INT;

    UPDATE public.api_rate_limits
    SET hits = v_hits
    WHERE bucket_key = p_key;

    RETURN pg_catalog.jsonb_build_object(
      'allowed', true,
      'current_hits', v_hits,
      'remaining_hits', v_remaining,
      'retry_after_seconds', 0,
      'reset_in_seconds', v_reset_in
    );
  END IF;

  -- 4B: Hit Limit Reached -> Enter Cooldown
  -- Cooldown duration is strictly determined by p_block_duration_seconds without GREATEST override.
  IF p_block_duration_seconds > 0 THEN
    v_blocked_until := v_now + (p_block_duration_seconds || ' seconds')::INTERVAL;
    v_retry_after := p_block_duration_seconds;
  ELSE
    -- If no separate cooldown duration was configured (0), block for the remaining window duration
    v_blocked_until := v_row.window_end;
    v_retry_after := pg_catalog.ceil(EXTRACT(EPOCH FROM (v_row.window_end - v_now)))::INT;
  END IF;

  v_reset_in := pg_catalog.ceil(EXTRACT(EPOCH FROM (v_row.window_end - v_now)))::INT;

  UPDATE public.api_rate_limits
  SET hits = v_row.hits + 1,
      blocked_until = v_blocked_until
  WHERE bucket_key = p_key;

  RETURN pg_catalog.jsonb_build_object(
    'allowed', false,
    'current_hits', v_row.hits + 1,
    'remaining_hits', 0,
    'retry_after_seconds', v_retry_after,
    'reset_in_seconds', v_reset_in
  );
END;
$$;

-- 4. Bounded Batch Maintenance Cleanup Function
-- Deletes records ONLY when BOTH conditions are satisfied:
-- 1. Original rate-limit window has expired (window_end <= now())
-- 2. Cooldown is NULL or has expired (blocked_until IS NULL OR blocked_until <= now())
CREATE OR REPLACE FUNCTION public.prune_expired_rate_limits(p_batch_size INT DEFAULT 1000)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_deleted INT := 0;
  v_limit INT := GREATEST(1, LEAST(COALESCE(p_batch_size, 1000), 10000));
BEGIN
  WITH expired_rows AS (
    SELECT bucket_key
    FROM public.api_rate_limits
    WHERE window_end <= pg_catalog.now()
      AND (blocked_until IS NULL OR blocked_until <= pg_catalog.now())
    LIMIT v_limit
    FOR UPDATE SKIP LOCKED
  )
  DELETE FROM public.api_rate_limits
  WHERE bucket_key IN (SELECT bucket_key FROM expired_rows);

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

-- 5. Least-Privilege Grants
REVOKE ALL ON TABLE public.api_rate_limits FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.api_rate_limits TO service_role;

REVOKE ALL ON FUNCTION public.check_rate_limit(TEXT, INT, INT, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, INT, INT, INT) TO service_role;

REVOKE ALL ON FUNCTION public.prune_expired_rate_limits(INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.prune_expired_rate_limits(INT) TO service_role;
