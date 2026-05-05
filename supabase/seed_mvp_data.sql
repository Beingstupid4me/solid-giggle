-- ============================================================================
-- Sanocare MVP Patient Vault Seed Data
-- Run this in your Supabase SQL Editor to populate dummy data for testing
-- and temporarily allow anonymous read access for the MVP workflow.
-- ============================================================================
-- ============================================================================
-- 1. Ensure Schema is Up to Date (Phase 8 additions)
-- ============================================================================

-- Create family_members table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.family_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  primary_user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  relationship text NOT NULL,
  age integer,
  blood_group text,
  allergies text,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure primary_user_id exists just in case it was created with user_id
DO $$
BEGIN
  BEGIN
    ALTER TABLE public.family_members ADD COLUMN primary_user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE;
  EXCEPTION
    WHEN duplicate_column THEN null;
  END;
END $$;

-- Extend Consultations Table
ALTER TABLE public.consultations 
ADD COLUMN IF NOT EXISTS family_member_id uuid REFERENCES public.family_members(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS service_type text DEFAULT 'homecare',
ADD COLUMN IF NOT EXISTS meet_link text,
ADD COLUMN IF NOT EXISTS doctor_notes text,
ADD COLUMN IF NOT EXISTS prescription_url text,
ADD COLUMN IF NOT EXISTS base_cost numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS time_cost numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS distance_cost numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS dispatched_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS arrived_at TIMESTAMPTZ;

-- ============================================================================
-- 2. Seed Data
-- ============================================================================

DO $$
DECLARE
  v_patient_id uuid := '00000000-0000-0000-0000-000000000999';
  v_doctor_id uuid := '00000000-0000-0000-0000-000000000003'; -- Assuming Dr. Sanyam exists or we'll create
  v_medic_id uuid := '00000000-0000-0000-0000-000000000004'; -- Assuming Medic Ramesh exists
  v_family_parent_id uuid;
  v_family_self_id uuid;
  v_consultation_active uuid;
  v_consultation_closed uuid;
BEGIN
  -- 1. Create or update the MVP Patient Profile
  INSERT INTO public.profiles (id, full_name, phone, role, is_online, created_at)
  VALUES (
    v_patient_id, 
    'MVP Patient', 
    '+919000000999', 
    'patient', 
    false, 
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone;

  -- Ensure Doctor exists
  INSERT INTO public.profiles (id, full_name, phone, role, is_online)
  VALUES (v_doctor_id, 'Dr. MVP Doctor', '+919000000888', 'doctor', true)
  ON CONFLICT (id) DO NOTHING;

  -- Ensure Medic exists
  INSERT INTO public.profiles (id, full_name, phone, role, is_online)
  VALUES (v_medic_id, 'MVP Medic', '+919000000777', 'medic', true)
  ON CONFLICT (id) DO NOTHING;

  -- 2. Create Family Members
  INSERT INTO public.family_members (primary_user_id, full_name, relationship, age, blood_group, allergies)
  VALUES 
    (v_patient_id, 'MVP Patient', 'Self', 31, 'B+', 'None known')
  RETURNING id INTO v_family_self_id;

  INSERT INTO public.family_members (primary_user_id, full_name, relationship, age, blood_group, allergies)
  VALUES 
    (v_patient_id, 'Anita MVP', 'Parent', 58, 'A+', 'Penicillin')
  RETURNING id INTO v_family_parent_id;

  -- 3. Create Consultations (One active, one closed)
  INSERT INTO public.consultations (
    patient_id, medic_id, doctor_id, family_member_id, status, service_type, 
    patient_location, address_line, meet_link, created_at, dispatched_at, cost_total
  )
  VALUES (
    v_patient_id, v_medic_id, v_doctor_id, v_family_self_id, 'in_consultation', 'homecare',
    ST_SetSRID(ST_MakePoint(77.2090, 28.6139), 4326)::geography, 'MVP Address, NY', 
    'https://meet.jit.si/SanoCare-MVP-Active', now() - interval '10 minutes', now() - interval '20 minutes', 499
  )
  RETURNING id INTO v_consultation_active;

  INSERT INTO public.consultations (
    patient_id, medic_id, doctor_id, family_member_id, status, service_type, 
    patient_location, address_line, doctor_notes, prescription_url, created_at, closed_at, cost_total
  )
  VALUES (
    v_patient_id, v_medic_id, v_doctor_id, v_family_parent_id, 'closed', 'teleconsult',
    ST_SetSRID(ST_MakePoint(77.2090, 28.6139), 4326)::geography, 'MVP Address, NY', 
    'Patient is stable. Keep monitoring BP.', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 
    now() - interval '3 days', now() - interval '3 days' + interval '40 minutes', 699
  )
  RETURNING id INTO v_consultation_closed;

  -- 4. Create Vitals
  INSERT INTO public.vitals (
    consultation_id, medic_id, systolic, diastolic, heart_rate, temperature, spo2, captured_at
  )
  VALUES
    (v_consultation_active, v_medic_id, 126, 84, 88, 99.1, 97, now() - interval '5 minutes'),
    (v_consultation_closed, v_medic_id, 130, 85, 75, 98.4, 98, now() - interval '3 days' + interval '10 minutes');

  RAISE NOTICE 'MVP Seed Data successfully inserted.';
END $$;

-- ============================================================================
-- TEMPORARY MVP RLS BYPASS (FOR DEVELOPMENT WITHOUT AUTH)
-- ============================================================================
-- WARNING: These policies allow public anonymous reads so the UI can fetch data
-- without requiring a login session. Remove these before going to production!

-- Enable anonymous read on profiles
DROP POLICY IF EXISTS "Enable public read for MVP profiles" ON public.profiles;
CREATE POLICY "Enable public read for MVP profiles" ON public.profiles FOR SELECT USING (true);

-- Enable anonymous read on family_members
DROP POLICY IF EXISTS "Enable public read for MVP family" ON public.family_members;
CREATE POLICY "Enable public read for MVP family" ON public.family_members FOR SELECT USING (true);

-- Enable anonymous insert on family_members (so Add Member button works in dev)
DROP POLICY IF EXISTS "Enable public insert for MVP family" ON public.family_members;
CREATE POLICY "Enable public insert for MVP family" ON public.family_members FOR INSERT WITH CHECK (true);

-- Enable anonymous read on consultations
DROP POLICY IF EXISTS "Enable public read for MVP consultations" ON public.consultations;
CREATE POLICY "Enable public read for MVP consultations" ON public.consultations FOR SELECT USING (true);

-- Enable anonymous read on vitals
DROP POLICY IF EXISTS "Enable public read for MVP vitals" ON public.vitals;
CREATE POLICY "Enable public read for MVP vitals" ON public.vitals FOR SELECT USING (true);
