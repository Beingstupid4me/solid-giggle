/**
 * Booking Validation Service
 * Pure business logic for validating booking data - no external dependencies
 */

import { BookingData } from './types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateBookingData(data: BookingData): ValidationResult {
  const errors: string[] = [];

  // Patient name validation
  if (!data.patientName || data.patientName.trim().length < 2) {
    errors.push('Please enter a valid patient name (at least 2 characters)');
  }

  // Phone validation: Indian format - must be +91 followed by 10 digits
  const phoneDigits = data.phone.replace(/\D/g, '');
  if (phoneDigits.length !== 12 || !phoneDigits.startsWith('91')) {
    errors.push('Please enter a valid 10-digit Indian phone number');
  }

  // Address validation
  if (!data.manualAddress || data.manualAddress.trim().length < 10) {
    errors.push('Please enter a complete address (at least 10 characters)');
  }

  // Service category validation
  const validServices = ['home-visit', 'teleconsult', 'nursing', 'lab'];
  if (!data.serviceCategory || !validServices.includes(data.serviceCategory)) {
    errors.push('Please select a valid service type');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Format phone number to Indian standard
 */
export function formatIndianPhone(input: string): string {
  // Remove all non-digits
  let digits = input.replace(/\D/g, '');
  
  // Remove leading 91 if present
  if (digits.startsWith('91') && digits.length > 10) {
    digits = digits.slice(2);
  }
  
  // Limit to 10 digits
  digits = digits.slice(0, 10);
  
  // Format: +91 XXXXX XXXXX
  let formatted = '+91 ';
  if (digits.length > 0) {
    formatted += digits.slice(0, 5);
    if (digits.length > 5) {
      formatted += ' ' + digits.slice(5);
    }
  }
  
  return formatted;
}

/**
 * Check if phone number is complete (10 digits after +91)
 */
export function isPhoneComplete(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 12 && digits.startsWith('91');
}
