/**
 * Geolocation Service
 * Business logic for geolocation operations
 */

import { 
  GeolocationProvider, 
  GeolocationResult, 
  GPSPosition,
  ReverseGeocodeResult 
} from './types';
import { extractLocality, appendLocalityToAddress } from './address';

export class GeolocationService {
  constructor(private provider: GeolocationProvider) {}

  /**
   * Get current high-accuracy GPS position
   */
  async getCurrentPosition(): Promise<GeolocationResult> {
    return this.provider.getCurrentPosition(true);
  }

  /**
   * Get position and append locality to existing address
   */
  async getPositionWithLocality(existingAddress: string): Promise<{
    position: GPSPosition | null;
    updatedAddress: string;
    error?: string;
  }> {
    const positionResult = await this.getCurrentPosition();
    
    if (!positionResult.success || !positionResult.position) {
      return {
        position: null,
        updatedAddress: existingAddress,
        error: positionResult.error,
      };
    }

    // Try to get address for locality extraction
    const geocodeResult = await this.provider.reverseGeocode(positionResult.position);
    
    if (geocodeResult.success && geocodeResult.address) {
      const locality = extractLocality(geocodeResult.address);
      const updatedAddress = appendLocalityToAddress(existingAddress, locality);
      
      return {
        position: positionResult.position,
        updatedAddress,
      };
    }

    // Return position without address update if geocoding failed
    return {
      position: positionResult.position,
      updatedAddress: existingAddress,
    };
  }

  /**
   * Reverse geocode a position
   */
  async reverseGeocode(position: GPSPosition): Promise<ReverseGeocodeResult> {
    return this.provider.reverseGeocode(position);
  }
}
