-- ============================================================================
-- AK SPORTS: ATOMIC RATE LIMITS MIGRATION
-- Prevents race conditions on first request using INSERT ... ON CONFLICT DO UPDATE
-- Executable strictly by service_role (revoked from PUBLIC, anon, authenticated)
-- ============================================================================

-- Ensure rate_limits table exists with primary key on key
CREATE TABLE IF NOT EXISTS public.rate_limits (
    key TEXT PRIMARY KEY,
    window_start TIMESTAMPTZ NOT NULL,
    count INTEGER NOT NULL DEFAULT 1
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
-- No public RLS policies: inaccessible from client browsers

-- Atomic check_rate_limit using single INSERT ... ON CONFLICT DO UPDATE
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_key TEXT,
    p_max INTEGER,
    p_window_seconds INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_now TIMESTAMPTZ := timezone('utc'::text, now());
    v_window_interval INTERVAL := (p_window_seconds || ' seconds')::interval;
    v_updated_count INTEGER;
BEGIN
    IF p_key IS NULL OR trim(p_key) = '' THEN
        RETURN true;
    END IF;

    -- Cleanup expired rows older than 1 day to prevent table bloat
    DELETE FROM public.rate_limits
    WHERE window_start < v_now - INTERVAL '1 day';

    -- Single atomic UPSERT preventing race conditions:
    -- If key does not exist: inserts (key, v_now, 1)
    -- If key exists and expired: resets window_start to v_now, count to 1
    -- If key exists and active: keeps window_start, increments count by 1
    INSERT INTO public.rate_limits AS r (key, window_start, count)
    VALUES (p_key, v_now, 1)
    ON CONFLICT (key) DO UPDATE
    SET
        window_start = CASE
            WHEN r.window_start < v_now - v_window_interval THEN v_now
            ELSE r.window_start
        END,
        count = CASE
            WHEN r.window_start < v_now - v_window_interval THEN 1
            ELSE r.count + 1
        END
    RETURNING r.count INTO v_updated_count;

    -- Return true if within limit, false if quota exceeded
    RETURN (v_updated_count <= p_max);
END;
$$;

-- Strict permission hardening: service_role only
REVOKE EXECUTE ON FUNCTION public.check_rate_limit(TEXT, INTEGER, INTEGER) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_rate_limit(TEXT, INTEGER, INTEGER) FROM anon;
REVOKE EXECUTE ON FUNCTION public.check_rate_limit(TEXT, INTEGER, INTEGER) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, INTEGER, INTEGER) TO service_role;
