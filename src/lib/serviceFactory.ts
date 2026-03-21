/**
 * Service Factory
 * Creates service instances with appropriate adapters based on environment
 * 
 * This is the main entry point for getting configured services.
 * Switch adapters here when changing backends (e.g., Supabase -> Firebase)
 */

import { BookingService } from '@/services/booking';
import { GeolocationService } from '@/services/geolocation';
import { SupabaseBookingRepository } from '@/adapters/supabase';
import { BrowserGeolocationProvider } from '@/adapters/browser';

// Singleton instances
let bookingServiceInstance: BookingService | null = null;
let geolocationServiceInstance: GeolocationService | null = null;

/**
 * Get the booking service instance
 * Currently configured with Supabase adapter
 */
export function getBookingService(): BookingService {
  if (!bookingServiceInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_ANON_KEY!;
    
    const repository = new SupabaseBookingRepository(supabaseUrl, supabaseAnonKey);
    bookingServiceInstance = new BookingService(repository);
  }
  return bookingServiceInstance;
}

/**
 * Get the geolocation service instance
 * Currently configured with browser geolocation API + Nominatim
 */
export function getGeolocationService(): GeolocationService {
  if (!geolocationServiceInstance) {
    const provider = new BrowserGeolocationProvider();
    geolocationServiceInstance = new GeolocationService(provider);
  }
  return geolocationServiceInstance;
}

/**
 * Reset all service instances (useful for testing)
 */
export function resetServices(): void {
  bookingServiceInstance = null;
  geolocationServiceInstance = null;
}
