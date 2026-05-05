import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// ============================================================================
// TYPE DEFINITIONS (Aligned with CONTRACT.md v2.1)
// ============================================================================

export type UserRole = 'patient' | 'medic' | 'doctor' | 'admin';
export type ConsultationStatus = 
  | 'pending'
  | 'assigned'
  | 'in_transit'
  | 'arrived'
  | 'vitals_captured'
  | 'in_consultation'
  | 'closed'
  | 'cancelled';

export type ServiceType = 'homecare' | 'teleconsult' | 'diagnostics';
export type RiskTag = 'stable' | 'monitor' | 'escalate';
export type PaymentStatus = 'pending' | 'completed' | 'refunded';
export type DispatchStatus = 'searching' | 'assigned' | 'accepted' | 'rejected' | 'timeout';

export interface Profile {
  id: string;
  email: string;
  phone: string;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
  live_location: { type: string; coordinates: [number, number] } | null;
  location_updated_at: string | null;
  unit_code: string | null;
  shift_start: string | null;
  shift_end: string | null;
  is_online: boolean;
  battery_percent: number;
  blood_group: string | null;
  allergies: string | null;
  medical_history: string | null;
  relationship: string | null;
  created_at: string;
  updated_at: string;
}

export interface Consultation {
  id: string;
  patient_id: string;
  medic_id: string | null;
  doctor_id: string | null;
  status: ConsultationStatus;
  service_type: ServiceType;
  scheduled_for: string | null;
  patient_location: { type: string; coordinates: [number, number] };
  address_line: string | null;
  carehub_id: string | null;
  created_at: string;
  assigned_at: string | null;
  arrived_at: string | null;
  consultation_started_at: string | null;
  closed_at: string | null;
  video_room_id: string | null;
  video_started_at: string | null;
  video_ended_at: string | null;
  cost_service: number;
  cost_distance: number;
  cost_time: number;
  cost_total: number;
  payment_status: PaymentStatus;
  notes: string | null;
  updated_at: string;
}

export interface Vitals {
  id: string;
  consultation_id: string;
  medic_id: string;
  systolic: number | null;
  diastolic: number | null;
  heart_rate: number | null;
  temperature: number | null;
  spo2: number | null;
  blood_sugar: number | null;
  notes: string | null;
  captured_at: string;
  synced_at: string;
}

export interface SOAPNotes {
  id: string;
  consultation_id: string;
  doctor_id: string;
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
  risk_tag: RiskTag | null;
  created_at: string;
  updated_at: string;
}

export interface Prescription {
  id: string;
  soap_notes_id: string | null;
  consultation_id: string;
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string | null;
  refills: number;
  created_at: string;
}

export interface DispatchQueue {
  id: string;
  consultation_id: string;
  patient_id: string;
  status: DispatchStatus;
  priority_level: number;
  created_at: string;
  assigned_at: string | null;
  timeout_at: string | null;
  assigned_medic_id: string | null;
  estimated_arrival: string | null;
}

export interface GPSTrail {
  id: string;
  consultation_id: string;
  medic_id: string;
  location: { type: string; coordinates: [number, number] };
  accuracy: number | null;
  speed: number | null;
  battery_percent: number | null;
  captured_at: string;
}

export interface OfflineSyncQueue {
  id: string;
  device_id: string | null;
  user_id: string;
  operation: string;
  table_name: string;
  record_id: string | null;
  payload: Record<string, any>;
  created_at: string;
  synced_at: string | null;
  sync_status: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  metadata?: {
    timestamp: string;
    requestId: string;
  };
}

// ============================================================================
// SERVICE FACTORY TYPES
// ============================================================================

export interface ServiceFactory {
  auth: AuthService;
  consultation: ConsultationService;
  medic: MedicService;
  doctor: DoctorService;
  patient: PatientService;
  admin: AdminService;
  realtime: RealtimeService;
}

// Service Interfaces
export interface AuthService {
  login(email: string, password: string, role: UserRole): Promise<APIResponse<{ token: string; user: Profile }>>;
  sendOTP(phone: string): Promise<APIResponse<{ otpSessionId: string; expiresIn: number }>>;
  verifyOTP(otpSessionId: string, otp: string, phone: string): Promise<APIResponse<{ token: string; user: Profile }>>;
  logout(): Promise<void>;
  refreshToken(): Promise<APIResponse<{ token: string; expiresIn: number }>>;
  getCurrentUser(): Promise<Profile | null>;
}

export interface ConsultationService {
  createBooking(data: {
    profileId: string;
    serviceType: ServiceType;
    patientLocation: { lat: number; lng: number };
    address: string;
    carehubId?: string;
    notes?: string;
  }): Promise<APIResponse<Consultation>>;
  
  getConsultation(consultationId: string): Promise<APIResponse<Consultation>>;
  
  updateStatus(
    consultationId: string,
    newStatus: ConsultationStatus,
    metadata?: Record<string, any>
  ): Promise<APIResponse<Consultation>>;
  
  closeConsultation(
    consultationId: string,
    data: {
      riskTag: RiskTag;
      prescriptions?: Prescription[];
      followUpDate?: string;
    }
  ): Promise<APIResponse<Consultation>>;
  
  getBillingInfo(consultationId: string): Promise<APIResponse<any>>;
}

export interface MedicService {
  getProfile(medicId: string): Promise<APIResponse<Profile>>;
  
  getDispatchQueue(): Promise<APIResponse<DispatchQueue[]>>;
  
  acceptCase(consultationId: string, notes?: string): Promise<APIResponse<Consultation>>;
  
  submitVitals(data: {
    consultationId: string;
    systolic: number;
    diastolic: number;
    heartRate: number;
    temperature: number;
    spo2: number;
    bloodSugar: number;
    notes?: string;
    capturedAt: string;
    syncedAt?: string;
  }): Promise<APIResponse<Vitals>>;
  
  updateDutyStatus(status: 'on_duty' | 'off_duty', location?: { lat: number; lng: number }): Promise<APIResponse<any>>;
  
  updateGPS(data: {
    consultationId: string;
    latitude: number;
    longitude: number;
    accuracy?: number;
    speed?: number;
    batteryPercent?: number;
  }): Promise<void>;
}

export interface DoctorService {
  getQueue(): Promise<APIResponse<Consultation[]>>;
  
  getCaseDetails(consultationId: string): Promise<APIResponse<{
    consultation: Consultation;
    vitals: Vitals[];
    patient: Profile;
    medic: Profile;
  }>>;
  
  saveSOAPNotes(data: {
    consultationId: string;
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  }): Promise<APIResponse<SOAPNotes>>;
  
  initiateVideoCall(consultationId: string): Promise<APIResponse<{
    roomId: string;
    doctorToken: string;
    expiresAt: string;
  }>>;
}

export interface PatientService {
  getProfiles(): Promise<APIResponse<Profile[]>>;
  
  getHealthRecords(profileId: string, limit?: number, offset?: number): Promise<PaginatedResponse<Consultation>>;
  
  getBookingStatus(consultationId: string): Promise<APIResponse<Consultation>>;
  
  cancelBooking(consultationId: string, reason?: string): Promise<APIResponse<Consultation>>;
}

export interface AdminService {
  getAllCases(filters?: {
    status?: ConsultationStatus;
    urgency?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<Consultation>>;
  
  getAvailableMedics(filters?: { availability?: string; carehub?: string }): Promise<APIResponse<Profile[]>>;
  
  forceAssignCase(consultationId: string, medicId: string, reason: string): Promise<APIResponse<Consultation>>;
  
  getHeatmapData(): Promise<APIResponse<{
    activeMedics: number;
    criticalPending: number;
    avgResponse: string;
    geozones: Array<{ latitude: number; longitude: number; severity: string; caseCount: number }>;
  }>>;
}

export interface RealtimeService {
  subscribeToGPS(consultationId: string, callback: (data: GPSTrail) => void): () => void;
  
  subscribeToVitals(consultationId: string, callback: (data: Vitals) => void): () => void;
  
  subscribeToConsultationStatus(
    consultationId: string,
    callback: (data: Consultation) => void
  ): () => void;
  
  subscribeToDispatchQueue(callback: (data: DispatchQueue[]) => void): () => void;
  
  broadcastVideoCall(roomId: string, data: any): Promise<void>;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface BillingInfo {
  baseCharge: number;
  distanceCost: number;
  timeCost: number;
  total: number;
  currency: string;
}

// SERVICE LABELS
export const SERVICE_LABELS: Record<ServiceType, string> = {
  homecare: 'Homecare',
  teleconsult: 'Teleconsultation',
  diagnostics: 'Early Risk Diagnostics',
};

export const SEVERITY_LEVELS = {
  critical: { code: 1, label: 'Critical', sla: '5 minutes' },
  urgent: { code: 3, label: 'Urgent', sla: '30 minutes' },
  routine: { code: 5, label: 'Routine', sla: '2 hours' },
};

export const VITALS_RANGES = {
  systolic: { min: 70, max: 250 },
  diastolic: { min: 40, max: 150 },
  heart_rate: { min: 30, max: 200 },
  temperature: { min: 35, max: 42 },
  spo2: { min: 50, max: 100 },
  blood_sugar: { min: 40, max: 500 },
};
