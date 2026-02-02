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

-- Define fixed types for Notifications and Connections
CREATE TYPE notification_type AS ENUM ('approval', 'reminder', 'alert');
CREATE TYPE connection_method AS ENUM ('call', 'chat', 'appointment');
CREATE TYPE crop_season AS ENUM ('rabi', 'kharif', 'zaid');

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
    gender TEXT,
    photo_url TEXT,
    mobile_number TEXT UNIQUE NOT NULL,
    aadhaar_number TEXT UNIQUE,
    
    -- Family Details
    fathers_name TEXT,
    mothers_name TEXT,
    educational_qualification TEXT,
    
    -- Family Counts
    sons_married INTEGER DEFAULT 0,
    sons_unmarried INTEGER DEFAULT 0,
    daughters_married INTEGER DEFAULT 0,
    daughters_unmarried INTEGER DEFAULT 0,
    other_family_members INTEGER DEFAULT 0,
    
    -- Address
    village TEXT,
    gram_panchayat TEXT,
    nyay_panchayat TEXT,
    post_office TEXT,
    tehsil TEXT,
    block TEXT,
    district TEXT,
    pin_code TEXT,
    state TEXT,
    
    -- Geospatial Location (CRITICAL FOR HEATMAPS)
    -- Stores explicit Lat/Long as a Geometry Point
    location GEOGRAPHY(POINT, 4326),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Spatial Index: Makes "Farmers near me" and "Heatmap" queries instant
CREATE INDEX IF NOT EXISTS users_geo_index ON public.users USING GIST (location);

-- Land Details (One-to-One Relationship)
CREATE TABLE IF NOT EXISTS public.land_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    total_land_area NUMERIC(10, 2), -- Stores acres/hectares
    rabi_crop TEXT,
    kharif_crop TEXT,
    zaid_crop TEXT,
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Livestock Details (One-to-One Relationship)
CREATE TABLE IF NOT EXISTS public.livestock_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    cow INTEGER DEFAULT 0,
    buffalo INTEGER DEFAULT 0,
    goat INTEGER DEFAULT 0,
    sheep INTEGER DEFAULT 0,
    pig INTEGER DEFAULT 0,
    poultry INTEGER DEFAULT 0,
    others INTEGER DEFAULT 0,
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- ==================================================================
-- 4. CMS TABLES (App Content)
-- ==================================================================

-- Government Schemes & Training Programs
CREATE TABLE IF NOT EXISTS public.schemes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- "Financial Support", "Training", etc.
    
    image_url TEXT,      -- Thumbnail
    hero_image_url TEXT, -- Large banner detail
    
    location TEXT,       -- E.g., "Barabanki Krishi Kendra"
    event_date TIMESTAMP WITH TIME ZONE, 
    
    key_objectives TEXT[], -- Array of strings
    overview TEXT,         -- Long rich text
    process TEXT,          -- Application process steps
    support_contact TEXT,
    apply_url TEXT,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Home Screen Banners
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    subtitle TEXT,
    image_url TEXT NOT NULL,
    redirect_url TEXT,
    
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    
    type notification_type NOT NULL, -- 'approval', 'reminder', 'alert'
    title TEXT NOT NULL,
    message TEXT,
    
    is_read BOOLEAN DEFAULT false,
    icon_name TEXT, -- 'card-outline', etc.
    bg_color TEXT,  -- Hex Code
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- ==================================================================
-- 5. CONNECT SERVICE TABLES (Professionals)
-- ==================================================================

-- Professional Profiles (Doctors, Experts)
CREATE TABLE IF NOT EXISTS public.professionals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,          -- "Animal Doctor"
    department TEXT,             -- "Animal Husbandry"
    category TEXT,               -- "livestock-veterinary"
    
    image_url TEXT,
    phone_number TEXT,
    district TEXT,
    
    -- JSONB allows flexible storage for "Service Area" and "Specializations"
    service_area JSONB,          -- {"blocks": ["A", "B"], "district": "X"}
    specializations JSONB,       -- ["Cattle", "Poultry"]
    
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Recent Connections (History)
CREATE TABLE IF NOT EXISTS public.connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    professional_id UUID REFERENCES public.professionals(id) ON DELETE SET NULL,
    
    connected_on TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    method connection_method NOT NULL -- 'call', 'chat', 'appointment'
);

-- ==================================================================
-- 6. ANALYTICS FUNCTIONS (The Engine)
-- ==================================================================

-- Function to get user density for heatmaps
-- Usage in JS: const { data } = await supabase.rpc('get_heatmap_data')
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

-- ==================================================================
-- 7. ROW LEVEL SECURITY (RLS) - Basic Setup
-- ==================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.land_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.livestock_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- 1. Public Read Access for Content (Schemes/Banners)
-- Anyone (even unauthenticated app users) needs to see schemes
CREATE POLICY "Public schemes are viewable by everyone" 
ON public.schemes FOR SELECT USING (true);

CREATE POLICY "Public banners are viewable by everyone" 
ON public.banners FOR SELECT USING (true);

-- 2. Admin Access (Simplification for 6-day build)
-- In a real app, you would check `auth.uid()` or role. 
-- For now, we allow authenticated users (Admins) to do everything.
CREATE POLICY "Authenticated users can do all on schemes" 
ON public.schemes FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can do all on banners" 
ON public.banners FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can do all on users" 
ON public.users FOR ALL TO authenticated USING (true);

-- ==================================================================
-- END OF SCRIPT
-- ==================================================================