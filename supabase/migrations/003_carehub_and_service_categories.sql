-- Migration: Add CareHub inquiries table and update service categories
-- Run this in Supabase SQL Editor

-- 1. Create CareHub Inquiries Table
CREATE TABLE IF NOT EXISTS carehub_inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  society_name TEXT NOT NULL,
  location TEXT NOT NULL,
  total_flats INTEGER,
  message TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'in_progress', 'converted', 'closed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE carehub_inquiries ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public inserts (for inquiry form)
CREATE POLICY "Allow public carehub inquiry submissions" ON carehub_inquiries
  FOR INSERT TO anon
  WITH CHECK (true);

-- Policy: Allow authenticated users to view all (for ops dashboard)
CREATE POLICY "Allow authenticated users to view carehub inquiries" ON carehub_inquiries
  FOR SELECT TO authenticated
  USING (true);

-- Policy: Allow authenticated users to update (for ops dashboard)
CREATE POLICY "Allow authenticated users to update carehub inquiries" ON carehub_inquiries
  FOR UPDATE TO authenticated
  USING (true);

-- 2. Update bookings table service_category constraint
-- First, update existing values to new categories
UPDATE bookings SET service_category = 'homecare' WHERE service_category IN ('home-visit', 'nursing');
UPDATE bookings SET service_category = 'diagnostics' WHERE service_category = 'lab';
-- teleconsult stays the same, chronic and diagnostics are new

-- Drop old constraint if exists and add new one
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_service_category_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_service_category_check 
  CHECK (service_category IS NULL OR service_category IN ('homecare', 'teleconsult', 'chronic', 'diagnostics'));

-- 3. Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_carehub_inquiries_status ON carehub_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_carehub_inquiries_created_at ON carehub_inquiries(created_at DESC);

-- 4. Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_carehub_inquiries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS carehub_inquiries_updated_at ON carehub_inquiries;
CREATE TRIGGER carehub_inquiries_updated_at
  BEFORE UPDATE ON carehub_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_carehub_inquiries_updated_at();
