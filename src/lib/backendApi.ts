/**
 * Backend API Service
 * Handles all calls to FastAPI backend for:
 * - Auth (signup, login, logout)
 * - Video tokens (LiveKit)
 * - Billing calculations
 * - WebSocket connections (GPS tracking)
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const ACCESS_TOKEN_KEY = 'sc_access_token';
const REFRESH_TOKEN_KEY = 'sc_refresh_token';
const ROLE_KEY = 'sc_role';

/**
 * Token storage helpers for backend auth proxy.
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function persistAuthSession(token?: string, refreshToken?: string, role?: string) {
  if (typeof window === 'undefined') {
    return;
  }
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    document.cookie = `sc_token=${encodeURIComponent(token)}; path=/; samesite=lax`;
  }
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
  if (role) {
    localStorage.setItem(ROLE_KEY, role);
    document.cookie = `sc_role=${encodeURIComponent(role)}; path=/; samesite=lax`;
  }
}

function clearAuthSession() {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  document.cookie = 'sc_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  document.cookie = 'sc_role=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
}

/**
 * Make authorized API call to backend
 */
async function callBackendAPI<T>(
  path: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
  body?: any,
  customHeaders?: Record<string, string>
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const token = getAuthToken();
    const url = `${API_BASE_URL}${path}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...customHeaders,
    };

    const response = await fetch(url, {
      method,
      headers,
      ...(body && { body: JSON.stringify(body) }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.detail || `API error: ${response.status}`);
    }

    return responseData;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'API call failed';
    return { success: false, error: message };
  }
}

/**
 * BACKEND API SERVICES
 */

export const backendAPI = {
  // ============= AUTH ==============
  /**
   * Signup via FastAPI (alternative to direct Supabase if needed)
   */
  async signup(
    phone: string,
    password: string,
    fullName: string,
    role: string,
    email: string
  ) {
    const response = await callBackendAPI<any>('/v1/auth/register', 'POST', {
      email,
      phone,
      password,
      full_name: fullName,
      role,
    });
    const auth = (response as any)?.data;
    if (response.success && auth?.token) {
      persistAuthSession(auth.token, auth.refreshToken, role);
    }
    return response;
  },

  /**
   * Login via FastAPI (alternative to direct Supabase if needed)
   */
  async login(identifier: string, password: string, role: string) {
    const isEmail = identifier.includes('@');
    const response = await callBackendAPI<any>('/v1/auth/login', 'POST', {
      ...(isEmail ? { email: identifier } : { phone: identifier }),
      password,
      role,
    });
    const auth = (response as any)?.data;
    if (response.success && auth?.token) {
      persistAuthSession(auth.token, auth.refreshToken, role);
    }
    return response;
  },

  /**
   * Logout via FastAPI
   */
  async logout() {
    const response = await callBackendAPI('/v1/auth/logout', 'POST');
    clearAuthSession();
    return response;
  },

  /**
   * Get current user info
   */
  async getMe() {
    return callBackendAPI('/v1/auth/me');
  },

  /**
   * Refresh session
   */
  async refreshSession(refreshToken: string) {
    const response = await callBackendAPI<any>('/v1/auth/refresh', 'POST', {
      refreshToken,
    });
    const auth = (response as any)?.data;
    const role = typeof window !== 'undefined' ? localStorage.getItem(ROLE_KEY) || undefined : undefined;
    if (response.success && auth?.token) {
      persistAuthSession(auth.token, auth.refreshToken, role);
    }
    return response;
  },

  // ============= VIDEO ==============
  /**
   * Get LiveKit token for video consultation
   */
  async getVideoToken(consultationId: string) {
    return callBackendAPI<{
      consultationId: string;
      roomId: string;
      token: string;
      role: string;
      livekitUrl: string;
    }>(`/v1/video/token?consultation_id=${consultationId}`);
  },

  /**
   * Doctor initiate video session
   */
  async doctorInitiateVideo(consultationId: string, doctorId: string) {
    return callBackendAPI('/v1/video/doctor-initiate', 'POST', {
      consultation_id: consultationId,
      doctor_id: doctorId,
    });
  },

  /**
   * Medic join video session
   */
  async medicJoinVideo(consultationId: string, medicId: string) {
    return callBackendAPI('/v1/video/medic-join', 'POST', {
      consultation_id: consultationId,
      medic_id: medicId,
    });
  },

  // ============= BILLING ==============
  /**
   * Calculate consultation bill
   * @param arrivedAt ISO datetime when medic arrived
   * @param closedAt ISO datetime when consultation closed
   * @param distanceKm Distance traveled in kilometers
   */
  async calculateBill(arrivedAt: string, closedAt: string, distanceKm?: number) {
    return callBackendAPI<{
      base_rate: number;
      time_duration_minutes: number;
      overtime_intervals: number;
      overtime_charge: number;
      distance_km: number;
      distance_charge: number;
      subtotal: number;
      tax: number;
      total: number;
      currency: string;
    }>('/v1/payments/calculate-bill', 'POST', {
      arrived_at: arrivedAt,
      closed_at: closedAt,
      distance_km: distanceKm || 0,
    });
  },

  /**
   * Mock payment success (for testing)
   */
  async mockPaymentSuccess(consultationId: string, outcome: 'paid' | 'searching') {
    return callBackendAPI('/v1/payments/mock-success', 'POST', {
      consultation_id: consultationId,
      outcome,
    });
  },

  async submitVitals(
    consultationId: string,
    payload: {
      sbp?: number | null;
      dbp?: number | null;
      hr?: number | null;
      temp?: number | null;
      spo2?: number | null;
      bloodSugar?: number | null;
      syncKey?: string;
      capturedAt?: string;
    }
  ) {
    return callBackendAPI(`/v1/consultation/${consultationId}/vitals`, 'POST', payload);
  },

  async createConsultation(payload: {
    address_line?: string;
    latitude?: number;
    longitude?: number;
    status?: string;
  }) {
    return callBackendAPI('/v1/consultations', 'POST', payload);
  },

  // ============= WEBSOCKET ==============
  /**
   * Create WebSocket connection for GPS tracking
   * Returns function to close connection
   */
  openGPSWebSocket(
    onLocationUpdate: (data: any) => void,
    onError: (error: string) => void
  ): () => void {
    const token = getAuthToken() || '';
    const wsURL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/v1/ws';
    
    const ws = new WebSocket(`${wsURL}/location?token=${token}`);

    ws.onopen = () => {
      console.log('[GPS WS] Connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onLocationUpdate(data);
      } catch (err) {
        console.error('[GPS WS] Parse error:', err);
      }
    };

    ws.onerror = (error) => {
      const message = error instanceof Event ? 'WebSocket error' : String(error);
      console.error('[GPS WS] Error:', message);
      onError(message);
    };

    ws.onclose = () => {
      console.log('[GPS WS] Disconnected');
    };

    // Return function to close connection
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  },

  /**
   * Subscribe to medic location (send subscription message)
   */
  sendLocationSubscription(ws: WebSocket, consultationId: string) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: 'SUBSCRIBE',
          consultationId,
        })
      );
    }
  },

  /**
   * Send GPS update (from medic device)
   */
  sendGPSUpdate(
    ws: WebSocket,
    lat: number,
    lng: number,
    consultationId: string,
    accuracy?: number
  ) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: 'gps_update',
          lat,
          lng,
          consultationId,
          accuracy: accuracy || 0,
          timestamp: new Date().toISOString(),
        })
      );
    }
  },
};

export const backendAuthStorage = {
  getAccessToken: getAuthToken,
  getRefreshToken: () => (typeof window === 'undefined' ? null : localStorage.getItem(REFRESH_TOKEN_KEY)),
  getRole: () => (typeof window === 'undefined' ? null : localStorage.getItem(ROLE_KEY)),
  persist: persistAuthSession,
  clear: clearAuthSession,
};

export default backendAPI;
