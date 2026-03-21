"use client";

import Link from "next/link";
import { Home, MessageSquare, Phone } from "lucide-react";
import { PatientBottomNav, PatientTopBar, SyncPill } from "@/components/patient/PatientScaffold";
import { usePatientPortalStore } from "@/store/patientPortalStore";

export default function PortalLiveTrackingPage() {
  const { dispatch } = usePatientPortalStore();

  return (
    <div className="relative min-h-screen overflow-hidden bg-background-light pb-20 md:pb-0">
      <PatientTopBar title="Live Tracking" subtitle={`ETA ${dispatch.etaMinutes} min`} />

      <main className="relative h-[calc(100vh-72px)]">
        <section className="absolute inset-0 bg-[linear-gradient(135deg,rgba(43,140,238,0.08),rgba(13,20,27,0.15)),repeating-linear-gradient(40deg,transparent,transparent_18px,rgba(148,163,184,0.18)_19px,transparent_20px)]" />

        <div className="absolute left-[52%] top-[52%] z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white shadow-(--ds-shadow-brand)">
            <Home className="h-5 w-5" />
          </div>
          <span className="mt-2 rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-slate-700">Home</span>
        </div>

        <section className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-10 md:bottom-6 md:left-auto md:right-6 md:w-120 md:px-0 md:pb-0">
          <div className="mx-auto max-w-md rounded-3xl border border-white/60 bg-white/82 p-5 shadow-(--ds-shadow-lg) backdrop-blur-2xl md:max-w-none">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="font-serif text-xl font-semibold md:text-2xl">{dispatch.medicName}</p>
                <p className="mt-2 text-sm text-slate-600">4.9 • Specialized Urgent Care</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Vehicle</p>
                <p className="text-lg font-semibold">{dispatch.unitCode}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 py-3.5 text-base font-semibold text-slate-700">
                <MessageSquare className="h-4 w-4" />
                Message
              </button>
              <button className="flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-base font-semibold text-white">
                <Phone className="h-4 w-4" />
                Call Medic
              </button>
            </div>

            <p className="mt-4 rounded-xl bg-slate-100 p-4 text-sm leading-relaxed text-slate-600">
              <span className="font-semibold text-slate-800">Emergency Kit Prepared:</span> Full trauma and diagnostic suite on board. {dispatch.medicName} has reviewed your profile.
            </p>
          </div>
        </section>
      </main>

      <SyncPill status="online" text="Route Synced" className="bottom-24 md:bottom-6 md:left-auto md:right-6 md:translate-x-0" />
      <PatientBottomNav basePath="/portal/patient" />
    </div>
  );
}
