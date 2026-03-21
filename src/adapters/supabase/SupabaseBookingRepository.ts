/**
 * Supabase Booking Repository Adapter
 * Implements BookingRepository interface for Supabase backend
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  BookingRepository, 
  BookingData, 
  BookingResult, 
  SavedBooking, 
  BookingStatus 
} from '@/services/booking';

// Database row type (matches Supabase schema)
interface BookingRow {
  id: string;
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
  status: string;
  amount?: number;
  assigned_paramedic?: string;
  created_at: string;
}

export class SupabaseBookingRepository implements BookingRepository {
  private client: SupabaseClient;
  private tableName = 'bookings';

  constructor(supabaseUrl: string, supabaseAnonKey: string) {
    this.client = createClient(supabaseUrl, supabaseAnonKey);
  }

  async create(booking: BookingData): Promise<BookingResult> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .insert({
          patient_name: booking.patientName,
          phone: booking.phone,
          service_category: booking.serviceCategory,
          manual_address: booking.manualAddress,
          gps_location: booking.gpsLocation || null,
          specific_ailment: booking.specificAilment,
          status: 'PENDING',
        })
        .select('id')
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        return { success: false, error: 'Failed to create booking' };
      }

      return { success: true, id: data?.id };
    } catch (err) {
      console.error('Supabase repository error:', err);
      return { success: false, error: 'Database connection error' };
    }
  }

  async getById(id: string): Promise<SavedBooking | null> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) return null;
      return this.mapRowToBooking(data as BookingRow);
    } catch {
      return null;
    }
  }

  async getByPhone(phone: string): Promise<SavedBooking[]> {
    try {
      const { data, error } = await this.client
        .from(this.tableName)
        .select('*')
        .eq('phone', phone)
        .order('created_at', { ascending: false });

      if (error || !data) return [];
      return (data as BookingRow[]).map(this.mapRowToBooking);
    } catch {
      return [];
    }
  }

  async updateStatus(id: string, status: BookingStatus): Promise<BookingResult> {
    try {
      const { error } = await this.client
        .from(this.tableName)
        .update({ status })
        .eq('id', id);

      if (error) {
        return { success: false, error: 'Failed to update booking status' };
      }

      return { success: true, id };
    } catch {
      return { success: false, error: 'Database connection error' };
    }
  }

  private mapRowToBooking(row: BookingRow): SavedBooking {
    return {
      id: row.id,
      patientName: row.patient_name,
      phone: row.phone,
      serviceCategory: row.service_category as SavedBooking['serviceCategory'],
      manualAddress: row.manual_address,
      gpsLocation: row.gps_location,
      specificAilment: row.specific_ailment,
      status: row.status as BookingStatus,
      createdAt: row.created_at,
      amount: row.amount,
      assignedParamedic: row.assigned_paramedic,
    };
  }
}
