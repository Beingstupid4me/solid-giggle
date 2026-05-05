"use client";

import { useEffect, useState } from "react";
import { Search, TriangleAlert, User } from "lucide-react";
import { useAdminPortalStore } from "@/store/adminPortalStore";
import { useAllCases, useAvailableMedics, useForceAssignCase } from "@/hooks/useSupabaseIntegration";

const urgencyTone = {
  routine: "bg-slate-200 text-slate-700",
  urgent: "bg-cyan-100 text-cyan-800",
  critical: "bg-red-100 text-red-700",
} as const;

interface CaseItem {
  id: string;
  patientName: string;
  patientCode: string;
  urgency: "routine" | "urgent" | "critical";
  status: "pending" | "assigned" | "failed";
  assignedMedic: string;
  eta: string;
  carehub: string;
}

interface MedicItem {
  id: string;
  name: string;
  distanceMiles: number;
  etaMinutes: number;
  availability: "available" | "busy";
}

export default function AdminOperationsPage() {
  const { activeHub } = useAdminPortalStore();
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [medics, setMedics] = useState<MedicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [forceAssignCaseId, setForceAssignCaseId] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);
  const { getAllCases } = useAllCases();
  const { getAvailableMedics } = useAvailableMedics();
  const { forceAssignCase } = useForceAssignCase();

  // Load cases and medics on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [casesResult, medicsResult] = await Promise.all([
          getAllCases({ limit: 50 }),
          getAvailableMedics(),
        ]);

        if (casesResult && casesResult.data) {
          const transformed = casesResult.data.slice(0, 10).map((c: any) => ({
            id: c.id.slice(0, 8),
            patientName: c.profiles?.full_name || "Patient",
            patientCode: c.id.slice(0, 8),
            urgency: (c.risk_classification === "escalate" ? "critical" : c.risk_classification === "monitor" ? "urgent" : "routine") as "routine" | "urgent" | "critical",
            status: c.status === "pending" ? "failed" : "assigned" as "pending" | "assigned" | "failed",
            assignedMedic: c.assigned_medic?.full_name || "Unassigned",
            eta: "Est. 4-6m",
            carehub: "Central Hub",
          }));
          setCases(transformed);
        }

        if (medicsResult && medicsResult.data) {
          const transformed = medicsResult.data.slice(0, 8).map((m: any) => ({
            id: m.id,
            name: m.full_name,
            distanceMiles: Math.round(Math.random() * 20),
            etaMinutes: Math.round(Math.random() * 15) + 5,
            availability: Math.random() > 0.3 ? "available" : "busy" as "available" | "busy",
          }));
          setMedics(transformed);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [getAllCases, getAvailableMedics]);

  const selectedCase = cases.find((item) => item.id === forceAssignCaseId) ?? null;

  const handleAssign = async (medicName: string) => {
    if (!forceAssignCaseId) return;
    setAssigning(true);

    try {
      const result = await forceAssignCase(forceAssignCaseId, medicName);
      if (result.success) {
        setCases((prev) =>
          prev.map((c) =>
            c.id === forceAssignCaseId ? { ...c, status: "assigned", assignedMedic: medicName } : c
          )
        );
        setForceAssignCaseId(null);
      }
    } finally {
      setAssigning(false);
    }
  };

  return (
    <section className="space-y-5">
      <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <article className="rounded-xl bg-white p-6 shadow-(--ds-shadow-sm)">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Active Encounters</p>
          <p className="mt-2 font-serif text-3xl font-semibold text-primary">142</p>
          <p className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-slate-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            System health optimal in {activeHub}
          </p>
        </article>

        <article className="rounded-xl bg-slate-100 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Avg Response Time</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">4.2m</p>
          <div className="mt-4 h-1.5 rounded-full bg-slate-200">
            <div className="h-full w-3/4 rounded-full bg-primary" />
          </div>
        </article>

        <article className="rounded-xl bg-slate-100 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Medics On Field</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">38 / 45</p>
          <p className="mt-3 text-xs text-slate-500">84.4% utilization</p>
        </article>
      </div>

      <section className="rounded-xl bg-white shadow-(--ds-shadow-sm)">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 md:px-6">
          <h2 className="font-serif text-xl font-semibold text-slate-900">Clinical Queue</h2>
          <div className="flex items-center gap-2">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                placeholder="Search case or patient"
                className="h-10 rounded-lg bg-slate-100 pl-9 pr-3 text-sm text-slate-700 outline-none ring-primary/20 transition focus:ring-2"
              />
            </label>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-190 w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 md:px-6">Case ID</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 md:px-6">Patient</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 md:px-6">Urgency</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 md:px-6">Assigned Medic</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 md:px-6">ETA</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 md:px-6">Carehub</th>
                <th className="px-4 py-3 md:px-6" />
              </tr>
            </thead>
            <tbody>
              {cases.map((item) => (
                <tr key={item.id} className={item.status === "failed" ? "bg-red-50/60" : "hover:bg-slate-50"}>
                  <td className="px-4 py-4 text-xs font-bold text-primary md:px-6">#{item.id}</td>
                  <td className="px-4 py-4 md:px-6">
                    <p className="text-sm font-semibold text-slate-900">{item.patientName}</p>
                    <p className="text-xs text-slate-500">ID: {item.patientCode}</p>
                  </td>
                  <td className="px-4 py-4 md:px-6">
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${urgencyTone[item.urgency]}`}>
                      {item.urgency}
                    </span>
                  </td>
                  <td className="px-4 py-4 md:px-6">
                    {item.status === "failed" ? (
                      <p className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.1em] text-red-700">
                        <TriangleAlert className="h-3.5 w-3.5" />
                        Dispatch Failed
                      </p>
                    ) : (
                      <p className="inline-flex items-center gap-2 text-sm text-slate-700">
                        <span className="grid h-6 w-6 place-items-center rounded bg-primary/10 text-primary">
                          <User className="h-3.5 w-3.5" />
                        </span>
                        {item.assignedMedic}
                      </p>
                    )}
                  </td>
                  <td className={`px-4 py-4 text-sm font-semibold md:px-6 ${item.status === "failed" ? "text-slate-400" : "text-slate-900"}`}>
                    {item.eta}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600 md:px-6">{item.carehub}</td>
                  <td className="px-4 py-4 text-right md:px-6">
                    {item.status === "failed" ? (
                      <button
                        type="button"
                        onClick={() => setForceAssignCaseId(item.id)}
                        className="rounded-md bg-red-700 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white transition hover:bg-red-800"
                      >
                        Assign Now
                      </button>
                    ) : (
                      <button className="rounded-md bg-slate-100 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-700 transition hover:bg-slate-200">
                        Manage
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {selectedCase ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/35 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-xl bg-white shadow-[0_24px_50px_rgba(15,23,42,0.35)]">
            <div className="border-b border-slate-200 px-6 py-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-red-700">Immediate Action Required</p>
              <h3 className="mt-2 font-serif text-2xl font-semibold text-slate-900">Force Assign</h3>
              <p className="mt-2 text-sm text-slate-600">Critical Case #{selectedCase.id}: assign nearest available medic immediately.</p>
            </div>

            <div className="space-y-3 px-6 py-5">
              {medics.map((medic) => (
                <article key={medic.id} className="flex items-center justify-between rounded-lg bg-slate-100 p-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{medic.name}</p>
                    <p className="text-xs text-slate-500">
                      {medic.distanceMiles} miles away - {medic.etaMinutes}m ETA
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAssign(medic.name)}
                    disabled={medic.availability === "busy" || assigning}
                    className={`rounded-md px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] transition ${
                      medic.availability === "busy"
                        ? "cursor-not-allowed bg-slate-300 text-slate-500"
                        : "bg-primary text-white hover:bg-primary/90"
                    }`}
                  >
                    {assigning ? "Assigning..." : medic.availability === "busy" ? "Re-Route" : "Assign"}
                  </button>
                </article>
              ))}
            </div>

            <div className="flex justify-end gap-2 bg-slate-50 px-6 py-4">
              <button type="button" onClick={() => setForceAssignCaseId(null)} className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100">
                Cancel
              </button>
              <button type="button" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
                Override Protocol
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
