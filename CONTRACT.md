# Sanocare Portal API Contract

**Version:** 2.0.0  
**Last Updated:** March 2026  
**Status:** FINAL - Binding Contract for Frontend & Backend Teams  
**Architecture:** Supabase PostgreSQL + PostGIS | FastAPI Backend | Redis Cache | LiveKit SFU | Next.js PWA

---

## Table of Contents

1. [Overview & Architecture](#overview--architecture)
2. [Technology Stack](#technology-stack)
3. [Authentication & Authorization](#authentication--authorization)
4. [Base URL & Request Format](#base-url--request-format)
5. [Global Data Models](#global-data-models)
6. [Core Supabase Tables](#core-supabase-tables)
7. [API Endpoints by Module](#api-endpoints-by-module)
8. [Real-Time Features (WebSockets)](#real-time-features-websockets)
9. [Offline-First Sync Protocol](#offline-first-sync-protocol)
10. [Location & Dispatch Engine (PostGIS)](#location--dispatch-engine-postgis)
11. [Video Integration (LiveKit)](#video-integration-livekit)
12. [State Machines & Transitions](#state-machines--transitions)
13. [Billing & Cost Calculations](#billing--cost-calculations)
14. [Error Handling](#error-handling)
15. [Development Milestones](#development-milestones)

---

## Overview & Architecture

This contract defines the API interface between the **Sanocare Portal** (Next.js PWA) and the **Sovereign Backend** (FastAPI + Supabase). All interactions follow a **real-time, offline-resilient, spatially-aware** architecture.

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    SANOCARE PORTAL (Frontend)                    │
│  Next.js PWA + Zustand + IndexedDB (Dexie.js) + Socket.io       │
└──────────────┬────────────────────────────────────┬──────────────┘
               │                                    │
     REST API  │                        WebSocket   │
               │       ┌──────────────────┐         │
               ├──────→│   FastAPI Backend │←────────┤
               │ (HTTP)│                  │(wss://)  │
               ├──────→│   State: Queue,  │←────────┤
               │       │   Cases, Vitals  │         │
               └──────→│                  │←────────┘
                       └─────────┬────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
                    ↓            ↓            ↓
            ┌──────────────┐ ┌──────────┐ ┌──────────┐
            │   Supabase   │ │  Redis   │ │ LiveKit  │
            │ PostgreSQL   │ │  Cache   │ │   SFU    │
            │ + PostGIS    │ │ (GPS)    │ │  (Video) │
            └──────────────┘ └──────────┘ └──────────┘
```

### Core Principles

- **Offline-First**: All Medic actions cached in IndexedDB; synced when connectivity returns
- **Spatial Intelligence**: PostGIS powers "Find Nearest Medic" with sub-second queries
- **Real-Time State**: WebSocket for GPS, vitals, case updates; Redis for ephemeral location data
- **Video-First**: LiveKit SFU ensures high-quality video even on poor Indian networks
- **Idempotency**: All write operations use `X-Idempotency-Key` header
- **State Machine Validation**: Strict transitions (no jumping states)

---

## Technology Stack

### Frontend (Next.js PWA)
- **Framework**: Next.js 14+ (App Router)
- **State Management**: Zustand with persist middleware
- **Storage**: IndexedDB via Dexie.js (offline sync queue)
- **Real-Time**: Socket.io client for WebSocket subscriptions
- **Offline**: Service Workers for PWA, background sync
- **Maps/Location**: Mapbox GL JS for GPS visualization
- **Video**: LiveKit JS SDK for WebRTC

### Backend (FastAPI)
- **Framework**: FastAPI (Python 3.11+)
- **Database**: Supabase (PostgreSQL 14+)
- **Spatial**: PostGIS extension for location queries
- **Cache**: Redis for ephemeral GPS data
- **Real-Time**: WebSocket via `python-socketio`
- **Video**: LiveKit Python SDK for token generation
- **Task Queue**: Celery/Redis for async dispatch logic

### Data & Infrastructure
- **Auth**: Supabase JWT tokens + Row-Level Security (RLS)
- **Spatial Queries**: PostGIS `<->` operator for distance sorting
- **GPS Cache**: Redis ZSET for medic locations (expires hourly)
- **Message Queue**: Redis Streams for vitals ingestion
- **Video Signaling**: LiveKit server SDK
- **Billing**: Deterministic calculation from timestamps

---

### Login Endpoint

**POST** `/api/auth/login`

#### Request
```json
{
  "role": "patient|doctor|medic|admin",
  "userId": "string (email, phone, or employee ID)",
  "password": "string"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_string",
    "expiresIn": 86400,
    "user": {
      "id": "uuid",
      "role": "patient|doctor|medic|admin",
      "name": "string",
      "email": "string",
      "phone": "string",
      "avatar": "url|null"
    }
  }
}
```

#### Response (401 Unauthorized)
```json
{
  "success": false,
  "error": {
    "code": "AUTH_001",
    "message": "Invalid credentials",
    "details": null
  }
}
```

### OTP Verification (Patient Only)

**POST** `/api/auth/otp/send`

#### Request
```json
{
  "phone": "string (+91XXXXXXXXXX format)"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "otpSessionId": "uuid",
    "expiresIn": 300
  }
}
```

---

**POST** `/api/auth/otp/verify`

#### Request
```json
{
  "otpSessionId": "uuid",
  "otp": "string (6 digits)",
  "phone": "string"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_string",
    "expiresIn": 86400,
    "user": {
      "id": "uuid",
      "role": "patient",
      "name": "string",
      "phone": "string"
    }
  }
}
```

### Logout Endpoint

**POST** `/api/auth/logout`

**Headers:** `Authorization: Bearer <token>`

#### Response (200 OK)
```json
{
  "success": true,
  "data": null
}
```

### Token Refresh Endpoint

**POST** `/api/auth/refresh`

**Headers:** `Authorization: Bearer <token>`

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "token": "new_jwt_token_string",
    "expiresIn": 86400
  }
}
```

---

## Base URL & Request Format

### Base URL
```
FastAPI Backend:
  Production: https://api.sanocare.com/v1
  Development: http://localhost:8000/v1

Supabase:
  Production: https://[project-id].supabase.co
  Development: http://localhost:54321

WebSocket (FastAPI):
  Production: wss://api.sanocare.com/v1/ws
  Development: ws://localhost:8000/v1/ws

LiveKit (SignalingServer):
  Production: wss://livekit.sanocare.com
  Development: ws://localhost:7880
```

### Required Headers (All Requests)
```
Authorization: Bearer <supabase_jwt_token>
Content-Type: application/json
X-Client-Version: 2.0.0
X-Request-ID: uuid (for tracing)
X-Idempotency-Key: uuid (for write operations)
X-Device-Info: {"platform": "ios|android|web", "offline": false}
```

### Rate Limiting
```
Headers: X-RateLimit-Limit: 1000
         X-RateLimit-Remaining: 999
         X-RateLimit-Reset: 1680000000
         
Per User: 1000 requests/minute (except GPS stream)
GPS Stream: Unlimited (metered by client interval)
WebSocket: 1 connection per user per device
```

---

## Critical Implementation Clarifications

These 3 details resolve architectural ambiguities that could block team integration. Both Frontend and Backend agents must follow these interpretations exactly.

### 1. Auth Source of Truth (Supabase as IDP, FastAPI as Proxy)

**The Contract says:** `/api/auth/login` (FastAPI endpoint)

**The Implementation:**
- **Frontend** sends: `email`, `password`, `role` → **FastAPI**
- **FastAPI (Backend)** acts as proxy:
  1. Receives credentials from Frontend
  2. **Calls Supabase Auth API** directly (not via SDK) to verify email/password
  3. **Receives JWT back from Supabase**
  4. **Optionally logs the login attempt** to a custom admin_logs table (extensibility point)
  5. **Returns the Supabase JWT** to Frontend
- **Frontend** stores JWT in secure storage (Zustand + localStorage with encryption)

**Why This Matters:**
- Supabase is the source of truth for authentication (handles password hashing, 2FA in future)
- FastAPI proxy layer allows audit logging of every login attempt (Admin module requirement)
- Prevents backend from being a "dumb relay" — it enforces business logic (e.g., reject blocked users)

**Backend Agent Instruction:**
```python
# FastAPI /api/auth/login endpoint MUST:
@app.post("/api/auth/login")
async def login(email: str, password: str, role: str):
    # 1. Validate role
    # 2. Call Supabase Auth directly:
    supabase_response = supabase_client.auth.sign_in_with_password({
        "email": email,
        "password": password
    })
    # 3. Log the attempt (future: admin_logs table)
    # 4. Return JWT from Supabase
    return {"token": supabase_response.session.access_token, ...}
```

**Frontend Agent Instruction:**
```typescript
// Frontend calls FastAPI (NOT Supabase Auth directly):
const response = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password, role })
});
const { token } = await response.json();
// Store and use token for all subsequent API calls
```

---

### 2. GPS Dual-Path Strategy (Real-Time + Audit Trail)

**The Problem:** Writing every GPS pulse (~every 15-30 seconds) to PostgreSQL = 5,000+ rows/hour per medic = performance killer.

**The Solution:** Two separate write paths:

#### Path A: Real-Time (WebSocket → Redis)
- **Medic** sends GPS via WebSocket: `{"type": "GPS_UPDATE", "lat": X, "lng": Y, ...}`
- **FastAPI** receives and **writes ONLY to Redis** (ephemeral, 1-hour TTL, instant retrieval)
- **Redis data** is used for:
  - Live map animation (Patient sees real-time medic location)
  - Dispatch calculations (Admin queries "nearby medics")
  - ETA calculations (based on current position, not last saved position)
- **No write to PostgreSQL** (too much volume, Redis is sufficient)

#### Path B: Audit Trail (Status Change → PostgreSQL)
- **Only update `profiles.live_location` in PostgreSQL when status changes:**
  - Medic accepts case → snapshot location to DB
  - Medic arrives at patient → snapshot location to DB
  - Medic closes case → snapshot location to db
- **Why:** Provides audit trail of "where was medic when they completed case" without the overhead

**Backend Agent Instruction:**
```python
@socketio.on('GPS_UPDATE')
def handle_gps(data):
    consultation_id = data['consultationId']
    lat, lng = data['latitude'], data['longitude']
    
    # 1. WRITE TO REDIS (for real-time)
    redis_client.setex(
        f"medic_location:{consultation_id}",
        3600,  # 1 hour TTL
        json.dumps({"lat": lat, "lng": lng, "ts": now()})
    )
    
    # 2. DO NOT write to PostgreSQL (yet)
    # Only write on status change (see transition endpoint)
    
    # 3. Broadcast to patient
    emit('MEDIC_LOCATION_UPDATED', {
        "latitude": lat, "longitude": lng, ...
    }, to=f"patient_{patient_id}")
```

```python
@app.post("/api/v1/consultation/{cid}/transition")
async def transition(consultation_id: str, new_status: str):
    # When status changes to "arrived", "in_transit", etc.
    # THEN snapshot the current GPS to PostgreSQL:
    current_gps = redis_client.get(f"medic_location:{consultation_id}")
    if current_gps:
        db.update(profiles)
            .set(live_location=current_gps)
            .where(id == medic_id)
            .execute()
```

**Frontend Agent Instruction:**
```typescript
// Medic sends GPS every 15-30 seconds (not every second):
setInterval(() => {
  socket.emit('GPS_UPDATE', {
    consultationId,
    latitude: currentLat,
    longitude: currentLng,
    timestamp: new Date().toISOString()
    // Do NOT wait for acknowledgement; next update in 15s
  });
}, 15000);
```

---

### 3. Video Room Handshake (Token-First, No Direct Room Creation)

**The Contract says:** `sanocare-{consultation_id}` for room names

**The Implementation:**
- **Frontend does NOT create or configure LiveKit rooms directly**
- **Frontend must call endpoint first to get token**
- **Token issuance is gated by backend logic**

#### Flow:

**Doctor initiates call:**
1. Doctor clicks "Start Video Call" in UI
2. Frontend calls: **POST** `/api/v1/video/doctor-initiate`
3. Backend returns:
   ```json
   {
     "roomId": "sanocare-{cid}",
     "doctorToken": "eyJ0eXAi...",  // LiveKit token
     "expiresAt": "2024-03-22T15:30:00Z"
   }
   ```
4. Frontend connects to LiveKit with token (not creates room)
5. If token is expired/rejected, call cannot start (backend controls access)

**Medic joins call:**
1. Medic receives notification: "Doctor waiting for video call"
2. Frontend calls: **POST** `/api/v1/video/medic-join`
3. Backend checks:
   - Is case in correct status? (must be in_consultation)
   - Is doctor already in room?
   - Issue fresh token with medic permissions
4. Medic joins with token → sees doctor (LiveKit handles SFU logic)

**Backend Agent Instruction:**
```python
@app.post("/api/v1/video/doctor-initiate")
async def doctor_initiate(consultation_id: str):
    # 1. Verify consultation exists and doctor assigned
    # 2. Verify case status allows video (vitals_captured or in_consultation)
    # 3. Generate LiveKit token for doctor role
    token = livekit.AccessToken(
        api_key=LIVEKIT_API_KEY,
        api_secret=LIVEKIT_API_SECRET,
        identity=doctor_id,
        name=doctor_name,
        grants=VideoGrants(
            room_join=True,
            room=f"sanocare-{consultation_id}",
            can_publish=True,
            can_subscribe=True
        )
    ).to_jwt()
    
    # 4. Return token + room info
    return {
        "roomId": f"sanocare-{consultation_id}",
        "doctorToken": token,
        "expiresAt": now() + 30min
    }

@app.post("/api/v1/video/medic-join")
async def medic_join(consultation_id: str):
    # Similar: verify case, issue token with medic role
    token = livekit.AccessToken(
        identity=medic_id,
        grants=VideoGrants(
            room_join=True,
            room=f"sanocare-{consultation_id}",
            can_publish=True,
            can_subscribe=True
        )
    ).to_jwt()
    return { "roomId": ..., "medicToken": token, ... }
```

**Frontend Agent Instruction:**
```typescript
// Step 1: Get token from backend
const response = await fetch('/api/v1/video/doctor-initiate', {
  method: 'POST',
  body: JSON.stringify({ consultationId })
});

if (!response.ok) {
  toast.error("Cannot start video call (backend rejected)");
  return; // Stop here; don't try to create room
}

const { roomId, doctorToken } = await response.json();

// Step 2: Connect with token (don't create room)
const room = new Room();
await room.connect(LIVEKIT_SERVER_URL, doctorToken);

// Step 3: Handle doctor video (SFU/tracks managed by LiveKit)
room.on(RoomEvent.ParticipantConnected, (participant) => {
  updateVideoPlayerWithParticipant(participant);
});
```

**Why This Matters:**
- Backend controls who can join which rooms (security gate)
- Token expiry prevents long-lived sessions (security best practice)
- Enables audit logging (every video call initiation is tied to consultation)
- Future: Backend can enforce "Doctor must be on duty to start call"

---

## Core Supabase Tables

### 1. `profiles` (Public)
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role ENUM('patient', 'medic', 'doctor', 'admin') NOT NULL,
  avatar_url TEXT,
  
  -- Spatial data (Medics only)
  live_location geography(POINT, 4326),  -- Current GPS
  location_updated_at TIMESTAMP(tz),
  
  -- Medic-specific fields
  unit_code TEXT,         -- e.g., "Unit 42"
  shift_start TIME,       -- e.g., "08:00"
  shift_end TIME,         -- e.g., "20:00"
  is_online BOOLEAN DEFAULT false,
  battery_percent INT,
  
  -- Patient-specific fields
  blood_group TEXT,       -- A+, B+, O+, AB+, etc.
  allergies TEXT,
  medical_history TEXT,
  relationship TEXT,      -- self, spouse, child, parent
  
  created_at TIMESTAMP(tz) DEFAULT now(),
  updated_at TIMESTAMP(tz) DEFAULT now()
);

-- RLS: Medics can only see their own location; Admins see all; Patients see assigned medic
-- RLS: Public users can only read their own profile
```

### 2. `consultations` (Private)
```sql
CREATE TABLE consultations (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  medic_id UUID REFERENCES profiles(id),
  doctor_id UUID REFERENCES profiles(id),
  
  status ENUM('pending', 'assigned', 'in_transit', 'arrived', 'vitals_captured', 
              'in_consultation', 'closed', 'cancelled') DEFAULT 'pending',
  
  -- Booking details
  service_type ENUM('homecare', 'teleconsult', 'diagnostics'),
  scheduled_for TIMESTAMP(tz),
  
  -- Location
  patient_location geography(POINT, 4326),
  address_line TEXT,
  carehub_id UUID,
  
  -- Timeline
  created_at TIMESTAMP(tz) DEFAULT now(),
  assigned_at TIMESTAMP(tz),
  arrived_at TIMESTAMP(tz),
  consultation_started_at TIMESTAMP(tz),
  closed_at TIMESTAMP(tz),
  
  -- Video call
  video_room_id TEXT,  -- LiveKit room ID
  video_started_at TIMESTAMP(tz),
  video_ended_at TIMESTAMP(tz),
  
  -- Billing
  cost_service DECIMAL(8,2),      -- Base service charge
  cost_distance DECIMAL(8,2),     -- ₹20/km
  cost_time DECIMAL(8,2),         -- ₹100/5 mins
  cost_total DECIMAL(8,2),
  payment_status ENUM('pending', 'completed', 'refunded'),
  
  updated_at TIMESTAMP(tz) DEFAULT now()
);

-- RLS: Patient sees their own; Medic sees assigned; Doctor sees consultations they closed
```

### 3. `vitals` (Immutable, Append-only)
```sql
CREATE TABLE vitals (
  id UUID PRIMARY KEY,
  consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
  medic_id UUID REFERENCES profiles(id),
  
  systolic INT,
  diastolic INT,
  heart_rate INT,
  temperature DECIMAL(5,1),
  spo2 INT,
  blood_sugar INT,
  notes TEXT,
  
  captured_at TIMESTAMP(tz) DEFAULT now(),
  synced_at TIMESTAMP(tz) DEFAULT now()
);

-- RLS: Medic uploads; Doctor reads; Patient views via consultation
```

### 4. `soap_notes` (Doctor consultation records)
```sql
CREATE TABLE soap_notes (
  id UUID PRIMARY KEY,
  consultation_id UUID REFERENCES consultations(id) UNIQUE ON DELETE CASCADE,
  doctor_id UUID REFERENCES profiles(id),
  
  subjective TEXT,
  objective TEXT,
  assessment TEXT,
  plan TEXT,
  
  risk_tag ENUM('stable', 'monitor', 'escalate'),
  
  created_at TIMESTAMP(tz) DEFAULT now(),
  updated_at TIMESTAMP(tz) DEFAULT now()
);

-- RLS: Doctor creates/edits own; Patient views own; Medic views after closure
```

### 5. `prescriptions` (Linked to SOAP notes)
```sql
CREATE TABLE prescriptions (
  id UUID PRIMARY KEY,
  soap_notes_id UUID REFERENCES soap_notes(id) ON DELETE CASCADE,
  consultation_id UUID REFERENCES consultations(id),
  
  medicine_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency ENUM('once_daily', 'twice_daily', 'thrice_daily', 'as_needed'),
  duration TEXT,  -- e.g., "30 days"
  refills INT DEFAULT 0,
  
  created_at TIMESTAMP(tz) DEFAULT now()
);
```

### 6. `dispatch_queue` (Real-time, Ephemeral)
```sql
CREATE TABLE dispatch_queue (
  id UUID PRIMARY KEY,
  consultation_id UUID REFERENCES consultations(id) UNIQUE,
  patient_id UUID REFERENCES profiles(id),
  
  status ENUM('searching', 'assigned', 'accepted', 'rejected', 'timeout'),
  
  -- Dispatch logic
  priority_level INT (1=critical, 3=urgent, 5=routine),
  created_at TIMESTAMP(tz) DEFAULT now(),
  assigned_at TIMESTAMP(tz),
  timeout_at TIMESTAMP(tz),  -- Expires 2 minutes after creation
  
  -- Assignment
  assigned_medic_id UUID REFERENCES profiles(id),
  estimated_arrival TIMESTAMP(tz)
);

-- DROP rows after 6 hours (handled by background job)
-- RLS: Medics see their assignments; Admins see all
```

### 7. `offline_sync_queue` (Frontend ↔ Backend sync)
*CAUTION: This table is managed by Frontend; Backend only reads for diagnostics*
```sql
CREATE TABLE offline_sync_queue (
  id UUID PRIMARY KEY,
  device_id UUID,
  user_id UUID REFERENCES profiles(id),
  
  operation ENUM('CREATE', 'UPDATE', 'DELETE'),
  table_name TEXT,
  record_id UUID,
  payload JSONB,
  
  created_at TIMESTAMP(tz) DEFAULT now(),
  synced_at TIMESTAMP(tz),
  sync_status ENUM('pending', 'syncing', 'success', 'failed')
);

-- RLS: Users can only see their own queue
-- Backend triggers clear entries after successful sync
```

---

## Offline-First Sync Protocol

### Frontend Offline Behavior

The Medic can operate completely offline using IndexedDB (Dexie.js). All actions are queued locally and synced when connectivity returns.

**Offline Storage (IndexedDB Dexie.js):**
```typescript
// Frontend IndexedDB Schema
db.version(1).stores({
  vitalsQueue: 'id, consultationId, createdAt',
  casesCache: 'id, status, updatedAt',
  gpsTrail: 'id, timestamp, [consultationId+timestamp]',
  pendingActions: 'id, type, status'  // CREATE, UPDATE, DELETE
});
```

### Offline Sync Queue Structure

When offline, Medic creates records locally:
```json
{
  "id": "uuid",
  "type": "VITALS_CAPTURE",
  "consultationId": "uuid",
  "payload": {
    "systolic": 120,
    "diastolic": 80,
    "heartRate": 72,
    "temperature": 98.4,
    "spo2": 98,
    "bloodSugar": 110,
    "capturedAt": "2024-03-22T14:30:00Z"
  },
  "status": "pending",
  "createdAt": "2024-03-22T14:30:00Z"
}
```

### Sync Endpoint (Frontend → Backend)

**POST** `/api/v1/sync/flush`

**Headers:** `Authorization: Bearer <token>`

#### Request
```json
{
  "deviceId": "uuid",
  "queueItems": [
    {
      "id": "uuid",
      "type": "VITALS_CAPTURE|STATUS_UPDATE|GPS_TRAIL",
      "consultationId": "uuid",
      "payload": {},
      "createdAt": "ISO-8601"
    }
  ],
  "gpsTrail": [
    {"latitude": "number", "longitude": "number", "timestamp": "ISO-8601"}
  ]
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "synced": ["uuid1", "uuid2"],
    "failed": [],
    "timestamp": "2024-03-22T14:30:00Z"
  }
}
```

### Conflict Resolution

**Rule 1:** Backend timestamp is authoritative. If local time is >5 minutes off, reject with `TIME_SKEW_ERROR`.

**Rule 2:** For duplicate vitals (same consultation, within 1 minute), merge and use the later timestamp.

**Rule 3:** For case status (e.g., "arrived"), if the backend already advanced the state, reject the local update with `STATE_ADVANCED_ERROR`.

---

## Location & Dispatch Engine (PostGIS)

### Core SQL Functions (Backend)

The backend implements these PostGIS functions in Supabase:

#### 1. Find Nearest Available Medics
```sql
CREATE OR REPLACE FUNCTION find_available_medics(
  patient_lat FLOAT,
  patient_lng FLOAT,
  radius_meters INT DEFAULT 10000
) RETURNS TABLE(
  medic_id UUID,
  name TEXT,
  distance_m FLOAT,
  battery_percent INT,
  is_available BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    (p.live_location <-> ST_SetSRID(ST_MakePoint(patient_lng, patient_lat), 4326))::FLOAT * 111000 AS distance_meters,
    p.battery_percent,
    p.is_online AND (SELECT COUNT(*) FROM consultations WHERE medic_id = p.id AND status != 'closed') < 3 AS available
  FROM profiles p
  WHERE p.role = 'medic' 
    AND p.is_online = true 
    AND p.battery_percent > 15
    AND p.live_location IS NOT NULL
    AND ST_DWithin(
      p.live_location,
      ST_SetSRID(ST_MakePoint(patient_lng, patient_lat), 4326)::geography,
      radius_meters
    )
  ORDER BY p.live_location <-> ST_SetSRID(ST_MakePoint(patient_lng, patient_lat), 4326)
  LIMIT 5;
END;
$$ LANGUAGE plpgsql;
```

### Dispatch Endpoint (Auto-Assignment via PostGIS)

**POST** `/api/v1/dispatch/auto-assign`

**Headers:** `Authorization: Bearer <token>` (Admin or System)

#### Request
```json
{
  "consultationId": "uuid",
  "patientLatitude": "number",
  "patientLongitude": "number",
  "serviceType": "homecare|teleconsult|diagnostics",
  "priority": 1|3|5
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "consultationId": "uuid",
    "assignedMedicId": "uuid",
    "estimatedArrival": "2024-03-22T14:45:00Z",
    "distance": {
      "kilometers": 2.3,
      "estimatedMinutes": 7
    },
    "dispatchedAt": "2024-03-22T14:30:00Z"
  }
}
```

### GPS Stream (Medic to Backend)

**WebSocket:** `/v1/ws/location` (Authenticated)

#### Client sends (every 10-30 seconds):
```json
{
  "type": "GPS_UPDATE",
  "consultationId": "uuid",
  "latitude": "number",
  "longitude": "number",
  "accuracy": "number (meters)",
  "speed": "number (km/h)",
  "timestamp": "2024-03-22T14:30:00Z"
}
```

#### Backend processes:
1. **Write to Redis** (ephemeral, 1-hour TTL) for map animation
2. **Queue to Vitals Stream** (async, batched every 30-60 seconds)
3. **Write to Supabase** on state change (e.g., "arrived", "left")
4. **Broadcast to Patient** via Socket.io (interpolated position)

#### Server broadcasts to Patient:
```json
{
  "type": "MEDIC_LOCATION_UPDATE",
  "medicId": "uuid",
  "latitude": "number",
  "longitude": "number",
  "eta": "2024-03-22T14:35:00Z",
  "interpolated": true,
  "accuracy": "number"
}
```

---

## Video Integration (LiveKit)

### LiveKit Room Naming Convention
```
sanocare-{consultation_id}
Example: sanocare-550e8400-e29b-41d4-a716-446655440000
```

### Initiate Video Call (Doctor Side)

**POST** `/api/v1/video/doctor-initiate`

**Headers:** `Authorization: Bearer <token>`

#### Request
```json
{
  "consultationId": "uuid",
  "doctorId": "uuid"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "roomId": "sanocare-uuid",
    "doctorToken": "jwt_token_for_doctor",
    "roomUrl": "https://livekit.sanocare.com/...",
    "expiresAt": "2024-03-22T15:30:00Z"
  }
}
```

### Get LiveKit Token (Medic Side)

**POST** `/api/v1/video/medic-join`

**Headers:** `Authorization: Bearer <token>`

#### Request
```json
{
  "consultationId": "uuid",
  "medicId": "uuid"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "roomId": "sanocare-uuid",
    "medicToken": "jwt_token_for_medic",
    "doctorPresent": true,
    "rtcUrl": "wss://livekit.sanocare.com/...",
    "expiresAt": "2024-03-22T15:30:00Z"
  }
}
```

### End Video Call

**POST** `/api/v1/video/end-call`

#### Request
```json
{
  "consultationId": "uuid",
  "roomId": "sanocare-uuid"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "consultationId": "uuid",
    "callEndedAt": "2024-03-22T14:45:00Z"
  }
}
```

---

## State Machines & Transitions

### Consultation Lifecycle

```
PENDING
   ↓ [Auto-dispatch or Admin assign]
ASSIGNED (Medic accepted)
   ↓ [Medic location update]
IN_TRANSIT
   ↓ [Medic marks "Slide to Arrive']
ARRIVED
   ↓ [Vitals captured]
VITALS_CAPTURED
   ↓ [Doctor initiates video OR Medic starts sync]
IN_CONSULTATION
   ↓ [Doctor types SOAP notes & closes case]
CLOSED
   └─ RiskTag: Stable|Monitor|Escalate
   
CANCELLED (Can happen from PENDING, ASSIGNED, IN_TRANSIT, ARRIVED)
```

### State Transition Validation (Backend Enforces)

```typescript
const validTransitions = {
  "pending": ["assigned", "cancelled"],
  "assigned": ["in_transit", "rejected", "cancelled"],
  "in_transit": ["arrived", "cancelled"],
  "arrived": ["vitals_captured", "cancelled"],
  "vitals_captured": ["in_consultation", "closed", "cancelled"],
  "in_consultation": ["closed"],
  "closed": [],
  "cancelled": []
};
```

**Validation Endpoint:**

**POST** `/api/v1/consultation/{consultationId}/transition`

#### Request
```json
{
  "newStatus": "in_transit|arrived|vitals_captured|in_consultation|closed|cancelled",
  "metadata": {
    "reason": "string (for cancellation)",
    "location": {"latitude": "number", "longitude": "number"}
  }
}
```

#### Response (200 OK / 409 Conflict)
```json
{
  "success": true,
  "data": {
    "consultationId": "uuid",
    "oldStatus": "string",
    "newStatus": "string",
    "transitionedAt": "2024-03-22T14:30:00Z"
  }
}
```

```json
{
  "success": false,
  "error": {
    "code": "INVALID_STATE_TRANSITION",
    "message": "Cannot transition from 'in_consultation' to 'arrived'",
    "currentState": "in_consultation",
    "attemptedState": "arrived"
  }
}
```

---

## Billing & Cost Calculations

### Billing Engine (Backend)

Billing is calculated automatically when case closes. **Non-negotiable formula:**

```
Base Charge: ₹499 (flat service fee)
Distance Cost: ₹20 per km (straight-line from carehub to patient)
Time Cost: ₹100 per 5 minutes (from arrival to case closure)

TOTAL = 499 + (distance_km × 20) + (ceil(duration_minutes / 5) × 100)

Example:
  Distance: 5 km → ₹100
  Duration: 23 minutes (5 buckets) → ₹500
  Total: ₹499 + ₹100 + ₹500 = ₹1,099
```

### Close Consultation with Billing

**POST** `/api/v1/consultation/{consultationId}/close`

**Headers:** `Authorization: Bearer <token>` (Doctor only)

#### Request
```json
{
  "riskTag": "stable|monitor|escalate",
  "prescriptions": [
    {
      "medicineName": "string",
      "dosage": "string",
      "frequency": "once_daily|twice_daily|thrice_daily|as_needed",
      "duration": "string",
      "refills": "number"
    }
  ],
  "followUpDate": "2024-04-22T14:30:00Z|null",
  "referral": {
    "specialist": "string|null",
    "facility": "string|null"
  }
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "consultationId": "uuid",
    "status": "closed",
    "closedAt": "2024-03-22T14:45:00Z",
    "billing": {
      "baseCharge": 499,
      "distanceCost": 100,
      "timeCost": 500,
      "total": 1099,
      "currency": "INR"
    },
    "riskTag": "stable",
    "recordId": "uuid",
    "prescriptions": [
      {
        "id": "uuid",
        "medicineName": "string",
        "dosage": "string",
        "frequency": "string",
        "duration": "string"
      }
    ]
  }
}
```

### Get Billing Summary

**GET** `/api/v1/consultation/{consultationId}/billing`

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "consultationId": "uuid",
    "patientId": "uuid",
    "medicId": "uuid",
    "timing": {
      "assignedAt": "2024-03-22T14:00:00Z",
      "arrivedAt": "2024-03-22T14:15:00Z",
      "closedAt": "2024-03-22T14:45:00Z",
      "durationMinutes": 30
    },
    "distance": {
      "kilometers": 5,
      "source": "PostGIS"
    },
    "costs": {
      "baseService": 499,
      "distance": 100,
      "time": 500,
      "total": 1099,
      "currency": "INR"
    },
    "paymentStatus": "completed|pending|refunded"
  }
}
```

---

## API Endpoints by Module

### [A] AUTHENTICATION

#### Send OTP (Patient Login)

**POST** `/api/v1/auth/otp/send`

#### Request
```json
{
  "phone": "+91XXXXXXXXXX"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "otpSessionId": "uuid",
    "expiresIn": 300,
    "message": "OTP sent to +91XXXXXXXXXX"
  }
}
```

#### Verify OTP

**POST** `/api/v1/auth/otp/verify`

#### Request
```json
{
  "otpSessionId": "uuid",
  "otp": "string (6 digits)",
  "phone": "+91XXXXXXXXXX"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "token": "supabase_jwt_token",
    "expiresIn": 86400,
    "user": {
      "id": "uuid",
      "phone": "+91XXXXXXXXXX",
      "role": "patient",
      "name": "string"
    }
  }
}
```

#### Password Login (Doctor, Medic, Admin)

**POST** `/api/v1/auth/login`

#### Request
```json
{
  "email": "user@sanocare.com",
  "password": "string",
  "role": "doctor|medic|admin"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "token": "supabase_jwt_token",
    "expiresIn": 86400,
    "user": {
      "id": "uuid",
      "email": "string",
      "role": "string",
      "name": "string"
    }
  }
}
```

---

### [B] PATIENT MODULE

#### Create Booking

**POST** `/api/v1/patient/bookings`

**Headers:** `Authorization: Bearer <token>`

#### Request
```json
{
  "profileId": "uuid",
  "serviceType": "homecare|teleconsult|diagnostics",
  "scheduledFor": "2024-03-22T14:30:00Z|null",
  "patientLatitude": "number",
  "patientLongitude": "number",
  "address": "string",
  "carehubId": "uuid|null",
  "notes": "string|null",
  "preferredLanguage": "en|hi"
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "consultationId": "uuid",
    "status": "pending",
    "serviceType": "homecare",
    "estimatedWaitTime": "5 minutes",
    "createdAt": "2024-03-22T14:30:00Z"
  }
}
```

#### Get Booking Status

**GET** `/api/v1/patient/bookings/{consultationId}`

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "consultationId": "uuid",
    "status": "pending|assigned|in_transit|arrived|vitals_captured|in_consultation|closed",
    "servicetype": "homecare",
    "assignedMedic": {
      "id": "uuid",
      "name": "string",
      "phone": "string",
      "rating": 4.8,
      "unitCode": "Unit 42"
    }|null,
    "medic": {
      "latitude": "number",
      "longitude": "number",
      "eta": "2024-03-22T14:35:00Z",
      "distance": {"kilometers": 2.3, "meters": 2300}
    }|null,
    "cost": {
      "baseService": 499,
      "distance": 50,
      "time": 0,
      "total": 549,
      "currency": "INR"
    },
    "createdAt": "2024-03-22T14:30:00Z"
  }
}
```

#### Get Patient Profiles

**GET** `/api/v1/patient/profiles`

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "profiles": [
      {
        "id": "uuid",
        "fullName": "string",
        "age": "number",
        "bloodGroup": "string",
        "allergies": "string",
        "relationship": "self|spouse|child|parent",
        "email": "string|null",
        "phone": "+91XXXXXXXXXX"
      }
    ],
    "primaryProfileId": "uuid"
  }
}
```

#### Get Health Records

**GET** `/api/v1/patient/profiles/{profileId}/records`

**Query:** `?limit=10&offset=0`

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "id": "uuid",
        "consultationId": "uuid",
        "tag": "Homecare Visit|Teleconsult|Diagnostics",
        "doctorName": "string",
        "facility": "string",
        "date": "2024-03-22T14:30:00Z",
        "summary": "string",
        "riskTag": "stable|monitor|escalate",
        "vitals": {
          "bp": "120/80",
          "heartRate": 72,
          "temperature": 98.4,
          "spo2": 98,
          "bloodSugar": 110
        },
        "prescriptions": [
          {
            "id": "uuid",
            "medicineName": "string",
            "dosage": "string",
            "frequency": "string",
            "duration": "string",
            "refills": "number"
          }
        ]
      }
    ],
    "total": "number",
    "hasMore": "boolean"
  }
}
```

---

### [C] MEDIC (FIELD NODE) MODULE

#### Get My Profile

**GET** `/api/v1/medic/profile`

**Headers:** `Authorization: Bearer <token>`

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "string",
    "unitCode": "Unit 42",
    "role": "EMT|Paramedic|RN",
    "phone": "+91XXXXXXXXXX",
    "shift": {"start": "08:00", "end": "20:00"},
    "stats": {
      "casesCompleted": 156,
      "casesOpen": 2,
      "avgResponseTime": "4.2m",
      "dutyHoursToday": 8.5
    },
    "battery": 87,
    "isOnDuty": true
  }
}
```

#### Get Dispatch Queue

**GET** `/api/v1/medic/queue`

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "queue": [
      {
        "id": "uuid",
        "consultationId": "uuid",
        "patientName": "string",
        "age": "number",
        "complaint": "string",
        "severity": "critical|urgent|routine",
        "distance": 2.3,
        "address": "string",
        "receivedAt": "2024-03-22T14:20:00Z",
        "status": "pending|accepted",
        "coordinates": {"latitude": "number", "longitude": "number"}
      }
    ],
    "total": "number",
    "criticalCount": "number"
  }
}
```

#### Accept Case

**POST** `/api/v1/medic/cases/{consultationId}/accept`

#### Request
```json
{
  "notes": "string|null"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "consultationId": "uuid",
    "status": "accepted",
    "acceptedAt": "2024-03-22T14:22:00Z"
  }
}
```

#### Submit Vitals (with offline support)

**POST** `/api/v1/medic/vitals`

#### Request
```json
{
  "consultationId": "uuid",
  "systolic": "number",
  "diastolic": "number",
  "heartRate": "number",
  "temperature": "number",
  "spo2": "number",
  "bloodSugar": "number",
  "notes": "string|null",
  "capturedAt": "2024-03-22T14:30:00Z"
}
```

#### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "vitalId": "uuid",
    "consultationId": "uuid",
    "capturedAt": "2024-03-22T14:30:00Z",
    "synced": true,
    "doctorNotified": true
  }
}
```

#### Toggle Duty Status

**POST** `/api/v1/medic/duty/toggle`

#### Request
```json
{
  "status": "on_duty|off_duty",
  "latitude": "number|null",
  "longitude": "number|null"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "status": "on_duty|off_duty",
    "toggledAt": "2024-03-22T14:30:00Z"
  }
}
```

---

### [D] DOCTOR MODULE

#### Get Case Queue

**GET** `/api/v1/doctor/queue`

**Headers:** `Authorization: Bearer <token>`

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "queue": [
      {
        "id": "uuid",
        "consultationId": "uuid",
        "patientName": "string",
        "status": "arrived|vitals_captured|in_consultation|review",
        "severity": "routine|urgent|critical",
        "medicName": "string",
        "unitCode": "Unit 42",
        "vitalsReady": true,
        "waitingTime": "number (minutes)",
        "createdAt": "2024-03-22T14:30:00Z"
      }
    ],
    "total": "number"
  }
}
```

#### Get Case Details

**GET** `/api/v1/doctor/cases/{consultationId}`

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "consultationId": "uuid",
    "patientId": "uuid",
    "patientName": "string",
    "age": "number",
    "bloodGroup": "string",
    "allergies": "string",
    "medicalHistory": "string",
    "complaint": "string",
    "severity": "critical|urgent|routine",
    "currentVitals": {
      "systolic": 120,
      "diastolic": 80,
      "heartRate": 72,
      "temperature": 98.4,
      "spo2": 98,
      "bloodSugar": 110,
      "capturedAt": "2024-03-22T14:30:00Z",
      "capturedBy": "string"
    },
    "medicOnSite": {
      "id": "uuid",
      "name": "string",
      "phone": "+91XXXXXXXXXX",
      "unitCode": "Unit 42"
    },
    "videoStatus": "not_initiated|pending|active|ended",
    "videoRoomId": "sanocare-uuid|null"
  }
}
```

#### Save SOAP Notes (Auto-save)

**PATCH** `/api/v1/doctor/cases/{consultationId}/soap`

#### Request
```json
{
  "subjective": "string",
  "objective": "string",
  "assessment": "string",
  "plan": "string"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "consultationId": "uuid",
    "lastSavedAt": "2024-03-22T14:30:00Z",
    "savedBy": "uuid"
  }
}
```

---

### [E] ADMIN OPERATIONS MODULE

#### Get All Cases

**GET** `/api/v1/admin/cases`

**Query:** `?status=pending|assigned|closed&urgency=critical|urgent|routine&limit=50&offset=0`

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "cases": [
      {
        "id": "uuid",
        "consultationId": "uuid",
        "patientName": "string",
        "urgency": "critical|urgent|routine",
        "assignedMedic": {
          "id": "uuid",
          "name": "string",
          "rating": 4.8
        }|null,
        "eta": "2m 30s|null",
        "status": "pending|assigned|in_transit|closed",
        "createdAt": "2024-03-22T14:30:00Z"
      }
    ],
    "total": "number",
    "criticalCount": "number"
  }
}
```

#### Get Available Medics

**GET** `/api/v1/admin/medics`

**Query:** `?availability=idle|busy&carehub=hub_id`

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "medics": [
      {
        "id": "uuid",
        "name": "string",
        "phone": "+91XXXXXXXXXX",
        "unitCode": "Unit 42",
        "availability": "idle|busy|off_duty",
        "currentCases": "number",
        "rating": 4.8,
        "distance": 0.4,
        "eta": 3,
        "battery": 87
      }
    ],
    "total": "number",
    "availableCount": "number"
  }
}
```

#### Force Assign Case

**POST** `/api/v1/admin/cases/{consultationId}/assign`

#### Request
```json
{
  "medicId": "uuid",
  "reason": "string"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "consultationId": "uuid",
    "assignedTo": "string (medic name)",
    "eta": "2024-03-22T14:35:00Z"
  }
}
```

#### Get Operations Heatmap

**GET** `/api/v1/admin/heatmap`

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "activeMedics": "number",
    "criticalPending": "number",
    "avgResponse": "4.2m",
    "geozones": [
      {
        "latitude": "number",
        "longitude": "number",
        "severity": "critical|urgent|routine",
        "caseCount": "number"
      }
    ]
  }
}
```

---

## Error Handling

### Error Codes by Module

#### Authentication (AUTH_XXX)
```
AUTH_001: Invalid credentials
AUTH_002: Token expired
AUTH_003: Token invalid
AUTH_004: Unauthorized access (insufficient permissions)
AUTH_005: User not found
AUTH_006: OTP expired
AUTH_007: OTP invalid
AUTH_008: Account locked
```

#### Patient Module (PAT_XXX)
```
PAT_001: Profile not found
PAT_002: Record not found
PAT_003: Booking creation failed
PAT_004: Insufficient balance
PAT_005: Service unavailable in area
PAT_006: Invalid GPS coordinates
PAT_007: Booking already exists
```

#### Doctor Module (DOC_XXX)
```
DOC_001: Case not found
DOC_002: Case status invalid
DOC_003: Cannot close case
DOC_004: Vitals data invalid
DOC_005: Prescription invalid
DOC_006: Medic not found
```

#### Medic Module (MED_XXX)
```
MED_001: Case not found
MED_002: Case not assigned
MED_003: Vitals submission failed
MED_004: Cannot accept case
MED_005: Duty status update failed
MED_006: GPS data invalid
```

#### Admin Module (ADM_XXX)
```
ADM_001: Medic not available
ADM_002: Assignment failed
ADM_003: Carehub not found
ADM_004: Invalid dispatch parameters
ADM_005: Analytics data error
```

### Generic HTTP Status Codes

```
200 OK - Success
201 Created - Resource created
204 No Content - Success, no response body
400 Bad Request - Invalid data
401 Unauthorized - Missing/invalid auth
403 Forbidden - Permission denied
404 Not Found - Resource not found
409 Conflict - Duplicate/concurrent conflict
429 Too Many Requests - Rate limit exceeded
500 Internal Server Error - Backend error
502 Bad Gateway - Service unavailable
503 Service Unavailable - Maintenance
```

---

## Response Standards

### Pagination Pattern

```json
{
  "success": true,
  "data": {
    "items": [],
    "total": 240,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

### Filtering & Sorting

**Supported Query Parameters:**
```
?sort=asc|desc (applied to sortField by default: createdAt)
?sortField=createdAt|updatedAt|name|status
?filter={"status":"completed"}
?search=string (searches name, email, phone, patientCode)
```

### Metadata in Response

Every response must include:
```json
{
  "metadata": {
    "timestamp": "2024-03-22T14:30:00Z",
    "requestId": "unique-uuid",
    "version": "1.0.0"
  }
}
```

---

## Pagination & Filtering

### Standard Pagination

All list endpoints support:
```
?limit=10    (default: 10, max: 100)
?offset=0    (default: 0)
?page=1      (alternative: 1-indexed pages)
```

### Standard Filtering

All list endpoints support field-based filtering:
```
?status=completed&urgency=critical&carehub=hub_123
```

### Standard Sorting

```
?sort=asc&sortField=createdAt
?sort=desc&sortField=name
```

---

## Real-Time Features (WebSockets)

### WebSocket Connection

All WebSocket connections require a valid Supabase JWT token.

**Endpoint:** `wss://api.sanocare.com/v1/ws`

**Connection Headers:**
```
Authorization: Bearer <supabase_jwt_token>
X-Device-ID: uuid
X-Board-Name: sanocare/{role}/{userId}
```

### Room-Based Subscriptions

Clients subscribe to "boards" based on role:

```
Patient: sanocare/patient/{patientId}
Medic: sanocare/medic/{medicId}
Doctor: sanocare/doctor/{doctorId}
Admin: sanocare/admin/operations
```

---

### Event: GPS Update (Medic → Backend → Patient)

**Medic sends (every 10-30 seconds):**
```json
{
  "type": "GPS_UPDATE",
  "data": {
    "consultationId": "uuid",
    "latitude": "number",
    "longitude": "number",
    "accuracy": "number (meters)",
    "speed": "number (km/h)",
    "batteryPercent": "number",
    "timestamp": "2024-03-22T14:30:00Z"
  }
}
```

**Server broadcasts to Patient:**
```json
{
  "type": "MEDIC_LOCATION_UPDATED",
  "data": {
    "medicId": "uuid",
    "consultationId": "uuid",
    "latitude": "number",
    "longitude": "number",
    "eta": "2024-03-22T14:35:00Z",
    "distanceRemaining": 1.2,
    "interpolated": true,
    "batteryPercent": 87,
    "updatedAt": "2024-03-22T14:30:00Z"
  }
}
```

---

### Event: Vitals Captured (Medic → Doctor)

**Medic submits vitals:**
```json
{
  "type": "VITALS_SUBMITTED",
  "data": {
    "consultationId": "uuid",
    "vitalId": "uuid",
    "systolic": 120,
    "diastolic": 80,
    "heartRate": 72,
    "temperature": 98.4,
    "spo2": 98,
    "bloodSugar": 110,
    "capturedAt": "2024-03-22T14:30:00Z"
  }
}
```

**Server broadcasts to Doctor:**
```json
{
  "type": "VITALS_READY",
  "data": {
    "consultationId": "uuid",
    "medicId": "uuid",
    "patientName": "string",
    "vitalsReady": true,
    "readyAt": "2024-03-22T14:30:00Z"
  }
}
```

---

### Event: Case Status Transition

**Any role triggers state change:**
```json
{
  "type": "CASE_STATUS_CHANGED",
  "data": {
    "consultationId": "uuid",
    "oldStatus": "pending",
    "newStatus": "assigned",
    "changedBy": "uuid (medic name)",
    "changedAt": "2024-03-22T14:22:00Z"
  }
}
```

**Broadcast to all interested parties:**
```
Patient sees: "Your medic accepted your request"
Medic sees: case moves to "In Transit"
Doctor sees: case appears in queue
Admin sees: case status updates in real-time heatmap
```

---

### Event: Video Call Initiated (Doctor)

```json
{
  "type": "VIDEO_CALL_INITIATED",
  "data": {
    "consultationId": "uuid",
    "roomId": "sanocare-uuid",
    "doctorName": "Dr. Smith",
    "initiatedAt": "2024-03-22T14:40:00Z"
  }
}
```

---

### Event: New Case Dispatch (Admin → Medic)

```json
{
  "type": "NEW_CASE_ASSIGNED",
  "data": {
    "consultationId": "uuid",
    "patientName": "John Doe",
    "severity": "critical|urgent|routine",
    "complaint": "Chest pain",
    "address": "123 Main St, Mumbai",
    "distance": 2.3,
    "eta": "7 minutes",
    "Priority": 1,
    "assignedAt": "2024-03-22T14:20:00Z"
  }
}
```

---

### Event: Battery Alert (Medic)

```json
{
  "type": "BATTERY_ALERT",
  "data": {
    "medicId": "uuid",
    "batteryPercent": 15,
    "message": "Battery critically low. Please dock device.",
    "alertedAt": "2024-03-22T14:30:00Z"
  }
}
```

---

### Client-Side Socket.io Usage (Frontend)

```typescript
import { io } from 'socket.io-client';

const socket = io('wss://api.sanocare.com/v1', {
  auth: {
    token: supabaseToken,
  },
  query: {
    userId: currentUserId,
    role: userRole,
  },
});

// Subscribe to patient booking
socket.on('MEDIC_LOCATION_UPDATED', (data) => {
  updateMapMarker(data);
});

socket.on('CASE_STATUS_CHANGED', (data) => {
  updateCaseStatus(data.newStatus);
});

// Emit GPS for medic
socket.emit('GPS_UPDATE', {
  consultationId,
  latitude: currentLat,
  longitude: currentLng,
  timestamp: new Date().toISOString(),
});
```

---

## Development Milestones

### Phase 1: Core APIs (Week 1-2)
- [ ] Authentication endpoints (login, OTP, logout)
- [ ] Patient profile & record retrieval
- [ ] Doctor queue and case management
- [ ] Medic dispatch and vitals capture
- [ ] Admin case assignment

### Phase 2: Real-Time Features (Week 3)
- [ ] WebSocket setup
- [ ] Location tracking (medic GPS)
- [ ] Vitals push notifications
- [ ] Case status updates
- [ ] Live notifications

### Phase 3: Advanced Features (Week 4)
- [ ] Analytics dashboard
- [ ] Advanced filtering and search
- [ ] Prescription management
- [ ] Follow-up scheduling
- [ ] Performance metrics

### Phase 4: Integration & Testing (Week 5+)
- [ ] E2E testing
- [ ] Load testing
- [ ] Security audit
- [ ] Documentation finalization
- [ ] Production deployment

---

## Testing Requirements

### Unit Testing
- All business logic must have >80% code coverage
- Use Jest for JavaScript/TypeScript tests
- Backend tests for all API endpoints

### Integration Testing
- All endpoints tested with real database
- Auth token validation
- Permission checks
- Error handling flows

### E2E Testing
- Full user journeys per role
- Real-time updates verification
- API + UI integration

---

## Security Requirements

### API Security
- All endpoints require valid JWT in `Authorization` header
- Tokens expire in 24 hours
- Refresh token available
- HTTPS required in production

### Data Validation
- All inputs validated server-side before DB operations
- SQL injection prevention (use prepared statements)
- XSS prevention (sanitize all output)
- CSRF protection on state-changing endpoints

### Rate Limiting
- 100 requests per minute per user
- 1000 requests per minute per IP
- Exponential backoff on failures

---

## Documentation Standards

### API Documentation (OpenAPI/Swagger)
- Every endpoint fully documented
- Example requests and responses
- Error scenarios covered

### Code Comments
- Complex business logic documented
- External API calls explained
- Data transformation logic noted

### Type Safety
- TypeScript strict mode enabled
- No `any` types
- Zod/Yup for runtime validation

---

## Communication Protocol

### Between Frontend & Backend Teams

1. **Weekly Sync**: Tuesday 10:00 AM IST
2. **Issues & Blockers**: Slack #api-integration channel
3. **API Changes**: Notify 48 hours before impact
4. **Version Control**: Tag releases with API version

### Escalation Path
- Issues → Slack (first response in 6 hours)
- Critical Bugs → Call + Slack
- Design Changes → Weekly sync discussion

---

## Appendix

### A. Glossary

| Term | Definition |
|------|-----------|
| **Medic** | Field worker (Paramedic, EMT, Nurse) collecting vitals |
| **Doctor** | Physician reviewing cases and prescribing |
| **Admin** | Operations team managing dispatch and resources |
| **Patient** | End user booking and receiving services |
| **Case** | Individual patient encounter/service request |
| **Booking** | Patient service request (homecare, teleconsult, etc.) |
| **Carehub** | Physical hub/facility for medic operations |

### B. Common Data Patterns

**Severity Levels:**
- `critical`: Life-threatening, immediate action
- `urgent`: Serious but stable, within hours
- `routine`: Non-emergency, scheduled service

**Status Flows:**
```
Patient Booking: pending → confirmed → medic_assigned → in_transit → completed|cancelled
Doctor Case: pending → ready → in_consultation → review → closed
Medic Case: pending → accepted → in_transit → on_site → vitals_captured → escalated|completed
```

### C. Important Notes

1. **Timezone**: All timestamps in UTC with ISO 8601 format
2. **Currency**: INR (₹) used throughout
3. **Phone Format**: +91XXXXXXXXXX (Indian format)
4. **GPS Format**: WGS84 (decimal degrees)
5. **Idempotency**: Use `X-Idempotency-Key` header for duplicate prevention

---

**Contract Signed By:**
- Frontend Lead: _____________ Date: _______
- Backend Lead: _____________ Date: _______
- Product Manager: _____________ Date: _______

**Version History:**
| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-03-22 | Initial contract |

---

**Last Updated:** 2024-03-22 | **Next Review:** 2024-03-29
