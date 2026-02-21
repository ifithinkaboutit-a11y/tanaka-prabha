-- ==================================================================
-- MIGRATION 002: Location Picker Columns
-- ==================================================================
-- Run in: Supabase Dashboard → SQL Editor
--         OR via psql: psql $DATABASE_URL -f migrations/002_add_location_picker_columns.sql
--
-- What this adds to public.users:
--   location_address   — human-readable address from reverse geocode
--   location_accuracy  — GPS accuracy in metres at time of pin
--   location_set_at    — UTC timestamp when user confirmed the pin
--   location_method    — 'gps' (confirmed pin) | 'skipped'
--
-- The existing latitude, longitude, and GEOGRAPHY(POINT) columns are
-- already present and do NOT change. The existing update() code in
-- User.js already writes latitude/longitude → GEOGRAPHY point.
-- ==================================================================

-- 1. Add location metadata columns (idempotent — safe to re-run)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS location_address   TEXT,
  ADD COLUMN IF NOT EXISTS location_accuracy  NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS location_set_at    TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS location_method    TEXT CHECK (
    location_method IS NULL OR location_method IN ('gps', 'skipped')
  );

-- 2. Index for filtering by method (e.g. heatmap excludes 'skipped')
CREATE INDEX IF NOT EXISTS users_location_method_idx
  ON public.users (location_method)
  WHERE location_method = 'gps';

-- 3. Update get_heatmap_data() to exclude 'skipped' low-quality points
--    and include intensity weighting (GPS-confirmed = 1, others omitted)
CREATE OR REPLACE FUNCTION get_heatmap_data()
RETURNS TABLE (
    lat       FLOAT,
    lng       FLOAT,
    intensity INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ST_Y(location::geometry)::FLOAT  AS lat,
        ST_X(location::geometry)::FLOAT  AS lng,
        1                                 AS intensity
    FROM public.users
    WHERE location IS NOT NULL
      -- Only include GPS-confirmed pins on the heatmap.
      -- NULL method = legacy rows entered before location picker existed → include them.
      AND (location_method IS NULL OR location_method = 'gps');
END;
$$;

-- ==================================================================
-- VERIFICATION QUERIES (run manually to check the migration worked)
-- ==================================================================
-- Check columns exist:
--   SELECT column_name, data_type
--   FROM information_schema.columns
--   WHERE table_name = 'users'
--     AND column_name IN ('location_address','location_accuracy','location_set_at','location_method');
--
-- Check heatmap function updated:
--   SELECT prosrc FROM pg_proc WHERE proname = 'get_heatmap_data';
--
-- After a test onboarding run, verify data written:
--   SELECT latitude, longitude, location_address, location_method, location_set_at
--   FROM public.users ORDER BY updated_at DESC LIMIT 5;
-- ==================================================================
