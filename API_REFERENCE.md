# 🔗 SUPABASE INTEGRATION API REFERENCE

Quick lookup guide for all available functions and their signatures.

---

## 📦 DOCTOR SERVICES

All functions are in `doctorServices` exported from `src/lib/supabaseServices.ts`

### `getQueue()`
Fetches all cases assigned to the current doctor.
```typescript
const result = await doctorServices.getQueue();
// Returns:
// { 
//   success: boolean,
//   data: Array<{
//     id, patient_id, status, patient_location, address_line,
//     profiles: { id, full_name, phone },
//     vitals: Array<{...}>
//   }>,
//   error?: string
// }
```

### `getVitals(consultationId: string)`
Fetches all vital readings for a consultation.
```typescript
const result = await doctorServices.getVitals('consultation-id');
// Returns: { success, data: Array<vitals> }
// Fields: systolic, diastolic, heart_rate, temperature, spo2, captured_at
```

### `saveSOAPNotes(consultationId, soapData)`
Creates or updates SOAP notes for a consultation.
```typescript
const result = await doctorServices.saveSOAPNotes(
  'consultation-id',
  {
    subjective: "Patient reports...",
    objective: "Vitals: ...",
    assessment: "Diagnosis: ...",
    plan: "Treatment: ..."
  }
);
// Returns: { success, data: saved_notes }
```

### `closeCaseWithRisk(consultationId, riskTag)`
Closes a consultation with risk classification.
```typescript
const result = await doctorServices.closeCaseWithRisk(
  'consultation-id',
  'stable' | 'monitor' | 'escalate'
);
// Returns: { success, data: updated_consultation }
// Also updates soap_notes.risk_tag
```

### `getSOAPNotes(consultationId: string)`
Fetches existing SOAP notes for a consultation.
```typescript
const result = await doctorServices.getSOAPNotes('consultation-id');
// Returns: { success, data: soap_notes_object_or_null }
```

### `getPrescriptions(consultationId: string)`
Fetches all prescriptions for a consultation.
```typescript
const result = await doctorServices.getPrescriptions('consultation-id');
// Returns: { success, data: Array<prescriptions> }
// Fields: medicine, dosage, frequency, duration
```

---

## 📦 FIELD NODE (MEDIC) SERVICES

All functions are in `fieldNodeServices` exported from `src/lib/supabaseServices.ts`

### `getDispatchQueue()`
Fetches all active dispatch cases for the medic.
```typescript
const result = await fieldNodeServices.getDispatchQueue();
// Returns:
// {
//   success: boolean,
//   data: Array<{
//     id, consultation_id, status, priority, created_at,
//     consultations: {
//       id, patient_id, patient_location, address_line,
//       profiles: { full_name, phone }
//     }
//   }>
// }
```

### `acceptCase(consultationId: string, notes?: string)`
Accepts a case from dispatch queue.
```typescript
const result = await fieldNodeServices.acceptCase(
  'consultation-id',
  'Optional notes'
);
// Updates:
// - dispatch_queue.status = 'accepted'
// - consultations.medic_id = current_user
// - consultations.status = 'assigned'
// - consultations.assigned_at = now
```

### `passCase(consultationId: string)`
Rejects/passes a case (medic unavailable).
```typescript
const result = await fieldNodeServices.passCase('consultation-id');
// Updates: dispatch_queue.status = 'rejected'
```

### `submitVitals(consultationId, vitalsData)`
Records vital signs from field.
```typescript
const result = await fieldNodeServices.submitVitals(
  'consultation-id',
  {
    systolic: 120,
    diastolic: 80,
    heart_rate: 72,
    temperature: 98.4,
    spo2: 98,
    blood_sugar: 110  // optional
  }
);
// Creates:
// - vitals row in DB
// Updates:
// - consultations.status = 'vitals_captured'
```

### `updateGPS(consultationId, location)`
Updates medic's GPS location (dual-path: live_location + audit trail).
```typescript
const result = await fieldNodeServices.updateGPS(
  'consultation-id',
  {
    latitude: 28.7041,
    longitude: 77.1025,
    accuracy: 20,  // meters
    battery_percent: 45
  }
);
// Updates:
// - profiles.live_location (geography point)
// - gps_trail (audit log)
```

### `getActiveConsultation()`
Fetches the current active case for the medic.
```typescript
const result = await fieldNodeServices.getActiveConsultation();
// Returns: { success, data: consultation_or_null }
// Only returns non-closed, non-cancelled cases
```

---

## 📦 PATIENT SERVICES

All functions are in `patientServices` exported from `src/lib/supabaseServices.ts`

### `createBooking(bookingData)`
Creates a new consultation/booking.
```typescript
const result = await patientServices.createBooking({
  service_type: 'homecare' | 'teleconsult' | 'diagnostics',
  patient_location: {
    lat: 28.7041,
    lng: 77.1025
  },
  address_line: "123 Main Street, Delhi",
  notes: "Optional notes"  // optional
});
// Returns: { success, data: created_consultation }
// Sets: status = 'pending', patient_id = current_user
```

### `getBookingStatus(consultationId: string)`
Fetches current status of a booking.
```typescript
const result = await patientServices.getBookingStatus('consultation-id');
// Returns: { success, data: consultation }
// Includes: medic_id, medic_profile, vitals array, soap_notes
```

### `getHealthRecords(limit?, offset?)`
Fetches patient's past consultations (paginated).
```typescript
const result = await patientServices.getHealthRecords(
  10,   // limit (default: 10)
  0     // offset (default: 0)
);
// Returns:
// {
//   success: boolean,
//   data: Array<consultation>,
//   total: number,
//   hasMore: boolean
// }
// Only returns closed consultations
```

### `cancelBooking(consultationId, reason?)`
Cancels a pending or active booking.
```typescript
const result = await patientServices.cancelBooking(
  'consultation-id',
  'User requested cancellation'
);
// Updates: status = 'cancelled'
```

### `getLinkedProfiles()`
Fetches patient's linked profiles (family members).
```typescript
const result = await patientServices.getLinkedProfiles();
// Returns: { success, data: Array<profiles> }
// Each profile has: full_name, phone, role, etc.
```

---

## 📦 ADMIN SERVICES

All functions are in `adminServices` exported from `src/lib/supabaseServices.ts`

### `getAllCases(filters?)`
Fetches all cases with optional filters.
```typescript
const result = await adminServices.getAllCases({
  status: 'pending' | 'assigned' | 'closed',  // optional
  limit: 50,
  offset: 0
});
// Returns:
// {
//   success: boolean,
//   data: Array<consultation>,
//   total: number
// }
```

### `getAvailableMedics()`
Fetches online medics with battery > 15%.
```typescript
const result = await adminServices.getAvailableMedics();
// Returns: { success, data: Array<profiles> }
// Filtered: role='medic', is_online=true, battery>15
// Sorted by created_at
```

### `forceAssignCase(consultationId, medicId, reason)`
Manually assigns a case to a medic (override dispatch).
```typescript
const result = await adminServices.forceAssignCase(
  'consultation-id',
  'medic-user-id',
  'Critical priority override'
);
// Updates:
// - consultations.medic_id = medicId
// - consultations.status = 'assigned'
// - consultations.assigned_at = now
// - dispatch_queue.status = 'assigned'
```

### `getHeatmapData()`
Fetches active cases with geolocation for heatmap.
```typescript
const result = await adminServices.getHeatmapData();
// Returns: { success, data: Array<{id, patient_location, status, created_at}> }
// patient_location is geography type (parse as GeoJSON)
```

---

## 📦 AUTH SERVICES

All functions are in `authServices` exported from `src/lib/supabaseServices.ts`

### `login(email, password)`
Authenticates user with email/password.
```typescript
const result = await authServices.login('user@example.com', 'password');
// Returns: { success, data?: { user, session }, error?: string }
```

### `logout()`
Signs out current user.
```typescript
const result = await authServices.logout();
// Returns: { success, error?: string }
```

### `getCurrentUser()`
Fetches current authenticated user.
```typescript
const result = await authServices.getCurrentUser();
// Returns: { success, data?: user, error?: string }
```

### `getUserProfile()`
Fetches current user's profile from database.
```typescript
const result = await authServices.getUserProfile();
// Returns: { success, data?: profile, error?: string }
// Fields: full_name, phone, role, live_location, is_online
```

---

## 📦 REALTIME SERVICES

All functions are in `realtimeServices` exported from `src/lib/supabaseServices.ts`

### `subscribeToConsultations(callback)`
Subscribes to all consultation changes (realtime).
```typescript
const unsubscribe = realtimeServices.subscribeToConsultations((payload) => {
  console.log(payload.eventType); // INSERT, UPDATE, DELETE
  console.log(payload.new);       // new row values
  console.log(payload.old);       // old row values (on UPDATE/DELETE)
});

// Cleanup:
return () => unsubscribe();
```

### `subscribeToVitals(consultationId, callback)`
Subscribes to new vitals for a specific consultation.
```typescript
const unsubscribe = realtimeServices.subscribeToVitals(
  'consultation-id',
  (payload) => {
    if (payload.eventType === 'INSERT') {
      console.log('New vitals:', payload.new);
    }
  }
);
```

### `subscribeToDispatchQueue(callback)`
Subscribes to dispatch queue changes (new cases, status updates).
```typescript
const unsubscribe = realtimeServices.subscribeToDispatchQueue((payload) => {
  console.log('Dispatch queue update:', payload);
});
```

---

## 🪝 REACT HOOKS

Import from `src/hooks/useSupabaseIntegration.ts`

### Doctor Hooks

```typescript
// Fetch doctor's queue (auto-refreshes)
const { loading, error, fetchQueue } = useDoctorQueue();

// Stream vitals for selected case
const { vitals, loading } = useDoctorVitals(selectedCaseId);

// Save SOAP notes (upsert)
const { saveNotes, loading, error } = useSaveSOAPNotes();
const result = await saveNotes(consultationId, soapData);

// Close case with risk
const { closeCase, loading, error } = useCloseCase();
const result = await closeCase(consultationId, 'stable' | 'monitor' | 'escalate');
```

### Medic Hooks

```typescript
// Fetch & subscribe to dispatch queue
const { loading, fetchQueue } = useDispatchQueue();

// Accept a case
const { acceptCase, loading, error } = useAcceptCase();

// Submit vitals
const { submitVitals, loading, error } = useSubmitVitals();

// Auto-geolocation tracking
const { updateGPS, loading } = useGPSTracking(consultationId);
```

### Patient Hooks

```typescript
// Create booking
const { createBooking, loading, error } = useCreateBooking();

// Get booking status (with realtime updates)
const { booking, loading } = useBookingStatus(consultationId);

// Get health records (paginated)
const { records, loading, hasMore, fetchRecords } = useHealthRecords();

// Get linked profiles (family)
const { profiles, loading } = useLinkedProfiles();
```

### Admin Hooks

```typescript
// Fetch all cases with filters
const { cases, loading, total, fetchCases } = useAllCases();

// Get available medics
const { medics, loading } = useAvailableMedics();

// Force assign case
const { assignCase, loading, error } = useForceAssignCase();
```

### Auth Hooks

```typescript
// Login to app
const { login, loading, error } = useLogin();

// Logout
const { logout, loading } = useLogout();

// Get current session user
const { user, loading } = useAuthUser();
```

---

## 📊 QUICK COPY-PASTE PATTERNS

### Fetch & Display

```typescript
import { doctorServices } from '@/lib/supabaseServices';

export default function MyComponent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const result = await doctorServices.getQueue();
      if (result.success) setData(result.data);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <p>Loading...</p>;
  return <div>{data.map(item => <div key={item.id}>{item.name}</div>)}</div>;
}
```

### Hook Pattern

```typescript
import { useDoctorQueue } from '@/hooks/useSupabaseIntegration';

export default function MyComponent() {
  const { loading, error } = useDoctorQueue();
  const queue = useDoctorPortalStore((s) => s.queue);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  return <div>{queue.map(item => <div key={item.id}>{item.name}</div>)}</div>;
}
```

### Form Submission

```typescript
import { useCreateBooking } from '@/hooks/useSupabaseIntegration';

export default function BookingForm() {
  const { createBooking, loading, error } = useCreateBooking();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await createBooking({
      service_type: 'homecare',
      patient_location: { lat: 28.7, lng: 77.1 },
      address_line: 'Address'
    });
    if (result.success) {
      console.log('Success:', result.data.id);
    } else {
      console.log('Error:', result.error);
    }
  };

  return <form onSubmit={handleSubmit}>{/* form fields */}</form>;
}
```

---

## ⚠️ ERROR HANDLING

All functions return consistent format:
```typescript
{
  success: boolean,
  data?: any,       // Only if success=true
  error?: string    // Only if success=false
}
```

Always check `success` before accessing `data`:
```typescript
const result = await doctorServices.getQueue();
if (result.success) {
  console.log(result.data);  // Type-safe
} else {
  console.error(result.error);
}
```

---

## 🔒 RLS PERMISSIONS

| Role | Can Read | Can Write |
|------|----------|-----------|
| patient | Own consultations only | Own consultations |
| medic | Assigned consultations | Own vitals, own GPS |
| doctor | Assigned consultations | SOAP notes, close case |
| admin | All tables | All tables |

All enforced at Supabase RLS level.
