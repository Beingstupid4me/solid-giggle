/**
 * Patient Vault Store — Zustand
 *
 * Central state management for the Phase 8 Patient Health Vault.
 * Manages family members, consultations, and selected profile context.
 * All data is loaded from Supabase via the patientVaultService.
 */
import { create } from "zustand";
import {
  getFamilyMembers,
  getConsultations,
  getActiveConsultation,
  getPatientProfile,
  getAllPatientProfiles,
  type FamilyMember,
  type EnrichedConsultation,
  type ProfileRow,
} from "@/services/patientVaultService";

/* ─── Mock data for when Supabase has no data ─── */
const MOCK_FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: "mock-self",
    user_id: "mock-user",
    full_name: "Shashwat Arora",
    relationship: "Self",
    age: 31,
    blood_group: "B+",
    allergies: "None known",
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-parent-1",
    user_id: "mock-user",
    full_name: "Anita Arora",
    relationship: "Parent",
    age: 58,
    blood_group: "A+",
    allergies: "Penicillin",
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-parent-2",
    user_id: "mock-user",
    full_name: "Raj Arora",
    relationship: "Parent",
    age: 61,
    blood_group: "O+",
    allergies: "Dust",
    created_at: new Date().toISOString(),
  },
];

const MOCK_CONSULTATIONS: EnrichedConsultation[] = [
  {
    id: "cons-mock-001",
    status: "in_consultation",
    serviceType: "Homecare",
    doctorName: "Dr. Priya Sharma",
    doctorSpeciality: "Cardiology",
    createdAt: new Date().toISOString(),
    assignedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    arrivedAt: null,
    closedAt: null,
    addressLine: "42 Vasant Vihar, New Delhi",
    meetLink: "https://meet.jit.si/SanoCare-PRD-2048",
    doctorNotes: null,
    prescriptionUrl: null,
    notes: "Follow-up consultation for chest pain episode",
    baseCost: 499,
    timeCost: 0,
    distanceCost: 0,
    totalCost: 499,
    vitals: {
      bp: "128/82 mmHg",
      temperature: "98.4°F",
      spo2: "98%",
      heartRate: "74 bpm",
      bloodSugar: "110 mg/dL",
    },
  },
  {
    id: "cons-mock-002",
    status: "closed",
    serviceType: "Homecare",
    doctorName: "Dr. R. Mehta",
    doctorSpeciality: "Internal Medicine",
    createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
    assignedAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
    arrivedAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
    closedAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
    addressLine: "42 Vasant Vihar, New Delhi",
    meetLink: null,
    doctorNotes: "Stable vitals. Continue current lifestyle plan and monitor blood pressure weekly. Recommended hydration and light exercise.",
    prescriptionUrl: "#",
    notes: "Annual health review — cardio screening and medication review",
    baseCost: 499,
    timeCost: 600,
    distanceCost: 50,
    totalCost: 1149,
    vitals: {
      bp: "122/80 mmHg",
      temperature: "98.1°F",
      spo2: "99%",
      heartRate: "71 bpm",
      bloodSugar: "98 mg/dL",
    },
  },
  {
    id: "cons-mock-003",
    status: "closed",
    serviceType: "Teleconsultation",
    doctorName: "Dr. Sonal Patel",
    doctorSpeciality: "General Practice",
    createdAt: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString(),
    assignedAt: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString(),
    arrivedAt: null,
    closedAt: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString(),
    addressLine: null,
    meetLink: null,
    doctorNotes: "Symptoms resolved. Hydration and rest were advised. No follow-up needed unless symptoms recur.",
    prescriptionUrl: "#",
    notes: "Seasonal fatigue and hydration check",
    baseCost: 499,
    timeCost: 200,
    distanceCost: 0,
    totalCost: 699,
    vitals: {
      bp: "120/78 mmHg",
      temperature: "98.5°F",
      spo2: "99%",
      heartRate: "72 bpm",
      bloodSugar: "105 mg/dL",
    },
  },
  {
    id: "cons-mock-004",
    status: "closed",
    serviceType: "Homecare",
    doctorName: "Dr. N. Kapoor",
    doctorSpeciality: "Internal Medicine",
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    assignedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    arrivedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    closedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    addressLine: "42 Vasant Vihar, New Delhi",
    meetLink: null,
    doctorNotes: "BP slightly elevated. Keep monitoring and reduce sodium intake. Diet plan provided.",
    prescriptionUrl: "#",
    notes: "Routine hypertension follow-up with diet guidance",
    baseCost: 499,
    timeCost: 400,
    distanceCost: 100,
    totalCost: 999,
    vitals: {
      bp: "134/86 mmHg",
      temperature: "98.2°F",
      spo2: "97%",
      heartRate: "76 bpm",
      bloodSugar: "120 mg/dL",
    },
  },
];

/* ─── Store Types ─── */
interface PatientVaultState {
  // Data
  patientId: string | null;
  profile: ProfileRow | null;
  familyMembers: FamilyMember[];
  selectedFamilyId: string | null;
  consultations: EnrichedConsultation[];
  activeConsultation: EnrichedConsultation | null;

  // UI
  isLoading: boolean;
  error: string | null;
  isUsingMockData: boolean;

  // Derived getters
  selectedFamily: () => FamilyMember | null;
  selectedFamilyConsultations: () => EnrichedConsultation[];

  // Actions
  initialize: () => Promise<void>;
  selectFamily: (familyId: string) => void;
  refreshConsultations: () => Promise<void>;
}

export const usePatientVaultStore = create<PatientVaultState>()((set, get) => ({
  patientId: null,
  profile: null,
  familyMembers: [],
  selectedFamilyId: null,
  consultations: [],
  activeConsultation: null,
  isLoading: true,
  error: null,
  isUsingMockData: false,

  /* ─── Derived ─── */
  selectedFamily: () => {
    const { familyMembers, selectedFamilyId } = get();
    return familyMembers.find((fm) => fm.id === selectedFamilyId) ?? familyMembers[0] ?? null;
  },

  selectedFamilyConsultations: () => {
    const { consultations } = get();
    // For now, return all consultations (no family_member_id filter in mock)
    return consultations;
  },

  /* ─── Actions ─── */
  initialize: async () => {
    set({ isLoading: true, error: null });

    try {
      // Try to get real patient profiles from Supabase
      const patients = await getAllPatientProfiles();
      
      if (patients.length > 0) {
        const patient = patients[0]; // Use first patient for dev
        const patientId = patient.id;

        // Fetch family members
        const familyMembers = await getFamilyMembers(patientId);

        // Determine selected family ID
        let selectedFamilyId: string | null = null;
        try {
          const stored = window.localStorage.getItem("sanocare.vault.familyId");
          if (stored && familyMembers.some((fm) => fm.id === stored)) {
            selectedFamilyId = stored;
          }
        } catch {
          // Ignore
        }
        if (!selectedFamilyId && familyMembers.length > 0) {
          selectedFamilyId = familyMembers[0].id;
        }

        // Fetch consultations
        const consultations = await getConsultations(patientId);
        const active = await getActiveConsultation(patientId);

        set({
          patientId,
          profile: patient,
          familyMembers,
          selectedFamilyId,
          consultations,
          activeConsultation: active,
          isLoading: false,
          isUsingMockData: false,
        });
      } else {
        // Fallback to mock data
        console.info("[PatientVaultStore] No patient profiles in Supabase, using mock data.");
        set({
          patientId: "mock-user",
          profile: {
            id: "mock-user",
            email: "patient@sanocare.dev",
            phone: "+91 98765 43210",
            full_name: "Shashwat Arora",
            role: "patient",
            blood_group: "B+",
            allergies: "None known",
            avatar_url: null,
          },
          familyMembers: MOCK_FAMILY_MEMBERS,
          selectedFamilyId: MOCK_FAMILY_MEMBERS[0].id,
          consultations: MOCK_CONSULTATIONS,
          activeConsultation: MOCK_CONSULTATIONS.find(
            (c) => c.status !== "closed" && c.status !== "cancelled"
          ) ?? null,
          isLoading: false,
          isUsingMockData: true,
        });
      }
    } catch (err) {
      console.error("[PatientVaultStore] Initialization error:", err);
      // Fallback to mock
      set({
        patientId: "mock-user",
        profile: {
          id: "mock-user",
          email: "patient@sanocare.dev",
          phone: "+91 98765 43210",
          full_name: "Shashwat Arora",
          role: "patient",
          blood_group: "B+",
          allergies: "None known",
          avatar_url: null,
        },
        familyMembers: MOCK_FAMILY_MEMBERS,
        selectedFamilyId: MOCK_FAMILY_MEMBERS[0].id,
        consultations: MOCK_CONSULTATIONS,
        activeConsultation: MOCK_CONSULTATIONS.find(
          (c) => c.status !== "closed" && c.status !== "cancelled"
        ) ?? null,
        isLoading: false,
        isUsingMockData: true,
        error: null,
      });
    }
  },

  selectFamily: (familyId: string) => {
    set({ selectedFamilyId: familyId });
    try {
      window.localStorage.setItem("sanocare.vault.familyId", familyId);
    } catch {
      // Ignore
    }
  },

  refreshConsultations: async () => {
    const { patientId, isUsingMockData } = get();
    if (isUsingMockData || !patientId) return;

    const consultations = await getConsultations(patientId);
    const active = await getActiveConsultation(patientId);
    set({ consultations, activeConsultation: active });
  },
}));
