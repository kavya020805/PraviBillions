-- ============================================================
-- Family ID Copilot — Gujarat Supabase Schema
-- ============================================================

-- 1. Families Table
CREATE TABLE IF NOT EXISTS public.families (
  family_id VARCHAR(50) PRIMARY KEY,
  district VARCHAR(50) NOT NULL,
  household_income_annual NUMERIC NOT NULL DEFAULT 0,
  income_band VARCHAR(20) NOT NULL DEFAULT 'lig',
  caste_category VARCHAR(20) NOT NULL DEFAULT 'general',
  land_owned_acres NUMERIC DEFAULT 0,
  house_type VARCHAR(20) DEFAULT 'pucca',
  phone_number VARCHAR(30),
  address TEXT,
  pincode VARCHAR(20),
  area_type VARCHAR(20) DEFAULT 'urban',
  created_by VARCHAR(100),
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Members Table
CREATE TABLE IF NOT EXISTS public.members (
  member_id VARCHAR(50) PRIMARY KEY,
  family_id VARCHAR(50) NOT NULL REFERENCES public.families(family_id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  relation_to_head VARCHAR(50) NOT NULL,
  dob DATE NOT NULL,
  gender VARCHAR(20) NOT NULL,
  marital_status VARCHAR(20) NOT NULL DEFAULT 'single',
  occupation VARCHAR(50) DEFAULT 'none',
  disability_status BOOLEAN DEFAULT FALSE,
  disability_percentage NUMERIC,
  education_level VARCHAR(50) DEFAULT 'secondary',
  is_bpl BOOLEAN DEFAULT FALSE,
  is_alive BOOLEAN DEFAULT TRUE,
  is_pregnant BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_members_family_id ON public.members(family_id);

-- 3. Life Event Logs Table
CREATE TABLE IF NOT EXISTS public.life_event_logs (
  id VARCHAR(50) PRIMARY KEY,
  family_id VARCHAR(50) NOT NULL REFERENCES public.families(family_id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  event_label VARCHAR(100) NOT NULL,
  event_details TEXT,
  eligibility_changes JSONB,
  applied_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_life_events_family_id ON public.life_event_logs(family_id);

-- 4. Duplicate Pairs Table
DROP TABLE IF EXISTS public.duplicate_pairs CASCADE;
CREATE TABLE public.duplicate_pairs (
  id VARCHAR(50) PRIMARY KEY,
  family_a_id VARCHAR(50) NOT NULL,
  family_b_id VARCHAR(50) NOT NULL,
  family_a_head_name VARCHAR(100),
  family_b_head_name VARCHAR(100),
  confidence_score NUMERIC NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  signals JSONB,
  field_comparisons JSONB,
  flagged_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- 5. Profiles Table (User Roles & Household Ownership)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'citizen' CHECK (role IN ('admin', 'citizen')),
  family_id VARCHAR(50) REFERENCES public.families(family_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
