import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AdminUrgency = "routine" | "urgent" | "critical";
export type AdminCaseStatus = "searching" | "dispatched" | "failed";
export type AdminAvailability = "idle" | "busy";

export interface AdminCase {
  id: string;
  patientName: string;
  patientCode: string;
  urgency: AdminUrgency;
  assignedMedic: string;
  eta: string;
  carehub: string;
  status: AdminCaseStatus;
}

export interface AdminMedic {
  id: string;
  name: string;
  role: string;
  calls: number;
  rating: number;
  avgEta: string;
  availability: AdminAvailability;
  distanceMiles: number;
  etaMinutes: number;
}

interface AdminPortalState {
  activeHub: string;
  cases: AdminCase[];
  medics: AdminMedic[];
  forceAssignCaseId: string | null;
  setActiveHub: (hub: string) => void;
  openForceAssign: (caseId: string) => void;
  closeForceAssign: () => void;
  assignMedicToCase: (payload: { caseId: string; medicName: string; eta: string }) => void;
}

const initialCases: AdminCase[] = [
  {
    id: "SN-9421",
    patientName: "Julianne Voss",
    patientCode: "882-120-X",
    urgency: "critical",
    assignedMedic: "Dr. Aris Thorne",
    eta: "2m 40s",
    carehub: "North HQ",
    status: "dispatched",
  },
  {
    id: "SN-9425",
    patientName: "Markus Penfold",
    patientCode: "102-559-B",
    urgency: "urgent",
    assignedMedic: "Dispatch Failed",
    eta: "--:--",
    carehub: "East Branch",
    status: "failed",
  },
  {
    id: "SN-9428",
    patientName: "Sarah Drumm",
    patientCode: "994-001-A",
    urgency: "routine",
    assignedMedic: "Nurse K. Riley",
    eta: "14m 10s",
    carehub: "North HQ",
    status: "dispatched",
  },
  {
    id: "SN-9430",
    patientName: "Liam Choi",
    patientCode: "221-884-M",
    urgency: "urgent",
    assignedMedic: "Dr. Helen Wu",
    eta: "8m 05s",
    carehub: "West Hub",
    status: "dispatched",
  },
];

const initialMedics: AdminMedic[] = [
  {
    id: "med-001",
    name: "Marcus Wright",
    role: "EMT Specialist",
    calls: 215,
    rating: 4.75,
    avgEta: "6m",
    availability: "idle",
    distanceMiles: 0.4,
    etaMinutes: 3,
  },
  {
    id: "med-002",
    name: "Elena Thorne",
    role: "Field Operative",
    calls: 89,
    rating: 4.88,
    avgEta: "12m",
    availability: "idle",
    distanceMiles: 1.2,
    etaMinutes: 7,
  },
  {
    id: "med-003",
    name: "Dr. Sarah Chen",
    role: "Senior Medic",
    calls: 142,
    rating: 4.92,
    avgEta: "8m",
    availability: "busy",
    distanceMiles: 2.8,
    etaMinutes: 14,
  },
];

export const useAdminPortalStore = create<AdminPortalState>()(
  persist(
    (set) => ({
      activeHub: "North Region (HQ)",
      cases: initialCases,
      medics: initialMedics,
      forceAssignCaseId: null,

      setActiveHub: (hub) => set({ activeHub: hub }),

      openForceAssign: (caseId) => set({ forceAssignCaseId: caseId }),

      closeForceAssign: () => set({ forceAssignCaseId: null }),

      assignMedicToCase: ({ caseId, medicName, eta }) =>
        set((state) => ({
          forceAssignCaseId: null,
          cases: state.cases.map((item) =>
            item.id === caseId
              ? {
                  ...item,
                  assignedMedic: medicName,
                  eta,
                  status: "dispatched",
                }
              : item,
          ),
        })),
    }),
    {
      name: "admin-portal-store",
      partialize: (state) => ({
        activeHub: state.activeHub,
        cases: state.cases,
        medics: state.medics,
      }),
    },
  ),
);
