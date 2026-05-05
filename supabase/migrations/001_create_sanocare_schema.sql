-- ============================================================================
-- Sanocare Portal Schema (v2.0.0)
-- Based on CONTRACT.md v2.1
-- Deployment: Production-ready with RLS policies
-- ============================================================================

-- Enable PostGIS for spatial queries
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

CREATE TYPE user_role AS ENUM ('patient', 'medic', 'doctor', 'admin');
CREATE TYPE consultation_status AS ENUM (
  'pending',
  'assigned',
  'in_transit',
  'arrived',
  'vitals_captured',
  'in_consultation',
  'closed',
  'cancelled'
);
CREATE TYPE service_type AS ENUM ('homecare', 'teleconsult', 'diagnostics');
CREATE TYPE risk_tag AS ENUM ('stable', 'monitor', 'escalate');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'refunded');
CREATE TYPE dispatch_status AS ENUM ('searching', 'assigned', 'accepted', 'rejected', 'timeout');

-- ============================================================================
-- 1. PROFILES TABLE (Users)
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL,
  avatar_url TEXT,

  -- Spatial data (Medics only)
  live_location geography(POINT, 4326),
  location_updated_at TIMESTAMP WITH TIME ZONE,

  -- Medic-specific fields
  unit_code TEXT,
  shift_start TIME,
  shift_end TIME,
  is_online BOOLEAN DEFAULT false,
  battery_percent INT DEFAULT 100,
  last_battery_alert_at TIMESTAMP WITH TIME ZONE,

  -- Patient-specific fields
  blood_group TEXT,
  allergies TEXT,
  medical_history TEXT,
  relationship TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_phone ON profiles(phone);
CREATE INDEX idx_profiles_is_online ON profiles(is_online) WHERE role = 'medic' AND is_online = true;
CREATE INDEX idx_profiles_location ON profiles USING GIST(live_location) WHERE role = 'medic';

-- ============================================================================
-- 2. CONSULTATIONS TABLE (Cases)
-- ============================================================================

CREATE TABLE IF NOT EXISTS consultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  medic_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  doctor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  status consultation_status DEFAULT 'pending',
  service_type service_type NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE,

  -- Location
  patient_location geography(POINT, 4326) NOT NULL,
  address_line TEXT,
  carehub_id UUID,

  -- Timeline
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  assigned_at TIMESTAMP WITH TIME ZONE,
  arrived_at TIMESTAMP WITH TIME ZONE,
  consultation_started_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,

  -- Video call
  video_room_id TEXT,
  video_started_at TIMESTAMP WITH TIME ZONE,
  video_ended_at TIMESTAMP WITH TIME ZONE,

  -- Billing
  cost_service DECIMAL(8,2) DEFAULT 499.00,
  cost_distance DECIMAL(8,2) DEFAULT 0,
  cost_time DECIMAL(8,2) DEFAULT 0,
  cost_total DECIMAL(8,2) DEFAULT 499.00,
  payment_status payment_status DEFAULT 'pending',

  notes TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_consultations_patient ON consultations(patient_id);
CREATE INDEX idx_consultations_medic ON consultations(medic_id);
CREATE INDEX idx_consultations_doctor ON consultations(doctor_id);
CREATE INDEX idx_consultations_status ON consultations(status);
CREATE INDEX idx_consultations_created ON consultations(created_at DESC);

-- ============================================================================
-- 3. VITALS TABLE (Immutable, Append-only)
-- ============================================================================

CREATE TABLE IF NOT EXISTS vitals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  medic_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  systolic INT,
  diastolic INT,
  heart_rate INT,
  temperature DECIMAL(5,2),
  spo2 INT,
  blood_sugar INT,
  notes TEXT,

  captured_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_vitals_consultation ON vitals(consultation_id);
CREATE INDEX idx_vitals_medic ON vitals(medic_id);
CREATE INDEX idx_vitals_created ON vitals(captured_at DESC);

-- ============================================================================
-- 4. SOAP_NOTES TABLE (Doctor Consultation Records)
-- ============================================================================

CREATE TABLE IF NOT EXISTS soap_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultation_id UUID NOT NULL UNIQUE REFERENCES consultations(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  subjective TEXT,
  objective TEXT,
  assessment TEXT,
  plan TEXT,
  risk_tag risk_tag,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_soap_consultation ON soap_notes(consultation_id);
CREATE INDEX idx_soap_doctor ON soap_notes(doctor_id);

-- ============================================================================
-- 5. PRESCRIPTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  soap_notes_id UUID REFERENCES soap_notes(id) ON DELETE CASCADE,
  consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,

  medicine_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration TEXT,
  refills INT DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_prescriptions_consultation ON prescriptions(consultation_id);
CREATE INDEX idx_prescriptions_soap ON prescriptions(soap_notes_id);

-- ============================================================================
-- 6. DISPATCH_QUEUE TABLE (Real-time, Ephemeral)
-- ============================================================================

CREATE TABLE IF NOT EXISTS dispatch_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultation_id UUID NOT NULL UNIQUE REFERENCES consultations(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  status dispatch_status DEFAULT 'searching',
  priority_level INT DEFAULT 5,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  assigned_at TIMESTAMP WITH TIME ZONE,
  timeout_at TIMESTAMP WITH TIME ZONE,

  assigned_medic_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  estimated_arrival TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_dispatch_status ON dispatch_queue(status);
CREATE INDEX idx_dispatch_patient ON dispatch_queue(patient_id);
CREATE INDEX idx_dispatch_medic ON dispatch_queue(assigned_medic_id);
CREATE INDEX idx_dispatch_timeout ON dispatch_queue(timeout_at);

-- ============================================================================
-- 7. OFFLINE_SYNC_QUEUE TABLE (Frontend Offline Batching)
-- ============================================================================

CREATE TABLE IF NOT EXISTS offline_sync_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id UUID,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  operation TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  payload JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  synced_at TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'pending'
);

CREATE INDEX idx_sync_user ON offline_sync_queue(user_id);
CREATE INDEX idx_sync_status ON offline_sync_queue(sync_status);
CREATE INDEX idx_sync_created ON offline_sync_queue(created_at DESC);

-- ============================================================================
-- 8. GPS_TRAIL TABLE (Audit Trail for Medic Locations)
-- ============================================================================

CREATE TABLE IF NOT EXISTS gps_trail (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  medic_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  location geography(POINT, 4326) NOT NULL,
  accuracy INT,
  speed DECIMAL(8,2),
  battery_percent INT,

  captured_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_gps_consultation ON gps_trail(consultation_id);
CREATE INDEX idx_gps_medic ON gps_trail(medic_id);
CREATE INDEX idx_gps_created ON gps_trail(captured_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE soap_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispatch_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_sync_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE gps_trail ENABLE ROW LEVEL SECURITY;

-- PROFILES RLS
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid()::UUID = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid()::UUID AND role = 'admin'
    )
  );

CREATE POLICY "Medics can view assigned patient profiles" ON profiles
  FOR SELECT USING (
    role = 'patient' AND
    EXISTS (
      SELECT 1 FROM consultations c
      WHERE c.medic_id = auth.uid()::UUID AND c.patient_id = profiles.id
    )
  );

-- CONSULTATIONS RLS
CREATE POLICY "Patients see their own cases" ON consultations
  FOR SELECT USING (patient_id = auth.uid()::UUID);

CREATE POLICY "Medics see assigned cases" ON consultations
  FOR SELECT USING (medic_id = auth.uid()::UUID);

CREATE POLICY "Doctors see cases they closed" ON consultations
  FOR SELECT USING (doctor_id = auth.uid()::UUID);

CREATE POLICY "Admins see all cases" ON consultations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid()::UUID AND role = 'admin'
    )
  );

-- VITALS RLS
CREATE POLICY "Vitals visible to involved parties" ON vitals
  FOR SELECT USING (
    medic_id = auth.uid()::UUID OR
    EXISTS (
      SELECT 1 FROM consultations c
      WHERE c.id = vitals.consultation_id AND c.patient_id = auth.uid()::UUID
    ) OR
    EXISTS (
      SELECT 1 FROM consultations c
      WHERE c.id = vitals.consultation_id AND c.doctor_id = auth.uid()::UUID
    )
  );

-- SOAP_NOTES RLS
CREATE POLICY "SOAP notes visible to involved parties" ON soap_notes
  FOR SELECT USING (
    doctor_id = auth.uid()::UUID OR
    EXISTS (
      SELECT 1 FROM consultations c
      WHERE c.id = soap_notes.consultation_id AND c.patient_id = auth.uid()::UUID
    )
  );

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Find available medics near patient location
CREATE OR REPLACE FUNCTION find_available_medics(
  patient_lat FLOAT,
  patient_lng FLOAT,
  radius_meters INT DEFAULT 10000
) RETURNS TABLE(
  medic_id UUID,
  name TEXT,
  distance_m FLOAT,
  battery_percent INT,
  is_available BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    (p.live_location <-> ST_SetSRID(ST_MakePoint(patient_lng, patient_lat), 4326))::FLOAT * 111000,
    p.battery_percent,
    (p.is_online AND (SELECT COUNT(*) FROM consultations WHERE medic_id = p.id AND status != 'closed') < 3)
  FROM profiles p
  WHERE p.role = 'medic'::user_role
    AND p.is_online = true
    AND p.battery_percent > 15
    AND p.live_location IS NOT NULL
    AND ST_DWithin(
      p.live_location,
      ST_SetSRID(ST_MakePoint(patient_lng, patient_lat), 4326)::geography,
      radius_meters
    )
  ORDER BY p.live_location <-> ST_SetSRID(ST_MakePoint(patient_lng, patient_lat), 4326)
  LIMIT 5;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Auto-calculate billing on consultation close
CREATE OR REPLACE FUNCTION calculate_consultation_billing()
RETURNS TRIGGER AS $$
DECLARE
  distance_km FLOAT;
  duration_minutes INT;
  cost_time DECIMAL;
BEGIN
  IF NEW.status = 'closed' AND OLD.status != 'closed' THEN
    -- Calculate distance using PostGIS
    IF NEW.patient_location IS NOT NULL THEN
      SELECT ST_Distance(NEW.patient_location, ST_SetSRID(ST_MakePoint(0, 0), 4326))::FLOAT * 111 INTO distance_km;
      NEW.cost_distance := ROUND((distance_km * 20)::NUMERIC, 2);
    END IF;

    -- Calculate duration in minutes
    IF NEW.arrived_at IS NOT NULL AND NEW.closed_at IS NOT NULL THEN
      duration_minutes := EXTRACT(EPOCH FROM (NEW.closed_at - NEW.arrived_at))::INT / 60;
      cost_time := CEIL(duration_minutes::FLOAT / 5) * 100;
      NEW.cost_time := cost_time;
    END IF;

    -- Calculate total
    NEW.cost_total := NEW.cost_service + COALESCE(NEW.cost_distance, 0) + COALESCE(NEW.cost_time, 0);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_billing
BEFORE UPDATE ON consultations
FOR EACH ROW
EXECUTE FUNCTION calculate_consultation_billing();

-- ============================================================================
-- INITIAL DATA (Optional test data)
-- ============================================================================

-- Insert test users (for development only)
-- These should be removed or replaced with real auth in production
INSERT INTO profiles (email, phone, full_name, role, battery_percent, is_online, blood_group)
VALUES 
  ('patient@sanocare.com', '+919876543210', 'Test Patient', 'patient', 100, true, 'O+'),
  ('medic@sanocare.com', '+919876543211', 'Test Medic', 'medic', 85, true, null),
  ('doctor@sanocare.com', '+919876543212', 'Dr. Test', 'doctor', 100, true, null),
  ('admin@sanocare.com', '+919876543213', 'Admin User', 'admin', 100, true, null)
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- MIGRATION METADATA
-- ============================================================================
-- Version: 2.0.0
-- Date: March 2026
-- Author: Senior Fullstack Engineer
-- Purpose: Production-ready Sanocare schema with spatial queries, RLS, and offline support
-- ============================================================================
