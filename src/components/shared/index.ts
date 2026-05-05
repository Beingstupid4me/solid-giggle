/**
 * Video & Map Components Index
 *
 * Export all Pulse (GPS Map) and Clinical Bridge (Video Consultation) components
 */

// GPS Tracking (Medic side)
export { MedicMapBeacon } from '../field_node/MedicMapBeacon';

// Real-time Map Display (Patient/Admin side)
export { LivePulseMap } from '../patient/LivePulseMap';

// Video Consultation Components (Doctor/Medic side)
export { ClinicalVideoContainer } from './ClinicalVideoContainer';
export { MediaControls } from './MediaControls';

// Type definitions for components
export interface LocationUpdate {
  consultationId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
}

export interface MedicLocation {
  medicId: string;
  consultationId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
  speed?: number; // Optional: meters per second
}

export interface VideoSessionStatus {
  consultationId: string;
  connected: boolean;
  participantCount: number;
  cameraOn: boolean;
  micOn: boolean;
}
