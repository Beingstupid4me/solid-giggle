"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Clock3, Route, Timer, TriangleAlert } from "lucide-react";
import { FieldBottomNav, FieldTopBar } from "@/components/field-node/FieldNodeScaffold";
import { useFieldNodePortalStore } from "@/store/fieldNodePortalStore";

export default function FieldDispatchAlertPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { queue, activeCaseId, acceptCase, passCase } = useFieldNodePortalStore();

  const selectedCaseId = params.get("caseId") ?? activeCaseId ?? queue[0]?.id;

  const dispatchCase = useMemo(
    () => queue.find((item) => item.id === selectedCaseId) ?? queue[0],
    [queue, selectedCaseId],
  );

  if (!dispatchCase) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8 md:px-6">
        <p className="text-sm text-slate-600">No dispatch case available.</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-800/95 pb-24 md:pb-8">
      <FieldTopBar
        rightSlot={<span className="rounded bg-red-700 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-white">Urgency: Critical</span>}
      />

      <main className="mx-auto w-full max-w-6xl px-4 py-4 md:px-6 xl:max-w-295">
        <section className="overflow-hidden rounded-2xl bg-slate-100 shadow-(--ds-shadow-lg)">
          <div className="flex items-center justify-between bg-red-700 px-5 py-4 text-white">
            <div className="inline-flex items-center gap-3">
              <TriangleAlert className="h-5 w-5" />
              <p className="text-lg font-extrabold uppercase tracking-[0.2em]">New Dispatch Alert</p>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em]">Priority {dispatchCase.priorityLevel}</p>
          </div>

          <div className="space-y-6 p-5 md:p-7">
            <div className="grid gap-5 md:grid-cols-[1.5fr_1fr] md:items-start">
              <article>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Patient Identity</p>
                <h1 className="mt-2 font-serif text-2xl font-semibold leading-tight md:text-3xl">{dispatchCase.patientName}</h1>
                <div className="mt-4 flex gap-2">
                  <span className="rounded-full bg-slate-300 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]">Age: {dispatchCase.age}</span>
                  <span className="rounded-full bg-slate-300 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]">Priority: {dispatchCase.priorityLevel}</span>
                </div>
              </article>

              <article className="rounded-xl border-l-4 border-red-700 bg-red-100 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-700">Nature Of Call</p>
                <p className="mt-1 font-serif text-xl font-semibold leading-tight text-red-800">{dispatchCase.complaint}</p>
              </article>
            </div>

            <section className="grid gap-4 md:grid-cols-2">
              <article className="flex items-center gap-4 rounded-xl bg-slate-200 p-5">
                <div className="rounded-xl bg-sky-100 p-3 text-primary">
                  <Route className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Distance</p>
                  <p className="font-serif text-xl font-semibold">{dispatchCase.distanceKm} km</p>
                </div>
              </article>

              <article className="flex items-center gap-4 rounded-xl bg-slate-200 p-5">
                <div className="rounded-xl bg-sky-100 p-3 text-primary">
                  <Timer className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Est. Arrival</p>
                  <p className="font-serif text-xl font-semibold">6 mins</p>
                </div>
              </article>
            </section>

            <div className="grid gap-4 md:grid-cols-2">
              <button
                onClick={() => {
                  acceptCase(dispatchCase.id);
                  router.push("/portal/field-node/vitals");
                }}
                className="h-12 rounded-lg bg-primary text-base font-semibold text-white"
              >
                Accept Dispatch
              </button>
              <button
                onClick={() => {
                  passCase(dispatchCase.id);
                  router.push("/portal/field-node");
                }}
                className="h-12 rounded-lg bg-slate-300 text-base font-semibold text-slate-700"
              >
                Pass / Reassign
              </button>
            </div>

            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <Clock3 className="h-4 w-4" />
              Automatic re-assignment in 45 seconds
            </p>
          </div>
        </section>
      </main>

      <FieldBottomNav />
    </div>
  );
}
