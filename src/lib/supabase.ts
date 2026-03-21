import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our bookings table
export type BookingInsert = {
  patient_name: string;
  phone: string;
  service_category: string;
  specific_ailment?: string;
  manual_address: string;
  gps_location?: {
    lat: number;
    lng: number;
    accuracy: number;
  } | null;
  status?: string;
  amount?: number;
  assigned_paramedic?: string;
};

export type GPSLocation = {
  lat: number;
  lng: number;
  accuracy: number;
};

export type BookingRow = {
  id: string;
  created_at: string;
  patient_name: string;
  phone: string;
  service_category: string;
  specific_ailment?: string | null;
  manual_address: string;
  gps_location?: GPSLocation | null;
  status: BookingStatus;
  amount?: number | null;
  assigned_paramedic?: string | null;
  assigned_paramedic_id?: string | null;
  dispatched_at?: string | null;
  notes?: string | null;
};

export type Paramedic = {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  specialty: string;
  is_active: boolean;
};

// Status types
export type BookingStatus = 'PENDING' | 'DISPATCHED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

// Service label mapping - supports both new and legacy service categories
export const SERVICE_LABELS: Record<string, string> = {
  // New service categories (Sanocare NOW)
  'homecare': 'Homecare',
  'teleconsult': 'Teleconsultation',
  'chronic': 'Chronic Disease Management',
  'diagnostics': 'Early Risk Diagnostics',
  // Legacy categories (backward compatibility)
  'home-visit': 'Doctor Home Visit',
  'nursing': 'Nursing & Paramedic',
  'lab': 'Lab Sample Collection',
};
