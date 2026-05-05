"use client";

import Link from "next/link";
import { PhoneOff, Stethoscope, Video } from "lucide-react";
import { useMemo } from "react";
import { useDoctorPortalStore } from "@/store/doctorPortalStore";
import { useDoctorVitals } from "@/hooks/useSupabaseIntegration";

export default function DoctorCockpitPage() {
  const { queue, selectedCaseId, soap, updateSoap } = useDoctorPortalStore();
  const selected = queue.find((item) => item.id === selectedCaseId) ?? queue[0];
  const { vitals, loading: vitalLoading } = useDoctorVitals(selected?.id ?? null);

  const latestVitals = useMemo(() => {
    if (!Array.isArray(vitals) || vitals.length === 0) {
      return null;
    }
    return vitals[0];
  }, [vitals]);

  return (
    <section className="space-y-3 pb-20 md:pb-0">
      <div className="grid gap-3 lg:grid-cols-[1.8fr_0.8fr]">
        <section className="rounded-lg bg-white p-3 shadow-sm border border-slate-200/50">
          <div className="relative aspect-video rounded-lg bg-slate-200">
            <div className="absolute left-3 top-3 rounded bg-white/85 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-700">
              Live Feed
            </div>
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-lg bg-slate-900/70 p-2.5 text-white">
              <div>
                <p className="text-xs font-semibold">Medic: J. Sterling</p>
                <p className="text-[11px] text-slate-300">On-site response</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="grid h-8 w-8 place-items-center rounded-md bg-white/15 text-xl"><Video className="h-4 w-4" /></button>
                <button className="grid h-8 w-8 place-items-center rounded-md bg-red-700"><PhoneOff className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </div>
        </section>

        <aside className="rounded-lg bg-white p-3 shadow-sm border border-slate-200/50">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-serif text-base font-semibold">Vitals</h2>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${vitalLoading ? 'text-slate-500' : 'text-primary'}`}>
              {vitalLoading ? 'Loading...' : 'Live'}
            </span>
          </div>
          <div className="space-y-2">
            <article className="rounded-md bg-slate-50 p-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">HR</p>
              <p className="text-lg font-bold text-slate-900 mt-1">
                {latestVitals?.heart_rate ?? '—'} <span className="text-xs font-medium text-slate-500">BPM</span>
              </p>
            </article>
            <article className="rounded-md bg-slate-50 p-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">BP</p>
              <p className="text-lg font-bold text-slate-900 mt-1">
                {latestVitals?.systolic && latestVitals?.diastolic ? `${latestVitals.systolic}/${latestVitals.diastolic}` : '—'} <span className="text-xs font-medium text-slate-500">mmHg</span>
              </p>
            </article>
            <article className="rounded-md bg-slate-50 p-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">SpO2</p>
              <p className="text-lg font-bold text-slate-900 mt-1">
                {latestVitals?.spo2 ?? '—'} <span className="text-xs font-medium text-slate-500">%</span>
              </p>
            </article>
            <article className="rounded-md bg-primary p-2.5 text-white">
              <p className="text-[10px] font-semibold uppercase tracking-widest">Last Update</p>
              <p className="mt-1 text-[11px]">
                {latestVitals?.captured_at ? new Date(latestVitals.captured_at).toLocaleTimeString() : 'N/A'}
              </p>
            </article>
          </div>
        </aside>
      </div>

      <section className="rounded-lg bg-white shadow-sm border border-slate-200/50">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-lg font-semibold">SOAP Notes</h3>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-600">Draft</span>
          </div>
          <Link href="/portal/doctor/case-close" className="rounded-md bg-primary px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-primary/90">
            Complete
          </Link>
        </div>

        <div className="grid gap-2 p-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="rounded-md bg-slate-50 p-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-600">
            Subjective
            <textarea
              value={soap.subjective}
              onChange={(event) => updateSoap({ subjective: event.target.value })}
              className="mt-2 h-20 w-full resize-none rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs font-normal normal-case tracking-normal text-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              placeholder="Chief complaint, history..."
            />
          </label>

          <label className="rounded-md bg-slate-50 p-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-600">
            Objective
            <textarea
              value={soap.objective}
              onChange={(event) => updateSoap({ objective: event.target.value })}
              className="mt-2 h-20 w-full resize-none rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs font-normal normal-case tracking-normal text-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              placeholder="Vitals and findings..."
            />
          </label>

          <label className="rounded-md bg-slate-50 p-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-600">
            Assessment
            <textarea
              value={soap.assessment}
              onChange={(event) => updateSoap({ assessment: event.target.value })}
              className="mt-2 h-20 w-full resize-none rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs font-normal normal-case tracking-normal text-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              placeholder="Diagnosis logic..."
            />
          </label>

          <label className="rounded-md bg-slate-50 p-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-600">
            Plan
            <textarea
              value={soap.plan}
              onChange={(event) => updateSoap({ plan: event.target.value })}
              className="mt-2 h-20 w-full resize-none rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs font-normal normal-case tracking-normal text-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              placeholder="Management and follow-up..."
            />
          </label>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200/50 bg-slate-50 p-3 text-xs text-slate-600">
        <p className="inline-flex items-center gap-2 font-semibold">
          <Stethoscope className="h-3.5 w-3.5 text-primary" />
          Case: {selected?.patientName ?? "—"}
        </p>
      </section>
    </section>
  );
}
