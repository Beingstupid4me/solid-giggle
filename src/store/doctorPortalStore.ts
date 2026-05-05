import { create } from "zustand";
import { persist } from "zustand/middleware";

type QueueColumn = "pending" | "ready" | "consultation" | "review";
type RiskTag = "stable" | "monitor" | "escalate";

interface DoctorQueueCase {
  id: string;
  patientName: string;
  patient_name?: string;
  severity: "routine" | "urgent" | "critical";
  patientCode: string;
  note: string;
  column: QueueColumn;
  waitingLabel: string;
  medicName?: string;
  status?: string;
  priority?: string;
  created_at?: string;
}

interface SoapState {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

interface DoctorPortalState {
  queue: DoctorQueueCase[];
  selectedCaseId: string;
  riskTag: RiskTag;
  soap: SoapState;
  setQueue: (queue: DoctorQueueCase[]) => void;
  setSelectedCaseId: (id: string) => void;
  moveCase: (id: string, column: QueueColumn) => void;
  setRiskTag: (risk: RiskTag) => void;
  updateSoap: (data: Partial<SoapState>) => void;
}

const initialQueue: DoctorQueueCase[] = [
  {
    id: "doc-001",
    patientName: "Arthur P. Miller",
    severity: "routine",
    patientCode: "MED-8842-X",
    note: "Vitals pending manual re-check.",
    column: "pending",
    waitingLabel: "Waiting: 12m",
  },
  {
    id: "doc-002",
    patientName: "Elara Vance",
    severity: "urgent",
    patientCode: "MED-9011-Y",
    note: "High pain score. Verify medication history.",
    column: "pending",
    waitingLabel: "Waiting: 28m",
  },
  {
    id: "doc-003",
    patientName: "Julian Thorne",
    severity: "critical",
    patientCode: "MED-0012-C",
    note: "Medic on-site. Respiratory watch active.",
    column: "ready",
    waitingLabel: "Waiting: 4m (Overdue)",
    medicName: "RN Sarah Chen",
  },
  {
    id: "doc-004",
    patientName: "Beatrice Gomez",
    severity: "routine",
    patientCode: "MED-5541-A",
    note: "Active session - Room 402",
    column: "consultation",
    waitingLabel: "Duration: 18m",
  },
  {
    id: "doc-005",
    patientName: "Theodore Wright",
    severity: "urgent",
    patientCode: "MED-1109-Z",
    note: "Finalizing diagnostics - Room 101",
    column: "consultation",
    waitingLabel: "Duration: 42m",
  },
  {
    id: "doc-006",
    patientName: "Isabelle Fontaine",
    severity: "routine",
    patientCode: "MED-3329-M",
    note: "Awaiting physician signature",
    column: "review",
    waitingLabel: "Queued for closure",
  },
];

const initialSoap: SoapState = {
  subjective: "",
  objective: "",
  assessment: "",
  plan: "",
};

export const useDoctorPortalStore = create<DoctorPortalState>()(
  persist(
    (set) => ({
      queue: initialQueue,
      selectedCaseId: "doc-003",
      riskTag: "monitor",
      soap: initialSoap,

      setQueue: (queue) => set({ queue }),

      setSelectedCaseId: (id) => set({ selectedCaseId: id }),

      moveCase: (id, column) =>
        set((state) => ({
          queue: state.queue.map((item) => (item.id === id ? { ...item, column } : item)),
        })),

      setRiskTag: (risk) => set({ riskTag: risk }),

      updateSoap: (data) =>
        set((state) => ({
          soap: {
            ...state.soap,
            ...data,
          },
        })),
    }),
    {
      name: "doctor-portal-store",
      partialize: (state) => ({
        queue: state.queue,
        selectedCaseId: state.selectedCaseId,
        riskTag: state.riskTag,
        soap: state.soap,
      }),
    },
  ),
);
