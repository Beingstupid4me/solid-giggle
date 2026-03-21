"use client";

import { CheckCircle2, ShieldCheck, TriangleAlert } from "lucide-react";
import { useDoctorPortalStore } from "@/store/doctorPortalStore";

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
  const { riskTag, setRiskTag } = useDoctorPortalStore();

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
              <article className="flex items-center justify-between rounded-md bg-white p-3 text-sm">
                <div>
                  <p className="font-semibold">Lisinopril 10mg</p>
                  <p className="text-xs text-slate-500">Take one tablet daily in the morning.</p>
                </div>
                <span className="rounded bg-cyan-100 px-2 py-0.5 text-[10px] font-semibold uppercase">30 day supply</span>
              </article>
              <article className="flex items-center justify-between rounded-md bg-white p-3 text-sm">
                <div>
                  <p className="font-semibold">Metformin 500mg (XR)</p>
                  <p className="text-xs text-slate-500">Two tablets once daily with evening meal.</p>
                </div>
                <span className="rounded bg-cyan-100 px-2 py-0.5 text-[10px] font-semibold uppercase">90 day supply</span>
              </article>
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-2">
            <div>
              <h3 className="font-serif text-lg font-semibold">Legal Attestation</h3>
              <p className="mt-2 text-sm text-slate-600">
                I certify that medications and clinical status are based on professional judgment and current examination.
              </p>
              <label className="mt-3 inline-flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700">
                <input type="checkbox" />
                I confirm these details are accurate and final.
              </label>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Physician Digital Signature</p>
              <div className="mt-2 h-28 rounded-md border border-dashed border-slate-300 bg-slate-50" />
            </div>
          </section>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 bg-slate-100 px-5 py-4 md:px-8">
          <button className="rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-700">Discard Changes</button>
          <button className="rounded-md bg-primary px-5 py-2 text-sm font-semibold uppercase tracking-[0.12em] text-white">
            Finalize and Sign
          </button>
        </footer>
      </div>
    </section>
  );
}
