/**
 * MedicMapBeacon.tsx
 *
 * Invisible component that runs on the Medic's device.
 * - Watches GPS position using navigator.geolocation.watchPosition
 * - Sends updates to FastAPI WebSocket every 10 seconds
 * - Only active when consultation status is 'assigned' or 'in_transit'
 */

'use client';

import { useEffect, useRef } from 'react';
import { useSupabaseIntegration } from '@/hooks/useSupabaseIntegration';
import { supabase } from '@/lib/supabase';

interface MedicMapBeaconProps {
  consultationId: string;
  isActive: boolean; // Only track when status is 'assigned' or 'in_transit'
}

export function MedicMapBeacon({ consultationId, isActive }: MedicMapBeaconProps) {
  const wsRef = useRef<WebSocket | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const UPDATE_INTERVAL = 10000; // Send GPS update every 10 seconds

  useEffect(() => {
    if (!isActive) {
      // Stop watching position if not active
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    const initWebSocket = async () => {
      try {
        // Get JWT token
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;

        if (!token) {
          console.error('[GPS Beacon] No auth token available');
          return;
        }

        // Connect to WebSocket
        const wsURL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/v1/ws';
        const ws = new WebSocket(`${wsURL}/location?token=${token}`);

        ws.onopen = () => {
          console.log('[GPS Beacon] WebSocket connected');
          wsRef.current = ws;
        };

        ws.onerror = (error) => {
          console.error('[GPS Beacon] WebSocket error:', error);
        };

        ws.onclose = () => {
          console.log('[GPS Beacon] WebSocket disconnected');
          wsRef.current = null;
        };
      } catch (err) {
        console.error('[GPS Beacon] Initialization error:', err);
      }
    };

    // Only init WebSocket once
    if (!wsRef.current) {
      initWebSocket();
    }

    // Start watching position
    const options = {
      enableHighAccuracy: true, // Use GPS for better accuracy
      timeout: 10000, // 10 seconds timeout
      maximumAge: 5000, // 5 seconds cache
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const now = Date.now();

        // Throttle updates to every 10 seconds
        if (now - lastUpdateRef.current < UPDATE_INTERVAL) {
          return;
        }

        lastUpdateRef.current = now;

        const { latitude, longitude, accuracy } = position.coords;

        // Send via WebSocket
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          const message = {
            type: 'gps_update',
            lat: latitude,
            lng: longitude,
            accuracy: accuracy,
            consultationId: consultationId,
            timestamp: new Date().toISOString(),
          };

          wsRef.current.send(JSON.stringify(message));
          console.log('[GPS Beacon] Sent location update:', {
            lat: latitude.toFixed(4),
            lng: longitude.toFixed(4),
            accuracy: accuracy.toFixed(0),
          });
        }
      },
      (error) => {
        console.warn('[GPS Beacon] Geolocation error:', error.message);
        // Errors include:
        // - PERMISSION_DENIED: User denied permission
        // - POSITION_UNAVAILABLE: Location not available
        // - TIMEOUT: Position request timed out
      },
      options
    );

    // Cleanup on unmount
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [isActive, consultationId]);

  // This component is invisible - no UI
  return null;
}
