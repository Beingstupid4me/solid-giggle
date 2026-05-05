import { supabase } from './supabase';
import backendAPI from './backendApi';

/**
 * DOCTOR SERVICES
 * Handles queue, SOAP notes, vitals retrieval, and case closure
 */

export const doctorServices = {
  /**
   * Get doctor's queue - all cases assigned to them in vitals_captured or in_consultation status
   */
  async getQueue() {
    try {
      const { data: userSession } = await supabase.auth.getSession();
      if (!userSession?.session?.user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('consultations')
        .select(`
          id,
          patient_id,
          profiles:patient_id(id, full_name, phone),
          status,
          patient_location,
          address_line,
          created_at,
          vitals:vitals(*)
        `)
        .eq('doctor_id', userSession.session.user.id)
        .in('status', ['vitals_captured', 'in_consultation'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching queue';
      return { success: false, error: message, data: [] };
    }
  },

  /**
   * Get vitals for a specific consultation
   */
  async getVitals(consultationId: string) {
    try {
      const { data, error } = await supabase
        .from('vitals')
        .select('*')
        .eq('consultation_id', consultationId)
        .order('captured_at', { ascending: false });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching vitals';
      return { success: false, error: message, data: [] };
    }
  },

  /**
   * Save or update SOAP notes for a consultation
   */
  async saveSOAPNotes(
    consultationId: string,
    soapData: {
      subjective: string;
      objective: string;
      assessment: string;
      plan: string;
    }
  ) {
    try {
      const { data: userSession } = await supabase.auth.getSession();
      if (!userSession?.session?.user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('soap_notes')
        .upsert(
          {
            consultation_id: consultationId,
            doctor_id: userSession.session.user.id,
            ...soapData,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'consultation_id' }
        )
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error saving SOAP notes';
      return { success: false, error: message };
    }
  },

  /**
   * Close case and set risk classification
   */
  async closeCaseWithRisk(
    consultationId: string,
    riskTag: 'stable' | 'monitor' | 'escalate'
  ) {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .update({
          status: 'closed',
          closed_at: new Date().toISOString(),
        })
        .eq('id', consultationId)
        .select()
        .single();

      if (error) throw error;

      // Update SOAP notes with risk tag
      await supabase
        .from('soap_notes')
        .update({ risk_tag: riskTag })
        .eq('consultation_id', consultationId);

      return { success: true, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error closing case';
      return { success: false, error: message };
    }
  },

  /**
   * Get SOAP notes for a consultation
   */
  async getSOAPNotes(consultationId: string) {
    try {
      const { data, error } = await supabase
        .from('soap_notes')
        .select('*')
        .eq('consultation_id', consultationId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
      return { success: true, data: data || null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching SOAP notes';
      return { success: false, error: message };
    }
  },

  /**
   * Get prescriptions for a consultation
   */
  async getPrescriptions(consultationId: string) {
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('consultation_id', consultationId);

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching prescriptions';
      return { success: false, error: message, data: [] };
    }
  },
};

/**
 * FIELD NODE (MEDIC) SERVICES
 * Handles dispatch queue, case acceptance, vitals submission, GPS tracking
 */

export const fieldNodeServices = {
  /**
   * Get dispatch queue for medic
   */
  async getDispatchQueue() {
    try {
      const { data: userSession } = await supabase.auth.getSession();
      if (!userSession?.session?.user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('dispatch_queue')
        .select(`
          id,
          consultation_id,
          consultations:consultation_id(
            id,
            patient_id,
            profiles:patient_id(id, full_name, phone),
            patient_location,
            address_line,
            created_at
          ),
          status,
          priority,
          created_at
        `)
        .neq('status', 'timeout')
        .order('priority', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching dispatch queue';
      return { success: false, error: message, data: [] };
    }
  },

  /**
   * Accept a case (medic accepts dispatch)
   */
  async acceptCase(consultationId: string, notes?: string) {
    try {
      const { data: userSession } = await supabase.auth.getSession();
      if (!userSession?.session?.user?.id) throw new Error('Not authenticated');

      // Update dispatch queue status
      await supabase
        .from('dispatch_queue')
        .update({ status: 'accepted' })
        .eq('consultation_id', consultationId);

      // Update consultation
      const { data, error } = await supabase
        .from('consultations')
        .update({
          medic_id: userSession.session.user.id,
          status: 'assigned',
          assigned_at: new Date().toISOString(),
        })
        .eq('id', consultationId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error accepting case';
      return { success: false, error: message };
    }
  },

  /**
   * Reject/pass a case
   */
  async passCase(consultationId: string) {
    try {
      const { data, error } = await supabase
        .from('dispatch_queue')
        .update({ status: 'rejected' })
        .eq('consultation_id', consultationId);

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error passing case';
      return { success: false, error: message };
    }
  },

  /**
   * Submit vitals from field
   */
  async submitVitals(
    consultationId: string,
    vitalsData: {
      systolic: number;
      diastolic: number;
      heart_rate: number;
      temperature: number;
      spo2: number;
      blood_sugar?: number;
    }
  ) {
    try {
      const { data: userSession } = await supabase.auth.getSession();
      if (!userSession?.session?.user?.id) throw new Error('Not authenticated');

      // Insert vitals
      const { data: vitals, error: vitalsError } = await supabase
        .from('vitals')
        .insert([
          {
            consultation_id: consultationId,
            medic_id: userSession.session.user.id,
            ...vitalsData,
            captured_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (vitalsError) throw vitalsError;

      // Update consultation status
      await supabase
        .from('consultations')
        .update({ status: 'vitals_captured' })
        .eq('id', consultationId);

      return { success: true, data: vitals };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error submitting vitals';
      return { success: false, error: message };
    }
  },

  /**
   * Update GPS location (dual-path: profiles.live_location + gps_trail)
   */
  async updateGPS(
    consultationId: string,
    location: {
      latitude: number;
      longitude: number;
      accuracy: number;
      battery_percent: number;
    }
  ) {
    try {
      const { data: userSession } = await supabase.auth.getSession();
      if (!userSession?.session?.user?.id) throw new Error('Not authenticated');

      const point = `POINT(${location.longitude} ${location.latitude})`;

      // Update live_location in profiles
      await supabase
        .from('profiles')
        .update({
          live_location: point,
        })
        .eq('id', userSession.session.user.id);

      // Log to gps_trail for audit
      const { data, error } = await supabase
        .from('gps_trail')
        .insert([
          {
            consultation_id: consultationId,
            medic_id: userSession.session.user.id,
            location: point,
            accuracy: location.accuracy,
            battery_percent: location.battery_percent,
            recorded_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error updating GPS';
      return { success: false, error: message };
    }
  },

  /**
   * Get active consultation for medic
   */
  async getActiveConsultation() {
    try {
      const { data: userSession } = await supabase.auth.getSession();
      if (!userSession?.session?.user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('consultations')
        .select(`
          *,
          profiles:patient_id(*),
          vitals(*)
        `)
        .eq('medic_id', userSession.session.user.id)
        .neq('status', 'closed')
        .neq('status', 'cancelled')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return { success: true, data: data || null };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching active consultation';
      return { success: false, error: message };
    }
  },
};

/**
 * PATIENT SERVICES
 * Handles bookings, health records, dispatch tracking
 */

export const patientServices = {
  /**
   * Create a new booking/consultation
   */
  async createBooking(bookingData: {
    service_type?: string;
    patient_location?: { lat: number; lng: number };
    address_line?: string;
    notes?: string;
    // Booking page shape compatibility
    patientProfileId?: string;
    serviceType?: string;
    mode?: "now" | "carehub";
    location?: { latitude: number; longitude: number; addressLine?: string } | null;
    carehubId?: string | null;
  }) {
    try {
      const resolvedAddress =
        bookingData.address_line || bookingData.location?.addressLine || 'Address pending';

      const lat =
        bookingData.patient_location?.lat ?? bookingData.location?.latitude ?? 28.6139;
      const lng =
        bookingData.patient_location?.lng ?? bookingData.location?.longitude ?? 77.2090;

      const response = await backendAPI.createConsultation({
        address_line: resolvedAddress,
        latitude: lat,
        longitude: lng,
        status: 'pending',
      });

      if (!response.success) {
        throw new Error(response.error || 'Error creating booking');
      }

      return { success: true, data: (response as any).data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error creating booking';
      return { success: false, error: message };
    }
  },

  /**
   * Get booking status
   */
  async getBookingStatus(consultationId: string) {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select('id,patient_id,medic_id,doctor_id,status,patient_location,address_line,cost_total,created_at,closed_at')
        .eq('id', consultationId)
        .single();

      if (error) throw error;

      let assignedMedic: any = null;
      if (data?.medic_id) {
        const { data: medicProfile } = await supabase
          .from('profiles')
          .select('id,full_name,phone')
          .eq('id', data.medic_id)
          .single();

        assignedMedic = medicProfile
          ? {
              ...medicProfile,
              unit_code: 'Unit-01',
            }
          : null;
      }

      return {
        success: true,
        data: {
          ...data,
          assigned_medic: assignedMedic,
          estimated_arrival_mins: 15,
        },
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching booking status';
      return { success: false, error: message };
    }
  },

  /**
   * Get patient's health records/past consultations
   */
  async getHealthRecords(limit = 10, offset = 0) {
    try {
      const { data: userSession } = await supabase.auth.getSession();
      if (!userSession?.session?.user?.id) throw new Error('Not authenticated');

      const { data, error, count } = await supabase
        .from('consultations')
        .select(
          `id,patient_id,medic_id,status,created_at,closed_at,cost_total,address_line`,
          { count: 'exact' }
        )
        .eq('patient_id', userSession.session.user.id)
        .eq('status', 'closed')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Best-effort enrichment for medic names using existing profiles table.
      const medicIds = Array.from(
        new Set((data || []).map((row: any) => row.medic_id).filter(Boolean))
      ) as string[];

      let medicNameById: Record<string, string> = {};
      if (medicIds.length > 0) {
        const { data: medicProfiles } = await supabase
          .from('profiles')
          .select('id,full_name')
          .in('id', medicIds);

        medicNameById = Object.fromEntries(
          (medicProfiles || []).map((profile: any) => [profile.id, profile.full_name || 'Medical Professional'])
        );
      }

      const normalized = (data || []).map((row: any) => ({
        ...row,
        assigned_doctor: row.medic_id
          ? { full_name: medicNameById[row.medic_id] || 'Medical Professional' }
          : null,
      }));

      return {
        success: true,
        data: normalized,
        total: count || 0,
        hasMore: (count || 0) > offset + limit,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching health records';
      return { success: false, error: message, data: [], total: 0, hasMore: false };
    }
  },

  /**
   * Cancel a booking
   */
  async cancelBooking(consultationId: string, reason?: string) {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .update({
          status: 'cancelled',
          notes: reason || 'Cancelled by patient',
        })
        .eq('id', consultationId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error cancelling booking';
      return { success: false, error: message };
    }
  },

  /**
   * Get patient's linked profiles (family members)
   */
  async getLinkedProfiles() {
    try {
      const { data: userSession } = await supabase.auth.getSession();
      if (!userSession?.session?.user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userSession.session.user.id);

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching profiles';
      return { success: false, error: message, data: [] };
    }
  },
};

/**
 * ADMIN SERVICES
 * Handles case management, medic roster, analytics
 */

export const adminServices = {
  /**
   * Get all cases with filters
   */
  async getAllCases(
    filters?: {
      status?: string;
      limit?: number;
      offset?: number;
    }
  ) {
    try {
      let query = supabase
        .from('consultations')
        .select(
          `
          id,
          patient_id,
          medic_id,
          doctor_id,
          status,
          created_at,
          closed_at,
          cost_total,
          profiles:patient_id(id, full_name, phone),
          medics:medic_id(id, full_name)
        `,
          { count: 'exact' }
        );

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const limit = filters?.limit || 50;
      const offset = filters?.offset || 0;

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return { success: true, data: data || [], total: count || 0 };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching cases';
      return { success: false, error: message, data: [], total: 0 };
    }
  },

  /**
   * Get available medics for manual assignment
   */
  async getAvailableMedics() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'medic')
        .eq('is_online', true)
        .gt('battery_percent', 15)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching medics';
      return { success: false, error: message, data: [] };
    }
  },

  /**
   * Manually assign case to medic (override dispatch)
   */
  async forceAssignCase(
    consultationId: string,
    medicId: string,
    reason: string
  ) {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .update({
          medic_id: medicId,
          status: 'assigned',
          assigned_at: new Date().toISOString(),
        })
        .eq('id', consultationId)
        .select()
        .single();

      if (error) throw error;

      // Log the override
      await supabase
        .from('dispatch_queue')
        .update({ status: 'assigned' })
        .eq('consultation_id', consultationId);

      return { success: true, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error assigning case';
      return { success: false, error: message };
    }
  },

  /**
   * Get heatmap data (active cases geolocation)
   */
  async getHeatmapData() {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select(`
          id,
          patient_location,
          status,
          created_at
        `)
        .neq('status', 'closed')
        .neq('status', 'cancelled');

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching heatmap data';
      return { success: false, error: message, data: [] };
    }
  },
};

/**
 * AUTH SERVICES
 * Handles authentication flows
 */

export const authServices = {
  /**
   * Login with email or phone and password
   */
  async login(identifier: string, password: string) {
    try {
      const response = await backendAPI.login(identifier, password, 'patient');
      if (!response.success) throw new Error(response.error || 'Login failed');
      return { success: true, data: response.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      return { success: false, error: message };
    }
  },

  /**
   * Logout
   */
  async logout() {
    try {
      const response = await backendAPI.logout();
      if (!response.success) throw new Error(response.error || 'Logout failed');
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed';
      return { success: false, error: message };
    }
  },

  /**
   * Get current user
   */
  async getCurrentUser() {
    try {
      const response = await backendAPI.getMe();
      if (!response.success) throw new Error(response.error || 'Error fetching user');
      return { success: true, data: response.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching user';
      return { success: false, error: message };
    }
  },

  /**
   * Get user profile
   */
  async getUserProfile() {
    try {
      const { data: userSession } = await supabase.auth.getSession();
      if (!userSession?.session?.user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userSession.session.user.id)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching profile';
      return { success: false, error: message };
    }
  },

  /**
   * Signup with phone, email and password
   */
  async signup(
    phone: string,
    email: string,
    password: string,
    fullName: string,
    role: string
  ) {
    try {
      const response = await backendAPI.signup(phone, password, fullName, role, email);
      if (!response.success) throw new Error(response.error || 'Signup failed');
      return { success: true, data: response.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      return { success: false, error: message };
    }
  },
};

/**
 * REALTIME SERVICES
 * Setup subscriptions for real-time updates
 */

export const realtimeServices = {
  /**
   * Subscribe to consultation status changes
   */
  subscribeToConsultations(
    callback: (payload: any) => void
  ) {
    const channel = supabase
      .channel('consultations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'consultations',
        },
        callback
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  },

  /**
   * Subscribe to vitals updates
   */
  subscribeToVitals(
    consultationId: string,
    callback: (payload: any) => void
  ) {
    const channel = supabase
      .channel(`vitals-${consultationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'vitals',
          filter: `consultation_id=eq.${consultationId}`,
        },
        callback
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  },

  /**
   * Subscribe to dispatch queue changes
   */
  subscribeToDispatchQueue(
    callback: (payload: any) => void
  ) {
    const channel = supabase
      .channel('dispatch')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dispatch_queue',
        },
        callback
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  },
};
