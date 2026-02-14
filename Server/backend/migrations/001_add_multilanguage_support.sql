-- ==================================================================
-- MIGRATION: ADD MULTI-LANGUAGE SUPPORT
-- ==================================================================
-- Run this migration to add Hindi language columns to existing tables
-- This is for upgrading an existing database to support multi-language
-- ==================================================================

-- ==================================================================
-- 1. ADD HINDI COLUMNS TO SCHEMES TABLE
-- ==================================================================

-- Add Hindi content columns to schemes
ALTER TABLE public.schemes 
    ADD COLUMN IF NOT EXISTS title_hi TEXT,
    ADD COLUMN IF NOT EXISTS description_hi TEXT,
    ADD COLUMN IF NOT EXISTS overview_hi TEXT,
    ADD COLUMN IF NOT EXISTS process_hi TEXT,
    ADD COLUMN IF NOT EXISTS eligibility_hi TEXT,
    ADD COLUMN IF NOT EXISTS key_objectives_hi TEXT[];

-- ==================================================================
-- 2. ADD HINDI COLUMNS TO BANNERS TABLE
-- ==================================================================

-- Add Hindi content columns to banners
ALTER TABLE public.banners 
    ADD COLUMN IF NOT EXISTS title_hi TEXT,
    ADD COLUMN IF NOT EXISTS subtitle_hi TEXT;

-- ==================================================================
-- 3. ADD HINDI COLUMNS TO NOTIFICATIONS TABLE
-- ==================================================================

-- Add Hindi content columns to notifications
ALTER TABLE public.notifications 
    ADD COLUMN IF NOT EXISTS title_hi TEXT,
    ADD COLUMN IF NOT EXISTS message_hi TEXT;

-- ==================================================================
-- 4. ADD HINDI COLUMNS TO PROFESSIONALS TABLE
-- ==================================================================

-- Add Hindi content columns to professionals
ALTER TABLE public.professionals 
    ADD COLUMN IF NOT EXISTS name_hi TEXT,
    ADD COLUMN IF NOT EXISTS role_hi TEXT,
    ADD COLUMN IF NOT EXISTS department_hi TEXT,
    ADD COLUMN IF NOT EXISTS specializations_hi JSONB;

-- ==================================================================
-- 5. ADD MISSING COLUMNS TO USERS TABLE (if needed)
-- ==================================================================

-- Add latitude/longitude columns if not present
ALTER TABLE public.users 
    ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- ==================================================================
-- 6. ADD MISSING COLUMNS TO SCHEMES TABLE (if needed)
-- ==================================================================

ALTER TABLE public.schemes 
    ADD COLUMN IF NOT EXISTS eligibility TEXT,
    ADD COLUMN IF NOT EXISTS documents_required TEXT[],
    ADD COLUMN IF NOT EXISTS tags TEXT[],
    ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now());

-- ==================================================================
-- 7. ADD MISSING COLUMNS TO BANNERS TABLE (if needed)
-- ==================================================================

ALTER TABLE public.banners 
    ADD COLUMN IF NOT EXISTS scheme_id UUID REFERENCES public.schemes(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now());

-- ==================================================================
-- 8. ADD MISSING COLUMNS TO PROFESSIONALS TABLE (if needed)
-- ==================================================================

ALTER TABLE public.professionals 
    ADD COLUMN IF NOT EXISTS email TEXT,
    ADD COLUMN IF NOT EXISTS block TEXT,
    ADD COLUMN IF NOT EXISTS qualifications JSONB,
    ADD COLUMN IF NOT EXISTS available_days TEXT[],
    ADD COLUMN IF NOT EXISTS available_hours TEXT,
    ADD COLUMN IF NOT EXISTS total_consultations INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS rating NUMERIC(2, 1) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now());

-- ==================================================================
-- 9. ADD MISSING COLUMNS TO NOTIFICATIONS TABLE (if needed)
-- ==================================================================

ALTER TABLE public.notifications 
    ADD COLUMN IF NOT EXISTS action_url TEXT;

-- ==================================================================
-- 10. VERIFY CHANGES
-- ==================================================================

-- Check that columns were added successfully
DO $$
DECLARE
    banner_cols TEXT;
    scheme_cols TEXT;
BEGIN
    -- Get banner columns
    SELECT string_agg(column_name, ', ') INTO banner_cols
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'banners';
    
    RAISE NOTICE 'Banners table columns: %', banner_cols;
    
    -- Get scheme columns
    SELECT string_agg(column_name, ', ') INTO scheme_cols
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'schemes';
    
    RAISE NOTICE 'Schemes table columns: %', scheme_cols;
END $$;

-- ==================================================================
-- MIGRATION COMPLETE
-- ==================================================================
-- Run this SQL in your Supabase SQL Editor or PostgreSQL client
-- ==================================================================
