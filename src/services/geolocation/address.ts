/**
 * Address Utility Functions
 * Business logic for address manipulation
 */

import { AddressComponents } from './types';

/**
 * Extract only locality from address components
 * Used to append locality to user-typed address without overwriting
 */
export function extractLocality(address: AddressComponents): string | null {
  // Priority: neighbourhood > suburb > locality > city
  const localityParts: string[] = [];
  
  if (address.locality) {
    localityParts.push(address.locality);
  }
  if (address.city && address.city !== address.locality) {
    localityParts.push(address.city);
  }
  
  return localityParts.length > 0 ? localityParts.join(', ') : null;
}

/**
 * Append locality to existing address if not already present
 */
export function appendLocalityToAddress(existingAddress: string, locality: string | null): string {
  if (!locality) return existingAddress;
  
  const trimmedAddress = existingAddress.trim();
  const lowerAddress = trimmedAddress.toLowerCase();
  const lowerLocality = locality.toLowerCase();
  
  // Don't append if locality is already in the address
  if (lowerAddress.includes(lowerLocality)) {
    return trimmedAddress;
  }
  
  // Append with comma separator
  return trimmedAddress ? `${trimmedAddress}, ${locality}` : locality;
}

/**
 * Check if address looks complete (has locality/city info)
 */
export function isAddressComplete(address: string): boolean {
  // Simple heuristic: address should have at least 3 comma-separated parts
  // or be longer than 30 characters
  const parts = address.split(',').map(p => p.trim()).filter(Boolean);
  return parts.length >= 3 || address.length > 30;
}

/**
 * Format address for display
 */
export function formatAddressForDisplay(address: AddressComponents): string {
  const parts: string[] = [];
  
  if (address.houseNumber && address.road) {
    parts.push(`${address.houseNumber} ${address.road}`);
  } else if (address.road) {
    parts.push(address.road);
  }
  
  if (address.locality) {
    parts.push(address.locality);
  }
  
  if (address.city) {
    parts.push(address.city);
  }
  
  if (address.postalCode) {
    parts.push(address.postalCode);
  }
  
  return parts.join(', ');
}
