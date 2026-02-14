-- ==================================================================
-- TANAK PRABHA - COMPLETE PRODUCTION DATABASE SCHEMA
-- ==================================================================
-- Version: 2.0.0 (Production Ready with Multi-Language Support)
-- Last Updated: February 12, 2026
-- Database: PostgreSQL 15+ with Supabase
-- 
-- This is the FINAL production schema combining all tables, indexes,
-- functions, and policies for the Tanak Prabha platform.
--
-- FEATURES:
--   - Multi-language support (English & Hindi) for all content tables
--   - Geospatial queries with PostGIS for farmer density heatmaps
--   - OTP-based mobile authentication
--   - Professional appointment scheduling
--   - Activity logging for analytics
--
-- DEPLOYMENT:
--   - For FRESH database: Run this entire script
--   - For EXISTING database: Run migrations/001_add_multilanguage_support.sql
--
-- Run this script on a fresh Supabase database to set up everything.
-- ==================================================================

-- ==================================================================
-- 1. SETUP & EXTENSIONS
-- ==================================================================

-- Enable PostGIS for "Location Based Density Scans" and Heatmaps
CREATE EXTENSION IF NOT EXISTS postgis;
-- Enable UUID generation for unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================================================================
-- 2. ENUM TYPES (Data Integrity)
-- ==================================================================

-- Define fixed types for Notifications
DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('approval', 'reminder', 'alert', 'announcement', 'info');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Define fixed types for Connections
DO $$ BEGIN
    CREATE TYPE connection_method AS ENUM ('call', 'chat', 'appointment');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Define crop seasons
DO $$ BEGIN
    CREATE TYPE crop_season AS ENUM ('rabi', 'kharif', 'zaid');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Define appointment status
DO $$ BEGIN
    CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==================================================================
-- 3. CRM TABLES (Farmers & Profile)
-- ==================================================================

-- The Master Farmer Table
-- Links to Supabase Auth (auth.users) if farmers log in, or acts as standalone registry
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Demographic Info
    name TEXT NOT NULL,
    age INTEGER,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    photo_url TEXT,
    mobile_number TEXT UNIQUE NOT NULL,
    aadhaar_number TEXT UNIQUE,
    
    -- Family Details
    fathers_name TEXT,
    mothers_name TEXT,
    educational_qualification TEXT,
    
    -- Family Counts
    sons_married INTEGER DEFAULT 0 CHECK (sons_married >= 0),
    sons_unmarried INTEGER DEFAULT 0 CHECK (sons_unmarried >= 0),
    daughters_married INTEGER DEFAULT 0 CHECK (daughters_married >= 0),
    daughters_unmarried INTEGER DEFAULT 0 CHECK (daughters_unmarried >= 0),
    other_family_members INTEGER DEFAULT 0 CHECK (other_family_members >= 0),
    
    -- Address
    village TEXT,
    gram_panchayat TEXT,
    nyay_panchayat TEXT,
    post_office TEXT,
    tehsil TEXT,
    block TEXT,
    district TEXT,
    pin_code TEXT,
    state TEXT DEFAULT 'Assam',
    
    -- Geospatial Location (CRITICAL FOR HEATMAPS)
    -- Stores explicit Lat/Long as a Geography Point
    location GEOGRAPHY(POINT, 4326),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    
    -- Status
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Spatial Index: Makes "Farmers near me" and "Heatmap" queries instant
CREATE INDEX IF NOT EXISTS users_geo_index ON public.users USING GIST (location);

-- Index for mobile number lookup (authentication)
CREATE INDEX IF NOT EXISTS users_mobile_idx ON public.users(mobile_number);

-- Index for district-based queries
CREATE INDEX IF NOT EXISTS users_district_idx ON public.users(district);

-- Index for block-based queries
CREATE INDEX IF NOT EXISTS users_block_idx ON public.users(block);

-- Land Details (One-to-One Relationship)
CREATE TABLE IF NOT EXISTS public.land_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    
    total_land_area NUMERIC(10, 2) CHECK (total_land_area >= 0), -- Stores acres
    land_unit TEXT DEFAULT 'acres', -- 'acres' or 'hectares'
    
    -- Crops by season
    rabi_crop TEXT,
    kharif_crop TEXT,
    zaid_crop TEXT,
    
    -- Additional land info
    irrigation_type TEXT, -- 'rain-fed', 'canal', 'tube-well', 'pond', 'mixed'
    soil_type TEXT, -- 'alluvial', 'red', 'black', 'laterite', 'sandy', 'clay'
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Index for user_id lookup
CREATE INDEX IF NOT EXISTS land_details_user_idx ON public.land_details(user_id);

-- Livestock Details (One-to-One Relationship)
CREATE TABLE IF NOT EXISTS public.livestock_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    
    cow INTEGER DEFAULT 0 CHECK (cow >= 0),
    buffalo INTEGER DEFAULT 0 CHECK (buffalo >= 0),
    goat INTEGER DEFAULT 0 CHECK (goat >= 0),
    sheep INTEGER DEFAULT 0 CHECK (sheep >= 0),
    pig INTEGER DEFAULT 0 CHECK (pig >= 0),
    poultry INTEGER DEFAULT 0 CHECK (poultry >= 0),
    others INTEGER DEFAULT 0 CHECK (others >= 0),
    
    -- Additional livestock info
    has_shed BOOLEAN DEFAULT false,
    has_insurance BOOLEAN DEFAULT false,
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Index for user_id lookup
CREATE INDEX IF NOT EXISTS livestock_details_user_idx ON public.livestock_details(user_id);

-- ==================================================================
-- 4. AUTHENTICATION TABLES (OTP System)
-- ==================================================================

-- OTP Storage Table for Mobile Authentication
CREATE TABLE IF NOT EXISTS public.otps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mobile_number TEXT NOT NULL,
    otp TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    attempts INTEGER DEFAULT 0 CHECK (attempts >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Index for mobile_number lookup
CREATE INDEX IF NOT EXISTS otps_mobile_number_idx ON public.otps(mobile_number);

-- Index for expires_at for cleanup operations
CREATE INDEX IF NOT EXISTS otps_expires_at_idx ON public.otps(expires_at);

-- ==================================================================
-- 5. CMS TABLES (App Content)
-- ==================================================================

-- Government Schemes & Training Programs
-- Supports multi-language content (English and Hindi)
CREATE TABLE IF NOT EXISTS public.schemes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- ============================================
    -- ENGLISH CONTENT (Primary)
    -- ============================================
    title TEXT NOT NULL,                    -- English title
    description TEXT,                        -- English description
    overview TEXT,                           -- English overview (long rich text)
    process TEXT,                            -- English application process
    eligibility TEXT,                        -- English eligibility criteria
    key_objectives TEXT[],                   -- English key objectives array
    
    -- ============================================
    -- HINDI CONTENT (हिंदी)
    -- ============================================
    title_hi TEXT,                           -- Hindi title (हिंदी शीर्षक)
    description_hi TEXT,                     -- Hindi description (हिंदी विवरण)
    overview_hi TEXT,                        -- Hindi overview (हिंदी अवलोकन)
    process_hi TEXT,                         -- Hindi application process (आवेदन प्रक्रिया)
    eligibility_hi TEXT,                     -- Hindi eligibility (पात्रता)
    key_objectives_hi TEXT[],                -- Hindi key objectives (मुख्य उद्देश्य)
    
    -- ============================================
    -- SHARED FIELDS (Language Independent)
    -- ============================================
    category TEXT NOT NULL,                  -- "Financial Support", "Training", "Subsidy", etc.
    
    -- Images
    image_url TEXT,                          -- Thumbnail
    hero_image_url TEXT,                     -- Large banner for detail page
    
    -- Event Details (for training programs)
    location TEXT,                           -- E.g., "Barabanki Krishi Kendra"
    event_date TIMESTAMP WITH TIME ZONE, 
    
    -- Documents (can add Hindi document names in future)
    documents_required TEXT[],               -- List of required documents
    
    -- Contact & Application
    support_contact TEXT,
    apply_url TEXT,
    
    -- SEO & Search
    tags TEXT[],                             -- For search functionality
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Index for category filtering
CREATE INDEX IF NOT EXISTS schemes_category_idx ON public.schemes(category);

-- Index for active schemes
CREATE INDEX IF NOT EXISTS schemes_active_idx ON public.schemes(is_active) WHERE is_active = true;

-- Home Screen Banners
-- Supports multi-language content (English and Hindi)
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- ============================================
    -- ENGLISH CONTENT (Primary)
    -- ============================================
    title TEXT,
    subtitle TEXT,
    
    -- ============================================
    -- HINDI CONTENT (हिंदी)
    -- ============================================
    title_hi TEXT,                           -- Hindi title (हिंदी शीर्षक)
    subtitle_hi TEXT,                        -- Hindi subtitle (हिंदी उपशीर्षक)
    
    -- ============================================
    -- SHARED FIELDS (Language Independent)
    -- ============================================
    image_url TEXT NOT NULL,
    redirect_url TEXT,                       -- Deep link or URL to navigate to
    
    -- Linking to schemes (optional)
    scheme_id UUID REFERENCES public.schemes(id) ON DELETE SET NULL,
    
    -- Display order
    sort_order INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Index for active banners sorted by order
CREATE INDEX IF NOT EXISTS banners_active_order_idx ON public.banners(is_active, sort_order) WHERE is_active = true;

-- Notifications
-- Supports multi-language content (English and Hindi)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    type notification_type NOT NULL,         -- 'approval', 'reminder', 'alert', 'announcement', 'info'
    
    -- ============================================
    -- ENGLISH CONTENT (Primary)
    -- ============================================
    title TEXT NOT NULL,
    message TEXT,
    
    -- ============================================
    -- HINDI CONTENT (हिंदी)
    -- ============================================
    title_hi TEXT,                           -- Hindi title (हिंदी शीर्षक)
    message_hi TEXT,                         -- Hindi message (हिंदी संदेश)
    
    -- ============================================
    -- SHARED FIELDS (Language Independent)
    -- ============================================
    -- UI Customization
    icon_name TEXT DEFAULT 'bell',           -- Icon identifier
    bg_color TEXT DEFAULT '#E8F5E9',         -- Background color (hex)
    
    -- Deep linking
    action_url TEXT,                         -- Where to navigate on tap
    
    -- Status
    is_read BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Index for user's notifications
CREATE INDEX IF NOT EXISTS notifications_user_idx ON public.notifications(user_id);

-- Index for unread notifications
CREATE INDEX IF NOT EXISTS notifications_unread_idx ON public.notifications(user_id, is_read) WHERE is_read = false;

-- ==================================================================
-- 6. CONNECT SERVICE TABLES (Professionals)
-- ==================================================================

-- Professional Profiles (Doctors, Veterinarians, Agricultural Experts)
-- Supports multi-language content (English and Hindi)
CREATE TABLE IF NOT EXISTS public.professionals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- ============================================
    -- ENGLISH CONTENT (Primary)
    -- ============================================
    name TEXT NOT NULL,
    role TEXT NOT NULL,                      -- "Veterinary Doctor", "Agricultural Expert"
    department TEXT,                          -- "Animal Husbandry", "Agriculture"
    
    -- ============================================
    -- HINDI CONTENT (हिंदी)
    -- ============================================
    name_hi TEXT,                             -- Hindi name (optional transliteration)
    role_hi TEXT,                             -- Hindi role (पशु चिकित्सक)
    department_hi TEXT,                       -- Hindi department (पशुपालन विभाग)
    
    -- ============================================
    -- SHARED FIELDS (Language Independent)
    -- ============================================
    category TEXT NOT NULL,                   -- "livestock-veterinary", "crop-expert", "soil-expert"
    
    -- Contact & Image
    image_url TEXT,
    phone_number TEXT,
    email TEXT,
    
    -- Location
    district TEXT,
    block TEXT,
    
    -- Service Details (JSONB for flexibility)
    service_area JSONB,                       -- {"blocks": ["A", "B"], "district": "X"}
    specializations JSONB,                    -- ["Cattle", "Poultry", "Organic Farming"]
    specializations_hi JSONB,                 -- Hindi specializations ["मवेशी", "मुर्गी पालन"]
    qualifications JSONB,                     -- ["BVSc", "MVSc"]
    
    -- Availability
    is_available BOOLEAN DEFAULT true,
    available_days TEXT[],                    -- ['Monday', 'Tuesday', 'Wednesday']
    available_hours TEXT,                     -- "9:00 AM - 5:00 PM"
    
    -- Stats
    total_consultations INTEGER DEFAULT 0,
    rating NUMERIC(2, 1) DEFAULT 0,           -- 0.0 to 5.0
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Index for category filtering
CREATE INDEX IF NOT EXISTS professionals_category_idx ON public.professionals(category);

-- Index for district filtering
CREATE INDEX IF NOT EXISTS professionals_district_idx ON public.professionals(district);

-- Index for available professionals
CREATE INDEX IF NOT EXISTS professionals_available_idx ON public.professionals(is_available) WHERE is_available = true;

-- Recent Connections (History)
CREATE TABLE IF NOT EXISTS public.connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    professional_id UUID REFERENCES public.professionals(id) ON DELETE SET NULL,
    
    method connection_method NOT NULL, -- 'call', 'chat', 'appointment'
    
    -- Connection details
    duration_seconds INTEGER, -- For calls
    notes TEXT,
    
    -- Timestamps
    connected_on TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Index for user's connections
CREATE INDEX IF NOT EXISTS connections_user_idx ON public.connections(user_id);

-- Index for professional's connections
CREATE INDEX IF NOT EXISTS connections_professional_idx ON public.connections(professional_id);

-- ==================================================================
-- 7. APPOINTMENTS TABLE
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
    reason TEXT,
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Index for user's appointments lookup
CREATE INDEX IF NOT EXISTS appointments_user_id_idx ON public.appointments(user_id);

-- Index for professional's appointments lookup
CREATE INDEX IF NOT EXISTS appointments_professional_id_idx ON public.appointments(professional_id);

-- Index for date-based queries (availability checking)
CREATE INDEX IF NOT EXISTS appointments_date_idx ON public.appointments(appointment_date);

-- Composite index for checking availability (professional + date + status)
CREATE INDEX IF NOT EXISTS appointments_availability_idx 
ON public.appointments(professional_id, appointment_date, status);

-- ==================================================================
-- 8. ANALYTICS & AUDIT TABLES
-- ==================================================================

-- Activity Log for tracking user actions (Analytics)
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    
    action_type TEXT NOT NULL, -- 'registration', 'scheme_view', 'professional_contact', etc.
    entity_type TEXT,          -- 'user', 'scheme', 'professional', 'banner'
    entity_id UUID,            -- ID of the related entity
    
    metadata JSONB,            -- Additional context
    
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Index for user activity
CREATE INDEX IF NOT EXISTS activity_logs_user_idx ON public.activity_logs(user_id);

-- Index for action type filtering
CREATE INDEX IF NOT EXISTS activity_logs_action_idx ON public.activity_logs(action_type);

-- Index for date filtering
CREATE INDEX IF NOT EXISTS activity_logs_date_idx ON public.activity_logs(created_at);

-- ==================================================================
-- 9. ANALYTICS FUNCTIONS
-- ==================================================================

-- Function to get user density for heatmaps
CREATE OR REPLACE FUNCTION get_heatmap_data()
RETURNS TABLE (
    lat FLOAT,
    lng FLOAT,
    intensity INT
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ST_Y(location::geometry) as lat,
        ST_X(location::geometry) as lng,
        1 as intensity
    FROM public.users
    WHERE location IS NOT NULL;
END;
$$;

-- Function to get dashboard statistics
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE (
    total_farmers BIGINT,
    total_land_coverage NUMERIC,
    livestock_count BIGINT,
    active_schemes BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM public.users WHERE is_active = true),
        (SELECT COALESCE(SUM(total_land_area), 0) FROM public.land_details),
        (SELECT COALESCE(SUM(cow + buffalo + goat + sheep + pig + poultry + others), 0) FROM public.livestock_details),
        (SELECT COUNT(*) FROM public.schemes WHERE is_active = true);
END;
$$;

-- Function to get user distribution by district
CREATE OR REPLACE FUNCTION get_user_distribution()
RETURNS TABLE (
    district_name TEXT,
    farmer_count BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        district as district_name,
        COUNT(*) as farmer_count
    FROM public.users
    WHERE district IS NOT NULL AND is_active = true
    GROUP BY district
    ORDER BY farmer_count DESC;
END;
$$;

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
    p_max_appointments INT DEFAULT 6
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

-- ==================================================================
-- 10. UTILITY FUNCTIONS
-- ==================================================================

-- Function to automatically clean up expired OTPs
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

-- Function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$;

-- ==================================================================
-- 11. TRIGGERS
-- ==================================================================

-- Trigger for users table
DROP TRIGGER IF EXISTS users_updated_at_trigger ON public.users;
CREATE TRIGGER users_updated_at_trigger
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for schemes table
DROP TRIGGER IF EXISTS schemes_updated_at_trigger ON public.schemes;
CREATE TRIGGER schemes_updated_at_trigger
    BEFORE UPDATE ON public.schemes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for banners table
DROP TRIGGER IF EXISTS banners_updated_at_trigger ON public.banners;
CREATE TRIGGER banners_updated_at_trigger
    BEFORE UPDATE ON public.banners
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for professionals table
DROP TRIGGER IF EXISTS professionals_updated_at_trigger ON public.professionals;
CREATE TRIGGER professionals_updated_at_trigger
    BEFORE UPDATE ON public.professionals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for appointments table
DROP TRIGGER IF EXISTS appointments_updated_at_trigger ON public.appointments;
CREATE TRIGGER appointments_updated_at_trigger
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==================================================================
-- 12. ROW LEVEL SECURITY (RLS)
-- ==================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.land_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.livestock_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- ==================================================================
-- 13. RLS POLICIES
-- ==================================================================

-- Public read access for content tables (Schemes, Banners, Professionals)
CREATE POLICY "Public schemes are viewable by everyone" 
ON public.schemes FOR SELECT USING (true);

CREATE POLICY "Public banners are viewable by everyone" 
ON public.banners FOR SELECT USING (true);

CREATE POLICY "Public professionals are viewable by everyone" 
ON public.professionals FOR SELECT USING (true);

-- Service role full access (for backend operations)
CREATE POLICY "Service role can manage all users" 
ON public.users FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can manage all land_details" 
ON public.land_details FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can manage all livestock_details" 
ON public.livestock_details FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can manage OTPs" 
ON public.otps FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can manage all schemes" 
ON public.schemes FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can manage all banners" 
ON public.banners FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can manage all notifications" 
ON public.notifications FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can manage all professionals" 
ON public.professionals FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can manage all connections" 
ON public.connections FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can manage all appointments" 
ON public.appointments FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can manage all activity_logs" 
ON public.activity_logs FOR ALL TO service_role USING (true);

-- Authenticated user policies (for mobile app users)
-- Users can view their own data
CREATE POLICY "Users can view own profile" 
ON public.users FOR SELECT TO authenticated 
USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" 
ON public.users FOR UPDATE TO authenticated 
USING (auth.uid()::text = id::text)
WITH CHECK (auth.uid()::text = id::text);

-- Users can view their own land/livestock details
CREATE POLICY "Users can view own land details" 
ON public.land_details FOR SELECT TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Users can manage own land details" 
ON public.land_details FOR ALL TO authenticated 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own livestock details" 
ON public.livestock_details FOR SELECT TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Users can manage own livestock details" 
ON public.livestock_details FOR ALL TO authenticated 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" 
ON public.notifications FOR SELECT TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications (mark read)" 
ON public.notifications FOR UPDATE TO authenticated 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Users can manage their own connections
CREATE POLICY "Users can view own connections" 
ON public.connections FOR SELECT TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Users can create connections" 
ON public.connections FOR INSERT TO authenticated 
WITH CHECK (user_id = auth.uid());

-- Users can manage their own appointments
CREATE POLICY "Users can view own appointments" 
ON public.appointments FOR SELECT TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Users can create appointments" 
ON public.appointments FOR INSERT TO authenticated 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own appointments" 
ON public.appointments FOR UPDATE TO authenticated 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ==================================================================
-- 14. INITIAL SEED DATA (Optional)
-- ==================================================================

-- Insert default scheme categories (uncomment to seed)
/*
INSERT INTO public.schemes (title, description, category, is_active) VALUES
('PM-KISAN', 'Pradhan Mantri Kisan Samman Nidhi - Financial support of Rs. 6000 per year', 'Financial Support', true),
('Kisan Credit Card', 'Easy credit access for farmers at subsidized interest rates', 'Financial Support', true),
('Soil Health Card', 'Get your soil tested and receive crop-specific nutrient recommendations', 'Advisory', true)
ON CONFLICT DO NOTHING;
*/

-- ==================================================================
-- END OF PRODUCTION SCHEMA
-- ==================================================================
