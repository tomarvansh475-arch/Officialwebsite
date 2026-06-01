-- =========================================================================
--               PASCHIMANCHAL VIKAS PARISHAD - SUPABASE SCHEMA MIGRATION
-- =========================================================================
-- Copy this script, open your Supabase Dashboard SQL Editor (https://supabase.com)
-- and press RUN to build the necessary structure in your project database.

-- Enable UUID extension (if needed)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SITE CONTENT TABLE (CMS SETTINGS)
CREATE TABLE IF NOT EXISTS pvp_site_content (
    id TEXT PRIMARY KEY,
    content JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CAMPAIGNS TABLE
CREATE TABLE IF NOT EXISTS pvp_campaigns (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image TEXT,
    goal NUMERIC DEFAULT 0,
    raised NUMERIC DEFAULT 0,
    pledged_count INT DEFAULT 0,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. NEWS SECTION TABLE
CREATE TABLE IF NOT EXISTS pvp_news (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    image TEXT,
    views INT DEFAULT 0,
    date TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TEAM MEMBERS TABLE
CREATE TABLE IF NOT EXISTS pvp_team (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT,
    image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MARGDARSHAK/GUIDE MEMBERS TABLE
CREATE TABLE IF NOT EXISTS pvp_guides (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT,
    image TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. GALLERY IMAGES TABLE
CREATE TABLE IF NOT EXISTS pvp_gallery (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    title TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. VOLUNTEER MEMBERSHIP DATA TABLE
CREATE TABLE IF NOT EXISTS pvp_volunteers (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    branch TEXT,
    city TEXT,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    fathers_name TEXT,
    dob TEXT,
    occupation TEXT,
    block TEXT,
    district TEXT,
    photo_url TEXT,
    is_politically_affiliated BOOLEAN DEFAULT FALSE,
    political_details TEXT,
    has_criminal_record BOOLEAN DEFAULT FALSE,
    criminal_details TEXT,
    will_abide_rules BOOLEAN DEFAULT TRUE,
    help_modes JSONB DEFAULT '[]'::jsonb,
    digital_signature TEXT,
    name_confirmation TEXT,
    certificate_no TEXT,
    status TEXT DEFAULT 'लंबित (Pending Review)'
);

-- 8. DONATIONS TABLE (SECURE RECORDS)
CREATE TABLE IF NOT EXISTS pvp_donations (
    receipt_id TEXT PRIMARY KEY,
    donor_name TEXT NOT NULL,
    donor_email TEXT,
    donor_phone TEXT,
    pan TEXT,
    amount NUMERIC DEFAULT 0,
    date TEXT,
    status TEXT DEFAULT 'लंबित (Pending Verification)',
    user_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. USER PROFILES TABLE (SUPABASE AUTH LINKED)
CREATE TABLE IF NOT EXISTS pvp_users (
    uid TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    bio TEXT,
    role TEXT DEFAULT 'user',
    joined_campaign_ids JSONB DEFAULT '[]'::jsonb,
    volunteered_pillars JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    volunteer_id TEXT
);

-- Enable RLS (Row Level Security) - Optional: If disabled, you can write from Client-side
-- For simplicity of a client-side only app, these tables can be default write-public or
-- we can configure RLS so that everyone can read but authenticated users / admins can edit.
-- For a seamless setup, let's keep them editable by anonymous/authenticated users in Supabase,
-- or configure standard policies if needed.

-- Inserting standard default data to initialize
INSERT INTO pvp_site_content (id, content) VALUES ('main', '{}') ON CONFLICT (id) DO NOTHING;


-- =========================================================================
--  CRITICAL FIX: GRANT CLIENT-SIDE WRITE/READ PERMISSIONS (anon, authenticated)
-- =========================================================================
-- When you create tables in Supabase SQL editor, the default client-side 
-- anonymous role ("anon") used by the frontend library does not have standard
-- CRUD privileges. Running the SQL lines below grants full select, insert, 
-- update, and delete access to the public API client.

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- If you still encounter "permission denied" or RLS-blocked errors, 
-- you can choose ONE of the two solutions below:

-- -------------------------------------------------------------------------
-- OPTION A: DISABLE ROW LEVEL SECURITY (Recommended for simple direct-sync)
-- -------------------------------------------------------------------------
ALTER TABLE public.pvp_site_content DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pvp_campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pvp_news DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pvp_team DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pvp_guides DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pvp_gallery DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pvp_volunteers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pvp_donations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pvp_users DISABLE ROW LEVEL SECURITY;


-- -------------------------------------------------------------------------
-- OPTION B: ENABLE RLS AND DEFINE EXPLICIT PERMISSIVE PUBLIC POLICIES
-- -------------------------------------------------------------------------
-- Uncomment the blocks below if you choose to enforce RLS instead of Option A.

/*
-- 1. Enable RLS
ALTER TABLE public.pvp_site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pvp_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pvp_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pvp_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pvp_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pvp_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pvp_volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pvp_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pvp_users ENABLE ROW LEVEL SECURITY;

-- 2. Create Open Read/Write Policies for public client operations
CREATE POLICY "Enable read/write for all on pvp_site_content" ON public.pvp_site_content FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable read/write for all on pvp_campaigns" ON public.pvp_campaigns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable read/write for all on pvp_news" ON public.pvp_news FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable read/write for all on pvp_team" ON public.pvp_team FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable read/write for all on pvp_guides" ON public.pvp_guides FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable read/write for all on pvp_gallery" ON public.pvp_gallery FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable read/write for all on pvp_volunteers" ON public.pvp_volunteers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable read/write for all on pvp_donations" ON public.pvp_donations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable read/write for all on pvp_users" ON public.pvp_users FOR ALL USING (true) WITH CHECK (true);
*/

