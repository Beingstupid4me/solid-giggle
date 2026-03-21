/**
 * Browser Geolocation Provider
 * Implements GeolocationProvider using browser's native Geolocation API
 */

import { 
  GeolocationProvider, 
  GeolocationResult, 
  GPSPosition,
  ReverseGeocodeResult,
  GeolocationConfig,
  DEFAULT_GEOLOCATION_CONFIG,
  AddressComponents
} from '@/services/geolocation';

export class BrowserGeolocationProvider implements GeolocationProvider {
  private config: GeolocationConfig;

  constructor(config: Partial<GeolocationConfig> = {}) {
    this.config = { ...DEFAULT_GEOLOCATION_CONFIG, ...config };
  }

  async getCurrentPosition(highAccuracy = true): Promise<GeolocationResult> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({
          success: false,
          error: 'Geolocation is not supported by your browser',
        });
        return;
      }

      let bestPosition: GeolocationPosition | null = null;
      let attempts = 0;
      let watchId: number;

      const processPosition = (position: GeolocationPosition) => {
        attempts++;
        
        // Keep the most accurate reading
        if (!bestPosition || position.coords.accuracy < bestPosition.coords.accuracy) {
          bestPosition = position;
        }

        // If we got target accuracy or max attempts, use it
        if (position.coords.accuracy <= this.config.targetAccuracy || 
            attempts >= this.config.maxAttempts) {
          navigator.geolocation.clearWatch(watchId);
          
          resolve({
            success: true,
            position: {
              lat: bestPosition.coords.latitude,
              lng: bestPosition.coords.longitude,
              accuracy: Math.round(bestPosition.coords.accuracy),
            },
          });
        }
      };

      const handleError = (error: GeolocationPositionError) => {
        navigator.geolocation.clearWatch(watchId);
        
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

        resolve({ success: false, error: errorMessage });
      };

      // Use watchPosition for continuous updates to get best accuracy
      watchId = navigator.geolocation.watchPosition(
        processPosition,
        handleError,
        {
          enableHighAccuracy: highAccuracy && this.config.enableHighAccuracy,
          timeout: this.config.timeout,
          maximumAge: this.config.maximumAge,
        }
      );

      // Timeout fallback - use best position we have
      setTimeout(() => {
        if (bestPosition) {
          navigator.geolocation.clearWatch(watchId);
          resolve({
            success: true,
            position: {
              lat: bestPosition.coords.latitude,
              lng: bestPosition.coords.longitude,
              accuracy: Math.round(bestPosition.coords.accuracy),
            },
          });
        }
      }, this.config.timeout);
    });
  }

  async reverseGeocode(position: GPSPosition): Promise<ReverseGeocodeResult> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'Sanocare-App/1.0',
          },
        }
      );

      if (!response.ok) {
        return { success: false, error: 'Geocoding service unavailable' };
      }

      const data = await response.json();
      
      if (!data.address) {
        return { success: false, error: 'No address found for location' };
      }

      const address: AddressComponents = {
        houseNumber: data.address.house_number,
        road: data.address.road,
        locality: data.address.neighbourhood || data.address.suburb || data.address.village,
        city: data.address.city || data.address.town || data.address.municipality,
        state: data.address.state,
        postalCode: data.address.postcode,
        country: data.address.country,
        formatted: data.display_name,
      };

      return { success: true, address };
    } catch (err) {
      console.error('Reverse geocoding error:', err);
      return { success: false, error: 'Failed to get address from location' };
    }
  }
}
