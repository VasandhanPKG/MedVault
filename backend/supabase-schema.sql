-- ==============================================================================
-- 🏥 MedVault — Supabase PostgreSQL Database Schema
-- Run this SQL in your Supabase Project Dashboard -> SQL Editor -> New Query
-- ==============================================================================

-- 1. Create Users & Patient Profiles Table
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    dob TEXT,
    gender TEXT,
    blood_group TEXT DEFAULT 'O+',
    phone TEXT,
    height TEXT,
    weight TEXT,
    allergies JSONB DEFAULT '[]'::jsonb,
    conditions JSONB DEFAULT '[]'::jsonb,
    emergency_contact JSONB DEFAULT '{"name":"","relation":"","phone":""}'::jsonb,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Medical Records Table
CREATE TABLE IF NOT EXISTS public.medical_records (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'PDF',
    category TEXT NOT NULL DEFAULT 'Lab Report',
    status TEXT NOT NULL DEFAULT 'processed',
    size TEXT NOT NULL DEFAULT '0 KB',
    summary TEXT,
    file_url TEXT,
    extracted_markers JSONB DEFAULT '[]'::jsonb,
    raw_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Vitals Table
CREATE TABLE IF NOT EXISTS public.vitals (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    systolic INTEGER NOT NULL,
    diastolic INTEGER NOT NULL,
    heart_rate INTEGER NOT NULL,
    blood_glucose INTEGER NOT NULL,
    weight_kg NUMERIC(5,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Emergency Access Tokens Table
CREATE TABLE IF NOT EXISTS public.emergency_access (
    token TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    blood_group TEXT NOT NULL,
    allergies JSONB DEFAULT '[]'::jsonb,
    conditions JSONB DEFAULT '[]'::jsonb,
    emergency_contact JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create AI Chat History Table
CREATE TABLE IF NOT EXISTS public.ai_chat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sources JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- Indexes for High Performance
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_medical_records_user_id ON public.medical_records(user_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_date ON public.medical_records(date DESC);
CREATE INDEX IF NOT EXISTS idx_vitals_user_id ON public.vitals(user_id);
CREATE INDEX IF NOT EXISTS idx_vitals_date ON public.vitals(date ASC);
CREATE INDEX IF NOT EXISTS idx_emergency_access_token ON public.emergency_access(token);
CREATE INDEX IF NOT EXISTS idx_emergency_access_expires ON public.emergency_access(expires_at);

-- ==============================================================================
-- Enable Row Level Security (RLS) & Public Access Policies for API Server
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat ENABLE ROW LEVEL SECURITY;

-- Allow service role and authenticated queries full access
CREATE POLICY "Allow all access to service role and authenticated users on users"
    ON public.users FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all access to service role and authenticated users on medical_records"
    ON public.medical_records FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all access to service role and authenticated users on vitals"
    ON public.vitals FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all access on emergency_access"
    ON public.emergency_access FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all access on ai_chat"
    ON public.ai_chat FOR ALL
    USING (true)
    WITH CHECK (true);

-- ==============================================================================
-- Seed Demo User for Initial Testing
-- ==============================================================================
INSERT INTO public.users (
    id, name, email, dob, gender, blood_group, phone, height, weight,
    allergies, conditions, emergency_contact, password_hash
) VALUES (
    'usr-1',
    'Aarav Sharma',
    'aarav.sharma@example.com',
    '1992-04-18',
    'Male',
    'O+',
    '+91 98200 41122',
    '178 cm',
    '76 kg',
    '["Penicillin", "Dust mite"]'::jsonb,
    '["Pre-diabetes", "Vitamin D deficiency"]'::jsonb,
    '{"name": "Meera Sharma", "relation": "Spouse", "phone": "+91 98111 20034"}'::jsonb,
    '$2a$10$wEkgk5Z3KsmQ7iGjF7O01.f4aN5v9Bsmc8t2L2M8.1Y1q9m0.2N3y' -- Password: Password123!
) ON CONFLICT (id) DO NOTHING;
