-- ==================================================================
-- MIGRATION 005: Add outcome and media_urls columns to events table
-- ==================================================================
-- Run in: Supabase Dashboard → SQL Editor
--         OR via psql: psql $DATABASE_URL -f migrations/005_add_outcome_media_to_events.sql
-- ==================================================================

-- 1. Add outcome and media_urls columns to events table
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS outcome TEXT,
  ADD COLUMN IF NOT EXISTS media_urls TEXT[];
