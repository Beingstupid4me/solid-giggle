"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Download, FileText, X } from "lucide-react";

interface VisitRecord {
  id: string;
  title: string;
  doctorName: string;
  speciality: string;
  dateLabel: string;
  timeLabel: string;
  status: string;
  summary: string;
  vitals: {
    bp: string;
    temperature: string;
    spo2: string;
    heartRate: string;
  };
  doctorNotes: string;
  prescriptionUrl?: string | null;
}

interface PatientRecordDetailPageProps {
  record: VisitRecord;
  onClose: () => void;
}

export function PatientRecordDetailPage({ record, onClose }: PatientRecordDetailPageProps) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 px-4 py-4 backdrop-blur-sm md:items-center">
      {/* Overlay */}
      <button
        type="button"
        aria-label="Close record summary"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />

      {/* Modal */}
      <article className="relative z-10 w-full max-w-3xl overflow-hidden rounded-4xl bg-white shadow-[0_35px_100px_rgba(15,23,42,0.35)]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 md:px-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              Visit Summary
            </p>
            <h3 className="mt-2 font-serif text-2xl font-semibold text-text-main md:text-3xl">
              {record.title}
            </h3>
            <p className="mt-1 text-sm text-text-secondary">
              {record.doctorName} • {record.dateLabel} • {record.timeLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200 hover:text-text-main"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="grid gap-5 px-5 py-5 md:grid-cols-[0.95fr_1.05fr] md:px-6 md:py-6">
          {/* Left Column */}
          <section className="space-y-4">
            {/* Consultation Type & Status */}
            <div className="rounded-3xl bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
                    Consultation Type
                  </p>
                  <p className="mt-2 font-semibold text-text-main">{record.speciality}</p>
                </div>
                <div
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                    record.status === "closed"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {record.status === "closed" ? "Completed" : "Active"}
                </div>
              </div>
            </div>

            {/* Vitals */}
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
                Vitals
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-white px-4 py-3">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
                    BP
                  </span>
                  <span className="mt-1 block font-semibold text-text-main">{record.vitals.bp}</span>
                </div>
                <div className="rounded-2xl bg-white px-4 py-3">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
                    Temperature
                  </span>
                  <span className="mt-1 block font-semibold text-text-main">{record.vitals.temperature}</span>
                </div>
                <div className="rounded-2xl bg-white px-4 py-3">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
                    SpO2
                  </span>
                  <span className="mt-1 block font-semibold text-text-main">{record.vitals.spo2}</span>
                </div>
                <div className="rounded-2xl bg-white px-4 py-3">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
                    Heart Rate
                  </span>
                  <span className="mt-1 block font-semibold text-text-main">{record.vitals.heartRate}</span>
                </div>
              </div>
            </div>

            {/* Prescription */}
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-text-secondary">
                Prescription
              </p>
              <p className="mt-3 text-sm leading-6 text-text-secondary">
                {record.prescriptionUrl
                  ? "The prescription is ready for download."
                  : "Prescription pending or not available."}
              </p>
              <button
                type="button"
                disabled={!record.prescriptionUrl}
                className="mt-4 inline-flex h-11 items-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                Download Prescription
              </button>
            </div>
          </section>

          {/* Right Column */}
          <section className="space-y-4">
            {/* Doctor Notes */}
            <div className="rounded-3xl bg-text-main p-4 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/65">
                Doctor Notes
              </p>
              <p className="mt-3 text-sm leading-7 text-white/85">{record.doctorNotes}</p>
            </div>

            {/* Summary */}
            <div className="rounded-3xl bg-primary/10 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                Consultation Summary
              </p>
              <p className="mt-3 text-sm leading-6 text-text-secondary">{record.summary}</p>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-text-main transition hover:border-primary/25 hover:bg-primary/5"
            >
              Close Summary
            </button>
          </section>
        </div>
      </article>
    </div>
  );
}
