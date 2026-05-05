'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import backendAPI from '@/lib/backendApi';
import type {
  Profile,
  Consultation,
  Vitals,
  SOAPNotes,
  Prescription,
  DispatchQueue,
  ConsultationStatus,
  ServiceType,
  RiskTag,
  APIResponse,
  PaginatedResponse,
} from '@/lib/supabase-types';

// ============================================================================
// AUTHENTICATION HOOKS
// ============================================================================

export function useAuth() {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    try {
      const me = await backendAPI.getMe();
      if ((me as any)?.success) {
        const profile = (me as any)?.data?.profile;
        if (profile) {
          setUser(profile as Profile);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Auth error');
    } finally {
      setLoading(false);
    }
  };

  const login = useCallback(async (identifier: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await backendAPI.login(identifier, password, 'patient');
      if (!response.success) throw new Error(response.error || 'Login failed');

      const me = await backendAPI.getMe();
      if ((me as any)?.success) {
        const profile = (me as any)?.data?.profile;
        if (profile) {
          setUser(profile as Profile);
        }
      }
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await backendAPI.logout();
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
    } finally {
      setLoading(false);
    }
  }, []);

  return { user, loading, error, login, logout, getCurrentUser };
}

// ============================================================================
// CONSULTATION HOOKS
// ============================================================================

export function useConsultations() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBooking = useCallback(
    async (data: {
      profileId: string;
      serviceType: ServiceType;
      patientLocation: { lat: number; lng: number };
      address: string;
      carehubId?: string;
      notes?: string;
    }) => {
      setLoading(true);
      setError(null);
      try {
        const { data: consultation, error: err } = await supabase
          .from('consultations')
          .insert([
            {
              patient_id: data.profileId,
              service_type: data.serviceType,
              patient_location: {
                type: 'Point',
                coordinates: [data.patientLocation.lng, data.patientLocation.lat],
              },
              address_line: data.address,
              carehub_id: data.carehubId,
              notes: data.notes,
              status: 'pending',
            },
          ])
          .select()
          .single();

        if (err) throw err;
        setConsultations((prev) => [consultation, ...prev]);
        return { success: true, data: consultation };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Booking failed';
        setError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getConsultation = useCallback(async (consultationId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('consultations')
        .select('*')
        .eq('id', consultationId)
        .single();

      if (err) throw err;
      return { success: true, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Fetch failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = useCallback(
    async (consultationId: string, newStatus: ConsultationStatus, metadata?: Record<string, any>) => {
      setLoading(true);
      setError(null);
      try {
        const updates: Record<string, any> = { status: newStatus, updated_at: new Date().toISOString() };

        // Auto-populate timestamp fields based on status
        if (newStatus === 'assigned') updates.assigned_at = new Date().toISOString();
        if (newStatus === 'arrived') updates.arrived_at = new Date().toISOString();
        if (newStatus === 'in_consultation') updates.consultation_started_at = new Date().toISOString();
        if (newStatus === 'closed') updates.closed_at = new Date().toISOString();

        const { data: consultation, error: err } = await supabase
          .from('consultations')
          .update(updates)
          .eq('id', consultationId)
          .select()
          .single();

        if (err) throw err;
        setConsultations((prev) =>
          prev.map((c) => (c.id === consultationId ? consultation : c))
        );
        return { success: true, data: consultation };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Update failed';
        setError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const closeConsultation = useCallback(
    async (
      consultationId: string,
      data: {
        riskTag: RiskTag;
        prescriptions?: Prescription[];
        followUpDate?: string;
      }
    ) => {
      setLoading(true);
      setError(null);
      try {
        // Update consultation status to closed
        const { data: consultation, error: err } = await supabase
          .from('consultations')
          .update({
            status: 'closed',
            closed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', consultationId)
          .select()
          .single();

        if (err) throw err;

        // Save SOAP notes with risk tag
        const { error: soapErr } = await supabase
          .from('soap_notes')
          .update({ risk_tag: data.riskTag })
          .eq('consultation_id', consultationId);

        if (soapErr) console.warn('SOAP notes update failed:', soapErr);

        setConsultations((prev) =>
          prev.map((c) => (c.id === consultationId ? consultation : c))
        );
        return { success: true, data: consultation };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Close failed';
        setError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    consultations,
    loading,
    error,
    createBooking,
    getConsultation,
    updateStatus,
    closeConsultation,
  };
}

// ============================================================================
// MEDIC HOOKS
// ============================================================================

export function useMedicServices() {
  const [dispatch, setDispatch] = useState<DispatchQueue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDispatchQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('dispatch_queue')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;
      setDispatch(data as DispatchQueue[]);
      return { success: true, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Fetch failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const acceptCase = useCallback(async (consultationId: string, notes?: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const medicId = session?.user?.id;

      const { error: err } = await supabase
        .from('consultations')
        .update({
          medic_id: medicId,
          status: 'assigned',
          assigned_at: new Date().toISOString(),
          notes,
        })
        .eq('id', consultationId);

      if (err) throw err;

      setDispatch((prev) =>
        prev.map((d) =>
          d.consultation_id === consultationId
            ? { ...d, status: 'accepted' as const }
            : d
        )
      );
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Accept failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const submitVitals = useCallback(
    async (data: {
      consultationId: string;
      systolic: number;
      diastolic: number;
      heartRate: number;
      temperature: number;
      spo2: number;
      bloodSugar: number;
      notes?: string;
    }) => {
      setLoading(true);
      setError(null);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const medicId = session?.user?.id;

        const { data: vitals, error: err } = await supabase
          .from('vitals')
          .insert([
            {
              consultation_id: data.consultationId,
              medic_id: medicId,
              systolic: data.systolic,
              diastolic: data.diastolic,
              heart_rate: data.heartRate,
              temperature: data.temperature,
              spo2: data.spo2,
              blood_sugar: data.bloodSugar,
              notes: data.notes,
              captured_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (err) throw err;

        // Update consultation status to vitals_captured
        await supabase
          .from('consultations')
          .update({ status: 'vitals_captured' })
          .eq('id', data.consultationId);

        return { success: true, data: vitals };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Vitals submission failed';
        setError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateGPS = useCallback(
    async (data: {
      consultationId: string;
      latitude: number;
      longitude: number;
      accuracy?: number;
      batteryPercent?: number;
    }) => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const medicId = session?.user?.id;

        // Update medic's live location
        await supabase
          .from('profiles')
          .update({
            live_location: {
              type: 'Point',
              coordinates: [data.longitude, data.latitude],
            },
            battery_percent: data.batteryPercent,
            location_updated_at: new Date().toISOString(),
          })
          .eq('id', medicId);

        // Log GPS trail for audit
        await supabase.from('gps_trail').insert([
          {
            consultation_id: data.consultationId,
            medic_id: medicId,
            location: {
              type: 'Point',
              coordinates: [data.longitude, data.latitude],
            },
            accuracy: data.accuracy,
            battery_percent: data.batteryPercent,
          },
        ]);
      } catch (err) {
        console.error('GPS update failed:', err);
      }
    },
    []
  );

  return {
    dispatch,
    loading,
    error,
    getDispatchQueue,
    acceptCase,
    submitVitals,
    updateGPS,
  };
}

// ============================================================================
// DOCTOR HOOKS
// ============================================================================

export function useDoctorServices() {
  const [queue, setQueue] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('consultations')
        .select('*')
        .in('status', ['vitals_captured', 'in_consultation'] as ConsultationStatus[])
        .order('created_at', { ascending: false });

      if (err) throw err;
      setQueue(data as Consultation[]);
      return { success: true, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Fetch failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSOAPNotes = useCallback(
    async (data: {
      consultationId: string;
      subjective: string;
      objective: string;
      assessment: string;
      plan: string;
    }) => {
      setLoading(true);
      setError(null);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const doctorId = session?.user?.id;

        const { data: notes, error: err } = await supabase
          .from('soap_notes')
          .upsert(
            {
              consultation_id: data.consultationId,
              doctor_id: doctorId,
              subjective: data.subjective,
              objective: data.objective,
              assessment: data.assessment,
              plan: data.plan,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'consultation_id' }
          )
          .select()
          .single();

        if (err) throw err;
        return { success: true, data: notes };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Save failed';
        setError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const initiateVideoCall = useCallback(async (consultationId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const doctorId = session?.user?.id;

      // Generate room ID
      const roomId = `sanocare-${consultationId}`;

      // In production, call FastAPI to generate LiveKit token
      // For now, return mock data
      return {
        success: true,
        data: {
          roomId,
          doctorToken: 'mock-token',
          expiresAt: new Date(Date.now() + 30 * 60000).toISOString(),
        },
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Video initiation failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    queue,
    loading,
    error,
    getQueue,
    saveSOAPNotes,
    initiateVideoCall,
  };
}

// ============================================================================
// PATIENT HOOKS
// ============================================================================

export function usePatientServices() {
  const [records, setRecords] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getHealthRecords = useCallback(
    async (profileId: string, limit = 10, offset = 0) => {
      setLoading(true);
      setError(null);
      try {
        const { data, count, error: err } = await supabase
          .from('consultations')
          .select('*', { count: 'exact' })
          .eq('patient_id', profileId)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (err) throw err;
        setRecords(data as Consultation[]);
        return {
          success: true,
          data: {
            items: data,
            total: count || 0,
            limit,
            offset,
            hasMore: (count || 0) > offset + limit,
          },
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Fetch failed';
        setError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getBookingStatus = useCallback(async (consultationId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('consultations')
        .select('*')
        .eq('id', consultationId)
        .single();

      if (err) throw err;
      return { success: true, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Fetch failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelBooking = useCallback(async (consultationId: string, reason?: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('consultations')
        .update({
          status: 'cancelled',
          notes: reason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', consultationId)
        .select()
        .single();

      if (err) throw err;
      return { success: true, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Cancellation failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    records,
    loading,
    error,
    getHealthRecords,
    getBookingStatus,
    cancelBooking,
  };
}

// ============================================================================
// ADMIN HOOKS
// ============================================================================

export function useAdminServices() {
  const [cases, setCases] = useState<Consultation[]>([]);
  const [medics, setMedics] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAllCases = useCallback(
    async (filters?: {
      status?: ConsultationStatus;
      limit?: number;
      offset?: number;
    }) => {
      setLoading(true);
      setError(null);
      try {
        let query = supabase
          .from('consultations')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false });

        if (filters?.status) {
          query = query.eq('status', filters.status);
        }

        const { data, count, error: err } = await query.range(
          filters?.offset || 0,
          (filters?.offset || 0) + (filters?.limit || 50) - 1
        );

        if (err) throw err;
        setCases(data as Consultation[]);
        return {
          success: true,
          data: {
            items: data,
            total: count || 0,
            limit: filters?.limit || 50,
            offset: filters?.offset || 0,
            hasMore: (count || 0) > (filters?.offset || 0) + (filters?.limit || 50),
          },
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Fetch failed';
        setError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getAvailableMedics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'medic')
        .eq('is_online', true)
        .gt('battery_percent', 15);

      if (err) throw err;
      setMedics(data as Profile[]);
      return { success: true, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Fetch failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const forceAssignCase = useCallback(
    async (consultationId: string, medicId: string, reason: string) => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: err } = await supabase
          .from('consultations')
          .update({
            medic_id: medicId,
            status: 'assigned',
            assigned_at: new Date().toISOString(),
            notes: reason,
          })
          .eq('id', consultationId)
          .select()
          .single();

        if (err) throw err;
        return { success: true, data };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Assignment failed';
        setError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    cases,
    medics,
    loading,
    error,
    getAllCases,
    getAvailableMedics,
    forceAssignCase,
  };
}

// ============================================================================
// REALTIME HOOKS
// ============================================================================

export function useRealtimeSubscriptions() {
  useEffect(() => {
    // Setup realtime subscriptions
    const channel = supabase
      .channel('public-consultations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'consultations',
        },
        (payload) => {
          console.log('Real-time update:', payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}
