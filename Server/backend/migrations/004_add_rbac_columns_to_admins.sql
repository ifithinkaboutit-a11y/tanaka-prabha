-- ==================================================================
-- MIGRATION 004: Add RBAC columns to admins table
-- ==================================================================
-- Run in: Supabase Dashboard → SQL Editor
--         OR via psql: psql $DATABASE_URL -f migrations/004_add_rbac_columns_to_admins.sql
-- ==================================================================

-- 1. Add RBAC and profile columns to admins table
ALTER TABLE public.admins
  ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'admin',
  ADD COLUMN IF NOT EXISTS name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

-- 2. Add CHECK constraint for valid role values
ALTER TABLE public.admins
  ADD CONSTRAINT admins_role_check
  CHECK (role IN ('super_admin', 'admin', 'sub_admin', 'volunteer'));
