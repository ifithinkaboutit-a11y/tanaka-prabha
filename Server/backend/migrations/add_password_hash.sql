-- Migration: Add password_hash column to users table
-- Run this once against your Supabase database.
-- This is safe to run multiple times (IF NOT EXISTS guard).

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Index for faster lookups when verifying passwords by mobile number
-- (mobile_number already has an index from the original schema, this is just for reference)
-- If not yet indexed:
-- CREATE INDEX IF NOT EXISTS idx_users_mobile_number ON public.users(mobile_number);

COMMENT ON COLUMN public.users.password_hash IS 
  'bcrypt hash of the user password. NULL means user has not set a password yet (OTP-only login).';
