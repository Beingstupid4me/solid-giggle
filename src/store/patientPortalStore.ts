import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Relationship = "self" | "spouse" | "child" | "parent";

export interface LinkedProfile {
  id: string;
  fullName: string;
  age: number;
  bloodGroup: string;
  allergies: string;
  relationship: Relationship;
}

export interface BookingDraft {
  serviceType: "homecare" | "teleconsult" | "diagnostics";
  mode: "now" | "carehub";
  addressLine: string;
  carehubId: string;
  gpsLatitude: number | null;
  gpsLongitude: number | null;
  paymentNoticeAccepted: boolean;
}

export interface DispatchState {
  active: boolean;
  medicName: string;
  unitCode: string;
  etaMinutes: number;
  distanceKm: number;
  updatedAt: number;
}

export interface RecordVitals {
  bp: string;
  sugar: string;
  spo2: string;
  pulse: string;
  temperature: string;
}

export interface HealthRecord {
  id: string;
  profileId: string;
  tag: string;
  doctorName: string;
  doctorRole: string;
  facility: string;
  dateLabel: string;
  monthLabel: string;
  summary: string;
  vitals: RecordVitals;
  soap: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
  prescriptions: Array<{
    medicine: string;
    dosage: string;
    duration: string;
  }>;
}

interface PatientPortalState {
  auth: {
    phone: string;
    otpSent: boolean;
    authenticated: boolean;
  };
  profiles: LinkedProfile[];
  selectedProfileId: string;
  bookingDraft: BookingDraft;
  dispatch: DispatchState;
  records: HealthRecord[];
  sendOtp: (phone: string) => void;
  verifyOtp: (otp: string) => boolean;
  logout: () => void;
  setSelectedProfile: (profileId: string) => void;
  updateProfile: (profileId: string, data: Partial<LinkedProfile>) => void;
  addFamilyMember: (data: Omit<LinkedProfile, "id" | "relationship"> & { relationship: Exclude<Relationship, "self"> }) => void;
  updateBookingDraft: (data: Partial<BookingDraft>) => void;
  captureGps: () => void;
  confirmBooking: () => void;
  clearDispatch: () => void;
}

const initialProfiles: LinkedProfile[] = [
  {
    id: "self-001",
    fullName: "Sarah Jenkins",
    age: 64,
    bloodGroup: "B+",
    allergies: "Penicillin",
    relationship: "self",
  },
  {
    id: "parent-001",
    fullName: "Elena Jenkins",
    age: 82,
    bloodGroup: "O+",
    allergies: "None",
    relationship: "parent",
  },
  {
    id: "child-001",
    fullName: "Mia Jenkins",
    age: 12,
    bloodGroup: "A+",
    allergies: "Peanuts",
    relationship: "child",
  },
];

const initialRecords: HealthRecord[] = [
  {
    id: "SC-9921",
    profileId: "self-001",
    tag: "Specialist Consultation",
    doctorName: "Dr. Alistair Vance",
    doctorRole: "Chief Cardiovascular Surgeon",
    facility: "Cardiac Center of Excellence",
    dateLabel: "Sept 14, 2024",
    monthLabel: "September 2024",
    summary: "Follow-up for chest pain episode. Responding well to adjusted medication.",
    vitals: { bp: "128/84", sugar: "132 mg/dL", spo2: "98%", pulse: "76 bpm", temperature: "98.4 F" },
    soap: {
      subjective: "Intermittent chest heaviness after exertion, no radiation today.",
      objective: "Vitals stable. ECG reviewed. No acute ischemic changes.",
      assessment: "Stable angina, monitor symptoms over 14-day window.",
      plan: "Continue current regimen, avoid exertion spikes, follow-up in 2 weeks.",
    },
    prescriptions: [
      { medicine: "Aspirin 75mg", dosage: "1 tablet after breakfast", duration: "30 days" },
      { medicine: "Atorvastatin 20mg", dosage: "1 tablet at bedtime", duration: "30 days" },
    ],
  },
  {
    id: "SC-8442",
    profileId: "self-001",
    tag: "Diagnostic Imaging",
    doctorName: "Dr. Elena Rodriguez",
    doctorRole: "Diagnostic Radiologist",
    facility: "Sano Advanced Imaging",
    dateLabel: "Aug 28, 2024",
    monthLabel: "August 2024",
    summary: "Chest imaging indicates no acute pulmonary findings.",
    vitals: { bp: "124/80", sugar: "118 mg/dL", spo2: "99%", pulse: "72 bpm", temperature: "98.2 F" },
    soap: {
      subjective: "Mild breathlessness reported during stair climb.",
      objective: "Imaging reviewed. No acute infiltrates.",
      assessment: "Likely exertional deconditioning.",
      plan: "Breathing exercises, hydration, follow-up if symptoms worsen.",
    },
    prescriptions: [
      { medicine: "Vitamin D3", dosage: "Weekly sachet", duration: "8 weeks" },
    ],
  },
  {
    id: "SC-7110",
    profileId: "parent-001",
    tag: "Primary Care",
    doctorName: "Dr. Sarah Jenkins",
    doctorRole: "Family Practitioner",
    facility: "Sano Wellness Clinic",
    dateLabel: "Aug 12, 2024",
    monthLabel: "August 2024",
    summary: "General review for fatigue and hydration monitoring.",
    vitals: { bp: "138/86", sugar: "146 mg/dL", spo2: "97%", pulse: "78 bpm", temperature: "98.5 F" },
    soap: {
      subjective: "Tiredness in late afternoon.",
      objective: "Mildly elevated blood glucose.",
      assessment: "Monitor glucose trends with diet correction.",
      plan: "Diet plan, hydration target 2L/day, retest in 4 weeks.",
    },
    prescriptions: [
      { medicine: "Metformin 500mg", dosage: "1 tablet with evening meal", duration: "30 days" },
    ],
  },
];

const initialBookingDraft: BookingDraft = {
  serviceType: "homecare",
  mode: "now",
  addressLine: "",
  carehubId: "north-hub",
  gpsLatitude: null,
  gpsLongitude: null,
  paymentNoticeAccepted: false,
};

const initialDispatch: DispatchState = {
  active: false,
  medicName: "Dr. Aris Thorne",
  unitCode: "Sano-Unit 402",
  etaMinutes: 8,
  distanceKm: 2.4,
  updatedAt: 0,
};

export const usePatientPortalStore = create<PatientPortalState>()(
  persist(
    (set, get) => ({
      auth: {
        phone: "+91 ",
        otpSent: false,
        authenticated: false,
      },
      profiles: initialProfiles,
      selectedProfileId: "self-001",
      bookingDraft: initialBookingDraft,
      dispatch: initialDispatch,
      records: initialRecords,

      sendOtp: (phone) =>
        set((state) => ({
          auth: {
            ...state.auth,
            phone,
            otpSent: true,
          },
        })),

      verifyOtp: (otp) => {
        const valid = otp === "123456" || otp === "000000";
        if (valid) {
          set((state) => ({
            auth: {
              ...state.auth,
              authenticated: true,
            },
          }));
        }
        return valid;
      },

      logout: () =>
        set((state) => ({
          auth: { ...state.auth, authenticated: false, otpSent: false },
          dispatch: initialDispatch,
        })),

      setSelectedProfile: (profileId) => set({ selectedProfileId: profileId }),

      updateProfile: (profileId, data) =>
        set((state) => ({
          profiles: state.profiles.map((profile) =>
            profile.id === profileId ? { ...profile, ...data } : profile,
          ),
        })),

      addFamilyMember: (data) =>
        set((state) => ({
          profiles: [
            ...state.profiles,
            {
              id: `family-${Date.now()}`,
              ...data,
            },
          ],
        })),

      updateBookingDraft: (data) =>
        set((state) => ({
          bookingDraft: {
            ...state.bookingDraft,
            ...data,
          },
        })),

      captureGps: () =>
        set((state) => ({
          bookingDraft: {
            ...state.bookingDraft,
            gpsLatitude: 28.6139,
            gpsLongitude: 77.209,
          },
        })),

      confirmBooking: () =>
        set((state) => ({
          dispatch: {
            ...state.dispatch,
            active: true,
            updatedAt: Date.now(),
          },
        })),

      clearDispatch: () =>
        set({
          dispatch: initialDispatch,
          bookingDraft: initialBookingDraft,
        }),
    }),
    {
      name: "patient-portal-store",
      partialize: (state) => ({
        auth: state.auth,
        profiles: state.profiles,
        selectedProfileId: state.selectedProfileId,
        bookingDraft: state.bookingDraft,
        dispatch: state.dispatch,
      }),
    },
  ),
);
