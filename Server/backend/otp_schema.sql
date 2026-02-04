-- OTP Storage Table for Authentication
-- Add this to your existing schema.sql or run separately

-- Create OTP storage table
CREATE TABLE IF NOT EXISTS public.otps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mobile_number TEXT NOT NULL,
    otp TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Create index on mobile_number for faster lookups
CREATE INDEX IF NOT EXISTS otps_mobile_number_idx ON public.otps(mobile_number);

-- Create index on expires_at for cleanup operations
CREATE INDEX IF NOT EXISTS otps_expires_at_idx ON public.otps(expires_at);

-- Enable RLS on OTPs table
ALTER TABLE public.otps ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated users can manage OTPs (for backend service)
CREATE POLICY "Service role can manage OTPs" 
ON public.otps FOR ALL TO service_role USING (true);

-- Function to automatically clean up expired OTPs (optional cron job)
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.otps
    WHERE expires_at < timezone('utc', now())
    OR (is_verified = true AND created_at < timezone('utc', now()) - INTERVAL '1 day');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- Optional: Create a scheduled job to clean up expired OTPs
-- This requires pg_cron extension (available in Supabase)
-- Uncomment if you want automatic cleanup every hour:
/*
SELECT cron.schedule(
    'cleanup-expired-otps',
    '0 * * * *', -- Every hour
    $$SELECT cleanup_expired_otps()$$
);
*/
