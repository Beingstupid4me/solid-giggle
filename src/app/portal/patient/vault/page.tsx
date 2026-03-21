"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { PatientBottomNav, PatientTopBar, SyncPill } from "@/components/patient/PatientScaffold";
import { usePatientPortalStore } from "@/store/patientPortalStore";

export default function PortalHealthVaultPage() {
  const { records, selectedProfileId } = usePatientPortalStore();

  const filtered = records.filter((record) => record.profileId === selectedProfileId);
  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, record) => {
    const key = record.monthLabel;
    if (!acc[key]) acc[key] = [];
    acc[key].push(record);
    return acc;
  }, {});

  return (
    <div className="pb-32 md:pb-8">
      <PatientTopBar title="Sano Care" />

      <main className="mx-auto w-full max-w-6xl px-4 pb-10 pt-6 md:px-6">
        <div className="space-y-6 md:grid md:grid-cols-[0.9fr_1.55fr] md:gap-6 md:space-y-0">
          <aside className="space-y-4 md:sticky md:top-24 md:h-fit">
            <section className="rounded-2xl bg-white p-5 shadow-(--ds-shadow-sm)">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Medical Archives</p>
              <h1 className="mt-2 font-serif text-2xl font-semibold tracking-tight md:text-3xl">Health Vault</h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Permanent, verified medical timeline for family-linked clinical journeys.
              </p>
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-(--ds-shadow-sm)">
              <label className="flex h-12 items-center gap-3 rounded-xl bg-slate-100 px-4 text-slate-500">
                <Search className="h-4 w-4" />
                <input className="w-full bg-transparent text-base outline-none placeholder:text-slate-500" placeholder="Search records..." />
              </label>

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3 md:grid-cols-1">
                <button className="rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-white">All Visits</button>
                <button className="rounded-lg bg-slate-100 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Lab Results</button>
                <button className="rounded-lg bg-slate-100 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">Prescriptions</button>
              </div>
            </section>
          </aside>

          <section className="relative border-l border-slate-300/70 pl-7 md:pl-9">
            {Object.entries(grouped).map(([month, monthRecords], groupIndex, source) => (
              <div key={month} className="relative mb-9">
                <span className="absolute -left-[2.05rem] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{month}</h2>
                <div className="space-y-3">
                  {monthRecords.map((record) => (
                    <article key={record.id} className="rounded-xl bg-white p-5 shadow-(--ds-shadow-sm)">
                      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded bg-accent px-2 py-1 font-semibold uppercase tracking-widest text-primary-dark">
                          {record.tag}
                        </span>
                        <span className="font-medium text-slate-500">Ref: #{record.id}</span>
                      </div>
                      <h3 className="font-serif text-lg font-semibold leading-tight md:text-xl">{record.doctorName}</h3>
                      <p className="mt-1 text-sm text-slate-600">{record.doctorRole} • {record.facility}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-base font-semibold md:text-lg">{record.dateLabel}</p>
                        <Link
                          href={`/portal/patient/vault/${record.id}`}
                          className="rounded-md bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-primary"
                        >
                          View Summary
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
                {groupIndex === source.length - 1 ? (
                  <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Earlier this year • Load more archives
                  </div>
                ) : null}
              </div>
            ))}
          </section>
        </div>
      </main>

      <SyncPill status="online" text="Synced" className="md:left-auto md:right-6 md:translate-x-0" />
      <PatientBottomNav basePath="/portal/patient" />
    </div>
  );
}
