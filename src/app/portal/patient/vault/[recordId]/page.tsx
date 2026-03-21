"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { Download } from "lucide-react";
import { PatientBottomNav, PatientTopBar } from "@/components/patient/PatientScaffold";
import { usePatientPortalStore } from "@/store/patientPortalStore";

export default function ConsultationDetailPage() {
  const params = useParams<{ recordId: string }>();
  const { records } = usePatientPortalStore();

  const record = useMemo(() => records.find((item) => item.id === params.recordId), [records, params.recordId]);

  if (!record) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8 md:px-6">
        <p className="text-sm text-slate-600">Consultation not found.</p>
        <Link href="/portal/patient/vault" className="mt-3 inline-block text-sm font-semibold text-primary">
          Back to Health Vault
        </Link>
      </main>
    );
  }

  return (
    <div className="pb-20 md:pb-0">
      <PatientTopBar title="Consultation Summary" subtitle="Health Vault" />
      <main className="mx-auto max-w-5xl space-y-5 px-4 py-4 md:px-6 md:py-6">
      <section className="rounded-2xl bg-white p-5 shadow-(--ds-shadow-sm)">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Consultation Detail</p>
        <h1 className="mt-2 font-serif text-xl font-semibold md:text-2xl">{record.doctorName}</h1>
        <p className="mt-1 text-sm text-slate-500">{record.doctorRole} • {record.facility}</p>
        <p className="mt-1 text-sm text-slate-500">Date: {record.dateLabel}</p>
      </section>

      <div className="space-y-5 lg:grid lg:grid-cols-[1.2fr_1fr] lg:gap-5 lg:space-y-0">
        <section className="space-y-5">
          <section className="rounded-2xl bg-white p-5 shadow-(--ds-shadow-sm)">
            <h2 className="font-serif text-2xl font-semibold">Vitals</h2>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm md:grid-cols-4 lg:grid-cols-2">
              <div className="rounded-xl bg-slate-100 p-3"><p className="text-xs text-slate-500">BP</p><p className="font-semibold">{record.vitals.bp}</p></div>
              <div className="rounded-xl bg-slate-100 p-3"><p className="text-xs text-slate-500">Sugar</p><p className="font-semibold">{record.vitals.sugar}</p></div>
              <div className="rounded-xl bg-slate-100 p-3"><p className="text-xs text-slate-500">SpO2</p><p className="font-semibold">{record.vitals.spo2}</p></div>
              <div className="rounded-xl bg-slate-100 p-3"><p className="text-xs text-slate-500">Pulse</p><p className="font-semibold">{record.vitals.pulse}</p></div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-(--ds-shadow-sm)">
            <h2 className="font-serif text-2xl font-semibold">SOAP Notes</h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-700">
              <p><span className="font-semibold text-slate-900">Subjective:</span> {record.soap.subjective}</p>
              <p><span className="font-semibold text-slate-900">Objective:</span> {record.soap.objective}</p>
              <p><span className="font-semibold text-slate-900">Assessment:</span> {record.soap.assessment}</p>
              <p><span className="font-semibold text-slate-900">Plan:</span> {record.soap.plan}</p>
            </div>
          </section>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-(--ds-shadow-sm) lg:sticky lg:top-24 lg:h-fit">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-semibold">Digital Prescription</h2>
            <button className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white">
              <Download className="h-3.5 w-3.5" />
              Download PDF
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {record.prescriptions.map((item) => (
              <div key={item.medicine} className="rounded-xl bg-slate-100 p-3 text-sm">
                <p className="font-semibold">{item.medicine}</p>
                <p className="text-slate-600">{item.dosage}</p>
                <p className="text-xs uppercase tracking-widest text-slate-500">Duration: {item.duration}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

        <Link href="/portal/patient/vault" className="inline-flex text-sm font-semibold text-primary">
          Back to Timeline
        </Link>
      </main>
      <PatientBottomNav basePath="/portal/patient" />
    </div>
  );
}
