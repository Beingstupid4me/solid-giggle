"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ShieldCheck, TriangleAlert } from "lucide-react";
import { useDoctorPortalStore } from "@/store/doctorPortalStore";
import { useCloseCase, useSaveSOAPNotes } from "@/hooks/useSupabaseIntegration";
import { supabaseBrowser } from "@/lib/supabase";

const riskCards = [
  {
    key: "stable",
    title: "Stable",
    desc: "Routine follow-up in 3-6 months.",
    tone: "bg-emerald-50 border-emerald-200 text-emerald-800",
    icon: CheckCircle2,
  },
  {
    key: "monitor",
    title: "Monitor",
    desc: "Review within 14 days and monitor shift.",
    tone: "bg-amber-50 border-amber-200 text-amber-800",
    icon: ShieldCheck,
  },
  {
    key: "escalate",
    title: "Escalate",
    desc: "Immediate referral or emergency protocol.",
    tone: "bg-red-50 border-red-200 text-red-800",
    icon: TriangleAlert,
  },
] as const;

export default function DoctorCaseClosePage() {
  const router = useRouter();
  const { riskTag, setRiskTag, selectedCaseId, soap } = useDoctorPortalStore();
  const [confirmed, setConfirmed] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { closeCase } = useCloseCase();
  const { saveSOAPNotes } = useSaveSOAPNotes();

  // Load prescriptions
  useEffect(() => {
    if (!selectedCaseId) return;

    const loadPrescriptions = async () => {
      const { data } = await supabaseBrowser
        .from("prescriptions")
        .select("*")
        .eq("consultation_id", selectedCaseId)
        .order("created_at", { ascending: false });

      if (data) setPrescriptions(data);
    };

    loadPrescriptions();
  }, [selectedCaseId]);

  const handleFinalize = async () => {
    if (!selectedCaseId) {
      setError("No case selected");
      return;
    }

    if (!confirmed) {
      setError("Please confirm the details are accurate");
      return;
    }

    if (!riskTag) {
      setError("Please select a risk classification");
      return;
    }

    setIsClosing(true);
    setError(null);

    try {
      // Save SOAP notes first
      const soapResult = await saveSOAPNotes(selectedCaseId, {
        subjective: soap.subjective,
        objective: soap.objective,
        assessment: soap.assessment,
        plan: soap.plan,
      });

      if (!soapResult.success) throw new Error(soapResult.error);

      // Close case with risk tag
      const closeResult = await closeCase(selectedCaseId, riskTag);
      if (!closeResult.success) throw new Error(closeResult.error);

      // Redirect to queue after successful close
      router.push("/portal/doctor/queue");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to close case");
      setIsClosing(false);
    }
  };

  return (
    <section className="pb-20 md:pb-0">
      <div className="mx-auto max-w-4xl rounded-xl bg-white shadow-(--ds-shadow-md)">
        <div className="border-b border-slate-200 px-5 py-4 md:px-8 md:py-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Final Review and Authorization</p>
          <h1 className="mt-2 font-serif text-xl font-semibold md:text-2xl">Case Closure and Prescription</h1>
        </div>

        <div className="space-y-6 px-5 py-5 md:px-8 md:py-7">
          <section>
            <h2 className="mb-3 font-serif text-lg font-semibold">Risk Classification</h2>
            <div className="grid gap-3 md:grid-cols-3">
              {riskCards.map((item) => {
                const Icon = item.icon;
                const active = riskTag === item.key;

                return (
                  <button
                    key={item.key}
                    onClick={() => setRiskTag(item.key)}
                    className={`rounded-lg border p-4 text-left transition ${item.tone} ${active ? "ring-2 ring-primary" : "opacity-80 hover:opacity-100"}`}
                  >
                    <Icon className="mb-3 h-5 w-5" />
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-1 text-xs leading-relaxed">{item.desc}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold">Prescription Preview</h2>
              <button className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Edit Items</button>
            </div>
            <div className="space-y-2 rounded-lg bg-slate-100 p-3">
              {prescriptions.length === 0 ? (
                <p className="text-sm text-slate-600 p-3 text-center">No prescriptions added yet</p>
              ) : (
                prescriptions.map((rx) => (
                  <article key={rx.id} className="flex items-center justify-between rounded-md bg-white p-3 text-sm">
                    <div>
                      <p className="font-semibold">{rx.medication_name} {rx.dosage}</p>
                      <p className="text-xs text-slate-500">{rx.instructions}</p>
                    </div>
                    <span className="rounded bg-cyan-100 px-2 py-0.5 text-[10px] font-semibold uppercase">
                      {rx.quantity} {rx.unit}
                    </span>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-2">
            <div>
              <h3 className="font-serif text-lg font-semibold">Legal Attestation</h3>
              <p className="mt-2 text-sm text-slate-600">
                I certify that medications and clinical status are based on professional judgment and current examination.
              </p>
              <label className="mt-3 inline-flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                />
                I confirm these details are accurate and final.
              </label>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Physician Digital Signature</p>
              <div className="mt-2 h-28 rounded-md border border-dashed border-slate-300 bg-slate-50" />
            </div>
          </section>
        </div>

        {error && (
          <div className="border-t border-red-200 bg-red-50 px-5 py-4 text-red-700 md:px-8">
            <p className="font-semibold">Error:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <footer className="flex flex-wrap items-center justify-between gap-3 bg-slate-100 px-5 py-4 md:px-8">
          <button
            onClick={() => router.back()}
            disabled={isClosing}
            className="rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"
          >
            {isClosing ? "Saving..." : "Discard Changes"}
          </button>
          <button
            onClick={handleFinalize}
            disabled={isClosing}
            className="rounded-md bg-primary px-5 py-2 text-sm font-semibold uppercase tracking-[0.12em] text-white disabled:opacity-50"
          >
            {isClosing ? "Finalizing..." : "Finalize and Sign"}
          </button>
        </footer>
      </div>
    </section>
  );
}
