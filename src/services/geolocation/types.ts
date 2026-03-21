/**
 * Geolocation Service Types
 * Core business types for geolocation functionality
 */

export interface GPSPosition {
  lat: number;
  lng: number;
  accuracy: number; // meters
}

export interface GeolocationResult {
  success: boolean;
  position?: GPSPosition;
  error?: string;
}

export interface AddressComponents {
  houseNumber?: string;
  road?: string;
  locality?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  formatted: string;
}

export interface ReverseGeocodeResult {
  success: boolean;
  address?: AddressComponents;
  error?: string;
}

/**
 * Geolocation Provider Interface
 * Implement this interface to create adapters for different geolocation providers
 */
export interface GeolocationProvider {
  getCurrentPosition(highAccuracy?: boolean): Promise<GeolocationResult>;
  reverseGeocode(position: GPSPosition): Promise<ReverseGeocodeResult>;
}

/**
 * Geolocation configuration
 */
export interface GeolocationConfig {
  enableHighAccuracy: boolean;
  timeout: number; // milliseconds
  maximumAge: number; // milliseconds
  maxAttempts: number; // for accuracy improvement
  targetAccuracy: number; // meters
}

export const DEFAULT_GEOLOCATION_CONFIG: GeolocationConfig = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 0,
  maxAttempts: 5,
  targetAccuracy: 5, // 5 meters
};
