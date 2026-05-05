/**
 * CUSTOM HOOKS FOR SUPABASE INTEGRATION
 * These hooks fetch real data and update Zustand stores
 */

import { useEffect, useState, useCallback } from 'react';
import {
  doctorServices,
  fieldNodeServices,
  patientServices,
  adminServices,
  authServices,
  realtimeServices,
} from '@/lib/supabaseServices';
import { useDoctorPortalStore } from '@/store/doctorPortalStore';
import { useFieldNodePortalStore } from '@/store/fieldNodePortalStore';
import { usePortalAuthStore } from '@/store/portalAuthStore';

export const useSupabaseIntegration = () => ({
  doctorServices,
  fieldNodeServices,
  patientServices,
  adminServices,
  authServices,
  realtimeServices,
});

/**
 * DOCTOR HOOKS
 */

export const useDoctorQueue = () => {
  const cases = useDoctorPortalStore((state) => state.queue);
  const setQueue = useDoctorPortalStore((state) => state.setQueue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await doctorServices.getQueue();
      if (!result.success) throw new Error(result.error);

      setQueue(result.data as any[]);
      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching queue';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  return { cases, loading, error, fetchQueue, refetch: fetchQueue };
};

export const useDoctorVitals = (consultationId?: string | null) => {
  const [vitals, setVitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const getLatestVitals = useCallback(async (targetConsultationId: string) => {
    const result = await doctorServices.getVitals(targetConsultationId);
    if (!result.success || !Array.isArray(result.data) || result.data.length === 0) {
      return null;
    }
    return { success: true, data: result.data[0] };
  }, []);

  const subscribeToVitals = useCallback(
    (targetConsultationId: string, callback: (payload: any) => void) => {
      return realtimeServices.subscribeToVitals(targetConsultationId, (payload) => {
        if (payload.eventType === 'INSERT') {
          callback(payload.new);
        }
      });
    },
    []
  );

  useEffect(() => {
    if (!consultationId) return;

    const fetchVitals = async () => {
      setLoading(true);
      try {
        const result = await doctorServices.getVitals(consultationId);
        if (result.success) {
          setVitals(result.data);
        }
      } catch (err) {
        console.error('Error fetching vitals:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVitals();

    // Subscribe to real-time vitals
    const unsubscribe = realtimeServices.subscribeToVitals(
      consultationId,
      (payload) => {
        if (payload.eventType === 'INSERT') {
          setVitals((prev) => [payload.new, ...prev]);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [consultationId]);

  return { vitals, loading, getLatestVitals, subscribeToVitals };
};

export const useSaveSOAPNotes = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveNotes = useCallback(
    async (consultationId: string, soapData: any) => {
      setLoading(true);
      setError(null);
      try {
        const result = await doctorServices.saveSOAPNotes(consultationId, soapData);
        if (!result.success) throw new Error(result.error);
        return { success: true, data: result.data };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error saving notes';
        setError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { saveNotes, saveSOAPNotes: saveNotes, loading, error };
};

export const useCloseCase = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const closeCase = useCallback(
    async (consultationId: string, riskTag: 'stable' | 'monitor' | 'escalate') => {
      setLoading(true);
      setError(null);
      try {
        const result = await doctorServices.closeCaseWithRisk(consultationId, riskTag);
        if (!result.success) throw new Error(result.error);
        return { success: true, data: result.data };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error closing case';
        setError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { closeCase, loading, error };
};

/**
 * FIELD NODE (MEDIC) HOOKS
 */

export const useDispatchQueue = () => {
  const cases = useFieldNodePortalStore((state) => state.queue);
  const setQueue = useFieldNodePortalStore((state) => state.setQueue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fieldNodeServices.getDispatchQueue();
      if (result.success) {
        const normalized = (result.data || []).map((item: any) => ({
          id: item.id,
          patientName: item.consultations?.[0]?.profiles?.[0]?.full_name || item.consultations?.[0]?.patient_name || 'Patient',
          patient_name: item.consultations?.[0]?.profiles?.[0]?.full_name || item.consultations?.[0]?.patient_name || 'Patient',
          complaint: item.consultations?.[0]?.address_line || 'Dispatch alert',
          location: item.consultations?.[0]?.address_line || 'TBD',
          distanceKm: 0,
          receivedLabel: item.created_at ? new Date(item.created_at).toLocaleTimeString() : 'Received now',
          severity: 'routine',
          priorityLevel: 5,
          priority: item.priority ? String(item.priority) : 'normal',
          age: 0,
          accepted: item.status === 'accepted',
          status: item.status,
          created_at: item.created_at,
        }));
        setQueue(normalized);
        return normalized;
      }
      throw new Error(result.error || 'Error fetching dispatch queue');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching dispatch queue';
      setError(message);
      console.error('Error fetching dispatch queue:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
    // Subscribe to real-time dispatch updates
    const unsubscribe = realtimeServices.subscribeToDispatchQueue(() => {
      fetchQueue();
    });
    return () => {
      unsubscribe();
    };
  }, [fetchQueue]);

  return { cases, loading, error, fetchQueue, refetch: fetchQueue };
};

export const useAcceptCase = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const acceptCase = useCallback(async (consultationId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fieldNodeServices.acceptCase(consultationId);
      if (!result.success) throw new Error(result.error);
      return { success: true, data: result.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error accepting case';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  return { acceptCase, loading, error };
};

export const useSubmitVitals = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitVitals = useCallback(
    async (
      consultationId: string,
      vitals: {
        systolic: number;
        diastolic: number;
        heart_rate: number;
        temperature: number;
        spo2: number;
        blood_sugar?: number;
      }
    ) => {
      setLoading(true);
      setError(null);
      try {
        const result = await fieldNodeServices.submitVitals(consultationId, vitals);
        if (!result.success) throw new Error(result.error);
        return { success: true, data: result.data };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error submitting vitals';
        setError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { submitVitals, loading, error };
};

export const useGPSTracking = (consultationId?: string | null) => {
  const [loading, setLoading] = useState(false);

  const updateGPS = useCallback(
    async (location: { latitude: number; longitude: number; accuracy: number; battery_percent: number }) => {
      if (!consultationId) return;
      setLoading(true);
      try {
        await fieldNodeServices.updateGPS(consultationId, location);
      } catch (err) {
        console.error('Error updating GPS:', err);
      } finally {
        setLoading(false);
      }
    },
    [consultationId]
  );

  const startTracking = useCallback(
    async (targetConsultationId?: string | null) => {
      const id = targetConsultationId ?? consultationId;
      if (!id) {
        return;
      }

      const nav = navigator as Navigator & { getBattery?: () => Promise<{ level: number }> };
      if (!navigator.geolocation) {
        throw new Error('Geolocation not available');
      }

      return new Promise<void>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            void fieldNodeServices
              .updateGPS(id, {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                battery_percent: nav.getBattery ? 100 : 100,
              })
              .then(() => resolve())
              .catch(reject);
          },
          (error) => reject(error),
          { enableHighAccuracy: true, maximumAge: 30000 }
        );
      });
    },
    [consultationId]
  );

  // Auto-update GPS when available
  useEffect(() => {
    if (!consultationId) return;

    let watchId: number | null = null;

    try {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const nav = navigator as Navigator & { getBattery?: () => Promise<{ level: number }> };
          updateGPS({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            battery_percent: nav.getBattery ? 100 : 100,
          });
        },
        (error) => console.error('Geolocation error:', error),
        { enableHighAccuracy: true, maximumAge: 30000 }
      );
    } catch (err) {
      console.error('Geolocation not available:', err);
    }

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [consultationId, updateGPS]);

  return { updateGPS, startTracking, loading };
};

/**
 * PATIENT HOOKS
 */

export const useCreateBooking = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBooking = useCallback(
    async (bookingData: any) => {
      setLoading(true);
      setError(null);
      try {
        const result = await patientServices.createBooking(bookingData);
        if (!result.success) throw new Error(result.error);
        return { success: true, data: result.data };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error creating booking';
        setError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { createBooking, loading, error };
};

export const useBookingStatus = (consultationId?: string | null) => {
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const getBookingStatus = useCallback(async (targetConsultationId?: string | null) => {
    const id = targetConsultationId ?? consultationId;
    if (!id) {
      return null;
    }

    const result = await patientServices.getBookingStatus(id);
    if (result.success) {
      setBooking(result.data);
      return { success: true, data: result.data };
    }

    return { success: false, error: result.error };
  }, [consultationId]);

  const subscribeToBookingStatus = useCallback((callback: (update: any) => void) => {
    return realtimeServices.subscribeToConsultations((payload) => {
      if (payload.eventType === 'UPDATE') {
        callback(payload.new);
      }
    });
  }, []);

  useEffect(() => {
    if (!consultationId) return;

    const fetchStatus = async () => {
      setLoading(true);
      try {
        await getBookingStatus(consultationId);
      } catch (err) {
        console.error('Error fetching booking status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();

    // Subscribe to real-time status changes
    const unsubscribe = realtimeServices.subscribeToConsultations((payload) => {
      if (payload.eventType === 'UPDATE' && payload.new?.id === consultationId) {
        setBooking(payload.new);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [consultationId, getBookingStatus]);

  return { booking, loading, getBookingStatus, subscribeToBookingStatus };
};

export const useHealthRecords = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const fetchRecords = useCallback(async (limit = 10, offset = 0) => {
    setLoading(true);
    try {
      const result = await patientServices.getHealthRecords(limit, offset);
      if (result.success) {
        setRecords(result.data);
        setHasMore(result.hasMore);
      }
    } catch (err) {
      console.error('Error fetching records:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return { records, loading, hasMore, fetchRecords };
};

/**
 * ADMIN HOOKS
 */

export const useAllCases = () => {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchCases = useCallback(async (filters?: any) => {
    setLoading(true);
    try {
      const result = await adminServices.getAllCases(filters);
      if (result.success) {
        setCases(result.data);
        setTotal(result.total);
      }
      return result;
    } catch (err) {
      console.error('Error fetching cases:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Error fetching cases', data: [], total: 0 };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  return { cases, loading, total, fetchCases, getAllCases: fetchCases };
};

export const useGetActiveConsultation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getActiveConsultation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fieldNodeServices.getActiveConsultation();
      if (!result.success) throw new Error(result.error);

      return {
        success: true,
        data: result.data ? [result.data] : [],
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching active consultation';
      setError(message);
      return { success: false, error: message, data: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  return { getActiveConsultation, loading, error };
};

export const useAvailableMedics = () => {
  const [medics, setMedics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const getAvailableMedics = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminServices.getAvailableMedics();
      if (result.success) {
        setMedics(result.data);
      }
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching medics';
      console.error('Error fetching medics:', err);
      return { success: false, error: message, data: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void getAvailableMedics();
  }, [getAvailableMedics]);

  return { medics, loading, getAvailableMedics };
};

export const useForceAssignCase = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assignCase = useCallback(
    async (consultationId: string, medicId: string, reason: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await adminServices.forceAssignCase(consultationId, medicId, reason);
        if (!result.success) throw new Error(result.error);
        return { success: true, data: result.data };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error assigning case';
        setError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const forceAssignCase = useCallback(
    async (consultationId: string, medicId: string, reason = 'Manual override') => {
      return assignCase(consultationId, medicId, reason);
    },
    [assignCase]
  );

  return { assignCase, forceAssignCase, loading, error };
};

/**
 * AUTH HOOKS
 */

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await authServices.login(email, password);
        if (!result.success) throw new Error(result.error);

        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Login failed';
        setError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { login, loading, error };
};

export const useLogout = () => {
  const logout = usePortalAuthStore((state) => state.logout);
  const [loading, setLoading] = useState(false);

  const handleLogout = useCallback(async () => {
    setLoading(true);
    try {
      const result = await authServices.logout();
      if (result.success) {
        logout();
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  }, [logout]);

  return { logout: handleLogout, loading };
};

export const useAuthUser = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await authServices.getCurrentUser();
        if (result.success) {
          setUser(result.data);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading };
};
