-- ==================================================================
-- MIGRATION 003: Events and Event Participants Tables
-- ==================================================================
-- Run in: Supabase Dashboard → SQL Editor
--         OR via psql: psql $DATABASE_URL -f migrations/003_add_events_tables.sql
-- ==================================================================

-- 1. Create events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location_name TEXT NOT NULL,
  location_address TEXT,
  instructors JSONB DEFAULT '[]'::JSONB,
  guidelines_and_rules TEXT,
  requirements TEXT,
  hero_image_url TEXT,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create event_participants table
CREATE TABLE IF NOT EXISTS public.event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  mobile_number TEXT,
  name TEXT,
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(event_id, mobile_number)
);

-- 3. Indexes for fast lookups
CREATE INDEX IF NOT EXISTS events_date_idx ON public.events(date);
CREATE INDEX IF NOT EXISTS events_status_idx ON public.events(status);
CREATE INDEX IF NOT EXISTS ep_event_id_idx ON public.event_participants(event_id);
CREATE INDEX IF NOT EXISTS ep_user_id_idx ON public.event_participants(user_id);
CREATE INDEX IF NOT EXISTS ep_mobile_number_idx ON public.event_participants(mobile_number);
