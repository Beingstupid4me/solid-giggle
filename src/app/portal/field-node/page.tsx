"use client";

import Link from "next/link";
import { Clock3, MapPin, MoveRight, PhoneCall, Timer } from "lucide-react";
import { FieldBottomNav, FieldTopBar } from "@/components/field-node/FieldNodeScaffold";
import { useFieldNodePortalStore } from "@/store/fieldNodePortalStore";

const toneClasses = {
  critical: "border-red-600/90 bg-red-50 text-red-700",
  urgent: "border-amber-700/70 bg-amber-50 text-amber-800",
  routine: "border-teal-700/60 bg-teal-50 text-teal-800",
} as const;

const badgeClasses = {
  critical: "bg-red-700 text-white",
  urgent: "bg-amber-700 text-white",
  routine: "bg-teal-200 text-teal-900",
} as const;

export default function FieldDutyDashboardPage() {
  const { dutyOn, toggleDuty, queue, profile, acceptCase } = useFieldNodePortalStore();

  return (
    <div className="min-h-screen pb-28 md:pb-0">
      <FieldTopBar />

      <main className="mx-auto w-full max-w-6xl px-4 py-4 md:px-6">
        <div className="mb-4 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h1 className="font-serif text-2xl font-semibold text-slate-900 md:text-3xl">Duty Status</h1>
            <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              {profile.unitCode} • Shift: {profile.shiftLabel}
            </p>
          </div>

          <button
            onClick={toggleDuty}
            className={`h-12 min-w-48 overflow-hidden rounded-lg border p-1 font-semibold uppercase tracking-[0.12em] text-sm transition ${
              dutyOn
                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                : "border-slate-300 bg-slate-100 text-slate-700"
            }`}
          >
            <div
              className={`flex h-full items-center justify-center transition-all ${
                dutyOn ? "bg-emerald-500 text-white" : ""
              }`}
            >
              {dutyOn ? "✓ On Duty" : "Off Duty"}
            </div>
          </button>
        </div>

        <section className="mb-4 grid gap-3 grid-cols-3 md:grid-cols-3">
          <article className="rounded-lg border border-slate-200/60 bg-slate-50 p-3">
            <Timer className="h-4 w-4 text-primary" />
            <p className="mt-2 font-serif text-xl font-semibold md:text-2xl text-slate-900">06:42:15</p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Duty Time</p>
          </article>
          <article className="rounded-lg border border-slate-200/60 bg-slate-50 p-3">
            <PhoneCall className="h-4 w-4 text-primary" />
            <p className="mt-2 font-serif text-xl font-semibold md:text-2xl text-slate-900">12</p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Completed</p>
          </article>
          <article className="rounded-lg border border-slate-200/60 bg-slate-50 p-3">
            <Clock3 className="h-4 w-4 text-primary" />
            <p className="mt-2 font-serif text-xl font-semibold md:text-2xl text-slate-900">8.4m</p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Avg Response</p>
          </article>
        </section>

        <section className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-serif text-lg font-semibold text-slate-900">Current Queue</h2>
            <span className="rounded bg-sky-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
              {queue.length} Active
            </span>
          </div>

          <div className="space-y-2">
            {queue.map((job) => (
              <article
                key={job.id}
                className={`rounded-lg border-l-4 bg-white p-3 shadow-sm transition hover:shadow-md ${toneClasses[job.severity]}`}
              >
                <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-serif text-sm font-semibold text-slate-900 md:text-base">{job.patientName}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{job.complaint}</p>
                  </div>
                  <span className={`whitespace-nowrap rounded px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${badgeClasses[job.severity]}`}>
                    {job.severity}
                  </span>
                </div>
                <div className="mb-3 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {job.distanceKm} km
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock3 className="h-3.5 w-3.5" />
                    {job.receivedLabel}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => acceptCase(job.id)}
                    className="inline-flex h-9 items-center justify-center gap-1 rounded-md bg-primary px-3 text-xs font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-primary/90"
                  >
                    <MoveRight className="h-3 w-3" />
                    Accept
                  </button>
                  <Link
                    href="/portal/field-node/vitals"
                    className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-[0.1em] text-slate-700 transition hover:bg-slate-100"
                  >
                    Details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <FieldBottomNav />
    </div>
  );
}
