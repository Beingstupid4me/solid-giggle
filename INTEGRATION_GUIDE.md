# Sanocare Frontend-Backend Integration Guide

This document explains how the frontend interacts with the backend for production deployment.

## Architecture Overview

### Three Integration Types

1. **Direct Supabase** (90% of operations)
   - All data queries (consultations, vitals, profiles, etc.)
   - Real-time subscriptions
   - No backend calls needed
   - Use: `supabaseServices.*`

2. **Backend Proxy (Auth)** (Required for login/signup)
   - Authentication endpoints
   - JWT token handling
   - User session management
   - Use: `backendAPI.signup()`, `backendAPI.login()`

3. **Backend Compute** (Specialized operations)
   - Video token generation (LiveKit signaling)
   - Billing calculations
   - GPS WebSocket relay
   - Use: `backendAPI.getVideoToken()`, `backendAPI.calculateBill()`

## Using Backend API

### 1. Setup Environment Variables

In `.env` or `.env.local`:

```bash
# Backend URL
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/v1/ws

# For production
# NEXT_PUBLIC_API_URL=https://api.sanocare.in
# NEXT_PUBLIC_WS_URL=wss://api.sanocare.in/v1/ws
```

### 2. Authentication Flow

#### Sign Up a New User

```typescript
import { backendAPI } from '@/lib/backendAPI';

async function handleSignup() {
  const result = await backendAPI.signup(
    'newuser@email.com',
    'SecurePassword123!',
    'John Doe',
    '+919876543210',
    'medic' // or 'doctor', 'patient', 'admin'
  );

  if (result.success) {
    // User created and auto-logged in
    // JWT token stored in session
    console.log('Signup successful!');
  } else {
    console.error('Signup error:', result.error);
  }
}
```

#### Login

```typescript
import { authServices } from '@/lib/supabaseServices';

async function handleLogin() {
  const result = await authServices.login('user@email.com', 'password123');

  if (result.success) {
    // User logged in, JWT stored
    console.log('Login successful!');
  } else {
    console.error('Login error:', result.error);
  }
}
```

#### Logout

```typescript
import { authServices } from '@/lib/supabaseServices';

async function handleLogout() {
  const result = await authServices.logout();
  
  if (result.success) {
    // User session cleared
    console.log('Logged out!');
  }
}
```

### 3. Video Call Integration

#### Get LiveKit Token

```typescript
import { backendAPI } from '@/lib/backendAPI';

async function startVideoCall(consultationId: string) {
  const result = await backendAPI.getVideoToken(consultationId);

  if (result.success) {
    const { token, roomId, livekitUrl } = result.data!;

    // Connect to LiveKit SFU
    const room = await connect(livekitUrl, token, {
      autoSubscribe: true,
    });

    console.log('Connected to room:', roomId);
    return room;
  } else {
    console.error('Failed to get video token:', result.error);
  }
}
```

### 4. Billing Calculation

#### Calculate Consultation Bill

```typescript
import { backendAPI } from '@/lib/backendAPI';

async function calculateBill(
  arrivedAt: string, // ISO timestamp
  closedAt: string,  // ISO timestamp
  distanceKm?: number
) {
  const result = await backendAPI.calculateBill(arrivedAt, closedAt, distanceKm);

  if (result.success) {
    const { total, breakdown } = result.data!;
    
    // Display bill to user
    console.log(`Total bill: ₹${total}`);
    console.log('Breakdown:', breakdown);
  }
}

// Example usage:
// const arrivedAt = '2026-03-25T10:30:00Z';
// const closedAt = '2026-03-25T10:36:00Z'; // 6 minutes
// const distance = 2.5; // km

// calculateBill(arrivedAt, closedAt, distance);
// Output: { total: 599, ... } ≈ 499 (base) + 100 (overtime) + 0 (distance under ₹2.50)
```

### 5. GPS Tracking (WebSocket)

#### Real-Time Medic Location (Patient View)

```typescript
import { backendAPI } from '@/lib/backendAPI';

export function useGPSTracking(medicId: string, onLocationUpdate: (loc: any) => void) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Open WebSocket
    const closWS = backendAPI.openGPSWebSocket(
      (data) => {
        if (data.type === 'medic_location_updated') {
          onLocationUpdate(data);
          // Update map with lat, lng
        }
      },
      (error) => {
        console.error('GPS tracking error:', error);
        setIsConnected(false);
      }
    );

    setIsConnected(true);

    return () => closWS(); // Cleanup
  }, [medicId]);

  return { isConnected };
}
```

#### Send GPS Update (Medic App)

```typescript
import { useEffect, useState } from 'react';
import { backendAPI } from '@/lib/backendAPI';

export function useMedicGPS(consultationId: string) {
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    // Open WebSocket for GPS updates
    let wsInstance: WebSocket;
    let closeWS: () => void;

    const initWS = async () => {
      const token = localStorage.getItem('supabase.auth.token');
      const wsURL =
        process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/v1/ws';

      wsInstance = new WebSocket(`${wsURL}/location?token=${token}`);

      wsInstance.onopen = () => {
        console.log('GPS WebSocket connected');
        setWs(wsInstance);
      };

      wsInstance.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    };

    initWS();

    // Watch position and send updates every 10 seconds
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          backendAPI.sendGPSUpdate(
            ws,
            position.coords.latitude,
            position.coords.longitude,
            consultationId,
            position.coords.accuracy
          );
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 10000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      if (wsInstance && wsInstance.readyState === WebSocket.OPEN) {
        wsInstance.close();
      }
    };
  }, [consultationId, ws]);
}
```

## Common Patterns

### Loading States

```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

async function doSomething() {
  try {
    setLoading(true);
    setError(null);

    const result = await backendAPI.somethingAsync();

    if (!result.success) {
      setError(result.error || 'Operation failed');
      return;
    }

    // Handle success
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Unknown error');
  } finally {
    setLoading(false);
  }
}
```

### Error Handling

All `backendAPI` calls return: `{ success: boolean; data?: T; error?: string }`

```typescript
if (result.success) {
  // Use result.data - type-safe!
} else {
  // Display result.error to user
  toast.error(result.error);
}
```

## Production Checklist

- [ ] All `NEXT_PUBLIC_*` env vars set in deployment platform
- [ ] Non-public env vars (API keys) in backend only
- [ ] SSL certificates configured (required for Geolocation API)
- [ ] CORS configured on backend if needed
- [ ] WebSocket upgrades allowed on hosting
- [ ] Supabase RLS policies enforced
- [ ] Rate limiting configured on backend
- [ ] Error logging/monitoring enabled
- [ ] Load testing completed

## Troubleshooting

### "401 Unauthorized" Errors

- Verify JWT token is valid
- Check if token expired (call refresh endpoint)
- Ensure Supabase auth is configured correctly

### WebSocket Connection Failed

- Check if backend is running
- Verify `NEXT_PUBLIC_WS_URL` is correct
- Ensure WebSocket upgrades are allowed on hosting
- Check browser console for token issues

### Billing Calculation Wrong

- Verify timestamps are ISO format with timezone
- Ensure distance in kilometers (not meters)
- Check if overtime logic is correct (₹100 per 5 min, not per minute)

## API Endpoint Reference

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/v1/auth/signup` | POST | No | Create new user account |
| `/v1/auth/login` | POST | No | Login existing user |
| `/v1/auth/logout` | POST | Yes | Logout current user |
| `/v1/auth/refresh` | POST | No | Refresh JWT token |
| `/v1/auth/me` | GET | Yes | Get current user info |
| `/v1/video/token` | GET | Yes | Get LiveKit token |
| `/v1/video/doctor-initiate` | POST | Yes | Doctor initiates call |
| `/v1/video/medic-join` | POST | Yes | Medic joins call |
| `/v1/payments/calculate-bill` | POST | Yes | Calculate consultation bill |
| `/v1/payments/mock-success` | POST | Yes | Mock payment (testing) |
| `/v1/ws/location` | WebSocket | Token | GPS tracking relay |
