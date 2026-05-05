# 🚀 Sanocare Supabase Setup & Integration Guide

**Last Updated:** March 2026  
**Status:** Production-Ready  
**Architecture:** Next.js PWA ↔ Supabase PostgreSQL + PostGIS ↔ FastAPI Backend

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Project Setup](#supabase-project-setup)
3. [Database Migration](#database-migration)
4. [Frontend Integration](#frontend-integration)
5. [Wiring Portal Components](#wiring-portal-components)
6. [Testing & Validation](#testing--validation)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Ensure you have:
- Node.js 18+ (`node --version`)
- npm or yarn (`npm --version`)
- Supabase CLI (`npm install -g supabase`)
- PostgreSQL client (`psql --version`)
- Docker (for local Supabase development)

Verify all are installed:
```bash
node --version && npm --version && supabase --version && docker --version
```

---

## Supabase Project Setup

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up / Log in
4. Create a new project:
   - **Name:** `sanocare-portal`
   - **Database Password:** Create a strong password
   - **Region:** Select closest to your users (e.g., `ap-southeast-1` for India)
   - **Pricing:** Start with free tier

5. Wait for project initialization (usually takes 1-2 minutes)

### Step 2: Get Your Credentials

Once your project is ready:

1. Go to **Settings** → **API**
2. Copy the following:
   - **Project URL:** e.g., `https://xxxxx.supabase.co`
   - **Public Anonymous Key (anon):** Used in `.env.local`
   - **Service Role Secret:** For backend only

3. Create `.env.local` in your project root:
```bash
cp .env.local.example .env.local
```

4. Paste your credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Step 3: Enable PostGIS Extension

1. In Supabase dashboard, go to **SQL Editor**
2. Run this query:
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

3. Verify it worked (should see "CREATE EXTENSION" messages)

---

## Database Migration

### Option A: Using Supabase CLI (Recommended)

1. Initialize Supabase in your project:
```bash
cd ~/Desktop/Code/Sanocare/sano-care
supabase init
```

2. Link to your remote Supabase project:
```bash
supabase link --project-ref YOUR_PROJECT_ID
# (project ID is the first part of your URL: xxxxx.supabase.co)
```

3. Run the migration:
```bash
supabase db push
# This will apply supabase/migrations/001_create_sanocare_schema.sql
```

4. Verify tables were created:
```bash
supabase db pull  # Shows schema locally
```

### Option B: Direct SQL (Quick Method)

1. In Supabase **SQL Editor**, create a new query
2. Copy the entire contents of `supabase/migrations/001_create_sanocare_schema.sql`
3. Paste into the query editor
4. Click **Run**

5. You should see success messages for:
   - `CREATE EXTENSION`
   - `CREATE TYPE`
   - `CREATE TABLE` (8 tables)
   - `CREATE INDEX` (multiple)
   - `CREATE POLICY` (RLS policies)
   - `CREATE FUNCTION` (PostGIS functions)
   - `INSERT` (sample data)

---

## Frontend Integration

### Step 1: Install Dependencies

```bash
cd ~/Desktop/Code/Sanocare/sano-care

# Install Supabase client
npm install @supabase/supabase-js

# Install toast library (recommended)
npm install sonner

# Install Socket.io for realtime (optional, for WebSocket features)
npm install socket.io-client
```

### Step 2: Verify Configuration

In `src/lib/supabase.ts`, ensure it reads your env vars:
```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_ANON_KEY!;
```

### Step 3: Test Connection

Create a quick test file:
```bash
cat > src/lib/test-supabase.ts << 'EOF'
import { supabase } from './supabase';

export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (error) throw error;
    console.log('✅ Supabase connection successful!');
    console.log('Sample data:', data);
    return true;
  } catch (err) {
    console.error('❌ Supabase connection failed:', err);
    return false;
  }
}
EOF
```

Run the test in your development environment:
```bash
npm run dev
# Then in browser console:
# const { testConnection } = await import('/lib/test-supabase.ts');
# testConnection();
```

---

## Wiring Portal Components

### Architecture Overview

```
Portal Component
    ↓
    [Button Click]
    ↓
    useConsultations() / useMedicServices() / etc.
    ↓
    supabase.from('table').insert/update/delete/select()
    ↓
    RLS Policies (row-level security)
    ↓
    Database ✅
    ↓
    Real-time subscription (if enabled)
    ↓
    State update in component
    ↓
    UI re-renders with new data
```

### Pattern: Convert Dummy Data to Real Supabase

**Before (Dummy Data):**
```typescript
// OLD: Using Zustand with hardcoded data
export const usePatientPortalStore = create((set) => ({
  booking: { id: '1', status: 'pending', ... },
}));
```

**After (Real Supabase):**
```typescript
// NEW: Using Supabase hooks
export function BookingPage() {
  const { consultations, createBooking, loading } = useConsultations();
  
  const handleBooking = async () => {
    await createBooking({
      profileId: user.id,
      serviceType: 'homecare',
      patientLocation: { lat, lng },
      address: formData.address,
    });
  };
  
  return (
    <button onClick={handleBooking} disabled={loading}>
      {loading ? 'Creating...' : 'Book Service'}
    </button>
  );
}
```

### Step-by-Step: Wire Patient Booking Page

1. **Open** `src/app/portal/patient/booking/page.tsx`

2. **Add these imports at the top:**
```typescript
'use client';

import { useState, useEffect } from 'react';
import { useConsultations } from '@/hooks/useSupabase';
import { useAuth } from '@/hooks/useSupabase';
import { toast } from 'sonner';
import type { ServiceType } from '@/lib/supabase-types';
```

3. **Get authenticated user:**
```typescript
export default function PatientBookingPage() {
  const { user } = useAuth();
  const { createBooking, loading, error } = useConsultations();
  const [location, setLocation] = useState(null);
  
  if (!user) return <p>Please log in first</p>;
  
  // ... rest of component
}
```

4. **Add GPS capture function:**
```typescript
const handleGetLocation = () => {
  if (!navigator.geolocation) {
    toast.error('Geolocation not available');
    return;
  }
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      setLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
      toast.success('📍 Location captured');
    },
    () => toast.error('Unable to get location')
  );
};
```

5. **Wire the submit button:**
```typescript
const handleSubmitBooking = async () => {
  if (!location) {
    toast.error('Please share your location');
    return;
  }
  
  const response = await createBooking({
    profileId: user.id,
    serviceType: selectedService as ServiceType,
    patientLocation: location,
    address: addressInput,
    notes: notesInput,
  });
  
  if (response.success) {
    toast.success('✅ Booking created! Medic assigned shortly.');
    // Navigate to tracking page
    window.location.href = `/portal/patient/tracking?id=${response.data.id}`;
  } else {
    toast.error(`❌ ${response.error}`);
  }
};
```

6. **Update the button JSX:**
```typescript
<button
  onClick={handleSubmitBooking}
  disabled={loading}
  className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold disabled:opacity-50"
>
  {loading ? '⏳ Creating Booking...' : '🚀 Book Now'}
</button>
```

### Repeat for Other Modules:

**Medic Dispatch:**
- File: `src/app/portal/field-node/page.tsx`
- Hook: `useMedicServices()`
- Key functions: `getDispatchQueue()`, `acceptCase()`, `submitVitals()`

**Doctor Consultation:**
- File: `src/app/portal/doctor/page.tsx`
- Hook: `useDoctorServices()`
- Key functions: `getQueue()`, `saveSOAPNotes()`

**Admin Dashboard:**
- File: `src/app/portal/admin/page.tsx`
- Hook: `useAdminServices()`
- Key functions: `getAllCases()`, `getAvailableMedics()`, `forceAssignCase()`

---

## Testing & Validation

### Unit Tests

Create `src/lib/__tests__/supabase.test.ts`:
```typescript
import { testConnection } from '../test-supabase';

describe('Supabase Connection', () => {
  it('should connect to database', async () => {
    const result = await testConnection();
    expect(result).toBe(true);
  });
});
```

Run tests:
```bash
npm test
```

### Manual Testing Checklist

- [ ] Patient can create booking → Check Supabase `consultations` table for new row
- [ ] Medic receives dispatch → Check `dispatch_queue` table
- [ ] Medic can submit vitals → Check `vitals` table for new rows
- [ ] Doctor can save SOAP notes → Check `soap_notes` table
- [ ] Admin can view all cases → Check filtering works
- [ ] Real-time updates trigger → Change data in one tab, see it update in another

### Browser DevTools Inspection

1. Open DevTools (F12)
2. Go to **Application** → **Local Storage**
3. Should see `supabase.auth.token` (JWT)
4. Network tab should show successful API calls to `supabase.co`

---

## Deployment

### Environment Variables

Set these in your deployment platform (Netlify, Vercel, etc.):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=https://api.sanocare.com
NEXT_PUBLIC_WS_URL=wss://api.sanocare.com/v1/ws
```

### Production Supabase Settings

1. **Enable RLS on all tables** (goes in dashboard):
   - Settings → Database → Auth → RLS
   - Should see green toggles for all tables

2. **Configure custom domains** (optional):
   - Supabase Dashboard → Settings → Custom Domain
   - Points to your Sanocare domain

3. **Set backup retention**:
   - Settings → Backups → Enable daily backups

4. **Monitor usage**:
   - Supabase Dashboard → Home → Usage stats
   - Alert if approaching rate limits

---

## Troubleshooting

### Issue: "NEXT_PUBLIC_SUPABASE_URL is undefined"

**Cause:** Missing `.env.local` file  
**Fix:**
```bash
cp .env.local.example .env.local
# Edit .env.local with your credentials
npm run dev  # Restart dev server
```

### Issue: "PostGIS functions not found"

**Cause:** Extension not enabled  
**Fix:**
```sql
-- In Supabase SQL Editor:
CREATE EXTENSION IF NOT EXISTS postgis;
```

### Issue: "RLS policy denies access"

**Cause:** User doesn't have correct permissions  
**Fix:**
```sql
-- Grant select on profiles to authenticated users:
GRANT SELECT ON profiles TO authenticated;
```

### Issue: "Realtime subscriptions not working"

**Cause:** Realtime not enabled  
**Fix:**
1. Supabase Dashboard → Settings → Realtime
2. Toggle **ON** for tables you want to monitor

### Issue: CORS errors when calling from browser

**Cause:** Supabase URL not in CORS whitelist  
**Fix:**
1. Check that `NEXT_PUBLIC_SUPABASE_URL` matches Supabase dashboard
2. In Supabase Settings → API, verify CORS settings
3. Restart dev server: `npm run dev`

### Get Help

- Supabase Docs: https://supabase.com/docs
- GitHub Issues: https://github.com/supabase/supabase/issues
- Slack Community: https://supabase.com/slack

---

## Next Steps

Once frontend is wired to Supabase:

1. **Create FastAPI backend** to handle:
   - Auth proxy (Supabase Auth → JWT)
   - WebSocket for GPS streaming
   - LiveKit token generation
   - Business logic (billing, dispatch)

2. **Set up Redis** for:
   - GPS caching (real-time map updates)
   - Message queue for dispatch

3. **Configure LiveKit** for:
   - Video signaling
   - Room management
   - Recording (optional)

4. **Deploy** to:
   - Frontend: Netlify/Vercel
   - Backend: Railway/Render
   - Database: Supabase Cloud
   - Redis: Railway

---

## Files Reference

| File | Purpose |
|------|---------|
| `supabase/migrations/001_create_sanocare_schema.sql` | Database schema + RLS |
| `src/lib/supabase.ts` | Supabase client initialization |
| `src/lib/supabase-types.ts` | TypeScript types (all tables) |
| `src/hooks/useSupabase.ts` | React hooks (authentication, data) |
| `src/lib/INTEGRATION_GUIDE.md` | Code examples for wiring components |
| `.env.local.example` | Environment variable template |

---

**Status:** ✅ Ready for production  
**Last Verified:** March 2026  
**Tested On:** Next.js 14, Node.js 18+, Supabase 1.0+
