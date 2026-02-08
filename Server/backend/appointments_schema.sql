-- ==================================================================
-- APPOINTMENTS TABLE SCHEMA
-- ==================================================================
-- This schema adds support for scheduling appointments with professionals
-- Run this after the main schema.sql has been executed

-- ==================================================================
-- 1. ENUM TYPE FOR APPOINTMENT STATUS
-- ==================================================================

-- Create appointment status enum
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- ==================================================================
-- 2. APPOINTMENTS TABLE
-- ==================================================================

CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Foreign keys
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
    
    -- Scheduling
    appointment_date DATE NOT NULL,
    appointment_time TEXT NOT NULL,  -- e.g., "09:00 AM", "02:00 PM"
    
    -- Status tracking
    status appointment_status NOT NULL DEFAULT 'pending',
    
    -- Optional notes
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- ==================================================================
-- 3. INDEXES FOR PERFORMANCE
-- ==================================================================

-- Index for user's appointments lookup
CREATE INDEX IF NOT EXISTS appointments_user_id_idx 
ON public.appointments(user_id);

-- Index for professional's appointments lookup
CREATE INDEX IF NOT EXISTS appointments_professional_id_idx 
ON public.appointments(professional_id);

-- Index for date-based queries (availability checking)
CREATE INDEX IF NOT EXISTS appointments_date_idx 
ON public.appointments(appointment_date);

-- Composite index for checking availability (professional + date + status)
CREATE INDEX IF NOT EXISTS appointments_availability_idx 
ON public.appointments(professional_id, appointment_date, status);

-- ==================================================================
-- 4. ROW LEVEL SECURITY
-- ==================================================================

-- Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Users can view their own appointments
CREATE POLICY "Users can view own appointments" 
ON public.appointments FOR SELECT 
USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- Users can create appointments
CREATE POLICY "Users can create appointments" 
ON public.appointments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own appointments (e.g., cancel)
CREATE POLICY "Users can update own appointments" 
ON public.appointments FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Service role can manage all appointments
CREATE POLICY "Service role can manage all appointments" 
ON public.appointments FOR ALL 
TO service_role 
USING (true);

-- ==================================================================
-- 5. UTILITY FUNCTIONS
-- ==================================================================

-- Function to get available time slots for a professional on a date
CREATE OR REPLACE FUNCTION get_available_slots(
    p_professional_id UUID,
    p_date DATE
)
RETURNS TABLE (time_slot TEXT, is_available BOOLEAN)
LANGUAGE plpgsql
AS $$
DECLARE
    all_slots TEXT[] := ARRAY['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'];
    slot TEXT;
BEGIN
    FOREACH slot IN ARRAY all_slots
    LOOP
        time_slot := slot;
        is_available := NOT EXISTS (
            SELECT 1 FROM public.appointments
            WHERE professional_id = p_professional_id
            AND appointment_date = p_date
            AND appointment_time = slot
            AND status NOT IN ('cancelled')
        );
        RETURN NEXT;
    END LOOP;
END;
$$;

-- Function to check if a professional is fully booked on a date
CREATE OR REPLACE FUNCTION is_fully_booked(
    p_professional_id UUID,
    p_date DATE,
    p_max_appointments INT DEFAULT 3
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN (
        SELECT COUNT(*) >= p_max_appointments
        FROM public.appointments
        WHERE professional_id = p_professional_id
        AND appointment_date = p_date
        AND status NOT IN ('cancelled')
    );
END;
$$;

-- Function to get appointment count for a professional on a date
CREATE OR REPLACE FUNCTION get_appointment_count(
    p_professional_id UUID,
    p_date DATE
)
RETURNS INT
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INT
        FROM public.appointments
        WHERE professional_id = p_professional_id
        AND appointment_date = p_date
        AND status NOT IN ('cancelled')
    );
END;
$$;

-- ==================================================================
-- 6. TRIGGER FOR UPDATED_AT
-- ==================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_appointment_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$;

-- Trigger to automatically update updated_at on row update
CREATE TRIGGER appointments_updated_at_trigger
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_appointment_timestamp();

-- ==================================================================
-- END OF APPOINTMENTS SCHEMA
-- ==================================================================
