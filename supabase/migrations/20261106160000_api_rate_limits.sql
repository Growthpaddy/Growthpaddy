-- ==============================================================================
-- Migration: 20261106160000_api_rate_limits.sql
-- Description:
--   Production-Grade Distributed PostgreSQL Rate Limiting for Digital Campux Platform:
--   1. Shared counter table public.api_rate_limits (multi-Vercel instance safe)
--   2. Genuinely atomic check_rate_limit RPC using transaction-level advisory locking
--      (pg_advisory_xact_lock) to eliminate duplicate-key race conditions on new buckets
--   3. Strict parameter validation (non-empty, max 128 chars, bounded hits and windows)
--   4. Hardened SECURITY DEFINER with SET search_path = '' and fully qualified objects
--   5. Separate bounded batch maintenance routine (prune_expired_rate_limits) with SKIP LOCKED
--   6. Strict least-privilege grants (revoked from PUBLIC, anon, authenticated; service_role only)
-- ==============================================================================

-- 1. Create public.api_rate_limits table
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  bucket_key VARCHAR(128) PRIMARY KEY,
  hits INT NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  blocked_until TIMESTAMPTZ
);

-- Indexes for performance and maintenance
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_window ON public.api_rate_limits(window_start);
CREATE INDEX IF NOT EXISTS idx_api_rate_limits_blocked ON public.api_rate_limits(blocked_until) WHERE blocked_until IS NOT NULL;

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
BEGIN
  -- 3.1 Strict Parameter Validation
  IF p_key IS NULL OR pg_catalog.length(pg_catalog.trim(p_key)) = 0 THEN
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

  -- 3.2 Concurrency Mutual Exclusion
  -- Acquire transaction-level advisory xact lock on the hash of the bucket key.
  -- This serializes concurrent initial requests for the same bucket key, eliminating
  -- duplicate-key race conditions while allowing parallel processing for different keys.
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_key));

  -- 3.3 Check Existing Bucket Record
  SELECT * INTO v_row
  FROM public.api_rate_limits
  WHERE bucket_key = p_key;

  -- Case 1: First request for this bucket key
  IF NOT FOUND THEN
    INSERT INTO public.api_rate_limits (bucket_key, hits, window_start, blocked_until)
    VALUES (p_key, 1, v_now, NULL);

    RETURN pg_catalog.jsonb_build_object(
      'allowed', true,
      'current_hits', 1,
      'remaining_hits', GREATEST(0, p_max_hits - 1),
      'retry_after_seconds', 0,
      'reset_in_seconds', p_window_seconds
    );
  END IF;

  -- Case 2: Bucket is currently blocked under cooldown
  IF v_row.blocked_until IS NOT NULL AND v_row.blocked_until > v_now THEN
    v_retry_after := pg_catalog.ceil(pg_catalog.extract(epoch FROM (v_row.blocked_until - v_now)))::INT;
    RETURN pg_catalog.jsonb_build_object(
      'allowed', false,
      'current_hits', v_row.hits,
      'remaining_hits', 0,
      'retry_after_seconds', v_retry_after,
      'reset_in_seconds', v_retry_after
    );
  END IF;

  -- Case 3: Window has expired -> Start fresh window
  IF v_row.window_start + (p_window_seconds || ' seconds')::INTERVAL <= v_now THEN
    UPDATE public.api_rate_limits
    SET hits = 1,
        window_start = v_now,
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

  -- Case 4: Within window and below hit limit -> Increment
  IF v_row.hits < p_max_hits THEN
    v_hits := v_row.hits + 1;
    v_remaining := GREATEST(0, p_max_hits - v_hits);
    v_reset_in := pg_catalog.ceil(pg_catalog.extract(epoch FROM ((v_row.window_start + (p_window_seconds || ' seconds')::INTERVAL) - v_now)))::INT;

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

  -- Case 5: Limit exceeded -> Apply progressive cooldown block
  v_blocked_until := v_now + (GREATEST(p_block_duration_seconds, p_window_seconds) || ' seconds')::INTERVAL;
  v_retry_after := pg_catalog.ceil(pg_catalog.extract(epoch FROM (v_blocked_until - v_now)))::INT;

  UPDATE public.api_rate_limits
  SET hits = v_row.hits + 1,
      blocked_until = v_blocked_until
  WHERE bucket_key = p_key;

  RETURN pg_catalog.jsonb_build_object(
    'allowed', false,
    'current_hits', v_row.hits + 1,
    'remaining_hits', 0,
    'retry_after_seconds', v_retry_after,
    'reset_in_seconds', v_retry_after
  );
END;
$$;

-- 4. Bounded Batch Maintenance Cleanup Function
-- Safely deletes expired records without locking active counters (uses SKIP LOCKED)
CREATE OR REPLACE FUNCTION public.prune_expired_rate_limits(p_batch_size INT DEFAULT 1000)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_deleted INT := 0;
  v_limit INT := pg_catalog.greatest(1, pg_catalog.least(COALESCE(p_batch_size, 1000), 10000));
BEGIN
  WITH expired_rows AS (
    SELECT bucket_key
    FROM public.api_rate_limits
    WHERE (blocked_until IS NOT NULL AND blocked_until < pg_catalog.now())
       OR (blocked_until IS NULL AND window_start < pg_catalog.now() - INTERVAL '2 days')
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
