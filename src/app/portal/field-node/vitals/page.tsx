"use client";

import Link from "next/link";
import { Activity, ArrowRight, Droplets, PhoneCall, Thermometer, Wind } from "lucide-react";
import { FieldBottomNav, FieldTopBar } from "@/components/field-node/FieldNodeScaffold";
import { useFieldNodePortalStore } from "@/store/fieldNodePortalStore";

export default function FieldVitalsCapturePage() {
  const { networkOnline, setNetworkOnline, vitals, updateVitals } = useFieldNodePortalStore();

  return (
    <div className="pb-28 md:pb-8">
      <FieldTopBar />

      <main className="mx-auto w-full max-w-6xl px-4 py-4 md:px-6 xl:max-w-295">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Patient Encounter</p>
            <h1 className="mt-1 font-serif text-2xl font-semibold leading-tight md:text-3xl">Unit 42 - Clinical Entry</h1>
          </div>

          <button
            onClick={() => setNetworkOnline(!networkOnline)}
            className={`inline-flex h-12 items-center gap-2 rounded-full px-4 text-xs font-bold uppercase tracking-[0.14em] ${
              networkOnline ? "bg-emerald-100 text-emerald-700" : "bg-cyan-100 text-cyan-800"
            }`}
          >
            <Droplets className="h-4 w-4" />
            {networkOnline ? "Online Mode Active" : "Offline Mode Active"}
          </button>
        </div>

        <div className="mb-8 grid grid-cols-3 gap-1">
          <div className="h-1.5 rounded-l-full bg-primary" />
          <div className="h-1.5 bg-slate-300" />
          <div className="h-1.5 rounded-r-full bg-slate-300" />
          <div className="col-span-3 mt-2 flex justify-between text-[10px] font-bold uppercase tracking-[0.14em]">
            <span className="text-primary">01 Vitals</span>
            <span className="text-slate-400">02 Treatment</span>
            <span className="text-slate-400">03 Summary</span>
          </div>
        </div>

        <section className="space-y-8">
          <div>
            <h2 className="font-serif text-2xl font-semibold">Vital Signs Capture</h2>
            <p className="mt-2 max-w-2xl text-slate-600">
              Precision data entry for high-stakes environments. Fields are optimized for tactile feedback and visibility.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-xl bg-slate-200/70 p-5 md:col-span-2">
              <div className="mb-4 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em]">
                <Activity className="h-4 w-4 text-primary" />
                Blood Pressure
              </div>
              <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-end">
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Systolic (mmHg)
                  <input
                    type="number"
                    value={vitals.systolic}
                    onChange={(e) => updateVitals({ systolic: e.target.value })}
                    className="mt-1 h-16 w-full rounded-lg bg-slate-300 px-4 text-2xl font-bold text-slate-500 outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </label>
                <span className="hidden pb-6 text-2xl text-slate-400 md:block">/</span>
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Diastolic (mmHg)
                  <input
                    type="number"
                    value={vitals.diastolic}
                    onChange={(e) => updateVitals({ diastolic: e.target.value })}
                    className="mt-1 h-16 w-full rounded-lg bg-slate-300 px-4 text-2xl font-bold text-slate-500 outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </label>
              </div>
            </article>

            <article className="rounded-xl bg-slate-200/70 p-5">
              <div className="mb-4 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em]">
                <Thermometer className="h-4 w-4 text-primary" />
                Body Temp
              </div>
              <label className="relative block">
                <input
                  type="number"
                  step="0.1"
                  value={vitals.temperature}
                  onChange={(e) => updateVitals({ temperature: e.target.value })}
                  className="h-16 w-full rounded-lg bg-slate-300 px-4 text-2xl font-bold text-slate-500 outline-none focus:ring-2 focus:ring-primary/40"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-3xl text-slate-400">°C</span>
              </label>
            </article>

            <article className="rounded-xl bg-slate-200/70 p-5">
              <div className="mb-4 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em]">
                <Wind className="h-4 w-4 text-primary" />
                SpO2
              </div>
              <label className="relative block">
                <input
                  type="number"
                  value={vitals.spo2}
                  onChange={(e) => updateVitals({ spo2: e.target.value })}
                  className="h-16 w-full rounded-lg bg-slate-300 px-4 text-2xl font-bold text-slate-500 outline-none focus:ring-2 focus:ring-primary/40"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-3xl text-slate-400">%</span>
              </label>
            </article>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-(--ds-shadow-sm)">
            <p className="text-sm italic text-slate-600">
              {networkOnline ? "Synced to cloud in real-time." : "Saving locally. Data will sync upon reconnection."}
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
              <Link
                href="/portal/field-node/video-call"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-base font-semibold text-white"
              >
                Next: Treatment
                <ArrowRight className="h-5 w-5" />
              </Link>
              <button className="inline-flex h-11 items-center justify-center rounded-lg bg-red-700 px-5 text-sm font-semibold text-white">
                <PhoneCall className="mr-2 h-4 w-4" />
                Call Doctor
              </button>
            </div>
          </div>
        </section>
      </main>

      <FieldBottomNav />
    </div>
  );
}
