-- ==================================================================
-- MIGRATION 008: Add invite tracking to event_participants
-- ==================================================================
-- Tracks whether a WhatsApp invite was sent to walk-in attendees
-- and whether they later converted to registered users.
-- ==================================================================

-- 1. Add invite_sent column (true when WhatsApp invite has been sent)
ALTER TABLE public.event_participants
  ADD COLUMN IF NOT EXISTS invite_sent BOOLEAN DEFAULT FALSE;

-- 2. Add converted column (true when walk-in later registers as a user)
ALTER TABLE public.event_participants
  ADD COLUMN IF NOT EXISTS converted BOOLEAN DEFAULT FALSE;

-- 3. Add index for finding unconverted walk-ins
CREATE INDEX IF NOT EXISTS ep_invite_tracking_idx
  ON public.event_participants(invite_sent, converted)
  WHERE invite_sent = TRUE AND converted = FALSE;
