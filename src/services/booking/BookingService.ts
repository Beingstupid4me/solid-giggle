/**
 * Booking Service
 * Business logic orchestration layer - coordinates between validation and repository
 */

import { BookingData, BookingRepository, BookingResult, SavedBooking, BookingStatus } from './types';
import { validateBookingData, ValidationResult } from './validation';

export class BookingService {
  constructor(private repository: BookingRepository) {}

  /**
   * Create a new booking with validation
   */
  async createBooking(data: BookingData): Promise<BookingResult> {
    // Validate first
    const validation = this.validate(data);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.errors[0], // Return first error for simplicity
      };
    }

    // Normalize data
    const normalizedData: BookingData = {
      ...data,
      patientName: data.patientName.trim(),
      phone: data.phone.trim(),
      manualAddress: data.manualAddress.trim(),
    };

    // Delegate to repository
    return this.repository.create(normalizedData);
  }

  /**
   * Validate booking data without creating
   */
  validate(data: BookingData): ValidationResult {
    return validateBookingData(data);
  }

  /**
   * Get booking by ID
   */
  async getBooking(id: string): Promise<SavedBooking | null> {
    return this.repository.getById(id);
  }

  /**
   * Get all bookings for a phone number
   */
  async getBookingsByPhone(phone: string): Promise<SavedBooking[]> {
    return this.repository.getByPhone(phone);
  }

  /**
   * Update booking status
   */
  async updateStatus(id: string, status: BookingStatus): Promise<BookingResult> {
    return this.repository.updateStatus(id, status);
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(id: string): Promise<BookingResult> {
    return this.updateStatus(id, 'CANCELLED');
  }
}
