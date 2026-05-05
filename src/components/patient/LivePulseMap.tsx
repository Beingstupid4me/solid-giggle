/**
 * LivePulseMap.tsx
 *
 * Real-time map showing:
 * - Patient home location (blue pin)
 * - Moving medic icon (ambulance/car)
 * - Distance and ETA
 *
 * Used by: Patient Dashboard, Admin Heatmap
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import L from 'leaflet';
import { supabase } from '@/lib/supabase';
import { Activity, MapPin, Navigation } from 'lucide-react';

interface LivePulseMapProps {
  consultationId: string;
  patientLat: number;
  patientLng: number;
  medicId: string;
  isActive: boolean; // Map should be visible only during 'assigned' or 'in_transit'
}

interface MedicLocation {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: string;
}

// Custom icons
const createMedicIcon = () => {
  return L.divIcon({
    html: `<div style="
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #2b8cee, #1a5cbe);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transition: all 0.1s ease-out;
      cursor: pointer;
    ">
      🚑
    </div>`,
    iconSize: [40, 40],
    className: 'medic-icon',
  });
};

const createPatientIcon = () => {
  return L.divIcon({
    html: `<div style="
      width: 40px;
      height: 40px;
      background: #ef4444;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    ">
      📍
    </div>`,
    iconSize: [40, 40],
    className: 'patient-icon',
  });
};

export function LivePulseMap({
  consultationId,
  patientLat,
  patientLng,
  medicId,
  isActive,
}: LivePulseMapProps) {
  const [medicLocation, setMedicLocation] = useState<MedicLocation | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [eta, setEta] = useState<string>('Calculating...');
  const medicMarkerRef = useRef<L.Marker>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Calculate distance between two lat/lng points (Haversine formula)
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  // Calculate ETA based on average speed (50 km/h)
  const calculateETA = (distanceKm: number): string => {
    const averageSpeedKmh = 50;
    const timeMinutes = (distanceKm / averageSpeedKmh) * 60;

    if (timeMinutes < 1) return 'Arriving now';
    if (timeMinutes < 2) return '1 min away';
    return `${Math.ceil(timeMinutes)} min away`;
  };

  useEffect(() => {
    if (!isActive) {
      // Disconnect WebSocket if not active
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }

    const initWebSocket = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;

        if (!token) {
          console.error('[Live Map] No auth token');
          return;
        }

        const wsURL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/v1/ws';
        const ws = new WebSocket(`${wsURL}/location?token=${token}`);

        ws.onopen = () => {
          console.log('[Live Map] WebSocket connected, subscribing to medic');

          // Subscribe to medic location updates
          ws.send(
            JSON.stringify({
              type: 'subscribe',
              medicId: medicId,
            })
          );
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'medic_location_updated' || data.type === 'MEDIC_LOCATION_UPDATED') {
              const newLocation: MedicLocation = {
                lat: data.lat,
                lng: data.lng,
                accuracy: data.accuracy || 0,
                timestamp: data.timestamp || new Date().toISOString(),
              };

              setMedicLocation(newLocation);

              // Calculate distance
              const dist = calculateDistance(patientLat, patientLng, data.lat, data.lng);
              setDistance(dist);
              setEta(calculateETA(dist));

              console.log('[Live Map] Medic location updated:', {
                lat: data.lat.toFixed(4),
                lng: data.lng.toFixed(4),
                distance: dist.toFixed(2),
              });
            }
          } catch (err) {
            console.error('[Live Map] Message parse error:', err);
          }
        };

        ws.onerror = (error) => {
          console.error('[Live Map] WebSocket error:', error);
        };

        ws.onclose = () => {
          console.log('[Live Map] WebSocket disconnected');
          wsRef.current = null;
        };

        wsRef.current = ws;
      } catch (err) {
        console.error('[Live Map] Init error:', err);
      }
    };

    if (!wsRef.current) {
      initWebSocket();
    }

    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [isActive, consultationId, medicId, patientLat, patientLng]);

  if (!isActive) {
    return (
      <div className="w-full h-96 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
        Map will be available once medic is assigned
      </div>
    );
  }

  const medicPosition: LatLngExpression = medicLocation
    ? [medicLocation.lat, medicLocation.lng]
    : [patientLat, patientLng]; // Default to patient if medic not yet reported

  const patientPosition: LatLngExpression = [patientLat, patientLng];

  // Center map between patient and medic
  const centerLat = (patientLat + (medicLocation?.lat || patientLat)) / 2;
  const centerLng = (patientLng + (medicLocation?.lng || patientLng)) / 2;

  return (
    <div className="w-full rounded-lg overflow-hidden border border-slate-200 shadow-md">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={14}
        className="w-full h-96"
        style={{ background: '#f0f9ff' }}
      >
        {/* OpenStreetMap tiles */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {/* Patient location (static) */}
        <Marker position={patientPosition} icon={createPatientIcon()}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">Patient Home</p>
              <p className="text-slate-600">{patientLat.toFixed(4)}, {patientLng.toFixed(4)}</p>
            </div>
          </Popup>
          <Tooltip permanent direction="top" offset={[0, -20]}>
            <span className="text-xs font-semibold">Patient</span>
          </Tooltip>
        </Marker>

        {/* Medic location (moving) */}
        {medicLocation && (
          <Marker
            position={medicPosition}
            icon={createMedicIcon()}
            ref={medicMarkerRef}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">Medic Location</p>
                <p className="text-slate-600">
                  {medicLocation.lat.toFixed(4)}, {medicLocation.lng.toFixed(4)}
                </p>
                <p className="text-slate-600">Accuracy: ±{medicLocation.accuracy.toFixed(0)}m</p>
                <p className="text-slate-600">
                  Distance: {distance?.toFixed(2)} km - {eta}
                </p>
              </div>
            </Popup>
            <Tooltip permanent direction="top" offset={[0, -20]}>
              <span className="text-xs font-semibold text-blue-600">{eta}</span>
            </Tooltip>
          </Marker>
        )}
      </MapContainer>

      {/* Info panel below map */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-slate-200">
        <div className="grid grid-cols-3 gap-4">
          {/* Distance */}
          <div className="flex items-center gap-2">
            <MapPin size={20} className="text-blue-600" />
            <div>
              <p className="text-xs text-slate-600">Distance</p>
              <p className="text-lg font-bold text-slate-900">
                {distance ? `${distance.toFixed(1)} km` : '—'}
              </p>
            </div>
          </div>

          {/* ETA */}
          <div className="flex items-center gap-2">
            <Navigation size={20} className="text-green-600" />
            <div>
              <p className="text-xs text-slate-600">ETA</p>
              <p className="text-lg font-bold text-slate-900">{eta}</p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <Activity size={20} className="text-amber-600 animate-pulse" />
            <div>
              <p className="text-xs text-slate-600">Status</p>
              <p className="text-lg font-bold text-slate-900">En Route</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
