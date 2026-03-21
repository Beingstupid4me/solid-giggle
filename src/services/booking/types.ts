/**
 * Booking Service Types
 * Core business types for booking functionality - adapter agnostic
 */

export interface BookingData {
  patientName: string;
  phone: string;
  serviceCategory: ServiceCategory;
  manualAddress: string;
  gpsLocation?: GPSCoordinates | null;
  specificAilment?: string;
}

export interface GPSCoordinates {
  lat: number;
  lng: number;
  accuracy: number;
}

export type ServiceCategory = 'home-visit' | 'teleconsult' | 'nursing' | 'lab';

export interface BookingResult {
  success: boolean;
  id?: string;
  error?: string;
}

export interface SavedBooking extends BookingData {
  id: string;
  status: BookingStatus;
  createdAt: string;
  amount?: number;
  assignedParamedic?: string;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

/**
 * Booking Repository Interface
 * Implement this interface to create adapters for different backends (Supabase, Firebase, REST API, etc.)
 */
export interface BookingRepository {
  create(booking: BookingData): Promise<BookingResult>;
  getById(id: string): Promise<SavedBooking | null>;
  getByPhone(phone: string): Promise<SavedBooking[]>;
  updateStatus(id: string, status: BookingStatus): Promise<BookingResult>;
}
