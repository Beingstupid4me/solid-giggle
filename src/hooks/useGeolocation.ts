import { useCallback } from 'react';
import { useBookingStore, GPSLocation } from '@/store/bookingStore';

// High accuracy geolocation options for <5m precision
const HIGH_ACCURACY_OPTIONS: PositionOptions = {
  enableHighAccuracy: true, // Uses GPS, not just WiFi/Cell
  timeout: 15000, // 15 seconds max wait
  maximumAge: 0, // Don't use cached position
};

export function useGeolocation() {
  const { location, setLocating, setGPSLocation, setDetails, setLocationError } = useBookingStore();

  const getHighAccuracyLocation = useCallback((): Promise<GPSLocation> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      setLocating(true);
      setLocationError(null);

      // Watch position for better accuracy - takes multiple readings
      let bestPosition: GeolocationPosition | null = null;
      let watchId: number;
      let attempts = 0;
      const maxAttempts = 5;

      const processPosition = (position: GeolocationPosition) => {
        attempts++;
        
        // Keep the most accurate reading
        if (!bestPosition || position.coords.accuracy < bestPosition.coords.accuracy) {
          bestPosition = position;
        }

        // If we got <5m accuracy or max attempts, use it
        if (position.coords.accuracy <= 5 || attempts >= maxAttempts) {
          navigator.geolocation.clearWatch(watchId);
          
          const gpsLocation: GPSLocation = {
            lat: bestPosition.coords.latitude,
            lng: bestPosition.coords.longitude,
            accuracy: Math.round(bestPosition.coords.accuracy),
          };

          setGPSLocation(gpsLocation);
          setLocating(false);
          resolve(gpsLocation);
        }
      };

      const handleError = (error: GeolocationPositionError) => {
        navigator.geolocation.clearWatch(watchId);
        setLocating(false);

        let errorMessage: string;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location unavailable. Please try again.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage = 'Unable to get location. Please try again.';
        }

        setLocationError(errorMessage);
        reject(new Error(errorMessage));
      };

      // Use watchPosition for continuous updates to get best accuracy
      watchId = navigator.geolocation.watchPosition(
        processPosition,
        handleError,
        HIGH_ACCURACY_OPTIONS
      );

      // Timeout fallback - use best position we have after 10 seconds
      setTimeout(() => {
        if (bestPosition) {
          navigator.geolocation.clearWatch(watchId);
          
          const gpsLocation: GPSLocation = {
            lat: bestPosition.coords.latitude,
            lng: bestPosition.coords.longitude,
            accuracy: Math.round(bestPosition.coords.accuracy),
          };

          setGPSLocation(gpsLocation);
          setLocating(false);
          resolve(gpsLocation);
        }
      }, 10000);
    });
  }, [setLocating, setGPSLocation, setLocationError]);

  // Get locality info from coordinates (city, neighbourhood)
  const getLocalityFromCoords = useCallback(async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      // Get only locality parts (neighbourhood, city, state) - NOT house number/road
      const addr = data.address;
      const localityParts = [
        addr?.neighbourhood || addr?.suburb,
        addr?.city || addr?.town || addr?.village,
        addr?.state_district || addr?.state,
      ].filter(Boolean);

      return localityParts.join(', ') || '';
    } catch {
      return '';
    }
  }, []);

  // Full reverse geocode (for cases where we want full address)
  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      // Build a readable address from components
      const addr = data.address;
      const parts = [
        addr?.house_number,
        addr?.road,
        addr?.neighbourhood || addr?.suburb,
        addr?.city || addr?.town || addr?.village,
        addr?.state_district || addr?.state,
      ].filter(Boolean);

      return parts.join(', ') || data.display_name || 'Location detected';
    } catch {
      return 'Location detected';
    }
  }, []);

  // Detect location and APPEND locality to existing address
  const detectLocation = useCallback(async () => {
    try {
      const gps = await getHighAccuracyLocation();
      const locality = await getLocalityFromCoords(gps.lat, gps.lng);
      
      // Get current typed address
      const currentAddress = location.trim();
      
      if (locality) {
        if (currentAddress) {
          // User has typed something - APPEND locality if not already present
          const localityLower = locality.toLowerCase();
          const addressLower = currentAddress.toLowerCase();
          
          // Check if locality parts are already in the address
          const localityWords = localityLower.split(',').map(s => s.trim());
          const hasLocality = localityWords.some(word => addressLower.includes(word));
          
          if (!hasLocality) {
            // Append locality to existing address
            setDetails({ location: `${currentAddress}, ${locality}` });
          }
          // If locality already present, don't modify
        } else {
          // No address typed yet - just set the locality as starting point
          setDetails({ location: locality });
        }
      }
      
      return { gps, locality };
    } catch (error) {
      throw error;
    }
  }, [getHighAccuracyLocation, getLocalityFromCoords, location, setDetails]);

  return {
    detectLocation,
    getHighAccuracyLocation,
    reverseGeocode,
    getLocalityFromCoords,
  };
}
