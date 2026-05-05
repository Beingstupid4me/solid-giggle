// INTEGRATION GUIDE: Wiring Supabase to Portal Components
// ========================================================
// This guide shows how to connect the Supabase hooks to your existing portal components.
// Follow this pattern for all portal pages.

/** 
 * PATTERN 1: PATIENT BOOKING FLOW
 * ================================
 * 
 * The pattern for connecting a form/action to Supabase:
 * 
 * 1. Import the appropriate hook
 * 2. Extract the service function and loading state
 * 3. Wire up the button onClick to call the service
 * 4. Show loading/error states
 * 5. Handle success response
 */

// EXAMPLE: Patient Booking Page
// ===============================

import { useState } from 'react';
import { useConsultations } from '@/hooks/useSupabase';
import { ServiceType } from '@/lib/supabase-types';
import { toast } from 'sonner'; // or your toast library

export function PatientBookingForm() {
  const { createBooking, loading, error } = useConsultations();
  const [formData, setFormData] = useState({
    serviceType: 'homecare' as ServiceType,
    address: '',
    notes: '',
  });
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Get user's GPS location
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        toast.success('Location captured');
      });
    }
  };

  // Submit booking to Supabase
  const handleSubmitBooking = async () => {
    if (!location) {
      toast.error('Please capture your location');
      return;
    }

    const response = await createBooking({
      profileId: 'user-id-here', // Get from auth context
      serviceType: formData.serviceType,
      patientLocation: location,
      address: formData.address,
      notes: formData.notes,
    });

    if (response.success) {
      toast.success('Booking created! Medic assigned shortly.');
      // Navigate to tracking page
    } else {
      toast.error(response.error);
    }
  };

  return (
    <div className="space-y-4 p-6">
      <div>
        <label>Service Type</label>
        <select
          value={formData.serviceType}
          onChange={(e) =>
            setFormData({ ...formData, serviceType: e.target.value as ServiceType })
          }
        >
          <option value="homecare">Home Care Visit</option>
          <option value="teleconsult">Teleconsultation</option>
          <option value="diagnostics">Diagnostics</option>
        </select>
      </div>

      <div>
        <label>Address</label>
        <input
          type="text"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Enter your address"
        />
      </div>

      <div>
        <label>Location</label>
        <button
          onClick={handleGetLocation}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          📍 Get My Location
        </button>
        {location && (
          <p className="text-sm text-green-600 mt-2">
            ✓ Location: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
          </p>
        )}
      </div>

      <div>
        <label>Additional Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Any special instructions..."
        />
      </div>

      <button
        onClick={handleSubmitBooking}
        disabled={loading}
        className="w-full px-4 py-3 bg-blue-500 text-white rounded font-semibold disabled:opacity-50"
      >
        {loading ? 'Creating booking...' : 'Submit Booking'}
      </button>

      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}

/**
 * PATTERN 2: MEDIC DISPATCH FLOW
 * ==============================
 */

import { useEffect, useState } from 'react';
import { useMedicServices } from '@/hooks/useSupabase';
import { DispatchQueue } from '@/lib/supabase-types';

export function MedicDispatchScreen() {
  const { dispatch, getDispatchQueue, acceptCase, loading } = useMedicServices();
  const [current, setCurrent] = useState<DispatchQueue | null>(null);

  // Fetch dispatch queue on mount
  useEffect(() => {
    getDispatchQueue();
    // Refresh every 10 seconds
    const interval = setInterval(() => getDispatchQueue(), 10000);
    return () => clearInterval(interval);
  }, []);

  // Show incoming dispatch as high-urgency modal
  useEffect(() => {
    if (dispatch.length > 0 && !current) {
      setCurrent(dispatch[0]);
    }
  }, [dispatch]);

  const handleAcceptDispatch = async () => {
    if (!current) return;

    const response = await acceptCase(current.consultation_id);
    if (response.success) {
      toast.success('Case accepted! Navigate to patient location');
      setCurrent(null);
    } else {
      toast.error(response.error);
    }
  };

  const handleRejectDispatch = () => {
    setCurrent(null);
  };

  if (!current) {
    return <p className="text-gray-500">No active dispatch. Waiting for cases...</p>;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm">
        <h2 className="text-2xl font-bold text-red-600">🚨 NEW DISPATCH</h2>
        <p className="text-lg font-semibold mt-2">Patient: John Doe</p>
        <p className="text-gray-600">Distance: {current.id} km away</p>
        <p className="text-gray-600">Address: 123 Main St, Delhi</p>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleAcceptDispatch}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-green-500 text-white rounded font-semibold disabled:opacity-50"
          >
            {loading ? 'Accepting...' : 'Accept'}
          </button>
          <button
            onClick={handleRejectDispatch}
            className="flex-1 px-4 py-3 bg-red-500 text-white rounded font-semibold"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * PATTERN 3: DOCTOR CONSULTATION
 * ==============================
 */

import { useState, useEffect } from 'react';
import { useDoctorServices } from '@/hooks/useSupabase';

export function DoctorSOAPForm({ consultationId }: { consultationId: string }) {
  const { saveSOAPNotes, loading } = useDoctorServices();
  const [notes, setNotes] = useState({
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
  });

  const handleSaveNotes = async () => {
    const response = await saveSOAPNotes({
      consultationId,
      ...notes,
    });

    if (response.success) {
      toast.success('SOAP notes saved');
    } else {
      toast.error(response.error);
    }
  };

  return (
    <div className="space-y-4 p-6">
      <div>
        <label className="block font-semibold mb-2">Subjective (Patient's Story)</label>
        <textarea
          value={notes.subjective}
          onChange={(e) => setNotes({ ...notes, subjective: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="What the patient tells you..."
          rows={4}
        />
      </div>

      <div>
        <label className="block font-semibold mb-2">Objective (What You See)</label>
        <textarea
          value={notes.objective}
          onChange={(e) => setNotes({ ...notes, objective: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="Vitals, observations, physical exam..."
          rows={4}
        />
      </div>

      <div>
        <label className="block font-semibold mb-2">Assessment (Your Diagnosis)</label>
        <textarea
          value={notes.assessment}
          onChange={(e) => setNotes({ ...notes, assessment: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="Your clinical impression..."
          rows={4}
        />
      </div>

      <div>
        <label className="block font-semibold mb-2">Plan (Next Steps)</label>
        <textarea
          value={notes.plan}
          onChange={(e) => setNotes({ ...notes, plan: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="Treatment plan, medications, follow-up..."
          rows={4}
        />
      </div>

      <button
        onClick={handleSaveNotes}
        disabled={loading}
        className="w-full px-4 py-3 bg-blue-500 text-white rounded font-semibold disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save SOAP Notes'}
      </button>
    </div>
  );
}

/**
 * PATTERN 4: ADMIN CASE MANAGEMENT
 * ================================
 */

import { useEffect, useState } from 'react';
import { useAdminServices } from '@/hooks/useSupabase';
import { Consultation } from '@/lib/supabase-types';

export function AdminCaseBoard() {
  const { cases, medics, getAllCases, getAvailableMedics, forceAssignCase, loading } =
    useAdminServices();

  useEffect(() => {
    getAllCases({ status: 'pending' });
    getAvailableMedics();
  }, []);

  const handleForceAssign = async (caseId: string, medicId: string) => {
    const response = await forceAssignCase(
      caseId,
      medicId,
      'Admin manual assignment'
    );

    if (response.success) {
      toast.success('Case assigned to medic');
      getAllCases(); // Refresh
    } else {
      toast.error(response.error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dispatch Board</h1>

      <div className="grid grid-cols-3 gap-6">
        {/* Pending Cases */}
        <div className="bg-white rounded-lg p-4 border-l-4 border-yellow-500">
          <h2 className="font-semibold text-lg">Pending Cases</h2>
          <div className="space-y-2 mt-4">
            {cases
              .filter((c) => c.status === 'pending')
              .map((caseItem) => (
                <div
                  key={caseItem.id}
                  className="p-3 bg-gray-50 rounded border cursor-pointer hover:bg-gray-100"
                >
                  <p className="font-semibold">{caseItem.id.slice(0, 8)}</p>
                  <p className="text-sm text-gray-600">{caseItem.address_line}</p>

                  {/* Assign to medic */}
                  <select
                    onChange={(e) => handleForceAssign(caseItem.id, e.target.value)}
                    className="w-full mt-2 p-1 border rounded text-sm"
                  >
                    <option value="">Assign medic...</option>
                    {medics.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.full_name} ({m.unit_code})
                      </option>
                    ))}
                  </select>
                </div>
              ))}
          </div>
        </div>

        {/* Assigned Cases */}
        <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
          <h2 className="font-semibold text-lg">In Transit</h2>
          <div className="space-y-2 mt-4">
            {cases
              .filter((c) => c.status === 'assigned' || c.status === 'in_transit')
              .map((caseItem) => (
                <div key={caseItem.id} className="p-3 bg-gray-50 rounded border">
                  <p className="font-semibold text-sm">{caseItem.id.slice(0, 8)}</p>
                  <p className="text-xs text-gray-600">ETA: 5 mins</p>
                </div>
              ))}
          </div>
        </div>

        {/* Completed Cases */}
        <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
          <h2 className="font-semibold text-lg">Completed</h2>
          <div className="space-y-2 mt-4">
            {cases
              .filter((c) => c.status === 'closed')
              .slice(0, 5)
              .map((caseItem) => (
                <div key={caseItem.id} className="p-3 bg-gray-50 rounded border">
                  <p className="font-semibold text-sm">{caseItem.id.slice(0, 8)}</p>
                  <p className="text-xs text-gray-600">₹{caseItem.cost_total}</p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * PATTERN 5: REALTIME GPS TRACKING (Patient Side)
 * ===============================================
 */

import { useState, useEffect } from 'react';
import { useRealtimeSubscriptions } from '@/hooks/useSupabase';

export function PatientTrackingMap({ consultationId }: { consultationId: string }) {
  const [medicLocation, setMedicLocation] = useState<{ lat: number; lng: number } | null>(null);
  useRealtimeSubscriptions();

  useEffect(() => {
    // Subscribe to GPS updates for this consultation
    const channel = supabase
      .channel(`gps-${consultationId}`)
      .on('realtime', { event: '*' }, (payload) => {
        if (payload.new?.consumption_id === consultationId) {
          setMedicLocation({
            lat: payload.new.location.coordinates[1],
            lng: payload.new.location.coordinates[0],
          });
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [consultationId]);

  return (
    <div className="w-full h-screen bg-gray-100 flex items-center justify-center">
      {medicLocation ? (
        <p className="text-center">
          📍 Medic is at {medicLocation.lat.toFixed(4)}, {medicLocation.lng.toFixed(4)}
        </p>
      ) : (
        <p className="text-center text-gray-600">Loading medic location...</p>
      )}
    </div>
  );
}

/**
 * INTEGRATION CHECKLIST
 * ====================
 * 
 * For each portal page:
 * 
 * ☐ 1. Import the appropriate hook (useConsultations, useMedicServices, etc.)
 * ☐ 2. Call the hook to get services and loading state
 * ☐ 3. Wire onClick handlers to call the service functions
 * ☐ 4. Show loading spinners while requests are in flight
 * ☐ 5. Display error messages if calls fail
 * ☐ 6. Show success toasts when operations complete
 * ☐ 7. Refresh data after mutations (create, update, delete)
 * ☐ 8. Subscribe to realtime changes for live updates
 * 
 * ENVIRONMENT VARIABLES needed:
 * =============================
 * NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
 * NEXT_PUBLIC_ANON_KEY=your-anon-key
 * 
 * DATABASE SETUP:
 * ===============
 * 1. Create a new Supabase project
 * 2. Run the migration: supabase/migrations/001_create_sanocare_schema.sql
 * 3. Enable RLS on all tables
 * 4. Test with the sample data
 * 
 * TESTING LOCALLY:
 * ================
 * npm install @supabase/supabase-js
 * npm install sonner (for toasts)
 * npx supabase start
 * npm run dev
 * 
 */

export default {};
