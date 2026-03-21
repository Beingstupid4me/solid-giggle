"use client";

import Link from "next/link";
import { AlarmClock, IdCard } from "lucide-react";
import { useDoctorPortalStore } from "@/store/doctorPortalStore";

const severityStyles = {
  routine: "border-slate-300 bg-slate-50 text-slate-700",
  urgent: "border-amber-400 bg-amber-50 text-amber-800",
  critical: "border-red-500 bg-red-50 text-red-700",
} as const;

const columns = [
  { key: "pending", label: "Pending Verification" },
  { key: "ready", label: "Medic Arrived (Ready)" },
  { key: "consultation", label: "In Consultation" },
  { key: "review", label: "Case Review" },
] as const;

export default function DoctorQueuePage() {
  const { queue, setSelectedCaseId } = useDoctorPortalStore();

  return (
    <section className="pb-20 md:pb-0">
      <header className="mb-5">
        <h1 className="font-serif text-2xl font-semibold text-slate-900 md:text-3xl">Triage Queue</h1>
        <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500">Clinical flow management</p>
      </header>

      <div className="grid gap-3 xl:grid-cols-4">
        {columns.map((column) => {
          const items = queue.filter((entry) => entry.column === column.key);
          return (
            <section key={column.key} className="rounded-lg bg-white p-3 shadow-sm border border-slate-200/50">
              <div className="mb-3 flex items-center justify-between px-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">{column.label}</p>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">{items.length}</span>
              </div>

              <div className="space-y-2">
                {items.map((item) => (
                  <article key={item.id} className={`rounded-lg border-l-4 p-3 ${severityStyles[item.severity]}`}>
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <h2 className="font-serif text-sm font-semibold text-slate-900">{item.patientName}</h2>
                      <span className="rounded bg-white/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase">{item.severity}</span>
                    </div>

                    <div className="space-y-0.5 text-[11px] text-slate-700">
                      <p className="inline-flex items-center gap-1">
                        <IdCard className="h-3 w-3" />
                        {item.patientCode}
                      </p>
                      <p className="inline-flex items-center gap-1">
                        <AlarmClock className="h-3 w-3" />
                        {item.waitingLabel}
                      </p>
                    </div>

                    <p className="mt-2 text-[11px] text-slate-600 line-clamp-2">{item.note}</p>

                    <div className="mt-2.5 flex gap-1.5">
                      <button
                        onClick={() => setSelectedCaseId(item.id)}
                        className="flex-1 rounded-md bg-primary px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-primary/90"
                      >
                        Select
                      </button>
                      <Link
                        href="/portal/doctor"
                        className="flex-1 rounded-md bg-slate-100 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-700 transition hover:bg-slate-200"
                      >
                        Open
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
