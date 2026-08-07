-- ==================================================================
-- MIGRATION 010: Remap legacy professional categories
-- ==================================================================
-- Run in: Supabase Dashboard → SQL Editor
--         OR via psql: psql "$DATABASE_URL" -f migrations/010_remap_legacy_professional_categories.sql
--
-- WHY
-- The mobile app's Connect screen lists exactly four services and filters
-- professionals with `WHERE category = <service id> AND is_available = true`
-- (Professional.findByCategory). The service ids are:
--
--     training-guidance      Training & Guidance
--     livestock-veterinary   Livestock & Veterinary
--     market-buyers          Market & Buyers
--     government-schemes     Government Schemes
--
-- Older builds of the admin dashboard offered a different, unrelated category
-- list (doctor / veterinary / agricultural / legal / financial). Those values
-- match no service, so every professional created through that dropdown is
-- invisible in the app — which is why only the seeded records showed up.
--
-- This remaps the legacy values onto the closest real service. Review the
-- mapping below before running; "doctor" in this product means an animal
-- doctor (see the seeded 'Animal Doctor' records), hence livestock-veterinary.
--
-- Idempotent: re-running changes nothing once the values are already remapped.
-- ==================================================================

BEGIN;

-- Snapshot of what is about to change (inspect the output, then commit)
SELECT category AS legacy_category, COUNT(*) AS rows_affected
FROM public.professionals
WHERE category IN ('doctor', 'veterinary', 'agricultural', 'legal', 'financial')
GROUP BY category
ORDER BY category;

UPDATE public.professionals
SET category = CASE category
        WHEN 'doctor'       THEN 'livestock-veterinary'
        WHEN 'veterinary'   THEN 'livestock-veterinary'
        WHEN 'agricultural' THEN 'training-guidance'
        WHEN 'legal'        THEN 'government-schemes'
        WHEN 'financial'    THEN 'market-buyers'
        ELSE category
    END
WHERE category IN ('doctor', 'veterinary', 'agricultural', 'legal', 'financial');

COMMIT;

-- ==================================================================
-- VERIFICATION
-- ==================================================================
-- Every category now present, and how many are visible in the app.
-- Anything outside the four service ids will NOT appear on the Connect screen.
--
--   SELECT category,
--          COUNT(*)                                    AS total,
--          COUNT(*) FILTER (WHERE is_available)        AS visible_in_app
--   FROM public.professionals
--   GROUP BY category
--   ORDER BY category;
--
-- Expected categories: training-guidance, livestock-veterinary,
--                      market-buyers, government-schemes
-- ==================================================================
