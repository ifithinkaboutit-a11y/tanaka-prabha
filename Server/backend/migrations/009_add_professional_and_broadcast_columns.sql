-- ==================================================================
-- MIGRATION 009: Professional profile fields + broadcast grouping
-- ==================================================================
-- Run in: Supabase Dashboard → SQL Editor
--         OR via psql: psql $DATABASE_URL -f migrations/009_add_professional_and_broadcast_columns.sql
--
-- 1. public.professionals
--    The admin dashboard's "Add Professional" form collects a description and a
--    state, and both were being dropped on create / crashing update because the
--    columns did not exist. `role` was NOT NULL with no default, so any create
--    that omitted it failed outright.
--
-- 2. public.notifications
--    Broadcasts were fan-out inserts with nothing tying the copies together, so
--    the dashboard could not list, edit or delete a sent announcement.
--    `broadcast_id` groups every row produced by one broadcast.
-- ==================================================================

-- ── 1. Professionals ──────────────────────────────────────────────
ALTER TABLE public.professionals
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS description_hi TEXT,
    ADD COLUMN IF NOT EXISTS state TEXT,
    ADD COLUMN IF NOT EXISTS email TEXT;

-- Allow professionals to be saved without a role (the dashboard treats it as optional)
ALTER TABLE public.professionals
    ALTER COLUMN role DROP NOT NULL;

CREATE INDEX IF NOT EXISTS professionals_state_idx ON public.professionals(state);

-- ── 2. Notifications ──────────────────────────────────────────────
ALTER TABLE public.notifications
    ADD COLUMN IF NOT EXISTS broadcast_id UUID,
    ADD COLUMN IF NOT EXISTS district TEXT;

CREATE INDEX IF NOT EXISTS notifications_broadcast_id_idx
    ON public.notifications(broadcast_id)
    WHERE broadcast_id IS NOT NULL;

-- ==================================================================
-- VERIFICATION
-- ==================================================================
--   SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'professionals'
--     AND column_name IN ('description','description_hi','state','email');
--
--   SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'notifications'
--     AND column_name IN ('broadcast_id','district');
-- ==================================================================
