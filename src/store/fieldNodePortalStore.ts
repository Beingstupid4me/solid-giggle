import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CaseSeverity = "critical" | "urgent" | "routine";

export interface DispatchCase {
  id: string;
  patientName: string;
  patient_name?: string;
  complaint: string;
  status?: string;
  location?: string;
  distanceKm: number;
  receivedLabel: string;
  severity: CaseSeverity;
  priorityLevel: 1 | 3 | 5;
  priority?: string;
  age: number;
  accepted: boolean;
  created_at?: string;
}

export interface VitalsForm {
  systolic: string;
  diastolic: string;
  temperature: string;
  spo2: string;
  heartRate: string;
  bloodSugar: string;
  hr: string;
  rr: string;
}

interface FieldNodePortalState {
  dutyOn: boolean;
  profile: {
    unitCode: string;
    roleName: string;
    shiftLabel: string;
  };
  networkOnline: boolean;
  activeCaseId: string | null;
  activeConsultationId: string | null;
  queue: DispatchCase[];
  vitals: VitalsForm;
  setQueue: (queue: DispatchCase[]) => void;
  toggleDuty: () => void;
  setNetworkOnline: (online: boolean) => void;
  acceptCase: (caseId: string) => void;
  passCase: (caseId: string) => void;
  setActiveCase: (caseId: string | null) => void;
  updateVitals: (data: Partial<VitalsForm>) => void;
  clearVitals: () => void;
}

const initialQueue: DispatchCase[] = [
  {
    id: "case-001",
    patientName: "Jonathan S. Whitaker",
    complaint: "Acute chest pain, difficulty breathing",
    distanceKm: 1.2,
    receivedLabel: "Received 4m ago",
    severity: "critical",
    priorityLevel: 1,
    age: 64,
    accepted: false,
  },
  {
    id: "case-002",
    patientName: "Elena Rodriguez",
    complaint: "Diabetic ketoacidosis symptoms",
    distanceKm: 3.8,
    receivedLabel: "Received 12m ago",
    severity: "urgent",
    priorityLevel: 3,
    age: 58,
    accepted: false,
  },
  {
    id: "case-003",
    patientName: "Marcus Chen",
    complaint: "Post-op wound inspection",
    distanceKm: 5.5,
    receivedLabel: "Scheduled 14:30",
    severity: "routine",
    priorityLevel: 5,
    age: 34,
    accepted: false,
  },
];

const initialVitals: VitalsForm = {
  systolic: "120",
  diastolic: "80",
  temperature: "36.6",
  spo2: "98",
  heartRate: "72",
  bloodSugar: "132",
  hr: "72",
  rr: "18",
};

export const useFieldNodePortalStore = create<FieldNodePortalState>()(
  persist(
    (set) => ({
      dutyOn: true,
      profile: {
        unitCode: "Unit 42",
        roleName: "Paramedic Alpha",
        shiftLabel: "08:00 - 20:00",
      },
      networkOnline: false,
      activeCaseId: "case-001",
      activeConsultationId: "case-001",
      queue: initialQueue,
      vitals: initialVitals,

      setQueue: (queue) => set({ queue }),

      toggleDuty: () =>
        set((state) => ({
          dutyOn: !state.dutyOn,
        })),

      setNetworkOnline: (online) =>
        set({
          networkOnline: online,
        }),

      acceptCase: (caseId) =>
        set((state) => ({
          activeCaseId: caseId,
          activeConsultationId: caseId,
          queue: state.queue.map((item) => (item.id === caseId ? { ...item, accepted: true } : item)),
        })),

      passCase: (caseId) =>
        set((state) => {
          const filtered = state.queue.filter((item) => item.id !== caseId);
          const nextActive = state.activeCaseId === caseId ? filtered[0]?.id ?? null : state.activeCaseId;
          return {
            queue: filtered,
            activeCaseId: nextActive,
            activeConsultationId: nextActive,
          };
        }),

      setActiveCase: (caseId) =>
        set({
          activeCaseId: caseId,
          activeConsultationId: caseId,
        }),

      updateVitals: (data) =>
        set((state) => ({
          vitals: {
            ...state.vitals,
            ...data,
            hr: data.hr ?? data.heartRate ?? state.vitals.hr,
            heartRate: data.heartRate ?? data.hr ?? state.vitals.heartRate,
          },
        })),

      clearVitals: () =>
        set({
          vitals: initialVitals,
        }),
    }),
    {
      name: "field-node-portal-store",
      partialize: (state) => ({
        dutyOn: state.dutyOn,
        networkOnline: state.networkOnline,
        activeCaseId: state.activeCaseId,
        activeConsultationId: state.activeConsultationId,
        queue: state.queue,
        vitals: state.vitals,
      }),
    },
  ),
);
