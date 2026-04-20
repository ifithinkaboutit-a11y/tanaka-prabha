-- Migration: Add horse column to livestock_details
-- Description: Adds a column to track horse livestock for farmers.

ALTER TABLE public.livestock_details 
ADD COLUMN IF NOT EXISTS horse INTEGER DEFAULT 0 CHECK (horse >= 0);

COMMENT ON COLUMN public.livestock_details.horse IS 'Number of horses owned by the farmer';
