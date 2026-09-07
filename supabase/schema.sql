-- ====================================================================
-- NeuroSathi NER - Supabase PostgreSQL Database Schema
-- Problem Statement: SIH26003 (Smart India Hackathon 2026)
-- Team: Mavericks
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Patients and Caregivers)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('elder', 'caregiver', 'admin')),
    preferred_language TEXT DEFAULT 'en',
    age INTEGER DEFAULT 72,
    gender TEXT DEFAULT 'Female',
    blood_group TEXT DEFAULT 'O+',
    location TEXT DEFAULT 'Guwahati, Assam',
    medical_stage TEXT DEFAULT 'Early-stage Dementia / MCI',
    allergies TEXT DEFAULT 'None reported',
    doctor_name TEXT DEFAULT 'Dr. Anupam Sarma (Neurologist)',
    doctor_phone TEXT DEFAULT '+91 98640 12345',
    doctor_hospital TEXT DEFAULT 'Guwahati Neurological Center, Assam',
    emergency_contact_name TEXT,
    emergency_contact_relation TEXT,
    emergency_contact_phone TEXT,
    emergency_contact_email TEXT,
    emergency_contact_address TEXT,
    streak_count INTEGER DEFAULT 1,
    total_stars INTEGER DEFAULT 25,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Patient Devices (Device-level persistent pairing for elderly patients)
CREATE TABLE IF NOT EXISTS public.patient_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    device_identifier TEXT UNIQUE NOT NULL,
    device_name TEXT NOT NULL DEFAULT 'Elder Tablet / Home Display',
    paired_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    active BOOLEAN DEFAULT true,
    pin_enabled BOOLEAN DEFAULT false,
    hashed_pin TEXT, -- SHA-256 hashed PIN, never stored as plaintext
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Caregiver - Patient Association
CREATE TABLE IF NOT EXISTS public.caregiver_patient (
    caregiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    relationship TEXT DEFAULT 'Primary Caregiver',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (caregiver_id, patient_id)
);

-- 4. Accessibility Preferences
CREATE TABLE IF NOT EXISTS public.accessibility_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    font_size TEXT DEFAULT 'large' CHECK (font_size IN ('small', 'medium', 'large', 'xlarge')),
    high_contrast_mode TEXT DEFAULT 'standard' CHECK (high_contrast_mode IN ('standard', 'warm_sepia', 'yellow_black', 'cyan_dark')),
    reduced_motion BOOLEAN DEFAULT false,
    auto_voice_read BOOLEAN DEFAULT true,
    large_buttons BOOLEAN DEFAULT true,
    selected_language TEXT DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Cognitive Games Definition
CREATE TABLE IF NOT EXISTS public.games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    cultural_region TEXT DEFAULT 'North Eastern Region (NER)',
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Game Results & Telemetry
CREATE TABLE IF NOT EXISTS public.game_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    game_slug TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    score INTEGER NOT NULL,
    max_score INTEGER DEFAULT 100,
    attempts INTEGER DEFAULT 1,
    duration_seconds INTEGER NOT NULL,
    mistakes INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT true,
    cultural_theme TEXT,
    encouraging_message TEXT,
    adaptive_next_difficulty TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Memory Reminders
CREATE TABLE IF NOT EXISTS public.reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('medicine', 'water', 'appointment', 'daily_task', 'meal')),
    time_schedule TEXT NOT NULL,
    dosage_or_detail TEXT,
    audio_prompt TEXT,
    icon_name TEXT DEFAULT 'Pill',
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Caregiver Alerts
CREATE TABLE IF NOT EXISTS public.caregiver_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
    message TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Activity Logs
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caregiver_patient ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accessibility_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caregiver_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Public demo access policies (for hackathon demo simplicity)
CREATE POLICY "Allow public all on profiles" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Allow public all on patient_devices" ON public.patient_devices FOR ALL USING (true);
CREATE POLICY "Allow public all on caregiver_patient" ON public.caregiver_patient FOR ALL USING (true);
CREATE POLICY "Allow public all on reminders" ON public.reminders FOR ALL USING (true);
CREATE POLICY "Allow public all on game_results" ON public.game_results FOR ALL USING (true);
CREATE POLICY "Allow public all on caregiver_alerts" ON public.caregiver_alerts FOR ALL USING (true);
CREATE POLICY "Allow public all on accessibility_preferences" ON public.accessibility_preferences FOR ALL USING (true);
CREATE POLICY "Allow public all on activity_logs" ON public.activity_logs FOR ALL USING (true);

-- ====================================================================
-- SEED DATA: Demo Patient (Lakshmi) & Demo Caregiver
-- ====================================================================

-- Demo Caregiver Profile
INSERT INTO public.profiles (id, name, role, preferred_language, emergency_contact_name, emergency_contact_phone, emergency_contact_email)
VALUES (
    'c0000000-0000-0000-0000-000000000001',
    'Dr. Priya Sharma (Caregiver)',
    'caregiver',
    'en',
    'Emergency Desk',
    '+91 98765 43210',
    'caregiver@neurosathi.in'
) ON CONFLICT (id) DO NOTHING;

-- Demo Elderly Patient Profile (Lakshmi)
INSERT INTO public.profiles (id, name, role, preferred_language, age, gender, blood_group, location, medical_stage, emergency_contact_name, emergency_contact_phone, emergency_contact_email)
VALUES (
    'e0000000-0000-0000-0000-000000000001',
    'Lakshmi Devi',
    'elder',
    'en',
    72,
    'Female',
    'B+',
    'Guwahati, Assam',
    'Mild Cognitive Impairment (Early Stage)',
    'Dr. Priya Sharma (Daughter)',
    '+91 98765 43210',
    'caregiver@neurosathi.in'
) ON CONFLICT (id) DO NOTHING;

-- Link Caregiver & Lakshmi
INSERT INTO public.caregiver_patient (caregiver_id, patient_id, relationship)
VALUES (
    'c0000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000001',
    'Daughter & Primary Caregiver'
) ON CONFLICT DO NOTHING;

-- Pair Default Tablet for Lakshmi (PIN 1234 hashed with SHA-256: 03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4)
INSERT INTO public.patient_devices (patient_id, device_identifier, device_name, pin_enabled, hashed_pin)
VALUES (
    'e0000000-0000-0000-0000-000000000001',
    'NS-DEV-LAKSHMI-01',
    'Lakshmi Living Room Tablet',
    false,
    '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'
) ON CONFLICT DO NOTHING;

-- ====================================================================
-- PERMISSIONS: Ensure anon and authenticated roles have table access
-- ====================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

